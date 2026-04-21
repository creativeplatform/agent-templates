#!/usr/bin/env node

/**
 * monitor-youtube-chat skill
 *
 * Polls the YouTube Data API v3 Live Chat for a live broadcast, ingests the
 * chat stream for a specified duration, and returns chat data with engagement
 * metrics. Supports monitoring, moderation, and summary modes.
 *
 * Usage:
 *   node index.js --video-id dQw4w9WgXcQ --duration 60 --action monitor
 *   node index.js --live-chat-id <id> --duration 120 --action moderate
 *   node index.js --video-id <id> --duration 300 --action summary
 *
 * Environment:
 *   YOUTUBE_API_KEY   - YouTube Data API v3 key (required)
 *   YOUTUBE_VIDEO_ID  - Default video id for HEARTBEAT invocations (optional)
 */

import { parseArgs } from "node:util";

const YT_API_BASE = "https://www.googleapis.com/youtube/v3";

const FLAGGED_PATTERNS = [
  { pattern: /\b(scam|rug\s*pull|ponzi)\b/i, category: "fraud" },
  { pattern: /\b(hate|slur|racist|sexist)\b/i, category: "hate-speech" },
  { pattern: /\b(doxx|leaked|private\s*key)\b/i, category: "privacy" },
  { pattern: /\b(buy\s+now|guaranteed\s+returns|100x)\b/i, category: "spam" },
];

function result(data) {
  process.stdout.write(JSON.stringify(data) + "\n");
}

function fatal(error) {
  result({ success: false, error });
  process.exit(1);
}

function flagMessage(text) {
  const flags = [];
  for (const { pattern, category } of FLAGGED_PATTERNS) {
    if (pattern.test(text)) flags.push(category);
  }
  return flags;
}

function computeMetrics(messages, durationSec) {
  const uniqueUsers = new Set(messages.map((m) => m.user));
  const userMessageCounts = {};
  for (const msg of messages) {
    userMessageCounts[msg.user] = (userMessageCounts[msg.user] || 0) + 1;
  }
  const topParticipants = Object.entries(userMessageCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([user, count]) => ({ user, count }));

  return {
    messagesPerMinute: messages.length > 0
      ? Math.round((messages.length / durationSec) * 60 * 100) / 100
      : 0,
    uniqueUsers: uniqueUsers.size,
    topParticipants,
  };
}

function firstErrorReason(body) {
  return body?.error?.errors?.[0]?.reason || null;
}

async function resolveLiveChatId(videoId, apiKey) {
  const url = `${YT_API_BASE}/videos?part=liveStreamingDetails&id=${encodeURIComponent(videoId)}&key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url);
  const body = await res.json();

  if (!res.ok) {
    const reason = firstErrorReason(body);
    if (res.status === 403 && reason === "quotaExceeded") {
      throw new Error("YouTube API quota exceeded. Try again after quota reset or rotate the API key.");
    }
    throw new Error(`YouTube videos.list failed (${res.status}): ${body?.error?.message || reason || "unknown"}`);
  }

  const item = body.items?.[0];
  if (!item) throw new Error(`Video ${videoId} not found.`);

  const liveChatId = item.liveStreamingDetails?.activeLiveChatId;
  if (!liveChatId) {
    throw new Error(`Video ${videoId} has no active live chat (not currently live or chat disabled).`);
  }
  return liveChatId;
}

async function fetchChatPage(liveChatId, apiKey, pageToken) {
  const params = new URLSearchParams({
    liveChatId,
    part: "snippet,authorDetails",
    key: apiKey,
    maxResults: "200",
  });
  if (pageToken) params.set("pageToken", pageToken);

  const res = await fetch(`${YT_API_BASE}/liveChat/messages?${params.toString()}`);
  const body = await res.json();

  if (!res.ok) {
    const reason = firstErrorReason(body);
    const err = new Error(body?.error?.message || reason || `HTTP ${res.status}`);
    err.status = res.status;
    err.reason = reason;
    throw err;
  }

  return body;
}

function normalizeMessage(item) {
  const s = item.snippet || {};
  const a = item.authorDetails || {};
  return {
    timestamp: s.publishedAt || new Date().toISOString(),
    user: a.displayName || a.channelId || "anonymous",
    text: s.displayMessage || s.textMessageDetails?.messageText || "",
    platform: "youtube",
    isOwner: Boolean(a.isChatOwner),
    isModerator: Boolean(a.isChatModerator),
    isSponsor: Boolean(a.isChatSponsor),
    walletAddress: null,
  };
}

async function main() {
  const { values } = parseArgs({
    options: {
      "video-id": { type: "string" },
      "live-chat-id": { type: "string" },
      duration: { type: "string", default: "60" },
      action: { type: "string", default: "monitor" },
    },
  });

  const videoId = values["video-id"] || process.env.YOUTUBE_VIDEO_ID || null;
  const liveChatIdArg = values["live-chat-id"] || null;
  const durationSec = Math.round(Number(values.duration));
  const action = values.action;

  if (!!videoId === !!liveChatIdArg) {
    fatal("Provide exactly one of --video-id or --live-chat-id (YOUTUBE_VIDEO_ID env can substitute for --video-id).");
  }
  if (isNaN(durationSec) || durationSec < 1) {
    fatal("--duration must be a positive number (seconds).");
  }
  if (durationSec > 300) {
    fatal("--duration cannot exceed 300 seconds (5 minutes). Run multiple passes for longer monitoring.");
  }
  if (!["monitor", "moderate", "summary"].includes(action)) {
    fatal('--action must be one of: monitor, moderate, summary');
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) fatal("YOUTUBE_API_KEY not configured. Add it in your Pinata dashboard.");

  let liveChatId = liveChatIdArg;
  if (!liveChatId) {
    try {
      liveChatId = await resolveLiveChatId(videoId, apiKey);
    } catch (err) {
      fatal(err.message);
    }
  }

  const durationMs = durationSec * 1000;
  const messages = [];
  const flagged = [];
  const startTime = Date.now();
  const deadline = startTime + durationMs;
  let pageToken;
  let endedEarly = false;
  let quotaExceeded = false;

  while (Date.now() < deadline) {
    let page;
    try {
      page = await fetchChatPage(liveChatId, apiKey, pageToken);
    } catch (err) {
      if (err.status === 403 && err.reason === "liveChatEnded") {
        endedEarly = true;
        break;
      }
      if (err.status === 403 && err.reason === "quotaExceeded") {
        quotaExceeded = true;
        break;
      }
      if (err.status === 404) {
        fatal(`Live chat ${liveChatId} not found (stream may have ended or been deleted).`);
      }
      fatal(`YouTube liveChat.list failed: ${err.message}`);
    }

    for (const item of page.items || []) {
      const msg = normalizeMessage(item);
      messages.push(msg);
      if (action === "moderate") {
        const flags = flagMessage(msg.text);
        if (flags.length > 0) flagged.push({ ...msg, flags });
      }
    }

    pageToken = page.nextPageToken;
    const pollMs = Math.max(1000, Number(page.pollingIntervalMillis) || 5000);
    const remaining = deadline - Date.now();
    if (remaining <= 0) break;
    await new Promise((r) => setTimeout(r, Math.min(pollMs, remaining)));
  }

  const actualDuration = Math.max(1, Math.round((Date.now() - startTime) / 1000));
  const metrics = computeMetrics(messages, actualDuration);

  const base = {
    success: true,
    action,
    platform: "youtube",
    liveChatId,
    duration: actualDuration,
    messageCount: messages.length,
    endedEarly,
    quotaExceeded,
    ...(quotaExceeded ? { warning: "YouTube API quota exceeded mid-poll; returning partial data collected so far." } : {}),
    metrics,
  };

  if (action === "summary") {
    result(base);
  } else if (action === "moderate") {
    result({ ...base, flaggedCount: flagged.length, flagged });
  } else {
    result({ ...base, messages });
  }
}

main().catch((err) => fatal(err.message));

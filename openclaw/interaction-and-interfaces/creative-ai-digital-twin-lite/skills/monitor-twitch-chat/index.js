#!/usr/bin/env node

/**
 * monitor-twitch-chat skill
 *
 * Connects anonymously to Twitch IRC over WebSocket, ingests the live chat
 * stream for a specified duration, and returns chat data with engagement
 * metrics. No OAuth required for read-only access.
 *
 * Usage:
 *   node index.js --channel lirik --duration 60 --action monitor
 *   node index.js --channel somebody --duration 120 --action moderate
 *   node index.js --channel somebody --duration 300 --action summary
 *
 * Environment:
 *   TWITCH_CHANNEL - Default channel for HEARTBEAT invocations (optional)
 */

import { parseArgs } from "node:util";

const TWITCH_IRC_URL = "wss://irc-ws.chat.twitch.tv:443";

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

function parseTags(raw) {
  const out = {};
  if (!raw) return out;
  for (const pair of raw.split(";")) {
    const idx = pair.indexOf("=");
    if (idx === -1) continue;
    out[pair.slice(0, idx)] = pair.slice(idx + 1);
  }
  return out;
}

function parseIrcLine(line) {
  let rest = line;
  let tagsRaw = "";
  if (rest.startsWith("@")) {
    const spaceIdx = rest.indexOf(" ");
    tagsRaw = rest.slice(1, spaceIdx);
    rest = rest.slice(spaceIdx + 1);
  }
  let prefix = "";
  if (rest.startsWith(":")) {
    const spaceIdx = rest.indexOf(" ");
    prefix = rest.slice(1, spaceIdx);
    rest = rest.slice(spaceIdx + 1);
  }
  const paramsIdx = rest.indexOf(" :");
  let command;
  let params;
  let trailing = null;
  if (paramsIdx === -1) {
    const parts = rest.split(" ");
    command = parts[0];
    params = parts.slice(1);
  } else {
    const head = rest.slice(0, paramsIdx).split(" ");
    command = head[0];
    params = head.slice(1);
    trailing = rest.slice(paramsIdx + 2);
  }
  return { tags: parseTags(tagsRaw), prefix, command, params, trailing };
}

function nickFromPrefix(prefix) {
  const bang = prefix.indexOf("!");
  return bang === -1 ? prefix : prefix.slice(0, bang);
}

function isBroadcaster(badgesRaw) {
  return /(?:^|,)broadcaster\/\d+/.test(badgesRaw || "");
}

async function main() {
  const { values } = parseArgs({
    options: {
      channel: { type: "string" },
      duration: { type: "string", default: "60" },
      action: { type: "string", default: "monitor" },
    },
  });

  const channel = (values.channel || process.env.TWITCH_CHANNEL || "").toLowerCase().replace(/^#/, "");
  const durationSec = Math.round(Number(values.duration));
  const action = values.action;

  if (!channel) {
    fatal("--channel is required (or set TWITCH_CHANNEL). Must be lowercase, no leading '#'.");
  }
  if (!/^[a-z0-9_]{3,25}$/.test(channel)) {
    fatal("--channel must be a valid Twitch username (3-25 chars, lowercase alphanumerics and underscore).");
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

  let WebSocket;
  try {
    const wsModule = await import("ws");
    WebSocket = wsModule.default;
  } catch {
    fatal("WebSocket library (ws) not installed. Run: npm install ws");
  }

  const durationMs = durationSec * 1000;
  const messages = [];
  const flagged = [];
  const startTime = Date.now();
  const nick = `justinfan${Math.floor(Math.random() * 90000) + 10000}`;

  const ws = new WebSocket(TWITCH_IRC_URL);

  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      try { ws.close(); } catch { /* noop */ }
      resolve();
    }, durationMs);

    ws.on("open", () => {
      ws.send("CAP REQ :twitch.tv/tags twitch.tv/commands");
      ws.send(`NICK ${nick}`);
      ws.send(`JOIN #${channel}`);
    });

    ws.on("message", (data) => {
      const text = data.toString();
      for (const rawLine of text.split("\r\n")) {
        if (!rawLine) continue;

        if (rawLine.startsWith("PING ")) {
          ws.send(rawLine.replace(/^PING/, "PONG"));
          continue;
        }

        const line = parseIrcLine(rawLine);
        if (line.command !== "PRIVMSG") continue;

        const tags = line.tags;
        const user = tags["display-name"] || nickFromPrefix(line.prefix) || "anonymous";
        const msg = {
          timestamp: tags["tmi-sent-ts"]
            ? new Date(Number(tags["tmi-sent-ts"])).toISOString()
            : new Date().toISOString(),
          user,
          text: line.trailing || "",
          platform: "twitch",
          isBroadcaster: isBroadcaster(tags["badges"]),
          isModerator: tags["mod"] === "1",
          isSubscriber: tags["subscriber"] === "1",
          walletAddress: null,
        };
        messages.push(msg);

        if (action === "moderate") {
          const flags = flagMessage(msg.text);
          if (flags.length > 0) flagged.push({ ...msg, flags });
        }
      }
    });

    ws.on("error", (err) => {
      clearTimeout(timeout);
      reject(new Error(`Twitch IRC WebSocket error: ${err.message}`));
    });

    ws.on("close", () => {
      clearTimeout(timeout);
      resolve();
    });
  }).catch((err) => fatal(err.message));

  const actualDuration = Math.max(1, Math.round((Date.now() - startTime) / 1000));
  const metrics = computeMetrics(messages, actualDuration);

  const base = {
    success: true,
    action,
    platform: "twitch",
    channel,
    duration: actualDuration,
    messageCount: messages.length,
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

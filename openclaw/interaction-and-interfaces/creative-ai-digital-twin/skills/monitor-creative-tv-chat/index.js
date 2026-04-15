#!/usr/bin/env node

/**
 * monitor-creative-tv-chat skill
 *
 * Connects to the Creative TV backend via WebSocket, ingests the live chat
 * stream for a specified duration, and returns chat data with engagement
 * metrics. Supports monitoring, moderation, and summary modes.
 *
 * Usage:
 *   node index.js --duration 60 --action monitor
 *   node index.js --duration 120 --action moderate
 *   node index.js --duration 300 --action summary
 *
 * Environment:
 *   CREATIVE_TV_WS_URL    - WebSocket endpoint for Creative TV chat
 *   CREATIVE_TV_AUTH_TOKEN - Authentication token for Creative TV
 */

import { parseArgs } from "node:util";

const MAX_DURATION_MS = 300 * 1000; // 5 minutes max

// Moderation keyword categories (baseline — the agent's SOUL.md vibe overrides these)
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
    if (pattern.test(text)) {
      flags.push(category);
    }
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

async function main() {
  const { values } = parseArgs({
    options: {
      duration: { type: "string", default: "60" },
      action: { type: "string", default: "monitor" },
    },
  });

  const durationSec = Math.round(Number(values.duration));
  const action = values.action;

  // Validate inputs
  if (isNaN(durationSec) || durationSec < 1) {
    fatal("--duration must be a positive number (seconds).");
  }
  if (durationSec > 300) {
    fatal("--duration cannot exceed 300 seconds (5 minutes). Run multiple passes for longer monitoring.");
  }
  if (!["monitor", "moderate", "summary"].includes(action)) {
    fatal('--action must be one of: monitor, moderate, summary');
  }

  // Check secrets
  const wsUrl = process.env.CREATIVE_TV_WS_URL;
  if (!wsUrl) fatal("CREATIVE_TV_WS_URL not configured. Add it in your Pinata dashboard.");

  const authToken = process.env.CREATIVE_TV_AUTH_TOKEN;
  if (!authToken) fatal("CREATIVE_TV_AUTH_TOKEN not configured. Add it in your Pinata dashboard.");

  // Import WebSocket
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

  // Connect to Creative TV chat
  const ws = new WebSocket(wsUrl, {
    headers: { Authorization: `Bearer ${authToken}` },
  });

  const done = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      ws.close();
      resolve();
    }, durationMs);

    ws.on("open", () => {
      // Send auth handshake if needed
      ws.send(JSON.stringify({ type: "auth", token: authToken }));
    });

    ws.on("message", (data) => {
      try {
        const msg = JSON.parse(data.toString());

        // Handle different message types from the chat backend
        if (msg.type === "chat" || msg.type === "message") {
          const chatMsg = {
            timestamp: msg.timestamp || new Date().toISOString(),
            user: msg.user || msg.sender || "anonymous",
            text: msg.text || msg.content || "",
            walletAddress: msg.walletAddress || null,
          };

          messages.push(chatMsg);

          // Check for moderation flags
          if (action === "moderate") {
            const flags = flagMessage(chatMsg.text);
            if (flags.length > 0) {
              flagged.push({ ...chatMsg, flags });
            }
          }
        }

        // Handle Livepeer webhook events piped through chat backend
        if (msg.type === "stream.idle" || msg.type === "stream.started") {
          messages.push({
            timestamp: msg.timestamp || new Date().toISOString(),
            user: "system",
            text: `Livepeer event: ${msg.type}`,
            streamEvent: msg.type,
            walletAddress: null,
          });
        }
      } catch {
        // Ignore malformed messages
      }
    });

    ws.on("error", (err) => {
      clearTimeout(timeout);
      reject(new Error(`WebSocket error: ${err.message}`));
    });

    ws.on("close", () => {
      clearTimeout(timeout);
      resolve();
    });
  });

  try {
    await done;
  } catch (err) {
    fatal(err.message);
  }

  // Build response based on action
  const actualDuration = Math.round((Date.now() - startTime) / 1000);
  const metrics = computeMetrics(messages, actualDuration);

  if (action === "summary") {
    result({
      success: true,
      action,
      duration: actualDuration,
      messageCount: messages.length,
      metrics,
    });
  } else if (action === "moderate") {
    result({
      success: true,
      action,
      duration: actualDuration,
      messageCount: messages.length,
      flaggedCount: flagged.length,
      flagged,
      metrics,
    });
  } else {
    // monitor: return all messages
    result({
      success: true,
      action,
      duration: actualDuration,
      messageCount: messages.length,
      messages,
      metrics,
    });
  }
}

main().catch((err) => fatal(err.message));

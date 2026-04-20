#!/usr/bin/env node

/**
 * create-twitch-clip skill
 *
 * Creates a 30-second highlight clip from a live Twitch broadcast via the
 * Helix API. Requires a user OAuth token with the clips:edit scope (clip
 * creation cannot be done anonymously).
 *
 * Usage:
 *   node index.js --channel somebody
 *   node index.js --broadcaster-id 12345678
 *
 * Environment:
 *   TWITCH_CLIENT_ID         - Twitch application client id (required)
 *   TWITCH_OAUTH_USER_TOKEN  - User OAuth token with clips:edit scope (required)
 */

import { parseArgs } from "node:util";

const HELIX_BASE = "https://api.twitch.tv/helix";
const POLL_TIMEOUT_MS = 30000;
const POLL_INTERVAL_MS = 2000;

function result(data) {
  process.stdout.write(JSON.stringify(data) + "\n");
}

function fatal(error) {
  result({ success: false, error });
  process.exit(1);
}

async function helixRequest(path, { method = "GET", clientId, token, body } = {}) {
  const res = await fetch(`${HELIX_BASE}${path}`, {
    method,
    headers: {
      "Client-Id": clientId,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let parsed = null;
  try { parsed = text ? JSON.parse(text) : null; } catch { /* leave null */ }
  if (!res.ok) {
    const msg = parsed?.message || parsed?.error || text || `HTTP ${res.status}`;
    const err = new Error(`Twitch Helix ${method} ${path} failed (${res.status}): ${msg}`);
    err.status = res.status;
    throw err;
  }
  return parsed;
}

async function resolveBroadcasterId(channel, clientId, token) {
  const data = await helixRequest(`/users?login=${encodeURIComponent(channel)}`, { clientId, token });
  const user = data?.data?.[0];
  if (!user) throw new Error(`Twitch channel '${channel}' not found.`);
  return user.id;
}

async function pollClip(clipId, clientId, token) {
  const deadline = Date.now() + POLL_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const data = await helixRequest(`/clips?id=${encodeURIComponent(clipId)}`, { clientId, token });
    const clip = data?.data?.[0];
    if (clip && clip.created_at) return clip;
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
  return null;
}

async function main() {
  const { values } = parseArgs({
    options: {
      channel: { type: "string" },
      "broadcaster-id": { type: "string" },
    },
  });

  const channel = values.channel ? values.channel.toLowerCase().replace(/^#/, "") : null;
  const broadcasterIdArg = values["broadcaster-id"] || null;

  if (!!channel === !!broadcasterIdArg) {
    fatal("Provide exactly one of --channel or --broadcaster-id.");
  }
  if (channel && !/^[a-z0-9_]{3,25}$/.test(channel)) {
    fatal("--channel must be a valid Twitch username (3-25 chars, lowercase alphanumerics and underscore).");
  }
  if (broadcasterIdArg && !/^\d+$/.test(broadcasterIdArg)) {
    fatal("--broadcaster-id must be numeric.");
  }

  const clientId = process.env.TWITCH_CLIENT_ID;
  if (!clientId) fatal("TWITCH_CLIENT_ID not configured. Add it in your Pinata dashboard.");

  const token = process.env.TWITCH_OAUTH_USER_TOKEN;
  if (!token) {
    fatal("TWITCH_OAUTH_USER_TOKEN not configured. A user token with the clips:edit scope is required — anonymous clipping is not supported by Twitch.");
  }

  let broadcasterId = broadcasterIdArg;
  if (!broadcasterId) {
    try {
      broadcasterId = await resolveBroadcasterId(channel, clientId, token);
    } catch (err) {
      fatal(err.message);
    }
  }

  let createResponse;
  try {
    createResponse = await helixRequest(
      `/clips?broadcaster_id=${encodeURIComponent(broadcasterId)}`,
      { method: "POST", clientId, token }
    );
  } catch (err) {
    if (err.status === 401) fatal("Twitch auth failed (401). Token may be expired or missing clips:edit scope.");
    if (err.status === 403) fatal("Twitch rejected the clip request (403). Channel may not be live or clipping may be disabled.");
    if (err.status === 404) fatal(`Broadcaster ${broadcasterId} not found or not live.`);
    fatal(err.message);
  }

  const stub = createResponse?.data?.[0];
  if (!stub?.id) fatal("Twitch did not return a clip id.");

  const clip = await pollClip(stub.id, clientId, token);

  if (!clip) {
    result({
      success: true,
      ready: false,
      clipId: stub.id,
      editUrl: stub.edit_url,
      broadcasterId,
      channel: channel || null,
      message: "Clip creation accepted but not yet populated after 30s. Retrieve details later via GET /helix/clips?id=<id>.",
    });
    return;
  }

  result({
    success: true,
    ready: true,
    clipId: clip.id,
    editUrl: stub.edit_url,
    embedUrl: clip.embed_url,
    url: clip.url,
    broadcasterId,
    broadcasterName: clip.broadcaster_name,
    channel: channel || null,
    title: clip.title,
    duration: clip.duration,
    createdAt: clip.created_at,
  });
}

main().catch((err) => fatal(err.message));

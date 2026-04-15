#!/usr/bin/env node

/**
 * clip-livepeer-stream skill
 *
 * Clips a segment of a live Livepeer broadcast and optionally injects C2PA
 * provenance metadata. Used for autonomous highlight clipping when engagement
 * spikes are detected during a Creative TV live stream.
 *
 * Usage:
 *   node index.js --stream-id abc123 --start-time=-30 --end-time now
 *   node index.js --stream-id abc123 --start-time 1713000000 --end-time 1713000030 --no-c2pa
 *
 * Note: For relative (negative) start times, use --start-time=-30 (with = sign).
 *
 * Environment:
 *   LIVEPEER_API_KEY - Livepeer Studio API key (required)
 */

import { parseArgs } from "node:util";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

const LIVEPEER_BASE = "https://livepeer.studio/api";
const CLIP_TIMEOUT_MS = 3 * 60 * 1000;
const POLL_INTERVAL_MS = 5000;

function result(data) {
  process.stdout.write(JSON.stringify(data) + "\n");
}

function fatal(error) {
  result({ success: false, error });
  process.exit(1);
}

async function livepeerRequest(path, body, apiKey) {
  const res = await fetch(`${LIVEPEER_BASE}${path}`, {
    method: body ? "POST" : "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Livepeer API ${res.status}: ${text}`);
  }

  return res.json();
}

async function pollClipTask(taskId, apiKey) {
  const deadline = Date.now() + CLIP_TIMEOUT_MS;

  while (Date.now() < deadline) {
    const task = await livepeerRequest(`/task/${taskId}`, null, apiKey);

    if (task.status?.phase === "completed") return task;
    if (task.status?.phase === "failed") {
      throw new Error(`Clip task ${taskId} failed: ${task.status.errorMessage || "unknown error"}`);
    }

    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }

  throw new Error(`Clip task ${taskId} timed out after ${CLIP_TIMEOUT_MS / 1000}s`);
}

async function downloadBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function injectC2PA(clipBuffer, streamId, startTime, endTime) {
  try {
    const c2pa = await import("c2pa-node");

    const manifest = {
      claim_generator: "CreativeAI-DigitalTwin/1.0",
      title: "Live Stream Highlight Clip",
      assertions: [
        {
          label: "c2pa.actions",
          data: {
            actions: [
              {
                action: "c2pa.created",
                digitalSourceType:
                  "http://cv.iptc.org/newscodes/digitalsourcetype/algorithmicMedia",
                softwareAgent: "Livepeer",
              },
            ],
          },
        },
        {
          label: "stds.schema-org.CreativeWork",
          data: {
            "@type": "CreativeWork",
            description: `Live stream highlight clip from stream ${streamId}`,
            identifier: streamId,
            dateCreated: new Date().toISOString(),
            temporalCoverage: `${startTime}/${endTime}`,
          },
        },
      ],
    };

    const { signBuffer } = c2pa;
    if (typeof signBuffer === "function") {
      return { buffer: await signBuffer(clipBuffer, manifest, "video/mp4"), injected: true };
    }

    return { buffer: clipBuffer, injected: false };
  } catch {
    // C2PA injection is best-effort
    return { buffer: clipBuffer, injected: false };
  }
}

function resolveTimestamp(value) {
  if (value === "now") return Math.floor(Date.now() / 1000);
  const num = Number(value);
  if (value.startsWith("-")) {
    // Relative: -30 means 30 seconds ago
    return Math.floor(Date.now() / 1000) + num;
  }
  return num;
}

async function main() {
  const { values } = parseArgs({
    options: {
      "stream-id": { type: "string" },
      "start-time": { type: "string" },
      "end-time": { type: "string", default: "now" },
      "no-c2pa": { type: "boolean", default: false },
      output: { type: "string", default: "clips" },
    },
  });

  const streamId = values["stream-id"];
  const injectC2pa = !values["no-c2pa"];
  const outputDir = values.output;

  if (!streamId) fatal("--stream-id is required (Livepeer playback or stream ID).");
  if (!values["start-time"]) fatal("--start-time is required (epoch seconds or relative like -30).");

  const startTime = resolveTimestamp(values["start-time"]);
  const endTime = resolveTimestamp(values["end-time"]);

  if (endTime <= startTime) fatal("--end-time must be after --start-time.");

  const apiKey = process.env.LIVEPEER_API_KEY;
  if (!apiKey) fatal("LIVEPEER_API_KEY not configured. Add it in your Pinata dashboard.");

  await mkdir(outputDir, { recursive: true });

  // Step 1: Request clip from Livepeer
  let clipResponse;
  try {
    clipResponse = await livepeerRequest("/clip", {
      playbackId: streamId,
      startTime,
      endTime,
    }, apiKey);
  } catch (err) {
    fatal(`Failed to create clip: ${err.message}`);
  }

  const taskId = clipResponse.task?.id;
  if (!taskId) fatal("No task ID returned from Livepeer clip API.");

  // Step 2: Poll until clip is ready
  let clipTask;
  try {
    clipTask = await pollClipTask(taskId, apiKey);
  } catch (err) {
    fatal(`Clip processing failed: ${err.message}`);
  }

  // Step 3: Download the clip
  const downloadUrl = clipTask.output?.asset?.downloadUrl
    || clipTask.output?.export?.ipfs?.videoFileGatewayUrl;

  if (!downloadUrl) fatal("No download URL in clip task output.");

  let clipBuffer = await downloadBuffer(downloadUrl);

  // Step 4: Inject C2PA metadata
  let c2paInjected = false;
  if (injectC2pa) {
    const { buffer, injected } = await injectC2PA(clipBuffer, streamId, startTime, endTime);
    clipBuffer = buffer;
    c2paInjected = injected;
  }

  // Step 5: Save to output directory
  const timestamp = Date.now();
  const filename = `clip-${timestamp}.mp4`;
  const filepath = join(outputDir, filename);

  await writeFile(filepath, clipBuffer);

  const duration = endTime - startTime;

  result({
    success: true,
    file: filepath,
    filename,
    streamId,
    startTime,
    endTime,
    duration,
    c2pa: c2paInjected,
    clipTaskId: taskId,
  });
}

main().catch((err) => fatal(err.message));

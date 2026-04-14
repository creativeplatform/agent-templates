#!/usr/bin/env node

/**
 * generate-avatar skill
 *
 * Generates a rigged 3D avatar (.glb) from a text prompt using the Tripo3D API,
 * injects C2PA provenance metadata, and saves the result to the output directory.
 *
 * Usage:
 *   node index.js --prompt "description of avatar" --output avatars/
 *
 * Environment:
 *   TRIPO_API_KEY - Tripo3D API key (required)
 */

import { parseArgs } from "node:util";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

const TRIPO_BASE = "https://api.tripo3d.ai/v2/openapi";
const MESH_TIMEOUT_MS = 5 * 60 * 1000;
const RIG_TIMEOUT_MS = 3 * 60 * 1000;
const POLL_INTERVAL_MS = 5000;

function result(data) {
  process.stdout.write(JSON.stringify(data) + "\n");
}

function fatal(error) {
  result({ success: false, error });
  process.exit(1);
}

async function tripoRequest(path, body, apiKey) {
  const res = await fetch(`${TRIPO_BASE}${path}`, {
    method: body ? "POST" : "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Tripo API ${res.status}: ${text}`);
  }

  return res.json();
}

async function pollTask(taskId, apiKey, timeoutMs) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const { data } = await tripoRequest(`/task/${taskId}`, null, apiKey);

    if (data.status === "success") return data;
    if (data.status === "failed") {
      throw new Error(`Task ${taskId} failed: ${data.message || "unknown error"}`);
    }

    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }

  throw new Error(`Task ${taskId} timed out after ${timeoutMs / 1000}s`);
}

async function downloadBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function injectC2PA(glbBuffer, prompt, taskId) {
  try {
    const c2pa = await import("c2pa-node");

    const manifest = {
      claim_generator: "CreativeAI-DigitalTwin/1.0",
      title: "AI-Generated 3D Avatar",
      assertions: [
        {
          label: "c2pa.actions",
          data: {
            actions: [
              {
                action: "c2pa.created",
                digitalSourceType:
                  "http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia",
                softwareAgent: "Tripo3D",
              },
            ],
          },
        },
        {
          label: "stds.schema-org.CreativeWork",
          data: {
            "@type": "CreativeWork",
            description: `AI-generated 3D avatar from prompt: ${prompt}`,
            identifier: taskId,
            dateCreated: new Date().toISOString(),
          },
        },
      ],
    };

    const { signBuffer } = c2pa;
    if (typeof signBuffer === "function") {
      return { buffer: await signBuffer(glbBuffer, manifest, "model/gltf-binary"), injected: true };
    }

    // Fallback: c2pa-node API may vary by version — return original buffer
    return { buffer: glbBuffer, injected: false };
  } catch {
    // C2PA injection is best-effort — don't fail the whole operation
    return { buffer: glbBuffer, injected: false };
  }
}

async function main() {
  const { values } = parseArgs({
    options: {
      prompt: { type: "string" },
      output: { type: "string", default: "avatars" },
    },
  });

  if (!values.prompt) fatal("--prompt is required");

  const apiKey = process.env.TRIPO_API_KEY;
  if (!apiKey) fatal("TRIPO_API_KEY not configured. Add it in your Pinata dashboard.");

  const prompt = values.prompt;
  const outputDir = values.output;

  await mkdir(outputDir, { recursive: true });

  // Step 1: Create text-to-3D task
  const createRes = await tripoRequest("/task", {
    type: "text_to_model",
    prompt,
  }, apiKey);

  const meshTaskId = createRes.data.task_id;

  // Step 2: Poll mesh generation
  let meshData;
  try {
    meshData = await pollTask(meshTaskId, apiKey, MESH_TIMEOUT_MS);
  } catch (err) {
    fatal(`Mesh generation failed: ${err.message}`);
  }

  // Step 3: Auto-rig the model
  let riggedData = null;
  let rigged = false;

  try {
    const rigRes = await tripoRequest("/task", {
      type: "auto_rig",
      original_model_task_id: meshTaskId,
    }, apiKey);

    riggedData = await pollTask(rigRes.data.task_id, apiKey, RIG_TIMEOUT_MS);
    rigged = true;
  } catch (err) {
    // Rigging failed — fall back to unrigged mesh
    console.error(`Rigging failed (saving unrigged mesh): ${err.message}`);
  }

  // Step 4: Download the .glb
  const downloadUrl = rigged
    ? riggedData.output?.model || riggedData.output?.pbr_model
    : meshData.output?.model || meshData.output?.pbr_model;

  if (!downloadUrl) fatal("No download URL in task output");

  let glbBuffer = await downloadBuffer(downloadUrl);

  // Step 5: Inject C2PA metadata
  const { buffer: finalBuffer, injected: c2paInjected } = await injectC2PA(
    glbBuffer,
    prompt,
    meshTaskId
  );

  // Step 6: Save to output directory
  const timestamp = Date.now();
  const filename = `avatar-${timestamp}.glb`;
  const filepath = join(outputDir, filename);

  await writeFile(filepath, finalBuffer);

  result({
    success: true,
    file: filepath,
    filename,
    taskId: meshTaskId,
    rigged,
    c2pa: c2paInjected,
    prompt,
  });
}

main().catch((err) => fatal(err.message));

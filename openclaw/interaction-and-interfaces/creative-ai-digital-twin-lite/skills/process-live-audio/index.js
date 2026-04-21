#!/usr/bin/env node

/**
 * process-live-audio skill
 *
 * Processes an audio file or URL through an audio-native LLM to provide
 * real-time musical feedback. Acts as a studio assistant that can suggest
 * chord progressions, lyric alternatives, and arrangement critiques.
 *
 * Usage:
 *   node index.js --audio-source /path/to/audio.wav --mode cowriter --context "working on bridge section"
 *   node index.js --audio-source https://example.com/clip.mp3 --mode listener
 *
 * Environment:
 *   AUDIO_LLM_API_KEY   - API key for audio-capable LLM (OpenAI or Google)
 *   AUDIO_LLM_PROVIDER  - Provider: "openai" (default) or "google"
 */

import { parseArgs } from "node:util";
import { readFile, stat } from "node:fs/promises";

const OPENAI_API_BASE = "https://api.openai.com/v1";
const GOOGLE_API_BASE = "https://generativelanguage.googleapis.com/v1beta";

const COWRITER_SYSTEM_PROMPT = `You are a world-class studio assistant and music collaborator embedded in a creative AI digital twin. You have deep expertise in music theory, songwriting, production, and arrangement — spanning genres from hip-hop and R&B to rock, electronic, and classical.

When analyzing audio, provide:
1. **Chord Suggestions**: Identify the current progression and suggest alternatives, substitutions, or extensions that could enhance the section.
2. **Lyric Ideas**: If vocals are present, suggest rhyme alternatives, phrasing improvements, or thematic expansions.
3. **Arrangement Notes**: Comment on instrumentation, dynamics, transitions, and overall structure. Suggest additions or changes that elevate the track toward a polished, multi-platinum standard.
4. **General Notes**: Any other observations about tempo, key, groove, or feel.

Be specific and actionable. Reference actual chord names, scale degrees, and music terminology. You are an active co-writer — contribute ideas confidently.`;

const LISTENER_SYSTEM_PROMPT = `You are a studio assistant embedded in a creative AI digital twin. You listen carefully and only provide feedback when specifically asked. Your role is primarily to:

1. **Transcribe**: If there are vocals or spoken words, transcribe them accurately.
2. **Analyze**: Note the key, tempo, chord progression, and instrumentation you detect.
3. **Log**: Keep a concise summary of what you heard for the creator's reference.

Only provide unsolicited suggestions if you notice a significant issue (e.g., an out-of-tune instrument, a timing problem, or a structural concern). Otherwise, stay quiet and document.`;

function result(data) {
  process.stdout.write(JSON.stringify(data) + "\n");
}

function fatal(error) {
  result({ success: false, error });
  process.exit(1);
}

async function loadAudioBase64(source) {
  // Check if source is a URL
  if (source.startsWith("http://") || source.startsWith("https://")) {
    const res = await fetch(source);
    if (!res.ok) throw new Error(`Failed to download audio: ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    return buffer.toString("base64");
  }

  // Otherwise treat as file path
  try {
    await stat(source);
  } catch {
    throw new Error(`Audio file not found: ${source}`);
  }

  const buffer = await readFile(source);
  return buffer.toString("base64");
}

function detectMimeType(source) {
  const lower = source.toLowerCase();
  if (lower.endsWith(".mp3")) return "audio/mpeg";
  if (lower.endsWith(".wav")) return "audio/wav";
  if (lower.endsWith(".ogg")) return "audio/ogg";
  if (lower.endsWith(".flac")) return "audio/flac";
  if (lower.endsWith(".m4a")) return "audio/mp4";
  if (lower.endsWith(".webm")) return "audio/webm";
  return "audio/wav"; // Default
}

async function processWithOpenAI(audioBase64, mimeType, systemPrompt, context, apiKey) {
  // Use GPT-4o with audio input capability
  const messages = [
    { role: "system", content: systemPrompt },
  ];

  if (context) {
    messages.push({
      role: "user",
      content: [
        { type: "text", text: `Context: ${context}` },
        {
          type: "input_audio",
          input_audio: {
            data: audioBase64,
            format: mimeType === "audio/wav" ? "wav" : "mp3",
          },
        },
        { type: "text", text: "Please analyze this audio and provide your feedback." },
      ],
    });
  } else {
    messages.push({
      role: "user",
      content: [
        {
          type: "input_audio",
          input_audio: {
            data: audioBase64,
            format: mimeType === "audio/wav" ? "wav" : "mp3",
          },
        },
        { type: "text", text: "Please analyze this audio and provide your feedback." },
      ],
    });
  }

  const res = await fetch(`${OPENAI_API_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-audio-preview",
      messages,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`OpenAI API ${res.status}: ${text}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

async function processWithGoogle(audioBase64, mimeType, systemPrompt, context, apiKey) {
  const parts = [
    { text: systemPrompt },
  ];

  if (context) {
    parts.push({ text: `Context: ${context}` });
  }

  parts.push({
    inline_data: {
      mime_type: mimeType,
      data: audioBase64,
    },
  });

  parts.push({ text: "Please analyze this audio and provide your feedback." });

  const res = await fetch(
    `${GOOGLE_API_BASE}/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts }],
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Google API ${res.status}: ${text}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

function parseFeedback(rawResponse) {
  // Parse structured feedback from LLM response
  const feedback = {
    chordSuggestions: [],
    lyricIdeas: [],
    arrangementNotes: [],
    generalNotes: "",
  };

  const sections = rawResponse.split(/(?=#{1,3}\s|\*\*(?:Chord|Lyric|Arrangement|General))/i);

  for (const section of sections) {
    const lower = section.toLowerCase();
    if (lower.includes("chord")) {
      feedback.chordSuggestions.push(section.trim());
    } else if (lower.includes("lyric")) {
      feedback.lyricIdeas.push(section.trim());
    } else if (lower.includes("arrangement")) {
      feedback.arrangementNotes.push(section.trim());
    } else {
      feedback.generalNotes += section.trim() + "\n";
    }
  }

  feedback.generalNotes = feedback.generalNotes.trim();

  // If parsing didn't split cleanly, put everything in generalNotes
  if (
    feedback.chordSuggestions.length === 0 &&
    feedback.lyricIdeas.length === 0 &&
    feedback.arrangementNotes.length === 0
  ) {
    feedback.generalNotes = rawResponse;
  }

  return feedback;
}

async function main() {
  const { values } = parseArgs({
    options: {
      "audio-source": { type: "string" },
      mode: { type: "string", default: "listener" },
      context: { type: "string", default: "" },
    },
  });

  const audioSource = values["audio-source"];
  const mode = values.mode;
  const context = values.context;

  // Validate inputs
  if (!audioSource) fatal("--audio-source is required (file path or URL).");
  if (!["cowriter", "listener"].includes(mode)) {
    fatal('--mode must be either "cowriter" or "listener".');
  }

  // Check secrets
  const apiKey = process.env.AUDIO_LLM_API_KEY;
  if (!apiKey) fatal("AUDIO_LLM_API_KEY not configured. Add it in your Pinata dashboard.");

  const provider = (process.env.AUDIO_LLM_PROVIDER || "openai").toLowerCase();
  if (!["openai", "google"].includes(provider)) {
    fatal('AUDIO_LLM_PROVIDER must be "openai" or "google".');
  }

  // Load audio
  let audioBase64;
  try {
    audioBase64 = await loadAudioBase64(audioSource);
  } catch (err) {
    fatal(`Failed to load audio: ${err.message}`);
  }

  const mimeType = detectMimeType(audioSource);
  const systemPrompt = mode === "cowriter" ? COWRITER_SYSTEM_PROMPT : LISTENER_SYSTEM_PROMPT;

  // Process through LLM
  let rawResponse;
  try {
    if (provider === "openai") {
      rawResponse = await processWithOpenAI(audioBase64, mimeType, systemPrompt, context, apiKey);
    } else {
      rawResponse = await processWithGoogle(audioBase64, mimeType, systemPrompt, context, apiKey);
    }
  } catch (err) {
    fatal(`Audio processing failed: ${err.message}`);
  }

  if (!rawResponse) fatal("LLM returned empty response.");

  // Parse feedback
  const feedback = parseFeedback(rawResponse);

  result({
    success: true,
    mode,
    provider,
    audioSource,
    context: context || null,
    feedback,
    rawResponse,
  });
}

main().catch((err) => fatal(err.message));

# Tripo3D Avatar Generation — Reference

This reference supports the `creative-ai-digital-twin` and `creative-ai-digital-twin-lite` Hermes skills.

## API

- **Base URL:** `https://api.tripo3d.ai/v2`
- **Auth:** Bearer token in `Authorization: Bearer {TRIPO_API_KEY}`
- **Required env:** `TRIPO_API_KEY`

## Typical Flow

1. **Submit task**
   ```http
   POST /task HTTP/1.1
   Host: api.tripo3d.ai
   Authorization: Bearer {TRIPO_API_KEY}
   Content-Type: application/json

   {
     "type": "text_to_model",
     "prompt": "cyberpunk owl wearing headphones and a leather jacket, neon purple highlights, confident stance"
   }
   ```

2. **Poll for completion**
   ```http
   GET /task/{task_id} HTTP/1.1
   Host: api.tripo3d.ai
   Authorization: Bearer {TRIPO_API_KEY}
   ```
   Repeat until `status` is `success`.

3. **Download result**
   The completed task returns a `.glb` URL. Download it to the workspace.

4. **C2PA provenance**
   - Document the prompt, model source (Tripo3D), and timestamp.
   - If a C2PA signing tool is available, embed a `c2pa-manifest` with:
     - `assertions.vendor`: model = Tripo3D
     - `assertions.softwareAgent`: Hermes Agent / Creative AI Digital Twin
     - `assertions.creativeWork`: prompt text

5. **Pin to Pinata** (optional)
   - Use `PINATA_JWT` and `PINATA_GATEWAY_URL`.
   - Upload the `.glb` to Pinata and return the gateway URL.

## Safety Rules

- Abort if `TRIPO_API_KEY` is missing.
- Confirm the prompt with the operator before spending API credits.
- Log every avatar generation: prompt, task ID, result URL, timestamp, cost if known.
- Do not claim C2PA signing succeeded unless the manifest was actually embedded.

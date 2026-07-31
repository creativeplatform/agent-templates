# creative-pixels-mcp

**name:** creative-pixels-mcp

**description:** Use the Creative Pixels MCP server to create, inspect, edit, and render Pixels video projects. Trigger whenever the user asks to edit video, build a timeline, import media into Pixels, add text/clips/effects, trim/split, or export/render a Pixels project — even if they say "FreeCut", "edit-pixels", or just "make a clip".

**license:** MIT

**compatibility:** Requires a local Creative Pixels (edit-pixels) install with Node.js 22, a built harness when needed, and the stdio MCP server connected as `creative_pixels`.

**metadata:**

- **author:** Creative Organization DAO
- **version:** "1.0"

---

## Creative Pixels MCP

Pixels ships a headless lifecycle API and a stdio MCP server so agents can create, edit, and render projects programmatically. The MCP server is named `creative_pixels`. Tool names are `pixels_*` (some clients prefix them as `mcp_creative_pixels_pixels_*`).

### Start the MCP server

From the Creative Pixels repo:

```bash
npm run headless:mcp -- --workspace /path/to/pixels-workspace
# or after build:
npm run build && npm run headless:mcp -- --workspace /path/to/pixels-workspace
```

`PIXELS_WORKSPACE` may supply the default workspace path. Point the Pinata / OpenClaw agent MCP config at this stdio server.

## Working Agreement (Agent Execution Rules)

When driving Creative Pixels via MCP, the agent MUST:

1. **Import first** — If media is not already in the workspace, call `pixels_import_media` with an **absolute** file path.
2. **Discover when needed** — Call `pixels_capabilities` before using unfamiliar edit ops, GPU effects, codecs, or schemas.
3. **Create or load** — New work: `pixels_create_project` (name, width, height, fps). Existing work: always `pixels_get_project` first to read timeline + revision.
4. **Edit via ops** — All timeline changes go through `pixels_edit_project`. Every op needs a unique `callerId`. Chain ids with `{ "$ref": "callerId#/detail/..." }`.
5. **Confirm destructive ops** — Ask the operator before `removeItems` or `pixels_update_project` with `force: true`.
6. **Render defaults** — If codec/container/quality are unspecified, use `codec: h264`, `container: mp4`, `quality: high`.
7. **Report results** — After render, report output path, file size, duration, and any warnings.

## Tool Catalog

| Tool | Purpose |
|------|---------|
| `pixels_capabilities` | Supported edit ops, GPU effects, codecs/containers, JSON schemas |
| `pixels_list_projects` | List projects in the workspace |
| `pixels_get_project` | Get project by id (timeline + revision) |
| `pixels_create_project` | Create project (optional id, name, description, width, height, fps, backgroundColor) |
| `pixels_update_project` | Update metadata (`force` or `expectedRevision` required) |
| `pixels_edit_project` | Apply timeline ops; optional `persist` to save |
| `pixels_list_media` | List imported media |
| `pixels_get_media` | Media metadata by id |
| `pixels_import_media` | Import file (`filePath` required; optional `mediaId`, `projectId`) |
| `pixels_render_project` | Export video/audio (`resolution`, `inSec`/`outSec`/`duration`, `outputPath`, codec/container/quality) |

### `pixels_edit_project` ops

- `addClip` — needs a `mediaId` already imported. Video clips create linked audio companions automatically.
- `addText` — `text`, `from`, `durationInFrames`, `color`, `fontSize`, `fontFamily`, `fontWeight`, `textAlign`, `verticalAlign`.
- `addTrack` — create a track (e.g. video) before placing clips.
- `addEffect` — valid `gpuEffectType` from `pixels_capabilities` plus `params`.
- `setTransform` — `x`, `y`, `width`, `height`, `rotation`, `opacity`, `cornerRadius`, `flipHorizontal`, `flipVertical`.
- `moveItem`, `split`, `trimStart`, `trimEnd`, `removeItems` — get clip ids from `pixels_get_project` (or prior op `$ref`) first.

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `PIXELS_WORKSPACE` | Absolute path to the Pixels workspace directory (MCP `--workspace` default) |
| `PIXELS_MCP_LOG` | Optional log file path for MCP server diagnostics |

## Safety

- Workspace folders must be **local and non-cloud-synced**. Cloud-synced folders cause File System Access API stale-handle errors.
- GPU effects need a real WebGPU adapter. If only software WebGPU is available, refuse GPU-effect renders and warn the operator.
- Do not render to cloud-synced or network paths.

## Example

User: "Make a 5-second Pixels clip from `/Users/me/clip.mp4` with a text intro saying 'Demo'."

1. `pixels_import_media` on `/Users/me/clip.mp4`
2. `pixels_create_project` named "Demo" (match width/height/fps or ask)
3. `pixels_edit_project` with ops: `addTrack` (video) → `addClip` (imported media) → `addText` at frame 0 for ~1.5s (`fps * 1.5` frames)
4. `pixels_render_project` with `duration: 5`
5. Report output path + metadata

## Troubleshooting

- **Workspace not found** — Ensure `--workspace` / `PIXELS_WORKSPACE` is an existing absolute path.
- **Revision mismatch** — Re-fetch with `pixels_get_project` and pass `expectedRevision`, or ask before `force`.
- **Missing mediaId on addClip** — Import first; use the returned media id or `$ref`.
- **GPU effect failure** — Call `pixels_capabilities`, verify adapter; skip GPU effects if unsupported.

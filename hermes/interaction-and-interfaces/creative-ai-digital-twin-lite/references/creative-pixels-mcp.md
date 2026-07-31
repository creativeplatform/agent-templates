# Creative Pixels MCP — Reference

Distilled from the Creative Pixels (edit-pixels) stdio MCP server and `docs/agent-prompt.md`.

## Server

- **MCP name:** `creative_pixels`
- **Start:** from the edit-pixels repo — `npm run headless:mcp -- --workspace <dir>`
- **Env:** `PIXELS_WORKSPACE` (default workspace), optional `PIXELS_MCP_LOG`
- Some clients expose tools as `mcp_creative_pixels_pixels_*`; the logical names below are `pixels_*`.

## Tools

### `pixels_capabilities`

Returns supported edit operations, GPU effect types, render codecs/containers, and JSON schemas. Call before unfamiliar ops or GPU effects.

### `pixels_list_projects` / `pixels_get_project`

List workspace projects, or fetch one by `projectId` (timeline + revision). **Always** `get_project` before editing an existing project.

### `pixels_create_project`

| Field | Notes |
|-------|-------|
| `id` | Optional alphanumeric / dashes / underscores |
| `name` | Project name |
| `description` | Optional |
| `width` / `height` | Canvas size (defaults typically 1920×1080) |
| `fps` | Default typically 30 |
| `backgroundColor` | Hex, e.g. `#000000` |

### `pixels_update_project`

Updates metadata. Requires `force: true` **or** matching `expectedRevision` (`sha256:...`). Confirm with the operator before forcing.

### `pixels_edit_project`

Applies an array of timeline ops. Optional `persist` saves back to the workspace.

**Every op must include a unique `callerId`.** Reference ids produced by earlier ops with:

```json
{ "$ref": "callerId#/detail/..." }
```

Common ops:

| Op | Notes |
|----|-------|
| `addTrack` | Create a track (e.g. video) before clips |
| `addClip` | Requires imported `mediaId`; video creates linked audio companions |
| `addText` | `text`, `from`, `durationInFrames`, `color`, `fontSize`, `fontFamily`, `fontWeight`, `textAlign`, `verticalAlign` |
| `addEffect` | `gpuEffectType` from capabilities + `params` |
| `setTransform` | `x`, `y`, `width`, `height`, `rotation`, `opacity`, `cornerRadius`, `flipHorizontal`, `flipVertical` |
| `moveItem` | Reposition timeline items |
| `split` / `trimStart` / `trimEnd` | Resolve clip id first |
| `removeItems` | Destructive — confirm with operator |

### `pixels_list_media` / `pixels_get_media` / `pixels_import_media`

Import requires absolute `filePath`. Optional `mediaId`, `projectId`.

### `pixels_render_project`

Exports to a file path returned by the tool (temp path by default).

| Field | Notes |
|-------|-------|
| `projectId` | Required |
| `resolution` | e.g. `1920x1080` |
| `inSec` / `outSec` / `duration` | Range or duration in seconds |
| `outputPath` | Optional absolute path |
| codec / container / quality | Default **h264 / mp4 / high** if unspecified |

Always report: output path, file size, duration, warnings.

## Canonical workflow

1. `pixels_import_media` (if needed)
2. `pixels_capabilities` (as needed)
3. `pixels_create_project` **or** `pixels_get_project`
4. `pixels_edit_project` (unique `callerId`, `$ref` chaining)
5. `pixels_render_project`

## Safety

- Workspace must be **local**, not cloud-synced (avoids File System Access API stale handles).
- Do not render to cloud-synced or network paths.
- GPU effects require a real WebGPU adapter; refuse GPU-effect renders on software-only WebGPU and warn the operator.

## Example

User: make a 5s clip from `/Users/me/clip.mp4` with text intro "Demo".

1. Import `/Users/me/clip.mp4`
2. Create project "Demo" (match media dimensions/fps or ask)
3. Edit: `addTrack` → `addClip` → `addText` at frame 0 for ~`fps * 1.5` frames
4. Render with `duration: 5`
5. Report path + metadata

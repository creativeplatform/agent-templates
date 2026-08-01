# creative-pixels-mcp

**name:** creative-pixels-mcp

**description:** Use the Creative Pixels MCP server to create, inspect, edit, and render Pixels video projects. Trigger whenever the user asks to edit video, build a timeline, import media into Pixels, add text/clips/effects, trim/split, or export/render a Pixels project.

**license:** MIT

**compatibility:** Requires a local Creative Pixels (edit-pixels) install with Node.js 22 and the stdio MCP server connected as `creative_pixels`.

---

## Working Agreement

When driving Creative Pixels via MCP, the agent MUST:

1. **Import first** — call `pixels_import_media` with an absolute file path if media is not already in the workspace.
2. **Discover when needed** — call `pixels_capabilities` before unfamiliar edit ops, GPU effects, codecs, or schemas.
3. **Create or load** — new work: `pixels_create_project`. Existing work: `pixels_get_project` first.
4. **Edit via ops** — all timeline changes go through `pixels_edit_project`. Every op needs a unique `callerId`; chain with `{ "$ref": "callerId#/detail/..." }`.
5. **Confirm destructive ops** — ask before `removeItems` or `pixels_update_project` with `force: true`.
6. **Render defaults** — if unspecified, use `codec: h264`, `container: mp4`, `quality: high`.
7. **Report results** — after render, report output path, file size, duration, and any warnings.

## Common Tools

| Tool | Purpose |
|---|---|
| `pixels_capabilities` | Supported ops, effects, codecs |
| `pixels_list_projects` | List projects |
| `pixels_get_project` | Get project timeline + revision |
| `pixels_create_project` | Create new project |
| `pixels_update_project` | Update metadata |
| `pixels_edit_project` | Apply timeline ops |
| `pixels_import_media` | Import media file |
| `pixels_render_project` | Export video/audio |

## Safety

- Workspace folders must be **local and non-cloud-synced**.
- GPU effects need a real WebGPU adapter.
- Do not render to cloud-synced or network paths.

## Environment

- `PIXELS_WORKSPACE` — absolute path to the Pixels workspace directory.

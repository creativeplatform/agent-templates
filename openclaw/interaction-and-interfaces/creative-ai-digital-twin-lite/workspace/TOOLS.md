# TOOLS.md — Environment Notes

## Stack

- **Runtime:** Node.js 22+
- **Package Manager:** npm
- **Dependencies:** c2pa-node (avatar provenance), ws (Twitch IRC). Installed at build time.

## Skills

### Local Skills

| Skill | Path | Purpose |
|-------|------|---------|
| Avatar Generation | `skills/generate-avatar/index.js` | Tripo3D text-to-3D + auto-rigging + C2PA injection |
| Live Audio Processing | `skills/process-live-audio/index.js` | Audio analysis via LLM for studio collaboration |
| YouTube Chat Monitor | `skills/monitor-youtube-chat/index.js` | YouTube Data API v3 live chat polling, moderation, metrics |
| Twitch Chat Monitor | `skills/monitor-twitch-chat/index.js` | Anonymous IRC-over-WebSocket chat reader, moderation, metrics |
| Twitch Clip | `skills/create-twitch-clip/index.js` | Create a 30-second Helix clip from a live broadcast |
| Creative Pixels MCP | `workspace/skills/creative-pixels-mcp.md` | Create/edit/render Pixels video projects via MCP (`creative_pixels`) |

Local skills are invoked via `node skills/<name>/index.js` with CLI arguments. They read secrets from environment variables and print JSON results to stdout.

Markdown MCP skills (under `workspace/skills/`) document tool workflows — read them before calling the matching MCP server.

### Attached Pinata Skills (via manifest `skills` array)

| Skill | Purpose |
|-------|---------|
| `@Pinata/ERC8004` | On-chain alignment registration on Base. Gate: only invoke when coherenceScore === 100 AND rounds >= 10. |
| `@Pinata/API` | General Pinata API access. |
| `@Pinata/MEMORY_SALIENCE` | Memory salience scoring and compaction. |
| `@Pinata/PARASPACE` | Paraspace integration. |
| `@pinata/platform` | Pinata platform utilities. |
| `@pinata/sqlite-sync` | SQLite persistence and sync. |

Attached skills are provided by Pinata and available as tools at runtime — no local file exists. Invoke by name.

## Secrets Reference

| Secret | Purpose | Required For |
|--------|---------|-------------|
| `TRIPO_API_KEY` | Tripo3D API authentication | Avatar generation |
| `PRIVATE_KEY` | EVM wallet (0x-prefixed) for Base transactions | ERC-8004 registration |
| `PINATA_JWT` | Pinata API JWT (Admin key) | Attached Pinata skills |
| `PINATA_GATEWAY_URL` | Pinata gateway domain | Attached Pinata skills |
| `AUDIO_LLM_API_KEY` | Audio-capable LLM API key (OpenAI or Google) | Studio assistant |
| `AUDIO_LLM_PROVIDER` | LLM provider: `openai` or `google` (default: openai) | Studio assistant |
| `YOUTUBE_API_KEY` | YouTube Data API v3 key | YouTube chat monitoring |
| `YOUTUBE_VIDEO_ID` | Default video id for HEARTBEAT invocations | YouTube chat monitoring (optional) |
| `TWITCH_CHANNEL` | Default Twitch channel for HEARTBEAT invocations | Twitch chat monitoring (optional) |
| `TWITCH_CLIENT_ID` | Twitch application client id | Twitch clip creation |
| `TWITCH_OAUTH_USER_TOKEN` | User OAuth token with `clips:edit` scope | Twitch clip creation |
| `PIXELS_WORKSPACE` | Absolute path to the Creative Pixels workspace for MCP | Video edit/render via Creative Pixels MCP |

Secrets are configured in the Pinata dashboard and injected as environment variables at runtime. Twitch chat monitoring requires no token — anonymous read-only access is supported.

## Contracts

- **ERC-8004 Registry:** Managed by the `@Pinata/ERC8004` attached skill. Contract address and ABI are handled inside the skill — no local config needed.
- **Network:** Base (Chain ID 8453)

## External APIs

- **YouTube Data API v3:** `https://www.googleapis.com/youtube/v3/liveChat/messages` — rate limited by daily quota units (chat polls cost ~5 units per page).
- **Twitch IRC:** `wss://irc-ws.chat.twitch.tv:443` — anonymous nick format `justinfan<digits>`.
- **Twitch Helix:** `https://api.twitch.tv/helix/clips` — requires `Client-Id` header + user OAuth token with `clips:edit` scope.

## Notes

Add environment-specific details here as you discover them:
- Agent wallet address and ETH balance on Base
- Tripo3D API rate limits or quota
- C2PA certificate details
- YouTube API quota consumption patterns
- Twitch app client id and token expiry
- Any deployment quirks

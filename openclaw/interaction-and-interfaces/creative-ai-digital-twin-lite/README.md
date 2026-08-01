# Creative AI Digital Twin Lite (OpenClaw / Pinata)

**Platform:** OpenClaw container template for Pinata deployment  
**Hermes skill equivalent:** [`hermes/interaction-and-interfaces/creative-ai-digital-twin-lite`](../hermes/interaction-and-interfaces/creative-ai-digital-twin-lite)

A generic digital twin agent for creators. Deploy it and get an AI agent that learns your creative decision-making through prediction games, generates C2PA-secured 3D avatars via Tripo3D, registers your alignment score on-chain via ERC-8004 on Base, acts as a real-time studio assistant and live-chat moderator for YouTube and Twitch streams, and can create, edit, and render video via the [Creative Pixels](https://github.com/sirgawain0x/edit-pixels) MCP when connected.

"Lite" because it skips the platform-specific treasury, token-distribution, prediction-market, and broadcast-infrastructure integrations in favor of first-class YouTube and Twitch support for any creator.

## Capabilities

### Prediction Game (alignment)
The agent generates hypothetical creative business scenarios — pricing negotiations, IP licensing, client management, creative direction dilemmas — and evaluates your reasoning across four axes: Consistency, Reasoning Depth, Creative Integrity, and Pragmatism. Your responses build a coherence score over time using an exponential moving average. This is how the agent learns to think like you.

### 3D Avatar Generation (identity)
Generate fully rigged 3D avatar meshes (.glb) from text descriptions using the Tripo3D API. Every avatar is stamped with C2PA provenance metadata, creating a verifiable record of AI-generated visual identity assets.

### ERC-8004 On-Chain Alignment (trust)
When your coherence score reaches 100 after a minimum of 10 prediction rounds, the agent can register your alignment on the ERC-8004 smart contract on Base. This creates a public, verifiable record that other Digital Twin Agents in the Creative AI network can use to establish trust.

### Studio Assistant (collaboration)
Process live audio through an audio-native LLM (OpenAI GPT-4o or Google Gemini). In **cowriter mode**, the agent actively suggests chord progressions, lyric alternatives, and arrangement critiques. In **listener mode**, it passively transcribes and analyzes.

### YouTube / Twitch Chat Moderator (community)
Monitor live chat on whichever platform you're streaming on. The agent tracks engagement, moderates contextually (understanding your vibe, not just blocking keywords), and flags top participants.

- **YouTube**: polls the Data API v3 live chat endpoint. Each message includes `isOwner`, `isModerator`, and `isSponsor` booleans.
- **Twitch**: connects anonymously to Twitch IRC over WebSocket — no OAuth needed for read-only monitoring. Each message includes `isBroadcaster`, `isModerator`, and `isSubscriber` booleans.

### Twitch Clipping (content)
Create a 30-second highlight clip from a live Twitch broadcast via the Helix `POST /helix/clips` endpoint when engagement spikes. Requires a user OAuth token with the `clips:edit` scope (anonymous clipping is not supported by Twitch).

**YouTube clipping note:** YouTube's Data API does not expose clip creation. For YouTube highlights, use YouTube Studio manually.

### Live Stream Overlay (presence)
Float the 3D avatar as a transparent overlay during live broadcasts. Works with OBS Studio via a Browser Source with the R3F canvas set to `alpha={true}`.

### Creative Pixels Video Editing (MCP)
When the Creative Pixels (`edit-pixels`) stdio MCP server is connected as `creative_pixels`, the agent can create projects, import media, edit timelines (clips, text, effects, trim/split), and render exports (default h264/mp4/high). See `workspace/skills/creative-pixels-mcp.md`. Point the agent at a local workspace via `PIXELS_WORKSPACE` and start MCP with `npm run headless:mcp -- --workspace <dir>`.

## Operational Modes

| Mode | Focus | Trigger |
|------|-------|---------|
| **Default** | Prediction game, avatars, on-chain | Startup |
| **Studio** | Audio analysis, musical collaboration | "Switch to Studio Mode" |
| **Broadcast** | Chat monitoring, moderation, Twitch clipping | "Switch to Broadcast Mode" |
| **AFK** | Autonomous chat management and Twitch clipping | "Going AFK" |

## Example prompts

**Play a prediction round**
> "Let's do an alignment round. Give me a tough one."

**Check your score**
> "What's my coherence score? How many rounds have we done?"

**Generate an avatar**
> "Create a 3D avatar: a cyberpunk owl wearing headphones and a leather jacket, neon purple highlights, confident stance"

**Register on-chain**
> "My score is 100 — let's register our alignment on Base."

**Enter Studio Mode**
> "Switch to Studio Mode. I'm working on a bridge section for a new track."

**Analyze audio**
> "Here's the latest take — analyze it and suggest chord alternatives."

**Monitor a YouTube live chat**
> "I'm live on YouTube — video id dQw4w9WgXcQ. Monitor the chat for 2 minutes and flag anything off-vibe."

**Monitor a Twitch chat**
> "I'm streaming on Twitch as `mychannel`. Keep an eye on chat."

**Clip a Twitch highlight**
> "That was fire — clip it on Twitch."

**Go AFK**
> "Going AFK — take over the stream. Monitor chat and clip Twitch highlights if anything pops off."

**Edit and render with Creative Pixels**
> "Make a 5-second Pixels clip from /Users/me/clip.mp4 with a text intro saying Demo."

## How it works

1. Deploy the template on Pinata and open the chat
2. The agent introduces itself and learns about your creative practice
3. Play prediction rounds to build your coherence score
4. Optionally generate 3D avatars and register alignment on-chain
5. Switch to Studio Mode for musical collaboration
6. Switch to Broadcast Mode during live streams for chat management
7. Enable AFK Mode for autonomous operation while you're away
8. Optionally connect Creative Pixels MCP for conversational video create/edit/render
9. The agent compacts older rounds and transaction logs to stay efficient

## Post-deploy setup

Open the chat — the agent handles introductions and setup from there.

Configure these secrets in your Pinata dashboard for each feature:

| Secret | Purpose | Required For |
|--------|---------|-------------|
| `TRIPO_API_KEY` | Tripo3D API key | Avatar generation |
| `PRIVATE_KEY` | Dedicated EVM wallet (0x-prefixed) | On-chain registration |
| `PINATA_JWT` | Pinata API JWT (Admin key) | Attached Pinata skills |
| `PINATA_GATEWAY_URL` | Pinata gateway domain | Attached Pinata skills |
| `AUDIO_LLM_API_KEY` | OpenAI or Google API key | Studio assistant |
| `AUDIO_LLM_PROVIDER` | `openai` or `google` (default: openai) | Studio assistant |
| `YOUTUBE_API_KEY` | YouTube Data API v3 key | YouTube chat monitoring |
| `YOUTUBE_VIDEO_ID` | Default video id for HEARTBEAT invocations | YouTube chat monitoring (optional) |
| `TWITCH_CHANNEL` | Default Twitch channel for HEARTBEAT invocations | Twitch chat monitoring (optional) |
| `TWITCH_CLIENT_ID` | Twitch application client id | Twitch clip creation |
| `TWITCH_OAUTH_USER_TOKEN` | User token with `clips:edit` scope | Twitch clip creation |
| `PIXELS_WORKSPACE` | Absolute local path to Creative Pixels workspace | Video edit/render via MCP |

## Relationship to Hermes

This directory is the deployable OpenClaw / Pinata container template. The [`hermes/...`](../hermes/interaction-and-interfaces/creative-ai-digital-twin-lite) directory contains the same agent as a Hermes skill (procedural instructions for the Hermes Agent runtime). Both share the same capabilities, environment variables, and operational modes; pick the runtime that fits your setup.

The prediction game works with zero secrets configured — you can start building alignment immediately. Anonymous Twitch chat monitoring also needs no token.

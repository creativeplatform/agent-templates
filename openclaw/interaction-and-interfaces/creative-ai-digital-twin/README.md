# creative ai digital twin

## What this is

A digital twin agent for creative professionals. Deploy it and get an AI agent that learns your creative decision-making through prediction games, generates C2PA-secured 3D avatars via Tripo3D, registers your alignment score on-chain via ERC-8004 on Base, and acts as a real-time studio assistant, live stream moderator, and autonomous broadcast producer with Livepeer integration.

## Capabilities

### Prediction Game (alignment)
The agent generates hypothetical creative business scenarios — pricing negotiations, IP licensing, client management, creative direction dilemmas — and evaluates your reasoning across four axes: Consistency, Reasoning Depth, Creative Integrity, and Pragmatism. Your responses build a coherence score over time using an exponential moving average. This is how the agent learns to think like you.

### 3D Avatar Generation (identity)
Generate fully rigged 3D avatar meshes (.glb) from text descriptions using the Tripo3D API. Every avatar is stamped with C2PA provenance metadata, creating a verifiable record of AI-generated visual identity assets.

### ERC-8004 On-Chain Alignment (trust)
When your coherence score reaches 100 after a minimum of 10 prediction rounds, the agent can register your alignment on the ERC-8004 smart contract on Base. This creates a public, verifiable record that other Digital Twin Agents in the Creative AI network can use to establish trust.

### Studio Assistant (collaboration)
Process live audio through an audio-native LLM (OpenAI GPT-4o or Google Gemini). In **cowriter mode**, the agent actively suggests chord progressions, lyric alternatives, and arrangement critiques. In **listener mode**, it passively transcribes and analyzes.

### Creative TV Chat Moderator (community)
Connect to Creative TV's live chat via WebSocket. The agent monitors engagement, moderates contextually (understanding your vibe, not just blocking keywords), and tracks participation metrics.

### Social Token Distribution (rewards)
Distribute your ERC-20 social tokens to engaged viewers during broadcasts. The agent identifies top participants, highlight moments, and trivia winners, then sends tokens directly from the agent wallet.

### Autonomous Token Swapping (finance)
Swap USDC to ETH on Uniswap V3 (Base) when the agent needs ETH for gas fees or market bounties. Executes the minimum swap needed with conservative slippage.

### Reality.eth Prediction Markets (engagement)
Create binary (yes/no) prediction markets on reality.eth around live stream events. Viewers stake on outcomes, and the agent acts as the initial reporter to resolve markets based on stream context.

### Livepeer Highlight Clipping (content)
Autonomously clip broadcast highlights via the Livepeer API when engagement spikes. Clips are injected with C2PA provenance metadata and can be dropped into chat as verifiable NFT collectibles.

### Live Stream Overlay (presence)
Float the 3D avatar as a transparent overlay during live broadcasts. Works with OBS Studio via a Browser Source with the R3F canvas set to `alpha={true}`.

## Operational Modes

| Mode | Focus | Trigger |
|------|-------|---------|
| **Default** | Prediction game, avatars, on-chain | Startup |
| **Studio** | Audio analysis, musical collaboration | "Switch to Studio Mode" |
| **Broadcast** | Chat, moderation, tokens, markets, clipping | "Switch to Broadcast Mode" or `stream.started` webhook |
| **AFK** | Autonomous chat, tokens, markets, clipping | "Going AFK" or `stream.idle` webhook |

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

**Monitor chat**
> "Switch to Broadcast Mode. Keep an eye on the chat and flag anything off-vibe."

**Distribute tokens**
> "Send 50 tokens to the top 3 chatters from the last hour."

**Create a prediction market**
> "Chat is debating whether I'll finish this track tonight. Create a market for it."

**Clip a highlight**
> "That solo was fire — clip the last 30 seconds."

**Go AFK**
> "Going AFK — take over the stream. Keep the chat engaged and clip any highlights."

## How it works

1. Deploy the template on Pinata and open the chat
2. The agent introduces itself and learns about your creative practice
3. Play prediction rounds to build your coherence score
4. Optionally generate 3D avatars and register alignment on-chain
5. Switch to Studio Mode for musical collaboration
6. Switch to Broadcast Mode during live streams for chat management
7. Enable AFK Mode for autonomous operation while you're away
8. The agent compacts older rounds and transaction logs to stay efficient

## Post-deploy setup

Open the chat — the agent handles introductions and setup from there.

Configure these secrets in your Pinata dashboard for each feature:

| Secret | Purpose | Required For |
|--------|---------|-------------|
| `TRIPO_API_KEY` | Tripo3D API key | Avatar generation |
| `AGENT_PRIVATE_KEY` | Dedicated EVM wallet | All on-chain actions |
| `BASE_RPC_URL` | Base network RPC endpoint | All on-chain actions |
| `AUDIO_LLM_API_KEY` | OpenAI or Google API key | Studio assistant |
| `AUDIO_LLM_PROVIDER` | `openai` or `google` (default: openai) | Studio assistant |
| `CREATIVE_TV_WS_URL` | Creative TV WebSocket endpoint | Chat monitoring |
| `CREATIVE_TV_AUTH_TOKEN` | Creative TV auth token | Chat monitoring |
| `SOCIAL_TOKEN_ADDRESS` | ERC-20 token contract on Base | Token distribution |
| `REALITY_ETH_ADDRESS` | reality.eth contract on Base | Prediction markets |
| `LIVEPEER_API_KEY` | Livepeer Studio API key | Stream clipping, multistream |

The prediction game works with zero secrets configured — you can start building alignment immediately.

# creative ai digital twin

## What this is

A digital twin agent for creative professionals. Deploy it and get an AI agent that learns your creative decision-making through prediction games, generates C2PA-secured 3D avatars via Tripo3D, and registers your alignment score on-chain via ERC-8004 on Base.

## Three capabilities

### Prediction Game (alignment)
The agent generates hypothetical creative business scenarios — pricing negotiations, IP licensing, client management, creative direction dilemmas — and evaluates your reasoning across four axes: Consistency, Reasoning Depth, Creative Integrity, and Pragmatism. Your responses build a coherence score over time using an exponential moving average. This is how the agent learns to think like you.

### 3D Avatar Generation (identity)
Generate fully rigged 3D avatar meshes (.glb) from text descriptions using the Tripo3D API. Every avatar is stamped with C2PA provenance metadata, creating a verifiable record of AI-generated visual identity assets.

### ERC-8004 On-Chain Alignment (trust)
When your coherence score reaches 100 after a minimum of 10 prediction rounds, the agent can register your alignment on the ERC-8004 smart contract on Base. This creates a public, verifiable record that other Digital Twin Agents in the Creative AI network can use to establish trust.

## Example prompts

**Play a prediction round**
> "Let's do an alignment round. Give me a tough one."

**Check your score**
> "What's my coherence score? How many rounds have we done?"

**Generate an avatar**
> "Create a 3D avatar: a cyberpunk owl wearing headphones and a leather jacket, neon purple highlights, confident stance"

**Register on-chain**
> "My score is 100 — let's register our alignment on Base."

**Learn about the process**
> "How does the prediction game scoring work?"

## How it works

1. Deploy the template on Pinata and open the chat
2. The agent introduces itself and learns about your creative practice
3. Play prediction rounds to build your coherence score
4. Optionally generate 3D avatars and register alignment on-chain
5. The agent compacts older rounds to stay efficient over time

## Post-deploy setup

Open the chat — the agent handles introductions and setup from there.

For full functionality, configure these secrets in your Pinata dashboard:

| Secret | Purpose | Required? |
|--------|---------|-----------|
| `TRIPO_API_KEY` | Tripo3D API key for avatar generation | For avatars |
| `AGENT_PRIVATE_KEY` | Dedicated EVM wallet for Base transactions | For on-chain |
| `BASE_RPC_URL` | Base network RPC endpoint | For on-chain |

The prediction game works with zero secrets configured — you can start building alignment immediately.

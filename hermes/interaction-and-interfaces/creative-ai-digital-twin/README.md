# Creative AI Digital Twin (Hermes)

**Platform:** Hermes Agent skill  
**Pinata / OpenClaw deployable template:** [`openclaw/interaction-and-interfaces/creative-ai-digital-twin`](../openclaw/interaction-and-interfaces/creative-ai-digital-twin)

A Hermes Agent skill for creative professionals' digital twins.

## What it does

- Builds alignment through prediction games that learn your creative decision-making.
- Generates rigged 3D avatars via Tripo3D with C2PA provenance.
- Registers on-chain coherence scores to Base via ERC-8004.
- Acts as a real-time studio assistant for audio analysis and musical collaboration.
- Moderates Creative TV live chat, distributes tokens, runs prediction markets, and creates highlight clips via Livepeer.
- Can autonomously manage a stream in AFK mode after explicit operator consent.
- Drives Creative Pixels video create/edit/render workflows via MCP when connected.

## Files

- `SKILL.md` — Hermes procedural skill with workflows and environment variables.
- `manifest.json` — Pinata/OpenClaw marketplace metadata (`platform: hermes`).
- `references/` — Detailed guides for Tripo3D avatars, ERC-8004 registration, and Creative Pixels MCP.

## Quick start

1. Copy this folder into your Hermes skills directory:

```bash
mkdir -p ~/.hermes/skills/interaction-and-interfaces
cp -r hermes/interaction-and-interfaces/creative-ai-digital-twin ~/.hermes/skills/interaction-and-interfaces/
```

2. Set the required environment variables (see `SKILL.md` Required Environment).
3. In Hermes, prompt: `Load the creative-ai-digital-twin skill and run an alignment round.`

## Relationship to OpenClaw

This directory is the Hermes skill packaging of the same Creative AI Digital Twin agent. The [`openclaw/...`](../openclaw/interaction-and-interfaces/creative-ai-digital-twin) directory contains the deployable Pinata/OpenClaw container template with runnable `skills/*.js` files. Both share the same capabilities, environment variables, and operational modes; pick the runtime that fits your setup.
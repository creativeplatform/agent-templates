# TOOLS.md — Environment Notes

## Stack

- **Runtime:** Hermes Agent
- **Platform:** hermes
- **Category:** interaction & interfaces

## Capabilities

- Alignment / prediction game
- 3D avatar generation via Tripo3D
- ERC-8004 on-chain registration on Base
- Studio audio analysis via audio LLM (OpenAI / Google)
- Creative TV chat moderation and Livepeer clipping
- Creative Pixels MCP video editing

## Secrets Reference

| Secret | Purpose | Required For |
|---|---|---|
| `TRIPO_API_KEY` | Tripo3D avatar generation | Avatars |
| `PRIVATE_KEY` | EVM wallet for Base transactions | ERC-8004, token distribution, swaps |
| `BASE_RPC_URL` | Base network RPC | On-chain actions |
| `PINATA_JWT` / `PINATA_GATEWAY_URL` | IPFS/file operations | Pinata skills |
| `AUDIO_LLM_API_KEY` / `AUDIO_LLM_PROVIDER` | Audio analysis | Studio mode |
| `CREATIVE_TV_WS_URL` / `CREATIVE_TV_AUTH_TOKEN` | Creative TV chat | Broadcast/AFK mode |
| `LIVEPEER_API_KEY` | Stream clipping | Broadcast/AFK mode |
| `SOCIAL_TOKEN_ADDRESS` | ERC-20 token distribution | Token drops |
| `METOKEN_ADDRESS` | MeToken bonding curve | MeToken minting |
| `PIXELS_WORKSPACE` | Creative Pixels workspace | Video edit/render MCP |

## Network

- **Base (Chain ID 8453)** for all on-chain operations.

## Notes

Add environment-specific details here as you discover them:
- Agent wallet address and ETH balance on Base
- Tripo3D API quota
- C2PA certificate details
- Active Livepeer stream IDs
- Creative TV WebSocket connection details

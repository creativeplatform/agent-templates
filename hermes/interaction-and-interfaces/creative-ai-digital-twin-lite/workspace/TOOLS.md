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
- YouTube and Twitch live chat monitoring
- Native Twitch clip creation
- Creative Pixels MCP video editing

## Secrets Reference

| Secret | Purpose | Required For |
|---|---|---|
| `TRIPO_API_KEY` | Tripo3D avatar generation | Avatars |
| `PRIVATE_KEY` | EVM wallet for Base transactions | ERC-8004 |
| `BASE_RPC_URL` | Base network RPC | On-chain actions |
| `PINATA_JWT` / `PINATA_GATEWAY_URL` | IPFS/file operations | Pinata skills |
| `AUDIO_LLM_API_KEY` / `AUDIO_LLM_PROVIDER` | Audio analysis | Studio mode |
| `YOUTUBE_API_KEY` | YouTube Data API v3 | YouTube chat |
| `YOUTUBE_VIDEO_ID` | Default YouTube video id | Heartbeat monitoring |
| `TWITCH_CHANNEL` | Default Twitch channel | Chat monitoring |
| `TWITCH_CLIENT_ID` / `TWITCH_OAUTH_USER_TOKEN` | Twitch clip creation | Clips |
| `PIXELS_WORKSPACE` | Creative Pixels workspace | Video edit/render MCP |

## Network

- **Base (Chain ID 8453)** for all on-chain operations.

## Notes

Add environment-specific details here as you discover them:
- Agent wallet address and ETH balance on Base
- Tripo3D API quota
- C2PA certificate details
- Active YouTube video IDs
- Active Twitch channels

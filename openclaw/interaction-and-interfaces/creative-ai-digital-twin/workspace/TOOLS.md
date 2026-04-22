# TOOLS.md — Environment Notes

## Stack

- **Runtime:** Node.js 22+
- **Package Manager:** npm
- **Dependencies:** ethers@6, c2pa-node, ws (installed at build time)

## Skills

### Local Skills

| Skill | Path | Purpose |
|-------|------|---------|
| Avatar Generation | `skills/generate-avatar/index.js` | Tripo3D text-to-3D + auto-rigging + C2PA injection |
| Live Audio Processing | `skills/process-live-audio/index.js` | Audio analysis via LLM for studio collaboration |
| Creative TV Chat | `skills/monitor-creative-tv-chat/index.js` | WebSocket chat monitoring, moderation, engagement metrics |
| Social Token Distribution | `skills/distribute-social-token/index.js` | ERC-20 token transfers to viewer wallets on Base |
| USDC→ETH Swap | `skills/swap-usdc-eth/index.js` | Uniswap V3 swap on Base for ETH acquisition |
| Reality.eth Market | `skills/create-reality-market/index.js` | Binary prediction market creation on Base |
| Livepeer Clip | `skills/clip-livepeer-stream/index.js` | Clip live broadcast highlights + C2PA provenance |
| Mint MeTokens | `skills/mint-metoken/index.js` | Mint personal tokens via bonding curve using DAI reserve |

Local skills are invoked via `node skills/<name>/index.js` with CLI arguments. They read secrets from environment variables and print JSON results to stdout.

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
| `PRIVATE_KEY` | EVM wallet for Base transactions | ERC-8004, token distribution, swaps, markets |
| `BASE_RPC_URL` | Base network RPC endpoint | All on-chain skills |
| `AUDIO_LLM_API_KEY` | Audio-capable LLM API key (OpenAI or Google) | Studio assistant |
| `AUDIO_LLM_PROVIDER` | LLM provider: `openai` or `google` (default: openai) | Studio assistant |
| `CREATIVE_TV_WS_URL` | Creative TV WebSocket endpoint | Chat monitoring |
| `CREATIVE_TV_AUTH_TOKEN` | Creative TV authentication token | Chat monitoring |
| `SOCIAL_TOKEN_ADDRESS` | ERC-20 social token contract on Base | Token distribution |
| `REALITY_ETH_ADDRESS` | reality.eth contract address on Base | Market creation |
| `LIVEPEER_API_KEY` | Livepeer Studio API key | Stream clipping, multistream routing |
| `METOKEN_ADDRESS` | Creator's MeToken bonding curve contract on Base | MeToken minting |

Secrets are configured in the Pinata dashboard and injected as environment variables at runtime.

## Contracts

- **ERC-8004 Registry:** Managed by the `@Pinata/ERC8004` attached skill. Contract address and ABI are handled inside the skill — no local config needed.
- **Network:** Base (Chain ID 8453)

### Uniswap V3 (Base)
- **SwapRouter02:** `0x2626664c2603336E57B271c5C0b26F421741e481`
- **USDC:** `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- **WETH:** `0x4200000000000000000000000000000000000006`
- **ABI:** `abi/UniswapV3SwapRouter.json`, `abi/ERC20.json`

### MeTokens (Base)
- **Contract:** Creator-specific, configured via `METOKEN_ADDRESS` env var
- **Reserve Asset:** DAI (`0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb`)
- **Mechanism:** AMM bonding curve — deposit DAI to mint, burn to redeem
- **Max per mint:** 10 DAI without explicit operator confirmation

### Reality.eth (Base)
- **Contract:** Address configured via `REALITY_ETH_ADDRESS` env var
- **ABI:** `abi/RealityETH.json`
- **Binary Template ID:** 2 (yes/no questions)

## Notes

Add environment-specific details here as you discover them:
- Agent wallet address and ETH balance on Base
- Tripo3D API rate limits or quota
- C2PA certificate details
- Social token contract address and decimals
- Livepeer stream IDs for active broadcasts
- Creative TV WebSocket connection details
- Any deployment quirks

# TOOLS.md — Environment Notes

## Stack

- **Runtime:** Node.js 22+
- **Package Manager:** npm
- **Dependencies:** ethers@6, c2pa-node, node-fetch@3 (installed at build time)

## Skills

| Skill | Path | Purpose |
|-------|------|---------|
| Avatar Generation | `skills/generate-avatar/index.js` | Tripo3D text-to-3D + auto-rigging + C2PA injection |
| ERC-8004 Sync | `skills/sync-erc8004/index.js` | On-chain alignment registration on Base |

Skills are invoked via `node skills/<name>/index.js` with CLI arguments. They read secrets from environment variables and print JSON results to stdout.

## Secrets Reference

| Secret | Purpose | Required For |
|--------|---------|-------------|
| `TRIPO_API_KEY` | Tripo3D API authentication | Avatar generation |
| `AGENT_PRIVATE_KEY` | EVM wallet for Base transactions | ERC-8004 registration |
| `BASE_RPC_URL` | Base network RPC endpoint | ERC-8004 registration |

Secrets are configured in the Pinata dashboard and injected as environment variables at runtime.

## Contract

- **ERC-8004 Registry:** Address TBD (placeholder in skill — update when deployed)
- **Network:** Base (Chain ID 8453)
- **ABI:** `abi/ERC8004Registry.json`

## Notes

Add environment-specific details here as you discover them:
- Agent wallet address and ETH balance on Base
- Tripo3D API rate limits or quota
- C2PA certificate details
- Any deployment quirks

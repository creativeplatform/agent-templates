# AGENTS.md — Creative AI Digital Twin Lite Workspace

## Workspace Layout

```
workspace/
  SOUL.md           # Who you are and how you operate
  AGENTS.md         # This file — workspace layout and conventions
  IDENTITY.md       # Your name, creature, vibe, emoji
  TOOLS.md          # Environment-specific notes and stack
  BOOTSTRAP.md      # First-run setup
  HEARTBEAT.md      # Periodic task config
  USER.md           # About your human operator
  COHERENCE.md      # Prediction game state (created after first round)
  TRANSACTIONS.md   # Financial transaction log (created on first tx)
  MEMORY.md         # Long-term memory (created when needed)
  memory/           # Daily logs (created when needed)
  skills/
    creative-pixels-mcp.md  # Creative Pixels MCP — read before video edit/render
```

## Workflow

1. The primary behavior is defined in `SKILL.md` at the template root.
2. Creative Pixels video workflows are documented in `workspace/skills/creative-pixels-mcp.md`.
3. **Build** and **start** scripts are no-ops for Hermes skills — the agent operates via conversation.
4. On-chain actions require `PRIVATE_KEY` and `BASE_RPC_URL`.

## Safety

- Confirm before avatars, on-chain transactions, or clips.
- Never execute on-chain transactions without operator confirmation unless AFK Mode is explicitly enabled.
- Never share private keys or wallet secrets in conversation.
- A coherence score of 100 requires a minimum of 10 rounds — never fake or inflate it.

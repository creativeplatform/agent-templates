# AGENTS.md — Creative AI Digital Twin Lite Workspace

## Workspace Layout

```
workspace/
  SOUL.md           # Who you are and how you operate (incl. all modes)
  AGENTS.md         # This file — workspace layout and conventions
  IDENTITY.md       # Your name, creature, vibe, emoji
  TOOLS.md          # Environment-specific notes and stack
  BOOTSTRAP.md      # First-run setup (delete after setup)
  HEARTBEAT.md      # Periodic task config
  USER.md           # About your human operator
  COHERENCE.md      # Prediction game state (created after first round)
  TRANSACTIONS.md   # On-chain transaction log (created on first tx)
  MEMORY.md         # Long-term memory (create when needed)
  memory/           # Daily logs (create when needed)
```

## Workflow

1. **Build** runs automatically after each `git push` — installs npm dependencies (ethers, c2pa-node, ws)
2. **Start** is a no-op — the agent operates via conversation, not a web server
3. Skills are invoked via `node skills/<name>/index.js` with CLI arguments

## Skill Invocation

Skills print JSON to stdout. Parse the result and report to the operator.

```bash
# Avatar generation
node skills/generate-avatar/index.js --prompt "description" --output avatars/

# ERC-8004 registration
node skills/sync-erc8004/index.js --score 100 --rounds 15 --operator-address 0x...

# Studio assistant (audio processing)
node skills/process-live-audio/index.js --audio-source "audio.wav" --mode cowriter --context "bridge section"

# YouTube live chat monitoring
node skills/monitor-youtube-chat/index.js --video-id <videoId> --duration 60 --action monitor

# Twitch live chat monitoring
node skills/monitor-twitch-chat/index.js --channel <channel> --duration 60 --action monitor

# Twitch clip creation
node skills/create-twitch-clip/index.js --channel <channel>
```

Always check the `success` field in the JSON result before reporting success.

## Conventions

- Commit with conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`
- COHERENCE.md is append-only for round logs (compacted per HEARTBEAT.md schedule)
- Never edit Historical Average rows manually — they are computed during compaction

## Memory

- Create `COHERENCE.md` after the first prediction round
- Create `TRANSACTIONS.md` after the first on-chain transaction
- Create `memory/` directory for daily logs when needed
- Create `MEMORY.md` for long-term creative preference context when needed
- Update `USER.md` Decision Patterns section after every 5 rounds

## Safety

- Never push directly to `main` — always use feature branches + PRs
- Ask before deploying to production
- Don't run destructive commands without confirmation
- Never execute on-chain transactions without operator confirmation
- Never share private keys or wallet secrets in conversation

## Rules of Engagement

This DTA may only coordinate and share data with other DTAs in the Creative AI network that have a verified, on-chain ERC-8004 coherence score above the minimum DAO threshold.

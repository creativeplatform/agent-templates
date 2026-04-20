# HEARTBEAT.md — Periodic Tasks

## Long Task Check-In

If a multi-step operation is active (avatar generation, on-chain registration), check in with the operator on progress. Don't interrupt silently running processes.

## Prediction Round Cadence

If no prediction round has been played in the last 24 hours and coherenceScore < 100, gently offer a round:

> "Want to play a quick alignment round? Your current score is [score] after [n] rounds."

Never auto-generate scenarios without asking. The operator initiates or accepts — never forced.

## Coherence Log Compaction

After every 5 new rounds, compact `COHERENCE.md`:
- Keep the current EMA score and total round count at the top
- Retain only the **last 5 rounds** in the detailed table
- Summarize older rounds into a single "Historical Average" row with averaged subscores
- This prevents token bloat during context compaction

## AFK Mode Operations

When AFK Mode is active, run chat monitoring on whichever platform the operator is streaming on:

```bash
# YouTube — if YOUTUBE_VIDEO_ID is set or the operator gave you a video id
node skills/monitor-youtube-chat/index.js --duration 60 --action monitor

# Twitch — if TWITCH_CHANNEL is set or the operator gave you a channel
node skills/monitor-twitch-chat/index.js --duration 60 --action monitor
```

During AFK Mode:
- Watch for clip-worthy moments on Twitch (messages-per-minute spike > 2x baseline) and create a clip via `create-twitch-clip`
- YouTube highlights cannot be clipped programmatically — log the timestamp so the operator can grab it in YouTube Studio later
- Log all autonomous actions to `workspace/TRANSACTIONS.md`
- Track cumulative spending (Twitch clips count against Helix rate limits) and back off if limits are hit

## Transaction Log Compaction

After every 10 on-chain transactions, compact `TRANSACTIONS.md`:
- Keep the last 10 transactions in detail
- Summarize older transactions into a cumulative totals row

## Learnings Routine

On idle ticks, review recent prediction rounds and update:
- `USER.md` Decision Patterns section with any emerging themes
- `MEMORY.md` (create if needed) with notable creative preferences or red lines

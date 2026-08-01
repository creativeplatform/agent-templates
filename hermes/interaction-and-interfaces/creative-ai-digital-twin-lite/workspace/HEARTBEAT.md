# HEARTBEAT.md — Periodic Tasks

## Prediction Round Cadence

If no prediction round has been played in the last 24 hours and `coherenceScore < 100`, gently offer a round:

> "Want to play a quick alignment round? Your current score is [score] after [n] rounds."

Never auto-generate scenarios without asking. The operator initiates or accepts.

## Coherence Log Compaction

After every 5 new rounds, compact `COHERENCE.md`:
- Keep the current EMA score and total round count at the top.
- Retain only the last 5 rounds in the detailed table.
- Summarize older rounds into a single "Historical Average" row.

## Broadcast Mode Check-Ins

When in Broadcast Mode:
- Monitor YouTube and Twitch chat.
- Create Twitch clips when engagement spikes.
- Log autonomous actions to `TRANSACTIONS.md`.

## Learnings Routine

On idle ticks, review recent prediction rounds and update:
- `USER.md` Decision Patterns section after every 5 rounds.
- `MEMORY.md` for long-term creative preferences or red lines.

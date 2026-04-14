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

## Learnings Routine

On idle ticks, review recent prediction rounds and update:
- `USER.md` Decision Patterns section with any emerging themes
- `MEMORY.md` (create if needed) with notable creative preferences or red lines

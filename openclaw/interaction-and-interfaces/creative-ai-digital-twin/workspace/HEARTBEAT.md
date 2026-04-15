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

When AFK Mode is active:
- Monitor Creative TV chat every 60 seconds via `monitor-creative-tv-chat`
- Distribute social tokens to highly engaged viewers based on participation metrics
- Watch for market-worthy moments and create reality.eth prediction markets
- Clip highlights when engagement spikes (messages-per-minute jumps > 2x baseline)
- Log all autonomous actions to `workspace/TRANSACTIONS.md` and `workspace/MARKETS.md`
- Track cumulative spending and stop if session limits are reached

## Livepeer Stream State

Listen for Livepeer webhook events piped through the Creative TV WebSocket:
- `stream.started` → Log stream start, transition to Broadcast Mode if AFK consent is active
- `stream.idle` → Log stream end, transition to AFK Mode if AFK consent was given

## Transaction Log Compaction

After every 10 financial transactions, compact `TRANSACTIONS.md`:
- Keep the last 10 transactions in detail
- Summarize older transactions into a cumulative totals row (total distributed, total swapped, total bounties)

## Market Resolution Check

Periodically check active markets in `MARKETS.md`:
- If a market's timeout has passed, check if resolution is needed
- If the DTA is the arbitrator, submit the final answer based on stream context
- Mark resolved markets as complete in `MARKETS.md`

## Learnings Routine

On idle ticks, review recent prediction rounds and update:
- `USER.md` Decision Patterns section with any emerging themes
- `MEMORY.md` (create if needed) with notable creative preferences or red lines

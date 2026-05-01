# AGENTS.md — Director of Marketing Workspace

## Workspace Layout

```
workspace/
  SOUL.md        # Who you are: storyteller, people-driven, strategy before tactics
  AGENTS.md      # This file — workspace conventions
  IDENTITY.md    # Your name and persona (fill in on first run)
  TOOLS.md       # Paragraph CLI and email helper notes
  BOOTSTRAP.md   # First-run setup (delete after setup)
  HEARTBEAT.md   # Periodic check-in config
  USER.md        # Audience, promise, jobs-to-be-done, metrics
  MEMORY.md      # Long-term memory (create when needed)
  memory/        # Session logs (create when needed)
  skills/
    paragraph-cli.md   # Paragraph CLI rules — read before using `paragraph`
  tools/
    email-send/        # SMTP helper (nodemailer), installed at build
```

## Skills

Read `skills/paragraph-cli.md` before using any `paragraph` command group. It defines JSON output, dry-runs, auth, pagination, and publishing guardrails.

## Strategic workflow (Strategic Connection & Remarkability)

Align with `SOUL.md` before executing:

1. **Empathy / psychographics** — Not only demographics: internal story of the people you seek to serve (e.g. craving progress, belonging, competence).
2. **Two questions** — (a) Who do you want to help them become? (b) What are they hiring you to do?
3. **Promise and consistency** — What expectation are you setting? Keep it **consistent** across touchpoints (that beats performative “authenticity”).
4. **Smallest viable audience** — Prefer a tight, right group over maximum reach when the story demands it.
5. **Remarkability** — Would someone remark on this? If not, improve the idea before the distribution.
6. **Permission** — Subscribers opted in; honor that in tone, frequency, and every send.

Then: newsletter profile (Paragraph), drafts, `--dry-run` where applicable, **explicit approval** to publish or broadcast.

## Technical workflow

1. Build runs `setup.sh` — installs the Paragraph CLI globally and npm dependencies for `tools/email-send`.
2. The agent operates via conversation — no web server.
3. **Paragraph path:** `whoami`, publication context with `--json`, paginate lists; never publish without explicit user approval.
4. **Email path:** `node tools/email-send/send.mjs` (see `TOOLS.md`) with SMTP secrets.

## Memory

- **`USER.md`** — Fill and update **Strategic lens** (transformation, job to be done, promise, smallest viable audience) and **Metrics that matter** (subscribers, last open rate when known).
- **`MEMORY.md`** — Riffs, campaign arcs, what landed, reputation notes (what people say about them, not only what they say about themselves).

## Conventions

- Verify Paragraph auth with `paragraph whoami --json` before substantive work.
- Use `--dry-run` before delete, publish, and archive.
- **Sending email** and **publishing** leave the machine — confirm recipients and live-send intent with the user first.

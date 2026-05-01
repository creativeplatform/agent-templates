# AGENTS.md — Director of Marketing Workspace

## Workspace Layout

```
workspace/
  SOUL.md        # Who you are and how you operate
  AGENTS.md      # This file — workspace conventions
  IDENTITY.md    # Your name and persona (fill in on first run)
  TOOLS.md       # Paragraph CLI and email helper notes
  BOOTSTRAP.md   # First-run setup (delete after setup)
  HEARTBEAT.md   # Periodic check-in config
  USER.md        # About your human and their newsletter
  MEMORY.md      # Long-term memory (create when needed)
  memory/        # Session logs (create when needed)
  skills/
    paragraph-cli.md   # Paragraph CLI rules — read before using `paragraph`
  tools/
    email-send/        # SMTP helper (nodemailer), installed at build
```

## Skills

Read `skills/paragraph-cli.md` before using any `paragraph` command group. It defines JSON output, dry-runs, auth, pagination, and publishing guardrails.

## Workflow

1. Build runs `setup.sh` — installs the Paragraph CLI globally and npm dependencies for `tools/email-send`.
2. The agent operates via conversation — no web server.
3. **Paragraph path:** newsletter profile first (`whoami`, then publication/list commands with `--json`), then drafts and edits. Never publish without explicit user approval.
4. **Email path:** when the user has no Paragraph account, send via `node tools/email-send/send.mjs` (see `TOOLS.md`) using SMTP secrets.

## Memory

- Create `MEMORY.md` for publication profile summaries, voice/tone, and campaign notes
- Create `memory/YYYY-MM-DD.md` for session logs
- Update `USER.md` as you learn their stack (Paragraph vs SMTP, lists, preferences)

## Conventions

- Always verify Paragraph auth with `paragraph whoami --json` before substantive work
- Use `--dry-run` before delete, publish, and archive
- **Sending email** and **publishing** leave the machine — confirm recipients and live-send intent with the user first

# Director of Marketing

An OpenClaw agent by **Creative Platform** for **newsletter and marketing workflows**, framed as **people-driven storytelling**: word of mouth, clear promises, **consistency** over performative authenticity, and the **smallest viable audience** before volume. It uses the [Paragraph CLI](https://paragraph.com) for posts, publications, subscribers, and coins, or **SMTP** when you do not use Paragraph.

## What it does

- **Strategy before tactics** — Anchors work in *who you help people become* and *what they hire you to do*; tracks permission, subscribers, and open rates that matter.
- **Newsletter profile first** — Verifies Paragraph auth and summarizes your publication before drafting or publishing.
- **Paragraph** — Create and manage drafts, posts, and related resources via `paragraph` with JSON output, dry-runs, and explicit approval before publish.
- **Email fallback** — Send campaigns or one-off messages through your mail provider using the bundled Node + nodemailer helper (SMTP).

## Example prompts

**Paragraph**

> "What's my Paragraph publication profile?"

> "Draft a post titled Weekly update from this file."

> "List my recent draft posts as JSON."

**Email (no Paragraph)**

> "Send a test email to me@example.com with subject Hello and this body: …"

## How it works

1. Deploy the template on Creative Platform (or your OpenClaw host).
2. Build runs `setup.sh`: installs `@paragraph-com/cli` globally, `npm install` in `workspace/tools/email-send`, installs `web/` deps, and runs **`next build`** (production CSS and `/_next` assets require this).
3. **Start** runs `scripts/start-web.sh`, which serves the UI with **`node server.cjs`** (custom Node + `next` handler: **production** Next on `0.0.0.0`). For local dev instead, run from `web/`: `REMARKABILITY_DEV=1 pnpm dev`.
4. The agent reads `workspace/skills/paragraph-cli.md` before using Paragraph commands.

### Pinata routes vs Next.js paths

Per [Pinata Domains & Routes](https://docs.pinata.cloud), the **path prefix is stripped** before traffic reaches your container (e.g. public `…/newsletter` → process sees `/`). This app therefore has **no `basePath`** in `next.config.mjs`. The manifest still declares `"path": "/newsletter"` so users open that URL on the agent; internally Next serves `/` and `/_next/static/...`.

**If the UI loads unstyled:** run template **build** (so `next build` runs) then **start**, and confirm **`/_next/static/...css`** returns 200 in the browser network tab.

## Secrets

| Secret | Purpose |
|--------|---------|
| `PARAGRAPH_API_KEY` | Non-interactive Paragraph CLI auth (optional) |
| `PARAGRAPH_API_URL` | Custom API base URL (optional) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE` | Outbound email |
| `EMAIL_FROM`, `EMAIL_REPLY_TO` | From / Reply-To for SMTP |
| `IMAP_*` | Optional; for future inbox reads (POP/IMAP receive mail; **sending uses SMTP**) |

Install the CLI locally: `npm install -g @paragraph-com/cli` (requires Node.js 18+).

## Security

Never log API keys, SMTP passwords, or message bodies containing secrets. Use environment variables and confirm recipients before sending.

## Powered by

- [Paragraph](https://paragraph.com) — web3 publishing and newsletters
- [@paragraph-com/cli](https://www.npmjs.com/package/@paragraph-com/cli)

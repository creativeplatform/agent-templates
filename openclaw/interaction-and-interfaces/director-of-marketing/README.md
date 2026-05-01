# Director of Marketing

A Pinata OpenClaw agent for **newsletter and marketing workflows**. It uses the [Paragraph CLI](https://paragraph.com) to manage posts, publications, subscribers, and coins on Paragraph, or **SMTP** to send email when you do not have a Paragraph account.

## What it does

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

1. Deploy the template on Pinata.
2. Build runs `setup.sh`: installs `@paragraph-com/cli` globally and `npm install` in `workspace/tools/email-send`.
3. The agent reads `workspace/skills/paragraph-cli.md` before using Paragraph commands.

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

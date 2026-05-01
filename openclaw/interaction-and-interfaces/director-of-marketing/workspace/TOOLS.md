# TOOLS.md — Paragraph CLI & Email

## Paragraph CLI

- **Binary:** `paragraph` (installed globally via `npm install -g @paragraph-com/cli`)
- **Skill doc:** `skills/paragraph-cli.md` — read before first use
- **Help:** `paragraph --help`, `paragraph <cmd> --help`
- **JSON:** append `--json` where supported
- **Auth check:** `paragraph whoami --json`

### Environment

| Variable | Purpose |
|----------|---------|
| `PARAGRAPH_API_KEY` | API key (non-interactive) |
| `PARAGRAPH_API_URL` | Custom API base URL |
| `PARAGRAPH_NON_INTERACTIVE` | `1` to force non-interactive CLI |
| `CI` | `true` also forces CLI mode per Paragraph docs |

## Email helper (SMTP)

Built at **`tools/email-send/`** (run from workspace root).

**Send** (body via stdin or `EMAIL_BODY`):

```bash
# From workspace root; paths relative to this workspace
echo "Hello" | node tools/email-send/send.mjs --to reader@example.com --subject "Subject line"
```

Or with a file:

```bash
node tools/email-send/send.mjs --to reader@example.com --subject "Subject line" --file ./draft.md
```

Or set body in the environment (skips stdin):

```bash
EMAIL_BODY="Plain text body" node tools/email-send/send.mjs --to reader@example.com --subject "Subject line"
```

### SMTP environment variables

| Variable | Purpose |
|----------|---------|
| `SMTP_HOST` | Server hostname |
| `SMTP_PORT` | Port (587 STARTTLS common; 465 TLS) |
| `SMTP_USER` | Username |
| `SMTP_PASS` | Password or app password |
| `SMTP_SECURE` | `1` or `true` for TLS on connect (typical port 465) |
| `EMAIL_FROM` | From address |
| `EMAIL_REPLY_TO` | Optional Reply-To |

### IMAP (optional)

POP/IMAP are for **reading** mail. This template does not ship an IMAP client script yet; `IMAP_*` secrets are reserved for future inbox or bounce checks. **Sending always uses SMTP** (or Paragraph’s platform when publishing there).

## Notes

Record the user’s preferred channel (Paragraph vs SMTP), publication slug, and tone in `MEMORY.md` as you learn them.

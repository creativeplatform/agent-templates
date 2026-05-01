# paragraph-cli

**name:** paragraph-cli

**description:** Use the Paragraph CLI and MCP server to manage posts, publications, subscribers, and coins on paragraph.com. Trigger when the user asks to publish, create, update, or manage newsletter content on Paragraph via CLI or MCP.

**license:** MIT

**compatibility:** Requires Node.js 18+ and npm. Install the CLI with `npm install -g @paragraph-com/cli`.

**metadata:**

- **author:** paragraph-com
- **version:** "1.0"

**allowed-tools:**

- `Bash(paragraph: )`
- `Bash(echo: )`
- `Bash(cat: )`
- `Bash(jq: )`

---

## Paragraph CLI

CLI for Paragraph — a web3 publishing and newsletter platform. Use it to manage posts, publications, subscribers, and coins. For direct HTTP or SDK access without installing anything, see the paragraph-api skill instead.

## Working Agreement (Agent Execution Rules)

When executing commands for this skill, the agent MUST adhere to the following rules:

- **JSON Output:** Always use `--json` for parseable output. Data goes to stdout, status/errors to stderr.
- **Skip Prompts:** Always use `--yes` on delete to skip confirmation prompts.
- **Safety First:** Use `--dry-run` before delete, publish, and archive to preview what will happen.
- **Flag Usage:** Use flags, not just positional args. Every identifier accepts `--id` so you can chain commands.
- **Content Piping:** Pipe content via stdin when creating or updating posts from files (e.g. `cat draft.md | paragraph post create --title "My Post"`).
- **Pagination:** Paginate with `--limit` and `--cursor`. The JSON response includes `pagination.cursor` and `pagination.hasMore`.
- **Non-Interactive Auth:** Do not use interactive login. Use `--token` or `--with-token` for non-interactive auth.
- **Auth Verification:** Check auth before running commands. Run `paragraph whoami --json` to verify credentials are valid.
- **Explicit Publishing:** Do not publish without explicit user approval. Publishing sends content live and optionally emails subscribers.
- **Draft by Default:** Default to draft. `post create` creates drafts. Only call `post publish` when the user asks.

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `PARAGRAPH_API_KEY` | API key (skip login) |
| `PARAGRAPH_API_URL` | Custom API base URL |
| `PARAGRAPH_NON_INTERACTIVE` | Set to `1` to force CLI mode |
| `CI` | Set to `true` to force CLI mode |

## Troubleshooting & Error Handling

- **Authentication Errors (UNAUTHORIZED):** The CLI auto-clears stored credentials on 401. Re-login if credentials were revoked.
- **Rate Limiting (RATE_LIMITED):** If you get a 429 status code, wait and retry. Avoid tight loops — add a delay between paginated requests.
- **Command Hangs:** If a command appears to hang, it may be waiting for stdin. Ensure you're passing content via `--text`, `--file`, or piping to stdin. The CLI times out after 30 seconds if stdin is piped but no data arrives.

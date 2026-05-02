#!/usr/bin/env bash
set -e

# ── Paragraph CLI ─────────────────────────────────────────────────────────────
if ! command -v paragraph &>/dev/null; then
  echo "Installing Paragraph CLI..."
  npm install -g @paragraph-com/cli
else
  echo "Paragraph CLI already installed: $(paragraph --version 2>/dev/null || echo ok)"
fi

paragraph --version 2>/dev/null || true

# ── Email send helper (SMTP via nodemailer) ──────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EMAIL_SEND_DIR="$SCRIPT_DIR/workspace/tools/email-send"
if [[ -d "$EMAIL_SEND_DIR" ]]; then
  cd "$EMAIL_SEND_DIR"
  echo "Installing email-send dependencies..."
  npm install
else
  echo "Skipping email-send install (not present at $EMAIL_SEND_DIR — optional in minimal builds)."
fi

# ── Newsletter UI (Next.js, manifest route /newsletter) ─────────────────────
cd "$SCRIPT_DIR/web"
echo "Installing web UI dependencies..."
if command -v pnpm &>/dev/null; then
  pnpm install
else
  npm install
fi

echo "Building newsletter UI for production (next build)..."
set +e
if command -v pnpm &>/dev/null; then
  pnpm run build
else
  npm run build
fi
BUILD_STATUS=$?
set -e
if [[ $BUILD_STATUS -ne 0 ]]; then
  echo "Warning: next build failed; manifest start will fail until build succeeds (or use REMARKABILITY_DEV=1 for dev)." >&2
fi

echo ""
echo "Setup complete. Open the chat to get started."
echo "Run the UI: manifest start (requires .next + BUILD_ID) or cd web && REMARKABILITY_DEV=1 pnpm dev — http://localhost:3000/"

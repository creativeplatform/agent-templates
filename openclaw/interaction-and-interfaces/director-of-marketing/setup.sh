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
cd "$SCRIPT_DIR/workspace/tools/email-send"
echo "Installing email-send dependencies..."
npm install

echo ""
echo "Setup complete. Open the chat to get started."

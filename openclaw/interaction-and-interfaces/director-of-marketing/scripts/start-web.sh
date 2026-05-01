#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT/web"

if command -v pnpm >/dev/null 2>&1; then
  exec pnpm run dev
else
  exec npm run dev
fi

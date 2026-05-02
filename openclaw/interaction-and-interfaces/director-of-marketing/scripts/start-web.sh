#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT/web"

export HOST="${HOST:-0.0.0.0}"

# Local / escape hatch: dev server (chunk graph differs from production).
if [[ "${REMARKABILITY_DEV:-}" == "1" ]]; then
  export NODE_ENV=development
  echo "director-of-marketing: REMARKABILITY_DEV=1 — next dev (may differ from production bundle)." >&2
  if command -v pnpm >/dev/null 2>&1; then
    exec pnpm run dev
  else
    exec npm run dev
  fi
fi

# Agents: serve production build via custom server (Pinata path prefix stripped; stable /_next assets).
if [[ ! -d .next ]] || [[ ! -f .next/BUILD_ID ]]; then
  echo "director-of-marketing: no production build (.next or BUILD_ID missing). Run template build (setup.sh) first." >&2
  exit 1
fi

export NODE_ENV=production
exec node server.cjs

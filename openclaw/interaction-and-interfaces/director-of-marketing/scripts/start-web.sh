#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT/web"

# Agents must serve the production bundle so styling and routing match a real deploy.
# Dev mode (Turbopack) loads extra chunks and can look different from `next build`.
if [[ -d .next ]] && [[ -f .next/BUILD_ID ]]; then
  export NODE_ENV=production
  if command -v pnpm >/dev/null 2>&1; then
    exec pnpm run start
  else
    exec npm run start
  fi
fi

echo "director-of-marketing: no production build found (.next missing); falling back to next dev." >&2
if command -v pnpm >/dev/null 2>&1; then
  exec pnpm run dev
else
  exec npm run dev
fi

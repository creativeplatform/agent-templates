#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT/web"

export NODE_ENV="${NODE_ENV:-production}"
export HOST="${HOST:-0.0.0.0}"

if [[ "${REMARKABILITY_DEV:-}" == "1" ]]; then
  export NODE_ENV=development
  if command -v pnpm >/dev/null 2>&1; then
    exec pnpm run dev
  else
    exec npm run dev
  fi
fi

if [[ ! -d .next ]]; then
  echo "remarkability-engine: no .next — run template build (setup.sh) first" >&2
  exit 1
fi

exec node server.cjs

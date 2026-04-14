#!/usr/bin/env bash
set -e

# ── npm dependencies ─────────────────────────────────────────────────────────
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."

  if [ ! -f "package.json" ]; then
    npm init -y --silent 2>/dev/null
    npm pkg set type="module"
  fi

  npm install --save ethers@6 c2pa-node 2>&1 || {
    echo "WARNING: Some packages failed to install. Retrying individually..."
    npm install --save ethers@6 2>&1 || echo "WARNING: ethers install failed"
    npm install --save c2pa-node 2>&1 || echo "WARNING: c2pa-node install failed (C2PA injection will be disabled)"
  }

  echo "Dependencies installed."
else
  echo "Dependencies already installed."
fi

# ── Verify skill files ──────────────────────────────────────────────────────
for skill in skills/generate-avatar/index.js skills/sync-erc8004/index.js; do
  if [ ! -f "$skill" ]; then
    echo "ERROR: Missing skill file: $skill"
    exit 1
  fi
done
echo "Skill files verified."

# ── Output directory ─────────────────────────────────────────────────────────
mkdir -p avatars
echo "Avatar output directory ready."

echo "Build complete."

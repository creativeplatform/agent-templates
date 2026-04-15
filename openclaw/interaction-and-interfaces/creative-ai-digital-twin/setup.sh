#!/usr/bin/env bash
set -e

# ── npm dependencies ─────────────────────────────────────────────────────────
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."

  if [ ! -f "package.json" ]; then
    npm init -y --silent 2>/dev/null
    npm pkg set type="module"
  fi

  npm install --save ethers@6 c2pa-node ws 2>&1 || {
    echo "WARNING: Some packages failed to install. Retrying individually..."
    npm install --save ethers@6 2>&1 || echo "WARNING: ethers install failed"
    npm install --save c2pa-node 2>&1 || echo "WARNING: c2pa-node install failed (C2PA injection will be disabled)"
    npm install --save ws 2>&1 || echo "WARNING: ws install failed (WebSocket chat monitoring will be disabled)"
  }

  echo "Dependencies installed."
else
  echo "Dependencies already installed."
fi

# ── Verify skill files ──────────────────────────────────────────────────────
for skill in skills/generate-avatar/index.js skills/sync-erc8004/index.js skills/distribute-social-token/index.js skills/swap-usdc-eth/index.js skills/create-reality-market/index.js skills/clip-livepeer-stream/index.js skills/monitor-creative-tv-chat/index.js skills/process-live-audio/index.js; do
  if [ ! -f "$skill" ]; then
    echo "ERROR: Missing skill file: $skill"
    exit 1
  fi
done
echo "Skill files verified."

# ── Output directory ─────────────────────────────────────────────────────────
mkdir -p avatars clips
echo "Output directories ready."

echo "Build complete."

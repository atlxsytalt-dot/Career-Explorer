#!/usr/bin/env bash
set -euo pipefail

echo "=== Enabling pnpm via Corepack (built into Node.js) ==="
corepack enable
corepack prepare pnpm@latest --activate

echo "=== Installing dependencies ==="
pnpm install --frozen-lockfile

echo "=== Running DB migrations ==="
pnpm --filter @workspace/db run push

echo "=== Building frontend ==="
BASE_PATH=/ pnpm --filter @workspace/career-explorer run build

echo "=== Building API server ==="
pnpm --filter @workspace/api-server run build

echo "=== Build complete ==="

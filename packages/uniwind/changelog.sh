#!/usr/bin/env bash
set -euo pipefail

VERSION=$(node -p "require('./package.json').version")
INCLUDE_PATH="packages/uniwind/**"

if [ "${1:-}" = "stdout" ]; then
    npx git-cliff --config cliff.toml --include-path "$INCLUDE_PATH" \
        --unreleased --tag "$VERSION" --output -
else
    npx git-cliff --config cliff.toml --include-path "$INCLUDE_PATH" \
        --tag "$VERSION" --output CHANGELOG.md
fi

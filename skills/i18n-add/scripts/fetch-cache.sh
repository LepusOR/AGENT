#!/usr/bin/env bash
# Usage: fetch-cache.sh [--force]
# Compatibility entrypoint. The implementation lives in fetch-cache.mjs to avoid jq dependency.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
node "$SCRIPT_DIR/fetch-cache.mjs" "$@"

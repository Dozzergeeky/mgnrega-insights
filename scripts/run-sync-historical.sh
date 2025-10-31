#!/bin/bash
# Wrapper script to load environment variables before running historical sync

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( dirname "$SCRIPT_DIR" )"

# Load environment variables from .env.local
if [ -f "$PROJECT_ROOT/.env.local" ]; then
    echo "Loading environment variables from .env.local..."
    export $(grep -v '^#' "$PROJECT_ROOT/.env.local" | xargs)
else
    echo "Warning: .env.local not found at $PROJECT_ROOT/.env.local"
fi

# Run the sync script with any arguments passed to this wrapper
cd "$PROJECT_ROOT"
npx tsx scripts/sync-historical.ts "$@"

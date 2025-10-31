#!/usr/bin/env bash
set -euo pipefail

# Determine app directory (parent of this script)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Ensure logs directory exists
LOG_DIR="$APP_DIR/logs"
mkdir -p "$LOG_DIR"
APP_LOG="$LOG_DIR/sync.log"
SYS_LOG="/var/log/mgnrega-sync.log"

# Setup PATH for cron and logging
export PATH="/usr/local/bin:/usr/bin:/bin:$PATH"
export NODE_ENV="production"

# Load environment if present
if [[ -f "$APP_DIR/.env.local" ]]; then
  # shellcheck disable=SC1091
  set -a; source "$APP_DIR/.env.local"; set +a
fi

# Configure logging: prefer duplicating to system log if writable
if { [[ -w "$SYS_LOG" ]] || { [[ ! -e "$SYS_LOG" ]] && [[ -w "$(dirname "$SYS_LOG")" ]] ; } ; }; then
  touch "$SYS_LOG" 2>/dev/null || true
  # Do not fail the script if tee cannot write one of the logs
  exec > >(tee -a "$APP_LOG" "$SYS_LOG" || tee -a "$APP_LOG") 2>&1
else
  exec >> "$APP_LOG" 2>&1
fi

printf '\n[%s] Starting MGNREGA nightly sync...\n' "$(date -u +'%Y-%m-%d %H:%M:%S UTC')"

cd "$APP_DIR"

# Optional: ensure dependencies are installed (best effort, non-fatal under cron)
if ! command -v tsx >/dev/null 2>&1; then
  echo "[info] tsx not found in PATH; assuming project dependencies already installed."
fi

# Run sync for current month/year (script defaults)
if npm --version >/dev/null 2>&1; then
  npm run --silent sync:mgnrega
else
  echo "[error] npm not found in PATH" >&2
  exit 1
fi

printf '[%s] Sync finished.\n' "$(date -u +'%Y-%m-%d %H:%M:%S UTC')"

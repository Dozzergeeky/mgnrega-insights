#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${DO_HOST:-}" ]]; then
  echo "[deploy] Please export DO_HOST with your droplet's public IP or hostname." >&2
  exit 1
fi

SSH_USER=${DO_USER:-root}
SSH_PORT=${DO_PORT:-22}
REMOTE_APP_DIR=${DO_APP_DIR:-/var/www/mgnrega-app}
REMOTE_REPO_URL=${DO_REPO_URL:-https://github.com/Dozzergeeky/mgnrega-insights.git}
REMOTE_ENV_FILE=${DO_ENV_FILE:-${REMOTE_APP_DIR}/.env.local}
NODE_VERSION_SCRIPT=${DO_NODE_SETUP_SCRIPT:-https://deb.nodesource.com/setup_20.x}

SSH_TARGET="${SSH_USER}@${DO_HOST}"

printf '[deploy] Connecting to %s (port %s)\n' "$SSH_TARGET" "$SSH_PORT"

ssh -p "$SSH_PORT" "$SSH_TARGET" bash -s -- "$REMOTE_APP_DIR" "$REMOTE_REPO_URL" "$REMOTE_ENV_FILE" "$NODE_VERSION_SCRIPT" <<'EOF'
set -euo pipefail
APP_DIR="$1"
REPO_URL="$2"
ENV_FILE="$3"
NODE_SCRIPT="$4"
APP_PARENT_DIR="$(dirname "$APP_DIR")"
REMOTE_USER="$(id -un)"
REMOTE_HOME="$(getent passwd "$REMOTE_USER" | cut -d: -f6 || printf '%s' "$HOME")"

export DEBIAN_FRONTEND=noninteractive

apt-get update -y
apt-get install -y curl git build-essential

if ! command -v node >/dev/null 2>&1; then
  curl -fsSL "$NODE_SCRIPT" | bash -
  apt-get install -y nodejs
fi

if ! command -v pm2 >/dev/null 2>&1; then
  npm install -g pm2
fi

mkdir -p "$APP_PARENT_DIR"

if [[ ! -d "$APP_DIR/.git" ]]; then
  if [[ -d "$APP_DIR" ]]; then
    rm -rf "$APP_DIR"
  fi
  git clone "$REPO_URL" "$APP_DIR"
fi

cd "$APP_DIR"

git fetch --all --prune
if git rev-parse --verify master >/dev/null 2>&1; then
  git checkout master
fi
git pull --ff-only origin master

if [[ ! -f "$ENV_FILE" ]]; then
  echo "[deploy] Remote .env.local not found at $ENV_FILE" >&2
  cat <<'ENV' > "$ENV_FILE"
MGNREGA_API_KEY=
MGNREGA_RESOURCE_ID=
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB=mgnrega
ENV
  echo "[deploy] A placeholder environment file has been created. Review and update secrets." >&2
fi

npm install
npm run build

if pm2 describe mgnrega-app >/dev/null 2>&1; then
  pm2 restart mgnrega-app
else
  pm2 start npm --name mgnrega-app -- start
fi

pm2 save
pm2 startup systemd -u "$REMOTE_USER" --hp "$REMOTE_HOME" >/dev/null
EOF

printf '[deploy] Deployment script completed. Verify PM2 process and configure nginx if required.\n'

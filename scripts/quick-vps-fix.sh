#!/usr/bin/env bash
# Quick VPS fix - run this locally to diagnose and fix the VPS

set -euo pipefail

if [[ -z "${LINODE_HOST:-}" ]]; then
    echo "Usage: LINODE_HOST=your.server.ip ./scripts/quick-vps-fix.sh"
    echo "Optional: LINODE_USER=youruser (default: dozzer)"
    exit 1
fi

SSH_USER=${LINODE_USER:-dozzer}
SSH_TARGET="${SSH_USER}@${LINODE_HOST}"
REMOTE_APP_DIR=${LINODE_APP_DIR:-/home/$SSH_USER/mgnrega-app}

echo "Uploading diagnostic script to $SSH_TARGET..."
scp scripts/diagnose-and-fix.sh "$SSH_TARGET:$REMOTE_APP_DIR/scripts/"

echo ""
echo "Running diagnostic and fix on VPS..."
echo "=============================================="
ssh -t "$SSH_TARGET" "cd $REMOTE_APP_DIR && bash scripts/diagnose-and-fix.sh"

echo ""
echo "Done! Check the output above for any remaining issues."

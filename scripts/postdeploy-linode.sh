#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${LINODE_HOST:-}" ]]; then
	echo "[postdeploy] Please export LINODE_HOST with your Linode server's IP or hostname." >&2
	exit 1
fi

SSH_USER=${LINODE_USER:-root}
SSH_PORT=${LINODE_PORT:-22}
REMOTE_APP_DIR=${LINODE_APP_DIR:-/var/www/mgnrega-app}
REMOTE_ENV_FILE=${LINODE_ENV_FILE:-${REMOTE_APP_DIR}/.env.local}
REMOTE_LOG_FILE=${LINODE_LOG_FILE:-/var/log/mgnrega-sync.log}
REMOTE_DOMAIN=${LINODE_DOMAIN:-}
REMOTE_ALT_DOMAIN=${LINODE_ALT_DOMAIN:-}
REMOTE_SSL_EMAIL=${LINODE_SSL_EMAIL:-}
ENABLE_SSL=${LINODE_ENABLE_SSL:-false}
INSTALL_MONGODB=${LINODE_INSTALL_MONGODB:-true}
ENABLE_UFW=${LINODE_ENABLE_UFW:-false}
ENV_LOCAL_PATH=${LINODE_ENV_LOCAL_PATH:-}

SSH_TARGET="${SSH_USER}@${LINODE_HOST}"

if [[ -z "$ENV_LOCAL_PATH" ]]; then
	echo "[postdeploy] Please set LINODE_ENV_LOCAL_PATH to the local .env file you want to upload." >&2
	exit 1
fi

if [[ ! -f "$ENV_LOCAL_PATH" ]]; then
	echo "[postdeploy] Unable to find env file at $ENV_LOCAL_PATH" >&2
	exit 1
fi

TMP_REMOTE_ENV="${REMOTE_ENV_FILE}.upload"

printf '[postdeploy] Uploading %s to %s:%s\n' "$ENV_LOCAL_PATH" "$SSH_TARGET" "$TMP_REMOTE_ENV"
scp -P "$SSH_PORT" "$ENV_LOCAL_PATH" "$SSH_TARGET":"$TMP_REMOTE_ENV"

printf '[postdeploy] Connecting to %s (port %s)\n' "$SSH_TARGET" "$SSH_PORT"

ssh -p "$SSH_PORT" "$SSH_TARGET" bash -s -- \
	"$REMOTE_APP_DIR" "$REMOTE_ENV_FILE" "$TMP_REMOTE_ENV" "$REMOTE_LOG_FILE" \
	"$REMOTE_DOMAIN" "$REMOTE_ALT_DOMAIN" "$REMOTE_SSL_EMAIL" \
	"$ENABLE_SSL" "$INSTALL_MONGODB" "$ENABLE_UFW" <<'EOF'
set -euo pipefail
APP_DIR="${1:?Missing remote app directory}"
ENV_FILE="${2:?Missing remote env path}"
UPLOAD_PATH="${3:?Missing uploaded env path}"
LOG_FILE="${4:-/var/log/mgnrega-sync.log}"
DOMAIN="${5:-}"
ALT_DOMAIN="${6:-}"
SSL_EMAIL="${7:-}"
ENABLE_SSL_FLAG="${8:-false}"
INSTALL_MONGODB_FLAG="${9:-true}"
ENABLE_UFW_FLAG="${10:-false}"

REMOTE_USER="$(id -un)"
REMOTE_HOME="$(getent passwd "$REMOTE_USER" | cut -d: -f6 || printf '%s' "$HOME")"

if [[ $EUID -ne 0 ]]; then
	if sudo -n true 2>/dev/null; then
		SUDO=(sudo)
	else
		echo "[postdeploy] This script requires root privileges (apt, nginx, firewall)." >&2
		echo "[postdeploy] Re-run with a root user or configure passwordless sudo." >&2
		exit 1
	fi
else
	SUDO=()
fi

if [[ -f "$UPLOAD_PATH" ]]; then
	${SUDO[@]:-} mkdir -p "$(dirname "$ENV_FILE")"
	${SUDO[@]:-} mv "$UPLOAD_PATH" "$ENV_FILE"
	${SUDO[@]:-} chown "$REMOTE_USER":"$REMOTE_USER" "$ENV_FILE" 2>/dev/null || true
	echo "[postdeploy] Updated environment file at $ENV_FILE"
else
	echo "[postdeploy] Expected uploaded env at $UPLOAD_PATH but it was not found." >&2
	exit 1
fi

export DEBIAN_FRONTEND=noninteractive

${SUDO[@]:-} apt-get update -y
${SUDO[@]:-} apt-get install -y nginx

if [[ "$INSTALL_MONGODB_FLAG" != "false" ]]; then
	if ! command -v mongod >/dev/null 2>&1 && ! command -v mongodb >/dev/null 2>&1; then
		OS_CODENAME="jammy"
		if command -v lsb_release >/dev/null 2>&1; then
			OS_CODENAME="$(lsb_release -cs)"
		elif [[ -f /etc/os-release ]]; then
			. /etc/os-release
			OS_CODENAME="${UBUNTU_CODENAME:-${VERSION_CODENAME:-$OS_CODENAME}}"
		fi

		ARCH="$(dpkg --print-architecture)"

		${SUDO[@]:-} apt-get install -y gnupg curl ca-certificates
		${SUDO[@]:-} rm -f /etc/apt/sources.list.d/mongodb-org-*.list || true

		curl -fsSL https://pgp.mongodb.com/server-7.0.asc | ${SUDO[@]:-} gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg
		echo "deb [ arch=${ARCH} signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu ${OS_CODENAME}/mongodb-org/7.0 multiverse" | ${SUDO[@]:-} tee /etc/apt/sources.list.d/mongodb-org-7.0.list >/dev/null
		${SUDO[@]:-} apt-get update -y

		if ! ${SUDO[@]:-} apt-get install -y mongodb-org; then
			echo "[postdeploy] mongodb-org installation failed, attempting distro mongodb package." >&2
			${SUDO[@]:-} apt-get install -y mongodb
		fi
	fi

	if systemctl list-units --type=service | grep -q '^mongod.service'; then
		${SUDO[@]:-} systemctl enable --now mongod
		if ! systemctl is-active --quiet mongod; then
			${SUDO[@]:-} systemctl restart mongod || true
		fi
		${SUDO[@]:-} systemctl enable mongod >/dev/null 2>&1 || true
	elif systemctl list-units --type=service | grep -q '^mongodb.service'; then
		${SUDO[@]:-} systemctl enable --now mongodb
		if ! systemctl is-active --quiet mongodb; then
			${SUDO[@]:-} systemctl restart mongodb || true
		fi
		${SUDO[@]:-} systemctl enable mongodb >/dev/null 2>&1 || true
	fi
fi

${SUDO[@]:-} mkdir -p "$(dirname "$LOG_FILE")"
${SUDO[@]:-} touch "$LOG_FILE"
${SUDO[@]:-} chown "$REMOTE_USER":"$REMOTE_USER" "$LOG_FILE" 2>/dev/null || true

cd "$APP_DIR"

if command -v mongosh >/dev/null 2>&1; then
	PING_CMD="mongosh --quiet --eval 'db.runCommand({ ping: 1 })'"
elif command -v mongo >/dev/null 2>&1; then
	PING_CMD="mongo --quiet --eval 'db.runCommand({ ping: 1 })'"
else
	PING_CMD=""
fi

if [[ -n "$PING_CMD" ]]; then
	i=0
	until eval "$PING_CMD" >/dev/null 2>&1; do
		sleep 2
		i=$((i + 1))
		if [[ $i -ge 15 ]]; then
			echo "[postdeploy] MongoDB is not responding on localhost:27017 after 30s." >&2
			break
		fi
	 done
fi

npm run seed:districts || true

SERVER_NAME="$DOMAIN"
if [[ -z "$SERVER_NAME" ]]; then
	SERVER_NAME="_"
fi

NGINX_CONF=$(cat <<NGINX
server {
		listen 80;
		server_name $SERVER_NAME${ALT_DOMAIN:+ $ALT_DOMAIN};

		location / {
				proxy_pass http://127.0.0.1:3000;
				proxy_http_version 1.1;
				proxy_set_header Upgrade \$http_upgrade;
				proxy_set_header Connection 'upgrade';
				proxy_set_header Host \$host;
				proxy_cache_bypass \$http_upgrade;
		}
}
NGINX
)

${SUDO[@]:-} tee /etc/nginx/sites-available/mgnrega >/dev/null <<<"$NGINX_CONF"
${SUDO[@]:-} ln -sf /etc/nginx/sites-available/mgnrega /etc/nginx/sites-enabled/mgnrega
${SUDO[@]:-} rm -f /etc/nginx/sites-available/mgnrega-insights /etc/nginx/sites-enabled/mgnrega-insights
${SUDO[@]:-} rm -f /etc/nginx/sites-enabled/default
${SUDO[@]:-} nginx -t
${SUDO[@]:-} systemctl enable --now nginx
${SUDO[@]:-} systemctl reload nginx || ${SUDO[@]:-} systemctl restart nginx

if [[ "$ENABLE_SSL_FLAG" == "true" && -n "$DOMAIN" && -n "$SSL_EMAIL" ]]; then
	${SUDO[@]:-} apt-get install -y certbot python3-certbot-nginx
	CERTBOT_DOMAINS=(-d "$DOMAIN")
	if [[ -n "$ALT_DOMAIN" ]]; then
		CERTBOT_DOMAINS+=(-d "$ALT_DOMAIN")
	fi
	${SUDO[@]:-} certbot --nginx --non-interactive --agree-tos --email "$SSL_EMAIL" --redirect "${CERTBOT_DOMAINS[@]}"
fi

CRON_CMD="0 2 * * * /bin/bash $APP_DIR/scripts/cron-sync-data.sh"
TMP_CRON=$(mktemp)
if crontab -l >/dev/null 2>&1; then
	crontab -l > "$TMP_CRON"
fi
grep -Fxq "$CRON_CMD" "$TMP_CRON" || echo "$CRON_CMD" >> "$TMP_CRON"
crontab "$TMP_CRON"
rm "$TMP_CRON"

if [[ "$ENABLE_UFW_FLAG" == "true" ]]; then
	${SUDO[@]:-} apt-get install -y ufw
	${SUDO[@]:-} ufw allow OpenSSH
	if [[ "$ENABLE_SSL_FLAG" == "true" ]]; then
		${SUDO[@]:-} ufw allow 'Nginx Full'
	else
		${SUDO[@]:-} ufw allow 'Nginx HTTP'
	fi
	${SUDO[@]:-} ufw --force enable
fi

${SUDO[@]:-} pm2 save
${SUDO[@]:-} pm2 startup systemd -u "$REMOTE_USER" --hp "$REMOTE_HOME" >/dev/null

echo "[postdeploy] Linode post-deployment tasks complete."
EOF

printf '[postdeploy] Completed remote configuration steps.\n'

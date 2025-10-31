#!/bin/bash
# Setup HTTPS for MGNREGA App using Let's Encrypt
# Usage: ./scripts/setup-https.sh your-domain.com

set -e

if [ -z "$1" ]; then
    echo "Usage: ./scripts/setup-https.sh your-domain.com"
    echo ""
    echo "Note: Make sure your domain's DNS A record points to this server's IP"
    echo "Server IP: $(curl -s ifconfig.me)"
    exit 1
fi

DOMAIN=$1
EMAIL="admin@$DOMAIN"  # Change this if needed

echo "🔒 Setting up HTTPS for $DOMAIN"
echo "📧 Certificate notifications will be sent to: $EMAIL"
echo ""

# Install certbot if not already installed
if ! command -v certbot &> /dev/null; then
    echo "📦 Installing certbot..."
    apt-get update
    apt-get install -y certbot python3-certbot-nginx
fi

# Backup existing nginx config
echo "💾 Backing up nginx config..."
cp /etc/nginx/sites-available/mgnrega /etc/nginx/sites-available/mgnrega.backup

# Update nginx config to include server name
echo "⚙️  Updating nginx configuration..."
cat > /etc/nginx/sites-available/mgnrega << EOF
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Test and reload nginx
echo "🧪 Testing nginx configuration..."
nginx -t

echo "🔄 Reloading nginx..."
systemctl reload nginx

# Obtain SSL certificate
echo "🔐 Obtaining SSL certificate from Let's Encrypt..."
certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email $EMAIL --redirect

echo ""
echo "✅ HTTPS setup complete!"
echo ""
echo "Your site is now available at:"
echo "  🌐 https://$DOMAIN"
echo ""
echo "Certificate will auto-renew. Test renewal with:"
echo "  certbot renew --dry-run"
echo ""
echo "To restore HTTP-only config: cp /etc/nginx/sites-available/mgnrega.backup /etc/nginx/sites-available/mgnrega"

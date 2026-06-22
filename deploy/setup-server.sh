#!/usr/bin/env bash
# DigitalOcean Ubuntu 24.04 — helping_api bootstrap
set -euo pipefail

APP_DIR="/var/www/helping_api"
DB_NAME="p2p_help"
DB_USER="p2phelp"
DB_PASS="${DB_PASS:?Set DB_PASS env var}"

export DEBIAN_FRONTEND=noninteractive

echo "==> System packages"
apt-get update -qq
apt-get install -y -qq curl git nginx ufw build-essential

echo "==> Node.js 20"
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y -qq nodejs
fi

echo "==> MySQL"
if ! command -v mysql >/dev/null 2>&1; then
  apt-get install -y -qq mysql-server
  systemctl enable mysql
  systemctl start mysql
fi

mysql -e "CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -e "CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';"
mysql -e "GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"

echo "==> PM2"
npm install -g pm2

echo "==> Firewall"
ufw allow OpenSSH
ufw allow 'Nginx Full'
echo "y" | ufw enable || true

echo "==> Nginx site"
cat > /etc/nginx/sites-available/helping_api <<'NGINX'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    client_max_body_size 25M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/helping_api /etc/nginx/sites-enabled/helping_api
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

mkdir -p "$APP_DIR"
echo "Server bootstrap complete. App dir: $APP_DIR"

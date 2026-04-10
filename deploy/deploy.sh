#!/bin/bash
# ─────────────────────────────────────────────────────────────────
# Hostinger Deployment Script
# Run this via SSH on your Hostinger server after uploading files.
# ─────────────────────────────────────────────────────────────────

set -e

# Adjust this to your actual Hostinger home directory
HOME_DIR=$(eval echo ~)
BACKEND_DIR="$HOME_DIR/backend"
PUBLIC_HTML="$HOME_DIR/public_html"

echo "=== Paella Experience — Hostinger Deployment ==="
echo "Home: $HOME_DIR"
echo ""

# 1. Backend dependencies
echo "→ Installing Composer dependencies..."
cd "$BACKEND_DIR"
php composer.phar install --no-dev --optimize-autoloader 2>/dev/null || composer install --no-dev --optimize-autoloader

# 2. Laravel setup
echo "→ Running Laravel setup..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan migrate --force

# 3. Storage symlink
echo "→ Creating storage symlink..."
STORAGE_LINK="$PUBLIC_HTML/storage"
if [ -L "$STORAGE_LINK" ]; then
    rm "$STORAGE_LINK"
fi
ln -s "$BACKEND_DIR/storage/app/public" "$STORAGE_LINK"
echo "  Linked: $STORAGE_LINK → $BACKEND_DIR/storage/app/public"

# 4. Permissions
echo "→ Setting permissions..."
chmod -R 775 "$BACKEND_DIR/storage"
chmod -R 775 "$BACKEND_DIR/bootstrap/cache"

echo ""
echo "=== Deployment complete! ==="
echo ""
echo "URLs:"
echo "  Frontend: https://yourdomain.com/"
echo "  Admin:    https://yourdomain.com/admin/"
echo "  API:      https://yourdomain.com/api/"

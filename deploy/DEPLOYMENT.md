# Hostinger Deployment Guide

## Project Structure

```
/home/u.../
├── backend/                    ← Laravel (OUTSIDE public_html)
│   ├── app/
│   ├── bootstrap/
│   ├── config/
│   ├── database/
│   ├── routes/
│   ├── storage/
│   ├── vendor/
│   ├── .env                    ← Production env
│   └── ...
│
├── public_html/                ← Web root (Apache serves this)
│   ├── index.html              ← Frontend SPA
│   ├── assets/                 ← Frontend JS/CSS
│   ├── admin/                  ← Admin SPA
│   │   ├── index.html
│   │   └── assets/
│   ├── api/                    ← Laravel entry point
│   │   ├── index.php
│   │   └── .htaccess
│   ├── storage -> ../backend/storage/app/public
│   └── .htaccess               ← Main routing rules
```

## Step-by-Step Deployment

### 1. Build Frontend (on your local machine)

```bash
cd frontend
npm install
npm run build
```

Output: `frontend/dist/` → contains `index.html` + `assets/`

### 2. Build Admin (on your local machine)

```bash
cd admin
npm install
npm run build
```

Output: `admin/dist/` → contains `index.html` + `assets/`

### 3. Upload to Hostinger

Using File Manager or FTP:

| Local Source | Hostinger Destination |
|---|---|
| `frontend/dist/*` | `/public_html/` (root level) |
| `admin/dist/*` | `/public_html/admin/` |
| `deploy/public_html/.htaccess` | `/public_html/.htaccess` |
| `deploy/public_html/api/` | `/public_html/api/` |
| `backend/` (entire folder) | `/backend/` (OUTSIDE public_html) |

### 4. Configure Backend .env

Edit `/backend/.env` on the server:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com

DB_HOST=your_hostinger_db_host
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
```

### 5. Run Deployment Script (via SSH)

```bash
chmod +x ~/deploy.sh
bash ~/deploy.sh
```

Or manually:

```bash
cd ~/backend
composer install --no-dev --optimize-autoloader
php artisan config:cache
php artisan route:cache
php artisan migrate --force
ln -s ~/backend/storage/app/public ~/public_html/storage
chmod -R 775 storage bootstrap/cache
```

## URLs

| Page | URL |
|---|---|
| Frontend | `https://yourdomain.com/` |
| Admin Panel | `https://yourdomain.com/admin/` |
| API | `https://yourdomain.com/api/` |

## Updating Frontend API URL

If your domain changes, update `frontend/.env.production`:

```env
VITE_API_URL=https://yourdomain.com/api
```

Then rebuild: `cd frontend && npm run build`

## Local Development

Start all three services:

```bash
# Terminal 1 — Laravel API
cd backend && php artisan serve

# Terminal 2 — Frontend (port 5173)
cd frontend && npm run dev

# Terminal 3 — Admin (port 5174)
cd admin && npm run dev
```

Both React apps proxy `/api` to `localhost:8000` during development.

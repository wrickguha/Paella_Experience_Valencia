<?php

/**
 * Laravel API Entry Point for Hostinger Shared Hosting.
 *
 * Deployment layout on Hostinger:
 *
 *   /home/u123456789/
 *   ├── backend/                ← Full Laravel project (OUTSIDE public_html)
 *   │   ├── app/
 *   │   ├── bootstrap/
 *   │   ├── config/
 *   │   ├── vendor/
 *   │   └── ...
 *   ├── public_html/            ← Web-accessible root
 *   │   ├── index.html          ← Frontend SPA (from frontend/dist/)
 *   │   ├── assets/             ← Frontend assets
 *   │   ├── admin/              ← Admin SPA (from admin/dist/)
 *   │   │   ├── index.html
 *   │   │   └── assets/
 *   │   ├── api/                ← THIS file
 *   │   │   ├── index.php       ← ← YOU ARE HERE
 *   │   │   └── .htaccess
 *   │   ├── storage/            ← Symlink to backend/storage/app/public
 *   │   └── .htaccess
 */

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Paths relative to this file: public_html/api/index.php
// Backend lives at: /home/u.../backend/
$backendPath = dirname(__DIR__, 2) . '/backend';

// Maintenance mode
if (file_exists($maintenance = $backendPath . '/storage/framework/maintenance.php')) {
    require $maintenance;
}

// Composer autoloader
require $backendPath . '/vendor/autoload.php';

// Bootstrap Laravel
/** @var Application $app */
$app = require_once $backendPath . '/bootstrap/app.php';

// Override the public path so Laravel resolves assets correctly
$app->usePublicPath(dirname(__DIR__));

$app->handleRequest(Request::capture());

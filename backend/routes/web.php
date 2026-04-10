<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Admin SPA
|--------------------------------------------------------------------------
*/

Route::get('/admin/{any?}', function () {
    $adminEntry = public_path('admin/index.html');

    if (! file_exists($adminEntry)) {
        return response()->json([
            'message' => 'Admin build not found.',
            'next_step' => 'Run npm run build from the admin/ directory.',
        ], 503);
    }

    return response()->file($adminEntry);
})->where('any', '.*');

/*
|--------------------------------------------------------------------------
| Frontend SPA
|--------------------------------------------------------------------------
*/

// Serve frontend built assets (js/css/images) from backend/public/frontend/assets/
// This allows 127.0.0.1:8000 to work locally alongside localhost:5173
Route::get('/assets/{path}', function ($path) {
    $file = public_path('frontend/assets/' . $path);
    if (! file_exists($file)) {
        abort(404);
    }
    return response()->file($file);
})->where('path', '.*');

Route::get('/', function () {
    $frontendEntry = public_path('frontend/index.html');

    if (! file_exists($frontendEntry)) {
        return response()->json([
            'message' => 'Frontend build not found.',
            'next_step' => 'Run npm run build from the frontend/ directory.',
            'api_base_url' => url('/api'),
        ], 503);
    }

    return response()->file($frontendEntry);
});

Route::get('/{any}', function () {
    $frontendEntry = public_path('frontend/index.html');

    if (! file_exists($frontendEntry)) {
        abort(503, 'Frontend build not found. Run npm run build from the frontend/ directory.');
    }

    return response()->file($frontendEntry);
})->where('any', '^(?!api|admin|assets|storage|_debugbar).*$');


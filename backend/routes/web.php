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

Route::get('/', function () {
    $frontendEntry = public_path('frontend/index.html');

    if (! file_exists($frontendEntry)) {
        return response()->json([
            'message' => 'Frontend build not found.',
            'next_step' => 'Run npm run build from the project root to publish the React app into Laravel public/frontend.',
            'api_base_url' => url('/api'),
        ], 503);
    }

    return response()->file($frontendEntry);
});

Route::get('/{any}', function () {
    $frontendEntry = public_path('frontend/index.html');

    if (! file_exists($frontendEntry)) {
        abort(503, 'Frontend build not found. Run npm run build from the project root.');
    }

    return response()->file($frontendEntry);
})->where('any', '^(?!api|admin|storage|_debugbar).*$');

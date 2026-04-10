<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Gallery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GalleryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $lang = $request->query('lang', 'en');
        $type = $request->query('type'); // homepage, experience, location

        $query = Gallery::active()->orderBy('sort_order');

        if ($type) {
            $query->ofType($type);
        }

        $images = $query->get()->map(fn ($img) => [
            'id' => $img->id,
            'image' => $img->image,
            'alt' => $lang === 'es' ? ($img->alt_es ?? $img->alt_en) : $img->alt_en,
            'type' => $img->type,
        ]);

        return response()->json([
            'success' => true,
            'data' => $images,
        ]);
    }
}

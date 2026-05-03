<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LeadController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Lead::latest();

        if ($request->has('source')) {
            $query->where('source', $request->query('source'));
        }

        $leads = $query->paginate(30);

        return response()->json([
            'success' => true,
            'data'    => $leads,
        ]);
    }

    public function stats(): JsonResponse
    {
        $stats = Lead::selectRaw('source, COUNT(*) as count')
            ->groupBy('source')
            ->pluck('count', 'source');

        return response()->json([
            'success' => true,
            'data'    => $stats,
        ]);
    }
}

<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\API\StoreLeadRequest;
use App\Models\Lead;
use Illuminate\Http\JsonResponse;

class LeadController extends Controller
{
    /**
     * POST /api/leads — track a CTA interaction (WhatsApp click, etc.)
     */
    public function store(StoreLeadRequest $request): JsonResponse
    {
        Lead::create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Lead tracked.',
        ], 201);
    }
}

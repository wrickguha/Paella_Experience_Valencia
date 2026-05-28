<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    public function validate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50'],
        ]);

        $coupon = Coupon::active()
            ->where('code', strtoupper(trim($validated['code'])))
            ->first();

        if (! $coupon) {
            return response()->json(['valid' => false, 'message' => 'Coupon code is invalid or inactive.'], 404);
        }

        return response()->json([
            'valid' => true,
            'code' => $coupon->code,
            'discount_percent' => $coupon->discount_percent,
        ]);
    }
}

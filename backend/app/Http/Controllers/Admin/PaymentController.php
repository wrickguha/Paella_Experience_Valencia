<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        $query = Payment::with('booking');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return $query->orderBy('created_at', 'desc')
            ->paginate(20)
            ->through(fn ($p) => [
                'id' => $p->id,
                'booking_id' => $p->booking_id,
                'booking_reference' => $p->booking?->reference ?? '',
                'customer_name' => $p->booking ? $p->booking->first_name . ' ' . $p->booking->last_name : '',
                'payment_method' => $p->payment_method,
                'transaction_id' => $p->transaction_id,
                'paypal_order_id' => $p->paypal_order_id,
                'amount' => $p->amount,
                'status' => $p->status,
                'created_at' => $p->created_at,
            ]);
    }

    public function show($id)
    {
        $p = Payment::with('booking')->findOrFail($id);

        return response()->json([
            'id' => $p->id,
            'booking_id' => $p->booking_id,
            'booking_reference' => $p->booking?->reference,
            'customer_name' => $p->booking ? $p->booking->first_name . ' ' . $p->booking->last_name : '',
            'payment_method' => $p->payment_method,
            'transaction_id' => $p->transaction_id,
            'paypal_order_id' => $p->paypal_order_id,
            'amount' => $p->amount,
            'status' => $p->status,
            'response_json' => $p->response_json,
            'created_at' => $p->created_at,
        ]);
    }
}

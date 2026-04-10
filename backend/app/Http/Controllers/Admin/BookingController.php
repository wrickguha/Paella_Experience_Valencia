<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function index(Request $request)
    {
        $query = Booking::with(['location', 'experience']);

        if ($request->filled('date')) {
            $query->where('date', $request->date);
        }
        if ($request->filled('status')) {
            $query->where('payment_status', $request->status);
        }
        if ($request->filled('location_id')) {
            $query->where('location_id', $request->location_id);
        }

        return $query->orderBy('created_at', 'desc')
            ->paginate(20)
            ->through(fn ($b) => [
                'id' => $b->id,
                'reference' => $b->reference,
                'first_name' => $b->first_name,
                'last_name' => $b->last_name,
                'email' => $b->email,
                'phone' => $b->phone,
                'location_name' => $b->location?->name_en ?? '',
                'experience_name' => $b->experience?->title_en ?? '',
                'date' => $b->date,
                'time' => $b->time,
                'guests' => $b->guests,
                'total_price' => $b->total_price,
                'payment_status' => $b->payment_status,
                'created_at' => $b->created_at,
            ]);
    }

    public function show($id)
    {
        $b = Booking::with(['location', 'experience', 'payment'])->findOrFail($id);

        return response()->json([
            'id' => $b->id,
            'reference' => $b->reference,
            'first_name' => $b->first_name,
            'last_name' => $b->last_name,
            'email' => $b->email,
            'phone' => $b->phone,
            'location_name' => $b->location?->name_en,
            'experience_name' => $b->experience?->title_en,
            'date' => $b->date,
            'time' => $b->time,
            'guests' => $b->guests,
            'total_price' => $b->total_price,
            'payment_status' => $b->payment_status,
            'payment' => $b->payment,
            'created_at' => $b->created_at,
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'payment_status' => 'required|in:paid,pending,failed,refunded',
        ]);

        $booking = Booking::findOrFail($id);
        $booking->update(['payment_status' => $request->payment_status]);

        return response()->json(['message' => 'Status updated', 'payment_status' => $request->payment_status]);
    }
}

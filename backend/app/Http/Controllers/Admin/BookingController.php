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
        if ($request->filled('booking_status')) {
            $query->where('status', $request->booking_status);
        }
        if ($request->filled('location_id')) {
            $query->where('location_id', $request->location_id);
        }
        if ($request->filled('min_guests')) {
            $query->where('guests', '>=', $request->min_guests);
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
                'status' => $b->status ?? 'pending',
                'language_preference' => $b->language_preference,
                'notes' => $b->notes,
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
            'status' => $b->status ?? 'pending',
            'language_preference' => $b->language_preference,
            'notes' => $b->notes,
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

    public function updateBookingStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,confirmed,cancelled',
        ]);

        $booking = Booking::findOrFail($id);
        $booking->update(['status' => $request->status]);

        return response()->json(['message' => 'Booking status updated', 'status' => $request->status]);
    }

    public function updateNotes(Request $request, $id)
    {
        $request->validate([
            'notes' => 'nullable|string|max:1000',
        ]);

        $booking = Booking::findOrFail($id);
        $booking->update(['notes' => $request->notes]);

        return response()->json(['message' => 'Notes updated']);
    }
}

<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\AvailabilitySlot;
use App\Services\BookingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BookingController extends Controller
{
    public function __construct(private BookingService $bookingService) {}

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

    public function store(Request $request)
    {
        $request->validate([
            'first_name'          => 'required|string|max:100',
            'last_name'           => 'required|string|max:100',
            'email'               => 'required|email|max:191',
            'phone'               => 'nullable|string|max:30',
            'location_id'         => 'required|integer|exists:locations,id',
            'experience_id'       => 'required|integer|exists:experiences,id',
            'date'                => 'required|date',
            'time'                => 'required|string',
            'guests'              => 'required|integer|min:1|max:20',
            'payment_status'      => 'required|in:paid,pending,failed,refunded',
            'payment_method'      => 'nullable|string|max:50',
            'language_preference' => 'nullable|in:spanish,english,both',
            'notes'               => 'nullable|string|max:1000',
        ]);

        try {
            $data = $request->only([
                'first_name', 'last_name', 'email', 'phone',
                'location_id', 'experience_id', 'date', 'time',
                'guests', 'language_preference', 'notes',
            ]);

            // BookingService creates with payment_status='pending'; we override after
            $booking = $this->bookingService->createBooking($data);

            $update = ['payment_status' => $request->payment_status];
            if ($request->payment_status === 'paid') {
                $update['status'] = 'confirmed';
            }
            if ($request->filled('payment_method')) {
                $update['payment_id'] = 'manual-' . strtolower($request->payment_method);
            }
            $booking->update($update);

            if ($request->payment_status === 'paid' && $booking->availabilitySlot) {
                $booking->availabilitySlot->increment('booked_slots', $booking->guests);
            }

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Booking created successfully.',
            'data' => [
                'id'        => $booking->id,
                'reference' => $booking->reference,
            ],
        ], 201);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'payment_status' => 'required|in:paid,pending,failed,refunded',
        ]);

        $booking = Booking::with('availabilitySlot')->findOrFail($id);
        $oldStatus = $booking->payment_status;
        $newStatus = $request->payment_status;

        // Slot states: reserved = paid only, released = pending/failed/refunded
        $reserved = ['paid'];
        $released  = ['pending', 'failed', 'refunded'];

        DB::transaction(function () use ($booking, $oldStatus, $newStatus, $reserved, $released) {
            if (in_array($oldStatus, $released) && in_array($newStatus, $reserved)) {
                // Re-acquire slots that were previously released
                if ($booking->availabilitySlot) {
                    $booking->availabilitySlot->increment('booked_slots', $booking->guests);
                }
            } elseif (in_array($oldStatus, $reserved) && in_array($newStatus, $released)) {
                // Release the reserved slots
                if ($booking->availabilitySlot) {
                    $booking->availabilitySlot->decrement('booked_slots', max(0, $booking->guests));
                }
            }
            $booking->update(['payment_status' => $newStatus]);
        });

        return response()->json(['message' => 'Status updated', 'payment_status' => $newStatus]);
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

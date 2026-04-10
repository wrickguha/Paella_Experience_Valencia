<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Experience;
use App\Models\AvailabilitySlot;
use App\Models\Payment;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats()
    {
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $lastMonthStart = $now->copy()->subMonth()->startOfMonth();
        $lastMonthEnd = $now->copy()->subMonth()->endOfMonth();

        $totalBookings = Booking::count();
        $thisMonthBookings = Booking::where('created_at', '>=', $startOfMonth)->count();
        $lastMonthBookings = Booking::whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])->count();

        $totalRevenue = Payment::where('status', 'completed')->sum('amount');
        $thisMonthRevenue = Payment::where('status', 'completed')->where('created_at', '>=', $startOfMonth)->sum('amount');
        $lastMonthRevenue = Payment::where('status', 'completed')->whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])->sum('amount');

        $upcomingEvents = AvailabilitySlot::where('date', '>=', $now->toDateString())
            ->where('is_blocked', false)
            ->count();

        $totalGuests = Booking::where('payment_status', 'paid')->sum('guests');

        return response()->json([
            'total_bookings' => $totalBookings,
            'bookings_trend' => $lastMonthBookings > 0
                ? round(($thisMonthBookings - $lastMonthBookings) / $lastMonthBookings * 100, 1)
                : 0,
            'total_revenue' => $totalRevenue,
            'revenue_trend' => $lastMonthRevenue > 0
                ? round(($thisMonthRevenue - $lastMonthRevenue) / $lastMonthRevenue * 100, 1)
                : 0,
            'upcoming_events' => $upcomingEvents,
            'total_guests' => $totalGuests,
        ]);
    }

    public function recentBookings()
    {
        $bookings = Booking::with(['location', 'experience'])
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get()
            ->map(fn ($b) => [
                'id' => $b->id,
                'reference' => $b->reference,
                'first_name' => $b->first_name,
                'last_name' => $b->last_name,
                'email' => $b->email,
                'location_name' => $b->location?->name_en ?? '',
                'date' => $b->date,
                'time' => $b->time,
                'guests' => $b->guests,
                'total_price' => $b->total_price,
                'payment_status' => $b->payment_status,
            ]);

        return response()->json($bookings);
    }

    public function revenueChart()
    {
        $data = Payment::where('status', 'completed')
            ->where('created_at', '>=', Carbon::now()->subMonths(6)->startOfMonth())
            ->select(
                DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'),
                DB::raw('SUM(amount) as total')
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return response()->json($data);
    }
}

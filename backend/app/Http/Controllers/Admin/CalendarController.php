<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AvailabilitySlot;
use App\Models\Location;
use Carbon\Carbon;
use Illuminate\Http\Request;

class CalendarController extends Controller
{
    public function month(Request $request)
    {
        $request->validate([
            'year' => 'required|integer',
            'month' => 'required|integer|between:1,12',
            'location_id' => 'nullable|exists:locations,id',
        ]);

        $year = $request->year;
        $month = $request->month;
        $start = Carbon::create($year, $month, 1)->startOfDay();
        $end = $start->copy()->endOfMonth()->endOfDay();

        $query = AvailabilitySlot::with('location')
            ->whereBetween('date', [$start->toDateString(), $end->toDateString()]);

        if ($request->location_id) {
            $query->where('location_id', $request->location_id);
        }

        $slots = $query->orderBy('date')->orderBy('start_time')->get();

        $events = $slots->map(fn ($s) => [
            'date' => $s->date instanceof Carbon ? $s->date->toDateString() : $s->date,
            'location_id' => $s->location_id,
            'location' => $s->location?->name_en ?? '',
            'start_time' => $s->start_time,
            'end_time' => $s->end_time,
            'total_slots' => $s->total_slots,
            'booked_slots' => $s->booked_slots,
            'available_slots' => max(0, $s->total_slots - $s->booked_slots),
            'is_available' => !$s->is_blocked && ($s->total_slots - $s->booked_slots) > 0,
            'is_blocked' => (bool) $s->is_blocked,
            'slot_id' => $s->id,
        ]);

        return response()->json(['events' => $events]);
    }

    public function slots(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
            'location_id' => 'nullable|exists:locations,id',
        ]);

        $query = AvailabilitySlot::with('location')
            ->where('date', $request->date);

        if ($request->location_id) {
            $query->where('location_id', $request->location_id);
        }

        return response()->json($query->orderBy('start_time')->get());
    }

    public function createSlot(Request $request)
    {
        $data = $request->validate([
            'location_id' => 'required|exists:locations,id',
            'date' => 'required|date',
            'start_time' => 'required',
            'end_time' => 'required',
            'total_slots' => 'required|integer|min:1',
        ]);

        $slot = AvailabilitySlot::create(array_merge($data, [
            'booked_slots' => 0,
            'is_blocked' => false,
        ]));

        return response()->json($slot, 201);
    }

    public function updateSlot(Request $request, $id)
    {
        $slot = AvailabilitySlot::findOrFail($id);

        $data = $request->validate([
            'start_time' => 'nullable',
            'end_time' => 'nullable',
            'total_slots' => 'nullable|integer|min:1',
        ]);

        $slot->update($data);

        return response()->json($slot);
    }

    public function deleteSlot($id)
    {
        $slot = AvailabilitySlot::findOrFail($id);
        $slot->delete();

        return response()->json(['message' => 'Deleted']);
    }

    public function blockDate(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
            'location_id' => 'required|exists:locations,id',
        ]);

        $slot = AvailabilitySlot::where('date', $request->date)
            ->where('location_id', $request->location_id)
            ->first();

        if ($slot) {
            $slot->update(['is_blocked' => true]);
        } else {
            $slot = AvailabilitySlot::create([
                'location_id' => $request->location_id,
                'date' => $request->date,
                'start_time' => '00:00',
                'end_time' => '23:59',
                'total_slots' => 0,
                'booked_slots' => 0,
                'is_blocked' => true,
            ]);
        }

        return response()->json($slot);
    }

    public function unblockDate(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
            'location_id' => 'required|exists:locations,id',
        ]);

        AvailabilitySlot::where('date', $request->date)
            ->where('location_id', $request->location_id)
            ->update(['is_blocked' => false]);

        return response()->json(['message' => 'Unblocked']);
    }
}

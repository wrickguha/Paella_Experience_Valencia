<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\CalendarService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CalendarController extends Controller
{
    public function __construct(
        private CalendarService $calendarService,
    ) {}

    /**
     * GET /api/calendar?location_id=&year=&month=
     * If no location_id, returns all locations combined.
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'location_id' => ['nullable', 'integer', 'exists:locations,id'],
            'year' => ['nullable', 'integer', 'min:2024', 'max:2030'],
            'month' => ['nullable', 'integer', 'min:1', 'max:12'],
        ]);

        $year = (int) $request->query('year', now()->year);
        $month = (int) $request->query('month', now()->month);
        $locationId = $request->query('location_id');

        if ($locationId) {
            $calendar = $this->calendarService->getMonthCalendar((int) $locationId, $year, $month);
        } else {
            $calendar = $this->calendarService->getAllLocationsCalendar($year, $month);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'year' => $year,
                'month' => $month,
                'events' => $calendar,
            ],
        ]);
    }

    /**
     * GET /api/availability?date=&location_id=
     */
    public function availability(Request $request): JsonResponse
    {
        $request->validate([
            'date' => ['required', 'date'],
            'location_id' => ['required', 'integer', 'exists:locations,id'],
        ]);

        $slots = $this->calendarService->getAvailability(
            (int) $request->query('location_id'),
            $request->query('date'),
        );

        return response()->json([
            'success' => true,
            'data' => $slots,
        ]);
    }
}

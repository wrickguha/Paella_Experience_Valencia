import { useState, useEffect } from 'react';
import { fetchCalendarMonth } from '@/services/api';
import type { CalendarEvent } from '@/services/api';

export interface UseCalendarMonthResult {
  events: CalendarEvent[];
  loading: boolean;
  error: string | null;
}

/**
 * Fetches available calendar events from the Laravel API for a specific month.
 * month is 0-indexed (JS convention), as with the Date object.
 */
export function useCalendarMonth(year: number, month: number): UseCalendarMonthResult {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchCalendarMonth(year, month)
      .then((data) => {
        if (!cancelled) setEvents(data);
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load availability');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [year, month]);

  return { events, loading, error };
}

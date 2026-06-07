import { useState, useEffect } from 'react';
import { fetchCalendarMonth } from '@/services/api';
import type { CalendarEvent } from '@/services/api';

export interface UseCalendarMonthResult {
  events: CalendarEvent[];
  loading: boolean;
  error: string | null;
}

// Module-level Promise cache: concurrent/repeated calls reuse the same in-flight request.
// React 18 StrictMode double-invokes effects — the Promise cache deduplicates network
// requests without blocking the effect from running on every mount.
const cache = new Map<string, Promise<CalendarEvent[]>>();

export function fetchCalendarMonthCached(year: number, month: number): Promise<CalendarEvent[]> {
  const key = `${year}-${month}`;
  if (!cache.has(key)) {
    cache.set(
      key,
      fetchCalendarMonth(year, month).catch((err) => {
        // Evict failed entries so they can be retried
        cache.delete(key);
        throw err;
      })
    );
  }
  return cache.get(key)!;
}

/**
 * Fetches available calendar events for a given month (month is 0-indexed, JS convention).
 * Results are cached at the Promise level to avoid duplicate network requests.
 */
export function useCalendarMonth(year: number, month: number): UseCalendarMonthResult {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setEvents([]);

    fetchCalendarMonthCached(year, month)
      .then((data) => {
        if (!cancelled) {
          setEvents(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Failed to load availability');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [year, month]); // eslint-disable-line react-hooks/exhaustive-deps

  return { events, loading, error };
}

export const mockExperiences = [
  {
    id: 1,
    name: 'Classic Paella',
    price: 79,
    duration: '3 hours',
    description: 'The essential Valencian paella experience',
    features: [
      'Guided market visit',
      'Traditional paella cooking',
      'Full meal with wine',
      'Recipe booklet to take home',
    ],
    image: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=800&q=80',
  },
  {
    id: 2,
    name: 'Premium Experience',
    price: 119,
    duration: '4.5 hours',
    description: 'The complete culinary journey',
    popular: true,
    features: [
      'Everything in Classic',
      'Tapas & sangria welcome',
      'Two paella varieties',
      'Dessert making class',
      'Professional photos',
      'Priority booking',
    ],
    image: 'https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=800&q=80',
  },
  {
    id: 3,
    name: 'Private Group',
    price: 149,
    duration: '5 hours',
    description: 'Exclusive private experience for your group',
    features: [
      'Everything in Premium',
      'Private chef & venue',
      'Custom menu options',
      'Up to 12 guests',
      'Champagne toast',
      'Video recording',
    ],
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
  },
];

export const mockGalleryImages = [
  {
    src: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=600&q=80',
    alt: 'Paella cooking over open fire',
  },
  {
    src: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80',
    alt: 'Fresh ingredients at Mercado Central',
  },
  {
    src: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80',
    alt: 'Beautiful terrace dining',
  },
  {
    src: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&q=80',
    alt: 'Chef preparing ingredients',
  },
  {
    src: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=600&q=80',
    alt: 'Group enjoying the experience',
  },
  {
    src: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=600&q=80',
    alt: 'Finished paella dish',
  },
];

// ── Location-based availability ────────────────────────────────────
export type LocationId = 'bloom' | 'magnolia';

export interface Location {
  id: LocationId;
  nameKey: string;
  image: string;
  pricePerPerson: number;
  /** 0 = Sunday, 6 = Saturday – JS Date convention */
  allowedDays: number[];
}

export const locations: Location[] = [
  {
    id: 'bloom',
    nameKey: 'booking.location.bloomGallery',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=800&q=80',
    pricePerPerson: 59,
    allowedDays: [6], // Saturday only
  },
  {
    id: 'magnolia',
    nameKey: 'booking.location.casaMagnolia',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    pricePerPerson: 99,
    allowedDays: [0, 1, 2, 3, 4, 5], // Most days (not Saturday)
  },
];

export interface TimeSlot {
  time: string;
  spotsLeft: number;
}

export interface DayAvailability {
  date: string;
  slots: TimeSlot[];
}

/**
 * Generate mock availability for the given location for a specific month.
 * Bloom Gallery → only Saturdays, single 12:00 slot.
 * Casa Magnolia → Sun-Fri, single 13:00 slot.
 */
export function getMockAvailability(
  locationId: LocationId,
  year: number,
  month: number, // 0-indexed
): DayAvailability[] {
  const loc = locations.find((l) => l.id === locationId);
  if (!loc) return [];

  const result: DayAvailability[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    if (date < today) continue; // skip past dates
    if (!loc.allowedDays.includes(date.getDay())) continue;

    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    if (locationId === 'bloom') {
      result.push({
        date: dateStr,
        slots: [{ time: '12:00', spotsLeft: 6 + Math.floor(Math.random() * 6) }],
      });
    } else {
      result.push({
        date: dateStr,
        slots: [{ time: '13:00', spotsLeft: 4 + Math.floor(Math.random() * 8) }],
      });
    }
  }

  return result;
}

// Keep old mock for backward compat (other pages reference it)
export const mockAvailability = [
  { date: '2026-04-15', times: ['10:00', '15:00', '18:00'], spotsLeft: 8 },
  { date: '2026-04-16', times: ['10:00', '15:00'], spotsLeft: 4 },
  { date: '2026-04-17', times: ['10:00', '15:00', '18:00'], spotsLeft: 12 },
  { date: '2026-04-18', times: ['10:00', '18:00'], spotsLeft: 6 },
  { date: '2026-04-19', times: ['10:00', '15:00', '18:00'], spotsLeft: 10 },
  { date: '2026-04-20', times: ['10:00', '15:00'], spotsLeft: 2 },
  { date: '2026-04-21', times: ['10:00', '15:00', '18:00'], spotsLeft: 12 },
];

// ── Combined calendar availability (all locations) ─────────────────
export interface CalendarEvent {
  date: string;
  locationId: LocationId;
  locationName: string;
  time: string;
  spotsLeft: number;
  pricePerPerson: number;
  image: string;
}

/**
 * Returns the next `count` upcoming events across all locations,
 * starting from today. Used by the Upcoming Events section.
 */
export function getUpcomingEvents(count: number): CalendarEvent[] {
  const today = new Date();
  const allEvents: CalendarEvent[] = [];

  // Gather events for current month + next two months to have enough
  for (let offset = 0; offset <= 2; offset++) {
    const d = new Date(today.getFullYear(), today.getMonth() + offset, 1);
    allEvents.push(...getAllEventsForMonth(d.getFullYear(), d.getMonth()));
  }

  // Filter to future events only, sort by date ascending
  return allEvents
    .filter((e) => new Date(e.date) >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, count);
}

/**
 * Returns combined events for ALL locations for a given month.
 * Used by the calendar-first booking view.
 */
export function getAllEventsForMonth(year: number, month: number): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  for (const loc of locations) {
    const avails = getMockAvailability(loc.id, year, month);
    for (const day of avails) {
      for (const slot of day.slots) {
        events.push({
          date: day.date,
          locationId: loc.id,
          locationName: loc.id === 'bloom' ? 'Bloom Gallery' : 'Casa Magnolia',
          time: slot.time,
          spotsLeft: slot.spotsLeft,
          pricePerPerson: loc.pricePerPerson,
          image: loc.image,
        });
      }
    }
  }
  return events;
}

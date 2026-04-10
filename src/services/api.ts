import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Shared domain types ────────────────────────────────────────────
export type LocationId = 'bloom' | 'magnolia';

export interface CalendarEvent {
  date: string;
  locationId: LocationId;
  locationName: string;
  time: string;
  spotsLeft: number;
  pricePerPerson: number;
  image: string;
}

// ── Internal types (backend response shapes) ───────────────────────
interface ApiLocation {
  id: number;
  name: string;
  image: string;
  price: number | null;
}

interface BackendCalendarEvent {
  date: string;
  location_id: number;
  location: string;
  start_time: string;
  available_slots: number;
  is_available: boolean;
}

// ── Location data cache (fetched once per session) ─────────────────
let _locationCache: ApiLocation[] | null = null;

async function getLocations(): Promise<ApiLocation[]> {
  if (_locationCache) return _locationCache;
  const res = await apiClient.get('/locations', { params: { lang: 'en' } });
  _locationCache = res.data.data as ApiLocation[];
  return _locationCache;
}

function slugFromName(name: string): LocationId {
  return name.toLowerCase().includes('magnolia') ? 'magnolia' : 'bloom';
}

// ── Calendar API ───────────────────────────────────────────────────
/**
 * Fetch all available CalendarEvents for a given month (0-indexed, JS convention).
 */
export async function fetchCalendarMonth(year: number, month: number): Promise<CalendarEvent[]> {
  const [calRes, locations] = await Promise.all([
    apiClient.get('/calendar', { params: { year, month: month + 1 } }), // API uses 1-indexed months
    getLocations(),
  ]);

  const raw: BackendCalendarEvent[] = calRes.data.data.events ?? [];

  return raw
    .filter((e) => e.is_available)
    .map((e) => {
      const loc = locations.find((l) => l.id === e.location_id);
      return {
        date: e.date,
        locationId: slugFromName(e.location),
        locationName: e.location,
        time: e.start_time.substring(0, 5), // "12:00:00" → "12:00"
        spotsLeft: e.available_slots,
        pricePerPerson: loc?.price ?? 59,
        image: loc?.image ?? '',
      };
    });
}

// ── Gallery API ────────────────────────────────────────────────────
export interface GalleryImage {
  src: string;
  alt: string;
}

export async function fetchGallery(type = 'homepage', lang = 'en'): Promise<GalleryImage[]> {
  const res = await apiClient.get('/gallery', { params: { type, lang } });
  return (res.data.data as { image: string; alt: string }[]).map((img) => ({
    src: img.image,
    alt: img.alt,
  }));
}

// ── Legacy typed API methods ───────────────────────────────────────
export interface Experience {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: string;
  features: string[];
  image: string;
}

export const experienceApi = {
  getAll: (lang = 'en') => apiClient.get<Experience[]>('/experiences', { params: { lang } }),
  getById: (id: number, lang = 'en') => apiClient.get<Experience>(`/experiences/${id}`, { params: { lang } }),
};

export const bookingApi = {
  create: (payload: Record<string, unknown>) => apiClient.post('/booking/create', payload),
};

export const paymentApi = {
  capturePayPal: (paypalOrderId: string) =>
    apiClient.post('/payment/paypal', { paypal_order_id: paypalOrderId }),
};

export default apiClient;

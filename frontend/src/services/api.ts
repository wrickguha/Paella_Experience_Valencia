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
  locationNumericId: number;
  experienceId: number;
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

interface ApiExperience {
  id: number;
  location: { id: number } | null;
}

interface BackendCalendarEvent {
  date: string;
  location_id: number;
  location: string;
  experience_id: number | null;
  experience_price: number;
  start_time: string;
  available_slots: number;
  is_available: boolean;
}

// ── Location data cache (fetched once per session) ─────────────────
let _locationCache: ApiLocation[] | null = null;
let _experienceCache: ApiExperience[] | null = null;

async function getLocations(): Promise<ApiLocation[]> {
  if (_locationCache) return _locationCache;
  const res = await apiClient.get('/locations', { params: { lang: 'en' } });
  _locationCache = res.data.data as ApiLocation[];
  return _locationCache;
}

async function getExperiences(): Promise<ApiExperience[]> {
  if (_experienceCache) return _experienceCache;
  const res = await apiClient.get('/experiences', { params: { lang: 'en' } });
  _experienceCache = res.data.data as ApiExperience[];
  return _experienceCache;
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
        locationNumericId: e.location_id,
        experienceId: e.experience_id ?? 0,
        locationName: e.location,
        time: e.start_time.substring(0, 5), // "12:00:00" → "12:00"
        spotsLeft: e.available_slots,
        pricePerPerson: e.experience_price || loc?.price || 59,
        image: loc?.image ?? '',
      };
    });
}

// ── Locations API (public) ────────────────────────────────────────
export interface LocationSchedule {
  day_of_week: number;
  start_time: string;
  end_time: string;
}

export interface FrontendLocation {
  id: number;
  name: string;
  subtitle: string | null;
  description: string;
  address: string;
  image: string | null;
  hero_image: string | null;
  gallery: string[];
  availability_type: string;
  price: number | null;
  features: string[];
  schedules: LocationSchedule[];
}

export async function fetchLocations(lang = 'en'): Promise<FrontendLocation[]> {
  const res = await apiClient.get('/locations', { params: { lang } });
  return res.data.data as FrontendLocation[];
}

// ── Testimonials API ──────────────────────────────────────────────
export interface Testimonial {
  id: number;
  name: string;
  location: string;
  review: string;
  rating: number;
  avatar: string | null;
}

export async function fetchTestimonials(lang = 'en'): Promise<Testimonial[]> {
  const res = await apiClient.get('/testimonials', { params: { lang } });
  return res.data.data as Testimonial[];
}

// ── FAQ API ───────────────────────────────────────────────────────
export interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

export async function fetchFaqs(lang = 'en'): Promise<FaqItem[]> {
  const res = await apiClient.get('/faqs', { params: { lang } });
  return res.data.data as FaqItem[];
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

// ── User Auth API ──────────────────────────────────────────────────
export interface AuthUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface UserBooking {
  id: number;
  reference: string;
  date: string;
  time: string;
  location: string;
  experience: string;
  guests: number;
  total_price: string;
  payment_status: string;
  created_at: string;
}

export const authApi = {
  register: (data: { name: string; email: string; phone?: string; password: string; password_confirmation: string }) =>
    apiClient.post<AuthResponse>('/register', data),
  login: (data: { email: string; password: string }) =>
    apiClient.post<AuthResponse>('/login', data),
  getUser: () => apiClient.get<AuthUser>('/user'),
  logout: () => apiClient.post('/logout'),
  updateProfile: (data: Record<string, string>) => apiClient.put('/profile/update', data),
  getBookings: () => apiClient.get<{ data: UserBooking[] }>('/user/bookings'),
};

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
  createOrder: (bookingId: number) =>
    apiClient.post('/payment/create-order', { booking_id: bookingId }),
  capture: (orderId: string) =>
    apiClient.post('/payment/capture', { order_id: orderId }),
};

// ── About API ──────────────────────────────────────────────────────
export interface AboutSection {
  id: number;
  section_key: string;
  title: string | null;
  subtitle: string | null;
  content: string | null;
  image: string | null;
  cta_text: string | null;
  cta_link: string | null;
  sort_order: number;
}

export interface AboutData {
  hero?: AboutSection;
  story?: AboutSection;
  philosophy?: AboutSection;
  differentiators?: AboutSection[];
  team?: AboutSection;
  whylove?: AboutSection[];
  cta?: AboutSection;
  [key: string]: AboutSection | AboutSection[] | undefined;
}

export async function fetchAbout(lang = 'en'): Promise<AboutData> {
  const res = await apiClient.get('/about', { params: { lang } });
  return res.data.data as AboutData;
}

export default apiClient;

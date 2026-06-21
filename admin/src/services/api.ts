import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  },
);

export default api;

// ── Auth ──
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/admin/login', { email, password }),
};

// ── Dashboard ──
export const dashboardApi = {
  stats: () => api.get('/admin/dashboard/stats'),
  recentBookings: () => api.get('/admin/dashboard/recent-bookings'),
  revenueChart: () => api.get('/admin/dashboard/revenue-chart'),
};

// ── Experiences ──
export const experiencesApi = {
  list: (page = 1) => api.get(`/admin/experiences?page=${page}`),
  get: (id: number) => api.get(`/admin/experiences/${id}`),
  create: (data: FormData) => api.post('/admin/experiences', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: number, data: FormData) => api.post(`/admin/experiences/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id: number) => api.delete(`/admin/experiences/${id}`),
};

// ── Locations ──
export const locationsApi = {
  list: (page = 1) => api.get(`/admin/locations?page=${page}`),
  get: (id: number) => api.get(`/admin/locations/${id}`),
  create: (data: FormData) => api.post('/admin/locations', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: number, data: FormData) => api.post(`/admin/locations/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id: number) => api.delete(`/admin/locations/${id}`),
  all: () => api.get('/admin/locations/all'),
};

// ── Calendar / Availability ──
export const calendarApi = {
  month: (year: number, month: number, locationId?: number) =>
    api.get('/admin/calendar/month', { params: { year, month, location_id: locationId } }),
  slots: (date: string, locationId?: number) =>
    api.get('/admin/calendar/slots', { params: { date, location_id: locationId } }),
  createSlot: (data: object) => api.post('/admin/calendar/slots', data),
  updateSlot: (id: number, data: object) => api.put(`/admin/calendar/slots/${id}`, data),
  deleteSlot: (id: number) => api.delete(`/admin/calendar/slots/${id}`),
  blockDate: (data: object) => api.post('/admin/calendar/block', data),
  unblockDate: (data: object) => api.post('/admin/calendar/unblock', data),
};

// ── Bookings ──
export const bookingsApi = {
  list: (params?: Record<string, string | number>) => api.get('/admin/bookings', { params }),
  get: (id: number) => api.get(`/admin/bookings/${id}`),
  create: (data: object) => api.post('/admin/bookings', data),
  updateStatus: (id: number, status: string) => api.put(`/admin/bookings/${id}/status`, { payment_status: status }),
  updateBookingStatus: (id: number, status: string) => api.put(`/admin/bookings/${id}/booking-status`, { status }),
  updateNotes: (id: number, notes: string) => api.put(`/admin/bookings/${id}/notes`, { notes }),
};

// ── Coupons ──
export const couponsApi = {
  list: () => api.get('/admin/coupons'),
  create: (data: object) => api.post('/admin/coupons', data),
  delete: (id: number) => api.delete(`/admin/coupons/${id}`),
};

// ── Payments ──
export const paymentsApi = {
  list: (params?: Record<string, string | number>) => api.get('/admin/payments', { params }),
  get: (id: number) => api.get(`/admin/payments/${id}`),
};

// ── Gallery ──
export const galleryApi = {
  list: (params?: Record<string, string | number>) => api.get('/admin/gallery', { params }),
  create: (data: FormData) => api.post('/admin/gallery', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: number, data: FormData) => api.post(`/admin/gallery/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id: number) => api.delete(`/admin/gallery/${id}`),
  reorder: (ids: number[]) => api.post('/admin/gallery/reorder', { ids }),
};

// ── Testimonials ──
export const testimonialsApi = {
  list: (page = 1) => api.get(`/admin/testimonials?page=${page}`),
  get: (id: number) => api.get(`/admin/testimonials/${id}`),
  create: (data: object) => api.post('/admin/testimonials', data),
  update: (id: number, data: object) => api.put(`/admin/testimonials/${id}`, data),
  delete: (id: number) => api.delete(`/admin/testimonials/${id}`),
};

// ── FAQs ──
export const faqsApi = {
  list: (page = 1) => api.get(`/admin/faqs?page=${page}`),
  get: (id: number) => api.get(`/admin/faqs/${id}`),
  create: (data: object) => api.post('/admin/faqs', data),
  update: (id: number, data: object) => api.put(`/admin/faqs/${id}`, data),
  delete: (id: number) => api.delete(`/admin/faqs/${id}`),
};

// ── Settings ──
export const settingsApi = {
  list: (group?: string) => api.get('/admin/settings', { params: { group } }),
  update: (data: FormData | Record<string, string>) => {
    if (data instanceof FormData) {
      return api.post('/admin/settings', data, { headers: { 'Content-Type': 'multipart/form-data' } });
    }
    return api.post('/admin/settings', { settings: data });
  },
};

// ── About Sections ──
export const aboutApi = {
  list: (page = 1) => api.get(`/admin/about?page=${page}`),
  create: (data: FormData) => api.post('/admin/about', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: number, data: FormData) => api.post(`/admin/about/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id: number) => api.delete(`/admin/about/${id}`),
  reorder: (ids: number[]) => api.post('/admin/about/reorder', { ids }),
};

// ── Contact Messages ──
export const messagesApi = {
  list: (params?: Record<string, string | number>) => api.get('/admin/messages', { params }),
  get: (id: number) => api.get(`/admin/messages/${id}`),
  markRead: (id: number) => api.put(`/admin/messages/${id}/read`),
  markUnread: (id: number) => api.put(`/admin/messages/${id}/unread`),
  toggleResolved: (id: number) => api.put(`/admin/messages/${id}/toggle-resolved`),
  delete: (id: number) => api.delete(`/admin/messages/${id}`),
  unreadCount: () => api.get('/admin/messages/unread-count'),
};

// ── Activities ──
export const activitiesApi = {
  list: () => api.get('/admin/activities'),
  create: (data: object) => api.post('/admin/activities', data),
  update: (id: number, data: object) => api.put(`/admin/activities/${id}`, data),
  delete: (id: number) => api.delete(`/admin/activities/${id}`),
};

// ── Community Members ──
export const communityApi = {
  list: (params?: Record<string, string | number>) => api.get('/admin/community', { params }),
  update: (id: number, data: object) => api.put(`/admin/community/${id}`, data),
  delete: (id: number) => api.delete(`/admin/community/${id}`),
};

// ── Language Sessions ──
export const languageSessionsApi = {
  list: () => api.get('/admin/language-sessions'),
  create: (data: object) => api.post('/admin/language-sessions', data),
  update: (id: number, data: object) => api.put(`/admin/language-sessions/${id}`, data),
  delete: (id: number) => api.delete(`/admin/language-sessions/${id}`),
};

// ── Leads ──
export const leadsApi = {
  list: (params?: Record<string, string | number>) => api.get('/admin/leads', { params }),
  stats: () => api.get('/admin/leads/stats'),
};


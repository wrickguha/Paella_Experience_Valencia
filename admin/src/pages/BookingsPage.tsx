import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Eye, BookOpen, Plus } from 'lucide-react';
import { bookingsApi, locationsApi, experiencesApi, calendarApi } from '@/services/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import PageHeader, { Card, Button, Badge, Spinner, EmptyState } from '@/components/ui';
import DataTable, { Pagination } from '@/components/DataTable';
import { Modal } from '@/components/Modal';
import { FormInput, FormSelect, FormTextarea } from '@/components/FormFields';

interface Booking {
  id: number;
  reference: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  total_price: number;
  payment_status: string;
  status: string;
  language_preference: string | null;
  notes: string | null;
  location_name: string;
  experience_name: string;
  created_at: string;
}

interface Location { id: number; name_en: string; }
interface Experience { id: number; title_en: string; price: number; }
interface Slot { id: number; start_time: string; remaining: number; }

const PAYMENT_VARIANT: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
  paid: 'success', pending: 'warning', failed: 'danger', refunded: 'info',
};

const BOOKING_VARIANT: Record<string, 'success' | 'warning' | 'danger'> = {
  confirmed: 'success', pending: 'warning', cancelled: 'danger',
};

const EMPTY_FORM = {
  first_name: '', last_name: '', email: '', phone: '',
  location_id: '', experience_id: '', date: '', time: '',
  guests: '1', payment_status: 'paid', payment_method: 'cash',
  language_preference: '', notes: '',
};

export default function BookingsPage() {
  const [data, setData] = useState<Booking[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ date: '', status: '', booking_status: '' });
  const [detail, setDetail] = useState<Booking | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [editNotes, setEditNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  // Manual booking creation state
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [locations, setLocations] = useState<Location[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page };
      if (filters.date) params.date = filters.date;
      if (filters.status) params.status = filters.status;
      if (filters.booking_status) params.booking_status = filters.booking_status;
      const res = await bookingsApi.list(params);
      setData(res.data.data || res.data);
      setLastPage(res.data.last_page || 1);
    } catch { /* empty */ }
    setLoading(false);
  }, [page, filters]);

  useEffect(() => { fetch(); }, [fetch]);

  // Load locations + experiences once when create modal opens
  useEffect(() => {
    if (!createOpen) return;
    locationsApi.all().then((r) => setLocations(r.data?.data ?? r.data ?? [])).catch(() => {});
    experiencesApi.list(1).then((r) => setExperiences(r.data?.data ?? [])).catch(() => {});
  }, [createOpen]);

  // Reload available slots when date or location changes
  useEffect(() => {
    if (!form.date || !form.location_id) { setSlots([]); return; }
    setLoadingSlots(true);
    const d = new Date(form.date);
    // Use the calendar month endpoint which merges schedule + actual slot data
    calendarApi.month(d.getFullYear(), d.getMonth() + 1, Number(form.location_id))
      .then((r) => {
        type CalEvent = { date: string; start_time: string; available_slots: number; slot_id: number | null; is_available: boolean };
        const events: CalEvent[] = r.data?.events ?? [];
        const forDate = events.filter((e) => e.date === form.date);
        setSlots(forDate.map((e) => ({
          id: e.slot_id ?? 0,
          start_time: e.start_time,
          remaining: e.available_slots,
        })));
      })
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [form.date, form.location_id]);

  const handlePaymentStatus = async (id: number, status: string) => {
    setUpdatingStatus(true);
    try {
      await bookingsApi.updateStatus(id, status);
      fetch();
      if (detail?.id === id) setDetail({ ...detail, payment_status: status });
    } catch { /* empty */ }
    setUpdatingStatus(false);
  };

  const handleBookingStatus = async (id: number, status: string) => {
    setUpdatingStatus(true);
    try {
      await bookingsApi.updateBookingStatus(id, status);
      fetch();
      if (detail?.id === id) setDetail({ ...detail, status });
    } catch { /* empty */ }
    setUpdatingStatus(false);
  };

  const handleSaveNotes = async () => {
    if (!detail) return;
    setSavingNotes(true);
    try {
      await bookingsApi.updateNotes(detail.id, editNotes);
      setDetail({ ...detail, notes: editNotes });
      fetch();
    } catch { /* empty */ }
    setSavingNotes(false);
  };

  const openDetail = (b: Booking) => {
    setDetail(b);
    setEditNotes(b.notes || '');
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    setCreating(true);
    try {
      await bookingsApi.create({
        ...form,
        location_id: Number(form.location_id),
        experience_id: Number(form.experience_id),
        guests: Number(form.guests),
        language_preference: form.language_preference || undefined,
        notes: form.notes || undefined,
        payment_method: form.payment_method || undefined,
      });
      setCreateOpen(false);
      setForm({ ...EMPTY_FORM });
      fetch();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setCreateError(msg || 'Failed to create booking. Please check the details.');
    }
    setCreating(false);
  };

  const columns = [
    {
      key: 'reference', header: 'Ref',
      render: (r: Booking) => <span className="font-mono text-xs text-primary">{r.reference.slice(0, 8)}</span>,
    },
    {
      key: 'name', header: 'Customer',
      render: (r: Booking) => (<div><p className="font-medium">{r.first_name} {r.last_name}</p><p className="text-xs text-neutral-gray">{r.email}</p></div>),
    },
    { key: 'location_name', header: 'Location' },
    { key: 'date', header: 'Date', render: (r: Booking) => formatDate(r.date) },
    { key: 'time', header: 'Time', render: (r: Booking) => r.time?.slice(0, 5) },
    { key: 'guests', header: 'Guests', className: 'text-center' },
    { key: 'total_price', header: 'Amount', render: (r: Booking) => formatCurrency(r.total_price) },
    {
      key: 'payment_status', header: 'Payment',
      render: (r: Booking) => <Badge variant={PAYMENT_VARIANT[r.payment_status] || 'default'}>{r.payment_status}</Badge>,
    },
    {
      key: 'status', header: 'Booking',
      render: (r: Booking) => <Badge variant={BOOKING_VARIANT[r.status] || 'warning'}>{r.status || 'pending'}</Badge>,
    },
    {
      key: 'actions', header: '', className: 'w-12',
      render: (r: Booking) => (
        <button onClick={() => openDetail(r)} className="p-1.5 rounded-lg hover:bg-gray-100 text-neutral-gray hover:text-primary">
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Bookings" description="View and manage all bookings">
        <Button onClick={() => { setForm({ ...EMPTY_FORM }); setCreateError(''); setCreateOpen(true); }}>
          <Plus className="w-4 h-4 mr-1" /> Add Booking
        </Button>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <FormInput label="" type="date" value={filters.date} onChange={(e) => { setFilters({ ...filters, date: e.target.value }); setPage(1); }} />
        <FormSelect label="" value={filters.status} onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setPage(1); }}
          options={[{ value: '', label: 'All Payments' }, { value: 'paid', label: 'Paid' }, { value: 'pending', label: 'Pending' }, { value: 'failed', label: 'Failed' }, { value: 'refunded', label: 'Refunded' }]}
        />
        <FormSelect label="" value={filters.booking_status} onChange={(e) => { setFilters({ ...filters, booking_status: e.target.value }); setPage(1); }}
          options={[{ value: '', label: 'All Bookings' }, { value: 'pending', label: 'Pending' }, { value: 'confirmed', label: 'Confirmed' }, { value: 'cancelled', label: 'Cancelled' }]}
        />
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          {loading ? <Spinner /> : data.length === 0 ? (
            <EmptyState icon={<BookOpen className="w-10 h-10" />} title="No bookings found" />
          ) : (
            <>
              <DataTable columns={columns} data={data} />
              <Pagination page={page} lastPage={lastPage} onPageChange={setPage} />
            </>
          )}
        </Card>
      </motion.div>

      {/* ── Create Manual Booking Modal ── */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add Manual Booking" size="lg">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {createError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{createError}</div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <FormInput label="First Name" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} required />
            <FormInput label="Last Name" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <FormInput label="Phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormSelect
              label="Location"
              value={form.location_id}
              onChange={(e) => setForm({ ...form, location_id: e.target.value, time: '' })}
              options={[{ value: '', label: 'Select location…' }, ...locations.map((l) => ({ value: l.id, label: l.name_en }))]}
              required
            />
            <FormSelect
              label="Experience"
              value={form.experience_id}
              onChange={(e) => setForm({ ...form, experience_id: e.target.value })}
              options={[{ value: '', label: 'Select experience…' }, ...experiences.map((x) => ({ value: x.id, label: x.title_en }))]}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Date"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value, time: '' })}
              required
            />
            <div>
              <label className="block text-sm font-medium text-neutral-dark mb-1.5">Time / Slot</label>
              {loadingSlots ? (
                <p className="text-sm text-neutral-gray py-2">Loading slots…</p>
              ) : slots.length > 0 ? (
                <select
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  required
                >
                  <option value="">Select time…</option>
                  {slots.map((s) => (
                    <option key={s.id} value={s.start_time}>
                      {s.start_time.slice(0, 5)} — {s.remaining} spot{s.remaining !== 1 ? 's' : ''} left
                    </option>
                  ))}
                </select>
              ) : (
                <FormInput
                  label=""
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  placeholder="HH:MM"
                  required
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <FormInput
              label="Guests"
              type="number"
              min="1"
              max="20"
              value={form.guests}
              onChange={(e) => setForm({ ...form, guests: e.target.value })}
              required
            />
            <FormSelect
              label="Payment Status"
              value={form.payment_status}
              onChange={(e) => setForm({ ...form, payment_status: e.target.value })}
              options={[
                { value: 'paid', label: 'Paid' },
                { value: 'pending', label: 'Pending' },
              ]}
            />
            <FormSelect
              label="Payment Method"
              value={form.payment_method}
              onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
              options={[
                { value: 'cash', label: 'Cash' },
                { value: 'bank_transfer', label: 'Bank Transfer' },
                { value: 'card', label: 'Card' },
                { value: 'other', label: 'Other' },
              ]}
            />
          </div>

          <FormSelect
            label="Language Preference"
            value={form.language_preference}
            onChange={(e) => setForm({ ...form, language_preference: e.target.value })}
            options={[
              { value: '', label: 'No preference' },
              { value: 'spanish', label: 'Spanish' },
              { value: 'english', label: 'English' },
              { value: 'both', label: 'Both' },
            ]}
          />

          <FormTextarea
            label="Notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Any notes about this booking…"
          />

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-200">
            <Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button type="submit" loading={creating}>Create Booking</Button>
          </div>
        </form>
      </Modal>

      {/* ── Detail Modal ── */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title="Booking Details" size="lg">
        {detail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-neutral-gray">Reference:</span><p className="font-mono font-medium">{detail.reference}</p></div>
              <div><span className="text-neutral-gray">Payment:</span><p><Badge variant={PAYMENT_VARIANT[detail.payment_status]}>{detail.payment_status}</Badge></p></div>
              <div><span className="text-neutral-gray">Name:</span><p className="font-medium">{detail.first_name} {detail.last_name}</p></div>
              <div><span className="text-neutral-gray">Email:</span><p>{detail.email}</p></div>
              <div><span className="text-neutral-gray">Phone:</span><p>{detail.phone || '—'}</p></div>
              <div><span className="text-neutral-gray">Location:</span><p>{detail.location_name}</p></div>
              <div><span className="text-neutral-gray">Date:</span><p>{formatDate(detail.date)}</p></div>
              <div><span className="text-neutral-gray">Time:</span><p>{detail.time?.slice(0, 5)}</p></div>
              <div><span className="text-neutral-gray">Guests:</span><p>{detail.guests}</p></div>
              <div><span className="text-neutral-gray">Amount:</span><p className="font-bold text-primary">{formatCurrency(detail.total_price)}</p></div>
              <div><span className="text-neutral-gray">Language Pref:</span><p>{detail.language_preference || '—'}</p></div>
              <div><span className="text-neutral-gray">Booking Status:</span><p><Badge variant={BOOKING_VARIANT[detail.status] || 'warning'}>{detail.status || 'pending'}</Badge></p></div>
            </div>

            {/* Booking Status */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm font-medium text-neutral-dark mb-2">Booking Status</p>
              <div className="flex flex-wrap gap-2">
                {['pending', 'confirmed', 'cancelled'].map((s) => (
                  <Button key={s} variant={detail.status === s ? 'primary' : 'secondary'} size="sm" onClick={() => handleBookingStatus(detail.id, s)} loading={updatingStatus} disabled={detail.status === s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Payment Status */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm font-medium text-neutral-dark mb-2">Payment Status</p>
              <div className="flex flex-wrap gap-2">
                {['paid', 'pending', 'failed', 'refunded'].map((s) => (
                  <Button key={s} variant={detail.payment_status === s ? 'primary' : 'secondary'} size="sm" onClick={() => handlePaymentStatus(detail.id, s)} loading={updatingStatus} disabled={detail.payment_status === s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Admin Notes */}
            <div className="pt-4 border-t border-gray-200">
              <FormTextarea label="Admin Notes" value={editNotes} onChange={(e) => setEditNotes(e.target.value)} placeholder="Add notes about this booking..." />
              <div className="flex justify-end mt-2">
                <Button size="sm" onClick={handleSaveNotes} loading={savingNotes}>Save Notes</Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

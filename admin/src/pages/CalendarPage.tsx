import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Lock,
  Unlock,
} from 'lucide-react';
import { calendarApi, locationsApi } from '@/services/api';
import PageHeader, { Card, Button, Badge, Spinner } from '@/components/ui';
import { Modal } from '@/components/Modal';
import { FormInput, FormSelect } from '@/components/FormFields';
import { cn } from '@/lib/utils';

interface CalendarDay {
  date: string;
  location_id: number;
  location: string;
  start_time: string;
  end_time: string;
  total_slots: number;
  booked_slots: number;
  available_slots: number;
  is_available: boolean;
  is_blocked: boolean;
  slot_id: number | null;
}

interface SlotForm {
  location_id: number;
  date: string;
  start_time: string;
  end_time: string;
  total_slots: number;
}

interface Loc {
  id: number;
  name_en: string;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function CalendarPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [locationFilter, setLocationFilter] = useState<number | undefined>(undefined);
  const [locations, setLocations] = useState<Loc[]>([]);
  const [events, setEvents] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);

  // Slot modal
  const [slotModalOpen, setSlotModalOpen] = useState(false);
  const [slotForm, setSlotForm] = useState<SlotForm>({
    location_id: 0, date: '', start_time: '12:00', end_time: '16:00', total_slots: 12,
  });
  const [savingSlot, setSavingSlot] = useState(false);

  // Day detail modal
  const [dayDetail, setDayDetail] = useState<{ date: string; slots: CalendarDay[] } | null>(null);

  const [blockingDate, setBlockingDate] = useState(false);

  const fetchMonth = useCallback(async () => {
    setLoading(true);
    try {
      const [calRes, locRes] = await Promise.all([
        calendarApi.month(year, month, locationFilter),
        locationsApi.all(),
      ]);
      setEvents(calRes.data.data?.events || calRes.data.events || []);
      setLocations(locRes.data.data || locRes.data);
    } catch { /* empty */ }
    setLoading(false);
  }, [year, month, locationFilter]);

  useEffect(() => { fetchMonth(); }, [fetchMonth]);

  const prevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  };

  // Calendar grid computation
  const firstDay = new Date(year, month - 1, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1; // Monday-based
  const daysInMonth = new Date(year, month, 0).getDate();

  const getEventsForDay = (day: number): CalendarDay[] => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  const handleDayClick = (day: number) => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const slots = getEventsForDay(day);
    setDayDetail({ date: dateStr, slots });
  };

  const openSlotModal = (date?: string) => {
    setSlotForm({
      location_id: locations[0]?.id || 0,
      date: date || '',
      start_time: '12:00',
      end_time: '16:00',
      total_slots: 12,
    });
    setSlotModalOpen(true);
  };

  const handleCreateSlot = async () => {
    setSavingSlot(true);
    try {
      await calendarApi.createSlot(slotForm);
      setSlotModalOpen(false);
      fetchMonth();
    } catch { /* empty */ }
    setSavingSlot(false);
  };

  const handleBlockDate = async (date: string, locationId: number) => {
    setBlockingDate(true);
    try {
      await calendarApi.blockDate({ date, location_id: locationId });
      fetchMonth();
      if (dayDetail) {
        const slots = getEventsForDay(parseInt(date.split('-')[2]));
        setDayDetail({ ...dayDetail, slots });
      }
    } catch { /* empty */ }
    setBlockingDate(false);
  };

  const handleUnblockDate = async (date: string, locationId: number) => {
    setBlockingDate(true);
    try {
      await calendarApi.unblockDate({ date, location_id: locationId });
      fetchMonth();
    } catch { /* empty */ }
    setBlockingDate(false);
  };

  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  return (
    <div>
      <PageHeader title="Calendar & Availability" description="Manage available dates, slots, and blocked dates">
        <Button onClick={() => openSlotModal()}>
          <Plus className="w-4 h-4" /> Add Slot
        </Button>
      </PageHeader>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-6">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-semibold text-neutral-dark min-w-[180px] text-center">
                {MONTHS[month - 1]} {year}
              </h2>
              <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <FormSelect
                label=""
                value={locationFilter || ''}
                onChange={(e) => setLocationFilter(e.target.value ? parseInt(e.target.value) : undefined)}
                options={[
                  { value: '', label: 'All Locations' },
                  ...locations.map(l => ({ value: l.id, label: l.name_en })),
                ]}
              />
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mb-4 text-xs">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-primary/20 border border-primary/40" /> Bloom Gallery</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-100 border border-emerald-400" /> Casa Magnolia</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-100 border border-red-300" /> Blocked</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-gray-100 border border-gray-300" /> No Slots</span>
          </div>

          {loading ? (
            <Spinner />
          ) : (
            <>
              {/* Day headers */}
              <div className="grid grid-cols-7 mb-1">
                {DAYS.map(d => (
                  <div key={d} className="text-center text-xs font-medium text-neutral-gray uppercase py-2">
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Offset */}
                {Array.from({ length: offset }).map((_, i) => (
                  <div key={`off-${i}`} className="aspect-square" />
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const dayEvents = getEventsForDay(day);
                  const isPast = dateStr < today;
                  const hasBloom = dayEvents.some(e => e.location_id === 1 && !e.is_blocked);
                  const hasMagnolia = dayEvents.some(e => e.location_id === 2 && !e.is_blocked);
                  const isBlocked = dayEvents.some(e => e.is_blocked);
                  const totalBooked = dayEvents.reduce((s, e) => s + e.booked_slots, 0);

                  return (
                    <button
                      key={day}
                      onClick={() => handleDayClick(day)}
                      className={cn(
                        'aspect-square rounded-lg p-1 flex flex-col items-center justify-center gap-0.5 text-xs transition-all border',
                        isPast && 'opacity-40 cursor-default',
                        isBlocked && 'bg-red-50 border-red-200',
                        !isBlocked && dayEvents.length > 0 && 'bg-white border-gray-200 hover:border-primary cursor-pointer',
                        !isBlocked && dayEvents.length === 0 && 'bg-gray-50 border-transparent',
                        dateStr === today && 'ring-2 ring-primary/40',
                      )}
                    >
                      <span className={cn('font-medium', dateStr === today && 'text-primary')}>{day}</span>
                      {dayEvents.length > 0 && (
                        <div className="flex gap-0.5">
                          {hasBloom && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                          {hasMagnolia && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                          {isBlocked && <Lock className="w-2.5 h-2.5 text-danger" />}
                        </div>
                      )}
                      {totalBooked > 0 && !isBlocked && (
                        <span className="text-[10px] text-neutral-gray">{totalBooked} booked</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </Card>
      </motion.div>

      {/* Day Detail Modal */}
      <Modal
        open={!!dayDetail}
        onClose={() => setDayDetail(null)}
        title={dayDetail ? `Slots for ${dayDetail.date}` : ''}
        size="lg"
      >
        {dayDetail && (
          <div className="space-y-3">
            {dayDetail.slots.length === 0 ? (
              <div className="text-center py-6 text-neutral-gray">
                <p className="mb-3">No slots for this date</p>
                <Button size="sm" onClick={() => { setDayDetail(null); openSlotModal(dayDetail.date); }}>
                  <Plus className="w-4 h-4" /> Add Slot
                </Button>
              </div>
            ) : (
              dayDetail.slots.map((slot, i) => (
                <div key={i} className={cn(
                  'flex items-center justify-between p-4 rounded-lg border',
                  slot.is_blocked ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200',
                )}>
                  <div>
                    <p className="font-medium text-sm">{slot.location}</p>
                    <p className="text-sm text-neutral-gray">{slot.start_time?.slice(0, 5)} – {slot.end_time?.slice(0, 5)}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant={slot.is_blocked ? 'danger' : slot.available_slots > 0 ? 'success' : 'warning'}>
                        {slot.is_blocked ? 'Blocked' : `${slot.available_slots} / ${slot.total_slots} available`}
                      </Badge>
                      {slot.booked_slots > 0 && (
                        <Badge variant="info">{slot.booked_slots} booked</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {slot.is_blocked ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUnblockDate(dayDetail.date, slot.location_id)}
                        loading={blockingDate}
                      >
                        <Unlock className="w-4 h-4" /> Unblock
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleBlockDate(dayDetail.date, slot.location_id)}
                        loading={blockingDate}
                      >
                        <Lock className="w-4 h-4" /> Block
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
            <div className="pt-3 border-t border-gray-200">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => { setDayDetail(null); openSlotModal(dayDetail.date); }}
              >
                <Plus className="w-4 h-4" /> Add Another Slot
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Slot Modal */}
      <Modal
        open={slotModalOpen}
        onClose={() => setSlotModalOpen(false)}
        title="Create Availability Slot"
        size="md"
      >
        <div className="space-y-4">
          <FormSelect
            label="Location"
            value={slotForm.location_id}
            onChange={(e) => setSlotForm({ ...slotForm, location_id: parseInt(e.target.value) })}
            options={locations.map(l => ({ value: l.id, label: l.name_en }))}
          />
          <FormInput
            label="Date"
            type="date"
            value={slotForm.date}
            onChange={(e) => setSlotForm({ ...slotForm, date: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Start Time"
              type="time"
              value={slotForm.start_time}
              onChange={(e) => setSlotForm({ ...slotForm, start_time: e.target.value })}
            />
            <FormInput
              label="End Time"
              type="time"
              value={slotForm.end_time}
              onChange={(e) => setSlotForm({ ...slotForm, end_time: e.target.value })}
            />
          </div>
          <FormInput
            label="Total Slots"
            type="number"
            min={1}
            value={slotForm.total_slots}
            onChange={(e) => setSlotForm({ ...slotForm, total_slots: parseInt(e.target.value) || 1 })}
          />
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={() => setSlotModalOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateSlot} loading={savingSlot}>Create Slot</Button>
        </div>
      </Modal>
    </div>
  );
}

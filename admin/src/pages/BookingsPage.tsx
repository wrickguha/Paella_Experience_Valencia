import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Eye, BookOpen } from 'lucide-react';
import { bookingsApi } from '@/services/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import PageHeader, { Card, Button, Badge, Spinner, EmptyState } from '@/components/ui';
import DataTable, { Pagination } from '@/components/DataTable';
import { Modal } from '@/components/Modal';
import { FormInput, FormSelect } from '@/components/FormFields';

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
  location_name: string;
  experience_name: string;
  created_at: string;
}

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
  paid: 'success', pending: 'warning', failed: 'danger', refunded: 'info',
};

export default function BookingsPage() {
  const [data, setData] = useState<Booking[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ date: '', status: '' });
  const [detail, setDetail] = useState<Booking | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page };
      if (filters.date) params.date = filters.date;
      if (filters.status) params.status = filters.status;
      const res = await bookingsApi.list(params);
      setData(res.data.data || res.data);
      setLastPage(res.data.last_page || 1);
    } catch { /* empty */ }
    setLoading(false);
  }, [page, filters]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleStatusUpdate = async (id: number, status: string) => {
    setUpdatingStatus(true);
    try {
      await bookingsApi.updateStatus(id, status);
      fetch();
      if (detail?.id === id) setDetail({ ...detail, payment_status: status });
    } catch { /* empty */ }
    setUpdatingStatus(false);
  };

  const columns = [
    {
      key: 'reference',
      header: 'Ref',
      render: (r: Booking) => <span className="font-mono text-xs text-primary">{r.reference.slice(0, 8)}</span>,
    },
    {
      key: 'name',
      header: 'Customer',
      render: (r: Booking) => (
        <div>
          <p className="font-medium">{r.first_name} {r.last_name}</p>
          <p className="text-xs text-neutral-gray">{r.email}</p>
        </div>
      ),
    },
    { key: 'location_name', header: 'Location' },
    { key: 'date', header: 'Date', render: (r: Booking) => formatDate(r.date) },
    { key: 'time', header: 'Time', render: (r: Booking) => r.time?.slice(0, 5) },
    { key: 'guests', header: 'Guests', className: 'text-center' },
    { key: 'total_price', header: 'Amount', render: (r: Booking) => formatCurrency(r.total_price) },
    {
      key: 'payment_status',
      header: 'Status',
      render: (r: Booking) => <Badge variant={STATUS_VARIANT[r.payment_status] || 'default'}>{r.payment_status}</Badge>,
    },
    {
      key: 'actions',
      header: '',
      className: 'w-12',
      render: (r: Booking) => (
        <button onClick={() => setDetail(r)} className="p-1.5 rounded-lg hover:bg-gray-100 text-neutral-gray hover:text-primary">
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Bookings" description="View and manage all bookings" />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <FormInput
          label=""
          type="date"
          value={filters.date}
          onChange={(e) => { setFilters({ ...filters, date: e.target.value }); setPage(1); }}
          placeholder="Filter by date"
        />
        <FormSelect
          label=""
          value={filters.status}
          onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setPage(1); }}
          options={[
            { value: '', label: 'All Statuses' },
            { value: 'paid', label: 'Paid' },
            { value: 'pending', label: 'Pending' },
            { value: 'failed', label: 'Failed' },
            { value: 'refunded', label: 'Refunded' },
          ]}
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

      {/* Detail Modal */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title="Booking Details" size="md">
        {detail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-neutral-gray">Reference:</span><p className="font-mono font-medium">{detail.reference}</p></div>
              <div><span className="text-neutral-gray">Status:</span><p><Badge variant={STATUS_VARIANT[detail.payment_status]}>{detail.payment_status}</Badge></p></div>
              <div><span className="text-neutral-gray">Name:</span><p className="font-medium">{detail.first_name} {detail.last_name}</p></div>
              <div><span className="text-neutral-gray">Email:</span><p>{detail.email}</p></div>
              <div><span className="text-neutral-gray">Phone:</span><p>{detail.phone || '—'}</p></div>
              <div><span className="text-neutral-gray">Location:</span><p>{detail.location_name}</p></div>
              <div><span className="text-neutral-gray">Date:</span><p>{formatDate(detail.date)}</p></div>
              <div><span className="text-neutral-gray">Time:</span><p>{detail.time?.slice(0, 5)}</p></div>
              <div><span className="text-neutral-gray">Guests:</span><p>{detail.guests}</p></div>
              <div><span className="text-neutral-gray">Amount:</span><p className="font-bold text-primary">{formatCurrency(detail.total_price)}</p></div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm font-medium text-neutral-dark mb-2">Update Status</p>
              <div className="flex flex-wrap gap-2">
                {['paid', 'pending', 'failed', 'refunded'].map((s) => (
                  <Button
                    key={s}
                    variant={detail.payment_status === s ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => handleStatusUpdate(detail.id, s)}
                    loading={updatingStatus}
                    disabled={detail.payment_status === s}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

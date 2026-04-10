import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Eye } from 'lucide-react';
import { paymentsApi } from '@/services/api';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import PageHeader, { Card, Badge, Spinner, EmptyState } from '@/components/ui';
import DataTable, { Pagination } from '@/components/DataTable';
import { Modal } from '@/components/Modal';
import { FormSelect } from '@/components/FormFields';

interface Payment {
  id: number;
  booking_id: number;
  booking_reference: string;
  customer_name: string;
  payment_method: string;
  transaction_id: string;
  paypal_order_id: string;
  amount: number;
  status: string;
  created_at: string;
}

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
  completed: 'success', approved: 'success', created: 'info', failed: 'danger', refunded: 'warning',
};

export default function PaymentsPage() {
  const [data, setData] = useState<Payment[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [detail, setDetail] = useState<Payment | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page };
      if (statusFilter) params.status = statusFilter;
      const res = await paymentsApi.list(params);
      setData(res.data.data || res.data);
      setLastPage(res.data.last_page || 1);
    } catch { /* empty */ }
    setLoading(false);
  }, [page, statusFilter]);

  useEffect(() => { fetch(); }, [fetch]);

  const columns = [
    {
      key: 'transaction_id',
      header: 'Transaction ID',
      render: (r: Payment) => <span className="font-mono text-xs">{r.transaction_id || r.paypal_order_id || '—'}</span>,
    },
    {
      key: 'booking_reference',
      header: 'Booking',
      render: (r: Payment) => <span className="font-mono text-xs text-primary">{r.booking_reference?.slice(0, 8)}</span>,
    },
    { key: 'customer_name', header: 'Customer' },
    { key: 'payment_method', header: 'Method' },
    { key: 'amount', header: 'Amount', render: (r: Payment) => formatCurrency(r.amount) },
    {
      key: 'status',
      header: 'Status',
      render: (r: Payment) => <Badge variant={STATUS_VARIANT[r.status] || 'default'}>{r.status}</Badge>,
    },
    { key: 'created_at', header: 'Date', render: (r: Payment) => formatDateTime(r.created_at) },
    {
      key: 'actions',
      header: '',
      className: 'w-12',
      render: (r: Payment) => (
        <button onClick={() => setDetail(r)} className="p-1.5 rounded-lg hover:bg-gray-100 text-neutral-gray hover:text-primary">
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Payments" description="View all payment transactions" />

      <div className="mb-4">
        <FormSelect
          label=""
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          options={[
            { value: '', label: 'All Statuses' },
            { value: 'completed', label: 'Completed' },
            { value: 'approved', label: 'Approved' },
            { value: 'created', label: 'Created' },
            { value: 'failed', label: 'Failed' },
            { value: 'refunded', label: 'Refunded' },
          ]}
        />
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          {loading ? <Spinner /> : data.length === 0 ? (
            <EmptyState icon={<CreditCard className="w-10 h-10" />} title="No payments found" />
          ) : (
            <>
              <DataTable columns={columns} data={data} />
              <Pagination page={page} lastPage={lastPage} onPageChange={setPage} />
            </>
          )}
        </Card>
      </motion.div>

      <Modal open={!!detail} onClose={() => setDetail(null)} title="Payment Details" size="md">
        {detail && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-neutral-gray">PayPal Order ID:</span><p className="font-mono">{detail.paypal_order_id || '—'}</p></div>
            <div><span className="text-neutral-gray">Transaction ID:</span><p className="font-mono">{detail.transaction_id || '—'}</p></div>
            <div><span className="text-neutral-gray">Booking Ref:</span><p className="font-mono text-primary">{detail.booking_reference}</p></div>
            <div><span className="text-neutral-gray">Customer:</span><p>{detail.customer_name}</p></div>
            <div><span className="text-neutral-gray">Method:</span><p>{detail.payment_method}</p></div>
            <div><span className="text-neutral-gray">Amount:</span><p className="font-bold text-primary">{formatCurrency(detail.amount)}</p></div>
            <div><span className="text-neutral-gray">Status:</span><p><Badge variant={STATUS_VARIANT[detail.status] || 'default'}>{detail.status}</Badge></p></div>
            <div><span className="text-neutral-gray">Date:</span><p>{formatDateTime(detail.created_at)}</p></div>
          </div>
        )}
      </Modal>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Euro,
  CalendarDays,
  Users,
  TrendingUp,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { dashboardApi } from '@/services/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import PageHeader, { Card, StatCard, Badge, Spinner } from '@/components/ui';
import DataTable from '@/components/DataTable';

interface Stats {
  total_bookings: number;
  total_revenue: number;
  upcoming_events: number;
  total_guests: number;
  bookings_trend: string;
  revenue_trend: string;
}

interface RecentBooking {
  id: number;
  reference: string;
  first_name: string;
  last_name: string;
  email: string;
  date: string;
  guests: number;
  total_price: number;
  payment_status: string;
  location_name: string;
}

interface ChartPoint {
  month: string;
  revenue: number;
  bookings: number;
}

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
  paid: 'success',
  pending: 'warning',
  failed: 'danger',
  refunded: 'info',
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [bookings, setBookings] = useState<RecentBooking[]>([]);
  const [chart, setChart] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardApi.stats(),
      dashboardApi.recentBookings(),
      dashboardApi.revenueChart(),
    ])
      .then(([s, b, c]) => {
        setStats(s.data);
        setBookings(b.data);
        setChart(c.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const bookingColumns = [
    {
      key: 'reference',
      header: 'Reference',
      render: (r: RecentBooking) => (
        <span className="font-mono text-xs text-primary">{r.reference.slice(0, 8)}</span>
      ),
    },
    {
      key: 'name',
      header: 'Customer',
      render: (r: RecentBooking) => (
        <div>
          <p className="font-medium">{r.first_name} {r.last_name}</p>
          <p className="text-xs text-neutral-gray">{r.email}</p>
        </div>
      ),
    },
    {
      key: 'location_name',
      header: 'Location',
    },
    {
      key: 'date',
      header: 'Date',
      render: (r: RecentBooking) => formatDate(r.date),
    },
    {
      key: 'guests',
      header: 'Guests',
      className: 'text-center',
    },
    {
      key: 'total_price',
      header: 'Amount',
      render: (r: RecentBooking) => formatCurrency(r.total_price),
    },
    {
      key: 'payment_status',
      header: 'Status',
      render: (r: RecentBooking) => (
        <Badge variant={STATUS_VARIANT[r.payment_status] || 'default'}>
          {r.payment_status}
        </Badge>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Dashboard" description="Overview of your paella experience business" />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <StatCard
            title="Total Bookings"
            value={stats?.total_bookings ?? 0}
            icon={<BookOpen className="w-5 h-5" />}
            trend={stats?.bookings_trend ? { value: stats.bookings_trend, positive: true } : undefined}
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <StatCard
            title="Total Revenue"
            value={formatCurrency(stats?.total_revenue ?? 0)}
            icon={<Euro className="w-5 h-5" />}
            trend={stats?.revenue_trend ? { value: stats.revenue_trend, positive: true } : undefined}
            color="bg-success/10 text-success"
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <StatCard
            title="Upcoming Events"
            value={stats?.upcoming_events ?? 0}
            icon={<CalendarDays className="w-5 h-5" />}
            color="bg-info/10 text-info"
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <StatCard
            title="Total Guests"
            value={stats?.total_guests ?? 0}
            icon={<Users className="w-5 h-5" />}
            color="bg-warning/10 text-warning"
          />
        </motion.div>
      </div>

      {/* Revenue Chart */}
      {chart.length > 0 && (
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-neutral-dark">Revenue Overview</h2>
            <TrendingUp className="w-5 h-5 text-neutral-gray" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 2px 8px rgba(0,0,0,.08)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#E86F2C"
                  fill="#E86F2C"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Recent Bookings */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-neutral-dark">Recent Bookings</h2>
        </div>
        <DataTable columns={bookingColumns} data={bookings} />
      </Card>
    </div>
  );
}

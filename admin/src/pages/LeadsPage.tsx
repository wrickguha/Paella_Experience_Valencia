import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Filter } from 'lucide-react';
import { leadsApi } from '@/services/api';
import { formatDateTime } from '@/lib/utils';
import PageHeader, { Card, Badge, Spinner, EmptyState, StatCard } from '@/components/ui';
import DataTable, { Pagination } from '@/components/DataTable';
import { FormSelect } from '@/components/FormFields';

interface Lead {
  id: number;
  source: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

const SOURCE_BADGE: Record<string, 'info' | 'success' | 'warning' | 'danger'> = {
  whatsapp: 'success', community_join: 'info', language_join: 'warning', community_cta: 'danger', contact: 'default' as any,
};

const SOURCE_LABELS: Record<string, string> = {
  whatsapp: 'WhatsApp', community_join: 'Community Join', language_join: 'Language Join', community_cta: 'Community CTA', contact: 'Contact',
};

export default function LeadsPage() {
  const [data, setData] = useState<Lead[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [sourceFilter, setSourceFilter] = useState('');

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page };
      if (sourceFilter) params.source = sourceFilter;
      const res = await leadsApi.list(params);
      const d = res.data.data;
      setData(d.data || d);
      setLastPage(d.last_page || 1);
    } catch { /* empty */ }
    setLoading(false);
  }, [page, sourceFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await leadsApi.stats();
      setStats(res.data.data || {});
    } catch { /* empty */ }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  const totalLeads = Object.values(stats).reduce((a, b) => a + b, 0);

  const columns = [
    {
      key: 'source', header: 'Source',
      render: (r: Lead) => <Badge variant={SOURCE_BADGE[r.source] || 'default'}>{SOURCE_LABELS[r.source] || r.source}</Badge>,
    },
    { key: 'name', header: 'Name', render: (r: Lead) => r.name || <span className="text-neutral-gray">—</span> },
    { key: 'email', header: 'Email', render: (r: Lead) => r.email || <span className="text-neutral-gray">—</span> },
    { key: 'phone', header: 'Phone', render: (r: Lead) => r.phone || <span className="text-neutral-gray">—</span> },
    {
      key: 'metadata', header: 'Details',
      render: (r: Lead) => r.metadata ? (
        <p className="text-xs text-neutral-gray max-w-xs truncate">{JSON.stringify(r.metadata)}</p>
      ) : <span className="text-neutral-gray">—</span>,
    },
    {
      key: 'created_at', header: 'Date',
      render: (r: Lead) => <span className="text-sm text-neutral-gray">{formatDateTime(r.created_at)}</span>,
    },
  ];

  return (
    <div>
      <PageHeader title="Leads" description="Track community joins, WhatsApp clicks, and CTA interactions" />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Leads" value={totalLeads} icon={<TrendingUp className="w-5 h-5" />} />
        <StatCard title="WhatsApp" value={stats.whatsapp || 0} icon={<TrendingUp className="w-5 h-5" />} color="bg-emerald-50 text-emerald-600" />
        <StatCard title="Community" value={(stats.community_join || 0) + (stats.community_cta || 0)} icon={<TrendingUp className="w-5 h-5" />} color="bg-blue-50 text-blue-600" />
        <StatCard title="Language" value={stats.language_join || 0} icon={<TrendingUp className="w-5 h-5" />} color="bg-amber-50 text-amber-600" />
      </div>

      {/* Filter */}
      <div className="flex gap-3 mb-4">
        <FormSelect
          label=""
          value={sourceFilter}
          onChange={(e) => { setSourceFilter(e.target.value); setPage(1); }}
          options={[
            { value: '', label: 'All Sources' },
            { value: 'whatsapp', label: 'WhatsApp' },
            { value: 'community_join', label: 'Community Join' },
            { value: 'community_cta', label: 'Community CTA' },
            { value: 'language_join', label: 'Language Join' },
            { value: 'contact', label: 'Contact' },
          ]}
        />
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          {loading ? <Spinner /> : data.length === 0 ? (
            <EmptyState icon={<Filter className="w-10 h-10" />} title="No leads yet" description="Leads will appear when users interact with CTAs on the website." />
          ) : (
            <>
              <DataTable columns={columns} data={data} />
              <Pagination page={page} lastPage={lastPage} onPageChange={setPage} />
            </>
          )}
        </Card>
      </motion.div>
    </div>
  );
}

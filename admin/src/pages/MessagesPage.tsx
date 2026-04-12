import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Eye, Trash2, Mail, MailOpen, MessageSquare } from 'lucide-react';
import { messagesApi } from '@/services/api';
import { formatDate } from '@/lib/utils';
import PageHeader, { Card, Button, Badge, Spinner, EmptyState } from '@/components/ui';
import DataTable, { Pagination } from '@/components/DataTable';
import { Modal } from '@/components/Modal';

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function MessagesPage() {
  const [data, setData] = useState<ContactMessage[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<ContactMessage | null>(null);
  const [filter, setFilter] = useState<string>('');
  const [deleting, setDeleting] = useState<number | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page };
      if (filter) params.is_read = filter;
      const res = await messagesApi.list(params);
      setData(res.data.data || res.data);
      setLastPage(res.data.last_page || 1);
    } catch { /* empty */ }
    setLoading(false);
  }, [page, filter]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleView = async (msg: ContactMessage) => {
    setDetail(msg);
    if (!msg.is_read) {
      try {
        await messagesApi.markRead(msg.id);
        setData(prev => prev.map(m => m.id === msg.id ? { ...m, is_read: true } : m));
      } catch { /* empty */ }
    }
  };

  const handleToggleRead = async (msg: ContactMessage) => {
    try {
      if (msg.is_read) {
        await messagesApi.markUnread(msg.id);
      } else {
        await messagesApi.markRead(msg.id);
      }
      setData(prev => prev.map(m => m.id === msg.id ? { ...m, is_read: !m.is_read } : m));
      if (detail?.id === msg.id) setDetail({ ...msg, is_read: !msg.is_read });
    } catch { /* empty */ }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this message permanently?')) return;
    setDeleting(id);
    try {
      await messagesApi.delete(id);
      setData(prev => prev.filter(m => m.id !== id));
      if (detail?.id === id) setDetail(null);
    } catch { /* empty */ }
    setDeleting(null);
  };

  const columns = [
    {
      key: 'status',
      header: '',
      className: 'w-8',
      render: (r: ContactMessage) => (
        <span className={`inline-block w-2.5 h-2.5 rounded-full ${r.is_read ? 'bg-gray-300' : 'bg-primary'}`} />
      ),
    },
    {
      key: 'name',
      header: 'From',
      render: (r: ContactMessage) => (
        <div>
          <p className={`${r.is_read ? 'font-normal text-neutral-gray' : 'font-semibold text-neutral-dark'}`}>
            {r.name}
          </p>
          <p className="text-xs text-neutral-gray">{r.email}</p>
        </div>
      ),
    },
    {
      key: 'subject',
      header: 'Subject',
      render: (r: ContactMessage) => (
        <p className={`truncate max-w-[200px] ${r.is_read ? 'text-neutral-gray' : 'font-medium text-neutral-dark'}`}>
          {r.subject}
        </p>
      ),
    },
    {
      key: 'message',
      header: 'Preview',
      render: (r: ContactMessage) => (
        <p className="truncate max-w-[250px] text-xs text-neutral-gray">
          {r.message}
        </p>
      ),
    },
    {
      key: 'created_at',
      header: 'Date',
      render: (r: ContactMessage) => (
        <span className="text-xs text-neutral-gray">{formatDate(r.created_at)}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (r: ContactMessage) => (
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" onClick={() => handleView(r)}>
            <Eye className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => handleToggleRead(r)}>
            {r.is_read ? <Mail className="w-4 h-4" /> : <MailOpen className="w-4 h-4" />}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-red-500 hover:text-red-700"
            onClick={() => handleDelete(r.id)}
            disabled={deleting === r.id}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  const unreadCount = data.filter(m => !m.is_read).length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <PageHeader
        title="Messages"
        subtitle={`Contact form submissions${unreadCount > 0 ? ` · ${unreadCount} unread` : ''}`}
      />

      {/* Filters */}
      <Card>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-neutral-gray">Filter:</span>
          {[
            { label: 'All', value: '' },
            { label: 'Unread', value: '0' },
            { label: 'Read', value: '1' },
          ].map(f => (
            <button
              key={f.value}
              onClick={() => { setFilter(f.value); setPage(1); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                filter === f.value
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-neutral-gray hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Table */}
      <Card>
        {loading ? (
          <Spinner />
        ) : data.length === 0 ? (
          <EmptyState icon={<MessageSquare className="w-12 h-12" />} message="No messages yet" />
        ) : (
          <>
            <DataTable columns={columns} data={data} onRowClick={handleView} />
            <Pagination page={page} lastPage={lastPage} onChange={setPage} />
          </>
        )}
      </Card>

      {/* Detail Modal */}
      {detail && (
        <Modal title="Message Details" onClose={() => setDetail(null)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-neutral-gray uppercase tracking-wide">From</label>
                <p className="font-medium text-neutral-dark mt-1">{detail.name}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-gray uppercase tracking-wide">Email</label>
                <p className="mt-1">
                  <a href={`mailto:${detail.email}`} className="text-primary hover:underline">
                    {detail.email}
                  </a>
                </p>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-gray uppercase tracking-wide">Subject</label>
              <p className="font-medium text-neutral-dark mt-1">{detail.subject}</p>
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-gray uppercase tracking-wide">Message</label>
              <div className="mt-1 bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-neutral-dark whitespace-pre-wrap leading-relaxed">{detail.message}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-xs text-neutral-gray">
                Received: {formatDate(detail.created_at)}
              </span>
              <div className="flex items-center gap-2">
                <Badge variant={detail.is_read ? 'info' : 'warning'}>
                  {detail.is_read ? 'Read' : 'Unread'}
                </Badge>
                <Button size="sm" variant="outline" onClick={() => handleToggleRead(detail)}>
                  {detail.is_read ? 'Mark Unread' : 'Mark Read'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-500 border-red-200 hover:bg-red-50"
                  onClick={() => handleDelete(detail.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </motion.div>
  );
}

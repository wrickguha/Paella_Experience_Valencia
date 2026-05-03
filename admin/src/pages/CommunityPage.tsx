import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Pencil, Trash2, Users, Star } from 'lucide-react';
import { communityApi } from '@/services/api';
import { formatDate } from '@/lib/utils';
import PageHeader, { Card, Button, Badge, Spinner, EmptyState } from '@/components/ui';
import DataTable, { Pagination } from '@/components/DataTable';
import { Modal, ConfirmDialog } from '@/components/Modal';
import { FormInput, FormTextarea, FormToggle } from '@/components/FormFields';

interface CommunityMember {
  id: number;
  name: string;
  email: string;
  bio: string | null;
  avatar: string | null;
  country: string | null;
  is_featured: boolean;
  joined_at: string;
}

export default function CommunityPage() {
  const [data, setData] = useState<CommunityMember[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<CommunityMember> | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CommunityMember | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await communityApi.list({ page });
      const d = res.data.data;
      setData(d.data || d);
      setLastPage(d.last_page || 1);
    } catch { /* empty */ }
    setLoading(false);
  }, [page]);

  useEffect(() => { fetch(); }, [fetch]);

  const openEdit = (m: CommunityMember) => { setEditing(m); setModalOpen(true); };

  const handleSave = async () => {
    if (!editing?.id) return;
    setSaving(true);
    try {
      await communityApi.update(editing.id, {
        name: editing.name,
        bio: editing.bio,
        country: editing.country,
        is_featured: editing.is_featured,
      });
      setModalOpen(false);
      fetch();
    } catch { /* empty */ }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await communityApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      fetch();
    } catch { /* empty */ }
    setDeleting(false);
  };

  const columns = [
    {
      key: 'avatar',
      header: '',
      className: 'w-12',
      render: (r: CommunityMember) => (
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold overflow-hidden">
          {r.avatar ? <img src={r.avatar} alt="" className="w-full h-full object-cover" /> : r.name[0]}
        </div>
      ),
    },
    {
      key: 'name',
      header: 'Member',
      render: (r: CommunityMember) => (
        <div>
          <p className="font-medium">{r.name}</p>
          <p className="text-xs text-neutral-gray">{r.email}</p>
        </div>
      ),
    },
    { key: 'country', header: 'Country', render: (r: CommunityMember) => r.country || '—' },
    {
      key: 'bio',
      header: 'Bio',
      render: (r: CommunityMember) => <p className="text-sm text-neutral-gray max-w-xs truncate">{r.bio || '—'}</p>,
    },
    {
      key: 'is_featured',
      header: 'Featured',
      render: (r: CommunityMember) => r.is_featured
        ? <Badge variant="success"><Star className="w-3 h-3 inline mr-1" />Featured</Badge>
        : <Badge variant="default">Regular</Badge>,
    },
    {
      key: 'joined_at',
      header: 'Joined',
      render: (r: CommunityMember) => <span className="text-sm text-neutral-gray">{formatDate(r.joined_at)}</span>,
    },
    {
      key: 'actions',
      header: '',
      className: 'w-24',
      render: (r: CommunityMember) => (
        <div className="flex gap-1">
          <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg hover:bg-gray-100 text-neutral-gray hover:text-primary"><Pencil className="w-4 h-4" /></button>
          <button onClick={() => setDeleteTarget(r)} className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-gray hover:text-danger"><Trash2 className="w-4 h-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Community" description="Manage community members who joined via the website" />

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          {loading ? <Spinner /> : data.length === 0 ? (
            <EmptyState icon={<Users className="w-10 h-10" />} title="No community members yet" description="Members will appear here when they join via the website." />
          ) : (
            <>
              <DataTable columns={columns} data={data} />
              <Pagination page={page} lastPage={lastPage} onPageChange={setPage} />
            </>
          )}
        </Card>
      </motion.div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Edit Member" size="md">
        {editing && (
          <>
            <div className="space-y-4">
              <FormInput label="Name" value={editing.name || ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              <FormTextarea label="Bio" value={editing.bio || ''} onChange={(e) => setEditing({ ...editing, bio: e.target.value })} />
              <FormInput label="Country" value={editing.country || ''} onChange={(e) => setEditing({ ...editing, country: e.target.value })} />
              <FormToggle label="Featured" description="Show prominently on the website" checked={editing.is_featured ?? false} onChange={(v) => setEditing({ ...editing, is_featured: v })} />
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
              <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} loading={saving}>Update</Button>
            </div>
          </>
        )}
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Remove Member" message={`Remove "${deleteTarget?.name}" from the community?`} loading={deleting} />
    </div>
  );
}

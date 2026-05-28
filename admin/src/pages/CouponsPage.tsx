import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Percent } from 'lucide-react';
import { couponsApi } from '@/services/api';
import PageHeader, { Card, Button, Badge, Spinner, EmptyState } from '@/components/ui';
import DataTable from '@/components/DataTable';
import { Modal, ConfirmDialog } from '@/components/Modal';
import { FormInput, FormToggle } from '@/components/FormFields';

interface Coupon {
  id: number;
  code: string;
  discount_percent: number;
  is_active: boolean;
}

const EMPTY: Partial<Coupon> = {
  code: '',
  discount_percent: 0,
  is_active: true,
};

export default function CouponsPage() {
  const [data, setData] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Coupon>>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await couponsApi.list();
      setData(res.data.data || res.data);
    } catch {
      setData([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => { setEditing({ ...EMPTY }); setModalOpen(true); };
  const openEdit = (coupon: Coupon) => { setEditing(coupon); setModalOpen(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      await couponsApi.create({
        code: editing.code?.toString().trim().toUpperCase() ?? '',
        discount_percent: Number(editing.discount_percent) || 0,
        is_active: editing.is_active ?? true,
      });
      setModalOpen(false);
      fetch();
    } catch {
      // ignore
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await couponsApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      fetch();
    } catch {
      // ignore
    }
    setDeleting(false);
  };

  const columns = [
    { key: 'code', header: 'Coupon Code' },
    {
      key: 'discount_percent',
      header: 'Discount',
      className: 'text-right',
      render: (coupon: Coupon) => `${coupon.discount_percent}%`,
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (coupon: Coupon) => (
        <Badge variant={coupon.is_active ? 'success' : 'default'}>
          {coupon.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-24',
      render: (coupon: Coupon) => (
        <div className="flex gap-1 justify-end">
          <button onClick={() => openEdit(coupon)} className="p-1.5 rounded-lg hover:bg-gray-100 text-neutral-gray hover:text-primary"><Pencil className="w-4 h-4" /></button>
          <button onClick={() => setDeleteTarget(coupon)} className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-gray hover:text-danger"><Trash2 className="w-4 h-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Coupons" description="Create and manage discount coupon codes for booking checkout">
        <Button onClick={openCreate}><Plus className="w-4 h-4" /> New Coupon</Button>
      </PageHeader>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          {loading ? <Spinner /> : data.length === 0 ? (
            <EmptyState icon={<Percent className="w-10 h-10" />} title="No coupons yet" action={<Button onClick={openCreate}><Plus className="w-4 h-4" /> Create Coupon</Button>} />
          ) : (
            <DataTable columns={columns} data={data} />
          )}
        </Card>
      </motion.div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing.id ? 'Edit Coupon' : 'New Coupon'} size="md">
        <div className="space-y-4">
          <FormInput label="Coupon Code" value={editing.code || ''} onChange={(e) => setEditing({ ...editing, code: e.target.value })} />
          <FormInput label="Discount %" type="number" min={0} max={100} value={editing.discount_percent?.toString() || '0'} onChange={(e) => setEditing({ ...editing, discount_percent: Number(e.target.value) })} />
          <FormToggle label="Active" checked={editing.is_active ?? true} onChange={(value) => setEditing({ ...editing, is_active: value })} />
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} loading={saving}>{editing.id ? 'Update' : 'Create'}</Button>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Coupon" message={`Delete coupon ${deleteTarget?.code}?`} loading={deleting} />
    </div>
  );
}

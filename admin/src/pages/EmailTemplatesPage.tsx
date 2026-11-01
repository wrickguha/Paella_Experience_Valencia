import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FileText, Mail, Pause, Pencil, Play, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { emailTemplatesApi } from '@/services/api';
import PageHeader, { Badge, Button, Card, EmptyState, Spinner } from '@/components/ui';
import { FormInput, FormTextarea, FormToggle } from '@/components/FormFields';
import { ConfirmDialog, Modal } from '@/components/Modal';

interface EmailTemplate {
  id: number;
  key: string;
  name: string;
  subject: string;
  body_html: string | null;
  available_variables: string[];
  is_active: boolean;
  is_system: boolean;
}

interface TemplateDraft {
  id?: number;
  key: string;
  name: string;
  subject: string;
  body_html: string;
  is_active: boolean;
  is_system: boolean;
  available_variables: string[];
}

const EMPTY_DRAFT: TemplateDraft = {
  key: '',
  name: '',
  subject: '',
  body_html: '',
  is_active: false,
  is_system: false,
  available_variables: [],
};

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; errors?: Record<string, string[]> } | undefined;
    const validationMessage = data?.errors ? Object.values(data.errors).flat()[0] : undefined;
    return validationMessage || data?.message || error.message;
  }

  return error instanceof Error ? error.message : 'Something went wrong.';
}

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState<TemplateDraft>(EMPTY_DRAFT);
  const [deleteTarget, setDeleteTarget] = useState<EmailTemplate | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const response = await emailTemplatesApi.list();
      setTemplates(response.data);
    } catch (error) {
      toast.error(`Could not load email templates: ${getErrorMessage(error)}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchTemplates();
  }, [fetchTemplates]);

  const openCreate = () => {
    setDraft({ ...EMPTY_DRAFT });
    setModalOpen(true);
  };

  const openEdit = (template: EmailTemplate) => {
    setDraft({
      ...template,
      body_html: template.body_html || '',
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { id, ...data } = draft;
      if (id) {
        await emailTemplatesApi.update(id, data);
      } else {
        await emailTemplatesApi.create(data);
      }
      setModalOpen(false);
      toast.success(id ? 'Email template updated.' : 'Email template created as a draft.');
      await fetchTemplates();
    } catch (error) {
      toast.error(`Could not save email template: ${getErrorMessage(error)}`);
    } finally {
      setSaving(false);
    }
  };

  const toggleTemplate = async (template: EmailTemplate) => {
    try {
      await emailTemplatesApi.update(template.id, {
        key: template.key,
        name: template.name,
        subject: template.subject,
        body_html: template.body_html,
        is_active: !template.is_active,
      });
      toast.success(`Template ${template.is_active ? 'paused' : 'activated'}.`);
      await fetchTemplates();
    } catch (error) {
      toast.error(`Could not update email template: ${getErrorMessage(error)}`);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await emailTemplatesApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      toast.success('Draft deleted.');
      await fetchTemplates();
    } catch (error) {
      toast.error(`Could not delete email template: ${getErrorMessage(error)}`);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Email Templates"
        description="Edit the emails sent by the site and create reusable drafts."
      >
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4" /> New Template
        </Button>
      </PageHeader>

      <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
        Built-in templates control automatic booking, contact, and level-test emails. New templates are saved as drafts and are not connected to an automatic email event.
      </div>

      {loading ? (
        <Spinner />
      ) : templates.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Mail className="w-10 h-10" />}
            title="No email templates"
            action={<Button onClick={openCreate}><Plus className="w-4 h-4" /> New Template</Button>}
          />
        </Card>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-4 xl:grid-cols-2"
        >
          {templates.map((template) => (
            <Card key={template.id} className="overflow-hidden">
              <div className="flex items-start gap-4 p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {template.is_system ? <Mail className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-neutral-dark">{template.name}</h2>
                    <Badge variant={template.is_system ? (template.is_active ? 'success' : 'warning') : 'default'}>
                      {template.is_system ? (template.is_active ? 'Active' : 'Paused') : 'Draft'}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-neutral-gray">{template.key}</p>
                  <p className="mt-3 truncate text-sm text-neutral-dark">{template.subject}</p>
                  <p className="mt-1 text-xs text-neutral-gray">
                    {template.body_html ? 'Custom HTML body' : 'Using the built-in email design'}
                  </p>
                </div>
              </div>
              {template.available_variables.length > 0 && (
                <div className="border-t border-gray-100 px-5 py-3">
                  <p className="mb-2 text-xs font-medium text-neutral-gray">Available placeholders</p>
                  <div className="flex flex-wrap gap-1.5">
                    {template.available_variables.map((variable) => (
                      <code key={variable} className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] text-neutral-dark">
                        {variable}
                      </code>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
                <span className="text-xs text-neutral-gray">
                  {template.is_system ? 'Connected to an automatic email' : 'Not connected to an email event'}
                </span>
                <div className="flex items-center gap-1">
                  {template.is_system && (
                    <button
                      type="button"
                      onClick={() => void toggleTemplate(template)}
                      title={template.is_active ? 'Pause automatic email' : 'Activate automatic email'}
                      aria-label={template.is_active ? 'Pause automatic email' : 'Activate automatic email'}
                      className="rounded-lg p-2 text-neutral-gray transition-colors hover:bg-gray-100 hover:text-primary"
                    >
                      {template.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => openEdit(template)}
                    title="Edit template"
                    aria-label={`Edit ${template.name}`}
                    className="rounded-lg p-2 text-neutral-gray transition-colors hover:bg-gray-100 hover:text-primary"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  {!template.is_system && (
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(template)}
                      title="Delete draft"
                      aria-label={`Delete ${template.name}`}
                      className="rounded-lg p-2 text-neutral-gray transition-colors hover:bg-red-50 hover:text-danger"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </motion.div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={draft.id ? 'Edit Email Template' : 'Create Email Draft'}
        size="xl"
      >
        <div className="space-y-4">
          {!draft.is_system && (
            <FormInput
              label="Template key"
              value={draft.key}
              onChange={(event) => setDraft({ ...draft, key: event.target.value })}
              placeholder="welcome-follow-up"
              required
              disabled={Boolean(draft.id)}
            />
          )}
          <FormInput
            label="Template name"
            value={draft.name}
            onChange={(event) => setDraft({ ...draft, name: event.target.value })}
            placeholder="Welcome follow-up"
            required
          />
          <FormInput
            label="Email subject"
            value={draft.subject}
            onChange={(event) => setDraft({ ...draft, subject: event.target.value })}
            placeholder="Your reservation details"
            maxLength={255}
            required
          />
          <FormTextarea
            label="HTML email body"
            value={draft.body_html}
            onChange={(event) => setDraft({ ...draft, body_html: event.target.value })}
            placeholder={draft.is_system ? 'Leave blank to keep the current built-in design.' : '<p>Your email content...</p>'}
            rows={12}
            required={!draft.is_system}
          />
          {draft.available_variables.length > 0 && (
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="mb-2 text-xs font-semibold text-neutral-dark">Placeholders you can use</p>
              <div className="flex flex-wrap gap-1.5">
                {draft.available_variables.map((variable) => (
                  <code key={variable} className="rounded bg-white px-1.5 py-0.5 text-[11px] text-neutral-dark">
                    {variable}
                  </code>
                ))}
              </div>
            </div>
          )}
          {draft.is_system && (
            <FormToggle
              label="Automatic email enabled"
              description="When paused, this email is not sent by its associated event."
              checked={draft.is_active}
              onChange={(is_active) => setDraft({ ...draft, is_active })}
            />
          )}
        </div>
        <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-4">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} loading={saving}>
            {draft.id ? 'Save Changes' : 'Create Draft'}
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Email Draft"
        message={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        loading={deleting}
      />
    </div>
  );
}

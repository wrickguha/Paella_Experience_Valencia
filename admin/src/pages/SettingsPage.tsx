import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Save } from 'lucide-react';
import { settingsApi } from '@/services/api';
import PageHeader, { Card, Button, Spinner } from '@/components/ui';
import { FormInput, FormTextarea, FormToggle } from '@/components/FormFields';
import { cn } from '@/lib/utils';

interface Setting {
  key: string;
  value: string;
  group: string;
}

interface GroupConfig {
  label: string;
  icon: string;
  fields: { key: string; label: string; type: 'text' | 'textarea' | 'number' | 'toggle' | 'email' | 'url' | 'file' }[];
}

const GROUPS: GroupConfig[] = [
  {
    label: 'General',
    icon: '⚙️',
    fields: [
      { key: 'hero_video', label: 'Hero Background Video', type: 'file' },
    ],
  },
  {
    label: 'Contact',
    icon: '📞',
    fields: [
      { key: 'contact_email', label: 'Email Address', type: 'email' },
      { key: 'contact_phone', label: 'Phone Number', type: 'text' },
      { key: 'contact_whatsapp', label: 'WhatsApp', type: 'text' },
      { key: 'contact_address', label: 'Address', type: 'textarea' },
      { key: 'contact_city', label: 'City / Region', type: 'text' },
      { key: 'contact_hours', label: 'Business Hours', type: 'text' },
    ],
  },
  {
    label: 'Social Media',
    icon: '🔗',
    fields: [
      { key: 'social_instagram', label: 'Instagram URL', type: 'url' },
      { key: 'social_facebook', label: 'Facebook URL', type: 'url' },
      { key: 'social_tripadvisor', label: 'TripAdvisor URL', type: 'url' },
      { key: 'social_google', label: 'Google Maps URL', type: 'url' },
    ],
  },
];

export default function SettingsPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeGroup, setActiveGroup] = useState(GROUPS[0].label);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalValues, setOriginalValues] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await settingsApi.list();
      const map: Record<string, string> = {};
      const settings = res.data.data || res.data;
      (Array.isArray(settings) ? settings : Object.entries(settings).map(([key, value]) => ({ key, value }))).forEach((s: Setting) => {
        map[s.key] = s.value || '';
      });
      setValues(map);
      setOriginalValues(map);
    } catch { /* empty */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const updateValue = (key: string, value: string) => {
    const next = { ...values, [key]: value };
    setValues(next);
    setHasChanges(JSON.stringify(next) !== JSON.stringify(originalValues));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      const cleanValues = { ...values };
      if (cleanValues.hero_video && cleanValues.hero_video.startsWith('blob:')) {
        delete cleanValues.hero_video;
      }
      fd.append('settings', JSON.stringify(cleanValues));
      if (videoFile) {
        fd.append('hero_video', videoFile);
      }
      await settingsApi.update(fd);
      
      const res = await settingsApi.list();
      const map: Record<string, string> = {};
      const settings = res.data.data || res.data;
      (Array.isArray(settings) ? settings : Object.entries(settings).map(([key, value]) => ({ key, value }))).forEach((s: Setting) => {
        map[s.key] = s.value || '';
      });
      setValues(map);
      setOriginalValues(map);
      setVideoFile(null);
      setHasChanges(false);
      setSuccessMsg('Settings saved successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch { /* empty */ }
    setSaving(false);
  };

  const currentGroup = GROUPS.find(g => g.label === activeGroup)!;

  return (
    <div>
      <PageHeader title="Settings" description="Manage site content, contact info, and configuration">
        <Button onClick={handleSave} loading={saving} disabled={!hasChanges}>
          <Save className="w-4 h-4" /> Save Changes
        </Button>
      </PageHeader>

      {successMsg && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-3 rounded-lg bg-success/10 text-success text-sm font-medium border border-success/20">
          {successMsg}
        </motion.div>
      )}

      {loading ? <Spinner /> : (
        <div className="flex gap-6 flex-col lg:flex-row">
          {/* Sidebar nav */}
          <div className="w-full lg:w-56 shrink-0">
            <Card className="p-2">
              <nav className="space-y-0.5">
                {GROUPS.map(g => (
                  <button
                    key={g.label}
                    onClick={() => setActiveGroup(g.label)}
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left',
                      activeGroup === g.label
                        ? 'bg-primary/10 text-primary'
                        : 'text-neutral-gray hover:bg-gray-100 hover:text-neutral-dark',
                    )}
                  >
                    <span>{g.icon}</span>
                    {g.label}
                  </button>
                ))}
              </nav>
            </Card>
          </div>

          {/* Fields */}
          <motion.div
            key={activeGroup}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1"
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-neutral-dark mb-4 flex items-center gap-2">
                <span>{currentGroup.icon}</span> {currentGroup.label}
              </h3>
              <div className="space-y-4">
                {currentGroup.fields.map(field => {
                  if (field.type === 'toggle') {
                    return (
                      <FormToggle
                        key={field.key}
                        label={field.label}
                        checked={values[field.key] === '1' || values[field.key] === 'true'}
                        onChange={(v) => updateValue(field.key, v ? '1' : '0')}
                      />
                    );
                  }
                  if (field.type === 'textarea') {
                    return (
                      <FormTextarea
                        key={field.key}
                        label={field.label}
                        value={values[field.key] || ''}
                        onChange={(e) => updateValue(field.key, e.target.value)}
                        rows={3}
                      />
                    );
                  }
                  if (field.type === 'file') {
                    const videoPreviewUrl = values[field.key]
                      ? (values[field.key].startsWith('blob:') || values[field.key].startsWith('http') || values[field.key].startsWith('/')
                        ? values[field.key]
                        : `/storage/${values[field.key]}`)
                      : '';
                    return (
                      <div key={field.key}>
                        <label className="block text-sm font-medium text-neutral-dark mb-1.5">{field.label}</label>
                        <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-primary/40 transition-colors">
                          {videoPreviewUrl ? (
                            <div className="relative max-w-md mx-auto">
                              <video src={videoPreviewUrl} controls className="max-h-40 mx-auto rounded-lg object-cover" />
                              <button
                                type="button"
                                onClick={() => {
                                  updateValue(field.key, '');
                                  setVideoFile(null);
                                }}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-danger text-white rounded-full text-xs flex items-center justify-center shadow"
                              >
                                ×
                              </button>
                            </div>
                          ) : (
                            <label className="cursor-pointer block py-4">
                              <div className="text-neutral-gray text-sm">
                                <span className="text-primary font-medium">Click to upload video</span> or drag and drop
                              </div>
                              <p className="text-xs text-neutral-gray mt-1">MP4 up to 20MB</p>
                              <input
                                type="file"
                                accept="video/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0] || null;
                                  if (file) {
                                    setVideoFile(file);
                                    updateValue(field.key, URL.createObjectURL(file));
                                  }
                                }}
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    );
                  }
                  return (
                    <FormInput
                      key={field.key}
                      label={field.label}
                      type={field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : 'text'}
                      value={values[field.key] || ''}
                      onChange={(e) => updateValue(field.key, e.target.value)}
                    />
                  );
                })}
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
}

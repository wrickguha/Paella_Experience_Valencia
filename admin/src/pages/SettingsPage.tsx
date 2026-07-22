import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Save } from 'lucide-react';
import { settingsApi } from '@/services/api';
import PageHeader, { Card, Button, Spinner } from '@/components/ui';
import { FormInput, FormTextarea } from '@/components/FormFields';
import { cn } from '@/lib/utils';

interface Setting {
  key: string;
  value: string;
  group: string;
}

interface GroupConfig {
  label: string;
  icon: string;
  fields: { key: string; label: string; type: 'text' | 'textarea' | 'number' | 'toggle' | 'email' | 'url' }[];
}

const GROUPS: GroupConfig[] = [
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
      { key: 'contact_map_embed', label: 'Google Maps Embed URL', type: 'url' },
    ],
  },
  {
    label: 'Footer',
    icon: '⬇️',
    fields: [
      { key: 'footer_description_en', label: 'Footer Description (English)', type: 'textarea' },
      { key: 'footer_description_es', label: 'Footer Description (Spanish)', type: 'textarea' },
      { key: 'footer_copyright_en', label: 'Footer Copyright Notice (English)', type: 'text' },
      { key: 'footer_copyright_es', label: 'Footer Copyright Notice (Spanish)', type: 'text' },
      { key: 'footer_meetup_url', label: 'Meetup Group URL', type: 'url' },
      { key: 'footer_meetup_text_en', label: 'Meetup Button Text (English)', type: 'text' },
      { key: 'footer_meetup_text_es', label: 'Meetup Button Text (Spanish)', type: 'text' },
      { key: 'social_instagram', label: 'Instagram URL', type: 'url' },
      { key: 'social_facebook', label: 'Facebook URL', type: 'url' },
      { key: 'social_tiktok', label: 'TikTok URL', type: 'url' },
      { key: 'social_youtube', label: 'YouTube URL', type: 'url' },
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
      await settingsApi.update(values);
      setOriginalValues(values);
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

          {/* Content panel */}
          <motion.div
            key={activeGroup}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1"
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-neutral-dark mb-6 flex items-center gap-2">
                <span>{currentGroup.icon}</span> {currentGroup.label}
              </h3>

              <div className="space-y-4">
                {currentGroup.fields?.map(field => {
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

                  // Special handling for Google Maps Embed URL
                  if (field.key === 'contact_map_embed') {
                    const rawVal = values[field.key] || '';
                    const isValidEmbed = rawVal.includes('/maps/embed');
                    const isRegularMaps = rawVal.includes('google.com/maps') && !rawVal.includes('/maps/embed');
                    return (
                      <div key={field.key} className="space-y-3">
                        <FormInput
                          label={field.label}
                          type="url"
                          value={rawVal}
                          onChange={(e) => updateValue(field.key, e.target.value)}
                          placeholder="https://www.google.com/maps/embed?pb=..."
                        />
                        {/* Status indicators */}
                        {isValidEmbed && (
                          <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
                            <span>✅</span> Valid embed URL — map will display correctly
                          </div>
                        )}
                        {isRegularMaps && (
                          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-1">
                            <p className="font-semibold">⚠️ This looks like a regular Google Maps link — it won't work in an iframe.</p>
                            <p>Google requires the special <strong>Embed URL</strong> format. Follow the steps below to get it.</p>
                          </div>
                        )}
                        {/* Live preview */}
                        {isValidEmbed && (
                          <div className="rounded-xl overflow-hidden border border-gray-200 h-40">
                            <iframe src={rawVal} width="100%" height="100%" style={{ border: 0 }} loading="lazy" title="Map Preview" />
                          </div>
                        )}
                        {/* Instructions */}
                        <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-800 space-y-2">
                          <p className="font-semibold text-sm">📌 How to get the Google Maps Embed URL:</p>
                          <ol className="list-decimal list-inside space-y-1 ml-1">
                            <li>Open <strong>Google Maps</strong> and search for your location</li>
                            <li>Click the <strong>Share</strong> button (or the three-dot menu → Share)</li>
                            <li>Click the <strong>"Embed a map"</strong> tab</li>
                            <li>Click <strong>"Copy HTML"</strong></li>
                            <li>From the copied code, only paste the URL inside <code className="bg-blue-100 px-1 rounded">src="..."</code> here</li>
                          </ol>
                          <p className="text-blue-600 mt-1">The URL must start with: <code className="bg-blue-100 px-1 rounded">https://www.google.com/maps/embed?pb=</code></p>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={field.key} className="space-y-2">
                      <FormInput
                        label={field.label}
                        type={field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : 'text'}
                        value={values[field.key] || ''}
                        onChange={(e) => updateValue(field.key, e.target.value)}
                      />
                    </div>
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

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
  fields: { key: string; label: string; type: 'text' | 'textarea' | 'number' | 'toggle' | 'email' | 'url' }[];
}

const GROUPS: GroupConfig[] = [
  {
    label: 'General',
    icon: '🏠',
    fields: [
      { key: 'site_name_en', label: 'Site Name (EN)', type: 'text' },
      { key: 'site_name_es', label: 'Site Name (ES)', type: 'text' },
      { key: 'tagline_en', label: 'Tagline (EN)', type: 'text' },
      { key: 'tagline_es', label: 'Tagline (ES)', type: 'text' },
      { key: 'hero_title_en', label: 'Hero Title (EN)', type: 'text' },
      { key: 'hero_title_es', label: 'Hero Title (ES)', type: 'text' },
      { key: 'hero_subtitle_en', label: 'Hero Subtitle (EN)', type: 'textarea' },
      { key: 'hero_subtitle_es', label: 'Hero Subtitle (ES)', type: 'textarea' },
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
  {
    label: 'Stats Bar',
    icon: '📊',
    fields: [
      { key: 'stat_events', label: 'Events Count', type: 'number' },
      { key: 'stat_events_label_en', label: 'Events Label (EN)', type: 'text' },
      { key: 'stat_events_label_es', label: 'Events Label (ES)', type: 'text' },
      { key: 'stat_guests', label: 'Guests Count', type: 'number' },
      { key: 'stat_guests_label_en', label: 'Guests Label (EN)', type: 'text' },
      { key: 'stat_guests_label_es', label: 'Guests Label (ES)', type: 'text' },
      { key: 'stat_rating', label: 'Rating', type: 'text' },
      { key: 'stat_rating_label_en', label: 'Rating Label (EN)', type: 'text' },
      { key: 'stat_rating_label_es', label: 'Rating Label (ES)', type: 'text' },
    ],
  },
  {
    label: 'Footer',
    icon: '📄',
    fields: [
      { key: 'footer_text_en', label: 'Footer Text (EN)', type: 'textarea' },
      { key: 'footer_text_es', label: 'Footer Text (ES)', type: 'textarea' },
      { key: 'privacy_url', label: 'Privacy Policy URL', type: 'url' },
      { key: 'terms_url', label: 'Terms & Conditions URL', type: 'url' },
    ],
  },
  {
    label: 'Booking',
    icon: '📅',
    fields: [
      { key: 'booking_enabled', label: 'Booking Enabled', type: 'toggle' },
      { key: 'max_guests_per_booking', label: 'Max Guests per Booking', type: 'number' },
      { key: 'booking_notice_hours', label: 'Booking Notice (hours)', type: 'number' },
      { key: 'cancellation_hours', label: 'Cancellation Window (hours)', type: 'number' },
      { key: 'currency', label: 'Currency', type: 'text' },
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

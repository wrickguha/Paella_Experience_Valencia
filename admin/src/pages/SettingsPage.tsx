import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Save, FileText } from 'lucide-react';
import { settingsApi, aboutApi } from '@/services/api';
import PageHeader, { Card, Button, Spinner } from '@/components/ui';
import { FormInput, FormTextarea, FormToggle, ImageUpload } from '@/components/FormFields';
import { cn } from '@/lib/utils';

interface Setting {
  key: string;
  value: string;
  group: string;
}

interface AboutSection {
  id: number;
  section_key: string;
  title_en: string;
  title_es: string;
  content_en: string;
  content_es: string;
  subtitle_en: string;
  subtitle_es: string;
  image: string | null;
  image_url?: string | null;
  sort_order: number;
  is_active: boolean;
}

interface GroupConfig {
  label: string;
  icon: string;
  type?: 'settings' | 'about';
  fields?: { key: string; label: string; type: 'text' | 'textarea' | 'number' | 'toggle' | 'email' | 'url' | 'file' | 'image' }[];
}

const GROUPS: GroupConfig[] = [
  {
    label: 'General',
    icon: '⚙️',
    type: 'settings',
    fields: [
      { key: 'hero_video', label: 'Hero Background Video', type: 'file' },
      { key: 'hero_title_en', label: 'Hero Title (English)', type: 'text' },
      { key: 'hero_title_es', label: 'Hero Title (Spanish)', type: 'text' },
      { key: 'hero_subtitle_en', label: 'Hero Subtitle / Description (English)', type: 'textarea' },
      { key: 'hero_subtitle_es', label: 'Hero Subtitle / Description (Spanish)', type: 'textarea' },
    ],
  },
  {
    label: 'Community Section',
    icon: '👥',
    type: 'settings',
    fields: [
      { key: 'community_title', label: 'Section Title', type: 'text' },
      { key: 'community_subtitle', label: 'Section Subtitle', type: 'textarea' },
      { key: 'community_card1_title', label: 'Card 1 — Title', type: 'text' },
      { key: 'community_card1_desc', label: 'Card 1 — Description', type: 'textarea' },
      { key: 'community_card2_title', label: 'Card 2 — Title', type: 'text' },
      { key: 'community_card2_desc', label: 'Card 2 — Description', type: 'textarea' },
      { key: 'community_card3_title', label: 'Card 3 — Title', type: 'text' },
      { key: 'community_card3_desc', label: 'Card 3 — Description', type: 'textarea' },
      { key: 'community_image_1', label: 'Card 1 Image ', type: 'image' },
      { key: 'community_image_2', label: 'Card 2 Image ', type: 'image' },
      { key: 'community_image_3', label: 'Card 3 Image ', type: 'image' },
    ],
  },
  {
    label: 'Video Testimonials',
    icon: '🎥',
    type: 'settings',
    fields: [
      { key: 'testimonial_video_1', label: 'YouTube Video 1 (URL or ID)', type: 'text' },
      { key: 'testimonial_video_2', label: 'YouTube Video 2 (URL or ID)', type: 'text' },
      { key: 'testimonial_video_3', label: 'YouTube Video 3 (URL or ID)', type: 'text' },
    ],
  },
  {
    label: 'Contact',
    icon: '📞',
    type: 'settings',
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
    label: 'Social Media',
    icon: '🔗',
    type: 'settings',
    fields: [
      { key: 'social_instagram', label: 'Instagram URL', type: 'url' },
      { key: 'social_facebook', label: 'Facebook URL', type: 'url' },
      { key: 'social_tripadvisor', label: 'TripAdvisor URL', type: 'url' },
      { key: 'social_google', label: 'Google Maps URL', type: 'url' },
    ],
  },
  {
    label: 'About Page',
    icon: '📖',
    type: 'about',
  },
];

// ── About Page Sub-Panel ──────────────────────────────────────────────────────
function AboutPanel() {
  const [story, setStory] = useState<Partial<AboutSection> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await aboutApi.list(1);
      const allData = res.data.data || res.data;
      const found = (Array.isArray(allData) ? allData : []).find(
        (s: AboutSection) => s.section_key === 'story'
      );
      if (found) {
        setStory(found);
        const imgUrl = (found as AboutSection & { image_url?: string }).image_url || found.image || null;
        setImagePreview(imgUrl);
      }
    } catch { /* empty */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleImageChange = (file: File | null) => {
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleSave = async () => {
    if (!story) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('section_key', 'story');
      fd.append('title_en', story.title_en || '');
      fd.append('title_es', story.title_es || '');
      fd.append('content_en', story.content_en || '');
      fd.append('content_es', story.content_es || '');
      fd.append('subtitle_en', story.subtitle_en || '');
      fd.append('subtitle_es', story.subtitle_es || '');
      fd.append('cta_text_en', '');
      fd.append('cta_text_es', '');
      fd.append('cta_link', '');
      fd.append('sort_order', String(story.sort_order ?? 1));
      fd.append('is_active', story.is_active ? '1' : '0');
      fd.append('_method', 'POST');
      if (imageFile) fd.append('image', imageFile);

      if (story.id) {
        await aboutApi.update(story.id, fd);
      } else {
        await aboutApi.create(fd);
      }

      setImageFile(null);
      setSuccessMsg('About Page saved successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
      load();
    } catch { /* empty */ }
    setSaving(false);
  };

  if (loading) return <Spinner />;

  if (!story) {
    return (
      <div className="text-center py-12 text-neutral-gray">
        <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>No story section found in the database.</p>
        <p className="text-sm mt-1">Run the database seeder on your server to create the initial data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {successMsg && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg bg-success/10 text-success text-sm font-medium border border-success/20"
        >
          {successMsg}
        </motion.div>
      )}

      {/* Status toggle */}
      <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 border border-gray-100">
        <div>
          <p className="text-sm font-medium text-neutral-dark">Section Visibility</p>
          <p className="text-xs text-neutral-gray mt-0.5">Toggle whether the Our Story section appears on the About page</p>
        </div>
        <FormToggle
          label=""
          checked={story.is_active ?? true}
          onChange={(v) => setStory({ ...story, is_active: v })}
        />
      </div>

      {/* Titles */}
      <div>
        <h4 className="text-sm font-semibold text-neutral-dark mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
          Section Title
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Title (English)"
            value={story.title_en || ''}
            onChange={(e) => setStory({ ...story, title_en: e.target.value })}
            placeholder="The Story Behind SpeakEasy Valencia"
          />
          <FormInput
            label="Title (Spanish)"
            value={story.title_es || ''}
            onChange={(e) => setStory({ ...story, title_es: e.target.value })}
            placeholder="Nuestra Historia"
          />
        </div>
      </div>

      {/* Subtitles */}
      <div>
        <h4 className="text-sm font-semibold text-neutral-dark mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
          Subtitle
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Subtitle (English)"
            value={story.subtitle_en || ''}
            onChange={(e) => setStory({ ...story, subtitle_en: e.target.value })}
            placeholder="Born from Passion"
          />
          <FormInput
            label="Subtitle (Spanish)"
            value={story.subtitle_es || ''}
            onChange={(e) => setStory({ ...story, subtitle_es: e.target.value })}
            placeholder="Nacida de la Pasión"
          />
        </div>
      </div>

      {/* Content */}
      <div>
        <h4 className="text-sm font-semibold text-neutral-dark mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
          Story Content
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormTextarea
            label="Content (English)"
            value={story.content_en || ''}
            onChange={(e) => setStory({ ...story, content_en: e.target.value })}
            rows={8}
            placeholder="Write the story in English..."
          />
          <FormTextarea
            label="Content (Spanish)"
            value={story.content_es || ''}
            onChange={(e) => setStory({ ...story, content_es: e.target.value })}
            rows={8}
            placeholder="Escribe la historia en español..."
          />
        </div>
      </div>

      {/* Image */}
      <div>
        <h4 className="text-sm font-semibold text-neutral-dark mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
          Section Image
        </h4>
        <div className="max-w-sm">
          <ImageUpload
            label="Story Image (e.g. Chef Gene photo)"
            preview={imagePreview}
            onChange={handleImageChange}
          />
        </div>
      </div>

      {/* Save button */}
      <div className="flex justify-end pt-4 border-t border-gray-100">
        <Button onClick={handleSave} loading={saving}>
          <Save className="w-4 h-4" /> Save About Page
        </Button>
      </div>
    </div>
  );
}

function getYouTubeThumbnail(urlOrId: string) {
  if (!urlOrId) return null;
  let videoId = '';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = urlOrId.match(regExp);
  if (match && match[2].length === 11) {
    videoId = match[2];
  } else {
    const shortsRegExp = /youtube\.com\/shorts\/([^#\&\?]*)/;
    const shortsMatch = urlOrId.match(shortsRegExp);
    if (shortsMatch && shortsMatch[1].length === 11) {
      videoId = shortsMatch[1];
    } else if (urlOrId.length === 11) {
      videoId = urlOrId;
    }
  }
  return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;
}

// ── Main Settings Page ────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeGroup, setActiveGroup] = useState(GROUPS[0].label);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalValues, setOriginalValues] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState('');
  const [files, setFiles] = useState<Record<string, File>>({});

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

  const updateFile = (key: string, file: File | null) => {
    const nextFiles = { ...files };
    if (file) {
      nextFiles[key] = file;
      updateValue(key, URL.createObjectURL(file));
    } else {
      delete nextFiles[key];
      updateValue(key, '');
    }
    setFiles(nextFiles);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      const cleanValues = { ...values };
      ['hero_video', 'community_image_1', 'community_image_2', 'community_image_3'].forEach(k => {
        if (cleanValues[k] && cleanValues[k].startsWith('blob:')) {
          delete cleanValues[k];
        }
      });
      fd.append('settings', JSON.stringify(cleanValues));
      Object.entries(files).forEach(([k, file]) => {
        fd.append(k, file);
      });
      await settingsApi.update(fd);

      const res = await settingsApi.list();
      const map: Record<string, string> = {};
      const settings = res.data.data || res.data;
      (Array.isArray(settings) ? settings : Object.entries(settings).map(([key, value]) => ({ key, value }))).forEach((s: Setting) => {
        map[s.key] = s.value || '';
      });
      setValues(map);
      setOriginalValues(map);
      setFiles({});
      setHasChanges(false);
      setSuccessMsg('Settings saved successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch { /* empty */ }
    setSaving(false);
  };

  const currentGroup = GROUPS.find(g => g.label === activeGroup)!;
  const isAboutTab = currentGroup?.type === 'about';

  return (
    <div>
      <PageHeader title="Settings" description="Manage site content, contact info, and configuration">
        {!isAboutTab && (
          <Button onClick={handleSave} loading={saving} disabled={!hasChanges}>
            <Save className="w-4 h-4" /> Save Changes
          </Button>
        )}
      </PageHeader>

      {successMsg && !isAboutTab && (
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

              {isAboutTab ? (
                <AboutPanel />
              ) : (
                <div className="space-y-4">
                  {currentGroup.fields?.map(field => {
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
                                  onClick={() => { updateFile(field.key, null); }}
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
                                    updateFile(field.key, file);
                                  }}
                                />
                              </label>
                            )}
                          </div>
                        </div>
                      );
                    }
                    if (field.type === 'image') {
                      const previewUrl = values[field.key]
                        ? (values[field.key].startsWith('blob:') || values[field.key].startsWith('http') || values[field.key].startsWith('/')
                          ? values[field.key]
                          : `/storage/${values[field.key]}`)
                        : '';
                      return (
                        <div key={field.key} className="max-w-md">
                          <ImageUpload
                            label={field.label}
                            preview={previewUrl}
                            onChange={(file) => updateFile(field.key, file)}
                          />
                        </div>
                      );
                    }
                    const isYoutubeField = field.key.startsWith('testimonial_video_');
                    const ytThumbnail = isYoutubeField ? getYouTubeThumbnail(values[field.key]) : null;

                    // Special handling for Google Maps Embed URL
                    if (field.key === 'contact_map_embed') {
                      const rawVal = values[field.key] || '';
                      // Auto-convert regular Google Maps URLs to embed format
                      const toEmbedUrl = (url: string) => {
                        if (!url) return '';
                        if (url.includes('/maps/embed')) return url;
                        // Convert share/place URLs like https://www.google.com/maps/place/...
                        const match = url.match(/google\.com\/maps/);
                        if (match) {
                          // Try to extract coordinates or just wrap as a q= search
                          const coordMatch = url.match(/@(-?[\d.]+),(-?[\d.]+)/);
                          if (coordMatch) {
                            return `https://www.google.com/maps/embed?pb=!1m0!3m2!1sen!2ses!4v1&center=${coordMatch[1]},${coordMatch[2]}`;
                          }
                          // Fallback: extract place name from URL
                          const placeMatch = url.match(/\/maps\/place\/([^/@]+)/);
                          if (placeMatch) {
                            return `https://www.google.com/maps/embed/v1/place?key=AIzaSyD-placeholder&q=${placeMatch[1]}`;
                          }
                        }
                        return url;
                      };
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
                          type={field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : 'text'}
                          value={values[field.key] || ''}
                          onChange={(e) => updateValue(field.key, e.target.value)}
                        />
                        {ytThumbnail && (
                          <div className="mt-2 relative w-full max-w-[240px] aspect-video rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50">
                            <img src={ytThumbnail} alt="YouTube Preview" className="w-full h-full object-cover animate-fade-in" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                              <svg className="w-10 h-10 text-white drop-shadow-md" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
}

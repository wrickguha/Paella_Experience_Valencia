import { createContext, useContext, useEffect, useState, ReactNode, CSSProperties } from 'react';
import { fetchSettings } from '@/services/api';

type SettingsMap = Record<string, string>;

interface SettingsContextValue {
  settings: SettingsMap;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextValue>({
  settings: {},
  loading: true,
});

/** Load a Google Font dynamically by injecting a <link> into <head> */
const SYSTEM_FONTS = new Set(['Georgia', 'Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana']);

function loadGoogleFont(fontFamily: string) {
  if (!fontFamily || SYSTEM_FONTS.has(fontFamily)) return;
  const id = `gfont-${fontFamily.replace(/\s+/g, '-').toLowerCase()}`;
  if (document.getElementById(id)) return;
  const href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:wght@300;400;500;600;700;800&display=swap`;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}

/** Fetches all site settings once and shares them across the tree */
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SettingsMap>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings()
      .then((data) => {
        setSettings(data);
        // Auto-load Google Fonts for any per-section font family settings
        Object.entries(data).forEach(([key, value]) => {
          if (key.endsWith('_font_family') && value) {
            loadGoogleFont(value);
          }
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}

/**
 * Returns inline style object for a given homepage section.
 * Keys stored as: hp_<sectionId>_font_family  /  hp_<sectionId>_font_size
 *
 * sectionId examples: 'hero', 'highlights', 'community', 'testimonials',
 *                     'level_test', 'how_it_works', 'events'
 */
export function useSectionStyle(sectionId: string, pagePrefix = 'hp'): CSSProperties {
  const { settings } = useSettings();

  const normalizedId = sectionId.replace(/-/g, '_');
  let fontFamily = settings[sectionId + '_font_family'];
  let rawSize    = settings[sectionId + '_font_size'];

  if (!fontFamily) {
    fontFamily =
      settings[`${pagePrefix}_${normalizedId}_font_family`] ||
      settings[`langtest_${normalizedId}_font_family`] ||
      settings[`about_${normalizedId}_font_family`] ||
      settings[`testim_${normalizedId}_font_family`] ||
      settings[`exp_${normalizedId}_font_family`] ||
      settings[`hp_${normalizedId}_font_family`];
  }
  if (!rawSize) {
    rawSize =
      settings[`${pagePrefix}_${normalizedId}_font_size`] ||
      settings[`langtest_${normalizedId}_font_size`] ||
      settings[`about_${normalizedId}_font_size`] ||
      settings[`testim_${normalizedId}_font_size`] ||
      settings[`exp_${normalizedId}_font_size`] ||
      settings[`hp_${normalizedId}_font_size`];
  }

  const fontSize = rawSize ? parseInt(rawSize, 10) : undefined;
  const style: Record<string, string> = {};

  if (fontFamily) {
    const fontStr = `"${fontFamily}", sans-serif`;
    style['fontFamily'] = fontStr;
    style['--site-font-family'] = fontStr;
  }
  if (fontSize && !isNaN(fontSize) && fontSize > 0) {
    const scale = fontSize / 16;
    style['fontSize'] = `${fontSize}px`;
    style['--section-font-size'] = `${fontSize}px`;
    style['--section-font-scale'] = String(scale);
  }

  return style as CSSProperties;
}

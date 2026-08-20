import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  applyThemePreference,
  resolveThemePreference,
  systemPrefersDark,
  type ResolvedTheme,
  type ThemePreference,
} from '../lib/theme';

const ThemeContext = createContext<ResolvedTheme>('light');

export function ThemeProvider({ preference, children }: { preference: ThemePreference; children: ReactNode }) {
  const [systemDark, setSystemDark] = useState(systemPrefersDark);
  const resolved = useMemo(() => resolveThemePreference(preference, systemDark), [preference, systemDark]);

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!media) return;
    const sync = () => setSystemDark(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    applyThemePreference(document.documentElement, resolved);
  }, [resolved]);

  return <ThemeContext.Provider value={resolved}>{children}</ThemeContext.Provider>;
}

export function useResolvedTheme(): ResolvedTheme {
  return useContext(ThemeContext);
}

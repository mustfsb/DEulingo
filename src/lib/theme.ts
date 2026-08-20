export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export function resolveThemePreference(preference: ThemePreference, systemIsDark: boolean): ResolvedTheme {
  if (preference === 'light' || preference === 'dark') return preference;
  return systemIsDark ? 'dark' : 'light';
}

export function applyThemePreference(root: HTMLElement, resolvedTheme: ResolvedTheme): void {
  root.dataset.theme = resolvedTheme;
  root.style.colorScheme = resolvedTheme;
}

export function systemPrefersDark(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

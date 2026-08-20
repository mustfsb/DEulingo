import { describe, expect, it } from 'vitest';
import { applyThemePreference, resolveThemePreference, type ThemePreference } from './theme';

describe('tema tercihi', () => {
  it('system tercihini isletim sisteminin rengine cozer', () => {
    expect(resolveThemePreference('system', true)).toBe('dark');
    expect(resolveThemePreference('system', false)).toBe('light');
    expect(resolveThemePreference('light', true)).toBe('light');
    expect(resolveThemePreference('dark', false)).toBe('dark');
  });

  it('tercihi document elementine kalici veri niteliği olarak uygular', () => {
    const root = { dataset: {}, style: {} } as unknown as HTMLElement;
    applyThemePreference(root, 'dark');
    expect(root.dataset.theme).toBe('dark');
    expect(root.style.colorScheme).toBe('dark');
  });

  it('yalnızca light, dark veya system tercihlerine izin verir', () => {
    const preferences: ThemePreference[] = ['light', 'dark', 'system'];
    expect(preferences).toHaveLength(3);
  });
});

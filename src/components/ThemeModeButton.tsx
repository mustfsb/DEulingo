import type { ResolvedTheme } from '../lib/theme';

export function ThemeModeButton({
  theme,
  onChange,
}: {
  theme: ResolvedTheme;
  onChange: (preference: ResolvedTheme) => void;
}) {
  const nextTheme = theme === 'light' ? 'dark' : 'light';
  const label = nextTheme === 'dark' ? 'Koyu temaya geç' : 'Açık temaya geç';

  return (
    <button
      type="button"
      className="theme-nav-toggle"
      aria-label={label}
      title={label}
      onClick={() => onChange(nextTheme)}
    >
      <span aria-hidden="true">{nextTheme === 'dark' ? '☾' : '☀'}</span>
    </button>
  );
}

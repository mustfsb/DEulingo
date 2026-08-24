import { useEffect } from 'react';
import { useProgressState } from './hooks/useProgress';
import { ThemeProvider, useResolvedTheme } from './hooks/useTheme';
import { ThemeModeButton } from './components/ThemeModeButton';
import { hrefFor, useRoute, type Route } from './lib/router';
import { DayIntroScreen } from './screens/DayIntroScreen';
import { DebugScreen } from './screens/DebugScreen';
import { HomeScreen } from './screens/HomeScreen';
import { LessonCompleteScreen } from './screens/LessonCompleteScreen';
import { LessonScreen } from './screens/LessonScreen';
import { MistakesScreen } from './screens/MistakesScreen';
import { StatsScreen } from './screens/StatsScreen';
import { SummaryDayScreen } from './screens/SummaryDayScreen';
import { SummaryIndexScreen } from './screens/SummaryIndexScreen';

const NAV: Array<{ route: Route; label: string; matches: Route['name'][] }> = [
  { route: { name: 'home' }, label: 'Öğren', matches: ['home', 'day'] },
  { route: { name: 'summaries' }, label: 'Özetler', matches: ['summaries', 'summary'] },
  { route: { name: 'mistakes' }, label: 'Hatalarım', matches: ['mistakes'] },
  { route: { name: 'stats' }, label: 'İstatistik', matches: ['stats'] },
];

export default function App() {
  const { route, navigate } = useRoute();
  const api = useProgressState();

  return (
    <ThemeProvider preference={api.progress.settings.themePreference}>
      <AppContents route={route} navigate={navigate} api={api} />
    </ThemeProvider>
  );
}

function AppContents({
  route,
  navigate,
  api,
}: {
  route: ReturnType<typeof useRoute>['route'];
  navigate: ReturnType<typeof useRoute>['navigate'];
  api: ReturnType<typeof useProgressState>;
}) {

  // Ders modunda kabuk gizlenir: dikkat dagitan gezinme olmaz.
  const isLesson = route.name === 'lesson' || route.name === 'review' || route.name === 'mistake-review';
  if (isLesson) {
    return (
      <LessonScreen
        // `key` kritik: ders rotalari ayni bileseni paylasir. Anahtar olmadan
        // React ornegi yeniden kullanir ve bir dersten digerine gecis
        // (orn. "Zor Sorular") ekranda hicbir sey degistirmez.
        key={hrefFor(route)}
        mode={route.name === 'lesson' ? 'day' : route.name === 'review' ? 'review' : 'mistakes'}
        track={route.name === 'lesson' ? route.track : route.name === 'mistake-review' ? route.track : route.name === 'review' ? route.track : undefined}
        day={route.name === 'lesson' ? route.day : route.name === 'mistake-review' ? route.day : undefined}
        sessionMode={route.name === 'lesson' ? route.mode : undefined}
        topicId={route.name === 'lesson' ? route.topicId : undefined}
        exerciseSetId={route.name === 'lesson' ? route.exerciseSetId : undefined}
        api={api}
        navigate={navigate}
      />
    );
  }

  // Ders sonucu da kabuksuz bir "ders sonu" ekranidir; kalici sonuctan beslenir.
  if (route.name === 'complete') {
    const result = api.progress.lastResult;
    if (!result) return <MissingResult navigate={navigate} />;
    return <LessonCompleteScreen key={result.sessionId} result={result} api={api} navigate={navigate} />;
  }

  return (
    <div className="min-h-dvh">
      <TopNav
        current={route}
        navigate={navigate}
        onThemeChange={(themePreference) =>
          api.update((current) => ({
            ...current,
            settings: { ...current.settings, themePreference },
          }))
        }
      />
      {route.name === 'home' && <HomeScreen api={api} navigate={navigate} />}
      {route.name === 'day' && <DayIntroScreen track={route.track} day={route.day} api={api} navigate={navigate} />}
      {route.name === 'summaries' && <SummaryIndexScreen api={api} navigate={navigate} />}
      {route.name === 'summary' && (
        <SummaryDayScreen track={route.track} day={route.day} topicId={route.topicId} api={api} navigate={navigate} />
      )}
      {route.name === 'mistakes' && <MistakesScreen track={route.track} api={api} navigate={navigate} />}
      {route.name === 'stats' && <StatsScreen api={api} />}
      {route.name === 'debug' && <DebugScreen />}
    </div>
  );
}

/** `#/sonuc` dogrudan acildiysa (ya da ilerleme sifirlandiysa) sessizce donulur. */
function MissingResult({ navigate }: { navigate: (route: Route) => void }) {
  useEffect(() => {
    navigate({ name: 'home' });
  }, [navigate]);

  return (
    <main className="mx-auto max-w-[640px] px-5 py-20 text-center">
      <h1 className="text-3xl">Gösterilecek bir ders sonucu yok</h1>
      <button type="button" className="btn mt-6" onClick={() => navigate({ name: 'home' })}>
        Ana Sayfaya Dön
      </button>
    </main>
  );
}

function TopNav({
  current,
  navigate,
  onThemeChange,
}: {
  current: Route;
  navigate: (route: Route) => void;
  onThemeChange: (theme: 'light' | 'dark') => void;
}) {
  const theme = useResolvedTheme();
  return (
    <header className="border-b-2 border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-[980px] items-center gap-2 px-4 py-3 sm:px-5">
        <a
          href={hrefFor({ name: 'home' })}
          className="mr-auto flex items-center gap-2"
          aria-label="Ana sayfa"
        >
          {/* Umlaut isareti — uygulamanin yapisal markasi */}
          <span className="flex gap-1" aria-hidden="true">
            <span className="block size-2.5 rounded-full" style={{ background: 'var(--color-brand)' }} />
            <span className="block size-2.5 rounded-full" style={{ background: 'var(--color-signal)' }} />
          </span>
          <span className="font-display text-lg font-extrabold tracking-tight">
            DEulingo
          </span>
        </a>

        <nav className="nav-scroll flex min-w-0 items-center gap-0.5 sm:gap-1">
          {NAV.map((item) => (
            <button
              key={item.label}
              type="button"
              className="nav-link"
              aria-current={item.matches.includes(current.name) ? 'page' : undefined}
              onClick={() => navigate(item.route)}
            >
              {item.label}
            </button>
          ))}
          {import.meta.env.DEV && (
            <button
              type="button"
              className="nav-link text-xs"
              aria-current={current.name === 'debug' ? 'page' : undefined}
              onClick={() => navigate({ name: 'debug' })}
              title="Yalnızca geliştirme modunda görünür"
            >
              içerik
            </button>
          )}
        </nav>
        <ThemeModeButton theme={theme} onChange={onThemeChange} />
      </div>
    </header>
  );
}

import { useEffect } from 'react';
import { useProgressState } from './hooks/useProgress';
import { useSkillsState } from './hooks/useSkills';
import { useStudyClock } from './hooks/useStudyClock';
import { addActiveSeconds, stopActivityTracking } from './lib/skills-storage';
import { ThemeProvider, useResolvedTheme } from './hooks/useTheme';
import { LanguageSelector } from './components/LanguageSelector';
import { ThemeModeButton } from './components/ThemeModeButton';
import { hrefFor, useRoute, type Route } from './lib/router';
import { DebugScreen } from './screens/DebugScreen';
import { GeneralReviewScreen } from './screens/GeneralReviewScreen';
import { HomeScreen } from './screens/HomeScreen';
import { LessonCompleteScreen } from './screens/LessonCompleteScreen';
import { LessonScreen } from './screens/LessonScreen';
import { ListeningHomeScreen } from './screens/ListeningHomeScreen';
import { ListeningTaskScreen } from './screens/ListeningTaskScreen';
import { MistakesScreen } from './screens/MistakesScreen';
import { ReadingHomeScreen } from './screens/ReadingHomeScreen';
import { ReadingPassageScreen } from './screens/ReadingPassageScreen';
import { ReadingIntroScreen } from './screens/ReadingIntroScreen';
import { ReadingReviewScreen } from './screens/ReadingReviewScreen';
import { ReadingVocabScreen } from './screens/ReadingVocabScreen';
import { WeeklyAnalysisScreen } from './screens/WeeklyAnalysisScreen';
import { SpeakingHomeScreen } from './screens/SpeakingHomeScreen';
import { StatsScreen } from './screens/StatsScreen';
import { ReviewSummaryScreen, SummaryTopicScreen } from './screens/SummaryTopicScreen';
import { SummaryIndexScreen } from './screens/SummaryIndexScreen';
import { TopicScreen } from './screens/TopicScreen';
import { VocabHomeScreen } from './screens/VocabHomeScreen';
import { VocabListScreen } from './screens/VocabListScreen';
import { VocabStudyScreen } from './screens/VocabStudyScreen';
import { WeeklyReviewScreen } from './screens/WeeklyReviewScreen';
import { WritingHomeScreen } from './screens/WritingHomeScreen';

const NAV: Array<{ route: Route; label: string; matches: Route['name'][] }> = [
  { route: { name: 'home' }, label: 'Dersler', matches: ['home', 'topic'] },
  { route: { name: 'general-review' }, label: 'Genel Tekrar', matches: ['general-review'] },
  { route: { name: 'vocab' }, label: 'Kelime', matches: ['vocab', 'vocab-list', 'vocab-study'] },
  { route: { name: 'summaries' }, label: 'Özetler', matches: ['summaries', 'summary', 'review-summary'] },
  { route: { name: 'mistakes' }, label: 'Hatalarım', matches: ['mistakes'] },
  { route: { name: 'stats' }, label: 'İstatistik', matches: ['stats'] },
];

/** İngilizce beceri gezgini — ikinci satırda, başlığı kalabalıklaştırmadan. */
const EN_SKILL_NAV: Array<{ route: Route; label: string; matches: Route['name'][] }> = [
  { route: { name: 'reading' }, label: 'Reading', matches: ['reading', 'reading-passage', 'reading-intro', 'reading-vocab'] },
  { route: { name: 'writing' }, label: 'Writing', matches: ['writing'] },
  { route: { name: 'listening' }, label: 'Listening', matches: ['listening', 'listening-task'] },
  { route: { name: 'speaking' }, label: 'Speaking', matches: ['speaking'] },
  { route: { name: 'weekly' }, label: 'Haftalık', matches: ['weekly', 'weekly-analysis'] },
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
  const { skills, update: updateSkills } = useSkillsState();

  // Haftalık plandan `Git` ile açılan aktivitenin GERÇEK aktif süresi ölçülür.
  // Plan ya da ana sayfaya dönünce ölçüm durur; süre hiçbir şeyi kilitlemez.
  const tracking = skills.weekly.tracking;
  const offTask = route.name === 'weekly' || route.name === 'home';
  // Yalnızca plana/ana sayfaya GEÇİŞTE durdurulur: `Git` izlemeyi başlattığında
  // rota henüz "haftalik"tir (hash değişimi asenkron); o an durdurulmamalı.
  useEffect(() => {
    if (offTask) updateSkills(stopActivityTracking);
  }, [offTask, updateSkills]);
  useStudyClock(tracking !== null && !offTask, (seconds) => updateSkills((state) => addActiveSeconds(state, seconds)));

  // Ders modunda kabuk gizlenir: dikkat dagitan gezinme olmaz.
  // Kelime oturumu da ayni odagi ister.
  const isLesson =
    route.name === 'lesson' ||
    route.name === 'review' ||
    route.name === 'mistake-review' ||
    route.name === 'vocab-study';
  if (isLesson) {
    if (route.name === 'vocab-study') {
      return (
        <VocabStudyScreen
          key={hrefFor(route)}
          kind={(route.kind ?? 'mixed') as Parameters<typeof VocabStudyScreen>[0]['kind']}
          topicId={route.topicId}
          size={route.size}
          api={api}
          navigate={navigate}
        />
      );
    }
    return (
      <LessonScreen
        // `key` kritik: ders rotalari ayni bileseni paylasir. Anahtar olmadan
        // React ornegi yeniden kullanir ve bir dersten digerine gecis
        // (orn. "Zor Sorular") ekranda hicbir sey degistirmez.
        key={hrefFor(route)}
        mode={route.name === 'lesson' ? 'topic' : route.name === 'review' ? 'review' : 'mistakes'}
        topicId={route.name === 'lesson' ? route.topicId : undefined}
        sessionMode={route.name === 'lesson' ? route.mode : undefined}
        sectionId={route.name === 'lesson' ? route.sectionId : undefined}
        all={route.name === 'lesson' ? route.all : undefined}
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
        language={api.language}
        onLanguageChange={api.setLanguage}
        onThemeChange={(themePreference) =>
          api.update((current) => ({
            ...current,
            settings: { ...current.settings, themePreference },
          }))
        }
      />
      {route.name === 'home' && <HomeScreen api={api} navigate={navigate} />}
      {route.name === 'topic' && <TopicScreen key={route.topicId} topicId={route.topicId} api={api} navigate={navigate} />}
      {route.name === 'general-review' && <GeneralReviewScreen api={api} navigate={navigate} />}
      {route.name === 'vocab' && <VocabHomeScreen api={api} navigate={navigate} />}
      {route.name === 'vocab-list' && <VocabListScreen api={api} navigate={navigate} />}
      {route.name === 'summaries' && <SummaryIndexScreen api={api} navigate={navigate} />}
      {route.name === 'summary' && (
        <SummaryTopicScreen
          key={route.topicId}
          topicId={route.topicId}
          sectionId={route.sectionId}
          api={api}
          navigate={navigate}
        />
      )}
      {route.name === 'review-summary' && (
        <ReviewSummaryScreen sectionId={route.sectionId} api={api} navigate={navigate} />
      )}
      {route.name === 'mistakes' && <MistakesScreen key={route.scope ?? 'all'} api={api} navigate={navigate} scope={route.scope} />}
      {route.name === 'stats' && <StatsScreen api={api} />}
      {route.name === 'reading' && <ReadingHomeScreen key={hrefFor(route)} skills={skills} navigate={navigate} initialFilter={route.filter} />}
      {route.name === 'reading-passage' && route.view !== 'review' && (
        <ReadingPassageScreen key={route.passageId} passageId={route.passageId} skills={skills} onRecord={updateSkills} navigate={navigate} />
      )}
      {route.name === 'reading-passage' && route.view === 'review' && (
        <ReadingReviewScreen key={`review:${route.passageId}`} passageId={route.passageId} skills={skills} navigate={navigate} />
      )}
      {route.name === 'reading-intro' && <ReadingIntroScreen navigate={navigate} />}
      {route.name === 'reading-vocab' && <ReadingVocabScreen skills={skills} onRecord={updateSkills} navigate={navigate} api={api} />}
      {route.name === 'writing' && <WritingHomeScreen key={hrefFor(route)} skills={skills} onRecord={updateSkills} navigate={navigate} initialTaskId={route.taskId} initialStage={route.stage} />}
      {route.name === 'listening' && <ListeningHomeScreen key={hrefFor(route)} skills={skills} onRecord={updateSkills} navigate={navigate} api={api} initial={{ topicId: route.topicId, kind: route.kind, focus: route.focus, itemId: route.itemId }} />}
      {route.name === 'listening-task' && <ListeningTaskScreen key={route.taskId} taskId={route.taskId} skills={skills} onRecord={updateSkills} navigate={navigate} />}
      {route.name === 'speaking' && <SpeakingHomeScreen key={hrefFor(route)} skills={skills} onRecord={updateSkills} navigate={navigate} api={api} initial={{ kind: route.kind, promptId: route.promptId, topicId: route.topicId, focus: route.focus, retry: route.retry }} />}
      {route.name === 'weekly' && <WeeklyReviewScreen api={api} skills={skills} onSkills={updateSkills} navigate={navigate} />}
      {route.name === 'weekly-analysis' && <WeeklyAnalysisScreen api={api} skills={skills} navigate={navigate} />}
      {route.name === 'debug' && <DebugScreen skills={skills} />}
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
  language,
  onLanguageChange,
  onThemeChange,
}: {
  current: Route;
  navigate: (route: Route) => void;
  language: ReturnType<typeof useProgressState>['language'];
  onLanguageChange: ReturnType<typeof useProgressState>['setLanguage'];
  onThemeChange: (theme: 'light' | 'dark') => void;
}) {
  const theme = useResolvedTheme();
  const isEnglish = language === 'en';
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

        <nav className="nav-scroll flex min-w-0 items-center gap-0.5 sm:gap-1" aria-label="Ana gezinme">
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
        <LanguageSelector language={language} onChange={onLanguageChange} />
      </div>
      {isEnglish && (
        <div className="mx-auto max-w-[980px] px-4 pb-2 sm:px-5">
          <nav className="nav-scroll flex min-w-0 items-center gap-0.5 sm:gap-1" aria-label="İngilizce beceriler">
            <span className="mr-1 text-xs font-bold uppercase tracking-wide text-ink-faint">Skills:</span>
            {EN_SKILL_NAV.map((item) => (
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
          </nav>
        </div>
      )}
    </header>
  );
}

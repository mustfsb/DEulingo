/**
 * Ders sonucu (§26–§33).
 *
 * Ekran YALNIZCA kalici `lastResult`'tan beslenir. Bu yuzden:
 *   - sayfa yenilense de sonuc, hatalar ve challenge baglami durur,
 *   - eylemler hangi konuya/oturuma ait olduklarini bilir,
 *   - yeni bir ders bitince eski sonucun eylemleri asla acilmaz.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { exercisesById, exercisesForTopic, getTopicSummary, topics, topicsById, topicTitle } from '../lib/content';
import { audioController } from '../lib/audio/playback';
import { goalProgress, markGoalCelebrated } from '../lib/daily-goal';
import { MOTION, prefersReducedMotion } from '../lib/motion';
import { challengeReadiness } from '../lib/session';
import { buildMistakeQueueIds } from '../lib/session-result';
import type { ProgressApi } from '../hooks/useProgress';
import type { Route } from '../lib/router';
import type { LessonResult } from '../lib/storage';

export interface LessonCompleteScreenProps {
  result: LessonResult;
  api: ProgressApi;
  navigate: (route: Route) => void;
}

/** Bu esigin ustu "harika", altindaki dusuk sonuc suclanmadan yonlendirilir. */
const NEAR_PERFECT = 0.9;
const NEEDS_WORK = 0.7;

export function LessonCompleteScreen({ result, api, navigate }: LessonCompleteScreenProps) {
  const { progress, update } = api;
  const reduced = useMemo(prefersReducedMotion, []);
  const [revealed, setRevealed] = useState(reduced);
  const [pending, setPending] = useState<string | null>(null);
  const soundPlayed = useRef(false);

  const accuracy = result.accuracy === null ? null : Math.round(result.accuracy * 100);
  // Yalnızca konu dersi bir konuya bağlıdır; tekrar oturumları konular arasıdır.
  const topicId = result.mode === 'topic' ? result.topicId : undefined;
  const isFollowUp = result.mode !== 'topic';

  const mistakeIds = useMemo(
    () =>
      buildMistakeQueueIds(result, {
        mistakes: progress.mistakes,
        exists: (id) => exercisesById.has(id),
      }),
    [progress.mistakes, result],
  );

  // Müfredat haritasında sıradaki konu (konular yaşayan modüllerdir; bu yalnızca bir öneridir).
  const topicIndex = topicId ? topics.findIndex((topic) => topic.id === topicId) : -1;
  const nextTopic = topicIndex >= 0 ? topics[topicIndex + 1] : undefined;
  const challengeReady = topicId ? challengeReadiness(exercisesForTopic(topicId)).ready : false;
  const hasSummary = Boolean(topicId && getTopicSummary(topicId));

  const ranked = result.topics;
  const strongest = ranked[0];
  const weakest = ranked.at(-1);
  const showWeakest = Boolean(weakest && weakest !== strongest && weakest.correct / weakest.total < 0.8);
  const weakTopicPracticable = Boolean(showWeakest && weakest && topicsById.has(weakest.topicId));

  // Kisa kutlama gecisi: once "tamamlandı", hemen ardindan detay (§27).
  useEffect(() => {
    if (revealed) return;
    const timer = setTimeout(() => setRevealed(true), MOTION.celebration * 0.75);
    return () => clearTimeout(timer);
  }, [revealed]);

  // Gunluk hedef bu derste dolduysa KUCUK bir satir gosterilir; ust uste
  // ikinci bir tam ekran kutlama acilmaz (§39).
  //
  // Deger ILK CIZIMDE mandallanir: asagidaki etki "kutlandi" isaretini yazinca
  // `justReached` false'a doner ve satir bir anda kaybolurdu.
  const goal = goalProgress(progress);
  const [goalJustReached] = useState(goal.justReached);

  // Tamamlama sesi bir kez; mukemmel derste daha guclu ton (§28). Gunluk hedef
  // de bu derste dolduysa efekti UST USTE degil, ardindan calar.
  useEffect(() => {
    if (soundPlayed.current) return;
    soundPlayed.current = true;
    const contextId = `complete:${result.sessionId}`;
    const soundEffects = progress.settings.soundEffects;
    void (async () => {
      await audioController.playEffect(contextId, result.perfect ? 'perfect' : 'complete', soundEffects);
      if (goalJustReached) await audioController.playEffect(contextId, 'goal', soundEffects);
    })().catch(() => undefined);
    return () => audioController.dispose(contextId);
    // Bilerek bos bagimlilik: efekt yalnizca ekran ilk acildiginda calar,
    // sonraki cizimlerde (buton durumu, hedef isareti) tekrar tetiklenmez.
  }, []);
  useEffect(() => {
    if (!goalJustReached) return;
    update((current) => markGoalCelebrated(current));
  }, [goalJustReached, update]);

  const run = (id: string, action: () => void) => {
    // Cift tiklama korumasi: oturum kurulurken buton mesgul gorunur (§41, §42).
    if (pending) return;
    setPending(id);
    action();
  };

  const startMistakeReview = () =>
    run('mistakes', () => {
      update((current) => ({
        ...current,
        activeLesson: {
          mode: 'mistakes',
          queue: mistakeIds.map((exerciseId) => ({ exerciseId, presentationReason: 'primary' as const })),
          index: 0,
          startedAt: new Date().toISOString(),
          results: [],
          retries: {},
          streak: { current: 0, best: 0, firedMilestones: [] },
          sourceSessionId: result.sessionId,
        },
      }));
      navigate({ name: 'mistake-review' });
    });

  const startChallenge = () =>
    run('challenge', () => {
      if (!topicId) return;
      navigate({ name: 'lesson', topicId, mode: 'challenge' });
    });

  const repeatSession = () =>
    run('repeat', () => {
      if (!topicId) return;
      navigate({
        name: 'lesson',
        topicId,
        mode: result.sessionMode ?? 'normal',
        ...(result.sessionMode === 'section' && result.sectionId ? { sectionId: result.sectionId } : {}),
      });
    });

  const practiceWeakTopic = () =>
    run('weak-topic', () => {
      if (!weakest) return;
      navigate({ name: 'lesson', topicId: weakest.topicId, mode: 'quick' });
    });

  const headline = resultHeadline(result, accuracy, isFollowUp);

  /* Eylem hiyerarsisi: tek bir birincil oneri, digerleri sakin (§31). */
  const actions: Array<{ id: string; label: string; onClick: () => void; tone?: 'primary' | 'plain' | 'quiet' }> = [];
  const canReview = mistakeIds.length > 0 && !isFollowUp;

  if (canReview) {
    actions.push({
      id: 'mistakes',
      label: `Hataları Tekrarla (${mistakeIds.length})`,
      onClick: startMistakeReview,
    });
  }
  if (isFollowUp && weakTopicPracticable && weakest) {
    actions.push({ id: 'weak-topic', label: `Zayıf Konuyu Tekrarla: ${weakest.title}`, onClick: practiceWeakTopic });
  }
  if (challengeReady && topicId && result.sessionMode !== 'challenge') {
    actions.push({ id: 'challenge', label: '🔥 Zor Sorular', onClick: startChallenge });
  }
  if (nextTopic) {
    actions.push({
      id: 'next-topic',
      label: `Sıradaki Konu: ${nextTopic.title}`,
      onClick: () => run('next-topic', () => navigate({ name: 'topic', topicId: nextTopic.id })),
    });
  }
  if (!isFollowUp && topicId) {
    actions.push({ id: 'repeat', label: 'Tekrar Çalış', onClick: repeatSession });
  }
  // Haritanın son konusunda ölü bir "Sıradaki" butonu yerine gerçek
  // alternatif sunulur (§33).
  if (!nextTopic && topicId) {
    actions.push({
      id: 'quick',
      label: 'Hızlı Tekrar',
      onClick: () => run('quick', () => navigate({ name: 'lesson', topicId, mode: 'quick' })),
    });
  }
  if (Object.keys(progress.mistakes).length > 0) {
    actions.push({
      id: 'all-mistakes',
      label: 'Hatalarım',
      onClick: () => run('all-mistakes', () => navigate({ name: 'mistakes' })),
    });
  }
  if (hasSummary && topicId) {
    actions.push({
      id: 'summary',
      label: '📖 Özeti Oku',
      onClick: () =>
        run('summary', () =>
          navigate({ name: 'summary', topicId, ...(result.sectionId ? { sectionId: result.sectionId } : {}) }),
        ),
    });
  }
  if (result.mode === 'review') {
    actions.push({
      id: 'general-review',
      label: '🔁 Genel Tekrar’a Dön',
      onClick: () => run('general-review', () => navigate({ name: 'general-review' })),
    });
  }
  actions.push({
    id: 'home',
    label: 'Ana Sayfaya Dön',
    onClick: () => run('home', () => navigate({ name: 'home' })),
  });

  const primaryId = pickPrimaryAction({
    result,
    accuracy,
    canReview,
    challengeReady,
    nextTopicId: nextTopic?.id,
    isFollowUp,
    weakTopicPracticable,
  });

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[640px] flex-col justify-center gap-7 px-5 py-14">
      <div className="anim-pop">
        <div
          className="anim-stamp mb-6 grid size-20 place-items-center rounded-3xl text-4xl"
          style={{ background: result.perfect ? 'var(--color-good)' : 'var(--color-signal)' }}
          aria-hidden="true"
        >
          {result.perfect ? '★' : '✓'}
        </div>
        <h1 className="text-4xl sm:text-5xl">{headline.title}</h1>
        <p className="mt-2 text-lg text-ink-soft">{headline.subtitle}</p>
        {goalJustReached && (
          <p className="mt-3 font-bold" style={{ color: 'var(--color-good-deep)' }}>
            ✓ Bugünkü hedef tamamlandı — {goal.targetMinutes} dakika
          </p>
        )}
      </div>

      {!revealed ? (
        <p className="text-ink-faint" aria-hidden="true">
          Sonuçlar hazırlanıyor…
        </p>
      ) : (
        <>
          <div className="card anim-pop divide-y-2 divide-line overflow-hidden">
            <Row label="Tam doğru" value={result.correctCount} color="var(--color-good)" />
            {result.typoCount > 0 && (
              <Row label="Küçük yazım hatası" value={result.typoCount} color="var(--color-warn)" />
            )}
            <Row label="Yanlış" value={result.incorrectCount} color="var(--color-bad)" />
            {result.skippedCount > 0 && (
              <Row label="Atlanan" value={result.skippedCount} color="var(--color-ink-faint)" />
            )}
            {result.selfAssessedCount > 0 && (
              <Row
                label="Sesli / kendi değerlendirmen"
                value={result.selfAssessedCount}
                color="var(--color-ink-faint)"
              />
            )}
            <div className="flex items-baseline justify-between px-5 py-4">
              <span className="font-bold">Doğruluk</span>
              <span className="numeral text-3xl">{accuracy === null ? '—' : `%${accuracy}`}</span>
            </div>
            {result.bestStreak >= 3 && (
              <div className="flex items-baseline justify-between px-5 py-4">
                <span className="font-bold">En uzun seri</span>
                <span className="numeral text-2xl">🔥 {result.bestStreak}</span>
              </div>
            )}
          </div>

          {(strongest || showWeakest) && (
            <div className="flex flex-col gap-2 anim-pop">
              {strongest && strongest.total > 0 && (
                <p className="text-[0.98rem]">
                  <span className="font-bold" style={{ color: 'var(--color-good-deep)' }}>
                    En güçlü:{' '}
                  </span>
                  {strongest.title} ({strongest.correct}/{strongest.total})
                </p>
              )}
              {showWeakest && weakest && (
                <p className="text-[0.98rem]">
                  <span className="font-bold" style={{ color: 'var(--color-warn)' }}>
                    Tekrar önerisi:{' '}
                  </span>
                  {weakest.title} ({weakest.correct}/{weakest.total})
                  {topicsById.has(weakest.topicId) && (
                    <>
                      {' · '}
                      <button
                        type="button"
                        className="underline underline-offset-2"
                        onClick={() => navigate({ name: 'summary', topicId: weakest.topicId })}
                      >
                        özeti aç
                      </button>
                      {' · '}
                      <button type="button" className="underline underline-offset-2" onClick={practiceWeakTopic}>
                        konuyu çalış
                      </button>
                    </>
                  )}
                </p>
              )}
            </div>
          )}

          {!canReview && !isFollowUp && result.incorrectCount === 0 && (
            <p className="text-[0.98rem] text-ink-soft">Mükemmel — tekrar gerekmiyor.</p>
          )}

          <div className="flex flex-col gap-3">
            {actions.map((action) => (
              <button
                key={action.id}
                type="button"
                className={`btn ${action.id === primaryId ? 'btn-primary' : action.id === 'home' ? 'btn-quiet' : ''}`}
                aria-busy={pending === action.id || undefined}
                disabled={Boolean(pending) && pending !== action.id}
                onClick={action.onClick}
              >
                {action.label}
              </button>
            ))}
          </div>
        </>
      )}
    </main>
  );
}

export function resultHeadline(
  result: LessonResult,
  accuracy: number | null,
  isFollowUp: boolean,
): { title: string; subtitle: string } {
  const answered = `${result.total} soru`;
  if (isFollowUp) {
    return {
      title: result.mode === 'mistakes' ? 'Hataların tekrar edildi' : 'Tekrar tamamlandı',
      subtitle:
        result.incorrectCount === 0
          ? `${answered} · hepsi doğru`
          : `${answered} · ${result.correctCount + result.typoCount} doğru · ${result.incorrectCount} tekrar öneriliyor`,
    };
  }
  const label =
    result.mode === 'topic' && result.topicId ? topicTitle(result.topicId) : result.mode === 'review' ? 'Genel Tekrar' : 'Tekrar';
  if (result.perfect) {
    return { title: 'Mükemmel ders!', subtitle: `${label} · ${answered} · tüm sorular doğru.` };
  }
  if (accuracy !== null && accuracy >= NEAR_PERFECT * 100) {
    return { title: 'Harika çalışma!', subtitle: `${label} tamamlandı · ${answered}` };
  }
  if (accuracy !== null && accuracy < NEEDS_WORK * 100) {
    return { title: 'Bir tur daha iyi olur', subtitle: `${label} tamamlandı · ${answered}` };
  }
  return { title: `${label} tamamlandı!`, subtitle: `${answered} çözüldü.` };
}

/** Birincil oneri sonuca gore degisir; besi de esit guclu buton gosterilmez. */
export function pickPrimaryAction(input: {
  result: LessonResult;
  accuracy: number | null;
  canReview: boolean;
  challengeReady: boolean;
  nextTopicId?: string;
  isFollowUp: boolean;
  weakTopicPracticable: boolean;
}): string {
  const { result, accuracy, canReview, challengeReady, nextTopicId, isFollowUp, weakTopicPracticable } = input;
  const challengeOffered = challengeReady && result.sessionMode !== 'challenge';
  if (isFollowUp) {
    if (weakTopicPracticable) return 'weak-topic';
    return result.mode === 'review' ? 'general-review' : 'home';
  }
  if (canReview) return 'mistakes';
  if (result.perfect && nextTopicId !== undefined) return 'next-topic';
  if (accuracy !== null && accuracy >= NEAR_PERFECT * 100 && challengeOffered) return 'challenge';
  if (challengeOffered) return 'challenge';
  if (nextTopicId !== undefined) return 'next-topic';
  return 'home';
}

function Row({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5">
      <span className="flex items-center gap-2.5">
        <span className="size-3 rounded-full" style={{ background: color }} aria-hidden="true" />
        {label}
      </span>
      <span className="numeral text-2xl">{value}</span>
    </div>
  );
}

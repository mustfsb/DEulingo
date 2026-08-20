import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ExerciseView } from '../components/exercise/ExerciseView';
import { emptyInput, hasInput } from '../components/exercise/types';
import { FeedbackPanel } from '../components/FeedbackPanel';
import { AudioButton } from '../components/AudioButton';
import { Markup } from '../components/Markup';
import { ComboIndicator, StreakCelebration } from '../components/StreakCelebration';
import {
  exercisesBeforeDay,
  exercisesById,
  exercisesForDay,
  summaryTopicForExercise,
  topicDay,
} from '../lib/content';
import { cancelScheduledRetry, scheduleRetry } from '../lib/lesson';
import { buildSessionPlan } from '../lib/session';
import { buildLessonResult, completeLesson } from '../lib/session-result';
import { applyAttemptToStreak, milestoneCopy } from '../lib/streak';
import { recordAttempt } from '../lib/progress';
import type { ProgressApi } from '../hooks/useProgress';
import type { Route } from '../lib/router';
import type { ActiveLesson, AttemptResult, LessonKind, SessionMode } from '../lib/storage';
import type { Exercise, ExerciseSetId } from '../content/types';
import { evaluateExercise, type ExerciseInput, type ValidationResult } from '../lib/validation';
import { shouldAutoplayPrompt } from '../lib/audio/tts';
import { audioController, type SoundEffect } from '../lib/audio/playback';

export interface LessonScreenProps {
  mode: LessonKind;
  day?: number;
  sessionMode?: SessionMode;
  topicId?: string;
  exerciseSetId?: ExerciseSetId;
  api: ProgressApi;
  navigate: (route: Route) => void;
}

const MODE_LABEL: Record<SessionMode, string> = {
  normal: 'Normal Çalışma',
  full: 'Tam Çalışma',
  quick: 'Hızlı Tekrar',
  challenge: 'Zor Sorular',
  topic: 'Konu Çalışması',
  set: 'Alıştırma Seti',
};

/**
 * Ders yasam dongusu (§12):
 *   gun → oturum kurulumu → aktif ders → SONUC ROTASI (#/sonuc)
 *
 * Tamamlanma artik bu bilesenin yerel state'i DEGILDIR. Ders bitince yapili
 * sonuc kalici ilerlemeye yazilir ve ayri bir rotaya gecilir; boylece
 * "Hataları Tekrarla" / "Zor Sorular" gibi devam eylemleri gercek bir gecis
 * yapar ve sayfa yenilense bile sonuc kaybolmaz.
 */
export function LessonScreen({
  mode,
  day,
  sessionMode = 'normal',
  topicId,
  exerciseSetId,
  api,
  navigate,
}: LessonScreenProps) {
  const { progress, update } = api;
  const active = progress.activeLesson;
  // İçerik güncellemesi bir soruyu kaldırmış olabilir. Böyle bir yarım ders
  // ekranda takılmak yerine güncel havuzdan güvenle yeniden kurulur.
  const hasRemovedExercise = active?.queue.some((item) => !exercisesById.has(item.exerciseId)) ?? false;
  // Yarim kalan oturum ancak AYNI tur + AYNI gun + AYNI mod + AYNI konu ise surdurulur.
  const matches =
    active &&
    !hasRemovedExercise &&
    active.mode === mode &&
    (mode === 'day'
      ? active.day === day &&
        (active.sessionMode ?? 'normal') === sessionMode &&
        active.topicId === topicId &&
        active.exerciseSetId === exerciseSetId
      : mode === 'mistakes'
        ? active.day === day
        : true);

  // Ders bittikten sonra bu ekran kisa bir sure daha monte kalir (hash degisimi
  // asenkrondur). Bayrak olmadan asagidaki kurulum etkisi "aktif ders yok"
  // gorup HAYALET bir oturum acar ve ana sayfada yarim ders gibi gorunur.
  const finishing = useRef(false);

  const onFinish = useCallback(
    (lesson: ActiveLesson) => {
      if (finishing.current) return;
      finishing.current = true;
      const result = buildLessonResult(lesson, { lookup: (id) => exercisesById.get(id) });
      update((current) => completeLesson(current, result));
      navigate({ name: 'complete' });
    },
    [navigate, update],
  );

  // Oturum yoksa (ya da baska bir gune aitse) yeni kuyruk kur.
  useEffect(() => {
    if (matches || finishing.current) return;
    if (mode === 'day' && day !== undefined) {
      const pool = exercisesForDay(day);
      // Birincil sıra ders başlamadan tamamen kurulur: ID'ler benzersizdir ve
      // hata tekrarları bu sıra yerine ayrı, gerekçeli sunumlar olarak eklenir.
      const plan = buildSessionPlan({
        pool,
        previous: exercisesBeforeDay(day),
        progress,
        mode: sessionMode,
        topicId,
        exerciseSetId,
        // Her oturumda değişen ama tekrar üretilebilir tohum.
        seed: `${day}:${sessionMode}:${topicId ?? ''}:${exerciseSetId ?? ''}:${progress.days[day]?.sessionsCompleted ?? 0}`,
      });

      if (!plan.primaryQueue.length) {
        navigate({ name: 'day', day });
        return;
      }
      update((current) => ({
        ...current,
        activeLesson: {
          mode: 'day',
          day,
          sessionMode,
          topicId,
          exerciseSetId,
          queue: plan.primaryQueue,
          index: 0,
          startedAt: new Date().toISOString(),
          results: [],
          retries: {},
          streak: { current: 0, best: 0, firedMilestones: [] },
        },
      }));
    } else if (mode !== 'day') {
      // Tekrar oturumlari her zaman ONCEDEN kurulur (sonuc ekrani ya da
      // Hatalarim ekrani tarafindan). Dogrudan URL ile gelindiyse listeye don.
      navigate({ name: 'mistakes' });
    }
  }, [matches, mode, day, sessionMode, topicId, exerciseSetId, progress, update, navigate]);

  if (!active || !matches) {
    return <div className="p-10 text-center text-ink-soft">Ders hazırlanıyor…</div>;
  }
  return <LessonRunner lesson={active} onFinish={onFinish} navigate={navigate} api={api} />;
}

function LessonRunner({
  lesson,
  api,
  navigate,
  onFinish,
}: {
  lesson: ActiveLesson;
  api: ProgressApi;
  navigate: (route: Route) => void;
  onFinish: (lesson: ActiveLesson) => void;
}) {
  const { update } = api;
  const done = lesson.index >= lesson.queue.length;

  useEffect(() => {
    if (done) onFinish(lesson);
  }, [done, lesson, onFinish]);

  const exercise = useMemo(
    () => exercisesById.get(lesson.queue[lesson.index]?.exerciseId ?? ''),
    [lesson.queue, lesson.index],
  );

  const advance = useCallback(() => {
    update((current) =>
      current.activeLesson
        ? { ...current, activeLesson: { ...current.activeLesson, index: current.activeLesson.index + 1 } }
        : current,
    );
  }, [update]);

  const commit = useCallback(
    (
      target: Exercise,
      attemptResult: AttemptResult,
      validation: ValidationResult | null,
      value: ExerciseInput,
      responseTimeMs: number,
    ): number | undefined => {
      const presentationReason = lesson.queue[lesson.index]?.presentationReason ?? 'primary';
      // Seri gecisi bir kez, saf bicimde hesaplanir; hem kalici duruma yazilir
      // hem de kutlamayi tetiklemek icin geri dondurulur.
      const step = applyAttemptToStreak(lesson.streak, attemptResult, presentationReason);

      update((current) => {
        const next = recordAttempt(current, target, value, attemptResult, validation ?? undefined, {
          responseTimeMs,
        });
        const activeLesson = next.activeLesson;
        if (!activeLesson) return next;

        let queue = activeLesson.queue;
        let retries = activeLesson.retries;
        const currentPresentation = activeLesson.queue[activeLesson.index];
        if (attemptResult === 'incorrect' && currentPresentation?.presentationReason === 'primary') {
          const scheduled = scheduleRetry(queue, activeLesson.index, target.id, retries);
          queue = scheduled.queue;
          retries = scheduled.retries;
        } else if (
          attemptResult === 'correct' ||
          attemptResult === 'minor-typo' ||
          attemptResult === 'self-assessed'
        ) {
          // Yanlış geri bildirimindeki manuel düzeltme de "doğru" akışıdır:
          // daha gösterilmemiş hata retry'ı dersin içine sızmaz.
          queue = cancelScheduledRetry(queue, activeLesson.index, target.id);
        }
        return {
          ...next,
          activeLesson: {
            ...activeLesson,
            queue,
            retries,
            streak: step.state,
            results: [
              ...activeLesson.results,
              { exerciseId: target.id, result: attemptResult, presentationReason },
            ],
          },
        };
      });

      return step.milestone;
    },
    [lesson.index, lesson.queue, lesson.streak, update],
  );

  if (done) {
    return <div className="p-10 text-center text-ink-soft">Sonuçlar hazırlanıyor…</div>;
  }

  if (!exercise) {
    return <div className="p-10 text-center text-ink-soft">Alıştırma bulunamadı.</div>;
  }

  return (
    <ExerciseStep
      /* Her adim kendi durumuyla yeniden kurulur: onceki geri bildirim sizmaz. */
      key={`${lesson.queue[lesson.index]?.presentationReason ?? 'primary'}:${exercise.id}#${lesson.index}`}
      exercise={exercise}
      lesson={lesson}
      showPronunciation={api.progress.settings.showPronunciation}
      soundEffects={api.progress.settings.soundEffects}
      autoPronunciation={api.progress.settings.autoPronunciation}
      speechSpeed={api.progress.settings.speechSpeed}
      speechVoice={api.progress.settings.speechVoice}
      onCommit={commit}
      onAdvance={advance}
      onExit={() => navigate(lesson.day ? { name: 'day', day: lesson.day } : { name: 'home' })}
      onOpenSummary={(topicId, day) => navigate({ name: 'summary', day, topicId })}
    />
  );
}

interface ExerciseStepProps {
  exercise: Exercise;
  lesson: ActiveLesson;
  onCommit: (
    exercise: Exercise,
    result: AttemptResult,
    validation: ValidationResult | null,
    value: ExerciseInput,
    responseTimeMs: number,
  ) => number | undefined;
  onAdvance: () => void;
  onExit: () => void;
  onOpenSummary: (topicId: string, day: number) => void;
  showPronunciation: boolean;
  soundEffects: boolean;
  autoPronunciation: boolean;
  speechSpeed: import('../lib/audio/tts').SpeechSpeed;
  speechVoice: import('../lib/audio/tts').GermanVoiceId;
}

function ExerciseStep({
  exercise,
  lesson,
  onCommit,
  onAdvance,
  onExit,
  onOpenSummary,
  showPronunciation,
  soundEffects,
  autoPronunciation,
  speechSpeed,
  speechVoice,
}: ExerciseStepProps) {
  const [input, setInputState] = useState<ExerciseInput>(() => emptyInput(exercise));
  const [result, setResultState] = useState<ValidationResult | null>(null);
  const [milestone, setMilestone] = useState<number | null>(null);
  // Bir seçim ve onu izleyen Enter aynı tarayıcı olayı içinde gelebilir.
  // Ref'ler React yeniden çizimini beklemeden en güncel cevabı/geri bildirimi
  // klavye kısayoluna verir.
  const inputRef = useRef<ExerciseInput>(input);
  const resultRef = useRef<ValidationResult | null>(result);
  const celebratingRef = useRef(false);
  const setInput = useCallback((next: ExerciseInput) => {
    inputRef.current = next;
    setInputState(next);
  }, []);
  const setResult = useCallback((next: ValidationResult | null) => {
    resultRef.current = next;
    setResultState(next);
  }, []);
  const startedAt = useRef(Date.now());
  // Kimlik hem soru ID'sini hem oturum sırasını taşır: aynı soru retry ile
  // dönerse eski isteğin yeni örneğe sızması da engellenir.
  const audioContextId = `lesson:${lesson.startedAt}:${exercise.id}:${lesson.index}`;
  const promptTarget = exercise.audio?.prompt;

  useEffect(() => {
    audioController.activate(audioContextId);
    return () => audioController.dispose(audioContextId);
  }, [audioContextId]);

  useEffect(() => {
    if (!autoPronunciation || !promptTarget || !shouldAutoplayPrompt(exercise)) return;
    void audioController.speakGerman(audioContextId, promptTarget, speechSpeed, speechVoice).catch(() => undefined);
  }, [audioContextId, autoPronunciation, exercise, promptTarget, speechSpeed, speechVoice]);

  const stopAudio = useCallback(() => audioController.dispose(audioContextId), [audioContextId]);
  const continueToNext = useCallback(() => {
    stopAudio();
    onAdvance();
  }, [onAdvance, stopAudio]);

  const check = useCallback(() => {
    if (resultRef.current) return;
    const currentInput = inputRef.current;
    const elapsed = Date.now() - startedAt.current;
    if (exercise.type === 'spoken') {
      onCommit(exercise, 'self-assessed', null, 'tamamlandı', elapsed);
      continueToNext();
      return;
    }
    if (!hasInput(exercise, currentInput)) return;
    const evaluation = evaluateExercise(exercise, currentInput);
    setResult(evaluation);
    const reached = onCommit(exercise, evaluation.status, evaluation, currentInput, elapsed);
    if (reached) {
      celebratingRef.current = true;
      setMilestone(reached);
    }
  }, [exercise, onCommit, continueToNext, setResult]);

  const selfOverride = useCallback(() => {
    const currentResult = resultRef.current;
    if (!currentResult) return;
    setResult({ ...currentResult, status: 'correct' });
    onCommit(exercise, 'self-assessed', currentResult, inputRef.current, Date.now() - startedAt.current);
  }, [exercise, onCommit, setResult]);

  const skip = useCallback(() => {
    onCommit(exercise, 'skipped', null, inputRef.current, Date.now() - startedAt.current);
    continueToNext();
  }, [exercise, onCommit, continueToNext]);

  // Enter: cevap varsa kontrol eder; geri bildirim görünürse odak nerede olursa
  // olsun devam eder. Kelime bankasının görünmez buffer'ı yalnızca cevap
  // aşamasında Enter'ı sahiplenir.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey) return;
      if (event.repeat) return;
      // Kutlama gorunurken tus yalnizca kutlamayi kapatir; ayni basisla soru
      // atlanmaz.
      if (celebratingRef.current) return;
      if (event.key === 'Enter' && resultRef.current) {
        event.preventDefault();
        continueToNext();
        return;
      }
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((event.target as HTMLElement | null)?.tagName ?? '')) return;
      // Kelime-bankası kendi görünmez yazım buffer'ına Enter/R dahil tüm
      // klavyeyi sahiplenir; üst seviye kısayol onu asla değiştirmez.
      if (exercise.type === 'word-bank-translation') return;
      if (event.key.toLowerCase() === 'r' && promptTarget) {
        event.preventDefault();
        void audioController.speakGerman(audioContextId, promptTarget, speechSpeed, speechVoice).catch(() => undefined);
        return;
      }
      if (event.key !== 'Enter') return;
      event.preventDefault();
      const target = event.target as HTMLElement | null;
      const choice = target?.closest<HTMLButtonElement>('button[role="radio"]');
      if (choice && !choice.disabled && choice.getAttribute('aria-checked') !== 'true') choice.click();
      check();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [audioContextId, check, continueToNext, exercise.type, promptTarget, speechSpeed, speechVoice]);

  const total = lesson.queue.length;
  const position = lesson.index + 1;
  const label =
    lesson.mode === 'mistakes'
      ? `${lesson.day ? `${lesson.day}. Gün · ` : ''}Hata Tekrarı`
      : lesson.mode === 'review'
        ? 'Tekrar'
        : lesson.sessionMode === 'set' && lesson.exerciseSetId
          ? `${lesson.day}. Gün · ${lesson.exerciseSetId.replace('set-', '')}. Set`
          : `${lesson.day}. Gün · ${MODE_LABEL[lesson.sessionMode ?? 'normal']}`;
  const summaryTopic = summaryTopicForExercise(exercise);
  const canCheck = exercise.type === 'spoken' || hasInput(exercise, input);
  const showPromptAbove = exercise.type === 'multiple-choice' && Boolean(exercise.prompt);
  const streak = lesson.streak?.current ?? 0;
  const milestoneEffect: SoundEffect | undefined = milestone
    ? milestoneCopy(milestone).effect
    : undefined;

  return (
    <div className="flex min-h-dvh flex-col">
      {milestone !== null && (
        <StreakCelebration
          streak={milestone}
          onDone={() => {
            celebratingRef.current = false;
            setMilestone(null);
          }}
        />
      )}
      <header className="sticky top-0 z-10 bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-[820px] items-center gap-4 px-4 py-4 sm:px-6">
          <button
            type="button"
            className="btn btn-quiet px-2 text-2xl leading-none"
            aria-label="Dersten çık"
            onClick={() => {
              stopAudio();
              onExit();
            }}
          >
            ←
          </button>
          <div className="flex-1">
            <div
              className="rail"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={total}
              aria-valuenow={lesson.index}
              aria-label={`${position} / ${total}`}
            >
              <div className="rail-fill" style={{ width: `${(lesson.index / total) * 100}%` }} />
            </div>
          </div>
          {/* Seri 2'den once hic gorunmez: sifirda duran bir sayac motive etmez. */}
          <ComboIndicator streak={streak} />
          <span className="eyebrow whitespace-nowrap">
            {label} · {position}/{total}
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[820px] flex-1 px-4 pb-56 pt-6 sm:px-6 sm:pt-10">
        <div className={result?.status === 'incorrect' ? 'anim-shake' : 'anim-pop'}>
          <p className="eyebrow mb-3 flex flex-wrap items-center gap-2">
            <span>{exercise.topic}</span>
            {exercise.difficulty === 'hard' && (
              <span
                className="badge"
                style={{ background: 'var(--color-warn-soft)', color: 'var(--color-warn)' }}
                title="Bu soru daha güçlü hatırlama gerektirir"
              >
                🔥 Zor
              </span>
            )}
          </p>
          <h1 className="mb-6 text-[1.75rem] sm:text-4xl">
            <Markup text={exercise.instruction} />
          </h1>

          {promptTarget && (!showPromptAbove || exercise.type === 'dictation' || exercise.type === 'listen-choice') && (
            <div className="mb-5 flex items-center gap-2">
              <AudioButton target={promptTarget} contextId={audioContextId} speed={speechSpeed} voice={speechVoice} />
              {exercise.type === 'dictation' && <span className="text-sm text-ink-soft">Duyduğunu yaz.</span>}
            </div>
          )}

          {showPromptAbove && (
            <div className="mb-6">
              <span className="pronunciation-hover-target">
                <span
                  className="pronunciation-hover-text font-display text-2xl leading-snug sm:text-[1.75rem]"
                  style={{ fontVariationSettings: "'wdth' 108", fontWeight: 700 }}
                  lang="de"
                >
                  <Markup text={exercise.prompt!} />
                </span>
                {promptTarget && <AudioButton target={promptTarget} contextId={audioContextId} speed={speechSpeed} voice={speechVoice} compact revealOnHover />}
              </span>
            </div>
          )}

          <ExerciseView
            exercise={exercise}
            value={input}
            onChange={setInput}
            onSubmit={check}
            locked={result !== null}
            result={result}
            audioContextId={audioContextId}
            speechSpeed={speechSpeed}
            speechVoice={speechVoice}
          />

          {exercise.hint && !result && (
            <p className="mt-6 text-[0.95rem] text-ink-faint">
              💡 <Markup text={exercise.hint} />
            </p>
          )}
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t-2 border-line bg-surface">
        <div className="mx-auto flex max-w-[820px] flex-col gap-3 px-4 py-4 sm:px-6">
          {result && (
            <div className="anim-rise">
              <FeedbackPanel
                exercise={exercise}
                result={result}
                showPronunciation={showPronunciation}
                soundEffects={soundEffects}
                autoPronunciation={autoPronunciation}
                speechSpeed={speechSpeed}
                speechVoice={speechVoice}
                audioContextId={audioContextId}
                milestoneEffect={milestoneEffect}
                onSelfOverride={result.status === 'incorrect' ? selfOverride : undefined}
                summaryLabel={summaryTopic?.title}
                onOpenSummary={
                  summaryTopic
                    ? // Karma tekrarda konu onceki bir gune ait olabilir.
                      () => {
                        stopAudio();
                        onOpenSummary(summaryTopic.id, topicDay.get(summaryTopic.id) ?? exercise.day);
                      }
                    : undefined
                }
              />
            </div>
          )}
          <div className="flex items-center gap-3">
            {!result && exercise.type !== 'spoken' && (
              <button type="button" className="btn btn-quiet" onClick={skip}>
                Atla
              </button>
            )}
            <button
              type="button"
              className={`btn flex-1 ${
                result ? (result.status === 'incorrect' ? 'btn-bad' : 'btn-good') : 'btn-primary'
              }`}
              disabled={!canCheck}
              onClick={() => (result ? continueToNext() : check())}
            >
              {result ? 'Devam' : exercise.type === 'spoken' ? 'Tamamladım' : 'Kontrol Et'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

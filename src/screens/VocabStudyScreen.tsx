/**
 * Kelime oturum koşucusu.
 *
 * Mevcut ders altyapısı yeniden kullanılır (`ExerciseView`,
 * `FeedbackPanel`, `AudioButton`, `recordAttempt`, hata takibi) — ama ders
 * kuyruğuna (`activeLesson`) DOKUNULMAZ; oturum bu ekrana yereldir. Böylece
 * kelime ustalığı ders tamamlamayı ASLA etkilemez.
 *
 * - Yanlış → 3–6 soru sonra en fazla 1 kez tekrar.
 * - Yazma/dikte sorularında artikel denetimi (`validateVocabTyping`):
 *   artikelsiz isim kısmi doğruluk, yanlış artikel affedilmez.
 * - Dinleme sorusunda hedef cevap gösterilmeden önce ses dinletilir.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ExerciseView } from '../components/exercise/ExerciseView';
import { emptyInput, hasInput } from '../components/exercise/types';
import { FeedbackPanel } from '../components/FeedbackPanel';
import { AudioButton } from '../components/AudioButton';
import { Markup } from '../components/Markup';
import { VOCAB_BY_ID } from '../content/vocabulary/inventory';
import { topicTitle } from '../lib/content';
import { recordAttempt } from '../lib/progress';
import { evaluateExercise, type ExerciseInput, type ValidationResult } from '../lib/validation';
import { validateDetrTyping, validateVocabTyping } from '../lib/vocab/validate';
import { buildVocabSession, type VocabKind, type VocabQuestion } from '../lib/vocab/questions';
import { audioController } from '../lib/audio/playback';
import type { GermanVoiceId, SpeechSpeed } from '../lib/audio/tts';
import type { ProgressApi } from '../hooks/useProgress';
import type { Route } from '../lib/router';
import type { AttemptResult } from '../lib/storage';

const KIND_LABEL: Record<VocabKind, string> = {
  mixed: 'Tüm Kelimeler',
  detr: 'Almanca → Türkçe',
  trde: 'Türkçe → Almanca',
  match: 'Eşleştirme',
  type: 'Yazma',
  listen: 'Dinleme',
  weak: 'Zayıf Kelimeler',
  flash: 'Kartlar',
  marathon: '244 Kelime Taraması',
  topic: 'Konu Kelimeleri',
};

function isVocabTyping(question: VocabQuestion): boolean {
  const id = question.exercise.id;
  return (
    (question.exercise.type === 'free-text' || question.exercise.type === 'dictation') &&
    (id.endsWith('-trde-type') || id.endsWith('-listen-type'))
  );
}

function isDetrTyping(question: VocabQuestion): boolean {
  return question.exercise.type === 'free-text' && question.exercise.id.endsWith('-detr-type');
}

export function VocabStudyScreen({
  kind,
  topicId,
  size,
  api,
  navigate,
}: {
  kind: VocabKind;
  topicId?: string;
  size?: string;
  api: ProgressApi;
  navigate: (route: Route) => void;
}) {
  const { progress, update } = api;
  const seedRef = useRef(`${Date.now()}-${Math.floor(Math.random() * 1e9)}`);
  // Oturum BAŞLANGIÇTAKİ ilerlemeyle bir kez kurulur (zayıf-öncelik donar).
  const initial = useRef(progress);
  const questions = useMemo(
    () =>
      buildVocabSession({
        kind,
        topicId,
        size: size === 'quick' || size === 'normal' || size === 'full' || size === 'marathon' ? size : 'normal',
        seed: seedRef.current,
        progress: initial.current,
      }),
    [kind, topicId, size],
  );

  const [queue, setQueue] = useState<VocabQuestion[]>(questions);
  const [index, setIndex] = useState(0);
  const [, setRetries] = useState<Record<string, number>>({});
  const [results, setResults] = useState<Array<{ id: string; result: AttemptResult }>>([]);

  useEffect(() => {
    setQueue(questions);
    setIndex(0);
    setRetries({});
    setResults([]);
  }, [questions]);

  const done = index >= queue.length;
  const question = queue[index];

  const record = useCallback(
    (q: VocabQuestion, result: AttemptResult, validation: ValidationResult | null, value: ExerciseInput) => {
      update((current) => recordAttempt(current, q.exercise, value, result, validation ?? undefined, {}));
      setResults((prev) => [...prev, { id: q.exercise.id, result }]);
      if (result === 'incorrect') {
        setRetries((prev) => {
          const used = prev[q.exercise.id] ?? 0;
          if (used >= 1) return prev;
          setQueue((current) => {
            const gap = 3 + Math.floor(Math.random() * 4);
            const at = Math.min(current.length, index + 1 + gap);
            const next = [...current];
            next.splice(at, 0, q);
            return next;
          });
          return { ...prev, [q.exercise.id]: used + 1 };
        });
      }
    },
    [update, index],
  );

  if (!questions.length) {
    return (
      <main className="mx-auto max-w-[640px] px-5 py-20 text-center">
        <h1 className="text-3xl">Bu başlık için kelime bulunamadı</h1>
        <button type="button" className="btn mt-6" onClick={() => navigate({ name: 'vocab' })}>
          Kelime Çalışmasına Dön
        </button>
      </main>
    );
  }

  if (done) {
    const correct = results.filter((r) => r.result === 'correct').length;
    const missed = [...new Set(results.filter((r) => r.result === 'incorrect').map((r) => r.id))]
      .map((id) => queue.find((q) => q.exercise.id === id))
      .filter((q): q is VocabQuestion => Boolean(q))
      .flatMap((q) => q.vocabIds)
      .filter((id, i, arr) => arr.indexOf(id) === i)
      .map((id) => VOCAB_BY_ID.get(id))
      .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
    return (
      <main className="mx-auto w-full max-w-[640px] px-5 pb-24 pt-10 text-center">
        <p className="eyebrow">Kelime oturumu bitti</p>
        <h1 className="mt-1 text-4xl">
          {correct} / {results.length} doğru
        </h1>
        {missed.length > 0 && (
          <section className="mt-8 text-left">
            <h2 className="eyebrow mb-3">Tekrar bakılacaklar</h2>
            <ul className="flex flex-col gap-2">
              {missed.map((entry) => (
                <li key={entry.id} className="card p-3">
                  <span className="de font-bold" lang="de">{entry.german}</span>
                  <span aria-hidden="true"> — </span>
                  <span>{entry.turkish}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
        <div className="mt-8 flex flex-col gap-3">
          <button
            type="button"
            className="btn btn-primary w-full"
            onClick={() => {
              seedRef.current = `${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
              initial.current = api.progress;
              const fresh = buildVocabSession({
                kind,
                topicId,
                size: size === 'quick' || size === 'normal' || size === 'full' || size === 'marathon' ? size : 'normal',
                seed: seedRef.current,
                progress: initial.current,
              });
              setQueue(fresh);
              setIndex(0);
              setRetries({});
              setResults([]);
              window.scrollTo({ top: 0 });
            }}
          >
            Tekrar Çalış
          </button>
          <button type="button" className="btn w-full" onClick={() => navigate({ name: 'vocab' })}>
            Kelime Çalışmasına Dön
          </button>
        </div>
      </main>
    );
  }

  if (!question) return <div className="p-10 text-center text-ink-soft">Soru hazırlanıyor…</div>;

  return (
    <VocabStep
      key={`${question.exercise.id}#${index}`}
      question={question}
      position={index + 1}
      total={queue.length}
      label={`${KIND_LABEL[kind]}${topicId ? ` · ${topicTitle(topicId)}` : ''}`}
      showPronunciation={progress.settings.showPronunciation}
      soundEffects={progress.settings.soundEffects}
      autoPronunciation={progress.settings.autoPronunciation}
      speechSpeed={progress.settings.speechSpeed}
      speechVoice={progress.settings.speechVoice}
      onCommit={record}
      onAdvance={() => setIndex((i) => i + 1)}
      onExit={() => navigate({ name: 'vocab' })}
    />
  );
}

function VocabStep({
  question,
  position,
  total,
  label,
  showPronunciation,
  soundEffects,
  autoPronunciation,
  speechSpeed,
  speechVoice,
  onCommit,
  onAdvance,
  onExit,
}: {
  question: VocabQuestion;
  position: number;
  total: number;
  label: string;
  showPronunciation: boolean;
  soundEffects: boolean;
  autoPronunciation: boolean;
  speechSpeed: SpeechSpeed;
  speechVoice: GermanVoiceId;
  onCommit: (q: VocabQuestion, result: AttemptResult, validation: ValidationResult | null, value: ExerciseInput) => void;
  onAdvance: () => void;
  onExit: () => void;
}) {
  const { exercise } = question;
  const [input, setInput] = useState<ExerciseInput>(() => emptyInput(exercise));
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [flashBack, setFlashBack] = useState(false);
  const audioContextId = `vocab:${exercise.id}:${position}`;
  const isFlash = exercise.type === 'spoken';

  useEffect(() => {
    audioController.activate(audioContextId);
    return () => audioController.dispose(audioContextId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioContextId]);

  const promptTarget = exercise.audio?.prompt;
  const showPromptAudio = Boolean(promptTarget) && exercise.type !== 'listen-choice' && exercise.type !== 'dictation';
  const listenHidden = exercise.type === 'listen-choice' || exercise.type === 'dictation';

  const check = () => {
    if (result) return;
    if (!isFlash && !hasInput(exercise, input)) return;
    if (isFlash) return;
    let evaluation: ValidationResult;
    if (isVocabTyping(question) && typeof input === 'string') {
      evaluation = validateVocabTyping(question.primaryVocabId, input);
    } else if (isDetrTyping(question) && typeof input === 'string') {
      evaluation = validateDetrTyping(question.primaryVocabId, input);
    } else {
      evaluation = evaluateExercise(exercise, input);
    }
    setResult(evaluation);
    const status: AttemptResult =
      evaluation.status === 'correct' ? 'correct' : evaluation.status === 'minor-typo' ? 'minor-typo' : 'incorrect';
    onCommit(question, status, evaluation, input);
  };

  const gradeFlash = (grade: AttemptResult) => {
    if (result) return;
    const evaluation: ValidationResult = {
      status: grade === 'correct' ? 'correct' : grade === 'minor-typo' ? 'minor-typo' : 'incorrect',
      expected: `${question.exercise.prompt} — ${VOCAB_BY_ID.get(question.primaryVocabId)?.turkish ?? ''}`,
      normalizedInput: grade,
    };
    setResult(evaluation);
    onCommit(question, grade, evaluation, grade);
  };

  const skip = () => {
    onCommit(question, 'skipped', null, input);
    audioController.dispose(audioContextId);
    onAdvance();
  };

  const next = () => {
    audioController.dispose(audioContextId);
    onAdvance();
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.repeat) return;
      // Yazi girdisi Enter'i zaten isledi (`preventDefault`): ayni basista
      // hem kontrol hem ilerleme yapilmamasi icin burada dur.
      if (event.defaultPrevented) return;
      if (event.key === 'Enter' && result) {
        event.preventDefault();
        next();
        return;
      }
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((event.target as HTMLElement | null)?.tagName ?? '')) return;
      if (event.key !== 'Enter' || result || isFlash) return;
      event.preventDefault();
      check();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, input, isFlash]);

  const entry = VOCAB_BY_ID.get(question.primaryVocabId);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-10 bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-[820px] items-center gap-2 px-4 py-4 sm:gap-4 sm:px-6">
          <button type="button" className="btn btn-quiet px-2 text-2xl leading-none" aria-label="Kelime çalışmasından çık" onClick={() => { audioController.dispose(audioContextId); onExit(); }}>
            ←
          </button>
          <div className="flex-1">
            <div className="rail" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={position - 1} aria-label={`${position} / ${total}`}>
              <div className="rail-fill" style={{ width: `${((position - 1) / total) * 100}%` }} />
            </div>
          </div>
          <span className="eyebrow whitespace-nowrap">{label} · {position}/{total}</span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[820px] flex-1 px-4 pb-56 pt-6 sm:px-6 sm:pt-10">
        <div className={result?.status === 'incorrect' ? 'anim-shake' : 'anim-pop'}>
          <h1 className="mb-6 text-[1.75rem] sm:text-4xl">
            <Markup text={exercise.instruction} />
          </h1>

          {listenHidden && promptTarget && (
            <div className="mb-5 flex items-center gap-3">
              <AudioButton target={promptTarget} contextId={audioContextId} speed={speechSpeed} voice={speechVoice} />
              <span className="text-sm text-ink-soft">Cevap gösterilmeden dinle.</span>
            </div>
          )}
          {showPromptAudio && promptTarget && (
            <div className="mb-5 flex items-center gap-2">
              <AudioButton target={promptTarget} contextId={audioContextId} speed={speechSpeed} voice={speechVoice} compact />
            </div>
          )}

          {exercise.prompt && !listenHidden && (
            <div className="mb-6">
              <span className="font-display text-2xl leading-snug sm:text-[1.75rem]" style={{ fontWeight: 700 }} lang={exercise.type === 'multiple-choice' && question.exercise.id.includes('detr') ? 'de' : undefined}>
                <Markup text={exercise.prompt} />
              </span>
            </div>
          )}

          {isFlash && entry ? (
            <div className="card p-6 text-center">
              <p className="font-display text-3xl font-bold" lang="de">{entry.german}</p>
              {!flashBack ? (
                <button type="button" className="btn mt-6" onClick={() => setFlashBack(true)}>
                  Cevabı Göster
                </button>
              ) : (
                <div className="anim-pop">
                  <p className="mt-4 text-2xl">{entry.turkish}</p>
                  {!result ? (
                    <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                      <button type="button" className="btn btn-good flex-1" onClick={() => gradeFlash('correct')}>Biliyorum</button>
                      <button type="button" className="btn flex-1" onClick={() => gradeFlash('minor-typo')}>Zorlandım</button>
                      <button type="button" className="btn btn-bad flex-1" onClick={() => gradeFlash('incorrect')}>Bilmiyorum</button>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          ) : (
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
              />
            </div>
          )}
          <div className="flex items-center gap-3">
            {!result && !isFlash && (
              <button type="button" className="btn btn-quiet" onClick={skip}>Atla</button>
            )}
            {!isFlash && (
              <button
                type="button"
                className={`btn flex-1 ${result ? (result.status === 'incorrect' ? 'btn-bad' : 'btn-good') : 'btn-primary'}`}
                disabled={!result && !hasInput(exercise, input)}
                onClick={() => (result ? next() : check())}
              >
                {result ? 'Devam' : 'Kontrol Et'}
              </button>
            )}
            {isFlash && result && (
              <button type="button" className="btn btn-primary flex-1" onClick={next}>Devam</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

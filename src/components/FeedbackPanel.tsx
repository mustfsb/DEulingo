import { useEffect, useRef, useState } from 'react';
import { AudioButton } from './AudioButton';
import { Markup } from './Markup';
import type { Exercise, Pronunciation } from '../content/types';
import { describeDiff, type ValidationResult } from '../lib/validation';
import { audioController, type SoundEffect } from '../lib/audio/playback';
import { canonicalGermanAnswer, type GermanVoiceId, type SpeechSpeed } from '../lib/audio/tts';

const TONE = {
  correct: {
    surface: 'var(--color-good-soft)',
    accent: 'var(--color-good)',
    title: 'Doğru!',
    icon: '✓',
  },
  'minor-typo': {
    surface: 'var(--color-warn-soft)',
    accent: 'var(--color-warn)',
    title: 'Doğru sayıldı',
    icon: '✓',
  },
  incorrect: {
    surface: 'var(--color-bad-soft)',
    accent: 'var(--color-bad)',
    title: 'Henüz değil',
    icon: '✕',
  },
} as const;

export interface FeedbackPanelProps {
  exercise: Exercise;
  result: ValidationResult;
  onSelfOverride?: () => void;
  /** "Konuyu tekrar et" — ilgili özet bölümünü açar. */
  onOpenSummary?: () => void;
  summaryLabel?: string;
  showPronunciation: boolean;
  soundEffects: boolean;
  autoPronunciation: boolean;
  speechSpeed: SpeechSpeed;
  speechVoice: GermanVoiceId;
  audioContextId: string;
  /** Bu cevapla bir seri esigi asildiysa araya giren kutlama efekti (§25). */
  milestoneEffect?: SoundEffect;
}

export function FeedbackPanel({
  exercise,
  result,
  onSelfOverride,
  onOpenSummary,
  summaryLabel,
  showPronunciation,
  soundEffects,
  autoPronunciation,
  speechSpeed,
  speechVoice,
  audioContextId,
  milestoneEffect,
}: FeedbackPanelProps) {
  const tone = TONE[result.status];
  const diff = describeDiff(result);
  // Zor sorularda gerekce varsayilan olarak acik gelir (§38).
  const [showWhy, setShowWhy] = useState(exercise.difficulty === 'hard' && result.status !== 'correct');

  const pronunciation = showPronunciation ? (exercise.pronunciation ?? []) : [];
  const canonical = canonicalGermanAnswer(exercise, result);
  const displayedAnswer = canonical?.text ?? result.expected;
  const feedbackPlayed = useRef(false);

  useEffect(() => {
    if (feedbackPlayed.current) return;
    feedbackPlayed.current = true;
    const effect = result.status === 'incorrect' ? 'incorrect' : 'correct';
    // Sira: geri bildirim efekti → (varsa) seri efekti → kanonik Almanca.
    // Ucu de tek bir ses sahibinden gecer; ogrenci hemen devam ederse hepsi iptal olur.
    void audioController
      .playFeedback(
        audioContextId,
        effect,
        autoPronunciation ? canonical : undefined,
        soundEffects,
        speechSpeed,
        speechVoice,
        { milestone: milestoneEffect },
      )
      .catch(() => undefined);
  }, [
    audioContextId,
    autoPronunciation,
    canonical,
    milestoneEffect,
    result.status,
    soundEffects,
    speechSpeed,
    speechVoice,
  ]);

  return (
    <div
      className="feedback-panel max-h-[46vh] overflow-y-auto rounded-2xl border-2 px-5 py-4"
      style={{ background: tone.surface, borderColor: tone.accent, boxShadow: `0 4px 0 0 ${tone.accent}` }}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <span
          className="anim-stamp grid size-7 flex-none place-items-center rounded-lg text-base font-black text-white"
          style={{ background: tone.accent }}
          aria-hidden="true"
        >
          {tone.icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-[1.18rem]" style={{ color: tone.accent, fontWeight: 850 }}>
            {tone.title}
          </p>

          {result.status === 'minor-typo' && diff && (
            <p className="mt-1 text-[0.95rem]">
              Küçük yazım farkı:{' '}
              <span className="de" lang="de">
                {diff}
              </span>
            </p>
          )}

          {result.status !== 'incorrect' && displayedAnswer && (
            <p className="mt-1 text-lg font-bold" lang={canonical ? 'de' : 'tr'}>
              <span className="pronunciation-hover-target">
                <span className="pronunciation-hover-text">{displayedAnswer}</span>
                {canonical && <AudioButton target={canonical} contextId={audioContextId} speed={speechSpeed} voice={speechVoice} compact revealOnHover />}
              </span>
            </p>
          )}

          {result.status === 'incorrect' && (
            <div className="mt-1">
              <p className="text-[0.95rem] text-ink-soft">Doğru cevap:</p>
              <p className="whitespace-pre-line font-mono text-lg font-bold" lang="de">
                <span className="pronunciation-hover-target">
                  <span className="pronunciation-hover-text">{result.expected || '—'}</span>
                  {canonical && <AudioButton target={canonical} contextId={audioContextId} speed={speechSpeed} voice={speechVoice} compact revealOnHover />}
                </span>
              </p>
            </div>
          )}

          {exercise.explanation && result.status !== 'correct' && (
            <div className="mt-2">
              <button
                type="button"
                className="text-[0.9rem] font-bold underline underline-offset-2"
                aria-expanded={showWhy}
                onClick={() => setShowWhy((value) => !value)}
              >
                {showWhy ? '▾' : '▸'} Neden?
              </button>
              {showWhy && (
                <p className="mt-1 text-[0.95rem] leading-snug text-ink-soft anim-pop">
                  <Markup text={exercise.explanation} />
                </p>
              )}
            </div>
          )}

          {pronunciation.length > 0 && <PronunciationBlock items={pronunciation} />}

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
            {result.status === 'incorrect' && exercise.openEnded && onSelfOverride && (
              <button type="button" className="text-[0.9rem] underline underline-offset-2" onClick={onSelfOverride}>
                Benim cevabım da doğruydu
              </button>
            )}
            {result.status !== 'correct' && onOpenSummary && (
              <button
                type="button"
                className="text-[0.9rem] font-bold underline underline-offset-2"
                onClick={onOpenSummary}
              >
                {summaryLabel ? `${summaryLabel} özetini aç` : 'Konuyu tekrar et'} →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Yaklasik okunus — gorsel olarak IKINCIL tutulur.
 * Turkce yazim Almanca sesleri birebir veremez; etiket bunu acikca soyler.
 */
function PronunciationBlock({ items }: { items: Pronunciation[] }) {
  return (
    <div className="mt-3 border-t pt-2" style={{ borderColor: 'color-mix(in srgb, currentColor 12%, transparent)' }}>
      <p className="eyebrow flex items-center gap-1.5 text-ink-faint">
        <span aria-hidden="true">🔊</span> Yaklaşık okunuş
      </p>
      <ul className="mt-1 flex flex-col gap-0.5">
        {items.slice(0, 4).map((item) => (
          <li key={item.german} className="text-[0.92rem] leading-snug text-ink-soft">
            <span className="de" lang="de">
              {item.german}
            </span>{' '}
            <span aria-hidden="true">·</span>{' '}
            <span className="font-mono">{item.turkishApproximation}</span>
          </li>
        ))}
      </ul>
      {items[0]?.note && (
        <p className="mt-1 text-[0.85rem] leading-snug text-ink-faint">
          <Markup text={items[0].note} />
        </p>
      )}
    </div>
  );
}

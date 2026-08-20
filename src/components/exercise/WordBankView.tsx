import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  reduceWordBankKey,
  removeWordBankToken,
  resolveTypedTile,
  selectWordBankToken,
  typedPrefixLength,
} from '../../lib/word-bank';
import type { ExerciseViewProps } from './types';
import { AudioButton } from '../AudioButton';
import { findGermanAudioTarget } from '../../lib/audio/targets';
import { getTileReflowDelta } from '../../lib/tile-motion';

const KEYBOARD_HINT_KEY = 'almanca-alistirma:word-bank-keyboard-hint-used';

/** Duolingo tarzı, görünür metin girdisi olmayan kimlikli kelime bankası. */
export function WordBankView({ exercise, value, onChange, onSubmit, locked, result, audioContextId, speechSpeed = 'normal', speechVoice }: ExerciseViewProps) {
  const wordBank = exercise.wordBank;
  const selected = Array.isArray(value) ? value : [];
  const [buffer, setBuffer] = useState('');
  const [showKeyboardHint, setShowKeyboardHint] = useState(
    () => typeof localStorage !== 'undefined' && !localStorage.getItem(KEYBOARD_HINT_KEY),
  );
  const tileElements = useRef(new Map<string, HTMLDivElement>());
  const tilePositions = useRef(new Map<string, DOMRect>());
  const previousExerciseId = useRef(exercise.id);

  if (!wordBank) return null;
  const tokens = wordBank.tokens;
  const byId = new Map(tokens.map((token) => [token.id, token]));
  const available = tokens.filter((token) => !selected.includes(token.id));
  const selectedTokens = selected.map((id) => byId.get(id)).filter(Boolean);
  const state = locked ? (result?.status === 'incorrect' ? 'wrong' : 'correct') : undefined;
  const typedResolution = resolveTypedTile(buffer, available);
  const matchingIds = new Set(typedResolution.candidates.map((token) => token.id));
  const hasNoMatch = Boolean(buffer) && matchingIds.size === 0;
  const layoutKey = `${selected.join('|')}::${available.map((token) => token.id).join('|')}`;

  const setTileElement = (key: string, element: HTMLDivElement | null) => {
    if (element) tileElements.current.set(key, element);
    else tileElements.current.delete(key);
  };

  useLayoutEffect(() => {
    if (previousExerciseId.current !== exercise.id) {
      tilePositions.current.clear();
      previousExerciseId.current = exercise.id;
    }

    const shouldReduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const nextPositions = new Map<string, DOMRect>();
    tileElements.current.forEach((element, key) => {
      const current = element.getBoundingClientRect();
      const delta = getTileReflowDelta(tilePositions.current.get(key), current);
      if (delta && !shouldReduceMotion && typeof element.animate === 'function') {
        element.animate(
          [
            { transform: `translate(${delta.x}px, ${delta.y}px)` },
            { transform: 'translate(0, 0)' },
          ],
          { duration: 240, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
        );
      }
      nextPositions.set(key, current);
    });
    tilePositions.current = nextPositions;
  }, [exercise.id, layoutKey]);

  const choose = (id: string) => {
    if (!locked) {
      setBuffer('');
      onChange(selectWordBankToken(selected, id));
    }
  };
  const remove = (index: number) => {
    if (!locked) onChange(removeWordBankToken(selected, index));
  };

  useEffect(() => {
    if (locked) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((event.target as HTMLElement | null)?.tagName ?? '')) return;
      const next = reduceWordBankKey({ key: event.key, buffer, selectedIds: selected, tokens });
      if (!next.handled) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      setBuffer(next.buffer);
      if (next.selectedIds !== selected) onChange(next.selectedIds);
      if (next.usedTyping) {
        try { localStorage.setItem(KEYBOARD_HINT_KEY, '1'); } catch { /* depolama zorunlu değil */ }
        setShowKeyboardHint(false);
      }
      if (next.submit) onSubmit();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [buffer, locked, onChange, onSubmit, selected, tokens]);

  // Yeni soru/geri bildirim/route ile görünmez buffer asla taşınmaz.
  useEffect(() => {
    setBuffer('');
  }, [exercise.id, locked]);

  return (
    <section className="word-bank" aria-label="Kelime bankası">
      <p className="eyebrow">{wordBank.direction === 'de-to-tr' ? 'Almancayı Türkçe oluştur' : 'Türkçesini Almanca oluştur'}</p>
      <p className="word-bank-source" lang={wordBank.direction === 'de-to-tr' ? 'de' : 'tr'}>{wordBank.sourceText}</p>

      <div className="word-bank-answer" data-state={state} aria-label="Seçilen kelimeler">
        {selectedTokens.length ? (
          selectedTokens.map((token, index) => token && (
            <div
              key={`${token.id}:${index}`}
              ref={(element) => setTileElement(`answer:${token.id}:${index}`, element)}
              className="word-tile-wrap word-tile-answer-wrap"
              data-tile-layout-key={`answer:${token.id}:${index}`}
            >
              <button
                type="button"
                className="word-tile word-tile-selected"
                disabled={locked}
                onClick={() => remove(index)}
                aria-label={`${token.text} kelimesini geri al`}
              >
                {token.text}
              </button>
            </div>
          ))
        ) : (
          <span className="word-bank-placeholder" aria-hidden="true" />
        )}
      </div>

      <div className="word-bank-tiles" aria-label="Kullanılabilir kelimeler">
        {available.map((token) => {
          const prefixMatch = matchingIds.has(token.id);
          const prefixLength = prefixMatch ? typedPrefixLength(token.text, buffer) : 0;
          const audioTarget = findGermanAudioTarget(exercise, token.text);
          return (
            <div
              key={token.id}
              ref={(element) => setTileElement(`bank:${token.id}`, element)}
              className="word-tile-wrap"
              data-audio={audioTarget ? 'true' : undefined}
              data-audio-reveal={audioTarget ? 'hover' : undefined}
              data-tile-layout-key={`bank:${token.id}`}
            >
              <button
                type="button"
                className={`word-tile word-tile-available${prefixMatch ? ' is-prefix-match' : ''}${hasNoMatch ? ' is-no-match' : ''}`}
                disabled={locked}
                data-prefix-match={prefixMatch || undefined}
                onClick={() => choose(token.id)}
              >
                {prefixLength > 0 ? (
                  <>
                    <mark>{token.text.slice(0, prefixLength)}</mark>{token.text.slice(prefixLength)}
                  </>
                ) : token.text}
              </button>
              {audioTarget && (
                <span className="word-tile-audio">
                  <AudioButton target={audioTarget} contextId={audioContextId ?? `word-bank:${exercise.id}`} speed={speechSpeed} voice={speechVoice} compact revealOnHover />
                </span>
              )}
            </div>
          );
        })}
      </div>
      {showKeyboardHint && <p className="word-bank-hint">İpucu: Kelimeleri klavyeden de yazabilirsin.</p>}
      {hasNoMatch && <p className="word-bank-no-match" role="status">“{buffer}” ile başlayan bir kelime yok.</p>}
      {buffer && <span className="sr-only" aria-live="polite">Yazılan: {buffer}</span>}
    </section>
  );
}

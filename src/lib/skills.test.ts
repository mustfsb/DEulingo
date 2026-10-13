import { describe, expect, it } from 'vitest';
import { parseHash, hrefFor } from '../lib/router';
import { loadSkills, saveSkills, emptySkills, recommendWeeklyNext, skillProgressSummary } from '../lib/skills-storage';
import { isRecordingSupported, isSttSupported, transcriptMatchesReference } from '../lib/audio/voice';
import { pickEnglishVoice } from '../lib/audio/web-speech';
import { EN_PROGRESS_KEY, DE_PROGRESS_KEY } from '../lib/language';

describe('beceri rotaları', () => {
  it('okuma/yazma/dinleme/konuşma/haftalık parse + href', () => {
    expect(parseHash('#/okuma')).toEqual({ name: 'reading' });
    expect(parseHash('#/okuma/en-read-1')).toEqual({ name: 'reading-passage', passageId: 'en-read-1' });
    expect(parseHash('#/yazma')).toEqual({ name: 'writing' });
    expect(parseHash('#/dinleme')).toEqual({ name: 'listening' });
    expect(parseHash('#/konusma')).toEqual({ name: 'speaking' });
    expect(parseHash('#/haftalik')).toEqual({ name: 'weekly' });
    expect(hrefFor({ name: 'reading' })).toBe('#/okuma');
    expect(hrefFor({ name: 'reading-passage', passageId: 'en-read-1' })).toBe('#/okuma/en-read-1');
    expect(hrefFor({ name: 'writing' })).toBe('#/yazma');
    expect(hrefFor({ name: 'listening' })).toBe('#/dinleme');
    expect(hrefFor({ name: 'speaking' })).toBe('#/konusma');
    expect(hrefFor({ name: 'weekly' })).toBe('#/haftalik');
  });
});

describe('beceri persistence (Almancadan ayrı)', () => {
  it('skills-en anahtarı DE/EN ilerlemeye dokunmaz', () => {
    expect(DE_PROGRESS_KEY).not.toBe(EN_PROGRESS_KEY);
    const store = new Map<string, string>();
    const storage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => { store.set(k, v); },
      removeItem: (k: string) => { store.delete(k); },
      clear: () => store.clear(),
      key: (i: number) => [...store.keys()][i] ?? null,
      get length() { return store.size; },
    } as Storage;
    saveSkills({ ...emptySkills(), reading: [{ passageId: 'en-read-1', correct: 4, total: 5, at: new Date().toISOString(), mistakeQuestionIds: [], addedVocab: [] }] }, storage);
    expect(storage.getItem('almanca-alistirma:skills-en')).toContain('en-read-1');
    expect(storage.getItem(DE_PROGRESS_KEY)).toBeNull();
    expect(storage.getItem(EN_PROGRESS_KEY)).toBeNull();
    const loaded = loadSkills(storage);
    expect(loaded.reading.length).toBe(1);
  });

  it('bozuk veri güvenli boş döner', () => {
    const storage = { getItem: () => '{bozuk', setItem: () => {}, removeItem: () => {}, clear: () => {}, key: () => null, length: 0 } as unknown as Storage;
    expect(loadSkills(storage)).toEqual(emptySkills());
  });

  it('özet + öneri deterministik', () => {
    const s = emptySkills();
    expect(skillProgressSummary(s).reading.done).toBe(0);
    const next = recommendWeeklyNext({ skills: s, topicAccuracy: new Map(), openMistakes: 0 });
    expect(next.label.length).toBeGreaterThan(0);
    const withMistakes = recommendWeeklyNext({ skills: s, topicAccuracy: new Map(), openMistakes: 6 });
    expect(withMistakes.label).toContain('Hata');
  });
});

describe('ses soyutlaması', () => {
  it('kayıt/STT destek tespiti çökmez', () => {
    expect(typeof isRecordingSupported()).toBe('boolean');
    expect(typeof isSttSupported()).toBe('boolean');
  });

  it('transkript eşleme telaffuz puanı uydurmaz', () => {
    expect(transcriptMatchesReference('', 'I have studied English.').hit).toBe(false);
    expect(transcriptMatchesReference('I have studied English for three years.', 'I have studied English for three years.').hit).toBe(true);
  });

  it('en-GB ses seçimi null-safe', () => {
    // jsdom'da speechSynthesis yok → null döner, çökmez
    expect(pickEnglishVoice()).toBeNull();
  });
});

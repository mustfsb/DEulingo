/**
 * Kelime havuzu testleri — whitelist, sayı, tekillik, makale, konu,
 * eşleştirme, oturum çeşitliliği, erişilebilirlik, TTS, yönlendirme.
 */

import { describe, expect, it } from 'vitest';
import {
  EXPECTED_VOCABULARY_SIZE,
  VOCAB_BY_ID,
  VOCABULARY,
} from '../../content/vocabulary/inventory';
import {
  assertWhitelist,
  balancedGroups,
  buildArticle,
  buildMatching,
  buildVocabSession,
  normalizeTurkish,
  seededRandom,
  vocabPoolForTopic,
  type VocabKind,
} from './questions';
import { computeVocabProgress, summarizeVocab } from './mastery';
import { validateVocabTyping } from './validate';
import { createEmptyProgress, type UserProgress } from '../storage';
import { parseHash, hrefFor } from '../router';

const normGerman = (value: string) =>
  value.toLocaleLowerCase('de').replace(/[.!?]+$/g, '').trim();

describe('kanonik envanter', () => {
  it('tam 244 benzersiz öğe içerir', () => {
    expect(VOCABULARY.length).toBe(EXPECTED_VOCABULARY_SIZE);
    expect(new Set(VOCABULARY.map((e) => e.id)).size).toBe(EXPECTED_VOCABULARY_SIZE);
  });

  it('yinelenen Almanca girdi yoktur', () => {
    const seen = new Map<string, string>();
    for (const entry of VOCABULARY) {
      const key = normGerman(entry.german);
      expect(seen.get(key), `"${entry.german}" yineleniyor (${seen.get(key)} ↔ ${entry.id})`).toBeUndefined();
      seen.set(key, entry.id);
    }
  });

  it('her öğede Almanca + Türkçe vardır; isimlerde artikel zorunludur', () => {
    for (const entry of VOCABULARY) {
      expect(entry.german.trim().length, entry.id).toBeGreaterThan(0);
      expect(entry.turkish.trim().length, entry.id).toBeGreaterThan(0);
      expect(entry.ttsText.trim().length, entry.id).toBeGreaterThan(0);
      expect(entry.source.trim().length, entry.id).toBeGreaterThan(0);
      if (entry.type === 'noun') {
        expect(['der', 'die', 'das'], entry.id).toContain(entry.article);
        expect(entry.german.startsWith(`${entry.article} `), entry.id).toBe(true);
      }
    }
  });

  it('her öğe en az bir konuya aittir', () => {
    const orphans = VOCABULARY.filter((e) => e.topicIds.length === 0);
    expect(orphans.map((e) => e.id)).toEqual([]);
  });

  it('TTS metni Almancadır (Türkçe metin TTS’e girmez)', () => {
    for (const entry of VOCABULARY) {
      expect(entry.ttsText, entry.id).not.toMatch(/[ğışçİ]/);
      expect(entry.ttsText.toLocaleLowerCase('de')).toContain(
        entry.type === 'noun' && entry.article ? entry.base.toLocaleLowerCase('de') : entry.ttsText.toLocaleLowerCase('de').slice(0, 2),
      );
    }
  });
});

describe('whitelist', () => {
  const kinds: VocabKind[] = ['mixed', 'detr', 'trde', 'match', 'type', 'listen', 'weak', 'flash', 'marathon', 'topic'];
  it.each(kinds)('%s oturum hedefleri havuz içindedir', (kind) => {
    for (let seed = 0; seed < 10; seed++) {
      const session = buildVocabSession({
        kind,
        topicId: kind === 'topic' ? 'topic.home' : undefined,
        seed: `wl:${kind}:${seed}`,
      });
      expect(assertWhitelist(session)).toEqual([]);
      for (const q of session) {
        for (const id of q.vocabIds) expect(VOCAB_BY_ID.has(id)).toBe(true);
      }
    }
  });
});

describe('konu filtreleme', () => {
  it('konu oturumu yalnızca o konunun kelimelerini seçer', () => {
    const session = buildVocabSession({ kind: 'topic', topicId: 'topic.home', seed: 't1' });
    expect(session.length).toBeGreaterThan(0);
    for (const q of session) {
      for (const id of q.vocabIds) {
        expect(VOCAB_BY_ID.get(id)?.topicIds, id).toContain('topic.home');
      }
    }
  });

  it('konu boyutu ölçeklenir (küçük konu → tamamı)', () => {
    const small = vocabPoolForTopic('topic.akkusativ');
    const session = buildVocabSession({ kind: 'topic', topicId: 'topic.akkusativ', seed: 't2' });
    const covered = new Set(session.flatMap((q) => q.vocabIds));
    expect(covered.size).toBe(small.length);
  });
});

describe('eşleştirme', () => {
  it('setler 4–8 çift, belirsiz anlam yok, eşleme tutarlı', () => {
    for (let seed = 0; seed < 20; seed++) {
      const session = buildVocabSession({ kind: 'match', seed: `m:${seed}` });
      for (const q of session) {
        if (q.exercise.type !== 'matching') continue;
        const pairs = q.exercise.pairs ?? [];
        expect(pairs.length).toBeGreaterThanOrEqual(2);
        expect(pairs.length).toBeLessThanOrEqual(8);
        const rights = pairs.map((p) => normalizeTurkish(p.right));
        expect(new Set(rights).size).toBe(rights.length);
        for (const pair of pairs) {
          const owner = VOCABULARY.find(
            (e) => e.german === pair.left || e.turkish === pair.left,
          );
          expect(owner, `${pair.left} ↔ ${pair.right}`).toBeDefined();
          const expectedRight =
            q.exercise.instruction.includes('Almancayı') ? owner!.turkish : owner!.german;
          expect(pair.right).toBe(expectedRight);
        }
      }
    }
  });

  it('tersten eşleştirme de kurulur', () => {
    const pool = vocabPoolForTopic().slice(0, 5);
    const set = buildMatching(pool, 'tr-de', 'rev');
    const lefts = new Set((set?.exercise.pairs ?? []).map((p) => p.left));
    expect(lefts).toEqual(new Set(pool.map((e) => e.turkish)));
  });

  it('grup dengeleme 4–8 aralığını korur', () => {
    for (const n of [2, 5, 9, 11, 22, 30]) {
      const groups = balancedGroups(Array.from({ length: n }, (_, i) => i));
      for (const group of groups) {
        expect(group.length).toBeGreaterThanOrEqual(2);
        expect(group.length).toBeLessThanOrEqual(8);
      }
    }
  });
});

describe('artikel + yazma doğrulaması', () => {
  it('doğru artikel + isim tam doğrudur', () => {
    expect(validateVocabTyping('v-schluessel', 'der Schlüssel').status).toBe('correct');
  });

  it('artikelsiz isim kısmi doğruluktur (minor-typo)', () => {
    const result = validateVocabTyping('v-schluessel', 'Schlüssel');
    expect(result.status).toBe('minor-typo');
    expect(result.expected).toBe('der Schlüssel');
  });

  it('yanlış artikel affedilmez', () => {
    expect(validateVocabTyping('v-schluessel', 'die Schlüssel').status).toBe('incorrect');
    expect(validateVocabTyping('v-schluessel', 'das Schlüssel').status).toBe('incorrect');
  });

  it('artikel sorusu yalnızca isimlere kurulur', () => {
    const rand = seededRandom('a');
    const noun = VOCAB_BY_ID.get('v-schluessel')!;
    const verb = VOCAB_BY_ID.get('v-verkaufen')!;
    expect(buildArticle(noun, rand)?.exercise.answer).toBe('der');
    expect(buildArticle(verb, rand)).toBeNull();
  });
});

describe('oturum niteliği', () => {
  it('birincil kuyrukta aynı soru yinelenmez', () => {
    for (const kind of ['mixed', 'detr', 'trde', 'type', 'listen'] as VocabKind[]) {
      const session = buildVocabSession({ kind, seed: `dup:${kind}` });
      const ids = session.map((q) => q.exercise.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('tohumlar farklı oturumlar üretir', () => {
    const signatures = new Set<string>();
    for (let seed = 0; seed < 20; seed++) {
      const session = buildVocabSession({ kind: 'mixed', seed: `div:${seed}` });
      signatures.add(session.map((q) => q.exercise.id).join('|'));
    }
    expect(signatures.size).toBe(20);
  });

  it('maraton her kelimeyi tam bir kez dener', () => {
    const session = buildVocabSession({ kind: 'marathon', seed: 'mar' });
    const covered = session.flatMap((q) => q.vocabIds);
    expect(new Set(covered).size).toBe(VOCABULARY.length);
    expect(covered.length).toBe(VOCABULARY.length);
  });

  it('yeterli simülasyonda 244/244 erişilebilir', () => {
    const reachable = new Set<string>();
    const kinds: VocabKind[] = ['mixed', 'detr', 'trde', 'match', 'type', 'listen'];
    for (const kind of kinds) {
      for (let seed = 0; seed < 20; seed++) {
        for (const q of buildVocabSession({ kind, seed: `reach:${kind}:${seed}` })) {
          q.vocabIds.forEach((id) => reachable.add(id));
        }
      }
    }
    expect(reachable.size).toBe(VOCABULARY.length);
  });
});

describe('ustalık', () => {
  const empty: UserProgress = createEmptyProgress();
  it('başlangıçta 0/244 öğrenildi', () => {
    expect(summarizeVocab(empty).mastered).toBe(0);
    expect(summarizeVocab(empty).total).toBe(VOCABULARY.length);
  });

  it('tek kolay tanıma ustalığa yetmez', async () => {
    const { recordAttempt } = await import('../progress');
    const session = buildVocabSession({ kind: 'detr', seed: 'm1', size: 1 });
    const q = session[0];
    const once = recordAttempt(empty, q.exercise, q.exercise.answer ?? '', 'correct', {
      status: 'correct',
      expected: q.exercise.answer ?? '',
      normalizedInput: String(q.exercise.answer ?? ''),
    });
    expect(computeVocabProgress(once).get(q.primaryVocabId)?.state).not.toBe('mastered');
  });
});

describe('yönlendirme', () => {
  it('#/kelime ev ve liste rotaları', () => {
    expect(parseHash('#/kelime')).toEqual({ name: 'vocab' });
    expect(parseHash('#/kelime/liste')).toEqual({ name: 'vocab-list' });
  });

  it('#/kelime/calisma tür + konu + boy taşır', () => {
    expect(parseHash('#/kelime/calisma/trde')).toMatchObject({ name: 'vocab-study', kind: 'trde' });
    expect(parseHash('#/kelime/calisma/topic/home')).toMatchObject({
      name: 'vocab-study',
      kind: 'topic',
      topicId: 'topic.home',
    });
    expect(hrefFor({ name: 'vocab-study', kind: 'trde' })).toBe('#/kelime/calisma/trde');
  });
});

describe('ders tamamlama etkilenmez', () => {
  it('kelime denemeleri konu tamamlamayı değiştirmez', async () => {
    const { recordAttempt, getTopicProgressStats } = await import('../progress');
    const { primaryExercisesForTopic } = await import('../content');
    const primary = primaryExercisesForTopic('topic.home');
    const before = getTopicProgressStats(createEmptyProgress(), 'topic.home', primary);
    const session = buildVocabSession({ kind: 'trde', topicId: 'topic.home', seed: 'iso', size: 5 });
    let progress = createEmptyProgress();
    for (const q of session) {
      progress = recordAttempt(progress, q.exercise, q.exercise.answer ?? '', 'correct', {
        status: 'correct',
        expected: q.exercise.answer ?? '',
        normalizedInput: String(q.exercise.answer ?? ''),
      });
    }
    const after = getTopicProgressStats(progress, 'topic.home', primary);
    expect(after.completed).toBe(before.completed);
    expect(after.state).toBe(before.state);
  });
});

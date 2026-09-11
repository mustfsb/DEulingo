/**
 * Icerik butunlugu (§45, §58, §60) — KONU tabanli mufredat.
 *
 * Bu testler uretilmis paketi (generated/exercises.json) denetler; boylece
 * kaynak Markdown ya da yazilmis katman degistiginde bozulmalar yakalanir.
 * Gun yalnizca `legacyDay` izi olarak kalir; hicbir test gune gore havuz kurmaz.
 */

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import type { ContentBundle, Exercise } from '../types.ts';
import { AUTHORED_EXERCISES } from './index.ts';
import { CONCEPTS } from './concepts.ts';
import { approximate, isCurated, transliterateWord } from './pronunciation.ts';
import { evaluateWordBank } from '../../lib/word-bank.ts';
import {
  buildSessionPlan,
  challengeReadiness,
  CHALLENGE_MAX_RECOGNITION_RATIO,
  isProductionTask,
  type SessionMode,
} from '../../lib/session.ts';
import { shouldAutoplayPrompt } from '../../lib/audio/tts.ts';
import { evaluateExercise } from '../../lib/validation.ts';
import { createEmptyProgress } from '../../lib/storage.ts';
import { exercisesForTopic } from '../../lib/content.ts';
import {
  isSentenceExercise,
  isWritingExercise,
  MIN_TOPIC_POOL,
  reviewPoolFor,
} from '../../lib/general-review.ts';
import { SECTION_BY_ID, TOPICS, T } from '../curriculum/topics.ts';

const bundle = JSON.parse(readFileSync('generated/exercises.json', 'utf8')) as ContentBundle;
const conceptIds = new Set(CONCEPTS.map((concept) => concept.id));
const topicIds = new Set(TOPICS.map((topic) => topic.id));
const lesson = bundle.exercises.filter((exercise) => !exercise.reviewOnly);
const bank = bundle.exercises.filter((exercise) => exercise.reviewOnly);
const touches = (topicId: string) => (exercise: Exercise) =>
  exercise.topicId === topicId || Boolean(exercise.secondaryTopicIds?.includes(topicId));
const topicPool = (topicId: string) => lesson.filter(touches(topicId));
const primary = (topicId: string) => lesson.filter((exercise) => exercise.topicId === topicId);

function plan(topicId: string, mode: SessionMode, seed: string, pool = topicPool(topicId)) {
  return buildSessionPlan({ pool, progress: createEmptyProgress(), mode, topicId, seed }).primaryQueue.map(
    (item) => item.exerciseId,
  );
}

function surfaceText(exercises: Exercise[], fields: Array<(exercise: Exercise) => Array<string | undefined>>): string {
  return exercises
    .flatMap((exercise) => fields.flatMap((field) => field(exercise)))
    .filter((value): value is string => Boolean(value))
    .join(' | ');
}
const answers = (exercise: Exercise) => [exercise.answer, exercise.sampleAnswer, ...(exercise.acceptedAnswers ?? [])];
const spoken = (exercise: Exercise) => exercise.pronunciation?.map((item) => item.german) ?? [];

describe('paket saglik durumu', () => {
  it('hicbir icerik HATASI yok', () => {
    expect(bundle.warnings.filter((warning) => warning.level === 'error')).toEqual([]);
  });

  it('hicbir icerik uyarisi yok', () => {
    expect(bundle.warnings.filter((warning) => warning.level === 'warn')).toEqual([]);
  });

  it('kanonik konu haritasi 20 konu olarak, kararli kimlikleriyle ve sirayla uretilir', () => {
    expect(bundle.topics.map((topic) => topic.id)).toEqual(TOPICS.map((topic) => topic.id));
    expect(bundle.topics.map((topic) => topic.order)).toEqual(TOPICS.map((_, index) => index));
    for (const topic of bundle.topics) expect(topic.id).toMatch(/^topic\.[a-z-]+$/);
  });

  it('gun tabanli yapi pakette yoktur', () => {
    const raw = bundle as unknown as Record<string, unknown>;
    expect(raw.days).toBeUndefined();
    for (const exercise of bundle.exercises) {
      const legacy = exercise as unknown as Record<string, unknown>;
      expect(legacy.day, exercise.id).toBeUndefined();
      expect(legacy.track, exercise.id).toBeUndefined();
      expect(legacy.exerciseSetId, exercise.id).toBeUndefined();
    }
    for (const summary of bundle.summaries) expect((summary as unknown as Record<string, unknown>).day).toBeUndefined();
  });

  it('ogrenciye gorunen hicbir metinde "N. Gün" dili gecmez', () => {
    const dayLanguage = /\d+\s*\.\s*G[üu]n/u;
    const offenders = bundle.exercises.filter((exercise) =>
      dayLanguage.test([exercise.instruction, exercise.prompt, exercise.explanation, exercise.hint, exercise.topic].join(' ')),
    );
    expect(offenders.map((exercise) => exercise.id)).toEqual([]);
    const summaryText = JSON.stringify([bundle.summaries, bundle.reviewSummary, bundle.topics]);
    expect(summaryText.match(new RegExp(dayLanguage, 'gu')) ?? []).toEqual([]);
  });

  it('her konunun calisilabilir bir havuzu ve ozeti vardir', () => {
    for (const topic of bundle.topics) {
      expect(topic.exerciseIds.length, topic.id).toBeGreaterThanOrEqual(13);
      expect(topicPool(topic.id).length, topic.id).toBeGreaterThanOrEqual(24);
      expect(bundle.summaries.some((summary) => summary.topicId === topic.id), topic.id).toBe(true);
    }
  });
});

describe('kimlik kararliligi', () => {
  it("yazilmis ID'ler benzersizdir", () => {
    const ids = AUTHORED_EXERCISES.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("yazilmis ID'ler anlamlidir, konuma bagli degildir", () => {
    for (const item of AUTHORED_EXERCISES) {
      expect(item.id, item.id).toMatch(/^[a-z][a-z0-9]*-[a-z0-9-]+$/);
      // Konumsal ID (`d2-1`, `d3-07`) olmamali: onekten sonra en az bir harfli anlam parcasi bulunmali.
      const segments = item.id.split('-').slice(1);
      expect(segments.some((segment) => /[a-z]{2,}/.test(segment)), item.id).toBe(true);
    }
  });

  it('tarihi gun izi (legacyDay) eski ID onekiyle ortusur; yeni icerik gun izi tasimaz', () => {
    for (const item of AUTHORED_EXERCISES) {
      if (item.id.startsWith('gr-')) {
        expect(item.reviewOnly, item.id).toBe(true);
        expect(item.legacyDay, item.id).toBeUndefined();
        continue;
      }
      const legacy = /^p(\d+)-/.exec(item.id);
      if (legacy) expect(item.legacyDay, item.id).toBe(Number(legacy[1]));
      else expect(item.legacyDay, item.id).toBeUndefined();
    }
  });

  it("paketteki tum ID'ler benzersizdir", () => {
    const ids = bundle.exercises.map((exercise) => exercise.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("kayitli ilerlemenin bagli oldugu ID'ler korunur", () => {
    const ids = new Set(bundle.exercises.map((exercise) => exercise.id));
    for (const id of ['p1-vor-wie-heisst-mc', 'p10-tre-listen-aufstehen', 'gr-cum-l4-stehe-sieben-auf', 'p7-evim-free-tam-anlatim']) {
      expect(ids.has(id), id).toBe(true);
    }
  });

  it('icerik surumu uretilir', () => {
    expect(bundle.contentVersion).toMatch(/^3\./);
  });
});

describe('alistirma ustverisi', () => {
  it('her alistirmanin zorlugu, becerisi, kavrami ve kanonik konusu var', () => {
    for (const exercise of bundle.exercises) {
      expect(['easy', 'medium', 'hard']).toContain(exercise.difficulty);
      expect(exercise.skill).toBeTruthy();
      expect(exercise.conceptIds.length).toBeGreaterThan(0);
      expect(topicIds.has(exercise.topicId), `${exercise.id} → ${exercise.topicId}`).toBe(true);
      expect(exercise.topic).toBe(TOPICS.find((topic) => topic.id === exercise.topicId)!.title);
    }
  });

  it('ikincil konu etiketleri kanoniktir ve birincil konuyu tekrarlamaz', () => {
    for (const exercise of bundle.exercises) {
      for (const secondary of exercise.secondaryTopicIds ?? []) {
        expect(topicIds.has(secondary), `${exercise.id} → ${secondary}`).toBe(true);
        expect(secondary, exercise.id).not.toBe(exercise.topicId);
      }
    }
  });

  it('ders alistirmasinin bolumu kayitli bir ozet bolumudur', () => {
    for (const exercise of lesson) {
      expect(exercise.sectionId, exercise.id).toBeTruthy();
      expect(SECTION_BY_ID.has(exercise.sectionId!), `${exercise.id} → ${exercise.sectionId}`).toBe(true);
    }
  });

  it('her kavram kayitlidir', () => {
    for (const exercise of bundle.exercises) {
      for (const conceptId of exercise.conceptIds) {
        expect(conceptIds.has(conceptId), `${exercise.id} → ${conceptId}`).toBe(true);
      }
    }
  });

  it('bilgi sicramasi yok: alistirmalar yalnizca ogrenilmis kavramlari ister', () => {
    const index = new Map(CONCEPTS.map((concept) => [concept.id, concept]));
    for (const exercise of bundle.exercises) {
      for (const conceptId of exercise.conceptIds) {
        const concept = index.get(conceptId)!;
        expect(concept.status ?? 'learned', `${exercise.id} → ${conceptId}`).toBe('learned');
        for (const prerequisite of concept.prerequisites ?? []) {
          expect(index.get(prerequisite)?.status ?? 'learned', `${conceptId} ← ${prerequisite}`).toBe('learned');
        }
      }
    }
  });

  it('sesli ve eslestirme disindaki her alistirmanin cevabi var', () => {
    const missing = bundle.exercises.filter(
      (exercise) => !['spoken', 'matching'].includes(exercise.type) && !exercise.answer,
    );
    expect(missing).toEqual([]);
  });

  it('coktan secmeli sorularda dogru cevap seceneklerin icindedir', () => {
    for (const exercise of bundle.exercises) {
      if (exercise.type !== 'multiple-choice') continue;
      expect(exercise.options?.length).toBeGreaterThanOrEqual(2);
      expect(exercise.options).toContain(exercise.answer);
    }
  });

  it('eslestirme alistirmalarinin en az iki cifti var', () => {
    for (const exercise of bundle.exercises) {
      if (exercise.type !== 'matching') continue;
      expect(exercise.pairs!.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('cumle kurma alistirmalarinin kelime cipleri var', () => {
    for (const exercise of bundle.exercises) {
      if (!['sentence-builder', 'ordering'].includes(exercise.type)) continue;
      expect(exercise.words!.length).toBeGreaterThanOrEqual(2);
    }
  });
});

describe('kelime-bankası çeviri kapsamı', () => {
  it('iki yon de ogretilir; buyuk konularda yeterli sayida ceviri vardir', () => {
    const translations = lesson.filter((exercise) => exercise.type === 'word-bank-translation');
    expect(translations.some((exercise) => exercise.wordBank?.direction === 'de-to-tr')).toBe(true);
    expect(translations.some((exercise) => exercise.wordBank?.direction === 'tr-to-de')).toBe(true);
    for (const topicId of [T.modalVerbs, T.separableVerbs, T.dailyRoutine, T.personalInfo]) {
      const inTopic = topicPool(topicId).filter((exercise) => exercise.type === 'word-bank-translation');
      expect(inTopic.length, topicId).toBeGreaterThanOrEqual(5);
    }
    for (const topicId of [T.modalVerbs, T.time]) {
      const inTopic = topicPool(topicId).filter((exercise) => exercise.type === 'word-bank-translation');
      expect(inTopic.some((exercise) => exercise.wordBank?.direction === 'de-to-tr'), topicId).toBe(true);
      expect(inTopic.some((exercise) => exercise.wordBank?.direction === 'tr-to-de'), topicId).toBe(true);
    }
    for (const exercise of translations) {
      expect(exercise.wordBank?.tokens.every((token) => token.id && token.text)).toBe(true);
      expect(exercise.wordBank?.acceptedSequences.length).toBeGreaterThan(0);
    }
  });

  it('çeviri ses yetkisini yalnızca açık Almanca metadata ile verir', () => {
    const translations = bundle.exercises.filter((exercise) => exercise.type === 'word-bank-translation');
    for (const exercise of translations) {
      const wordBank = exercise.wordBank!;
      const targets = [exercise.audio?.prompt, exercise.audio?.canonicalAnswer].filter(Boolean);
      expect(targets.every((target) => target?.language === 'de-DE')).toBe(true);
      if (wordBank.direction === 'de-to-tr') {
        expect(exercise.audio?.prompt?.text).toBe(wordBank.sourceText);
        expect(exercise.audio?.canonicalAnswer).toBeUndefined();
      } else {
        expect(exercise.audio?.prompt).toBeUndefined();
        expect(exercise.audio?.canonicalAnswer?.text).toBe(exercise.answer);
      }
    }
  });

  it('Türkçede doğal olan alternatif kelime dizilerini kabul eder', () => {
    const exercise = bundle.exercises.find((item) => item.id === 'p7-fiy-antwort-wb');
    const wordBank = exercise?.wordBank;
    expect(wordBank).toBeDefined();
    expect(wordBank?.acceptedSequences).toContainEqual(['Das', 'kostet', 'fünf', 'Euro.']);
    expect(wordBank?.acceptedSequences).toContainEqual(['Das', 'ist', 'fünf', 'Euro.']);

    const selectedIds = ['Das', 'ist', 'fünf', 'Euro.'].map(
      (text) => wordBank!.tokens.find((token) => token.text === text)!.id,
    );
    expect(evaluateWordBank(selectedIds, wordBank!.tokens, wordBank!.acceptedSequences)).toBe(true);
  });

  it('kelime-bankasi cevaplari kutucuklardan kurulabilir', () => {
    for (const exercise of bundle.exercises) {
      if (exercise.type !== 'word-bank-translation' || !exercise.wordBank) continue;
      for (const sequence of exercise.wordBank.acceptedSequences) {
        const selectedIds = sequence.map(
          (text) => exercise.wordBank!.tokens.find((token) => token.text === text)?.id,
        );
        expect(selectedIds.every(Boolean), `${exercise.id}: ${sequence.join(' ')}`).toBe(true);
        expect(evaluateWordBank(selectedIds as string[], exercise.wordBank.tokens, exercise.wordBank.acceptedSequences)).toBe(true);
      }
    }
  });
});

describe('dil odaklı soru kalitesi', () => {
  it('hiçbir alıştırma video/sonraki ders bilgisini ölçmez', () => {
    const metaQuestion = /\b(video|videoda|videolar|sıradaki|sonraki\s+(?:video|ders))\b/i;
    const offenders = bundle.exercises.filter((exercise) =>
      metaQuestion.test([exercise.instruction, exercise.prompt, exercise.explanation].filter(Boolean).join(' ')),
    );
    expect(offenders.map((exercise) => exercise.id)).toEqual([]);
  });

  it('ders hedefi meta sorulari (günün hedefi nedir?) emekliye ayrildi', () => {
    const ids = new Set(bundle.exercises.map((exercise) => exercise.id));
    for (const id of ['p3-hed-giris-mc', 'p5-hed-giris-mc', 'p6-hed-giris-mc', 'p7-hed-giris-mc', 'p7-hed-cekirdek-mc', 'p10-hed-giris-mc']) {
      expect(ids.has(id), id).toBe(false);
    }
  });
});

describe('açık Almanca ses kapsamı', () => {
  it('karma olmayan Almanca seçenek ve eşleştirmeler için içerik kaynaklı hedef taşır', () => {
    for (const id of ['p1-vor-wie-heisst-mc', 'p2-art-vater-mc', 'gr-kelime-pfannkuchen-tr', 'gr-dinle-kueche']) {
      const exercise = bundle.exercises.find((item) => item.id === id);
      expect(exercise?.audio?.targets?.length, id).toBeGreaterThan(0);
      expect(exercise?.audio?.targets?.every((target) => target.language === 'de-DE'), id).toBe(true);
    }
  });

  it('dinleme ve dikte sorulari Piper hedefini icerik metadatasindan alir', () => {
    const listening = bundle.exercises.filter(
      (exercise) => exercise.type === 'listen-choice' || exercise.type === 'dictation',
    );
    expect(listening.length).toBeGreaterThanOrEqual(40);
    for (const exercise of listening) {
      expect(exercise.audio?.prompt?.language, exercise.id).toBe('de-DE');
      expect(shouldAutoplayPrompt(exercise), exercise.id).toBe(true);
      for (const target of exercise.audio?.targets ?? []) {
        expect(target.text, exercise.id).not.toMatch(/[ğĞşŞıİ]/);
      }
    }
  });

  it('Türkçe → Almanca sorularında Almanca hedef soru anında seslendirilmez', () => {
    const turkishPrompts = lesson.filter(
      (exercise) => exercise.prompt?.includes('→ ______') && exercise.type === 'free-text',
    );
    expect(turkishPrompts.length).toBeGreaterThan(15);
    for (const exercise of turkishPrompts) {
      expect(shouldAutoplayPrompt(exercise), exercise.id).toBe(false);
      expect(exercise.audio?.prompt, exercise.id).toBeUndefined();
    }
  });
});

describe('zorluk dagilimi', () => {
  it('ders bankasi toplamda ~%30 / %50 / %20 dagilimina yakin', () => {
    const share = (difficulty: string) => lesson.filter((exercise) => exercise.difficulty === difficulty).length / lesson.length;
    expect(share('easy')).toBeGreaterThan(0.2);
    expect(share('easy')).toBeLessThan(0.4);
    expect(share('medium')).toBeGreaterThan(0.35);
    expect(share('medium')).toBeLessThan(0.55);
    expect(share('hard')).toBeGreaterThan(0.15);
    expect(share('hard')).toBeLessThan(0.3);
  });

  for (const topic of TOPICS) {
    it(`${topic.title}: her zorluk seviyesi temsil edilir`, () => {
      const exercises = primary(topic.id);
      const share = (difficulty: string) =>
        exercises.filter((exercise) => exercise.difficulty === difficulty).length / exercises.length;
      expect(share('easy'), 'kolay').toBeGreaterThan(0.15);
      expect(share('easy'), 'kolay').toBeLessThan(0.5);
      expect(share('medium'), 'orta').toBeGreaterThan(0.3);
      expect(share('medium'), 'orta').toBeLessThan(0.6);
      expect(share('hard'), 'zor').toBeGreaterThan(0.08);
      expect(share('hard'), 'zor').toBeLessThan(0.36);
    });
  }
});

describe('alistirma cesitliligi', () => {
  it('uygulama agirlikli olarak coktan secmeli degildir', () => {
    const mc = bundle.exercises.filter((exercise) => exercise.type === 'multiple-choice').length;
    expect(mc / bundle.exercises.length).toBeLessThan(0.4);
  });

  it('aktif uretim guclu sekilde temsil edilir', () => {
    const active = bundle.exercises.filter((exercise) =>
      ['production', 'correction', 'speaking'].includes(exercise.skill),
    ).length;
    expect(active / bundle.exercises.length).toBeGreaterThan(0.25);
  });

  it('kelime-bankası ve dinleme dahil on bir alistirma tipi kullanilir', () => {
    const types = new Set(bundle.exercises.map((exercise) => exercise.type));
    expect(types).toEqual(
      new Set([
        'multiple-choice', 'fill-blank', 'free-text', 'sentence-builder', 'matching',
        'error-correction', 'ordering', 'spoken', 'listen-choice', 'dictation', 'word-bank-translation',
      ]),
    );
  });

  it('her konu havuzu en az bes farkli tip icerir', () => {
    for (const topic of TOPICS) {
      const types = new Set(topicPool(topic.id).map((exercise) => exercise.type));
      expect(types.size, topic.id).toBeGreaterThanOrEqual(5);
    }
  });

  it('buyuk konular uretim ve dinleme ile gercekci bir havuz tasir', () => {
    for (const topicId of [T.personalInfo, T.home, T.dailyRoutine, T.modalVerbs, T.time]) {
      const pool = topicPool(topicId);
      expect(pool.filter((exercise) => ['production', 'correction', 'speaking'].includes(exercise.skill)).length, topicId)
        .toBeGreaterThanOrEqual(12);
      expect(pool.filter((exercise) => exercise.difficulty === 'hard').length, topicId).toBeGreaterThanOrEqual(7);
      expect(pool.filter((exercise) => ['listen-choice', 'dictation'].includes(exercise.type)).length, topicId)
        .toBeGreaterThanOrEqual(2);
    }
  });
});

describe('kopya denetimi', () => {
  it('ayni konu havuzunda ayni soru metni tekrar etmez', () => {
    for (const topic of TOPICS) {
      const seen = new Map<string, string>();
      for (const exercise of topicPool(topic.id)) {
        const key = `${exercise.type}|${exercise.instruction}|${exercise.prompt ?? ''}`;
        expect(seen.has(key), `${topic.id}: ${exercise.id} ↔ ${seen.get(key)}`).toBe(false);
        seen.set(key, exercise.id);
      }
    }
  });

  it('ayni konu havuzunda ayni soru + ayni cevap cifti tekrar etmez', () => {
    for (const topic of TOPICS) {
      const seen = new Map<string, string>();
      for (const exercise of topicPool(topic.id)) {
        if (!exercise.answer || !exercise.prompt) continue;
        const key = `${exercise.type}|${exercise.prompt}|${exercise.answer}`;
        expect(seen.has(key), `${topic.id}: ${exercise.id} ↔ ${seen.get(key)}`).toBe(false);
        seen.set(key, exercise.id);
      }
    }
  });
});

describe('Turkce yaklasik okunus', () => {
  it('etiket her zaman "yaklasik" oldugunu belirtir', () => {
    // Veri modeli fonetik dogruluk iddiasi tasimaz; UI etiketi sabittir.
    expect(approximate('wie').turkishApproximation).toBeTruthy();
  });

  it('temel kelimeler beklenen yaklasik okunusu verir (§63)', () => {
    const cases: Array<[string, string]> = [
      ['ich', 'ih'],
      ['heißen', 'haysen'],
      ['Deutschland', 'Doyçlant'],
      ['Türkei', 'Türkay'],
      ['wie', 'vii'],
      ['Guten Morgen', 'guuten morgen'],
      ['Tschüss', 'Çüs'],
      ['kommen', 'komen'],
    ];
    for (const [german, expected] of cases) {
      expect(approximate(german).turkishApproximation, german).toBe(expected);
    }
  });

  it('cumleler kelime kelime cozulur', () => {
    expect(approximate('Ich komme aus der Türkei.').turkishApproximation).toBe('İh kome aus dea türkay.');
    expect(approximate('Wie heißt du?').turkishApproximation).toBe('Vii hayst du?');
  });

  it('zor sesler icin ogrenci notu verir', () => {
    expect(approximate('ich').note).toContain('ch');
    expect(approximate('wohnen').note).toContain('h');
  });

  it('kural motoru sozlukte olmayan kelimeleri makul cevirir', () => {
    expect(transliterateWord('sprechen')).toBe('şprehen');
    expect(transliterateWord('doch')).toBe('doh');
    expect(transliterateWord('zwanzig')).toBe('tsvantsih');
    expect(transliterateWord('Freund')).toBe('froynt');
  });

  it('sessiz `h` iki sesli arasinda duser, sessizden once uzatir', () => {
    // `ch`den gelen "h" sessiz uzatma h'si DEGILDIR ve korunur.
    expect(transliterateWord('sehen')).toBe('zeen');
    expect(transliterateWord('gehen')).toBe('geen');
    expect(transliterateWord('wohnen')).toBe('voonen');
    expect(transliterateWord('Zahl')).toBe('tsaal');
    expect(transliterateWord('Jahr')).toBe('yaar');
    expect(transliterateWord('doch')).toBe('doh');
    expect(transliterateWord('Nacht')).toBe('naht');
  });

  it('kelime sonu ekleri sessiz `h` cozuldukten sonra uygulanir', () => {
    expect(transliterateWord('sehr')).toBe('zea');
    expect(transliterateWord('Lehrer')).toBe('leera');
    expect(transliterateWord('vierzig')).toBe('fiirtsih');
  });

  it('kurs kelimeleri kurator sozlugunde tanimlidir', () => {
    for (const word of ['ich', 'heißen', 'Deutschland', 'Türkei', 'wie', 'Tschüss', 'kommen']) {
      expect(isCurated(word), word).toBe(true);
    }
  });

  it('Almanca cevapli alistirmalarda okunus bulunur', () => {
    const german = bundle.exercises.filter(
      (exercise) =>
        exercise.origin === 'authored' &&
        exercise.answer &&
        /^(Ich|Du|Er|Wir|Ihr|Sie|Wie|Wo|Woher|Wer|Guten|Gute|Auf|Bis|Tschüss)\b/.test(exercise.answer),
    );
    expect(german.length).toBeGreaterThan(5);
    for (const exercise of german) {
      expect(exercise.pronunciation?.length, exercise.id).toBeGreaterThan(0);
    }
  });

  it('Turkce cevaplara okunus eklenmez (okunus hedefleri Almancadir)', () => {
    const turkishAnswer = bundle.exercises.find((exercise) => exercise.id === 'gr-kelime-geschwister-tr');
    expect(turkishAnswer?.answer).toBe('Kardeşlerim Sakarya’da oturuyor.');
    for (const item of turkishAnswer?.pronunciation ?? []) {
      expect(item.german).not.toBe('kardeşler');
      expect(/[A-Za-zÄÖÜäöüß]/.test(item.german)).toBe(true);
    }
  });
});

describe('konu oturumlari', () => {
  it('her konu × Normal/Tam/Hızlı/Zor oturumu 50 tohumda birincil ID tekrarı üretmez', () => {
    for (const topic of TOPICS) {
      for (const mode of ['normal', 'full', 'quick', 'challenge'] as const) {
        for (let seed = 0; seed < 50; seed += 1) {
          const ids = plan(topic.id, mode, `topic:${topic.id}:${mode}:${seed}`);
          expect(new Set(ids).size, `${topic.id}/${mode}/${seed}`).toBe(ids.length);
        }
      }
    }
  });

  it('konu oturumu yalnizca o konuyu (birincil ya da ikincil etiketle) calistirir', () => {
    const byId = new Map(lesson.map((exercise) => [exercise.id, exercise]));
    for (const topic of TOPICS) {
      for (const mode of ['normal', 'full'] as const) {
        for (const id of plan(topic.id, mode, `only:${topic.id}:${mode}`)) {
          expect(touches(topic.id)(byId.get(id)!), `${topic.id} ← ${id}`).toBe(true);
        }
      }
    }
  });

  it('Genel Tekrar bankasi konu ders havuzlarina karismaz', () => {
    for (const topic of TOPICS) {
      expect(exercisesForTopic(topic.id).some((exercise) => exercise.reviewOnly), topic.id).toBe(false);
    }
  });

  it('konunun birincil alistirmalari oturumda agirliktadir', () => {
    const byId = new Map(lesson.map((exercise) => [exercise.id, exercise]));
    for (const topicId of [T.modalVerbs, T.separableVerbs, T.home, T.dailyRoutine]) {
      const ids = plan(topicId, 'normal', `primary-share:${topicId}`);
      const own = ids.filter((id) => byId.get(id)?.topicId === topicId).length;
      expect(own / ids.length, topicId).toBeGreaterThanOrEqual(0.6);
    }
  });

  it('Tam Çalışma konunun bölümlerini geniş tutar (en az 5 farklı bölüm)', () => {
    const byId = new Map(lesson.map((exercise) => [exercise.id, exercise]));
    for (const topicId of [T.modalVerbs, T.separableVerbs, T.home, T.personalInfo, T.time]) {
      const sections = new Set(plan(topicId, 'full', `sections:${topicId}`).map((id) => byId.get(id)?.sectionId));
      expect(sections.size, topicId).toBeGreaterThanOrEqual(5);
    }
  });

  it('Zor Sorular her konuda ağırlıklı olarak çoktan seçmeli değildir', () => {
    const byId = new Map(lesson.map((exercise) => [exercise.id, exercise]));
    for (const topic of TOPICS) {
      const pool = topicPool(topic.id);
      if (!challengeReadiness(pool).ready) continue;
      const chosen = plan(topic.id, 'challenge', `challenge:${topic.id}`).map((id) => byId.get(id)!);
      const recognition = chosen.filter((exercise) => !isProductionTask(exercise)).length;
      expect(recognition / chosen.length, topic.id).toBeLessThanOrEqual(CHALLENGE_MAX_RECOGNITION_RATIO + 0.01);
    }
  });

  it('bölüm pratiği yalnızca o bölümün alıştırmalarını kurar', () => {
    const byId = new Map(lesson.map((exercise) => [exercise.id, exercise]));
    const sectionId = 'modal-verbs.duerfen';
    const pool = lesson.filter((exercise) => exercise.sectionId === sectionId);
    expect(pool.length).toBeGreaterThanOrEqual(5);
    const ids = buildSessionPlan({
      pool: topicPool(T.modalVerbs),
      progress: createEmptyProgress(),
      mode: 'section',
      topicId: T.modalVerbs,
      sectionId,
      seed: 'section',
    }).primaryQueue.map((item) => item.exerciseId);
    expect(ids.length).toBeGreaterThan(0);
    for (const id of ids) expect(byId.get(id)?.sectionId).toBe(sectionId);
  });
});

describe('Kişisel Bilgiler ve Sayılar (eski 1. ve 5. Gün içeriği)', () => {
  it('numara alıştırmaları ve dinleme/dikte güçlü şekilde temsil edilir', () => {
    const numbers = topicPool(T.numbers);
    expect(numbers.length).toBeGreaterThanOrEqual(25);
    expect(numbers.filter((exercise) => ['listen-choice', 'dictation'].includes(exercise.type)).length).toBeGreaterThanOrEqual(5);
  });

  it('54 ve 205 için kanonik (kaynaktaki el yazısı hatasından düzeltilmiş) Almanca kullanılır', () => {
    const numbers = topicPool(T.numbers);
    const haystack = (exercise: Exercise) => [exercise.prompt, exercise.answer, exercise.explanation].filter(Boolean).join(' ');
    expect(numbers.some((exercise) => haystack(exercise).includes('vierundfünfzig'))).toBe(true);
    expect(
      numbers.some(
        (exercise) => haystack(exercise).includes('zweihundertfünf') && !haystack(exercise).includes('zweihundertfünfundzwanzig'),
      ),
    ).toBe(true);
    // 45 (fünfundvierzig) yalnızca "bu yanlıştır" bağlamında (hata avı) geçebilir, kanonik cevap olarak asla.
    expect(numbers.some((exercise) => exercise.type !== 'error-correction' && exercise.answer === 'fünfundvierzig')).toBe(false);
  });

  it('ß içeren cevaplarda ASCII klavye yazımı (dreissig, Strasse) tam doğru sayılır (§klavye toleransı)', () => {
    // Regresyon: `noTypoTolerance` bu iki soruda `ß` yazamayan kullanıcıyı
    // sonsuz "yanlış → tekrar" döngüsüne sokuyordu.
    const dreissig = lesson.find((exercise) => exercise.id === 'p5-son-dreissig-fill')!;
    const strasse = lesson.find((exercise) => exercise.id === 'p5-kb-strasse-fill')!;
    expect(dreissig.validation?.noTypoTolerance).toBeFalsy();
    expect(strasse.validation?.noTypoTolerance).toBeFalsy();
    expect(evaluateExercise(dreissig, 'dreissig').status).toBe('correct');
    expect(evaluateExercise(strasse, 'Strasse').status).toBe('correct');
  });

  it('Artikeller konusu Akkusativ biçimi (einen/keinen/meinen/deinen) istemez; Akkusativ kendi konusunda öğretilir', () => {
    const banned = /\b(einen|keinen|meinen|deinen)\b/i;
    const offenders = primary(T.articles).filter((exercise) =>
      banned.test([exercise.answer, ...(exercise.acceptedAnswers ?? []), ...(exercise.words ?? [])].filter(Boolean).join(' ')),
    );
    expect(offenders.map((exercise) => exercise.id)).toEqual([]);
    const akkusativ = topicPool(T.akkusativ);
    expect(akkusativ.some((exercise) => banned.test(exercise.answer ?? ''))).toBe(true);
  });
});

describe('Ev ve Mobilyalar (eski 7. Gün içeriği)', () => {
  const home = topicPool(T.home);
  const related = [...new Set([...home, ...topicPool(T.adjectives), ...topicPool(T.pronouns)])];

  it('ev ve mobilya kelimeleri artikelleriyle öğretilir', () => {
    const withArticle = home.filter((exercise) =>
      [exercise.answer, exercise.prompt, ...(exercise.options ?? []), ...(exercise.pairs?.map((pair) => pair.left) ?? [])]
        .filter((value): value is string => Boolean(value))
        .some((value) => /\b(der|die|das)\s+[A-ZÄÖÜ]/.test(value)),
    );
    expect(withArticle.length).toBeGreaterThanOrEqual(10);
  });

  it('der → er / die → sie / das → es için özel alıştırmalar vardır', () => {
    const zamir = lesson.filter((exercise) => exercise.sectionId === 'pronouns.article-to-pronoun');
    expect(zamir.length).toBeGreaterThanOrEqual(6);
    expect(zamir.some((exercise) => exercise.answer === 'Er')).toBe(true);
    expect(zamir.some((exercise) => exercise.answer === 'Sie')).toBe(true);
    expect(zamir.some((exercise) => exercise.answer === 'Es')).toBe(true);
  });

  it('öğretilmemiş dilbilgisi (karşılaştırma, genitif, yan cümle) cevap anahtarında geçmez', () => {
    const forbidden = /\b(größer|kleiner|heller|dunkler|schöner|besser|als\s+mein|weil|dass|obwohl|welche[rs]?\s+ist|würde|hätte|wäre)\b/i;
    for (const exercise of home) {
      const surfaces = [
        exercise.answer,
        exercise.prompt,
        exercise.sampleAnswer,
        ...(exercise.acceptedAnswers ?? []),
        ...(exercise.options ?? []),
        ...(exercise.wordBank?.tokens.map((token) => token.text) ?? []),
      ].filter((value): value is string => Boolean(value));
      for (const surface of surfaces) expect(forbidden.test(surface), `${exercise.id}: ${surface}`).toBe(false);
    }
  });

  it('evimin 13 bilgisinin tamamı Almanca içerikte temsil edilir', () => {
    const surfaces = surfaceText(related, [answers, (exercise) => exercise.options ?? [], spoken]);
    const facts: Array<[string, RegExp]> = [
      ['3 tuvalet', /Wir haben drei Toiletten\./],
      ['benim odam var', /Ich habe ein Zimmer\./],
      ['ablamın odası var', /Meine Schwester hat auch ein Zimmer\./],
      ['ablamın odası açık renkli', /Ihr Zimmer ist hell\./],
      ['benim odam gri', /Mein Zimmer ist grau/],
      ['benim odam koyu', /Mein Zimmer ist dunkel/],
      ['ablamın odası büyük', /Ihr Zimmer ist groß\./],
      ['benim odam küçük', /Mein Zimmer ist klein\.|dunkel und klein/],
      ['salon', /Wir haben ein Wohnzimmer\./],
      ['büyük balkon', /Der Balkon ist groß\./],
      ['mutfak', /Wir haben eine Küche\./],
      ['mutfak açık renkli', /Unsere Küche ist hell\./],
      ['kedinin odası', /Unsere Katze hat auch ein Zimmer\./],
    ];
    expect(facts.filter(([, pattern]) => !pattern.test(surfaces)).map(([label]) => label)).toEqual([]);
  });

  it('ev anlatımı için kanonik A1 model cevabı vardır', () => {
    const model = lesson.find((exercise) => exercise.id === 'p7-evim-free-tam-anlatim');
    expect(model?.topicId).toBe(T.home);
    expect(model!.openEnded).toBe(true);
    expect(model!.answer).toContain('Wir haben eine Wohnung.');
    expect(model!.answer).toContain('Unsere Katze hat auch ein Zimmer.');
    // Öğrenciye gönderilen ipuçları cevabı sızdırmaz.
    expect(model!.prompt).not.toMatch(/Wir haben/);
  });

  it('Tam Çalışma ve Zor Sorular her tohumda ev anlatımı üretim göreviyle biter', () => {
    for (const mode of ['full', 'challenge'] as const) {
      for (let seed = 0; seed < 50; seed += 1) {
        const ids = plan(T.home, mode, `home-close:${mode}:${seed}`);
        expect(ids.at(-1), `${mode}#${seed}`).toBe('p7-evim-free-tam-anlatim');
      }
    }
  });

  it('ß içeren cevaplarda ASCII klavye yazımı (gross) tam doğru sayılır', () => {
    const gross = lesson.find((exercise) => exercise.id === 'p7-evim-balkon-gross-tr-de')!;
    expect(evaluateExercise(gross, 'Der Balkon ist gross.').status).toBe('correct');
  });

  it('el yazısındaki hatalar kanonik Almancaya düzeltilmiştir', () => {
    const surfaces = surfaceText(lesson, [(exercise) => [exercise.answer, exercise.prompt, ...(exercise.options ?? [])]]);
    // Defterde `Ich komme nicht heute` yazıyordu; kanonik sıra `heute nicht`.
    expect(surfaces).toContain('Ich komme heute nicht.');
    expect(lesson.filter((exercise) => exercise.answer?.includes('komme nicht heute'))).toEqual([]);
  });
});

describe('Mein Tag, Saatler ve Ayrılabilen Fiiller (eski 10. Gün içeriği)', () => {
  const routine = [...new Set([...topicPool(T.dailyRoutine), ...topicPool(T.separableVerbs), ...topicPool(T.time)])];

  it('öğretilmemiş dilbilgisi (karşılaştırma, yan cümle, Perfekt) cevap anahtarında geçmez', () => {
    const forbidden = /\b(größer|kleiner|heller|dunkler|schöner|besser|als\s+mein|weil|dass|obwohl|würde|hätte|wäre|habe\s+\w+ge\w+|bin\s+\w+gegangen)\b/i;
    for (const exercise of routine) {
      const surfaces = [
        exercise.answer,
        exercise.prompt,
        exercise.sampleAnswer,
        ...(exercise.acceptedAnswers ?? []),
        ...(exercise.options ?? []),
        ...(exercise.wordBank?.tokens.map((token) => token.text) ?? []),
      ].filter((value): value is string => Boolean(value));
      for (const surface of surfaces) expect(forbidden.test(surface), `${exercise.id}: ${surface}`).toBe(false);
    }
  });

  it('yüksek öncelikli ayrılabilen fiillerin her birinin alıştırması vardır', () => {
    const surfaces = surfaceText(topicPool(T.separableVerbs), [(exercise) => [exercise.answer, exercise.prompt, exercise.instruction]]);
    for (const verb of ['aufstehen', 'aufwachen', 'anziehen', 'ausziehen', 'einkaufen', 'aufräumen', 'anrufen', 'fernsehen', 'vorbereiten', 'einladen', 'mitbringen', 'aufhören', 'zurückkommen']) {
      expect(surfaces, verb).toContain(verb);
    }
  });

  it('kaynak rutin adımlarının tamamı Almanca içerikte temsil edilir', () => {
    const surfaces = surfaceText(routine, [answers, spoken]);
    const facts: Array<[string, RegExp]> = [
      ['uyanmak', /Ich wache um sieben Uhr auf\./],
      ['kalkmak', /Ich stehe um sieben Uhr auf\./],
      ['yüz', /Ich wasche mein Gesicht\./],
      ['dişler', /Ich putze meine Zähne\./],
      ['duş', /Ich dusche\./],
      ['giyinmek', /Ich ziehe mich an\./],
      ['kahvaltı', /Ich frühstücke\./],
      ['okul', /Ich gehe zur Schule\./],
      ['ders', /Ich lerne Deutsch und Mathe in der Schule\./],
      ['öğle', /Ich esse zu Mittag\./],
      ['eve dönüş', /Danach komme ich nach Hause zurück\./],
      ['ödev', /Ich mache meine Hausaufgaben\./],
      ['arkadaşlar', /Ich spiele mit meinen Freunden\./],
      ['akşam yemeği', /Ich esse um neun Uhr Abendessen\./],
      ['soyunmak', /Ich ziehe mich aus\./],
      ['kitap', /Ich lese ein Buch\./],
      ['yatak', /Danach gehe ich ins Bett\./],
    ];
    expect(facts.filter(([, pattern]) => !pattern.test(surfaces)).map(([label]) => label)).toEqual([]);
  });

  it('saat kapsama eksiksizdir: soru, resmî, günlük, halb, Viertel, vor, nach, um', () => {
    const surfaces = surfaceText(topicPool(T.time), [(exercise) => [exercise.answer, exercise.prompt, exercise.instruction], spoken]);
    for (const snippet of [
      'Wie spät ist es?', 'Wie viel Uhr ist es?', 'Es ist acht Uhr zwanzig.',
      'zwanzig nach fünf', 'zwanzig vor vier', 'Viertel nach sechs', 'halb acht', 'um sieben Uhr',
      'Es ist halb acht.', 'Es ist Viertel vor neun.', 'Es ist zwanzig Uhr fünfunddreißig.',
    ]) {
      expect(surfaces, snippet).toContain(snippet);
    }
  });

  it('kritik saat doğruları korunur (halb/vor/20:45)', () => {
    const halb = lesson.find((exercise) => exercise.id === 'p10-halb-mc-anlam')!;
    expect(halb.topicId).toBe(T.time);
    expect(halb.answer).toBe('07:30');
    const surfaces = surfaceText(topicPool(T.time), [(exercise) => [exercise.answer, exercise.prompt, ...(exercise.options ?? [])]]);
    // `von` asla `vor` yerine geçmez; 20:45 asla `Viertel vor acht` olmaz.
    expect(surfaces).not.toMatch(/zwanzig von/i);
    expect(surfaces).not.toMatch(/viertel von/i);
    expect(surfaces).not.toContain('Viertel vor acht');
  });

  it('el yazısındaki hatalar kanonik Almancaya düzeltilmiştir', () => {
    const joined = surfaceText(routine, [(exercise) => [exercise.answer, ...(exercise.acceptedAnswers ?? [])]]);
    for (const correct of ['Ich dusche.', 'Ich lese ein Buch.', 'Danach gehe ich ins Bett.', 'Ich spiele mit meinen Freunden.']) {
      expect(joined).toContain(correct);
    }
    const wrongAsAnswer = routine.filter((exercise) =>
      ['Ich dusche mich.', 'Ich lese Buch.', 'Danach gete ich ins Bett.', 'Ich spiele mit meiner Freunden.'].includes(exercise.answer ?? ''),
    );
    expect(wrongAsAnswer.map((exercise) => exercise.id)).toEqual([]);
  });

  it('gün anlatımı için kanonik A1 model cevabı vardır ve Mein Tag Tam/Zor oturumu onunla biter', () => {
    const model = lesson.find((exercise) => exercise.id === 'p10-meintag-free-tam-anlatim');
    expect(model?.topicId).toBe(T.dailyRoutine);
    expect(model!.openEnded).toBe(true);
    expect(model!.answer).toContain('Ich wache um sieben Uhr auf.');
    expect(model!.answer).toContain('Danach gehe ich ins Bett.');
    expect(model!.prompt).not.toMatch(/Ich wache|Ich stehe/);
    for (const mode of ['full', 'challenge'] as const) {
      for (let seed = 0; seed < 50; seed += 1) {
        expect(plan(T.dailyRoutine, mode, `routine-close:${mode}:${seed}`).at(-1), `${mode}#${seed}`).toBe(
          'p10-meintag-free-tam-anlatim',
        );
      }
    }
  });

  it('umlaut içeren cevaplarda ASCII klavye yazımı tam doğru sayılır', () => {
    const raeume = lesson.find((exercise) => exercise.id === 'p10-aufraeumen-raeume-fill')!;
    const zurueck = lesson.find((exercise) => exercise.id === 'p10-zurueck-komme-fill')!;
    expect(evaluateExercise(raeume, 'raeume').status).toBe('correct');
    expect(evaluateExercise(zurueck, 'zurueck').status).toBe('correct');
  });
});

describe('Modalverben', () => {
  const modal = primary(T.modalVerbs);
  const fresh = lesson.filter((exercise) => exercise.id.startsWith('mv-'));
  const pool = topicPool(T.modalVerbs);

  it('en az 100 benzersiz yeni alıştırma içerir (130 hedef bandında)', () => {
    expect(fresh.length).toBeGreaterThanOrEqual(100);
    expect(new Set(fresh.map((exercise) => exercise.id)).size).toBe(fresh.length);
    expect(modal.length).toBeGreaterThanOrEqual(fresh.length);
    for (const exercise of fresh) expect(exercise.topicId).toBe(T.modalVerbs);
  });

  it('beş ana fiilin her biri çekim ve kullanım olarak çalışılır; mögen/müssen hafif kalır', () => {
    for (const verb of ['koennen', 'moechten', 'wollen', 'sollen', 'duerfen']) {
      const withVerb = modal.filter((exercise) => exercise.conceptIds.some((id) => id.startsWith(`modal-verbs.${verb}.`)));
      expect(withVerb.length, verb).toBeGreaterThanOrEqual(6);
    }
    const light = modal.filter((exercise) =>
      exercise.conceptIds.some((id) => id === 'modal-verbs.moegen.anlam' || id === 'modal-verbs.muessen.anlam'),
    );
    expect(light.length).toBeGreaterThan(0);
    expect(light.length / modal.length).toBeLessThan(0.1);
  });

  it('merkez kural (Modalverb ikinci sırada, mastar sonda), soru ve olumsuzluk ayrı ayrı çalışılır', () => {
    const minimum: Record<string, number> = {
      'modal-verbs.kural': 5,
      'modal-verbs.frage': 5,
      'modal-verbs.nicht': 5,
      'modal-verbs.man': 3,
      'modal-verbs.ich-er-ayni': 2,
    };
    for (const [conceptId, count] of Object.entries(minimum)) {
      expect(modal.filter((exercise) => exercise.conceptIds.includes(conceptId)).length, conceptId).toBeGreaterThanOrEqual(count);
    }
  });

  it('üretim önce gelir: çoktan seçmeli azınlıktır, üretim çoğunluktur', () => {
    const mc = fresh.filter((exercise) => exercise.type === 'multiple-choice').length;
    const production = fresh.filter((exercise) => ['production', 'correction', 'speaking'].includes(exercise.skill)).length;
    expect(mc / fresh.length).toBeLessThan(0.2);
    expect(production / fresh.length).toBeGreaterThan(0.5);
  });

  it('kategori dağılımı hedefe yakındır (çekirdek+cümle ≥ %50, ayrılabilen/kelime/Akkusativ her biri %8–20)', () => {
    const words = (exercise: Exercise) => (exercise.answer ?? '').trim().split(/\s+/).filter(Boolean).length;
    const category = (exercise: Exercise) => {
      const ids = exercise.conceptIds;
      if (ids.some((id) => id === 'modal-verbs.akkusativ' || id.startsWith('akkusativ.'))) return 'akkusativ';
      if (ids.some((id) => id === 'modal-verbs.trennbar' || id.startsWith('separable-verbs.'))) return 'separable';
      if (ids.some((id) => /^(vocabulary|home|food|shopping)\./.test(id))) return 'vocabulary';
      const sentence =
        (exercise.type === 'free-text' && words(exercise) >= 3) ||
        (exercise.type === 'word-bank-translation' && exercise.wordBank?.direction === 'tr-to-de') ||
        exercise.type === 'ordering' ||
        exercise.type === 'sentence-builder';
      return sentence ? 'sentence' : 'core';
    };
    const share = (name: string) => fresh.filter((exercise) => category(exercise) === name).length / fresh.length;
    expect(share('core') + share('sentence')).toBeGreaterThanOrEqual(0.5);
    for (const name of ['separable', 'vocabulary', 'akkusativ']) {
      expect(share(name), name).toBeGreaterThanOrEqual(0.08);
      expect(share(name), name).toBeLessThanOrEqual(0.2);
    }
  });

  it('Modalverb + ayrılabilen fiil cümleleri iki konuda da görünür (çapraz etiket)', () => {
    const cross = fresh.filter((exercise) => exercise.secondaryTopicIds?.includes(T.separableVerbs));
    expect(cross.length).toBeGreaterThanOrEqual(10);
    const separablePool = new Set(topicPool(T.separableVerbs).map((exercise) => exercise.id));
    for (const exercise of cross) expect(separablePool.has(exercise.id), exercise.id).toBe(true);
    const joined = surfaceText(cross, [answers]);
    expect(joined).toContain('Ich will morgen früh aufstehen.');
    // Mastar hâlinde bölünmez: "stehe … auf" Modalverb cümlesinde cevap olamaz.
    expect(cross.filter((exercise) => /\b(will|möchte|kann|soll|darf)\b[^.?!]*\bstehe\b[^.?!]*\bauf\b/.test(exercise.answer ?? ''))).toEqual([]);
  });

  it('Akkusativ pekiştirmesi ayrı bir ders açmadan yeni malzemenin %10–15\'i kadardır', () => {
    const newMaterial = bundle.exercises.filter(
      (exercise) => (!exercise.reviewOnly && exercise.legacyDay === undefined) || exercise.id.startsWith('gr-mv-') || exercise.id.startsWith('gr-yaz-mv-'),
    );
    const akk = newMaterial.filter((exercise) =>
      exercise.conceptIds.some((id) => id === 'modal-verbs.akkusativ' || id.startsWith('akkusativ.')),
    );
    expect(akk.length / newMaterial.length).toBeGreaterThanOrEqual(0.1);
    expect(akk.length / newMaterial.length).toBeLessThanOrEqual(0.16);
    expect(surfaceText(akk, [answers])).toMatch(/\beinen\b/);
    expect(surfaceText(akk, [answers])).toMatch(/\bmeinen\b|\bkeinen\b/);
  });

  it('defterdeki örnekler kanonik (düzeltilmiş) Almanca ile öğretilir', () => {
    const joined = surfaceText(pool, [answers, spoken]);
    for (const sentence of [
      'Ich kann Deutsch sprechen.',
      'Meine Tante kann Klavier spielen.',
      'Können Sie Ihren Namen sagen?',
      'Du möchtest Kaffee trinken.',
      'Ich möchte keinen Kaffee trinken.',
      'Mein Vater will ein Haus kaufen.',
      'Ich will morgen früh nicht aufstehen.',
      'Hier darf man nicht parken.',
      'Hier darf man nicht rauchen.',
    ]) {
      expect(joined, sentence).toContain(sentence);
    }
  });

  it('defterdeki hatalı biçimler hiçbir alıştırmanın kanonik cevabı olamaz', () => {
    const wrong = /Hier darf nicht rauchen|\bDu möchte\b|\bSie dürf\b|\bseine Name\b|Ihre Name sagen|\bEr kannt\b/;
    expect(pool.filter((exercise) => wrong.test(exercise.answer ?? '')).map((exercise) => exercise.id)).toEqual([]);
  });

  it('hata avı soruları sık hataları düzeltir', () => {
    const errors = modal.filter((exercise) => exercise.type === 'error-correction');
    expect(errors.length).toBeGreaterThanOrEqual(6);
    const pairs = errors.map((exercise) => `${exercise.prompt} → ${exercise.answer}`).join(' | ');
    expect(pairs).toContain('Ich kann Deutsch spreche. → Ich kann Deutsch sprechen.');
    expect(pairs).toContain('Hier darf nicht rauchen. → Hier darf man nicht rauchen.');
    expect(pairs).toContain('Du möchte Kaffee trinken. → Du möchtest Kaffee trinken.');
  });

  it('Konjunktiv II teorisine dönüşmez', () => {
    const offenders = bundle.exercises.filter((exercise) =>
      /konjunktiv|könnte|hätte|würde/i.test([exercise.instruction, exercise.prompt, exercise.explanation, exercise.hint, exercise.answer].join(' ')),
    );
    expect(offenders.map((exercise) => exercise.id)).toEqual([]);
  });

  it('görsellerdeki yeni kelimeler cümle içinde öğretilir', () => {
    const vocabulary = CONCEPTS.filter(
      (concept) => concept.sectionId === 'vocabulary.new-verbs' || concept.sectionId === 'vocabulary.things' || concept.sectionId === 'vocabulary.classroom',
    );
    expect(vocabulary.length).toBeGreaterThanOrEqual(20);
    for (const concept of vocabulary) {
      const inSentence = bundle.exercises.filter(
        (exercise) =>
          exercise.conceptIds.includes(concept.id) &&
          [exercise.answer, exercise.sampleAnswer, ...(exercise.pronunciation?.map((item) => item.german) ?? [])].some(
            (text) => (text ?? '').trim().split(/\s+/).length >= 3,
          ),
      );
      expect(inSentence.length, concept.id).toBeGreaterThan(0);
    }
  });

  it('oturum boyutları hedef bantlarda kalır (Normal 20–25, Tam 45–60, Hızlı 8–12, Zor 15–20)', () => {
    const bands: Record<string, [number, number]> = { normal: [20, 25], full: [45, 60], quick: [8, 12], challenge: [15, 20] };
    for (const [mode, [low, high]] of Object.entries(bands)) {
      const ids = plan(T.modalVerbs, mode as SessionMode, `mv-size:${mode}`);
      expect(ids.length, mode).toBeGreaterThanOrEqual(low);
      expect(ids.length, mode).toBeLessThanOrEqual(high);
    }
  });

  it('Tam Çalışma ve Zor Sorular her tohumda "yarın ne yapmak istiyorsun?" üretim göreviyle biter', () => {
    for (const mode of ['full', 'challenge'] as const) {
      for (let seed = 0; seed < 50; seed += 1) {
        expect(plan(T.modalVerbs, mode, `mv-close:${mode}:${seed}`).at(-1), `${mode}#${seed}`).toBe('mv-free-morgen');
      }
    }
  });

  it('Normal / Tam / Zor oturumları 50 tohumda birincil ID tekrarı üretmez ve challenge hazırdır', () => {
    for (const mode of ['normal', 'full', 'challenge'] as const) {
      for (let seed = 0; seed < 50; seed += 1) {
        const ids = plan(T.modalVerbs, mode, `mv:${mode}:${seed}`);
        expect(new Set(ids).size, `${mode}#${seed}`).toBe(ids.length);
      }
    }
    expect(challengeReadiness(pool).ready).toBe(true);
  });
});

describe('Genel Tekrar bankasi (kumulatif, ayni taksonomi)', () => {
  const lessonPairs = new Map<string, string>();
  const normalize = (value: string) =>
    value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLocaleLowerCase('tr').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  for (const exercise of lesson) {
    if (exercise.prompt && exercise.answer) lessonPairs.set(`${normalize(exercise.prompt)}|${normalize(exercise.answer)}`, exercise.id);
  }

  it('en az 180 ozgun kumulatif alistirma icerir', () => {
    expect(bank.length).toBeGreaterThanOrEqual(180);
    expect(new Set(bank.map((exercise) => exercise.id)).size).toBe(bank.length);
  });

  it('her soru kanonik bir konu etiketi tasir (ikinci taksonomi yok)', () => {
    for (const exercise of bank) expect(topicIds.has(exercise.topicId), exercise.id).toBe(true);
    for (const section of bundle.reviewSummary?.sections ?? []) {
      if (section.topicId) expect(topicIds.has(section.topicId), section.id).toBe(true);
    }
  });

  it('en az 60 cumle-uretim gorevi icerir', () => {
    expect(bank.filter(isSentenceExercise).length).toBeGreaterThanOrEqual(60);
  });

  it('coktan secmeli azinliktir (aktif hatirlama agirlikli)', () => {
    expect(bank.filter((exercise) => exercise.type === 'multiple-choice').length / bank.length).toBeLessThan(0.25);
  });

  it('her kanonik konunun Genel Tekrar kartı en az 6 soruluk havuza sahiptir', () => {
    for (const topic of TOPICS) {
      expect(reviewPoolFor(bank, 'topic', topic.id, lesson).length, topic.id).toBeGreaterThanOrEqual(MIN_TOPIC_POOL);
    }
  });

  it('Cümle Kurma ve Writing modları Modalverben içerir', () => {
    const sentence = reviewPoolFor(bank, 'sentence').filter(touches(T.modalVerbs));
    const writing = reviewPoolFor(bank, 'writing').filter(touches(T.modalVerbs));
    expect(sentence.length).toBeGreaterThanOrEqual(10);
    expect(writing.length).toBeGreaterThanOrEqual(3);
    expect(writing.some((exercise) => exercise.instruction.includes('Neler yapabildiğini 4 cümleyle anlat'))).toBe(true);
  });

  it('ders sorularinin kopyasi degildir (yeni birlesimler)', () => {
    const copies = bank
      .filter((exercise) => exercise.prompt && exercise.answer)
      .map((exercise) => [exercise.id, lessonPairs.get(`${normalize(exercise.prompt!)}|${normalize(exercise.answer!)}`)])
      .filter(([, first]) => first)
      .map(([id, first]) => `${id} ↔ ${first}`);
    expect(copies).toEqual([]);
  });

  it('dinleme sorulari Almanca ses hedefi tasir, Turkce sizmaz', () => {
    const listening = bank.filter((exercise) => exercise.type === 'listen-choice' || exercise.type === 'dictation');
    expect(listening.length).toBeGreaterThanOrEqual(15);
    for (const exercise of listening) {
      expect(exercise.audio?.prompt?.language, exercise.id).toBe('de-DE');
      for (const target of exercise.audio?.targets ?? []) {
        expect(target.language, exercise.id).toBe('de-DE');
        expect(target.text, exercise.id).not.toMatch(/[ğĞşŞçÇıİ]/);
      }
    }
  });

  it('writing gorevleri ornek cevapli ve acik ucludur', () => {
    const writing = bank.filter(isWritingExercise);
    expect(writing.length).toBeGreaterThanOrEqual(5);
    for (const exercise of writing) expect(exercise.sampleAnswer, exercise.id).toBeTruthy();
  });

  it('50 tohumda oturum ici birincil ID tekrari uretmez (karisik/cumle/kelime/writing/zor/konu)', () => {
    const cases: Array<[SessionMode, Exercise[]]> = [
      ['gr-mixed', reviewPoolFor(bank, 'mixed')],
      ['gr-vocab', reviewPoolFor(bank, 'vocab')],
      ['gr-sentence', reviewPoolFor(bank, 'sentence')],
      ['gr-writing', reviewPoolFor(bank, 'writing')],
      ['gr-challenge', reviewPoolFor(bank, 'challenge')],
      ['gr-topic', reviewPoolFor(bank, 'topic', T.modalVerbs, lesson)],
    ];
    for (const [mode, pool] of cases) {
      for (let seed = 0; seed < 50; seed += 1) {
        const ids = buildSessionPlan({ pool, progress: createEmptyProgress(), mode, seed: `gr:${mode}:${seed}` }).primaryQueue.map(
          (item) => item.exerciseId,
        );
        expect(new Set(ids).size, `${mode}/${seed}`).toBe(ids.length);
      }
    }
  });

  it('karisik oturum konulari karistirir (en az 6 kanonik konu)', () => {
    const byId = new Map(bank.map((exercise) => [exercise.id, exercise]));
    const ids = buildSessionPlan({
      pool: reviewPoolFor(bank, 'mixed'),
      progress: createEmptyProgress(),
      mode: 'gr-mixed',
      seed: 'gr-topic-mix',
    }).primaryQueue.map((item) => item.exerciseId);
    expect(new Set(ids.map((id) => byId.get(id)?.topicId)).size).toBeGreaterThanOrEqual(6);
  });

  it('Genel Tekrar konu kartı önce Genel Tekrar sorularını kullanır', () => {
    const pool = reviewPoolFor(bank, 'topic', T.modalVerbs, lesson);
    const ids = buildSessionPlan({ pool, progress: createEmptyProgress(), mode: 'gr-topic', topicId: T.modalVerbs, seed: 'gr-topic' })
      .primaryQueue.map((item) => item.exerciseId);
    const reviewShare = ids.filter((id) => id.startsWith('gr-')).length / ids.length;
    expect(reviewShare).toBeGreaterThanOrEqual(0.5);
  });
});

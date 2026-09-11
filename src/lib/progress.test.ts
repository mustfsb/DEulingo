import { describe, expect, it } from 'vitest';
import type { Exercise } from '../content/types';
import {
  createEmptyProgress,
  migrate,
  parseImportedProgress,
  serializeProgress,
  STORAGE_VERSION,
  type SessionPresentation,
  type UserProgress,
} from './storage';
import {
  correctKeyboardToleranceHistory,
  getGlobalSummary,
  getTopicProgressStats,
  getTopicStats,
  recordAttempt,
  resetTopicProgress,
  weaknessScore,
} from './progress';
import { buildReviewQueue, MAX_RETRIES, scheduleRetry } from './lesson';

function exercise(id: string, topicId = 'topic.verbs', topic = 'Fiiller ve Çekim'): Exercise {
  return {
    id,
    topic,
    topicId,
    type: 'fill-blank',
    instruction: '`kommen` fiilini çek.',
    prompt: 'du ___',
    answer: 'kommst',
    difficulty: 'medium',
    skill: 'recall',
    conceptIds: ['day2.konjugation.du-st'],
    origin: 'vault',
    source: { file: 'test.md', naturalKey: `test/${id}` },
  };
}

const exercises = [exercise('a'), exercise('b'), exercise('c', 'topic.articles', 'Artikeller ve Olumsuzluk')];

function seed(results: Array<[string, 'correct' | 'minor-typo' | 'incorrect']>): UserProgress {
  let progress = createEmptyProgress();
  for (const [id, result] of results) {
    const target = exercises.find((item) => item.id === id)!;
    progress = recordAttempt(progress, target, 'kommen', result, {
      status: result,
      expected: 'kommst',
      normalizedInput: 'kommen',
    });
  }
  return progress;
}

describe('deneme kaydi', () => {
  it('sayaclari ve gecmisi tutar', () => {
    const progress = seed([
      ['a', 'incorrect'],
      ['a', 'correct'],
    ]);
    const entry = progress.exercises.a;
    expect(entry.attempts).toHaveLength(2);
    expect(entry.attempts[1].attemptNumber).toBe(2);
    expect(entry.incorrectCount).toBe(1);
    expect(entry.correctCount).toBe(1);
    expect(progress.stats.totalAttempts).toBe(2);
  });

  it('yazim hatasi kabul edilse bile kaydedilir', () => {
    const progress = seed([['a', 'minor-typo']]);
    expect(progress.exercises.a.typoCount).toBe(1);
    expect(progress.mistakes.a.typoCount).toBe(1);
    expect(progress.mistakes.a.count).toBe(0);
    expect(progress.mistakes.a.expectedAnswer).toBe('kommst');
  });

  it('ust uste iki dogru cevap sonrasi ustalik isaretlenir', () => {
    const progress = seed([
      ['a', 'incorrect'],
      ['a', 'correct'],
      ['a', 'correct'],
    ]);
    expect(progress.exercises.a.mastered).toBe(true);
  });

  it('hata kaydini kanonik konusuyla birlikte saklar (gun yok)', () => {
    const progress = seed([['c', 'incorrect']]);
    expect(progress.mistakes.c.topicId).toBe('topic.articles');
    expect(progress.mistakes.c.topic).toBe('Artikeller ve Olumsuzluk');
    expect((progress.mistakes.c as unknown as { day?: unknown }).day).toBeUndefined();
    expect((progress.exercises.c as unknown as { day?: unknown }).day).toBeUndefined();
    expect(progress.mistakes.c.type).toBe('article');
    expect(progress.mistakes.c.count).toBe(1);
  });

  it('dogru cevaplanan hata listeden DUSER', () => {
    const progress = seed([
      ['a', 'incorrect'],
      ['b', 'incorrect'],
      ['a', 'correct'],
    ]);
    expect(progress.mistakes.a).toBeUndefined();
    // Cozulmemis olan yerinde kalir.
    expect(progress.mistakes.b.count).toBe(1);
    // Gecmis silinmez: istatistikler yanlisi saymaya devam eder.
    expect(progress.exercises.a.incorrectCount).toBe(1);
    expect(progress.stats.totalIncorrect).toBe(2);
  });

  it('ogrenci kendi cevabini dogru ilan edince de hata duser', () => {
    let progress = seed([['a', 'incorrect']]);
    expect(progress.mistakes.a).toBeDefined();
    progress = recordAttempt(progress, exercises[0], 'kommen', 'self-assessed');
    expect(progress.mistakes.a).toBeUndefined();
  });

  it('yeniden yanlis yapilirsa hata listeye geri gelir', () => {
    const progress = seed([
      ['a', 'incorrect'],
      ['a', 'correct'],
      ['a', 'incorrect'],
    ]);
    expect(progress.mistakes.a.count).toBe(1);
  });
});

describe('konu istatistikleri', () => {
  it('bos ilerlemede baslamamis gosterir', () => {
    const stats = getTopicProgressStats(createEmptyProgress(), 'topic.verbs', exercises);
    expect(stats.state).toBe('not-started');
    expect(stats.accuracy).toBeNull();
    expect(stats.completionPct).toBe(0);
  });

  it('dogruluk ve tamamlanma oranini hesaplar', () => {
    const progress = seed([
      ['a', 'correct'],
      ['b', 'incorrect'],
    ]);
    const stats = getTopicProgressStats(progress, 'topic.verbs', exercises);
    expect(stats.topicId).toBe('topic.verbs');
    expect(stats.completed).toBe(2);
    expect(stats.total).toBe(3);
    expect(stats.accuracy).toBeCloseTo(0.5);
    expect(stats.state).toBe('in-progress');
  });

  it('dusuk dogrulukta tekrar onerir', () => {
    const progress = seed([
      ['a', 'incorrect'],
      ['b', 'incorrect'],
      ['c', 'correct'],
    ]);
    expect(getTopicProgressStats(progress, 'topic.verbs', exercises).reviewRecommended).toBe(true);
  });

  it('yuksek dogrulukta tekrar onermez', () => {
    const progress = seed([
      ['a', 'correct'],
      ['b', 'correct'],
      ['c', 'correct'],
    ]);
    const stats = getTopicProgressStats(progress, 'topic.verbs', exercises);
    expect(stats.state).toBe('completed');
    expect(stats.reviewRecommended).toBe(false);
  });

  it('konu bazli zorlanma siralamasi uretir', () => {
    const progress = seed([
      ['c', 'incorrect'],
      ['c', 'incorrect'],
      ['a', 'incorrect'],
    ]);
    const [first] = getTopicStats(progress, exercises);
    expect(first.topicId).toBe('topic.articles');
    expect(first.topic).toBe('Artikeller ve Olumsuzluk');
  });

  it('genel ozet tamamlanan KONULARI sayar (gun yok); Genel Tekrar tamamlanmaya sayilmaz', () => {
    const review = { ...exercise('gr-x'), reviewOnly: true };
    const progress = seed([
      ['a', 'correct'],
      ['b', 'correct'],
    ]);
    const summary = getGlobalSummary(progress, [...exercises, review]);
    // Fiiller: a+b tamam; Artikeller: c henuz yok.
    expect(summary.completedTopics).toBe(1);
    expect((summary as unknown as { completedDays?: unknown }).completedDays).toBeUndefined();
  });
});

describe('sifirlama', () => {
  it('yalnizca secilen konunun birincil alistirmalarini siler; Genel Tekrar kayitlari kalir', () => {
    const other = exercise('z', 'topic.articles', 'Artikeller ve Olumsuzluk');
    const review = { ...exercise('gr-a'), reviewOnly: true };
    let progress = seed([['a', 'incorrect']]);
    progress = recordAttempt(progress, other, 'x', 'incorrect');
    progress = recordAttempt(progress, review, 'x', 'incorrect');
    progress = { ...progress, topics: { 'topic.verbs': { topicId: 'topic.verbs', sessionsCompleted: 2 } } };
    const reset = resetTopicProgress(progress, 'topic.verbs', ['a', 'b', 'gr-a']);
    expect(reset.exercises.a).toBeUndefined();
    expect(reset.mistakes.a).toBeUndefined();
    expect(reset.exercises.z).toBeDefined();
    expect(reset.mistakes.z).toBeDefined();
    expect(reset.exercises['gr-a']).toBeDefined();
    expect(reset.topics['topic.verbs']).toBeUndefined();
  });

  it('yarim kalan ayni konu dersini kapatir, baskasininkine dokunmaz', () => {
    const base = seed([['a', 'incorrect']]);
    const active = {
      mode: 'topic' as const,
      topicId: 'topic.verbs',
      queue: [{ exerciseId: 'a', presentationReason: 'primary' as const }],
      index: 0,
      startedAt: '2026-09-01T00:00:00.000Z',
      results: [],
      retries: {},
    };
    expect(resetTopicProgress({ ...base, activeLesson: active }, 'topic.verbs', ['a']).activeLesson).toBeUndefined();
    expect(resetTopicProgress({ ...base, activeLesson: active }, 'topic.articles', ['c']).activeLesson).toBeDefined();
  });
});

describe('ders kuyrugu', () => {
  // Not: oturumun HANGI alistirmalardan kurulacagi artik `lib/session.ts`
  // sorumlulugunda ve `session.test.ts` icinde test ediliyor. Burada ders
  // SIRASINDAKI kuyruk davranisi doğrulanir.
  it('yanlis cevabi hemen degil, birkac soru sonra tekrar sorar', () => {
    const queue = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map((exerciseId) => ({
      exerciseId,
      presentationReason: 'primary' as const,
    }));
    const { queue: next } = scheduleRetry(queue, 0, 'a', {});
    expect(next.findIndex((item) => item.exerciseId === 'a' && item.presentationReason === 'mistake-retry')).toBeGreaterThanOrEqual(3);
    expect(next).toHaveLength(9);
  });

  it('ayni derste sinirsiz tekrar eklemez', () => {
    let queue: SessionPresentation[] = ['a', 'b', 'c', 'd'].map((exerciseId) => ({
      exerciseId,
      presentationReason: 'primary' as const,
    }));
    let retries: Record<string, number> = {};
    for (let i = 0; i < 5; i++) {
      const result = scheduleRetry(queue, 0, 'a', retries);
      queue = result.queue;
      retries = result.retries;
    }
    expect(retries.a).toBe(MAX_RETRIES);
    expect(queue.filter((item) => item.exerciseId === 'a')).toHaveLength(1 + MAX_RETRIES);
  });

  it('tekrar oturumunu zayiflik puanina gore siralar', () => {
    const progress = seed([
      ['a', 'minor-typo'],
      ['b', 'incorrect'],
      ['b', 'incorrect'],
    ]);
    expect(buildReviewQueue(exercises, progress)).toEqual(['b', 'a']);
    expect(weaknessScore(progress, 'c')).toBe(0);
  });

});

describe('depolama semasi', () => {
  it('bos ilerleme gecerli surumle baslar', () => {
    expect(createEmptyProgress().version).toBe(STORAGE_VERSION);
  });

  it('surumsuz veriyi reddeder (yedege alinir, silinmez)', () => {
    expect(migrate({ exercises: {} })).toBeNull();
    expect(migrate(null)).toBeNull();
  });

  it('gelecek surumu reddeder', () => {
    expect(migrate({ ...createEmptyProgress(), version: STORAGE_VERSION + 1 })).toBeNull();
  });

  it('eksik alanlari tamamlar', () => {
    const migrated = migrate({ version: 1, exercises: { a: {} } } as unknown);
    expect(migrated?.mistakes).toEqual({});
    expect(migrated?.settings.dailyGoalMinutes).toBe(10);
    expect(migrated?.stats.totalAttempts).toBe(0);
  });

  it('disa/ice aktarma dongusu veriyi korur', () => {
    const progress = seed([['a', 'incorrect']]);
    const result = parseImportedProgress(serializeProgress(progress));
    expect(result.ok).toBe(true);
    expect(result.progress?.exercises.a.incorrectCount).toBe(1);
    expect(result.progress?.mistakes.a.expectedAnswer).toBe('kommst');
  });

  it('bozuk yedegi reddeder', () => {
    expect(parseImportedProgress('{sözde json').ok).toBe(false);
    expect(parseImportedProgress('{"foo":1}').ok).toBe(false);
  });
});

describe('klavye toleransi geriye dönük düzeltme', () => {
  /** keyboardTolerance:true ve Almanca özel harfli cevabi olan bir egzersiz. */
  function keyboardExercise(id: string): Exercise {
    return {
      ...exercise(id, 'topic.greetings', 'Selamlaşma ve Tanışma'),
      answer: 'heißt',
      validation: { keyboardTolerance: true },
    };
  }

  it('klavye yazimiyla yanlis sayilan denemeyi dogruya cevirir, hatayi temizler', () => {
    const target = keyboardExercise('k1');
    let progress = createEmptyProgress();
    progress = recordAttempt(progress, target, 'heist', 'incorrect', {
      status: 'incorrect',
      expected: 'heißt',
      normalizedInput: 'heist',
    });
    expect(progress.mistakes.k1).toBeDefined();
    expect(progress.exercises.k1.incorrectCount).toBe(1);

    const corrected = correctKeyboardToleranceHistory(progress, (id) =>
      id === 'k1' ? keyboardExercise('k1') : undefined,
    );

    expect(corrected.mistakes.k1).toBeUndefined();
    expect(corrected.exercises.k1.incorrectCount).toBe(0);
    expect(corrected.exercises.k1.correctCount).toBe(1);
    expect(corrected.exercises.k1.attempts[0].result).toBe('correct');
  });

  it('klavye toleransi olmayan egzersizlerde gercek yanlisi korur', () => {
    const target = exercise('z');
    let progress = createEmptyProgress();
    progress = recordAttempt(progress, target, 'kommen', 'incorrect', {
      status: 'incorrect',
      expected: 'kommst',
      normalizedInput: 'kommen',
    });
    const corrected = correctKeyboardToleranceHistory(progress, () => undefined);
    expect(corrected.mistakes.z).toBeDefined();
    expect(corrected.exercises.z.incorrectCount).toBe(1);
  });

  it('konu rozeti yalnizca ACIK hatalari sayar (Hatalarim ile tutarli)', () => {
    const a = keyboardExercise('a');
    const b = exercise('b');
    let progress = createEmptyProgress();
    progress = recordAttempt(progress, a, 'heist', 'incorrect', {
      status: 'incorrect',
      expected: 'heißt',
      normalizedInput: 'heist',
    });
    progress = recordAttempt(progress, b, 'kommen', 'incorrect', {
      status: 'incorrect',
      expected: 'kommst',
      normalizedInput: 'kommen',
    });

    // Duzeltme oncesi: ikisi de hata olarak gorunur.
    expect(getTopicProgressStats(progress, 'topic.verbs', [a, b]).mistakeCount).toBe(2);

    const corrected = correctKeyboardToleranceHistory(progress, (id) =>
      id === 'a' ? keyboardExercise('a') : undefined,
    );
    // 'a' duzeltildi, 'b' gercek hata kaldi.
    expect(getTopicProgressStats(corrected, 'topic.verbs', [a, b]).mistakeCount).toBe(1);
  });
});

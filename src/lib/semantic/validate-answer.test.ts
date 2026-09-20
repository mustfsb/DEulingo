import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { Exercise } from '../../content/types';
import { clearSemanticCache } from './cache';
import { resetSemanticMetrics, semanticMetricsSummary } from './metrics';
import { JEV_ACCEPT_THRESHOLD } from './threshold';
import {
  deterministicValidate,
  hybridToValidation,
  validateAnswer,
  type HybridResult,
} from './validate-answer';

function ex(partial: Partial<Exercise> & Pick<Exercise, 'id' | 'type' | 'answer'>): Exercise {
  return {
    topicId: 'topic.verbs',
    topic: 'Fiiller',
    instruction: 'Türkçesini yaz:',
    prompt: 'machen',
    source: { file: 'test', naturalKey: 't' },
    difficulty: 'medium',
    skill: 'recall',
    conceptIds: [],
    origin: 'authored',
    ...partial,
  };
}

const machen = () =>
  ex({ id: 'vocab-v-machen-detr-type', type: 'free-text', instruction: 'Türkçesini yaz:', prompt: 'machen', answer: 'yapmak' });

function mockJev(probability: number, correct?: boolean) {
  return vi.fn(async () => ({
    correct: correct ?? probability >= JEV_ACCEPT_THRESHOLD,
    probability,
    validationSource: 'jev-semantic' as const,
    latencyMs: 5,
  }));
}

beforeEach(() => {
  clearSemanticCache();
  resetSemanticMetrics();
});

describe('validateAnswer hızlı yolu', () => {
  it('birebir cevapta Jev çağrılmaz (Case A)', async () => {
    const jev = mockJev(0.99);
    const hybrid = await validateAnswer(machen(), 'yapmak', { jevFetch: jev });
    expect(hybrid.correct).toBe(true);
    expect(hybrid.validationSource).toBe('deterministic');
    expect(jev).not.toHaveBeenCalled();
  });

  it('kabul edilen takma ad (alias) Jev çağrılmaz', async () => {
    // Not: vocab sentetik detr/trde yolları envanter cevabını kullanır;
    // alias sözleşmesi genel serbest-metin yolunda test edilir.
    const exercise = ex({
      id: 'cal-alias',
      type: 'free-text',
      instruction: 'Çevir:',
      prompt: 'A: Wie heißt du?\nB: ______',
      answer: 'Ich heiße Mustafa. Freut mich!',
      acceptedAnswers: ['Ich heiße Mustafa.'],
    });
    const jev = mockJev(0.99);
    const hybrid = await validateAnswer(exercise, 'Ich heiße Mustafa.', { jevFetch: jev });
    expect(hybrid.correct).toBe(true);
    expect(hybrid.validationSource).toBe('deterministic');
    expect(jev).not.toHaveBeenCalled();
  });

  it('çoktan seçmeli yanlışta Jev çağrılmaz (Case F)', async () => {
    const mc = ex({ id: 'mc1', type: 'multiple-choice', answer: 'der', instruction: 'Seç:' });
    mc.options = ['der', 'die', 'das'];
    const jev = mockJev(0.99);
    const hybrid = await validateAnswer(mc, 'die', { jevFetch: jev });
    expect(hybrid.correct).toBe(false);
    expect(hybrid.validationSource).toBe('deterministic');
    expect(jev).not.toHaveBeenCalled();
  });

  it('kapalı dilbilgisi değişiminde Jev çağrılmaz (der/den)', async () => {
    const artikel = ex({ id: 'art1', type: 'fill-blank', instruction: 'Artikeli yaz:', answer: 'der', topicId: 'topic.articles' });
    const jev = mockJev(0.99);
    const hybrid = await validateAnswer(artikel, 'den', { jevFetch: jev });
    expect(hybrid.correct).toBe(false);
    expect(jev).not.toHaveBeenCalled();
  });
});

describe('validateAnswer semantik geri dönüşü', () => {
  it('yüksek olasılıklı eşdeğer kabul edilir (Case B)', async () => {
    const jev = mockJev(0.97);
    const hybrid = await validateAnswer(machen(), 'bir şey yapmak', { jevFetch: jev });
    expect(jev).toHaveBeenCalledTimes(1);
    expect(jev).toHaveBeenCalledWith('vocab-v-machen-detr-type', 'bir şey yapmak', expect.anything());
    expect(hybrid.correct).toBe(true);
    expect(hybrid.validationSource).toBe('jev-semantic');
    expect(hybrid.probability).toBe(0.97);
  });

  it('düşük olasılıklı cevap reddedilir (Case C: gitmek)', async () => {
    const jev = mockJev(0.02, false);
    const hybrid = await validateAnswer(machen(), 'gitmek', { jevFetch: jev });
    expect(hybrid.correct).toBe(false);
    expect(hybrid.validationSource).toBe('jev-semantic');
  });

  it('eşik altı "true" muhafazakâr yanlışa düşer', async () => {
    const jev = mockJev(0.6, true);
    const hybrid = await validateAnswer(machen(), 'sınırda ifade', {
      jevFetch: jev,
      acceptThreshold: 0.85,
    });
    expect(hybrid.correct).toBe(false);
  });

  it('zaman aşımında deterministik yanlışa düşer, çökmez (Case H)', async () => {
    const jev = vi.fn(async () => {
      throw new DOMException('aborted', 'AbortError');
    });
    const hybrid = await validateAnswer(machen(), 'bir şey yapmak', { jevFetch: jev });
    expect(hybrid.correct).toBe(false);
    expect(hybrid.validationSource).toBe('deterministic');
    expect(hybrid.uncertain).toBe(true);
  });

  it('500/hatada çalışmaya devam eder', async () => {
    const jev = vi.fn(async () => {
      throw new Error('gateway 502');
    });
    const hybrid = await validateAnswer(machen(), 'bir şey yapmak', { jevFetch: jev });
    expect(hybrid.correct).toBe(false);
    expect(hybrid.validationSource).toBe('deterministic');
  });

  it('bozuk yanıtta yanlışa düşer', async () => {
    const jev = vi.fn(async () => ({ correct: true, probability: Number.NaN, validationSource: 'jev-semantic' as const, latencyMs: 1 }));
    // NaN olasılık: istemci eşiği karşılamaz → yanlış.
    const hybrid = await validateAnswer(machen(), 'bir şey yapmak', { jevFetch: jev });
    expect(hybrid.correct).toBe(false);
  });

  it('aynı cevap ikinci kez önbellekten gelir', async () => {
    const jev = mockJev(0.97);
    const first = await validateAnswer(machen(), 'bir şey yapmak', { jevFetch: jev });
    const second = await validateAnswer(machen(), 'bir şey yapmak', { jevFetch: jev });
    expect(first.correct).toBe(true);
    expect(second.correct).toBe(true);
    expect(jev).toHaveBeenCalledTimes(1);
    expect(semanticMetricsSummary().cacheHits).toBe(1);
  });

  it('geçici hata kalıcı yanlış olarak önbelleğe yazılmaz', async () => {
    const failing = vi.fn(async () => {
      throw new Error('timeout');
    });
    await validateAnswer(machen(), 'bir şey yapmak', { jevFetch: failing });
    const jev = mockJev(0.97);
    const hybrid = await validateAnswer(machen(), 'bir şey yapmak', { jevFetch: jev });
    expect(jev).toHaveBeenCalledTimes(1);
    expect(hybrid.correct).toBe(true);
  });
});

describe('hybridToValidation', () => {
  it('olasılığı öğrenciye sızdırmaz, kanonik düzeltmeyi gösterir', () => {
    const exercise = machen();
    const hybrid: HybridResult = {
      correct: false,
      validationSource: 'jev-semantic',
      canonicalAnswer: 'yapmak',
      deterministicStatus: 'incorrect',
      probability: 0.03,
    };
    const result = hybridToValidation(exercise, 'gitmek', hybrid);
    expect(result.status).toBe('incorrect');
    expect(result.expected).toBe('yapmak');
    expect(JSON.stringify(result)).not.toContain('0.03');
  });

  it('Jev kabulü tam doğruya indirgenir (ustalık için correct)', () => {
    const exercise = machen();
    const hybrid: HybridResult = {
      correct: true,
      validationSource: 'jev-semantic',
      canonicalAnswer: 'yapmak',
      deterministicStatus: 'incorrect',
      probability: 0.97,
    };
    const result = hybridToValidation(exercise, 'bir şey yapmak', hybrid);
    expect(result.status).toBe('correct');
    expect(result.expected).toBe('yapmak');
  });
});

describe('deterministicValidate', () => {
  it('vocab trde yazımında artikel denetimini korur', () => {
    const exercise = ex({
      id: 'vocab-v-schluessel-trde-type',
      type: 'free-text',
      instruction: 'Almancasını ARTİKELİYLE yaz:',
      prompt: 'anahtar',
      answer: 'der Schlüssel',
    });
    // Envanterde v-schluessel mevcut; artikelsiz yazım minor-typo olur.
    expect(deterministicValidate(exercise, 'der Schlüssel').status).toBe('correct');
  });
});

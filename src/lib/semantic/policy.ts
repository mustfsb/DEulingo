/**
 * Semantik geri dönüş (fallback) politikası.
 *
 * İlke: Jev asla ilk doğrulayıcı değildir. Deterministik katman
 * (`lib/validation.ts`) önce çalışır; yalnızca gerçek bir deterministik
 * uyuşmazlıkta ve bu modül "uygun" derse sunucu tarafı Jev çağrılır.
 *
 * Yapısal alıştırmalar (çoktan seçmeli, eşleştirme, kelime bankası,
 * çip sıralama, dinleme-seçimi, dikte, sesli) deterministik kalır.
 */

import type { Exercise } from '../../content/types';

/** Kavramsal doğrulama kipi (dokümantasyon + Jev durumu için). */
export type ValidationMode = 'exact' | 'normalized' | 'semantic' | 'structured';

/** Jev'e gönderilen pedagojik bağlam. */
export interface SemanticPolicy {
  enabled: boolean;
  /** Kavramsal mod (yerel + dokümantasyon için). */
  mode: ValidationMode;
  /** Bu alıştırmada ölçülen kavramlar (kısa etiketler). */
  testedConcepts: string[];
  /** Kabul edilebilir varyasyonlar (Jev durumuna yazılır). */
  allowedVariation: string[];
  /** Asla affedilmeyecek farklar (Jev durumuna yazılır). */
  forbiddenVariation: string[];
  /** Sunucu tarafı maksimum girdi uzunluğu (karakter). */
  maxInputLength: number;
  /** İsim + artikel gerektiren vocab modu mu? */
  requiresArticle: boolean;
}

/** Asla Jev'e gitmeyen alıştırma tipleri (deterministik yapı). */
const NEVER_JEV_TYPES = new Set([
  'multiple-choice',
  'matching',
  'listen-choice',
  'word-bank-translation',
  'sentence-builder',
  'ordering',
  'dictation',
  'spoken',
]);

/** Kapalı dilbilgisi kümeleri: aynı kümede iki farklı biçim asla eşanlamlı değildir. */
const CLOSED_GRAMMAR_SETS: string[][] = [
  ['der', 'die', 'das', 'den', 'dem', 'des'],
  ['ein', 'eine', 'einen', 'einem', 'einer'],
  ['kein', 'keine', 'keinen', 'keinem', 'keiner'],
  ['bin', 'bist', 'ist', 'sind', 'seid', 'sein'],
  ['habe', 'hast', 'hat', 'haben', 'habt'],
  ['ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr'],
  ['kann', 'kannst', 'können', 'könnt'],
  ['muss', 'musst', 'müssen', 'müsst'],
  ['will', 'willst', 'wollen', 'wollt'],
  ['soll', 'sollst', 'sollen', 'sollt'],
  ['darf', 'darfst', 'dürfen', 'dürft'],
  ['mag', 'magst', 'mögen', 'mögt'],
  ['möchte', 'möchtest', 'möchten', 'möchtet'],
];

const CLOSED_INDEX = new Map<string, number>();
CLOSED_GRAMMAR_SETS.forEach((group, index) => {
  for (const form of group) CLOSED_INDEX.set(form.toLocaleLowerCase('de'), index);
});

function closedGrammarSwap(a: string, b: string): boolean {
  const norm = (s: string) =>
    s.normalize('NFC').toLocaleLowerCase('de').replace(/[.!?;:,]+$/g, '').trim();
  const na = norm(a);
  const nb = norm(b);
  // Yalnızca tek sözcüklü kapalı-küme değişimleri (der↔den, bin↔habe değil ama
  // aynı kümedekiler; bin↔habe farklı kümelerde ama yardımcı-fiil değişimidir).
  if (na.includes(' ') || nb.includes(' ')) return false;
  const ia = CLOSED_INDEX.get(na);
  const ib = CLOSED_INDEX.get(nb);
  if (ia !== undefined && ib !== undefined && ia === ib) return true;
  // sein↔haben yardımcı-fiil değişimi kümeler arasıdır ama yine dilbilgisidir.
  const AUX = new Set(['bin', 'bist', 'ist', 'sind', 'seid', 'habe', 'hast', 'hat', 'haben', 'habt']);
  if (AUX.has(na) && AUX.has(nb) && na !== nb) return true;
  return false;
}

function looksNumericExercise(exercise: Exercise): boolean {
  const hay = `${exercise.instruction} ${exercise.prompt ?? ''} ${exercise.topicId}`.toLocaleLowerCase('tr');
  if (!/saat|uhr|zaman|time|rakam|sayı|sayi|number|clock/.test(hay)) return false;
  return true;
}

function answerWordCount(answer: string | undefined): number {
  return (answer ?? '').trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Alıştırma için semantik politikayı türetir. Sunucu bu politikayı
 * istemciden DEĞİL, kanonik alıştırmadan türetir.
 */
export function semanticPolicyFor(exercise: Exercise): SemanticPolicy {
  const type = exercise.type;
  const topicId = exercise.topicId ?? '';
  const instruction = exercise.instruction ?? '';
  const words = answerWordCount(exercise.answer);

  const base: SemanticPolicy = {
    enabled: false,
    mode: 'normalized',
    testedConcepts: [],
    allowedVariation: [],
    forbiddenVariation: [],
    maxInputLength: 500,
    requiresArticle: false,
  };

  if (NEVER_JEV_TYPES.has(type)) {
    base.mode =
      type === 'multiple-choice' || type === 'listen-choice'
        ? 'exact'
        : type === 'matching' || type === 'word-bank-translation' || type === 'sentence-builder' || type === 'ordering'
          ? 'structured'
          : 'normalized';
    return base;
  }

  // Açık uçlu Writing paragrafları: tek boolean ile not verilmez.
  if (exercise.openEnded === true) {
    base.mode = 'normalized';
    base.testedConcepts = ['open_writing'];
    return base;
  }

  // Yaklaşık okunuş: tek doğru yazım yok, kendi ses-eşitlik katmanı var.
  if (exercise.validation?.approximation === true) {
    base.mode = 'normalized';
    base.testedConcepts = ['pronunciation_approximation'];
    return base;
  }

  // Serbest metin ailesi: fill-blank, free-text, error-correction.
  const tested: string[] = [];
  const allowed: string[] = [
    'harmless paraphrase',
    'synonymous translation',
    'semantically redundant wording',
    'equivalent natural phrasing',
  ];
  const forbidden: string[] = [
    'opposite meaning',
    'partially wrong meaning',
    'extra information that changes meaning',
    'missing essential meaning',
  ];

  if (type === 'fill-blank' || type === 'free-text' || type === 'error-correction') {
    base.enabled = true;
    base.maxInputLength = words <= 3 ? 200 : 500;

    if (words <= 2) {
      tested.push('lexical_meaning');
      base.mode = 'semantic';
      // Kısa kelime çevirisinde kelime sırası varyasyonu anlamsızdır.
      forbidden.push('different lexical meaning', 'related but non-equivalent word');
    } else {
      tested.push('sentence_meaning');
      base.mode = 'semantic';
      allowed.push('different but valid word order where grammar allows');
      allowed.push('equivalent digit/word number rendering');
      forbidden.push(
        'wrong tense where the exercise tests tense',
        'wrong auxiliary in Perfekt (haben/sein swap)',
        'wrong modal verb where the modal is tested',
        'wrong grammatical subject where the subject is tested',
        'wrong case/article where case is tested',
        'wrong participle formation',
        'negation change',
      );
    }

    // Konu bazlı sıkılaştırma.
    if (topicId.includes('article') || /artikel/i.test(instruction)) {
      tested.push('article_case_form');
      forbidden.push('article/case form difference (der/den/dem/des, ein/einen)');
    }
    if (topicId.includes('perfekt') || /perfekt|partizip/i.test(instruction)) {
      tested.push('perfekt_auxiliary', 'participle_formation');
      forbidden.push('haben/sein auxiliary swap', 'incorrect participle (studiert/gestudiert)');
    }
    if (topicId.includes('modal') || /modal/i.test(instruction)) {
      tested.push('modal_meaning', 'modal_conjugation');
      forbidden.push('modal substitution (kann vs konnte/muss)', 'modal person-ending change');
    }
    if (topicId.includes('akkusativ') || /akkusativ/i.test(instruction)) {
      tested.push('accusative_case');
      forbidden.push('nominative/accusative swap (ein/einen, mein/meinen)');
    }
    if (looksNumericExercise(exercise)) {
      tested.push('clock_number_value');
    }

    // Vocab sentetik trde-type: isimlerde artikel zorunluluğu pedagojik politikadır.
    if (exercise.id.startsWith('vocab-') && exercise.id.endsWith('-trde-type')) {
      base.requiresArticle = /ARTİKEL/i.test(instruction);
      if (base.requiresArticle) {
        tested.push('noun_article_memorization');
        forbidden.push('missing article when the mode requires it', 'wrong article');
      }
    }
    if (exercise.id.startsWith('vocab-') && exercise.id.endsWith('-detr-type')) {
      tested.push('lexical_meaning');
    }

    base.testedConcepts = [...new Set(tested)];
    base.allowedVariation = allowed;
    base.forbiddenVariation = forbidden;
    return base;
  }

  return base;
}

/**
 * Deterministik uyuşmazlıktan sonra Jev'e gidilebilir mi?
 * Sözleşme: yalnızca serbest-metin ailesi + politika enabled + kapalı
 * dilbilgisi/sayı değişimleri hariç.
 */
export function isSemanticFallbackEligible(exercise: Exercise, userAnswer: string): boolean {
  const policy = semanticPolicyFor(exercise);
  if (!policy.enabled) return false;
  const raw = userAnswer ?? '';
  if (!raw.trim()) return false;
  if (raw.length > policy.maxInputLength) return false;

  // Kapalı dilbilgisi değişimi deterministik olarak yanlıştır; Jev'e sorma.
  const expectedList = [exercise.answer ?? '', ...(exercise.acceptedAnswers ?? [])];
  for (const expected of expectedList) {
    if (expected && closedGrammarSwap(raw, expected)) return false;
  }

  // Saat/sayı alıştırmasında sayısal görünüm deterministik解析'e aittir:
  // her iki taraf da büyük ölçüde sayısal ise Jev'e gitme.
  if (looksNumericExercise(exercise)) {
    const numericLike = (s: string) => {
      const t = s.trim().toLocaleLowerCase('de');
      if (!t) return false;
      const stripped = t.replace(/[\d\s:.\-uhr saatçeyrekbuçukviertelhalb]+/gi, '').replace(/[^\p{L}]/gu, '');
      return stripped.length <= 2;
    };
    if (expectedList.some((e) => e && numericLike(raw) && numericLike(e))) return false;
  }

  return true;
}

/** Dokümantasyon/test için doğrulama matrisi. */
export function validationMatrix(): Array<{ exercise: string; local: string; jevFallback: string }> {
  return [
    { exercise: 'multiple-choice', local: 'evet (tam eşleşme)', jevFallback: 'asla' },
    { exercise: 'matching', local: 'evet (çift eşleşme)', jevFallback: 'asla' },
    { exercise: 'listen-choice', local: 'evet (tam eşleşme)', jevFallback: 'asla' },
    { exercise: 'word-bank-translation', local: 'evet (sıra eşleşme)', jevFallback: 'asla' },
    { exercise: 'sentence-builder / ordering', local: 'evet (çip sırası)', jevFallback: 'asla' },
    { exercise: 'dictation', local: 'evet (yazım toleranslı)', jevFallback: 'asla (yazım deterministik)' },
    { exercise: 'spoken', local: 'öz-değerlendirme', jevFallback: 'asla' },
    { exercise: 'fill-blank (serbest)', local: 'evet', jevFallback: 'koşullu (kapalı dilbilgisi hariç)' },
    { exercise: 'free-text (kelime/cümle çevirisi)', local: 'evet', jevFallback: 'evet' },
    { exercise: 'error-correction', local: 'evet', jevFallback: 'evet' },
    { exercise: 'free-text openEnded (Writing)', local: 'mevcut politika', jevFallback: 'sınırlı (tek boolean yok)' },
    { exercise: 'approximation (yaklaşık okunuş)', local: 'evet (ses eşitliği)', jevFallback: 'asla' },
    { exercise: 'vocab detr-type (de→tr yazma)', local: 'evet', jevFallback: 'evet' },
    { exercise: 'vocab trde-type (tr→de yazma)', local: 'evet (artikel politikası)', jevFallback: 'evet (artikel politikasıyla)' },
    { exercise: 'clock/number parsing', local: 'evet (deterministik)', jevFallback: 'nadiren/asla' },
  ];
}

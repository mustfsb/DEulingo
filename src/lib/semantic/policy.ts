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
  // İyelik (hâl + cinsiyet eki): meinem ↔ meinen ↔ meiner …
  ['mein', 'meine', 'meinen', 'meinem', 'meiner'],
  ['dein', 'deine', 'deinen', 'deinem', 'deiner'],
  ['sein', 'seine', 'seinen', 'seinem', 'seiner'],
  ['ihr', 'ihre', 'ihren', 'ihrem', 'ihrer'],
  ['unser', 'unsere', 'unseren', 'unserem', 'unserer'],
  // Zamirlerin hâl biçimleri: mir ↔ mich ↔ ich …
  ['ich', 'mir', 'mich'],
  ['du', 'dir', 'dich'],
  ['er', 'ihm', 'ihn'],
  ['sie', 'ihr', 'ihnen'],
  ['wir', 'uns'],
  // Dativ edatları ve kısaltmaları: zum ↔ zur, bei ↔ beim …
  ['mit', 'zu', 'bei', 'von', 'aus', 'nach', 'seit', 'zum', 'zur', 'beim', 'vom'],
];

/** Bir biçim birden çok kümede olabilir (`ihr` hem zamir hem iyelik, `sein` hem fiil hem iyelik). */
const CLOSED_INDEX = new Map<string, Set<number>>();
CLOSED_GRAMMAR_SETS.forEach((group, index) => {
  for (const form of group) {
    const key = form.toLocaleLowerCase('de');
    CLOSED_INDEX.set(key, new Set([...(CLOSED_INDEX.get(key) ?? []), index]));
  }
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
  if (ia && ib && na !== nb && [...ia].some((group) => ib.has(group))) return true;
  // sein↔haben yardımcı-fiil değişimi kümeler arasıdır ama yine dilbilgisidir.
  const AUX = new Set(['bin', 'bist', 'ist', 'sind', 'seid', 'habe', 'hast', 'hat', 'haben', 'habt']);
  if (AUX.has(na) && AUX.has(nb) && na !== nb) return true;
  return false;
}

/* ------------------------------------------------------------------ */
/* İngilizce Present Perfect: dilbilgisi hedefi deterministik korunur    */
/* ------------------------------------------------------------------ */

import { EN_CLOSED_SETS, expandEnglishContractions } from '../validation';

/** Bu alıştırma İngilizce Present Perfect ölçüyor mu? */
export function isPresentPerfectTested(exercise: Exercise): boolean {
  return (
    exercise.topicId === 'en.present-perfect' ||
    exercise.topicId.startsWith('en.') ||
    exercise.id.startsWith('en-') ||
    exercise.conceptIds.some((id) => id.startsWith('pp.'))
  );
}

const EN_CLOSED_INDEX = new Map<string, Set<number>>();
EN_CLOSED_SETS.forEach((group, index) => {
  for (const form of group) {
    const key = form.toLowerCase();
    EN_CLOSED_INDEX.set(key, new Set([...(EN_CLOSED_INDEX.get(key) ?? []), index]));
  }
});

function enTokens(value: string): string[] {
  return expandEnglishContractions(value)
    .toLowerCase()
    .replace(/[.!?,;:"„“”'’()]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

/** Kapalı küme üyeleri + işaret kelimeleri: cümlenin dilbilgisi imzası. */
const EN_MARKERS = new Set([
  'have', 'has', 'had', 'not', 'for', 'since', 'ever', 'never', 'already', 'yet', 'just',
  ...EN_CLOSED_SETS.flat(),
]);

function enGrammarSignature(value: string): string {
  return enTokens(value)
    .filter((token) => EN_MARKERS.has(token))
    .sort()
    .join(' ');
}

/**
 * Present Perfect korumalı alıştırmada kullanıcı cevabı her beklenen cevapla
 * dilbilgisi imzasında ayrılıyorsa (yanlış yardımcı, yanlış V3, yanlış
 * for/since, eksik have/has, Simple Past kullanımı) Jev'e sorulmaz —
 * deterministik yanlıştır. Anlamca anlaşılır olması hedefi değiştirmez.
 * Kelime sırası ve eşanlamlı içerik kelimesi farkları korumadan geçer.
 */
export function presentPerfectFormMismatch(exercise: Exercise, userAnswer: string): boolean {
  const expected = [exercise.answer ?? '', ...(exercise.acceptedAnswers ?? [])].filter(Boolean);
  if (!expected.length) return false;
  const userSignature = enGrammarSignature(userAnswer);
  const userTokens = enTokens(userAnswer);
  return expected.every((candidate) => {
    if (enGrammarSignature(candidate) !== userSignature) return true;
    const candidateTokens = enTokens(candidate);
    const known = new Set(candidateTokens);
    // Aynı fiil ailesinin farklı üyesi (see↔seen, have↔has, go↔gone…).
    return userTokens.some((token) => {
      if (known.has(token)) return false;
      const groups = EN_CLOSED_INDEX.get(token);
      if (!groups) return false;
      return candidateTokens.some((want) => {
        const wantGroups = EN_CLOSED_INDEX.get(want);
        return Boolean(wantGroups && [...groups].some((group) => wantGroups.has(group)));
      });
    });
  });
}

/**
 * Tek sözcüklü kapalı-küme değişimi (have↔has, for↔since, see↔seen):
 * Jev'e sorulmadan deterministik yanlıştır.
 */
function englishClosedGrammarSwap(a: string, b: string): boolean {
  const norm = (s: string) => expandEnglishContractions(s).toLowerCase().replace(/[.!?;:,]+$/g, '').trim();
  const na = norm(a);
  const nb = norm(b);
  if (na.includes(' ') || nb.includes(' ')) return false;
  const ia = EN_CLOSED_INDEX.get(na);
  const ib = EN_CLOSED_INDEX.get(nb);
  return Boolean(ia && ib && na !== nb && [...ia].some((group) => ib.has(group)));
}

/* ------------------------------------------------------------------ */
/* Dativ: hâl biçimi deterministik korunur                              */
/* ------------------------------------------------------------------ */

/**
 * Alıştırma Dativ biçimini ölçüyor mu? (Dativ konusu, `dativ.*` kavramı ya da
 * yönergede açıkça "Dativ".) Akkusativ ↔ Dativ karşıtlık soruları da Dativ
 * konusunda yaşadığı için aynı korumayı alır.
 */
export function isDativeTested(exercise: Exercise): boolean {
  return (
    exercise.topicId === 'topic.dativ' ||
    exercise.conceptIds.some((id) => id.startsWith('dativ.')) ||
    /dativ/i.test(exercise.instruction ?? '')
  );
}

const POSSESSIVE_STEMS = ['mein', 'dein', 'sein', 'ihr', 'unser', 'euer', 'eur'];
const POSSESSIVE_ENDINGS = ['', 'e', 'en', 'em', 'er', 'es'];

/** Hâl taşıyan kapalı-sınıf biçimler: artikel, iyelik, zamir, edat. */
const CASE_FORMS = new Set<string>([
  'der', 'die', 'das', 'den', 'dem', 'des',
  'ein', 'eine', 'einen', 'einem', 'einer', 'eines',
  'kein', 'keine', 'keinen', 'keinem', 'keiner', 'keines',
  ...POSSESSIVE_STEMS.flatMap((stem) => POSSESSIVE_ENDINGS.map((ending) => `${stem}${ending}`)),
  'ich', 'mir', 'mich', 'du', 'dir', 'dich', 'er', 'ihm', 'ihn', 'sie', 'ihnen', 'es', 'wir', 'uns', 'euch',
  'mit', 'zu', 'bei', 'von', 'aus', 'nach', 'seit', 'in', 'an', 'auf', 'für', 'ohne',
]);

/** Kısaltmalar açılır: `zum Arzt` ile `zu dem Arzt` aynı hâl imzasını taşır. */
const CONTRACTION_EXPANSIONS: Record<string, string[]> = {
  zum: ['zu', 'dem'],
  zur: ['zu', 'der'],
  beim: ['bei', 'dem'],
  vom: ['von', 'dem'],
  im: ['in', 'dem'],
  ins: ['in', 'das'],
  am: ['an', 'dem'],
};

function caseTokens(value: string): string[] {
  return value
    .normalize('NFC')
    .toLocaleLowerCase('de')
    .replace(/[.!?,;:"„“”'’()]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .flatMap((token) => CONTRACTION_EXPANSIONS[token] ?? [token]);
}

/** Cümlenin hâl imzası: hâl taşıyan biçimlerin sıralı çoklu kümesi (kelime sırası önemsiz). */
export function caseSignature(value: string): string {
  return caseTokens(value)
    .filter((token) => CASE_FORMS.has(token))
    .sort()
    .join(' ');
}

/** `Freund` ↔ `Freunden`, `Kinder` ↔ `Kindern`, `Monate` ↔ `Monaten`: yalnızca ek farkı. */
function endingOnlyDifference(a: string, b: string): boolean {
  if (a === b) return false;
  const [short, long] = a.length < b.length ? [a, b] : [b, a];
  if (short.length < 3 || !long.startsWith(short)) return false;
  return ['n', 'en', 'e'].includes(long.slice(short.length));
}

/**
 * Dativ korumalı alıştırmada kullanıcı cevabı her beklenen cevaptan hâl
 * biçimiyle ayrılıyorsa (yanlış artikel/iyelik/zamir/edat ya da isim eki),
 * cevap anlamca anlaşılır olsa bile Jev'e sorulmaz — deterministik yanlıştır.
 * Kelime sırası ve eşanlamlı içerik kelimesi farkları korumadan geçer.
 */
export function dativeFormMismatch(exercise: Exercise, userAnswer: string): boolean {
  const expected = [exercise.answer ?? '', ...(exercise.acceptedAnswers ?? [])].filter(Boolean);
  if (!expected.length) return false;
  const userSignature = caseSignature(userAnswer);
  const userTokens = caseTokens(userAnswer);
  return expected.every((candidate) => {
    if (caseSignature(candidate) !== userSignature) return true;
    const candidateTokens = caseTokens(candidate);
    const known = new Set(candidateTokens);
    return userTokens.some(
      (token) => !known.has(token) && candidateTokens.some((want) => endingOnlyDifference(token, want)),
    );
  });
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
    if (isPresentPerfectTested(exercise)) {
      tested.push('present_perfect_auxiliary', 'past_participle_v3', 'for_since_selection');
      allowed.push(
        'different but valid word order where grammar allows (For three years, I have lived here.)',
        'contracted or uncontracted auxiliaries with the same grammar (I\'ve = I have, haven\'t = have not)',
      );
      forbidden.unshift(
        'have/has auxiliary swap or missing auxiliary (She have finished, I seen it)',
        'wrong past participle (see/saw/seen, go/went/gone, write/wrote/written)',
        'for/since swap (since three years, for 2024)',
        'Simple Past where Present Perfect is tested and vice versa (I saw him yesterday vs I have seen him yesterday)',
        'negation change',
      );
    }
    if (isDativeTested(exercise)) {
      // Tek/iki sözcüklü Dativ biçim soruları (`mit ___ Freund` → `dem`) tamamen
      // deterministiktir: biçimin kendisi ölçülür, anlam değil.
      if (words <= 2) {
        base.enabled = false;
        base.mode = 'exact';
        base.testedConcepts = ['dative_case', 'article_form'];
        return base;
      }
      tested.push('dative_case', 'article_form', 'possessive_form', 'dative_preposition');
      allowed.unshift(
        'valid alternative word order with the same Dativ forms (Mit meinem Freund gehe ich.)',
        'uncontracted preposition + article when the contraction itself is not tested (zu dem Arzt = zum Arzt)',
        'synonymous content word that keeps the tested Dativ group intact',
      );
      forbidden.unshift(
        'any wrong Dativ article or ending (dem/den/der, einem/einen, meinem/meinen/meine/meiner)',
        'Akkusativ form where Dativ is required, or Dativ where Akkusativ is required',
        'wrong Dativ pronoun (mir/mich, dir/dich, ihm/ihn)',
        'missing Dativ plural -n (Freunden, Kindern, Monaten)',
        'wrong or missing preposition (mit/zu/bei/von/aus/nach/seit)',
      );
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

  // Dativ: yanlış hâl biçimi (anlam anlaşılsa bile) deterministik olarak yanlıştır.
  if (isDativeTested(exercise) && dativeFormMismatch(exercise, raw)) return false;

  // Present Perfect: yanlış yardımcı/V3/for-since/zaman (anlam anlaşılsa
  // bile) deterministik olarak yanlıştır; Jev'e sorulmaz.
  if (isPresentPerfectTested(exercise)) {
    for (const expected of expectedList) {
      if (expected && englishClosedGrammarSwap(raw, expected)) return false;
    }
    if (presentPerfectFormMismatch(exercise, raw)) return false;
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
    { exercise: 'en present-perfect (have/has/V3/for-since)', local: 'evet (kısaltma normalizasyonu + kapalı küme)', jevFallback: 'koşullu (yardımcı/V3/for-since/zaman hariç)' },
    { exercise: 'clock/number parsing', local: 'evet (deterministik)', jevFallback: 'nadiren/asla' },
  ];
}

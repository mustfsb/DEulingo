/**
 * Dativ — konu alıştırma bankası.
 *
 * A1 hedefi: "Basit günlük cümlelerde Dativ'i doğru kullanabiliyorum."
 * Yeni gün açılmaz; bu konu `topic.dativ` kimliğinde yaşar.
 *
 * İlerleme her ailede aynı merdiveni izler:
 *   der Freund → dem Freund → mein Freund → meinem Freund
 *   → mit meinem Freund → Ich gehe mit meinem Freund.
 *
 * Kapsam: dem/der/dem/den, einem/einer, keinem/keiner, meinem/meiner/meinen
 * (+ dein/sein/ihr/unser), çoğul -n, mir/dir/ihm/ihr/uns, mit/zu/bei/von/
 * aus/nach/seit, zum/zur/beim/vom, Akkusativ ↔ Dativ karşıtlığı ve
 * helfen/danken/gefallen.
 *
 * A1 SINIRI: sıfat çekimi, Genitiv, Wechselpräposition teorisi, ilgi
 * cümlesi, pasif, yan cümle ve iki nesneli fiiller YOKTUR.
 *
 * Doğrulama: tek sözcüklü biçim soruları deterministiktir (Jev yok).
 * Cümle düzeyindeki serbest üretimlerde `zum/zur/beim/vom` kısaltması
 * test edilmiyorsa açık biçim (`zu dem Arzt`) de kabul edilir
 * (`withUncontractedVariants`); kelime sırası varyasyonları Jev'e bırakılır.
 */

import type { AuthoredExercise } from '../types.ts';
import { T } from '../../curriculum/topics.ts';

type Rest = Partial<AuthoredExercise> & { instruction: string };

function dx(
  id: string,
  type: AuthoredExercise['type'],
  difficulty: AuthoredExercise['difficulty'],
  skill: AuthoredExercise['skill'],
  conceptIds: string[],
  rest: Rest,
): AuthoredExercise {
  return { id, topicId: T.dativ, type, difficulty, skill, conceptIds, ...rest };
}

const tok = (...texts: string[]) => texts.map((text, index) => ({ id: `t${index + 1}`, text }));
const listen = (text: string) => ({ prompt: { text, language: 'de-DE' as const, role: 'prompt' as const } });

/** Almanca üretimde klavye toleransı (ä/ö/ü/ß için ASCII yazım kabulü). */
const DE = { keyboardTolerance: true } as const;
/** Tek sözcüklü biçim sorularında yazım hatası da hata sayılır. */
const EXACT = { noTypoTolerance: true } as const;
/** Büyük harfli tek sözcük (isim) — harf büyüklüğü test edilmez, biçim edilir. */
const EXACT_NOUN = { noTypoTolerance: true, caseSensitive: false } as const;

/* Kavramlar */
const HEDEF = 'dativ.hedef';
const W_YER = 'dativ.kelime.yerler';
const W_ULA = 'dativ.kelime.ulasim';
const W_INS = 'dativ.kelime.insanlar';
const W_GES = 'dativ.kelime.geschenk';
const W_MON = 'dativ.kelime.monat';
const W_FS = 'dativ.kelime.fahren-sehen';
const W_HD = 'dativ.kelime.helfen-danken';
const NEDIR = 'dativ.nedir.kural';
const HIS = 'dativ.nedir.his';
const TAB = 'dativ.belirli.tablo';
const DER = 'dativ.belirli.der-dem';
const DIE = 'dativ.belirli.die-der';
const DAS = 'dativ.belirli.das-dem';
const EIN = 'dativ.belirsiz.einem-einer';
const KEIN = 'dativ.belirsiz.kein';
const MEINEM = 'dativ.iyelik.meinem';
const MEINER = 'dativ.iyelik.meiner';
const MEINEN = 'dativ.iyelik.meinen';
const POSS_X = 'dativ.iyelik.diger';
const FIVE = 'dativ.iyelik.bes-kalip';
const PL = 'dativ.cogul.kural';
const PL_X = 'dativ.cogul.istisna';
const PR = 'dativ.zamir.cekirdek';
const PR_T = 'dativ.zamir.tablo';
const PR_K = 'dativ.zamir.bilinen';
const MIT = 'dativ.mit.kural';
const MIT_P = 'dativ.mit.kisi';
const MIT_V = 'dativ.mit.arac';
const ZU = 'dativ.zu.kural';
const ZUM = 'dativ.zu.zum';
const ZUR = 'dativ.zu.zur';
const ZU_P = 'dativ.zu.kisi';
const BEI = 'dativ.bei.kural';
const BEIM = 'dativ.bei.beim';
const ZU_BEI = 'dativ.bei.zu-bei';
const VON = 'dativ.von.kural';
const VOM = 'dativ.von.vom';
const AUS = 'dativ.aus.kural';
const AUS_T = 'dativ.aus.tuerkei';
const AUS_0 = 'dativ.aus.artikelsiz';
const NACH = 'dativ.nach.sehir';
const HAUSE = 'dativ.nach.hause';
const SEIT = 'dativ.seit.kural';
const SEIT_M = 'dativ.seit.monaten';
const AD = 'dativ.akk-dat.kural';
const AD_T = 'dativ.akk-dat.tablo';
const AD_M = 'dativ.akk-dat.meinen-meinem';
const HELFEN = 'dativ.fiil.helfen';
const DANKEN = 'dativ.fiil.danken';
const GEF = 'dativ.fiil.gefallen';
const LADDER = 'dativ.cumle.merdiven';
const ORDER = 'dativ.cumle.sira';
const CTX = 'dativ.cumle.baglam';
const ERR = 'dativ.hatalar.kutu';
const CHUNK = 'dativ.kaliplar';
const CHEAT = 'dativ.kopya';

const TR = 'Türkçeden Almancaya çevir:';

const CONTRACTIONS: Array<[RegExp, string]> = [
  [/\bzum\b/, 'zu dem'],
  [/\bzur\b/, 'zu der'],
  [/\bbeim\b/, 'bei dem'],
  [/\bvom\b/, 'von dem'],
];

/**
 * Cümle düzeyinde serbest üretimde kısaltma test edilmiyorsa (`kısaltma`
 * yönergede geçmiyorsa) açık biçim de kabul edilir: `Ich gehe zu dem Arzt.`
 * Tek sözcüklü biçim soruları (`___ Arzt` → `zum`) bu kuraldan etkilenmez.
 */
export function withUncontractedVariants(exercise: AuthoredExercise): AuthoredExercise {
  if (!['free-text', 'error-correction'].includes(exercise.type)) return exercise;
  if (exercise.openEnded || !exercise.answer) return exercise;
  if (exercise.answer.trim().split(/\s+/).length < 3) return exercise;
  if (/kısaltma/i.test(`${exercise.instruction} ${exercise.prompt ?? ''}`)) return exercise;
  const variants = new Set<string>();
  for (const base of [exercise.answer, ...(exercise.acceptedAnswers ?? [])]) {
    let expanded = base;
    for (const [pattern, replacement] of CONTRACTIONS) expanded = expanded.replace(pattern, replacement);
    if (expanded !== base) variants.add(expanded);
  }
  if (!variants.size) return exercise;
  const accepted = [...(exercise.acceptedAnswers ?? []), ...[...variants].filter((v) => v !== exercise.answer)];
  return { ...exercise, acceptedAnswers: [...new Set(accepted)] };
}

const BANK: AuthoredExercise[] = [
  /* ================================================================
   * A. Dativ ne işe yarar? — pratik sezgi (5)
   * ================================================================ */
  dx('dat-what-mit-mc', 'multiple-choice', 'easy', 'recognition', [NEDIR], {
    familyId: 'dat-what-kelime',
    instruction: 'Bu kelimelerden hangisinden sonra isim Dativ olur?',
    prompt: 'Dativ kelimesi hangisi?',
    answer: 'mit',
    options: ['mit', 'und', 'aber', 'oder'],
    pronounce: ['mit meinem Freund'],
  }),
  dx('dat-what-his-match', 'matching', 'easy', 'recognition', [HIS, NEDIR], {
    familyId: 'dat-what-his',
    instruction: 'Dativ kelimesini Türkçedeki karşılığıyla eşleştir.',
    pairs: [
      { left: 'mit', right: '-le / ile' },
      { left: 'zu', right: '-e (birine / bir yere)' },
      { left: 'bei', right: '-in yanında' },
      { left: 'von', right: 'kimden (-den)' },
      { left: 'aus', right: 'nereli / içinden (-den)' },
      { left: 'seit', right: '-den beri' },
    ],
    pronounce: ['mit', 'zu', 'bei', 'von', 'aus', 'seit'],
  }),
  dx('dat-what-his-fill', 'fill-blank', 'medium', 'recall', [HIS], {
    familyId: 'dat-what-his-fill',
    instruction: 'Türkçedeki "-le / ile" hangi Almanca kelimeyle kurulur?',
    prompt: 'Arkadaş-ım-la → ___ meinem Freund',
    answer: 'mit',
    validation: EXACT,
    pronounce: ['mit meinem Freund'],
  }),
  dx('dat-goal-listen-freund', 'listen-choice', 'easy', 'recognition', [HEDEF, MEINEM], {
    familyId: 'dat-goal-listen',
    instruction: 'Duyduğun cümleyi seç:',
    prompt: 'Ich gehe mit meinem Freund.',
    audioText: 'Ich gehe mit meinem Freund.',
    answer: 'Ich gehe mit meinem Freund.',
    options: ['Ich gehe mit meinem Freund.', 'Ich gehe mit meinen Freunden.', 'Ich gehe mit mein Freund.', 'Ich sehe meinen Freund.'],
    audio: listen('Ich gehe mit meinem Freund.'),
  }),
  dx('dat-goal-dictation-mutter', 'dictation', 'medium', 'production', [HEDEF, MIT_P], {
    familyId: 'dat-goal-dictation',
    instruction: 'Annenle ilgili cümleyi duydun — aynen yaz:',
    audioText: 'Ich spreche mit meiner Mutter.',
    answer: 'Ich spreche mit meiner Mutter.',
    audio: listen('Ich spreche mit meiner Mutter.'),
    pronounce: ['Ich spreche mit meiner Mutter.'],
  }),

  /* ================================================================
   * B. Bu konunun yeni kelimeleri (8)
   * ================================================================ */
  dx('dat-words-match', 'matching', 'easy', 'recognition', [W_YER, W_ULA, W_INS, W_GES], {
    familyId: 'dat-words-match',
    instruction: 'Yeni kelimeyi Türkçesiyle eşleştir.',
    pairs: [
      { left: 'der Arzt', right: 'doktor' },
      { left: 'der Bus', right: 'otobüs' },
      { left: 'der Zug', right: 'tren' },
      { left: 'der Supermarkt', right: 'süpermarket' },
      { left: 'das Geschenk', right: 'hediye' },
      { left: 'der Bruder', right: 'erkek kardeş' },
    ],
    pronounce: ['der Arzt', 'der Bus', 'der Zug', 'der Supermarkt', 'das Geschenk', 'der Bruder'],
  }),
  dx('dat-words-arzt-mc', 'multiple-choice', 'easy', 'recognition', [W_YER], {
    familyId: 'dat-words-arzt',
    instruction: '"doktor" kelimesini artikeliyle seç:',
    prompt: 'doktor',
    answer: 'der Arzt',
    options: ['der Arzt', 'die Arzt', 'das Arzt', 'der Bus'],
    pronounce: ['der Arzt'],
  }),
  dx('dat-words-geschenk-fill', 'fill-blank', 'easy', 'recall', [W_GES], {
    familyId: 'dat-words-geschenk',
    instruction: 'Artikeli yaz — hediye:',
    prompt: '___ Geschenk',
    answer: 'das',
    validation: EXACT,
    pronounce: ['das Geschenk'],
  }),
  dx('dat-words-freundin-fill', 'fill-blank', 'easy', 'recall', [W_INS], {
    familyId: 'dat-words-freundin',
    instruction: 'Artikeli yaz — kız arkadaş:',
    prompt: '___ Freundin',
    answer: 'die',
    validation: EXACT,
    pronounce: ['die Freundin'],
  }),
  dx('dat-words-fahren-mc', 'multiple-choice', 'easy', 'recognition', [W_FS, MIT_V], {
    familyId: 'dat-words-fahren',
    instruction: 'Otobüsle gidiyorum — araçla gitmek hangi fiildir?',
    prompt: 'Ich ___ mit dem Bus.',
    answer: 'fahre',
    options: ['fahre', 'sehe', 'helfe', 'danke'],
    pronounce: ['Ich fahre mit dem Bus.'],
  }),
  dx('dat-words-sehen-fill', 'fill-blank', 'medium', 'recall', [W_FS], {
    familyId: 'dat-words-sehen',
    instruction: '`sehen` fiilini çek (du) — Erkek kardeşimi görüyor musun?',
    prompt: '___ du meinen Bruder? (sehen)',
    answer: 'Siehst',
    acceptedAnswers: ['siehst'],
    validation: EXACT,
    pronounce: ['Siehst du meinen Bruder?'],
  }),
  dx('dat-words-monat-mc', 'multiple-choice', 'medium', 'recognition', [W_MON], {
    familyId: 'dat-words-monat',
    instruction: '`der Monat` (ay) kelimesinin çoğulunu seç:',
    prompt: 'der Monat → ?',
    answer: 'die Monate',
    options: ['die Monate', 'die Monat', 'die Monats', 'die Monaten'],
    pronounce: ['die Monate'],
  }),
  dx('dat-words-verbs-match', 'matching', 'easy', 'recognition', [W_HD, W_FS], {
    familyId: 'dat-words-verbs',
    instruction: 'Yeni fiili Türkçesiyle eşleştir.',
    pairs: [
      { left: 'helfen', right: 'yardım etmek' },
      { left: 'danken', right: 'teşekkür etmek' },
      { left: 'fahren', right: '(araçla) gitmek' },
      { left: 'sehen', right: 'görmek' },
    ],
    pronounce: ['helfen', 'danken', 'fahren', 'sehen'],
  }),

  /* ================================================================
   * C. der / die / das → dem / der / dem / den (16)
   * ================================================================ */
  dx('dat-def-table-match', 'matching', 'easy', 'recognition', [TAB, DER, DIE, DAS, PL], {
    familyId: 'dat-def-table',
    instruction: 'Nominativ grubunu Dativ biçimiyle eşleştir.',
    pairs: [
      { left: 'der Freund', right: 'mit dem Freund' },
      { left: 'die Mutter', right: 'mit der Mutter' },
      { left: 'das Kind', right: 'mit dem Kind' },
      { left: 'die Freunde', right: 'mit den Freunden' },
    ],
    secondaryTopicIds: [T.articles],
    pronounce: ['mit dem Freund', 'mit der Mutter', 'mit dem Kind', 'mit den Freunden'],
  }),
  dx('dat-def-freund-fill', 'fill-blank', 'easy', 'recall', [DER], {
    familyId: 'dat-def-freund',
    instruction: 'Dativ artikelini yaz — der Freund:',
    prompt: 'mit ___ Freund',
    answer: 'dem',
    validation: EXACT,
    pronounce: ['mit dem Freund'],
  }),
  dx('dat-def-mutter-fill', 'fill-blank', 'easy', 'recall', [DIE], {
    familyId: 'dat-def-mutter',
    instruction: 'Dativ artikelini yaz — die Mutter:',
    prompt: 'mit ___ Mutter',
    answer: 'der',
    validation: EXACT,
    pronounce: ['mit der Mutter'],
  }),
  dx('dat-def-kind-fill', 'fill-blank', 'easy', 'recall', [DAS], {
    familyId: 'dat-def-kind',
    instruction: 'Dativ artikelini yaz — das Kind:',
    prompt: 'mit ___ Kind',
    answer: 'dem',
    validation: EXACT,
    pronounce: ['mit dem Kind'],
  }),
  dx('dat-def-freunde-fill', 'fill-blank', 'easy', 'recall', [PL, TAB], {
    familyId: 'dat-def-freunde',
    instruction: 'Dativ artikelini yaz — die Freunde (çoğul):',
    prompt: 'mit ___ Freunden',
    answer: 'den',
    validation: EXACT,
    pronounce: ['mit den Freunden'],
  }),
  dx('dat-def-lehrer-mc', 'multiple-choice', 'easy', 'recognition', [DER], {
    familyId: 'dat-def-lehrer',
    instruction: 'Doğru artikeli seç (der Lehrer):',
    prompt: 'Ich spreche mit ___ Lehrer.',
    answer: 'dem',
    options: ['dem', 'den', 'der', 'das'],
    pronounce: ['Ich spreche mit dem Lehrer.'],
  }),
  dx('dat-def-lehrerin-mc', 'multiple-choice', 'easy', 'recognition', [DIE], {
    familyId: 'dat-def-lehrerin',
    instruction: 'Doğru artikeli seç (die Lehrerin):',
    prompt: 'Ich spreche mit ___ Lehrerin.',
    answer: 'der',
    options: ['der', 'die', 'dem', 'den'],
    pronounce: ['Ich spreche mit der Lehrerin.'],
  }),
  dx('dat-def-auto-fill', 'fill-blank', 'medium', 'recall', [DAS, MIT_V], {
    familyId: 'dat-def-auto',
    instruction: 'Dativ artikelini yaz (das Auto) — Babam arabayla gidiyor.',
    prompt: 'Mein Vater fährt mit ___ Auto.',
    answer: 'dem',
    validation: EXACT,
    pronounce: ['Mein Vater fährt mit dem Auto.'],
  }),
  dx('dat-def-schule-fill', 'fill-blank', 'medium', 'recall', [DIE, VON], {
    familyId: 'dat-def-schule',
    instruction: 'Dativ artikelini yaz (die Schule) — Okuldan geliyorum.',
    prompt: 'Ich komme von ___ Schule.',
    answer: 'der',
    validation: EXACT,
    pronounce: ['Ich komme von der Schule.'],
  }),
  dx('dat-def-flasche-fill', 'fill-blank', 'medium', 'recall', [DIE, AUS], {
    familyId: 'dat-def-flasche',
    instruction: 'Dativ artikelini yaz (die Flasche) — Şişeden su içiyorum.',
    prompt: 'Ich trinke Wasser aus ___ Flasche.',
    answer: 'der',
    validation: EXACT,
    pronounce: ['Ich trinke Wasser aus der Flasche.'],
  }),
  dx('dat-def-bus-fill', 'fill-blank', 'medium', 'recall', [DER, MIT_V], {
    familyId: 'dat-def-bus',
    instruction: 'Dativ artikelini yaz (der Bus) — Otobüsle gidiyorum.',
    prompt: 'Ich fahre mit ___ Bus.',
    answer: 'dem',
    validation: EXACT,
    pronounce: ['Ich fahre mit dem Bus.'],
  }),
  dx('dat-def-kinder-fill', 'fill-blank', 'medium', 'recall', [PL, TAB], {
    familyId: 'dat-def-kinder',
    instruction: 'Dativ artikelini yaz (die Kinder) — Çocuklarla konuşuyorum.',
    prompt: 'Ich spreche mit ___ Kindern.',
    answer: 'den',
    validation: EXACT,
    pronounce: ['Ich spreche mit den Kindern.'],
  }),
  dx('dat-def-sequence-mc', 'multiple-choice', 'medium', 'recognition', [TAB], {
    familyId: 'dat-def-sequence',
    instruction: 'der / die / das / die (Pl.) Dativ\'de hangi diziye dönüşür?',
    prompt: 'der / die / das / die (Pl.) → ?',
    answer: 'dem / der / dem / den',
    options: ['dem / der / dem / den', 'den / die / das / die', 'dem / die / dem / den', 'der / der / dem / den'],
    secondaryTopicIds: [T.articles],
    pronounce: ['dem, der, dem, den'],
  }),
  dx('dat-def-lehrerin-build', 'free-text', 'medium', 'production', [DIE, TAB], {
    familyId: 'dat-def-build',
    instruction: 'Dativ\'e çevirip `mit` ile yaz:',
    prompt: 'die Lehrerin → mit ______',
    answer: 'mit der Lehrerin',
    pronounce: ['mit der Lehrerin'],
  }),
  dx('dat-def-kind-error', 'error-correction', 'medium', 'correction', [DAS, ERR], {
    familyId: 'dat-def-error',
    instruction: 'Artikel yanlış — cümleyi düzelt:',
    prompt: 'Ich spiele mit den Kind.',
    answer: 'Ich spiele mit dem Kind.',
    explanation: '`das Kind` nötr → Dativ\'de `dem`. `den` çoğul Dativ (ya da eril Akkusativ) biçimidir.',
    pronounce: ['Ich spiele mit dem Kind.'],
  }),
  dx('dat-def-listen-lehrer', 'listen-choice', 'medium', 'recognition', [DER], {
    familyId: 'dat-def-listen',
    instruction: 'Duyduğun cümleyi seç (dem / den farkına dikkat):',
    prompt: 'Ich spreche mit dem Lehrer.',
    audioText: 'Ich spreche mit dem Lehrer.',
    answer: 'Ich spreche mit dem Lehrer.',
    options: ['Ich spreche mit dem Lehrer.', 'Ich spreche mit den Lehrer.', 'Ich spreche mit der Lehrerin.', 'Ich spreche mit die Lehrer.'],
    audio: listen('Ich spreche mit dem Lehrer.'),
  }),

  /* ================================================================
   * D. ein / eine → einem / einer, kein → keinem (9)
   * ================================================================ */
  dx('dat-indef-freund-fill', 'fill-blank', 'easy', 'recall', [EIN], {
    familyId: 'dat-indef-freund',
    instruction: 'Belirsiz artikeli Dativ\'e çevir — ein Freund:',
    prompt: 'mit ___ Freund',
    answer: 'einem',
    validation: EXACT,
    pronounce: ['mit einem Freund'],
  }),
  dx('dat-indef-freundin-fill', 'fill-blank', 'easy', 'recall', [EIN], {
    familyId: 'dat-indef-freundin',
    instruction: 'Belirsiz artikeli Dativ\'e çevir — eine Freundin:',
    prompt: 'mit ___ Freundin',
    answer: 'einer',
    validation: EXACT,
    pronounce: ['mit einer Freundin'],
  }),
  dx('dat-indef-kind-fill', 'fill-blank', 'easy', 'recall', [EIN], {
    familyId: 'dat-indef-kind',
    instruction: 'Belirsiz artikeli Dativ\'e çevir — ein Kind:',
    prompt: 'mit ___ Kind',
    answer: 'einem',
    validation: EXACT,
    pronounce: ['mit einem Kind'],
  }),
  dx('dat-indef-freundin-mc', 'multiple-choice', 'easy', 'recognition', [EIN], {
    familyId: 'dat-indef-mc',
    instruction: 'Doğru biçimi seç (eine Freundin):',
    prompt: 'Ich gehe mit ___ Freundin.',
    answer: 'einer',
    options: ['einer', 'eine', 'einem', 'einen'],
    pronounce: ['Ich gehe mit einer Freundin.'],
  }),
  dx('dat-indef-kein-match', 'matching', 'medium', 'recognition', [EIN, KEIN], {
    familyId: 'dat-indef-match',
    instruction: 'ein / kein grubunu `mit` + Dativ biçimiyle eşleştir.',
    pairs: [
      { left: 'ein Freund', right: 'mit einem Freund' },
      { left: 'eine Freundin', right: 'mit einer Freundin' },
      { left: 'kein Freund', right: 'mit keinem Freund' },
      { left: 'keine Freundin', right: 'mit keiner Freundin' },
    ],
    pronounce: ['mit einem Freund', 'mit einer Freundin', 'mit keinem Freund', 'mit keiner Freundin'],
  }),
  dx('dat-kein-fill', 'fill-blank', 'medium', 'recall', [KEIN], {
    familyId: 'dat-kein-fill',
    instruction: '`kein` biçimini yaz — Bugün hiçbir arkadaşla konuşmuyorum.',
    prompt: 'Heute spreche ich mit ___ Freund. (kein)',
    answer: 'keinem',
    validation: EXACT,
    pronounce: ['Heute spreche ich mit keinem Freund.'],
  }),
  dx('dat-kein-mc', 'multiple-choice', 'medium', 'recognition', [KEIN], {
    familyId: 'dat-kein-mc',
    instruction: '`keine Freundin` Dativ\'de nasıl olur?',
    prompt: 'keine Freundin → mit ?',
    answer: 'mit keiner Freundin',
    options: ['mit keiner Freundin', 'mit keine Freundin', 'mit keinem Freundin', 'mit keinen Freundin'],
    pronounce: ['mit keiner Freundin'],
  }),
  dx('dat-indef-freund-free', 'free-text', 'hard', 'production', [EIN, MIT], {
    familyId: 'dat-indef-free',
    instruction: TR,
    prompt: 'Bir arkadaşla konuşuyorum. → ______',
    answer: 'Ich spreche mit einem Freund.',
    validation: DE,
    pronounce: ['Ich spreche mit einem Freund.'],
  }),
  dx('dat-indef-eine-error', 'error-correction', 'medium', 'correction', [EIN, ERR], {
    familyId: 'dat-indef-error',
    instruction: 'Belirsiz artikel yanlış — cümleyi düzelt:',
    prompt: 'Ich gehe mit eine Freundin ins Kino.',
    answer: 'Ich gehe mit einer Freundin ins Kino.',
    explanation: '`mit` Dativ ister: `eine` → `einer`.',
    pronounce: ['Ich gehe mit einer Freundin ins Kino.'],
  }),

  /* ================================================================
   * E. mein / dein → meinem / meiner / meinen (22)
   * ================================================================ */
  dx('dat-poss-meinem-fill', 'fill-blank', 'easy', 'recall', [MEINEM], {
    familyId: 'dat-poss-meinem',
    instruction: 'İyelik kelimesini Dativ\'e çevir — mein Freund:',
    prompt: 'mit ___ Freund',
    answer: 'meinem',
    validation: EXACT,
    pronounce: ['mit meinem Freund'],
  }),
  dx('dat-poss-meiner-fill', 'fill-blank', 'easy', 'recall', [MEINER], {
    familyId: 'dat-poss-meiner',
    instruction: 'İyelik kelimesini Dativ\'e çevir — meine Mutter:',
    prompt: 'mit ___ Mutter',
    answer: 'meiner',
    validation: EXACT,
    pronounce: ['mit meiner Mutter'],
  }),
  dx('dat-poss-kind-fill', 'fill-blank', 'easy', 'recall', [MEINEM], {
    familyId: 'dat-poss-kind',
    instruction: 'İyelik kelimesini Dativ\'e çevir — mein Kind:',
    prompt: 'mit ___ Kind',
    answer: 'meinem',
    validation: EXACT,
    pronounce: ['mit meinem Kind'],
  }),
  dx('dat-poss-meinen-fill', 'fill-blank', 'easy', 'recall', [MEINEN], {
    familyId: 'dat-poss-meinen',
    instruction: 'İyelik kelimesini Dativ\'e çevir — meine Freunde (çoğul):',
    prompt: 'mit ___ Freunden',
    answer: 'meinen',
    validation: EXACT,
    pronounce: ['mit meinen Freunden'],
  }),
  dx('dat-poss-match', 'matching', 'easy', 'recognition', [MEINEM, MEINER, MEINEN], {
    familyId: 'dat-poss-match',
    instruction: 'İyelik grubunu Dativ biçimiyle eşleştir.',
    pairs: [
      { left: 'mein Freund', right: 'mit meinem Freund' },
      { left: 'meine Mutter', right: 'mit meiner Mutter' },
      { left: 'mein Kind', right: 'mit meinem Kind' },
      { left: 'meine Freunde', right: 'mit meinen Freunden' },
    ],
    pronounce: ['mit meinem Freund', 'mit meiner Mutter', 'mit meinem Kind', 'mit meinen Freunden'],
  }),
  dx('dat-poss-vater-mc', 'multiple-choice', 'easy', 'recognition', [MEINEM, FIVE], {
    familyId: 'dat-poss-vater-mc',
    instruction: 'Doğru biçimi seç — Babamla konuşuyorum.',
    prompt: 'Ich spreche mit ___ Vater.',
    answer: 'meinem',
    options: ['meinem', 'mein', 'meinen', 'meiner'],
    pronounce: ['Ich spreche mit meinem Vater.'],
  }),
  dx('dat-poss-schwester-mc', 'multiple-choice', 'easy', 'recognition', [MEINER, FIVE], {
    familyId: 'dat-poss-schwester-mc',
    instruction: 'Doğru biçimi seç — Kız kardeşimle oynuyorum.',
    prompt: 'Ich spiele mit ___ Schwester.',
    answer: 'meiner',
    options: ['meiner', 'meine', 'meinem', 'meinen'],
    pronounce: ['Ich spiele mit meiner Schwester.'],
  }),
  dx('dat-poss-freund-build', 'free-text', 'medium', 'production', [MEINEM], {
    familyId: 'dat-poss-build-freund',
    instruction: '`mit` ile Dativ grubunu yaz:',
    prompt: 'mein Freund → mit ______',
    answer: 'mit meinem Freund',
    pronounce: ['mit meinem Freund'],
  }),
  dx('dat-poss-mutter-build', 'free-text', 'medium', 'production', [MEINER], {
    familyId: 'dat-poss-build-mutter',
    instruction: '`mit` ile Dativ grubunu yaz:',
    prompt: 'meine Mutter → mit ______',
    answer: 'mit meiner Mutter',
    pronounce: ['mit meiner Mutter'],
  }),
  dx('dat-poss-freunde-build', 'free-text', 'medium', 'production', [MEINEN, PL], {
    familyId: 'dat-poss-build-freunde',
    instruction: '`mit` ile Dativ grubunu yaz (çoğul — iki değişiklik!):',
    prompt: 'meine Freunde → mit ______',
    answer: 'mit meinen Freunden',
    pronounce: ['mit meinen Freunden'],
  }),
  dx('dat-poss-bruder-fill', 'fill-blank', 'medium', 'recall', [MEINEM, W_INS], {
    familyId: 'dat-poss-bruder',
    instruction: 'İyelik kelimesini yaz (mein) — Erkek kardeşimle oynuyorum.',
    prompt: 'Ich spiele mit ___ Bruder.',
    answer: 'meinem',
    validation: EXACT,
    pronounce: ['Ich spiele mit meinem Bruder.'],
  }),
  dx('dat-poss-dein-fill', 'fill-blank', 'medium', 'recall', [POSS_X], {
    familyId: 'dat-poss-dein',
    instruction: 'İyelik kelimesini yaz (dein) — Kız kardeşinle oynuyor musun?',
    prompt: 'Spielst du mit ___ Schwester?',
    answer: 'deiner',
    validation: EXACT,
    secondaryTopicIds: [T.pronouns],
    pronounce: ['Spielst du mit deiner Schwester?'],
  }),
  dx('dat-poss-sein-fill', 'fill-blank', 'medium', 'recall', [POSS_X, W_INS], {
    familyId: 'dat-poss-sein',
    instruction: 'İyelik kelimesini yaz (sein) — O, erkek kardeşiyle oynuyor.',
    prompt: 'Er spielt mit ___ Bruder.',
    answer: 'seinem',
    validation: EXACT,
    secondaryTopicIds: [T.pronouns],
    pronounce: ['Er spielt mit seinem Bruder.'],
  }),
  dx('dat-poss-ihr-fill', 'fill-blank', 'medium', 'recall', [POSS_X], {
    familyId: 'dat-poss-ihr',
    instruction: 'İyelik kelimesini yaz (ihr) — O (kadın), annesiyle konuşuyor.',
    prompt: 'Sie spricht mit ___ Mutter.',
    answer: 'ihrer',
    validation: EXACT,
    secondaryTopicIds: [T.pronouns],
    pronounce: ['Sie spricht mit ihrer Mutter.'],
  }),
  dx('dat-poss-unser-mc', 'multiple-choice', 'medium', 'recognition', [POSS_X], {
    familyId: 'dat-poss-unser',
    instruction: 'Doğru biçimi seç (unser Lehrer) — Öğretmenimizle konuşuyoruz.',
    prompt: 'Wir sprechen mit ___ Lehrer.',
    answer: 'unserem',
    options: ['unserem', 'unser', 'unseren', 'unsere'],
    pronounce: ['Wir sprechen mit unserem Lehrer.'],
  }),
  dx('dat-poss-others-match', 'matching', 'medium', 'recognition', [POSS_X], {
    familyId: 'dat-poss-others',
    instruction: 'İyelik grubunu `mit` + Dativ biçimiyle eşleştir.',
    pairs: [
      { left: 'dein Vater', right: 'mit deinem Vater' },
      { left: 'seine Mutter', right: 'mit seiner Mutter' },
      { left: 'ihr Bruder', right: 'mit ihrem Bruder' },
      { left: 'unsere Freunde', right: 'mit unseren Freunden' },
    ],
    secondaryTopicIds: [T.pronouns],
    pronounce: ['mit deinem Vater', 'mit seiner Mutter', 'mit ihrem Bruder', 'mit unseren Freunden'],
  }),
  dx('dat-poss-five-mc', 'multiple-choice', 'easy', 'recognition', [FIVE, MEINEN], {
    familyId: 'dat-poss-five',
    instruction: '"Arkadaşlarımla" hangisidir?',
    prompt: 'arkadaşlarımla → ?',
    answer: 'mit meinen Freunden',
    options: ['mit meinen Freunden', 'mit meine Freunde', 'mit meinen Freunde', 'mit meinem Freunden'],
    pronounce: ['mit meinen Freunden'],
  }),
  dx('dat-poss-vater-wb', 'word-bank-translation', 'medium', 'production', [FIVE, MEINEM], {
    familyId: 'dat-poss-vater-wb',
    instruction: 'Kutucuklarla kur — Babamla konuşuyorum.',
    answer: 'Ich spreche mit meinem Vater.',
    wordBank: {
      direction: 'tr-to-de', sourceText: 'Babamla konuşuyorum.', targetLanguage: 'de',
      tokens: tok('Ich', 'spreche', 'mit', 'meinem', 'Vater.', 'meinen', 'mein'),
      acceptedSequences: [['Ich', 'spreche', 'mit', 'meinem', 'Vater.']],
    },
    pronounce: ['Ich spreche mit meinem Vater.'],
  }),
  dx('dat-poss-schwester-wb', 'word-bank-translation', 'medium', 'production', [FIVE, MEINER], {
    familyId: 'dat-poss-schwester-wb',
    instruction: 'Kutucuklarla kur — Kız kardeşimle oynuyorum.',
    answer: 'Ich spiele mit meiner Schwester.',
    wordBank: {
      direction: 'tr-to-de', sourceText: 'Kız kardeşimle oynuyorum.', targetLanguage: 'de',
      tokens: tok('Ich', 'spiele', 'mit', 'meiner', 'Schwester.', 'meine', 'meinem'),
      acceptedSequences: [['Ich', 'spiele', 'mit', 'meiner', 'Schwester.']],
    },
    pronounce: ['Ich spiele mit meiner Schwester.'],
  }),
  dx('dat-poss-bruder-free', 'free-text', 'hard', 'production', [MEINEM, W_INS], {
    familyId: 'dat-poss-bruder-free',
    instruction: TR,
    prompt: 'Erkek kardeşimle futbol oynuyorum. → ______',
    answer: 'Ich spiele mit meinem Bruder Fußball.',
    acceptedAnswers: ['Ich spiele Fußball mit meinem Bruder.'],
    validation: DE,
    pronounce: ['Ich spiele mit meinem Bruder Fußball.'],
  }),
  dx('dat-poss-schwester-free', 'free-text', 'hard', 'production', [MEINER, FIVE], {
    familyId: 'dat-poss-schwester-free',
    instruction: TR,
    prompt: 'Kız kardeşimle ders çalışıyorum. → ______',
    answer: 'Ich lerne mit meiner Schwester.',
    validation: DE,
    pronounce: ['Ich lerne mit meiner Schwester.'],
  }),
  dx('dat-poss-meine-error', 'error-correction', 'medium', 'correction', [MEINER, ERR], {
    familyId: 'dat-poss-error',
    instruction: 'İyelik eki yanlış — cümleyi düzelt:',
    prompt: 'Ich spreche mit meine Mutter.',
    answer: 'Ich spreche mit meiner Mutter.',
    explanation: '`meine Mutter` dişil → Dativ\'de `meiner`.',
    pronounce: ['Ich spreche mit meiner Mutter.'],
  }),

  /* ================================================================
   * F. Çoğulda Dativ: den + isim + n (8)
   * ================================================================ */
  dx('dat-pl-rule-mc', 'multiple-choice', 'easy', 'recognition', [PL], {
    familyId: 'dat-pl-rule',
    instruction: 'Dativ çoğulda ne olur?',
    prompt: 'die Freunde → mit den Freunden',
    answer: 'Artikel den olur ve isme -n eklenir.',
    options: [
      'Artikel den olur ve isme -n eklenir.',
      'Artikel die kalır, isim değişmez.',
      'Artikel dem olur, isim değişmez.',
      'Artikel der olur ve isme -s eklenir.',
    ],
    pronounce: ['mit den Freunden'],
  }),
  dx('dat-pl-kinder-fill', 'fill-blank', 'easy', 'recall', [PL], {
    familyId: 'dat-pl-kinder',
    instruction: 'Çoğul ismi Dativ\'e çevir — die Kinder:',
    prompt: 'mit den ___',
    answer: 'Kindern',
    validation: EXACT_NOUN,
    pronounce: ['mit den Kindern'],
  }),
  dx('dat-pl-freunde-fill', 'fill-blank', 'easy', 'recall', [PL], {
    familyId: 'dat-pl-freunde',
    instruction: 'Çoğul ismi Dativ\'e çevir — meine Freunde:',
    prompt: 'mit meinen ___',
    answer: 'Freunden',
    validation: EXACT_NOUN,
    pronounce: ['mit meinen Freunden'],
  }),
  dx('dat-pl-katzen-mc', 'multiple-choice', 'medium', 'recognition', [PL_X], {
    familyId: 'dat-pl-katzen',
    instruction: 'İsim zaten -n ile bitiyor — doğru biçimi seç (die Katzen):',
    prompt: 'Ich spiele mit den ___.',
    answer: 'Katzen',
    options: ['Katzen', 'Katzenn', 'Katze', 'Katzens'],
    pronounce: ['Ich spiele mit den Katzen.'],
  }),
  dx('dat-pl-autos-mc', 'multiple-choice', 'medium', 'recognition', [PL_X], {
    familyId: 'dat-pl-autos',
    instruction: '-s çoğulu değişmez — doğru biçimi seç (die Autos):',
    prompt: 'mit den ___',
    answer: 'Autos',
    options: ['Autos', 'Auton', 'Autosn', 'Autoen'],
    pronounce: ['mit den Autos'],
  }),
  dx('dat-pl-kinder-free', 'free-text', 'hard', 'production', [PL, MIT], {
    familyId: 'dat-pl-kinder-free',
    instruction: TR,
    prompt: 'Çocuklarla konuşuyorum. → ______',
    answer: 'Ich spreche mit den Kindern.',
    validation: DE,
    pronounce: ['Ich spreche mit den Kindern.'],
  }),
  dx('dat-pl-freunde-error', 'error-correction', 'medium', 'correction', [MEINEN, PL, ERR], {
    familyId: 'dat-pl-error-freunde',
    instruction: 'Çoğul Dativ yanlış — cümleyi düzelt:',
    prompt: 'Ich spiele mit meine Freunde.',
    answer: 'Ich spiele mit meinen Freunden.',
    explanation: 'Çoğul Dativ\'de iki değişiklik: `meine` → `meinen`, `Freunde` → `Freunden`.',
    pronounce: ['Ich spiele mit meinen Freunden.'],
  }),
  dx('dat-pl-n-error', 'error-correction', 'medium', 'correction', [PL], {
    familyId: 'dat-pl-error-n',
    instruction: 'İsmin sonu eksik — cümleyi düzelt:',
    prompt: 'Ich spreche mit den Kinder.',
    answer: 'Ich spreche mit den Kindern.',
    explanation: 'Çoğul Dativ: `den` + isim + `-n` → `den Kindern`.',
    pronounce: ['Ich spreche mit den Kindern.'],
  }),

  /* ================================================================
   * G. mir / dir / ihm / ihr / uns (10)
   * ================================================================ */
  dx('dat-pron-core-match', 'matching', 'easy', 'recognition', [PR], {
    familyId: 'dat-pron-core',
    instruction: 'Kişi zamirini Dativ biçimiyle eşleştir.',
    pairs: [
      { left: 'ich', right: 'mir' },
      { left: 'du', right: 'dir' },
      { left: 'er', right: 'ihm' },
      { left: 'sie (kadın)', right: 'ihr' },
      { left: 'wir', right: 'uns' },
    ],
    secondaryTopicIds: [T.pronouns],
    pronounce: ['mir', 'dir', 'ihm', 'ihr', 'uns'],
  }),
  dx('dat-pron-mir-fill', 'fill-blank', 'easy', 'recall', [PR], {
    familyId: 'dat-pron-mir',
    instruction: 'Dativ zamirini yaz (ich) — Benimle geliyor musun?',
    prompt: 'Kommst du mit ___?',
    answer: 'mir',
    validation: EXACT,
    pronounce: ['Kommst du mit mir?'],
  }),
  dx('dat-pron-dir-fill', 'fill-blank', 'easy', 'recall', [PR], {
    familyId: 'dat-pron-dir',
    instruction: 'Dativ zamirini yaz (du) — Seninle gidiyorum.',
    prompt: 'Ich gehe mit ___.',
    answer: 'dir',
    validation: EXACT,
    pronounce: ['Ich gehe mit dir.'],
  }),
  dx('dat-pron-ihm-mc', 'multiple-choice', 'medium', 'recognition', [PR], {
    familyId: 'dat-pron-ihm',
    instruction: 'Doğru zamiri seç (er) — Onunla konuşuyorum.',
    prompt: 'Ich spreche mit ___. (er)',
    answer: 'ihm',
    options: ['ihm', 'ihn', 'er', 'ihr'],
    pronounce: ['Ich spreche mit ihm.'],
  }),
  dx('dat-pron-ihr-mc', 'multiple-choice', 'medium', 'recognition', [PR], {
    familyId: 'dat-pron-ihr',
    instruction: 'Doğru zamiri seç (sie — kadın) — Onunla konuşuyorum.',
    prompt: 'Ich spreche mit ___. (sie)',
    answer: 'ihr',
    options: ['ihr', 'sie', 'ihm', 'ihnen'],
    pronounce: ['Ich spreche mit ihr.'],
  }),
  dx('dat-pron-uns-fill', 'fill-blank', 'medium', 'recall', [PR], {
    familyId: 'dat-pron-uns',
    instruction: 'Dativ zamirini yaz (wir) — O bizimle oynuyor.',
    prompt: 'Er spielt mit ___.',
    answer: 'uns',
    validation: EXACT,
    pronounce: ['Er spielt mit uns.'],
  }),
  dx('dat-pron-table-match', 'matching', 'medium', 'recognition', [PR_T], {
    familyId: 'dat-pron-table',
    instruction: 'Kalan zamirleri Dativ biçimiyle eşleştir.',
    pairs: [
      { left: 'ihr (siz)', right: 'euch' },
      { left: 'sie (onlar)', right: 'ihnen' },
      { left: 'Sie (resmî)', right: 'Ihnen' },
      { left: 'es', right: 'ihm' },
    ],
    pronounce: ['euch', 'ihnen', 'Ihnen', 'ihm'],
  }),
  dx('dat-pron-known-mc', 'multiple-choice', 'easy', 'recognition', [PR_K], {
    familyId: 'dat-pron-known',
    instruction: 'Bu bildiğin kalıpta `dir` hangi hâldedir?',
    prompt: 'Wie geht es dir?',
    answer: 'Dativ',
    options: ['Dativ', 'Akkusativ', 'Nominativ'],
    pronounce: ['Wie geht es dir?'],
  }),
  dx('dat-pron-ihr-free', 'free-text', 'hard', 'production', [PR, MIT], {
    familyId: 'dat-pron-ihr-free',
    instruction: TR,
    prompt: 'Onunla (kadın) konuşuyorum. → ______',
    answer: 'Ich spreche mit ihr.',
    pronounce: ['Ich spreche mit ihr.'],
  }),
  dx('dat-pron-mich-error', 'error-correction', 'medium', 'correction', [PR, ERR], {
    familyId: 'dat-pron-error',
    instruction: 'Zamir yanlış — cümleyi düzelt:',
    prompt: 'Kommst du mit mich?',
    answer: 'Kommst du mit mir?',
    explanation: '`mit` Dativ ister: `mich` (Akkusativ) değil `mir`.',
    pronounce: ['Kommst du mit mir?'],
  }),

  /* ================================================================
   * H. mit — kişi ve araç (10)
   * ================================================================ */
  dx('dat-mit-prep-mc', 'multiple-choice', 'easy', 'recognition', [MIT], {
    familyId: 'dat-mit-prep',
    instruction: 'Boşluğa hangi kelime gelir? — Arkadaşımla gidiyorum.',
    prompt: 'Ich gehe ___ meinem Freund.',
    answer: 'mit',
    options: ['mit', 'nach', 'aus', 'seit'],
    pronounce: ['Ich gehe mit meinem Freund.'],
  }),
  dx('dat-mit-bus-wb', 'word-bank-translation', 'medium', 'production', [MIT_V, W_ULA], {
    familyId: 'dat-mit-bus-wb',
    instruction: 'Kutucuklarla kur — Otobüsle gidiyorum.',
    answer: 'Ich fahre mit dem Bus.',
    wordBank: {
      direction: 'tr-to-de', sourceText: 'Otobüsle gidiyorum.', targetLanguage: 'de',
      tokens: tok('Ich', 'fahre', 'mit', 'dem', 'Bus.', 'den', 'der'),
      acceptedSequences: [['Ich', 'fahre', 'mit', 'dem', 'Bus.']],
    },
    pronounce: ['Ich fahre mit dem Bus.'],
  }),
  dx('dat-mit-zug-free', 'free-text', 'hard', 'production', [MIT_V, NACH, W_ULA], {
    familyId: 'dat-mit-zug',
    instruction: TR,
    prompt: 'Trenle Berlin’e gidiyorum. → ______',
    answer: 'Ich fahre mit dem Zug nach Berlin.',
    validation: DE,
    pronounce: ['Ich fahre mit dem Zug nach Berlin.'],
  }),
  dx('dat-mit-fahrrad-fill', 'fill-blank', 'medium', 'recall', [MIT_V, DAS], {
    familyId: 'dat-mit-fahrrad',
    instruction: 'Dativ artikelini yaz (das Fahrrad) — Okula bisikletle gidiyorum.',
    prompt: 'Ich fahre mit ___ Fahrrad zur Schule.',
    answer: 'dem',
    validation: EXACT,
    pronounce: ['Ich fahre mit dem Fahrrad zur Schule.'],
  }),
  dx('dat-mit-auto-mc', 'multiple-choice', 'easy', 'recognition', [MIT_V], {
    familyId: 'dat-mit-auto',
    instruction: 'Doğru cümleyi seç — Babam arabayla gidiyor.',
    prompt: 'Babam arabayla gidiyor.',
    answer: 'Mein Vater fährt mit dem Auto.',
    options: ['Mein Vater fährt mit dem Auto.', 'Mein Vater fährt mit das Auto.', 'Mein Vater fährt mit den Auto.', 'Mein Vater fährt mit der Auto.'],
    pronounce: ['Mein Vater fährt mit dem Auto.'],
  }),
  dx('dat-mit-freund-order', 'ordering', 'medium', 'production', [MIT, MEINEM], {
    familyId: 'dat-mit-order',
    instruction: 'Kelimeleri doğru sıraya diz — Arkadaşımla gidiyorum.',
    answer: 'Ich gehe mit meinem Freund.',
    pronounce: ['Ich gehe mit meinem Freund.'],
  }),
  dx('dat-mit-lehrerin-sb', 'sentence-builder', 'hard', 'production', [MIT_P, DIE], {
    familyId: 'dat-mit-sb',
    instruction: 'Cümleyi kur:',
    prompt: 'Kadın öğretmenle konuşuyorum.',
    answer: 'Ich spreche mit der Lehrerin.',
    pronounce: ['Ich spreche mit der Lehrerin.'],
  }),
  dx('dat-mit-listen-bus', 'listen-choice', 'easy', 'recognition', [MIT_V], {
    familyId: 'dat-mit-listen',
    instruction: 'Duyduğun cümleyi seç:',
    prompt: 'Ich fahre mit dem Bus.',
    audioText: 'Ich fahre mit dem Bus.',
    answer: 'Ich fahre mit dem Bus.',
    options: ['Ich fahre mit dem Bus.', 'Ich fahre mit dem Zug.', 'Ich fahre mit den Bus.', 'Ich gehe zum Bus.'],
    audio: listen('Ich fahre mit dem Bus.'),
  }),
  dx('dat-mit-dictation-freunde', 'dictation', 'medium', 'production', [MEINEN, MIT], {
    familyId: 'dat-mit-dictation',
    instruction: 'Arkadaşlarla ilgili cümleyi duydun — aynen yaz:',
    audioText: 'Ich spiele mit meinen Freunden.',
    answer: 'Ich spiele mit meinen Freunden.',
    audio: listen('Ich spiele mit meinen Freunden.'),
    pronounce: ['Ich spiele mit meinen Freunden.'],
  }),
  dx('dat-mit-bus-error', 'error-correction', 'medium', 'correction', [MIT_V, DER], {
    familyId: 'dat-mit-error',
    instruction: 'Artikel yanlış — cümleyi düzelt:',
    prompt: 'Ich fahre mit der Bus.',
    answer: 'Ich fahre mit dem Bus.',
    explanation: '`der Bus` eril → `mit dem Bus`.',
    pronounce: ['Ich fahre mit dem Bus.'],
  }),

  /* ================================================================
   * I. zu — zum / zur (12)
   * ================================================================ */
  dx('dat-zu-arzt-mc', 'multiple-choice', 'easy', 'recognition', [ZUM, ZU], {
    familyId: 'dat-zu-arzt-mc',
    instruction: 'Boşluğa ne gelir? — Doktora gidiyorum.',
    prompt: 'Ich gehe ___ Arzt.',
    answer: 'zum',
    options: ['zum', 'zur', 'aus', 'von'],
    secondaryTopicIds: [T.places],
    pronounce: ['Ich gehe zum Arzt.'],
  }),
  dx('dat-zu-schule-mc', 'multiple-choice', 'easy', 'recognition', [ZUR, ZU], {
    familyId: 'dat-zu-schule-mc',
    instruction: 'Boşluğa ne gelir? — Okula gidiyorum.',
    prompt: 'Ich gehe ___ Schule.',
    answer: 'zur',
    options: ['zur', 'zum', 'nach', 'bei'],
    secondaryTopicIds: [T.places],
    pronounce: ['Ich gehe zur Schule.'],
  }),
  dx('dat-zu-zum-fill', 'fill-blank', 'easy', 'recall', [ZUM], {
    familyId: 'dat-zu-zum',
    instruction: 'Kısaltmayı yaz:',
    prompt: 'zu + dem = ___',
    answer: 'zum',
    validation: EXACT,
    pronounce: ['zum'],
  }),
  dx('dat-zu-zur-fill', 'fill-blank', 'easy', 'recall', [ZUR], {
    familyId: 'dat-zu-zur',
    instruction: 'Kısaltmayı yaz:',
    prompt: 'zu + der = ___',
    answer: 'zur',
    validation: EXACT,
    pronounce: ['zur'],
  }),
  dx('dat-zu-supermarkt-fill', 'fill-blank', 'medium', 'recall', [ZUM, W_YER], {
    familyId: 'dat-zu-supermarkt',
    instruction: 'Kısaltmayla yaz (der Supermarkt) — Süpermarkete gidiyorum.',
    prompt: 'Ich gehe ___ Supermarkt.',
    answer: 'zum',
    validation: EXACT,
    pronounce: ['Ich gehe zum Supermarkt.'],
  }),
  dx('dat-zu-arbeit-fill', 'fill-blank', 'medium', 'recall', [ZUR], {
    familyId: 'dat-zu-arbeit',
    instruction: 'Kısaltmayla yaz (die Arbeit) — Babam işe gidiyor.',
    prompt: 'Mein Vater geht ___ Arbeit.',
    answer: 'zur',
    validation: EXACT,
    pronounce: ['Mein Vater geht zur Arbeit.'],
  }),
  dx('dat-zu-mutter-fill', 'fill-blank', 'medium', 'recall', [ZU_P, MEINER], {
    familyId: 'dat-zu-mutter',
    instruction: 'İyelik kelimesini yaz (mein) — Annemin yanına gidiyorum.',
    prompt: 'Ich gehe zu ___ Mutter.',
    answer: 'meiner',
    validation: EXACT,
    pronounce: ['Ich gehe zu meiner Mutter.'],
  }),
  dx('dat-zu-match', 'matching', 'medium', 'recognition', [ZUM, ZUR], {
    familyId: 'dat-zu-match',
    instruction: 'İsmi `zum` / `zur` kalıbıyla eşleştir.',
    pairs: [
      { left: 'der Arzt', right: 'zum Arzt' },
      { left: 'die Schule', right: 'zur Schule' },
      { left: 'der Supermarkt', right: 'zum Supermarkt' },
      { left: 'die Arbeit', right: 'zur Arbeit' },
    ],
    pronounce: ['zum Arzt', 'zur Schule', 'zum Supermarkt', 'zur Arbeit'],
  }),
  dx('dat-zu-schule-wb', 'word-bank-translation', 'easy', 'production', [ZUR, ZU], {
    familyId: 'dat-zu-schule-wb',
    instruction: 'Kutucuklarla kur — Okula gidiyorum.',
    answer: 'Ich gehe zur Schule.',
    wordBank: {
      direction: 'tr-to-de', sourceText: 'Okula gidiyorum.', targetLanguage: 'de',
      tokens: tok('Ich', 'gehe', 'zur', 'Schule.', 'zum', 'nach'),
      acceptedSequences: [['Ich', 'gehe', 'zur', 'Schule.']],
    },
    pronounce: ['Ich gehe zur Schule.'],
  }),
  dx('dat-zu-arzt-wb', 'word-bank-translation', 'easy', 'production', [ZUM, W_YER], {
    familyId: 'dat-zu-arzt-wb',
    instruction: 'Kutucuklarla kur — Doktora gidiyorum.',
    answer: 'Ich gehe zum Arzt.',
    wordBank: {
      direction: 'tr-to-de', sourceText: 'Doktora gidiyorum.', targetLanguage: 'de',
      tokens: tok('Arzt.', 'gehe', 'zum', 'Ich', 'zur', 'beim'),
      acceptedSequences: [['Ich', 'gehe', 'zum', 'Arzt.']],
    },
    pronounce: ['Ich gehe zum Arzt.'],
  }),
  dx('dat-zu-der-arzt-error', 'error-correction', 'medium', 'correction', [ZUM, ERR], {
    familyId: 'dat-zu-error-arzt',
    instruction: 'Artikel yanlış — cümleyi düzelt:',
    prompt: 'Ich gehe zu der Arzt.',
    answer: 'Ich gehe zum Arzt.',
    explanation: '`der Arzt` eril → Dativ `dem` → `zu dem` = `zum`.',
    pronounce: ['Ich gehe zum Arzt.'],
  }),
  dx('dat-zu-zum-schule-error', 'error-correction', 'hard', 'correction', [ZUR], {
    familyId: 'dat-zu-error-schule',
    instruction: 'Kısaltma yanlış — cümleyi düzelt:',
    prompt: 'Ich gehe zum Schule.',
    answer: 'Ich gehe zur Schule.',
    explanation: '`die Schule` dişil → `zu der` = `zur`.',
    pronounce: ['Ich gehe zur Schule.'],
  }),
  dx('dat-zu-listen-arzt', 'listen-choice', 'medium', 'recognition', [ZUM], {
    familyId: 'dat-zu-listen',
    instruction: 'Duyduğun cümleyi seç:',
    prompt: 'Ich gehe zum Arzt.',
    audioText: 'Ich gehe zum Arzt.',
    answer: 'Ich gehe zum Arzt.',
    options: ['Ich gehe zum Arzt.', 'Ich gehe zur Arzt.', 'Ich bin beim Arzt.', 'Ich komme vom Arzt.'],
    audio: listen('Ich gehe zum Arzt.'),
  }),

  /* ================================================================
   * J. bei — beim (7)
   * ================================================================ */
  dx('dat-bei-mc', 'multiple-choice', 'easy', 'recognition', [BEI], {
    familyId: 'dat-bei-mc',
    instruction: 'Boşluğa ne gelir? — Annemin yanındayım.',
    prompt: 'Ich bin ___ meiner Mutter.',
    answer: 'bei',
    options: ['bei', 'zu', 'nach', 'aus'],
    secondaryTopicIds: [T.places],
    pronounce: ['Ich bin bei meiner Mutter.'],
  }),
  dx('dat-bei-beim-fill', 'fill-blank', 'easy', 'recall', [BEIM], {
    familyId: 'dat-bei-beim',
    instruction: 'Kısaltmayı yaz:',
    prompt: 'bei + dem = ___',
    answer: 'beim',
    validation: EXACT,
    pronounce: ['beim'],
  }),
  dx('dat-bei-arzt-fill', 'fill-blank', 'medium', 'recall', [BEIM, W_YER], {
    familyId: 'dat-bei-arzt',
    instruction: 'Kısaltmayla yaz — Doktordayım.',
    prompt: 'Ich bin ___ Arzt.',
    answer: 'beim',
    validation: EXACT,
    pronounce: ['Ich bin beim Arzt.'],
  }),
  dx('dat-bei-zu-bei-mc', 'multiple-choice', 'medium', 'recognition', [ZU_BEI, BEIM], {
    familyId: 'dat-bei-zu-bei',
    instruction: 'Doğru cümleyi seç (konum → bei):',
    prompt: 'Kız kardeşim doktorda.',
    answer: 'Meine Schwester ist beim Arzt.',
    options: ['Meine Schwester ist beim Arzt.', 'Meine Schwester ist zum Arzt.', 'Meine Schwester geht beim Arzt.', 'Meine Schwester ist zur Arzt.'],
    pronounce: ['Meine Schwester ist beim Arzt.'],
  }),
  dx('dat-bei-vater-free', 'free-text', 'hard', 'production', [BEI, MEINEM], {
    familyId: 'dat-bei-vater',
    instruction: TR,
    prompt: 'Babamın yanındayım. → ______',
    answer: 'Ich bin bei meinem Vater.',
    pronounce: ['Ich bin bei meinem Vater.'],
  }),
  dx('dat-bei-tante-free', 'free-text', 'hard', 'production', [BEI, MEINER], {
    familyId: 'dat-bei-tante',
    instruction: TR,
    prompt: 'Teyzemin yanında oturuyorum. → ______',
    answer: 'Ich wohne bei meiner Tante.',
    pronounce: ['Ich wohne bei meiner Tante.'],
  }),
  dx('dat-bei-mein-error', 'error-correction', 'medium', 'correction', [BEI, ERR], {
    familyId: 'dat-bei-error',
    instruction: 'İyelik eki eksik — cümleyi düzelt:',
    prompt: 'Ich bin bei mein Vater.',
    answer: 'Ich bin bei meinem Vater.',
    explanation: '`bei` Dativ ister: `mein Vater` → `meinem Vater`.',
    pronounce: ['Ich bin bei meinem Vater.'],
  }),

  /* ================================================================
   * K. von — vom (6)
   * ================================================================ */
  dx('dat-von-mc', 'multiple-choice', 'easy', 'recognition', [VON, W_GES], {
    familyId: 'dat-von-mc',
    instruction: 'Boşluğa ne gelir? — Hediye babamdan.',
    prompt: 'Das Geschenk ist ___ meinem Vater.',
    answer: 'von',
    options: ['von', 'aus', 'mit', 'nach'],
    pronounce: ['Das Geschenk ist von meinem Vater.'],
  }),
  dx('dat-von-vom-fill', 'fill-blank', 'easy', 'recall', [VOM], {
    familyId: 'dat-von-vom',
    instruction: 'Kısaltmayı yaz:',
    prompt: 'von + dem = ___',
    answer: 'vom',
    validation: EXACT,
    pronounce: ['vom'],
  }),
  dx('dat-von-arzt-fill', 'fill-blank', 'medium', 'recall', [VOM, W_YER], {
    familyId: 'dat-von-arzt',
    instruction: 'Kısaltmayla yaz — Doktordan geliyorum.',
    prompt: 'Ich komme ___ Arzt.',
    answer: 'vom',
    validation: EXACT,
    pronounce: ['Ich komme vom Arzt.'],
  }),
  dx('dat-von-geschenk-free', 'free-text', 'hard', 'production', [VON, W_GES, MEINEM], {
    familyId: 'dat-von-geschenk',
    instruction: TR,
    prompt: 'Hediye babamdan. → ______',
    answer: 'Das Geschenk ist von meinem Vater.',
    pronounce: ['Das Geschenk ist von meinem Vater.'],
  }),
  dx('dat-von-brief-wb', 'word-bank-translation', 'medium', 'production', [VON, MEINER, W_INS], {
    familyId: 'dat-von-brief',
    instruction: 'Kutucuklarla kur — Mektup kız arkadaşımdan.',
    answer: 'Der Brief ist von meiner Freundin.',
    wordBank: {
      direction: 'tr-to-de', sourceText: 'Mektup kız arkadaşımdan.', targetLanguage: 'de',
      tokens: tok('Der', 'Brief', 'ist', 'von', 'meiner', 'Freundin.', 'meine', 'aus'),
      acceptedSequences: [['Der', 'Brief', 'ist', 'von', 'meiner', 'Freundin.']],
    },
    pronounce: ['Der Brief ist von meiner Freundin.'],
  }),
  dx('dat-von-arbeit-free', 'free-text', 'medium', 'production', [VON, DIE], {
    familyId: 'dat-von-arbeit',
    instruction: TR,
    prompt: 'İşten geliyorum. → ______',
    answer: 'Ich komme von der Arbeit.',
    pronounce: ['Ich komme von der Arbeit.'],
  }),

  /* ================================================================
   * L. aus — köken ve içinden (6)
   * ================================================================ */
  dx('dat-aus-mc', 'multiple-choice', 'easy', 'recognition', [AUS, AUS_T], {
    familyId: 'dat-aus-mc',
    instruction: 'Boşluğa ne gelir? — Türkiye’den geliyorum.',
    prompt: 'Ich komme ___ der Türkei.',
    answer: 'aus',
    options: ['aus', 'mit', 'zu', 'nach'],
    pronounce: ['Ich komme aus der Türkei.'],
  }),
  dx('dat-aus-tuerkei-fill', 'fill-blank', 'easy', 'recall', [AUS_T], {
    familyId: 'dat-aus-tuerkei',
    instruction: 'Dativ artikelini yaz (die Türkei):',
    prompt: 'Ich komme aus ___ Türkei.',
    answer: 'der',
    validation: EXACT,
    pronounce: ['Ich komme aus der Türkei.'],
  }),
  dx('dat-aus-artikelsiz-mc', 'multiple-choice', 'medium', 'recognition', [AUS_0], {
    familyId: 'dat-aus-artikelsiz',
    instruction: 'Doğru cümleyi seç — Almanya’dan geliyorum.',
    prompt: 'Almanya’dan geliyorum.',
    answer: 'Ich komme aus Deutschland.',
    options: ['Ich komme aus Deutschland.', 'Ich komme aus dem Deutschland.', 'Ich komme aus der Deutschland.', 'Ich komme von Deutschland.'],
    pronounce: ['Ich komme aus Deutschland.'],
  }),
  dx('dat-aus-flasche-free', 'free-text', 'hard', 'production', [AUS, DIE], {
    familyId: 'dat-aus-flasche',
    instruction: TR,
    prompt: 'Şişeden su içiyorum. → ______',
    answer: 'Ich trinke Wasser aus der Flasche.',
    pronounce: ['Ich trinke Wasser aus der Flasche.'],
  }),
  dx('dat-aus-die-error', 'error-correction', 'medium', 'correction', [AUS_T, ERR], {
    familyId: 'dat-aus-error',
    instruction: 'Artikel yanlış — cümleyi düzelt:',
    prompt: 'Ich komme aus die Türkei.',
    answer: 'Ich komme aus der Türkei.',
    explanation: '`aus` Dativ ister: `die Türkei` → `aus der Türkei`.',
    validation: DE,
    pronounce: ['Ich komme aus der Türkei.'],
  }),
  dx('dat-aus-dictation', 'dictation', 'medium', 'production', [AUS_T], {
    familyId: 'dat-aus-dictation',
    instruction: 'Aile cümlesini duydun — aynen yaz:',
    audioText: 'Meine Familie kommt aus der Türkei.',
    answer: 'Meine Familie kommt aus der Türkei.',
    audio: listen('Meine Familie kommt aus der Türkei.'),
    validation: DE,
    pronounce: ['Meine Familie kommt aus der Türkei.'],
  }),

  /* ================================================================
   * M. nach / nach Hause (6)
   * ================================================================ */
  dx('dat-nach-berlin-mc', 'multiple-choice', 'easy', 'recognition', [NACH], {
    familyId: 'dat-nach-berlin',
    instruction: 'Boşluğa ne gelir? — Berlin’e gidiyorum.',
    prompt: 'Ich fahre ___ Berlin.',
    answer: 'nach',
    options: ['nach', 'zu', 'zum', 'bei'],
    pronounce: ['Ich fahre nach Berlin.'],
  }),
  dx('dat-nach-hause-fill', 'fill-blank', 'easy', 'recall', [HAUSE], {
    familyId: 'dat-nach-hause',
    instruction: 'Sabit kalıbı tamamla — Eve gidiyorum.',
    prompt: 'Ich gehe nach ___.',
    answer: 'Hause',
    validation: EXACT_NOUN,
    secondaryTopicIds: [T.places],
    pronounce: ['Ich gehe nach Hause.'],
  }),
  dx('dat-nach-vs-zu-mc', 'multiple-choice', 'medium', 'recognition', [NACH, ZU], {
    familyId: 'dat-nach-vs-zu',
    instruction: 'Doğru cümleyi seç — Almanya’ya gidiyorum.',
    prompt: 'Almanya’ya gidiyorum.',
    answer: 'Ich fahre nach Deutschland.',
    options: ['Ich fahre nach Deutschland.', 'Ich fahre zu Deutschland.', 'Ich fahre nach dem Deutschland.', 'Ich fahre zum Deutschland.'],
    pronounce: ['Ich fahre nach Deutschland.'],
  }),
  dx('dat-nach-match', 'matching', 'medium', 'recognition', [NACH, HAUSE, ZUM, ZUR], {
    familyId: 'dat-nach-match',
    instruction: 'Türkçeyi doğru Almanca kalıpla eşleştir.',
    pairs: [
      { left: 'Berlin’e', right: 'nach Berlin' },
      { left: 'eve', right: 'nach Hause' },
      { left: 'doktora', right: 'zum Arzt' },
      { left: 'okula', right: 'zur Schule' },
      { left: 'evde', right: 'zu Hause' },
    ],
    secondaryTopicIds: [T.places],
    pronounce: ['nach Berlin', 'nach Hause', 'zum Arzt', 'zur Schule', 'zu Hause'],
  }),
  dx('dat-nach-dem-error', 'error-correction', 'medium', 'correction', [NACH, ERR], {
    familyId: 'dat-nach-error',
    instruction: 'Fazla kelime var — cümleyi düzelt:',
    prompt: 'Ich fahre nach dem Berlin.',
    answer: 'Ich fahre nach Berlin.',
    explanation: 'Şehir adlarında artikel yoktur: `nach Berlin`.',
    pronounce: ['Ich fahre nach Berlin.'],
  }),
  dx('dat-nach-istanbul-free', 'free-text', 'hard', 'production', [NACH, MIT_V], {
    familyId: 'dat-nach-istanbul',
    instruction: TR,
    prompt: 'Trenle İstanbul’a gidiyoruz. → ______',
    answer: 'Wir fahren mit dem Zug nach Istanbul.',
    pronounce: ['Wir fahren mit dem Zug nach Istanbul.'],
  }),

  /* ================================================================
   * N. seit — -den beri (6)
   * ================================================================ */
  dx('dat-seit-mc', 'multiple-choice', 'easy', 'recognition', [SEIT], {
    familyId: 'dat-seit-mc',
    instruction: 'Boşluğa ne gelir? — İki aydır Almanca öğreniyorum.',
    prompt: 'Ich lerne ___ zwei Monaten Deutsch.',
    answer: 'seit',
    options: ['seit', 'mit', 'nach', 'von'],
    pronounce: ['Ich lerne seit zwei Monaten Deutsch.'],
  }),
  dx('dat-seit-monaten-fill', 'fill-blank', 'medium', 'recall', [SEIT_M, W_MON], {
    familyId: 'dat-seit-monaten',
    instruction: 'Çoğul Dativ\'i yaz (der Monat → die Monate):',
    prompt: 'Ich lerne seit zwei ___ Deutsch.',
    answer: 'Monaten',
    validation: EXACT_NOUN,
    pronounce: ['Ich lerne seit zwei Monaten Deutsch.'],
  }),
  dx('dat-seit-woche-fill', 'fill-blank', 'medium', 'recall', [SEIT_M, EIN], {
    familyId: 'dat-seit-woche',
    instruction: 'Dativ biçimini yaz (eine Woche) — Bir haftadır Almanca öğreniyorum.',
    prompt: 'Ich lerne seit ___ Woche Deutsch.',
    answer: 'einer',
    validation: EXACT,
    pronounce: ['Ich lerne seit einer Woche Deutsch.'],
  }),
  dx('dat-seit-monaten-free', 'free-text', 'hard', 'production', [SEIT_M, SEIT], {
    familyId: 'dat-seit-free',
    instruction: TR,
    prompt: 'İki aydır Almanca öğreniyorum. → ______',
    answer: 'Ich lerne seit zwei Monaten Deutsch.',
    pronounce: ['Ich lerne seit zwei Monaten Deutsch.'],
  }),
  dx('dat-seit-jahren-free', 'free-text', 'hard', 'production', [SEIT_M], {
    familyId: 'dat-seit-jahren',
    instruction: TR,
    prompt: 'İki yıldır Sakarya’da oturuyorum. → ______',
    answer: 'Ich wohne seit zwei Jahren in Sakarya.',
    pronounce: ['Ich wohne seit zwei Jahren in Sakarya.'],
  }),
  dx('dat-seit-monate-error', 'error-correction', 'medium', 'correction', [SEIT_M], {
    familyId: 'dat-seit-error',
    instruction: 'Çoğul Dativ eksik — cümleyi düzelt:',
    prompt: 'Ich lerne seit zwei Monate Deutsch.',
    answer: 'Ich lerne seit zwei Monaten Deutsch.',
    explanation: '`seit` Dativ ister; çoğulda isim `-n` alır: `Monaten`.',
    pronounce: ['Ich lerne seit zwei Monaten Deutsch.'],
  }),

  /* ================================================================
   * O. Akkusativ vs Dativ (13)
   * ================================================================ */
  dx('dat-akk-sehe-fill', 'fill-blank', 'medium', 'recall', [AD_M, AD], {
    familyId: 'dat-akk-pair-akk',
    instruction: 'mein Freund → Akkusativ mı Dativ mi? Doğru biçimi yaz — Arkadaşımı görüyorum.',
    prompt: 'Ich sehe ___ Freund.',
    answer: 'meinen',
    validation: EXACT,
    secondaryTopicIds: [T.akkusativ],
    pronounce: ['Ich sehe meinen Freund.'],
  }),
  dx('dat-akk-gehe-mit-fill', 'fill-blank', 'medium', 'recall', [AD_M, MIT], {
    familyId: 'dat-akk-pair-dat',
    instruction: 'mein Freund → Akkusativ mı Dativ mi? Doğru biçimi yaz — Arkadaşımla gidiyorum.',
    prompt: 'Ich gehe mit ___ Freund.',
    answer: 'meinem',
    validation: EXACT,
    pronounce: ['Ich gehe mit meinem Freund.'],
  }),
  dx('dat-akk-treffe-mc', 'multiple-choice', 'medium', 'recognition', [AD_T, AD], {
    familyId: 'dat-akk-treffe',
    instruction: 'Doğru artikeli seç (der Freund) — fiilin doğrudan nesnesi:',
    prompt: 'Ich treffe ___ Freund.',
    answer: 'den',
    options: ['den', 'dem', 'der'],
    secondaryTopicIds: [T.akkusativ],
    pronounce: ['Ich treffe den Freund.'],
  }),
  dx('dat-akk-mit-dem-mc', 'multiple-choice', 'medium', 'recognition', [AD_T, DER], {
    familyId: 'dat-akk-mit-dem',
    instruction: 'Doğru artikeli seç (der Freund) — `mit`\'ten sonra:',
    prompt: 'Ich gehe mit ___ Freund.',
    answer: 'dem',
    options: ['dem', 'den', 'der'],
    pronounce: ['Ich gehe mit dem Freund.'],
  }),
  dx('dat-akk-table-match', 'matching', 'medium', 'recognition', [AD_T], {
    familyId: 'dat-akk-table',
    instruction: 'Hâli doğru biçimle eşleştir.',
    pairs: [
      { left: 'der Freund — Akkusativ', right: 'den Freund' },
      { left: 'der Freund — Dativ', right: 'dem Freund' },
      { left: 'die Mutter — Akkusativ', right: 'die Mutter' },
      { left: 'die Mutter — Dativ', right: 'der Mutter' },
    ],
    secondaryTopicIds: [T.akkusativ],
    pronounce: ['den Freund', 'dem Freund', 'die Mutter', 'der Mutter'],
  }),
  dx('dat-akk-which-mc', 'multiple-choice', 'medium', 'recognition', [AD], {
    familyId: 'dat-akk-which',
    instruction: 'Hangi cümlede Dativ vardır?',
    prompt: 'mein Freund → meinen / meinem',
    answer: 'Ich spreche mit meinem Freund.',
    options: ['Ich spreche mit meinem Freund.', 'Ich besuche meinen Freund.', 'Ich treffe meinen Freund.', 'Ich rufe meinen Freund an.'],
    pronounce: ['Ich spreche mit meinem Freund.'],
  }),
  dx('dat-akk-why-mc', 'multiple-choice', 'easy', 'recognition', [AD], {
    familyId: 'dat-akk-why',
    instruction: 'Neden `meinen`?',
    prompt: 'Ich besuche meinen Freund.',
    answer: '`besuchen` doğrudan nesne alır → Akkusativ',
    options: [
      '`besuchen` doğrudan nesne alır → Akkusativ',
      '`mit` var → Dativ',
      'Özne olduğu için → Nominativ',
      'Çoğul olduğu için → -en',
    ],
    pronounce: ['Ich besuche meinen Freund.'],
  }),
  dx('dat-akk-mutter-mc', 'multiple-choice', 'medium', 'recognition', [AD_T, DIE], {
    familyId: 'dat-akk-mutter',
    instruction: 'die Mutter — iki boşluğa sırasıyla ne gelir?',
    prompt: 'Ich besuche ___ Mutter. / Ich spreche mit ___ Mutter.',
    answer: 'die / der',
    options: ['die / der', 'der / die', 'die / die', 'den / dem'],
    pronounce: ['Ich besuche die Mutter.', 'Ich spreche mit der Mutter.'],
  }),
  dx('dat-akk-sehen-free', 'free-text', 'hard', 'production', [AD_M, W_FS], {
    familyId: 'dat-akk-sehen-free',
    instruction: TR,
    prompt: 'Arkadaşımı görüyorum. → ______',
    answer: 'Ich sehe meinen Freund.',
    secondaryTopicIds: [T.akkusativ],
    pronounce: ['Ich sehe meinen Freund.'],
  }),
  dx('dat-akk-besuche-free', 'free-text', 'hard', 'production', [AD, AD_T], {
    familyId: 'dat-akk-besuche-free',
    instruction: TR,
    prompt: 'Babamı ziyaret ediyorum, sonra babamla konuşuyorum. → ______',
    answer: 'Ich besuche meinen Vater. Dann spreche ich mit meinem Vater.',
    acceptedAnswers: ['Ich besuche meinen Vater. Danach spreche ich mit meinem Vater.'],
    pronounce: ['Ich besuche meinen Vater.', 'Dann spreche ich mit meinem Vater.'],
  }),
  dx('dat-akk-sehen-wb', 'word-bank-translation', 'medium', 'production', [AD_M, W_FS], {
    familyId: 'dat-akk-sehen-wb',
    instruction: 'Kutucuklarla kur — Arkadaşımı görüyorum. (Akkusativ!)',
    answer: 'Ich sehe meinen Freund.',
    wordBank: {
      direction: 'tr-to-de', sourceText: 'Arkadaşımı görüyorum.', targetLanguage: 'de',
      tokens: tok('Ich', 'sehe', 'meinen', 'Freund.', 'meinem', 'mit'),
      acceptedSequences: [['Ich', 'sehe', 'meinen', 'Freund.']],
    },
    pronounce: ['Ich sehe meinen Freund.'],
  }),
  dx('dat-akk-sehe-meinem-error', 'error-correction', 'medium', 'correction', [AD_M, ERR], {
    familyId: 'dat-akk-error-sehe',
    instruction: 'Hâl yanlış — cümleyi düzelt:',
    prompt: 'Ich sehe meinem Freund.',
    answer: 'Ich sehe meinen Freund.',
    explanation: '`sehen` doğrudan nesne alır (Akkusativ): `meinen`. `meinem` yalnızca `mit/zu/bei…`’ten sonra gelir.',
    secondaryTopicIds: [T.akkusativ],
    pronounce: ['Ich sehe meinen Freund.'],
  }),
  dx('dat-akk-mit-meinen-error', 'error-correction', 'hard', 'correction', [AD_M, ERR], {
    familyId: 'dat-akk-error-mit',
    instruction: 'Tek harf yanlış — cümleyi düzelt:',
    prompt: 'Ich gehe mit meinen Freund.',
    answer: 'Ich gehe mit meinem Freund.',
    explanation: '`mit` + tekil eril → `meinem` (-em). `meinen` ya Akkusativ ya da çoğul Dativ’dir.',
    pronounce: ['Ich gehe mit meinem Freund.'],
  }),

  /* ================================================================
   * P. helfen, danken, gefallen (7)
   * ================================================================ */
  dx('dat-verb-helfen-mc', 'multiple-choice', 'easy', 'recognition', [HELFEN], {
    familyId: 'dat-verb-helfen-mc',
    instruction: 'Doğru zamiri seç (du) — Sana yardım ediyorum.',
    prompt: 'Ich helfe ___.',
    answer: 'dir',
    options: ['dir', 'dich', 'du'],
    pronounce: ['Ich helfe dir.'],
  }),
  dx('dat-verb-danken-fill', 'fill-blank', 'medium', 'recall', [DANKEN, W_HD], {
    familyId: 'dat-verb-danken',
    instruction: 'Dativ zamirini yaz (du) — Sana teşekkür ediyorum.',
    prompt: 'Ich danke ___.',
    answer: 'dir',
    validation: EXACT,
    pronounce: ['Ich danke dir.'],
  }),
  dx('dat-verb-gefallen-mc', 'multiple-choice', 'easy', 'recognition', [GEF], {
    familyId: 'dat-verb-gefallen-mc',
    instruction: 'Doğru biçimi seç — Bu hoşuma gidiyor.',
    prompt: 'Das gefällt ___.',
    answer: 'mir',
    options: ['mir', 'mich', 'ich'],
    secondaryTopicIds: [T.likes],
    pronounce: ['Das gefällt mir.'],
  }),
  dx('dat-verb-helfen-mutter-free', 'free-text', 'hard', 'production', [HELFEN, MEINER], {
    familyId: 'dat-verb-helfen-mutter',
    instruction: TR,
    prompt: 'Anneme yardım ediyorum. → ______',
    answer: 'Ich helfe meiner Mutter.',
    pronounce: ['Ich helfe meiner Mutter.'],
  }),
  dx('dat-verb-helfe-dir-free', 'free-text', 'medium', 'production', [HELFEN], {
    familyId: 'dat-verb-helfe-dir',
    instruction: TR,
    prompt: 'Sana yardım ediyorum. → ______',
    answer: 'Ich helfe dir.',
    pronounce: ['Ich helfe dir.'],
  }),
  dx('dat-verb-dich-error', 'error-correction', 'medium', 'correction', [HELFEN, ERR], {
    familyId: 'dat-verb-error',
    instruction: 'Zamir yanlış — cümleyi düzelt:',
    prompt: 'Ich helfe dich.',
    answer: 'Ich helfe dir.',
    explanation: '`helfen` Dativ ister: `dich` değil `dir`.',
    pronounce: ['Ich helfe dir.'],
  }),
  dx('dat-verb-listen-gefallen', 'listen-choice', 'easy', 'recognition', [GEF], {
    familyId: 'dat-verb-listen',
    instruction: 'Duyduğun cümleyi seç:',
    prompt: 'Das gefällt mir.',
    audioText: 'Das gefällt mir.',
    answer: 'Das gefällt mir.',
    options: ['Das gefällt mir.', 'Das gefällt mich.', 'Das gefällt dir.', 'Das gefällt ich.'],
    audio: listen('Das gefällt mir.'),
    secondaryTopicIds: [T.likes],
  }),

  /* ================================================================
   * Q. Türkçe → Almanca — çekirdek cümleler (18)
   * ================================================================ */
  dx('dat-tr-freund', 'free-text', 'medium', 'production', [MIT, MEINEM, FIVE], {
    familyId: 'dat-tr-freund',
    instruction: TR,
    prompt: 'Arkadaşımla gidiyorum. → ______',
    answer: 'Ich gehe mit meinem Freund.',
    pronounce: ['Ich gehe mit meinem Freund.'],
  }),
  dx('dat-tr-mutter', 'free-text', 'medium', 'production', [MIT_P, FIVE], {
    familyId: 'dat-tr-mutter',
    instruction: TR,
    prompt: 'Annemle konuşuyorum. → ______',
    answer: 'Ich spreche mit meiner Mutter.',
    pronounce: ['Ich spreche mit meiner Mutter.'],
  }),
  dx('dat-tr-arzt', 'free-text', 'medium', 'production', [ZUM, W_YER], {
    familyId: 'dat-tr-arzt',
    instruction: TR,
    prompt: 'Doktora gidiyorum. → ______',
    answer: 'Ich gehe zum Arzt.',
    pronounce: ['Ich gehe zum Arzt.'],
  }),
  dx('dat-tr-schule', 'free-text', 'medium', 'production', [ZUR], {
    familyId: 'dat-tr-schule',
    instruction: TR,
    prompt: 'Okula gidiyorum. → ______',
    answer: 'Ich gehe zur Schule.',
    pronounce: ['Ich gehe zur Schule.'],
  }),
  dx('dat-tr-bus', 'free-text', 'medium', 'production', [MIT_V, W_ULA], {
    familyId: 'dat-tr-bus',
    instruction: TR,
    prompt: 'Otobüsle gidiyorum. → ______',
    answer: 'Ich fahre mit dem Bus.',
    pronounce: ['Ich fahre mit dem Bus.'],
  }),
  dx('dat-tr-tuerkei', 'free-text', 'medium', 'production', [AUS_T], {
    familyId: 'dat-tr-tuerkei',
    instruction: TR,
    prompt: 'Türkiye’den geliyorum. → ______',
    answer: 'Ich komme aus der Türkei.',
    validation: DE,
    secondaryTopicIds: [T.personalInfo],
    pronounce: ['Ich komme aus der Türkei.'],
  }),
  dx('dat-tr-geschenk', 'free-text', 'hard', 'production', [VON, W_GES, MEINEM], {
    familyId: 'dat-tr-geschenk',
    instruction: TR,
    prompt: 'Babamdan bir hediye. → ______',
    answer: 'Ein Geschenk von meinem Vater.',
    acceptedAnswers: ['Das ist ein Geschenk von meinem Vater.'],
    pronounce: ['Ein Geschenk von meinem Vater.'],
  }),
  dx('dat-tr-freunde', 'free-text', 'hard', 'production', [MEINEN, PL], {
    familyId: 'dat-tr-freunde',
    instruction: TR,
    prompt: 'Arkadaşlarımla oynuyorum. → ______',
    answer: 'Ich spiele mit meinen Freunden.',
    pronounce: ['Ich spiele mit meinen Freunden.'],
  }),
  dx('dat-tr-schwester', 'free-text', 'hard', 'production', [MEINER, FIVE], {
    familyId: 'dat-tr-schwester',
    instruction: TR,
    prompt: 'Kız kardeşimle konuşuyorum. → ______',
    answer: 'Ich spreche mit meiner Schwester.',
    pronounce: ['Ich spreche mit meiner Schwester.'],
  }),
  dx('dat-tr-hause', 'free-text', 'medium', 'production', [HAUSE], {
    familyId: 'dat-tr-hause',
    instruction: TR,
    prompt: 'Eve gidiyorum. → ______',
    answer: 'Ich gehe nach Hause.',
    pronounce: ['Ich gehe nach Hause.'],
  }),
  dx('dat-tr-beim-arzt', 'free-text', 'hard', 'production', [BEIM, ZU_BEI], {
    familyId: 'dat-tr-beim-arzt',
    instruction: TR,
    prompt: 'Doktordayım. → ______',
    answer: 'Ich bin beim Arzt.',
    pronounce: ['Ich bin beim Arzt.'],
  }),
  dx('dat-tr-supermarkt', 'free-text', 'medium', 'production', [ZUM, W_YER], {
    familyId: 'dat-tr-supermarkt',
    instruction: TR,
    prompt: 'Süpermarkete gidiyorum. → ______',
    answer: 'Ich gehe zum Supermarkt.',
    pronounce: ['Ich gehe zum Supermarkt.'],
  }),
  dx('dat-tr-mit-ihm', 'free-text', 'hard', 'production', [PR, MIT], {
    familyId: 'dat-tr-mit-ihm',
    instruction: TR,
    prompt: 'Onunla (erkek) konuşuyorum. → ______',
    answer: 'Ich spreche mit ihm.',
    pronounce: ['Ich spreche mit ihm.'],
  }),
  dx('dat-tr-zu-mutter', 'free-text', 'hard', 'production', [ZU_P, MEINER], {
    familyId: 'dat-tr-zu-mutter',
    instruction: TR,
    prompt: 'Annemin yanına gidiyorum. → ______',
    answer: 'Ich gehe zu meiner Mutter.',
    pronounce: ['Ich gehe zu meiner Mutter.'],
  }),
  dx('dat-tr-vom-arzt', 'free-text', 'hard', 'production', [VOM], {
    familyId: 'dat-tr-vom-arzt',
    instruction: TR,
    prompt: 'Doktordan geliyorum. → ______',
    answer: 'Ich komme vom Arzt.',
    pronounce: ['Ich komme vom Arzt.'],
  }),
  dx('dat-tr-freund-wb', 'word-bank-translation', 'easy', 'production', [MEINEM, MIT], {
    familyId: 'dat-tr-freund-wb',
    instruction: 'Kutucuklarla kur — Arkadaşımla gidiyorum.',
    answer: 'Ich gehe mit meinem Freund.',
    wordBank: {
      direction: 'tr-to-de', sourceText: 'Arkadaşımla gidiyorum.', targetLanguage: 'de',
      tokens: tok('gehe', 'meinem', 'mit', 'Ich', 'Freund.', 'meinen', 'mein'),
      acceptedSequences: [['Ich', 'gehe', 'mit', 'meinem', 'Freund.']],
    },
    pronounce: ['Ich gehe mit meinem Freund.'],
  }),
  dx('dat-detr-bus-wb', 'word-bank-translation', 'easy', 'recognition', [MIT_V], {
    familyId: 'dat-detr-bus',
    instruction: 'Almancadan Türkçeye kutucuklarla kur (araçla):',
    answer: 'Otobüsle gidiyorum.',
    wordBank: {
      direction: 'de-to-tr', sourceText: 'Ich fahre mit dem Bus.', targetLanguage: 'tr',
      tokens: tok('Otobüsle', 'gidiyorum.', 'Trenle', 'geliyorum.'),
      acceptedSequences: [['Otobüsle', 'gidiyorum.']],
    },
    audio: listen('Ich fahre mit dem Bus.'),
    pronounce: ['Ich fahre mit dem Bus.'],
  }),
  dx('dat-detr-mutter-wb', 'word-bank-translation', 'easy', 'recognition', [MIT_P], {
    familyId: 'dat-detr-mutter',
    instruction: 'Almancadan Türkçeye kutucuklarla kur (kişiyle):',
    answer: 'Annemle konuşuyorum.',
    wordBank: {
      direction: 'de-to-tr', sourceText: 'Ich spreche mit meiner Mutter.', targetLanguage: 'tr',
      tokens: tok('Annemle', 'konuşuyorum.', 'Annemi', 'görüyorum.'),
      acceptedSequences: [['Annemle', 'konuşuyorum.']],
    },
    audio: listen('Ich spreche mit meiner Mutter.'),
    pronounce: ['Ich spreche mit meiner Mutter.'],
  }),

  /* ================================================================
   * R. Cümle kurma — merdiven, kartlar, bağlam, durumlar (15)
   * ================================================================ */
  dx('dat-sb-ladder-freund', 'free-text', 'medium', 'production', [LADDER, MEINEM], {
    familyId: 'dat-sb-ladder-freund',
    instruction: 'Merdiveni tamamla — son basamak tam cümle (ich + gehen):',
    prompt: 'Freund → mein Freund → mit meinem Freund → ______',
    answer: 'Ich gehe mit meinem Freund.',
    pronounce: ['Ich gehe mit meinem Freund.'],
  }),
  dx('dat-sb-ladder-mutter', 'free-text', 'medium', 'production', [LADDER, MEINER], {
    familyId: 'dat-sb-ladder-mutter',
    instruction: 'Merdiveni tamamla — son basamak tam cümle (ich + sprechen):',
    prompt: 'Mutter → meine Mutter → mit meiner Mutter → ______',
    answer: 'Ich spreche mit meiner Mutter.',
    pronounce: ['Ich spreche mit meiner Mutter.'],
  }),
  dx('dat-sb-ladder-freunde', 'free-text', 'hard', 'production', [LADDER, MEINEN, PL], {
    familyId: 'dat-sb-ladder-freunde',
    instruction: 'Merdiveni kendin tamamla — Dativ grubunu ve cümleyi kur (ich + spielen):',
    prompt: 'Freunde → meine Freunde → ______ → ______',
    answer: 'Ich spiele mit meinen Freunden.',
    hint: 'Çoğul Dativ: `meinen` + `Freunden`.',
    pronounce: ['Ich spiele mit meinen Freunden.'],
  }),
  dx('dat-sb-card-arzt', 'free-text', 'medium', 'production', [ZUM, LADDER], {
    familyId: 'dat-sb-card-arzt',
    instruction: 'Kartlarla cümle kur:',
    prompt: 'Arzt + gehen (ich) → ______',
    answer: 'Ich gehe zum Arzt.',
    pronounce: ['Ich gehe zum Arzt.'],
  }),
  dx('dat-sb-card-bus-schule', 'free-text', 'hard', 'production', [CTX, MIT_V, ZUR], {
    familyId: 'dat-sb-card-bus',
    instruction: 'Kartlarla cümle kur:',
    prompt: 'Bus + Schule + fahren (ich) → ______',
    answer: 'Ich fahre mit dem Bus zur Schule.',
    secondaryTopicIds: [T.dailyRoutine],
    pronounce: ['Ich fahre mit dem Bus zur Schule.'],
  }),
  dx('dat-sb-meintag', 'free-text', 'hard', 'production', [CTX, MEINEM, ZUR], {
    familyId: 'dat-sb-meintag',
    instruction: TR,
    prompt: 'Arkadaşımla okula gidiyorum. → ______',
    answer: 'Ich gehe mit meinem Freund zur Schule.',
    secondaryTopicIds: [T.dailyRoutine],
    pronounce: ['Ich gehe mit meinem Freund zur Schule.'],
  }),
  dx('dat-sb-abend', 'free-text', 'hard', 'production', [CTX, ORDER], {
    familyId: 'dat-sb-abend',
    instruction: TR,
    prompt: 'Akşam annemle konuşuyorum. → ______',
    answer: 'Am Abend spreche ich mit meiner Mutter.',
    acceptedAnswers: ['Ich spreche am Abend mit meiner Mutter.'],
    secondaryTopicIds: [T.time],
    pronounce: ['Am Abend spreche ich mit meiner Mutter.'],
  }),
  dx('dat-sb-modal', 'free-text', 'hard', 'production', [CTX, MEINEN], {
    familyId: 'dat-sb-modal',
    instruction: TR,
    prompt: 'Arkadaşlarımla futbol oynamak istiyorum. → ______',
    answer: 'Ich möchte mit meinen Freunden Fußball spielen.',
    acceptedAnswers: ['Ich will mit meinen Freunden Fußball spielen.', 'Ich möchte mit meinen Freunden Fussball spielen.'],
    validation: DE,
    secondaryTopicIds: [T.modalVerbs],
    pronounce: ['Ich möchte mit meinen Freunden Fußball spielen.'],
  }),
  dx('dat-sb-perfekt-mutter', 'free-text', 'hard', 'production', [CTX, MIT_P], {
    familyId: 'dat-sb-perfekt-mutter',
    instruction: TR,
    prompt: 'Annemle konuştum. → ______',
    answer: 'Ich habe mit meiner Mutter gesprochen.',
    secondaryTopicIds: [T.perfekt],
    pronounce: ['Ich habe mit meiner Mutter gesprochen.'],
  }),
  dx('dat-sb-perfekt-arzt', 'free-text', 'hard', 'production', [CTX, ZUM], {
    familyId: 'dat-sb-perfekt-arzt',
    instruction: TR,
    prompt: 'Doktora gittim. → ______',
    answer: 'Ich bin zum Arzt gegangen.',
    secondaryTopicIds: [T.perfekt],
    pronounce: ['Ich bin zum Arzt gegangen.'],
  }),
  dx('dat-sb-order-heute', 'ordering', 'medium', 'production', [ORDER, MIT_V, ZUR], {
    familyId: 'dat-sb-order-heute',
    instruction: 'Kelimeleri doğru sıraya diz — Bugün otobüsle okula gidiyorum. (zaman başta, fiil ikinci)',
    answer: 'Heute fahre ich mit dem Bus zur Schule.',
    secondaryTopicIds: [T.dailyRoutine],
    pronounce: ['Heute fahre ich mit dem Bus zur Schule.'],
  }),
  dx('dat-sb-order-seit', 'ordering', 'medium', 'production', [ORDER, SEIT_M], {
    familyId: 'dat-sb-order-seit',
    instruction: 'Kelimeleri doğru sıraya diz — Bir haftadır Berlin’de oturuyorum.',
    answer: 'Ich wohne seit einer Woche in Berlin.',
    pronounce: ['Ich wohne seit einer Woche in Berlin.'],
  }),
  dx('dat-sb-builder-supermarkt', 'sentence-builder', 'hard', 'production', [CTX, MEINER, ZUM], {
    familyId: 'dat-sb-builder',
    instruction: 'Cümleyi kur:',
    prompt: 'Kız kardeşimle süpermarkete gidiyorum.',
    answer: 'Ich gehe mit meiner Schwester zum Supermarkt.',
    pronounce: ['Ich gehe mit meiner Schwester zum Supermarkt.'],
  }),
  dx('dat-sit-mutter-mc', 'multiple-choice', 'medium', 'recognition', [BEI, ZU_BEI], {
    familyId: 'dat-sit-mutter',
    instruction: 'Durum: Annenin evindesin. Telefonda ne dersin?',
    prompt: 'Wo bist du?',
    answer: 'Ich bin bei meiner Mutter.',
    options: ['Ich bin bei meiner Mutter.', 'Ich bin zu meiner Mutter.', 'Ich bin mit meine Mutter.', 'Ich bin bei meine Mutter.'],
    pronounce: ['Ich bin bei meiner Mutter.'],
  }),
  dx('dat-sit-woher-free', 'free-text', 'medium', 'production', [AUS_T], {
    familyId: 'dat-sit-woher',
    instruction: 'Durum: Biri nereli olduğunu soruyor — Türkiye’densin:',
    prompt: 'Woher kommst du? → ______',
    answer: 'Ich komme aus der Türkei.',
    validation: DE,
    secondaryTopicIds: [T.personalInfo],
    pronounce: ['Woher kommst du?', 'Ich komme aus der Türkei.'],
  }),
  dx('dat-sit-kino-free', 'free-text', 'hard', 'production', [MEINER, W_INS, CTX], {
    familyId: 'dat-sit-kino',
    instruction: TR,
    prompt: 'Kız arkadaşımla sinemaya gidiyorum. → ______',
    answer: 'Ich gehe mit meiner Freundin ins Kino.',
    pronounce: ['Ich gehe mit meiner Freundin ins Kino.'],
  }),

  /* ================================================================
   * S. Hata avı, kalıplar, kopya kâğıdı, üretim (5)
   * ================================================================ */
  dx('dat-err-hunt-mc', 'multiple-choice', 'medium', 'recognition', [ERR], {
    familyId: 'dat-err-hunt',
    instruction: 'Hata avı: üç cümlede Dativ hatası var. Hangi cümle DOĞRU?',
    prompt: 'Dativ hata avı',
    answer: 'Ich spreche mit meiner Mutter.',
    options: ['Ich spreche mit meiner Mutter.', 'Ich gehe mit mein Freund.', 'Ich komme aus die Türkei.', 'Ich gehe zu der Arzt.'],
    pronounce: ['Ich spreche mit meiner Mutter.'],
  }),
  dx('dat-chunks-match', 'matching', 'medium', 'recognition', [CHUNK], {
    familyId: 'dat-chunks',
    instruction: 'Türkçeyi günlük Dativ kalıbıyla eşleştir.',
    pairs: [
      { left: 'arkadaşımla', right: 'mit meinem Freund' },
      { left: 'otobüsle', right: 'mit dem Bus' },
      { left: 'doktorda', right: 'beim Arzt' },
      { left: 'babamdan', right: 'von meinem Vater' },
      { left: 'iki aydır', right: 'seit zwei Monaten' },
      { left: 'eve', right: 'nach Hause' },
    ],
    pronounce: ['mit meinem Freund', 'mit dem Bus', 'beim Arzt', 'von meinem Vater', 'seit zwei Monaten', 'nach Hause'],
  }),
  dx('dat-cheat-mc', 'multiple-choice', 'easy', 'recognition', [CHEAT], {
    familyId: 'dat-cheat',
    instruction: 'Kopya kâğıdındaki Dativ kelimeleri hangi listedir?',
    prompt: 'Dativ kelimeleri',
    answer: 'mit · zu · bei · von · aus · nach · seit',
    options: ['mit · zu · bei · von · aus · nach · seit', 'mit · zu · ohne · und · aber · nach · seit', 'und · aber · oder · dann · danach · auch · nicht'],
    pronounce: ['mit, zu, bei, von, aus, nach, seit'],
  }),
  dx('dat-spoken-tag', 'spoken', 'hard', 'speaking', [CTX, CHUNK], {
    familyId: 'dat-spoken',
    instruction: 'Sesli görev: Bugün kiminle, nereye ve neyle gidiyorsun? Üç cümleyle anlat.',
    requirements: ['Bir `mit` cümlesi (kişi ya da araç)', 'Bir `zum / zur` cümlesi', 'Bir `bei` ya da `nach Hause` cümlesi'],
    sampleAnswer: 'Ich fahre mit dem Bus zur Schule. Ich spreche mit meinem Freund. Am Abend gehe ich nach Hause.',
    pronounce: ['Ich fahre mit dem Bus zur Schule.'],
  }),
  dx('dat-free-kiminle', 'free-text', 'hard', 'production', [CTX, ORDER, CHUNK, MIT_V, ZUM], {
    familyId: 'dat-free-kiminle',
    instruction: 'Gününü Dativ ile anlat: kiminle, nereye, neyle? En az altı kısa cümle yaz — ipuçları aşağıda.',
    prompt: 'Bus / Schule:\nLehrer:\nFreunde:\nSupermarkt:\nMutter:\nNach Hause:',
    hint: 'mit + dem/meinem/meiner/meinen, zum/zur, bei, nach Hause.',
    answer: 'Am Morgen fahre ich mit dem Bus zur Schule. Ich spreche mit meinem Lehrer. Dann spiele ich mit meinen Freunden. Danach gehe ich zum Supermarkt. Am Abend bin ich bei meiner Mutter. Dann gehe ich nach Hause.',
    sampleAnswer: 'Am Morgen fahre ich mit dem Bus zur Schule. Ich spreche mit meinem Lehrer. Dann spiele ich mit meinen Freunden. Danach gehe ich zum Supermarkt. Am Abend bin ich bei meiner Mutter. Dann gehe ich nach Hause.',
    openEnded: true,
    explanation: 'Kanonik A1 model: altı kısa cümle, her birinde bir Dativ grubu.',
    pronounce: ['Am Morgen fahre ich mit dem Bus zur Schule.', 'Am Abend bin ich bei meiner Mutter.'],
  }),
];

/**
 * Cümle düzeyindeki Dativ üretiminde yazım toleransı sözcük başınadır:
 * `Ich fahre mit dem Zug.` (`Bus` yerine) ya da `Ich spiele …` (`spreche`
 * yerine) "küçük yazım hatası" diye kabul edilmez; anlam Jev'e gider.
 */
export function withStrictTokenTypos(exercise: AuthoredExercise): AuthoredExercise {
  if (!['free-text', 'error-correction', 'dictation'].includes(exercise.type)) return exercise;
  if (exercise.openEnded || (exercise.answer ?? '').trim().split(/\s+/).length < 3) return exercise;
  return { ...exercise, validation: { ...exercise.validation, strictTokenTypos: true } };
}

/** Dativ bankalarının ortak son işlemi (ders + Genel Tekrar). */
export const finalizeDativ = (exercise: AuthoredExercise): AuthoredExercise =>
  withStrictTokenTypos(withUncontractedVariants(exercise));

export const DATIV_EXERCISES: AuthoredExercise[] = BANK.map(finalizeDativ);

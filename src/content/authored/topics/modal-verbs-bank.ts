/**
 * Modalverben — yeni alıştırma bankası (defterdeki `können, möchten, wollen,
 * sollen, dürfen` dersi + `mögen / müssen` kısa notu).
 *
 * Dağılım hedefi: çekirdek Modalverben ~%50, cümle kurma ~%20,
 * Modalverb + ayrılabilen fiil ~%10, yeni kelime uygulaması ~%10,
 * Akkusativ çapraz pratiği ~%10. Çoktan seçmeli azınlıktadır; önce üretim.
 *
 * Kaynak normalizasyonları (defter → kanonik):
 *   - `du → möchte` → `du möchtest`; `sie/Sie → dürf` → `sie/Sie dürfen`
 *   - `Können Sie seine/Ihre Name sagen` → `Können Sie Ihren Namen sagen?`
 *   - `Ich will nicht morgen früh aufstehen.` → `Ich will morgen früh nicht aufstehen.`
 *   - `Du sollst etwas heiß trinken.` → alıştırmalarda `Du sollst Wasser trinken.`
 *   - `Hier darf nicht rauchen.` → `Hier darf man nicht rauchen.`
 *   - `Teyzen piyano çalıyor` → `Teyzem piyano çalabiliyor.` (Meine Tante kann Klavier spielen.)
 *
 * A1 SINIRI: yalnızca öğrenilmiş kavramlar; Perfekt, yan cümle, sıfat
 * çekimi (`etwas Heißes`) ve `müssen` çekimi yoktur.
 */

import type { AuthoredExercise } from '../types.ts';
import { T } from '../../curriculum/topics.ts';

type Rest = Partial<AuthoredExercise> & { instruction: string };

function mv(
  id: string,
  type: AuthoredExercise['type'],
  difficulty: AuthoredExercise['difficulty'],
  skill: AuthoredExercise['skill'],
  conceptIds: string[],
  rest: Rest,
): AuthoredExercise {
  return { id, topicId: T.modalVerbs, type, difficulty, skill, conceptIds, ...rest };
}

const tok = (...texts: string[]) => texts.map((text, index) => ({ id: `t${index + 1}`, text }));
const listen = (text: string) => ({ prompt: { text, language: 'de-DE' as const, role: 'prompt' as const } });

/** Almanca klavye olmadan ä/ö/ü/ß yazımı tam doğru sayılır (biçim farkı asla). */
const DE = { keyboardTolerance: true } as const;
/** Tek sözcüklü biçim sorularında yazım hatası da hata sayılır. */
const EXACT = { noTypoTolerance: true } as const;
const EXACT_DE = { noTypoTolerance: true, keyboardTolerance: true } as const;
/** Cümle başındaki büyük harfli boşluk: harf büyüklüğü önemsiz. */
const START = { caseSensitive: false, noTypoTolerance: true, keyboardTolerance: true } as const;

const ANL = 'modal-verbs.anlamlar';
const ICH_ER = 'modal-verbs.ich-er-ayni';
const K = 'modal-verbs.kural';
const INF = 'modal-verbs.moechten-infinitiv';
const KO_C = 'modal-verbs.koennen.cekim';
const KO = 'modal-verbs.koennen.kullanim';
const MO_C = 'modal-verbs.moechten.cekim';
const MO = 'modal-verbs.moechten.kullanim';
const WO_C = 'modal-verbs.wollen.cekim';
const WO = 'modal-verbs.wollen.kullanim';
const WO_MO = 'modal-verbs.wollen-moechten';
const SO_C = 'modal-verbs.sollen.cekim';
const SO = 'modal-verbs.sollen.kullanim';
const DU_C = 'modal-verbs.duerfen.cekim';
const VERBOT = 'modal-verbs.duerfen.verbot';
const MAN = 'modal-verbs.man';
const DARF_ICH = 'modal-verbs.duerfen.frage';
const MOEGEN = 'modal-verbs.moegen.anlam';
const MUESSEN = 'modal-verbs.muessen.anlam';
const FRAGE = 'modal-verbs.frage';
const JA_NEIN = 'modal-verbs.ja-nein';
const NICHT = 'modal-verbs.nicht';
const TRENN = 'modal-verbs.trennbar';
const AKK = 'modal-verbs.akkusativ';

export const NEW_MODAL_VERBS_EXERCISES: AuthoredExercise[] = [
  /* ================================================================
   * Anlam ve temel kural
   * ================================================================ */
  mv('mv-anlam-match', 'matching', 'easy', 'recognition', [ANL], {
    familyId: 'mv-anlam',
    instruction: 'Modalverbi anlamıyla eşleştir.',
    pairs: [
      { left: 'können', right: '-ebilmek (yetenek)' },
      { left: 'möchten', right: 'kibarca istemek' },
      { left: 'wollen', right: 'istemek, niyet / plan' },
      { left: 'sollen', right: '-meli / -malı' },
      { left: 'dürfen', right: 'izinli olmak / yasak' },
    ],
  }),
  mv('mv-kural-mastar-mc', 'multiple-choice', 'easy', 'recognition', [K, INF], {
    familyId: 'mv-kural',
    instruction: 'Modalverb cümlesinde asıl fiil nerede durur?',
    prompt: 'Ich möchte ein Brot kaufen.',
    answer: 'Cümlenin en sonunda, mastar hâlinde',
    options: [
      'Cümlenin en sonunda, mastar hâlinde',
      'Modalverbden hemen sonra, çekimli',
      'Cümlenin başında',
      'Özneden hemen önce',
    ],
    pronounce: ['Ich möchte ein Brot kaufen.'],
  }),
  mv('mv-muessen-anlam-mc', 'multiple-choice', 'easy', 'recognition', [MUESSEN], {
    familyId: 'mv-muessen',
    instruction: '`müssen` ne anlatır?',
    prompt: 'müssen',
    answer: 'zorunluluk, gereklilik',
    options: ['zorunluluk, gereklilik', 'izin', 'yetenek', 'kibar istek'],
    explanation: '`müssen` = zorundayım. Şimdilik yalnızca anlamını tanı; çekimi ileride bu konuya eklenecek.',
    pronounce: ['müssen'],
  }),
  mv('mv-moegen-anlam-mc', 'multiple-choice', 'easy', 'recognition', [MOEGEN], {
    familyId: 'mv-moegen',
    instruction: 'Modalverb listesindeki `mögen` ne demektir?',
    prompt: 'Ich mag Katzen.',
    answer: 'bir şeyi sevmek',
    options: ['bir şeyi sevmek', 'bir şeyi yapabilmek', 'bir şeyi yapmak zorunda olmak', 'bir şeye izin vermek'],
    pronounce: ['Ich mag Katzen.'],
  }),
  mv('mv-sollen-anlam-mc', 'multiple-choice', 'easy', 'recognition', [SO], {
    familyId: 'mv-hausaufgaben',
    instruction: 'Cümlenin anlamını seç:',
    prompt: 'Ich soll meine Hausaufgaben machen.',
    answer: 'Ödevimi yapmalıyım.',
    options: ['Ödevimi yapmalıyım.', 'Ödevimi yapabilirim.', 'Ödevimi yapmak istiyorum.', 'Ödevimi yapmam yasak.'],
    pronounce: ['Ich soll meine Hausaufgaben machen.'],
  }),
  mv('mv-duerfen-anlam-mc', 'multiple-choice', 'easy', 'recognition', [VERBOT, MAN], {
    familyId: 'mv-rauchen',
    instruction: 'Cümlenin anlamını seç:',
    prompt: 'Hier darf man nicht rauchen.',
    answer: 'Burada sigara içmek yasak.',
    options: ['Burada sigara içmek yasak.', 'Burada sigara içebilirsin.', 'Burada sigara içmek istiyorum.', 'Burada sigara içmelisin.'],
    pronounce: ['Hier darf man nicht rauchen.'],
  }),
  mv('mv-wollen-anlam-mc', 'multiple-choice', 'easy', 'recognition', [WO], {
    familyId: 'mv-wollen-anlam',
    instruction: 'Cümlenin anlamını seç:',
    prompt: 'Wir wollen zusammen kochen.',
    answer: 'Birlikte yemek pişirmek istiyoruz.',
    options: ['Birlikte yemek pişirmek istiyoruz.', 'Birlikte yemek pişirebiliriz.', 'Birlikte yemek pişirmeliyiz.', 'Birlikte yemek pişiriyoruz.'],
    pronounce: ['Wir wollen zusammen kochen.'],
  }),

  /* ================================================================
   * Çekim — können, möchten, wollen, sollen, dürfen
   * ================================================================ */
  mv('mv-koennen-du-fill', 'fill-blank', 'easy', 'recall', [KO_C], {
    familyId: 'mv-koennen-cekim',
    instruction: '`können` fiilini çek:',
    prompt: 'du ___ (können)',
    answer: 'kannst',
    validation: EXACT,
    pronounce: ['du kannst'],
  }),
  mv('mv-koennen-wir-fill', 'fill-blank', 'easy', 'recall', [KO_C, KO], {
    familyId: 'mv-tanzen',
    instruction: 'Boşluğu doldur — Biz dans edemiyoruz.',
    prompt: 'Wir ___ nicht tanzen. (können)',
    answer: 'können',
    validation: EXACT_DE,
    pronounce: ['Wir können nicht tanzen.'],
  }),
  mv('mv-koennen-ihr-fill', 'fill-blank', 'medium', 'recall', [KO_C], {
    familyId: 'mv-koennen-ihr',
    instruction: 'Boşluğu doldur — Siz (samimi, çoğul) iyi yemek pişirebiliyorsunuz.',
    prompt: 'Ihr ___ gut kochen. (können)',
    answer: 'könnt',
    validation: EXACT_DE,
    pronounce: ['Ihr könnt gut kochen.'],
  }),
  mv('mv-moechten-du-fill', 'fill-blank', 'medium', 'recall', [MO_C, FRAGE], {
    familyId: 'mv-fussball-frage',
    instruction: 'Boşluğu doldur — Futbol oynamak ister misin?',
    prompt: '___ du Fußball spielen? (möchten)',
    answer: 'Möchtest',
    validation: START,
    pronounce: ['Möchtest du Fußball spielen?'],
  }),
  mv('mv-moechten-ihr-fill', 'fill-blank', 'medium', 'recall', [MO_C], {
    familyId: 'mv-moechten-ihr',
    instruction: 'Boşluğu doldur — Siz (samimi, çoğul) pizza yemek istiyorsunuz.',
    prompt: 'Ihr ___ Pizza essen. (möchten)',
    answer: 'möchtet',
    validation: EXACT_DE,
    pronounce: ['Ihr möchtet Pizza essen.'],
  }),
  mv('mv-wollen-ich-fill', 'fill-blank', 'easy', 'recall', [WO_C, TRENN], {
    familyId: 'mv-aufstehen',
    instruction: 'Boşluğu doldur — Yarın erken kalkmak istiyorum.',
    prompt: 'Ich ___ morgen früh aufstehen. (wollen)',
    answer: 'will',
    validation: EXACT,
    pronounce: ['Ich will morgen früh aufstehen.'],
  }),
  mv('mv-wollen-du-fill', 'fill-blank', 'medium', 'recall', [WO_C, FRAGE], {
    familyId: 'mv-zusammen',
    instruction: 'Boşluğu doldur — Birlikte futbol oynamak ister misin?',
    prompt: '___ du zusammen Fußball spielen? (wollen)',
    answer: 'Willst',
    validation: START,
    pronounce: ['Willst du zusammen Fußball spielen?'],
  }),
  mv('mv-wollen-wir-fill', 'fill-blank', 'easy', 'recall', [WO_C], {
    familyId: 'mv-wollen-wir',
    instruction: 'Boşluğu doldur — Bir ev satın almak istiyoruz.',
    prompt: 'Wir ___ ein Haus kaufen. (wollen)',
    answer: 'wollen',
    validation: EXACT,
    pronounce: ['Wir wollen ein Haus kaufen.'],
  }),
  mv('mv-sollen-du-fill', 'fill-blank', 'easy', 'recall', [SO_C, SO], {
    familyId: 'mv-wasser',
    instruction: 'Boşluğu doldur — Su içmelisin.',
    prompt: 'Du ___ Wasser trinken. (sollen)',
    answer: 'sollst',
    validation: EXACT,
    pronounce: ['Du sollst Wasser trinken.'],
  }),
  mv('mv-sollen-er-fill', 'fill-blank', 'medium', 'recall', [SO_C, ICH_ER], {
    familyId: 'mv-sollen-er',
    instruction: 'Boşluğu doldur — O (erkek) ödevini yapmalı.',
    prompt: 'Er ___ seine Hausaufgaben machen. (sollen)',
    answer: 'soll',
    validation: EXACT,
    pronounce: ['Er soll seine Hausaufgaben machen.'],
  }),
  mv('mv-duerfen-du-fill', 'fill-blank', 'medium', 'recall', [DU_C, FRAGE, TRENN], {
    familyId: 'mv-duerfen-du',
    instruction: 'Boşluğu doldur — Bugün televizyon izleyebilir misin (izin var mı)?',
    prompt: '___ du heute fernsehen? (dürfen)',
    answer: 'Darfst',
    validation: START,
    pronounce: ['Darfst du heute fernsehen?'],
  }),
  mv('mv-duerfen-man-fill', 'fill-blank', 'easy', 'recall', [DU_C, MAN, VERBOT], {
    familyId: 'mv-duerfen-man',
    instruction: 'Boşluğu doldur — Sinemada sigara içmek yasak.',
    prompt: 'Im Kino ___ man nicht rauchen. (dürfen)',
    answer: 'darf',
    validation: EXACT,
    pronounce: ['Im Kino darf man nicht rauchen.'],
  }),
  mv('mv-duerfen-ihr-fill', 'fill-blank', 'hard', 'recall', [DU_C], {
    familyId: 'mv-duerfen-ihr',
    instruction: 'Boşluğu doldur — Siz (samimi, çoğul) burada park edemezsiniz.',
    prompt: 'Ihr ___ hier nicht parken. (dürfen)',
    answer: 'dürft',
    validation: EXACT_DE,
    pronounce: ['Ihr dürft hier nicht parken.'],
  }),
  mv('mv-koennen-tablo-match', 'matching', 'medium', 'recognition', [KO_C], {
    familyId: 'mv-koennen-tablo',
    instruction: '`können` — zamiri doğru biçimle eşleştir.',
    pairs: [
      { left: 'ich', right: 'kann' },
      { left: 'du', right: 'kannst' },
      { left: 'wir', right: 'können' },
      { left: 'ihr', right: 'könnt' },
    ],
  }),
  mv('mv-wollen-tablo-match', 'matching', 'medium', 'recognition', [WO_C], {
    familyId: 'mv-wollen-tablo',
    instruction: '`wollen` — zamiri doğru biçimle eşleştir.',
    pairs: [
      { left: 'ich', right: 'will' },
      { left: 'du', right: 'willst' },
      { left: 'wir', right: 'wollen' },
      { left: 'ihr', right: 'wollt' },
    ],
  }),
  mv('mv-duerfen-tablo-match', 'matching', 'medium', 'recognition', [DU_C], {
    familyId: 'mv-duerfen-tablo',
    instruction: '`dürfen` — zamiri doğru biçimle eşleştir.',
    pairs: [
      { left: 'ich', right: 'darf' },
      { left: 'du', right: 'darfst' },
      { left: 'wir', right: 'dürfen' },
      { left: 'ihr', right: 'dürft' },
    ],
  }),
  mv('mv-sollen-tablo-match', 'matching', 'medium', 'recognition', [SO_C], {
    familyId: 'mv-sollen-tablo',
    instruction: '`sollen` — zamiri doğru biçimle eşleştir.',
    pairs: [
      { left: 'ich', right: 'soll' },
      { left: 'du', right: 'sollst' },
      { left: 'wir', right: 'sollen' },
      { left: 'ihr', right: 'sollt' },
    ],
  }),

  /* ================================================================
   * Mastar sonda — boşluk ve sıralama
   * ================================================================ */
  mv('mv-mastar-sprechen-fill', 'fill-blank', 'easy', 'recall', [K, KO], {
    familyId: 'mv-deutsch',
    instruction: 'Mastarı yaz — Almanca konuşabiliyorum.',
    prompt: 'Ich kann Deutsch ___. (sprechen)',
    answer: 'sprechen',
    validation: EXACT,
    explanation: 'Modalverb çekilir (`kann`), asıl fiil mastar kalır: `sprechen` (spreche değil).',
    pronounce: ['Ich kann Deutsch sprechen.'],
  }),
  mv('mv-mastar-essen-fill', 'fill-blank', 'easy', 'recall', [K, MO], {
    familyId: 'mv-mastar-essen',
    instruction: 'Mastarı yaz — Pizza yemek istiyorum.',
    prompt: 'Ich möchte Pizza ___. (essen)',
    answer: 'essen',
    validation: EXACT,
    pronounce: ['Ich möchte Pizza essen.'],
  }),
  mv('mv-mastar-kaufen-fill', 'fill-blank', 'easy', 'recall', [K, WO], {
    familyId: 'mv-haus',
    instruction: 'Mastarı yaz — Babam bir ev satın almak istiyor.',
    prompt: 'Mein Vater will ein Haus ___. (kaufen)',
    answer: 'kaufen',
    validation: EXACT,
    pronounce: ['Mein Vater will ein Haus kaufen.'],
  }),
  mv('mv-mastar-machen-fill', 'fill-blank', 'easy', 'recall', [K, SO], {
    familyId: 'mv-hausaufgaben',
    instruction: 'Mastarı yaz — Ödevimi yapmalıyım.',
    prompt: 'Ich soll meine Hausaufgaben ___. (machen)',
    answer: 'machen',
    validation: EXACT,
    pronounce: ['Ich soll meine Hausaufgaben machen.'],
  }),
  mv('mv-mastar-klavier-fill', 'fill-blank', 'easy', 'recall', [K, KO], {
    familyId: 'mv-tante',
    instruction: 'Mastarı yaz — Teyzem piyano çalabiliyor.',
    prompt: 'Meine Tante kann Klavier ___. (spielen)',
    answer: 'spielen',
    validation: EXACT,
    pronounce: ['Meine Tante kann Klavier spielen.'],
  }),
  mv('mv-order-deutsch', 'ordering', 'medium', 'production', [K, KO, 'greetings.sprachen.antwort'], {
    familyId: 'mv-deutsch',
    instruction: 'Kelimeleri doğru sıraya diz — Biraz Almanca konuşabiliyorum.',
    prompt: 'Biraz Almanca konuşabiliyorum.',
    answer: 'Ich kann ein bisschen Deutsch sprechen.',
    pronounce: ['Ich kann ein bisschen Deutsch sprechen.'],
  }),
  mv('mv-order-fussball', 'ordering', 'medium', 'production', [K, KO, 'vocabulary.hobiler.kelime'], {
    familyId: 'mv-gut-fussball',
    instruction: 'Kelimeleri doğru sıraya diz — İyi futbol oynayabiliyoruz.',
    prompt: 'İyi futbol oynayabiliyoruz.',
    answer: 'Wir können gut Fußball spielen.',
    pronounce: ['Wir können gut Fußball spielen.'],
  }),
  mv('mv-order-haus', 'ordering', 'medium', 'production', [K, WO], {
    familyId: 'mv-haus',
    instruction: 'Kelimeleri doğru sıraya diz — Erkek kardeşim bir araba satın almak istiyor.',
    prompt: 'Erkek kardeşim bir araba satın almak istiyor.',
    answer: 'Mein Bruder will ein Auto kaufen.',
    pronounce: ['Mein Bruder will ein Auto kaufen.'],
  }),
  mv('mv-order-parken', 'ordering', 'medium', 'production', [VERBOT, MAN], {
    familyId: 'mv-parken',
    instruction: 'Kelimeleri doğru sıraya diz — Parkta sigara içmek yasak.',
    prompt: 'Parkta sigara içmek yasak.',
    answer: 'Im Park darf man nicht rauchen.',
    pronounce: ['Im Park darf man nicht rauchen.'],
  }),
  mv('mv-sb-tante', 'sentence-builder', 'medium', 'production', [K, KO], {
    familyId: 'mv-tante',
    instruction: 'Cümleyi kur — fazladan bir kelime var:',
    prompt: 'Teyzem piyano çalabiliyor.',
    answer: 'Meine Tante kann Klavier spielen.',
    pronounce: ['Meine Tante kann Klavier spielen.'],
  }),
  mv('mv-sb-hausaufgaben', 'sentence-builder', 'medium', 'production', [K, SO], {
    familyId: 'mv-hausaufgaben',
    instruction: 'Cümleyi kur — fazladan bir kelime var:',
    prompt: 'Ödevimi yapmalıyım.',
    answer: 'Ich soll meine Hausaufgaben machen.',
    pronounce: ['Ich soll meine Hausaufgaben machen.'],
  }),
  mv('mv-order-morgen-basta', 'ordering', 'hard', 'production', [K, TRENN, 'sentence-building.dizilisi.zaman-basta'], {
    familyId: 'mv-order-morgen',
    instruction: 'Zamanı başa alarak sırala — Yarın erken kalkmak istiyorum.',
    prompt: 'Yarın erken kalkmak istiyorum. (Morgen …)',
    answer: 'Morgen will ich früh aufstehen.',
    explanation: 'Zaman başa gelse de Modalverb ikinci sırada kalır; özne üçüncü sıraya geçer, mastar en sonda.',
    pronounce: ['Morgen will ich früh aufstehen.'],
  }),

  /* ================================================================
   * Türkçeden Almancaya — üretim
   * ================================================================ */
  mv('mv-tr-deutsch', 'free-text', 'medium', 'production', [KO], {
    familyId: 'mv-deutsch',
    instruction: 'Türkçeden Almancaya çevir:',
    prompt: 'Almanca konuşabiliyorum.',
    answer: 'Ich kann Deutsch sprechen.',
    pronounce: ['Ich kann Deutsch sprechen.'],
  }),
  mv('mv-tr-fussball', 'free-text', 'medium', 'production', [MO], {
    familyId: 'mv-tr-fussball',
    instruction: 'Türkçeden Almancaya çevir (kibar istek — möchten):',
    prompt: 'Futbol oynamak istiyorum.',
    answer: 'Ich möchte Fußball spielen.',
    validation: DE,
    pronounce: ['Ich möchte Fußball spielen.'],
  }),
  mv('mv-tr-haus', 'free-text', 'medium', 'production', [WO], {
    familyId: 'mv-haus',
    instruction: 'Türkçeden Almancaya çevir (plan — wollen):',
    prompt: 'Babam bir ev satın almak istiyor.',
    answer: 'Mein Vater will ein Haus kaufen.',
    pronounce: ['Mein Vater will ein Haus kaufen.'],
  }),
  mv('mv-tr-parken', 'free-text', 'medium', 'production', [VERBOT, MAN], {
    familyId: 'mv-parken',
    instruction: 'Türkçeden Almancaya çevir:',
    prompt: 'Burada park etmek yasak.',
    answer: 'Hier darf man nicht parken.',
    hint: '`dürfen` + `nicht` + genel özne `man`.',
    pronounce: ['Hier darf man nicht parken.'],
  }),
  mv('mv-tr-tanzen', 'free-text', 'medium', 'production', [KO, NICHT], {
    familyId: 'mv-tanzen',
    instruction: 'Türkçeden Almancaya çevir:',
    prompt: 'Biz dans edemiyoruz.',
    answer: 'Wir können nicht tanzen.',
    validation: DE,
    pronounce: ['Wir können nicht tanzen.'],
  }),
  mv('mv-tr-kochen-frage', 'free-text', 'hard', 'production', [FRAGE, KO], {
    familyId: 'mv-kochen',
    instruction: 'Türkçeden Almancaya çevir:',
    prompt: 'İyi yemek pişirebiliyor musun?',
    answer: 'Kannst du gut kochen?',
    pronounce: ['Kannst du gut kochen?'],
  }),
  mv('mv-tr-deutsch-lernen', 'free-text', 'medium', 'production', [MO], {
    familyId: 'mv-tr-lernen',
    instruction: 'Türkçeden Almancaya çevir:',
    prompt: 'Almanca öğrenmek istiyorum.',
    answer: 'Ich möchte Deutsch lernen.',
    acceptedAnswers: ['Ich will Deutsch lernen.'],
    validation: DE,
    pronounce: ['Ich möchte Deutsch lernen.'],
  }),
  mv('mv-tr-medikamente', 'free-text', 'hard', 'production', [SO, TRENN, 'separable-verbs.einnehmen'], {
    familyId: 'mv-medikamente',
    instruction: 'Türkçeden Almancaya çevir:',
    prompt: 'Her gün ilaçlarımı almalıyım.',
    answer: 'Ich soll täglich meine Medikamente einnehmen.',
    acceptedAnswers: ['Ich soll jeden Tag meine Medikamente einnehmen.'],
    validation: DE,
    explanation: '`einnehmen` ayrılabilen fiildir ama Modalverb ile bölünmez: mastar olarak en sonda.',
    pronounce: ['Ich soll täglich meine Medikamente einnehmen.'],
  }),
  mv('mv-tr-wasser', 'free-text', 'medium', 'production', [SO], {
    familyId: 'mv-wasser',
    instruction: 'Türkçeden Almancaya çevir (tavsiye — sollen):',
    prompt: 'Su içmelisin.',
    answer: 'Du sollst Wasser trinken.',
    pronounce: ['Du sollst Wasser trinken.'],
  }),
  mv('mv-tr-rauchen', 'free-text', 'medium', 'production', [VERBOT, MAN], {
    familyId: 'mv-tr-rauchen',
    instruction: 'Türkçeden Almancaya çevir:',
    prompt: 'Sinemada yemek yemek yasak.',
    answer: 'Im Kino darf man nicht essen.',
    pronounce: ['Im Kino darf man nicht essen.'],
  }),
  mv('mv-tr-darf-ich', 'free-text', 'medium', 'production', [DARF_ICH], {
    familyId: 'mv-darf-parken',
    instruction: 'Türkçeden Almancaya çevir (izin sor — dürfen):',
    prompt: 'Buraya park edebilir miyim?',
    answer: 'Darf ich hier parken?',
    pronounce: ['Darf ich hier parken?'],
  }),
  mv('mv-tr-etwas-essen', 'free-text', 'hard', 'production', [MO, FRAGE], {
    familyId: 'mv-etwas-essen',
    instruction: 'Türkçeden Almancaya çevir (resmî — Sie):',
    prompt: 'Bir şey yemek ister misiniz?',
    answer: 'Möchten Sie etwas essen?',
    validation: DE,
    pronounce: ['Möchten Sie etwas essen?'],
  }),
  mv('mv-tr-zusammen', 'free-text', 'hard', 'production', [WO, FRAGE], {
    familyId: 'mv-zusammen',
    instruction: 'Türkçeden Almancaya çevir (wollen):',
    prompt: 'Birlikte futbol oynamak ister misin?',
    answer: 'Willst du zusammen Fußball spielen?',
    validation: DE,
    pronounce: ['Willst du zusammen Fußball spielen?'],
  }),
  mv('mv-tr-lebensmittel', 'free-text', 'hard', 'production', [WO, TRENN, 'food.lebensmittel', 'separable-verbs.verb.einkaufen'], {
    familyId: 'mv-tr-lebensmittel',
    instruction: 'Türkçeden Almancaya çevir (wollen):',
    prompt: 'Annem yiyecek alışverişi yapmak istiyor.',
    answer: 'Meine Mutter will Lebensmittel einkaufen.',
    pronounce: ['Meine Mutter will Lebensmittel einkaufen.'],
  }),
  mv('mv-tr-name', 'free-text', 'hard', 'production', [FRAGE, KO, 'akkusativ.mein-meinen'], {
    familyId: 'mv-tr-name',
    instruction: 'Türkçeden Almancaya çevir (resmî — Sie):',
    prompt: 'Adınızı söyleyebilir misiniz?',
    answer: 'Können Sie Ihren Namen sagen?',
    validation: DE,
    explanation: '`der Name` nesne olunca `Ihren Namen` olur (Akkusativ; bu isim sonuna `-n` de alır).',
    pronounce: ['Können Sie Ihren Namen sagen?'],
  }),
  mv('mv-tr-nein-kochen', 'free-text', 'medium', 'production', [JA_NEIN, NICHT], {
    familyId: 'mv-nein-kochen',
    instruction: 'Türkçeden Almancaya çevir:',
    prompt: 'Hayır, yemek pişiremiyorum.',
    answer: 'Nein, ich kann nicht kochen.',
    pronounce: ['Nein, ich kann nicht kochen.'],
  }),
  mv('mv-tr-soll-einkaufen', 'free-text', 'hard', 'production', [SO, FRAGE, 'separable-verbs.verb.einkaufen'], {
    familyId: 'mv-soll-einkaufen',
    instruction: 'Türkçeden Almancaya çevir (sollen ile öneri sor):',
    prompt: 'Alışveriş yapayım mı?',
    answer: 'Soll ich einkaufen?',
    pronounce: ['Soll ich einkaufen?'],
  }),
  mv('mv-tr-gut-fussball', 'free-text', 'medium', 'production', [KO, 'vocabulary.hobiler.kelime'], {
    familyId: 'mv-gut-fussball',
    instruction: 'Türkçeden Almancaya çevir:',
    prompt: 'İyi futbol oynayabiliyorum.',
    answer: 'Ich kann gut Fußball spielen.',
    validation: DE,
    pronounce: ['Ich kann gut Fußball spielen.'],
  }),

  /* ================================================================
   * Kelime bankası — iki yönlü
   * ================================================================ */
  mv('mv-wb-schwimmen', 'word-bank-translation', 'easy', 'production', [KO], {
    familyId: 'mv-wb-schwimmen',
    instruction: 'Kutucuklarla kur — Yüzebiliyorum.',
    answer: 'Ich kann schwimmen.',
    wordBank: {
      direction: 'tr-to-de', sourceText: 'Yüzebiliyorum.', targetLanguage: 'de',
      tokens: tok('Ich', 'kann', 'schwimmen.', 'kannst', 'schwimme.'),
      acceptedSequences: [['Ich', 'kann', 'schwimmen.']],
    },
    pronounce: ['Ich kann schwimmen.'],
  }),
  mv('mv-wb-kaffee', 'word-bank-translation', 'easy', 'production', [MO, 'daily-routine.gunluk.kahve-spor'], {
    familyId: 'mv-wb-kaffee',
    instruction: 'Kutucuklarla kur — Kahve içmek istiyorum.',
    answer: 'Ich möchte Kaffee trinken.',
    wordBank: {
      direction: 'tr-to-de', sourceText: 'Kahve içmek istiyorum.', targetLanguage: 'de',
      tokens: tok('Ich', 'möchte', 'Kaffee', 'trinken.', 'trinke.', 'möchtest'),
      acceptedSequences: [['Ich', 'möchte', 'Kaffee', 'trinken.']],
    },
    pronounce: ['Ich möchte Kaffee trinken.'],
  }),
  mv('mv-wb-fahrrad', 'word-bank-translation', 'medium', 'production', [KO, 'vocabulary.hobiler.kelime'], {
    familyId: 'mv-wb-fahrrad',
    instruction: 'Kutucuklarla kur — Kız kardeşim bisiklet sürebiliyor.',
    answer: 'Meine Schwester kann Fahrrad fahren.',
    wordBank: {
      direction: 'tr-to-de', sourceText: 'Kız kardeşim bisiklet sürebiliyor.', targetLanguage: 'de',
      tokens: tok('Meine', 'Schwester', 'kann', 'Fahrrad', 'fahren.', 'fährt.', 'kannst'),
      acceptedSequences: [['Meine', 'Schwester', 'kann', 'Fahrrad', 'fahren.']],
    },
    pronounce: ['Meine Schwester kann Fahrrad fahren.'],
  }),
  mv('mv-wb-anrufen', 'word-bank-translation', 'hard', 'production', [TRENN, WO, 'separable-verbs.verb.anrufen'], {
    familyId: 'mv-wb-anrufen',
    instruction: 'Kutucuklarla kur — Kız kardeşimi aramak istiyorum.',
    answer: 'Ich will meine Schwester anrufen.',
    wordBank: {
      direction: 'tr-to-de', sourceText: 'Kız kardeşimi aramak istiyorum.', targetLanguage: 'de',
      tokens: tok('Ich', 'will', 'meine', 'Schwester', 'anrufen.', 'rufe', 'an.'),
      acceptedSequences: [['Ich', 'will', 'meine', 'Schwester', 'anrufen.']],
    },
    pronounce: ['Ich will meine Schwester anrufen.'],
  }),
  mv('mv-wb-museum', 'word-bank-translation', 'medium', 'production', [MO, 'vocabulary.museum'], {
    familyId: 'mv-wb-museum',
    instruction: 'Kutucuklarla kur — Müzeyi ziyaret etmek istiyorum.',
    answer: 'Ich möchte das Museum besuchen.',
    wordBank: {
      direction: 'tr-to-de', sourceText: 'Müzeyi ziyaret etmek istiyorum.', targetLanguage: 'de',
      tokens: tok('Ich', 'möchte', 'das', 'Museum', 'besuchen.', 'der', 'besuche.'),
      acceptedSequences: [['Ich', 'möchte', 'das', 'Museum', 'besuchen.']],
    },
    pronounce: ['Ich möchte das Museum besuchen.'],
  }),
  mv('mv-wb-soll-wasser-detr', 'word-bank-translation', 'medium', 'recognition', [SO], {
    familyId: 'mv-wb-soll-wasser',
    instruction: 'Türkçesini kutucuklarla kur (sollen):',
    answer: 'Her gün su içmeliyim.',
    wordBank: {
      direction: 'de-to-tr', sourceText: 'Ich soll täglich Wasser trinken.', targetLanguage: 'tr',
      tokens: tok('Her', 'gün', 'su', 'içmeliyim.', 'içebilirim.', 'istiyorum.'),
      acceptedSequences: [['Her', 'gün', 'su', 'içmeliyim.']],
    },
    audio: listen('Ich soll täglich Wasser trinken.'),
    pronounce: ['Ich soll täglich Wasser trinken.'],
  }),
  mv('mv-wb-klavier-detr', 'word-bank-translation', 'medium', 'recognition', [FRAGE, KO], {
    familyId: 'mv-wb-klavier',
    instruction: 'Türkçesini kutucuklarla kur (können ile soru):',
    answer: 'Piyano çalabiliyor musun?',
    wordBank: {
      direction: 'de-to-tr', sourceText: 'Kannst du Klavier spielen?', targetLanguage: 'tr',
      tokens: tok('Piyano', 'çalabiliyor', 'musun?', 'çalmak', 'istiyor'),
      acceptedSequences: [['Piyano', 'çalabiliyor', 'musun?']],
    },
    audio: listen('Kannst du Klavier spielen?'),
    pronounce: ['Kannst du Klavier spielen?'],
  }),

  /* ================================================================
   * Soru — Modalverb başa, mastar sonda
   * ================================================================ */
  mv('mv-frage-kochen', 'free-text', 'medium', 'production', [FRAGE], {
    familyId: 'mv-kochen',
    instruction: 'Soruya çevir:',
    prompt: 'Du kannst kochen.',
    answer: 'Kannst du kochen?',
    explanation: 'Evet/hayır sorusunda Modalverb başa gelir; mastar yine en sonda kalır.',
    pronounce: ['Kannst du kochen?'],
  }),
  mv('mv-frage-fussball', 'free-text', 'medium', 'production', [FRAGE, WO_C], {
    familyId: 'mv-frage-fussball',
    instruction: 'Soruya çevir:',
    prompt: 'Du willst Fußball spielen.',
    answer: 'Willst du Fußball spielen?',
    validation: DE,
    pronounce: ['Willst du Fußball spielen?'],
  }),
  mv('mv-frage-essen-sie', 'free-text', 'medium', 'production', [FRAGE, MO_C], {
    familyId: 'mv-etwas-essen',
    instruction: 'Soruya çevir:',
    prompt: 'Sie möchten etwas essen.',
    answer: 'Möchten Sie etwas essen?',
    validation: DE,
    pronounce: ['Möchten Sie etwas essen?'],
  }),
  mv('mv-frage-einkaufen', 'free-text', 'medium', 'production', [FRAGE, SO_C], {
    familyId: 'mv-soll-einkaufen',
    instruction: 'Soruya çevir:',
    prompt: 'Ich soll einkaufen.',
    answer: 'Soll ich einkaufen?',
    pronounce: ['Soll ich einkaufen?'],
  }),
  mv('mv-frage-parken', 'free-text', 'medium', 'production', [FRAGE, DARF_ICH], {
    familyId: 'mv-darf-parken',
    instruction: 'Soruya çevir:',
    prompt: 'Ich darf hier parken.',
    answer: 'Darf ich hier parken?',
    pronounce: ['Darf ich hier parken?'],
  }),
  mv('mv-ja-tanzen-fill', 'fill-blank', 'easy', 'recall', [JA_NEIN, KO_C], {
    familyId: 'mv-ja-tanzen',
    instruction: 'Tam cümleyle olumlu cevap ver:',
    prompt: 'Kannst du tanzen? — Ja, ich ___ tanzen.',
    answer: 'kann',
    validation: EXACT,
    pronounce: ['Ja, ich kann tanzen.'],
  }),
  mv('mv-nein-fussball', 'free-text', 'hard', 'production', [JA_NEIN, NICHT, MO_C], {
    familyId: 'mv-fussball-frage',
    instruction: 'Soruya tam cümleyle OLUMSUZ cevap ver:',
    prompt: 'Möchtest du Fußball spielen?',
    answer: 'Nein, ich möchte nicht Fußball spielen.',
    validation: DE,
    explanation: '`Fußball spielen` bir bütündür; olumsuzda `nicht` bu bütünün önüne gelir.',
    pronounce: ['Nein, ich möchte nicht Fußball spielen.'],
  }),
  mv('mv-w-was-essen', 'free-text', 'hard', 'production', [FRAGE, MO_C, 'questions.w-woerter'], {
    familyId: 'mv-w-was-essen',
    instruction: 'Türkçeden Almancaya çevir:',
    prompt: 'Ne yemek istersin?',
    answer: 'Was möchtest du essen?',
    validation: DE,
    explanation: 'W-sorusunda soru kelimesi başta, Modalverb ikinci sırada, mastar en sonda.',
    pronounce: ['Was möchtest du essen?'],
  }),

  /* ================================================================
   * Olumsuzluk — nicht sondaki mastarın önüne
   * ================================================================ */
  mv('mv-nicht-tanzen', 'free-text', 'medium', 'production', [NICHT], {
    familyId: 'mv-nicht-tanzen',
    instruction: 'Olumsuz yap:',
    prompt: 'Ich kann tanzen.',
    answer: 'Ich kann nicht tanzen.',
    pronounce: ['Ich kann nicht tanzen.'],
  }),
  mv('mv-nicht-lernen', 'free-text', 'medium', 'production', [NICHT], {
    familyId: 'mv-nicht-lernen',
    instruction: 'Olumsuz yap:',
    prompt: 'Ich möchte lernen.',
    answer: 'Ich möchte nicht lernen.',
    validation: DE,
    pronounce: ['Ich möchte nicht lernen.'],
  }),
  mv('mv-nicht-einkaufen', 'free-text', 'hard', 'production', [NICHT, TRENN, 'separable-verbs.verb.einkaufen'], {
    familyId: 'mv-nicht-einkaufen',
    instruction: 'Olumsuz yap:',
    prompt: 'Ich will morgen einkaufen.',
    answer: 'Ich will morgen nicht einkaufen.',
    pronounce: ['Ich will morgen nicht einkaufen.'],
  }),
  mv('mv-nicht-rauchen-fill', 'fill-blank', 'easy', 'recall', [NICHT, VERBOT, 'vocabulary.museum'], {
    familyId: 'mv-nicht-rauchen',
    instruction: 'Boşluğu doldur — Müzede yemek yemek yasak.',
    prompt: 'Im Museum darf man ___ essen.',
    answer: 'nicht',
    validation: EXACT,
    pronounce: ['Im Museum darf man nicht essen.'],
  }),
  mv('mv-nicht-aufstehen', 'free-text', 'hard', 'production', [NICHT, TRENN, 'separable-verbs.verb.aufstehen'], {
    familyId: 'mv-aufstehen',
    instruction: 'Olumsuz yap:',
    prompt: 'Ich will morgen früh aufstehen.',
    answer: 'Ich will morgen früh nicht aufstehen.',
    acceptedAnswers: ['Ich will nicht morgen früh aufstehen.'],
    validation: DE,
    explanation: 'En doğal sıra: `nicht` sondaki mastarın önüne gelir. `Ich will nicht morgen früh …` "yarın değil, başka zaman" vurgusu taşır.',
    pronounce: ['Ich will morgen früh nicht aufstehen.'],
  }),
  mv('mv-nicht-yeri-mc', 'multiple-choice', 'easy', 'recognition', [NICHT], {
    familyId: 'mv-nein-kochen',
    instruction: 'Doğru olumsuz cümle hangisi? — Yemek pişiremiyorum.',
    answer: 'Ich kann nicht kochen.',
    options: ['Ich kann nicht kochen.', 'Ich nicht kann kochen.', 'Ich kann kochen nicht.', 'Nicht ich kann kochen.'],
    pronounce: ['Ich kann nicht kochen.'],
  }),

  /* ================================================================
   * möchten ↔ wollen, sollen, dürfen + man
   * ================================================================ */
  mv('mv-moechte-suppe-mc', 'multiple-choice', 'medium', 'recognition', [WO_MO, MO, 'food.suppe-teller'], {
    familyId: 'mv-moechte-wollen',
    instruction: 'Restoranda garsona KİBARCA söyle:',
    prompt: 'Ich ___ eine Suppe, bitte.',
    answer: 'möchte',
    options: ['möchte', 'will', 'soll', 'darf'],
    explanation: 'Rica ederken `möchte` kibardır; `will` doğrudan ve serttir.',
    pronounce: ['Ich möchte eine Suppe, bitte.'],
  }),
  mv('mv-wollen-plan-mc', 'multiple-choice', 'medium', 'recognition', [WO_MO, WO], {
    familyId: 'mv-moechte-wollen-plan',
    instruction: 'Hangisi kararlı bir PLAN / niyet anlatır?',
    answer: 'Ich will ein Fahrrad kaufen.',
    options: ['Ich will ein Fahrrad kaufen.', 'Ich darf ein Fahrrad kaufen.', 'Ich soll ein Fahrrad kaufen.', 'Ich kann ein Fahrrad kaufen.'],
    pronounce: ['Ich will ein Fahrrad kaufen.'],
  }),
  mv('mv-schild-rauchen-mc', 'multiple-choice', 'easy', 'recognition', [VERBOT], {
    familyId: 'mv-rauchen',
    instruction: '🚭 Bu tabela ne söyler?',
    answer: 'Hier darf man nicht rauchen.',
    options: ['Hier darf man nicht rauchen.', 'Hier kann man rauchen.', 'Hier möchte man rauchen.', 'Hier soll man rauchen.'],
    pronounce: ['Hier darf man nicht rauchen.'],
  }),
  mv('mv-darf-ich-fill', 'fill-blank', 'medium', 'recall', [DARF_ICH, DU_C], {
    familyId: 'mv-darf-ich',
    instruction: 'İzin iste — Buraya oturabilir miyim?',
    prompt: '___ ich hier sitzen? (dürfen)',
    answer: 'Darf',
    validation: START,
    pronounce: ['Darf ich hier sitzen?'],
  }),
  mv('mv-man-fill', 'fill-blank', 'easy', 'recall', [MAN, VERBOT], {
    familyId: 'mv-man',
    instruction: 'Genel özneyi yaz — Okulda sigara içilmez.',
    prompt: 'In der Schule darf ___ nicht rauchen.',
    answer: 'man',
    validation: EXACT,
    explanation: '`man` = insan / kişi; herkes için geçerli kurallarda kullanılır ve 3. tekil gibi çekilir.',
    pronounce: ['In der Schule darf man nicht rauchen.'],
  }),

  /* ================================================================
   * Modalverb + ayrılabilen fiil — fiil bölünmez
   * ================================================================ */
  mv('mv-trenn-aufstehen-tr', 'free-text', 'hard', 'production', [TRENN, WO, 'separable-verbs.verb.aufstehen'], {
    familyId: 'mv-aufstehen',
    instruction: 'Türkçeden Almancaya çevir (wollen):',
    prompt: 'Yarın erken kalkmak istiyorum.',
    answer: 'Ich will morgen früh aufstehen.',
    acceptedAnswers: ['Morgen will ich früh aufstehen.'],
    validation: DE,
    explanation: 'Modalverb varsa `aufstehen` bölünmez: mastar tek kelime hâlinde en sona gider.',
    pronounce: ['Ich will morgen früh aufstehen.'],
  }),
  mv('mv-trenn-einkaufen', 'free-text', 'hard', 'production', [TRENN, MO, 'separable-verbs.verb.einkaufen', 'food.lebensmittel'], {
    familyId: 'mv-trenn-einkaufen',
    instruction: 'Modalverb ile yeniden yaz (möchten):',
    prompt: 'Ich kaufe Lebensmittel ein.',
    answer: 'Ich möchte Lebensmittel einkaufen.',
    validation: DE,
    pronounce: ['Ich möchte Lebensmittel einkaufen.'],
  }),
  mv('mv-trenn-anrufen', 'free-text', 'hard', 'production', [TRENN, WO, 'separable-verbs.verb.anrufen'], {
    familyId: 'mv-trenn-anrufen',
    instruction: 'Modalverb ile yeniden yaz (wollen):',
    prompt: 'Ich rufe meine Freundin an.',
    answer: 'Ich will meine Freundin anrufen.',
    pronounce: ['Ich will meine Freundin anrufen.'],
  }),
  mv('mv-trenn-fernsehen-fill', 'fill-blank', 'medium', 'recall', [TRENN, 'separable-verbs.verb.fernsehen'], {
    familyId: 'mv-trenn-fernsehen',
    instruction: 'Mastarı tek kelime olarak yaz — Akşam televizyon izlemek istiyorum.',
    prompt: 'Ich möchte am Abend ___. (fernsehen)',
    answer: 'fernsehen',
    validation: EXACT,
    pronounce: ['Ich möchte am Abend fernsehen.'],
  }),
  mv('mv-trenn-aufraeumen-fill', 'fill-blank', 'medium', 'recall', [TRENN, SO, 'separable-verbs.verb.aufraeumen'], {
    familyId: 'mv-trenn-aufraeumen',
    instruction: 'Mastarı tek kelime olarak yaz — Odamı toplamalıyım.',
    prompt: 'Ich soll mein Zimmer ___. (aufräumen)',
    answer: 'aufräumen',
    validation: EXACT_DE,
    pronounce: ['Ich soll mein Zimmer aufräumen.'],
  }),
  mv('mv-trenn-dogru-mc', 'multiple-choice', 'easy', 'recognition', [TRENN], {
    familyId: 'mv-frueh-aufstehen',
    instruction: 'Doğru cümle hangisi? — Erken kalkmak istiyorum.',
    answer: 'Ich will früh aufstehen.',
    options: ['Ich will früh aufstehen.', 'Ich will früh stehe auf.', 'Ich will früh aufstehe.', 'Ich will auf früh stehen.'],
    pronounce: ['Ich will früh aufstehen.'],
  }),
  mv('mv-trenn-error', 'error-correction', 'hard', 'correction', [TRENN], {
    familyId: 'mv-aufstehen',
    instruction: 'Hatayı düzelt:',
    prompt: 'Ich will morgen früh stehe auf.',
    answer: 'Ich will morgen früh aufstehen.',
    validation: DE,
    explanation: 'Modalverb (`will`) çekilir; `aufstehen` mastar olarak bölünmeden en sona gider.',
    pronounce: ['Ich will morgen früh aufstehen.'],
  }),
  mv('mv-trenn-einnehmen-order', 'ordering', 'hard', 'production', [TRENN, SO, 'separable-verbs.einnehmen'], {
    familyId: 'mv-medikamente',
    instruction: 'Kelimeleri doğru sıraya diz — Babam her gün ilaçlarını almalı.',
    prompt: 'Babam her gün ilaçlarını almalı.',
    answer: 'Mein Vater soll täglich seine Medikamente einnehmen.',
    pronounce: ['Mein Vater soll täglich seine Medikamente einnehmen.'],
  }),
  mv('mv-trenn-vorbereiten', 'free-text', 'hard', 'production', [TRENN, MO, 'separable-verbs.verb.vorbereiten', 'daily-routine.sabah.fruehstueck-fark'], {
    familyId: 'mv-trenn-vorbereiten',
    instruction: 'Türkçeden Almancaya çevir (möchten):',
    prompt: 'Kahvaltıyı hazırlamak istiyorum.',
    answer: 'Ich möchte das Frühstück vorbereiten.',
    validation: DE,
    pronounce: ['Ich möchte das Frühstück vorbereiten.'],
  }),
  mv('mv-trenn-einladen-wb', 'word-bank-translation', 'hard', 'production', [TRENN, MO, 'separable-verbs.verb.einladen'], {
    familyId: 'mv-trenn-einladen',
    instruction: 'Kutucuklarla kur — Arkadaşlarımı davet etmek istiyorum.',
    answer: 'Ich möchte meine Freunde einladen.',
    wordBank: {
      direction: 'tr-to-de', sourceText: 'Arkadaşlarımı davet etmek istiyorum.', targetLanguage: 'de',
      tokens: tok('Ich', 'möchte', 'meine', 'Freunde', 'einladen.', 'lade', 'ein.'),
      acceptedSequences: [['Ich', 'möchte', 'meine', 'Freunde', 'einladen.']],
    },
    pronounce: ['Ich möchte meine Freunde einladen.'],
  }),
  mv('mv-trenn-listen', 'listen-choice', 'easy', 'recognition', [TRENN, WO_C], {
    familyId: 'mv-frueh-aufstehen',
    instruction: 'Duyduğun cümleyi seç:',
    prompt: 'Ich will früh aufstehen.',
    audioText: 'Ich will früh aufstehen.',
    answer: 'Ich will früh aufstehen.',
    options: ['Ich will früh aufstehen.', 'Ich soll früh aufstehen.', 'Ich kann früh aufstehen.', 'Ich will früh aufwachen.'],
    audio: listen('Ich will früh aufstehen.'),
  }),

  /* ================================================================
   * Modalverb + Akkusativ — einen / den / meinen / ein
   * ================================================================ */
  mv('mv-akk-kuchen-fill', 'fill-blank', 'medium', 'recall', [AKK, 'akkusativ.ein-einen', 'food.yiyecek.kelimeler'], {
    familyId: 'mv-kuchen',
    instruction: 'Doğru artikeli yaz (der Kuchen) — Bir kek almak istiyorum.',
    prompt: 'Ich möchte ___ Kuchen kaufen.',
    answer: 'einen',
    validation: EXACT,
    explanation: '`der Kuchen` eril; nesne olunca `ein` → `einen` (Akkusativ).',
    pronounce: ['Ich möchte einen Kuchen kaufen.'],
  }),
  mv('mv-akk-haus-fill', 'fill-blank', 'medium', 'recall', [AKK, 'akkusativ.die-das'], {
    familyId: 'mv-haus',
    instruction: 'Doğru artikeli yaz (das Haus) — Babam bir ev almak istiyor.',
    prompt: 'Mein Vater will ___ Haus kaufen.',
    answer: 'ein',
    validation: EXACT,
    explanation: '`das Haus` nötr; Akkusativ\'te değişmez: `ein Haus`.',
    pronounce: ['Mein Vater will ein Haus kaufen.'],
  }),
  mv('mv-akk-brief-fill', 'fill-blank', 'medium', 'recall', [AKK, 'akkusativ.der-den', 'vocabulary.brief', 'vocabulary.schicken'], {
    familyId: 'mv-brief',
    instruction: 'Doğru artikeli yaz (der Brief) — Mektubu göndermek istiyorum.',
    prompt: 'Ich will ___ Brief schicken.',
    answer: 'den',
    validation: EXACT,
    pronounce: ['Ich will den Brief schicken.'],
  }),
  mv('mv-akk-schluessel-fill', 'fill-blank', 'hard', 'recall', [AKK, 'akkusativ.mein-meinen', 'vocabulary.schluessel', 'vocabulary.nehmen'], {
    familyId: 'mv-akk-schluessel',
    instruction: 'Doğru iyeliği yaz (dein Schlüssel) — Anahtarını almalısın.',
    prompt: 'Du sollst ___ Schlüssel nehmen.',
    answer: 'deinen',
    validation: EXACT,
    pronounce: ['Du sollst deinen Schlüssel nehmen.'],
  }),
  mv('mv-akk-error-kuchen', 'error-correction', 'hard', 'correction', [AKK, 'akkusativ.ein-einen'], {
    familyId: 'mv-kuchen',
    instruction: 'Hatayı düzelt:',
    prompt: 'Ich möchte ein Kuchen kaufen.',
    answer: 'Ich möchte einen Kuchen kaufen.',
    validation: DE,
    explanation: '`der Kuchen` eril: nesne olunca `einen Kuchen`.',
    pronounce: ['Ich möchte einen Kuchen kaufen.'],
  }),
  mv('mv-akk-tr-kuchen', 'free-text', 'hard', 'production', [AKK, MO, 'akkusativ.ein-einen'], {
    familyId: 'mv-kuchen',
    instruction: 'Türkçeden Almancaya çevir (möchten):',
    prompt: 'Bir kek satın almak istiyorum.',
    answer: 'Ich möchte einen Kuchen kaufen.',
    validation: DE,
    pronounce: ['Ich möchte einen Kuchen kaufen.'],
  }),
  mv('mv-akk-tr-brief', 'free-text', 'hard', 'production', [AKK, WO, 'akkusativ.der-den', 'vocabulary.schicken'], {
    familyId: 'mv-brief',
    instruction: 'Türkçeden Almancaya çevir (wollen):',
    prompt: 'Mektubu göndermek istiyorum.',
    answer: 'Ich will den Brief schicken.',
    acceptedAnswers: ['Ich möchte den Brief schicken.'],
    pronounce: ['Ich will den Brief schicken.'],
  }),
  mv('mv-akk-suppe-mc', 'multiple-choice', 'medium', 'recognition', [AKK, 'akkusativ.die-das', 'food.suppe-teller'], {
    familyId: 'mv-akk-suppe',
    instruction: 'Doğru biçimi seç (die Suppe):',
    prompt: 'Ich möchte ___ Suppe essen.',
    answer: 'eine',
    options: ['eine', 'einen', 'ein', 'einer'],
    explanation: '`die Suppe` dişil; Akkusativ\'te değişmez: `eine Suppe`.',
    pronounce: ['Ich möchte eine Suppe essen.'],
  }),
  mv('mv-akk-kein-kaffee', 'fill-blank', 'hard', 'recall', [AKK, NICHT, 'akkusativ.kein-keinen'], {
    familyId: 'mv-akk-kein-kaffee',
    instruction: 'Olumsuz artikeli yaz (der Kaffee) — Kahve içmek istemiyorum.',
    prompt: 'Ich möchte ___ Kaffee trinken.',
    answer: 'keinen',
    validation: EXACT,
    explanation: 'İsim olumsuzlanınca `kein` kullanılır; `der Kaffee` eril olduğu için `keinen`.',
    pronounce: ['Ich möchte keinen Kaffee trinken.'],
  }),
  mv('mv-akk-ticket-wb', 'word-bank-translation', 'medium', 'production', [AKK, MO, 'vocabulary.ticket', 'akkusativ.die-das'], {
    familyId: 'mv-akk-ticket',
    instruction: 'Kutucuklarla kur — Bir bilet almak istiyorum.',
    answer: 'Ich möchte ein Ticket kaufen.',
    wordBank: {
      direction: 'tr-to-de', sourceText: 'Bir bilet almak istiyorum.', targetLanguage: 'de',
      tokens: tok('Ich', 'möchte', 'ein', 'Ticket', 'kaufen.', 'einen', 'kaufe.'),
      acceptedSequences: [['Ich', 'möchte', 'ein', 'Ticket', 'kaufen.']],
    },
    pronounce: ['Ich möchte ein Ticket kaufen.'],
  }),
  mv('mv-akk-teller', 'free-text', 'hard', 'production', [AKK, FRAGE, 'akkusativ.der-den', 'food.suppe-teller', 'vocabulary.halten-tragen'], {
    familyId: 'mv-akk-teller',
    instruction: 'Türkçeden Almancaya çevir:',
    prompt: 'Tabağı tutabilir misin?',
    answer: 'Kannst du den Teller halten?',
    pronounce: ['Kannst du den Teller halten?'],
  }),

  /* ================================================================
   * Yeni kelimeler Modalverb cümlelerinde
   * ================================================================ */
  mv('mv-vok-fenster', 'free-text', 'medium', 'production', [WO, 'home.fenster-vorhang', 'vocabulary.reparieren'], {
    familyId: 'mv-vok-fenster',
    instruction: 'Türkçeden Almancaya çevir (wollen):',
    prompt: 'Babam pencereyi tamir etmek istiyor.',
    answer: 'Mein Vater will das Fenster reparieren.',
    pronounce: ['Mein Vater will das Fenster reparieren.'],
  }),
  mv('mv-vok-museum-gehen', 'free-text', 'hard', 'production', [WO, 'vocabulary.museum', 'places.kontraksiyon.ins'], {
    familyId: 'mv-vok-museum',
    instruction: 'Türkçeden Almancaya çevir (wollen):',
    prompt: 'Yarın müzeye gitmek istiyorum.',
    answer: 'Ich will morgen ins Museum gehen.',
    acceptedAnswers: ['Morgen will ich ins Museum gehen.'],
    pronounce: ['Ich will morgen ins Museum gehen.'],
  }),
  mv('mv-vok-lied-fill', 'fill-blank', 'medium', 'recall', [MO, 'vocabulary.lied-kleid'], {
    familyId: 'mv-vok-lied',
    instruction: 'Eksik ismi yaz — Bir şarkı dinlemek istiyorum.',
    prompt: 'Ich möchte ein ___ hören.',
    answer: 'Lied',
    validation: EXACT,
    pronounce: ['Ich möchte ein Lied hören.'],
  }),
  mv('mv-vok-frage-wiederholen', 'free-text', 'hard', 'production', [FRAGE, KO, 'vocabulary.frage-antwort', 'vocabulary.uebersetzen-wiederholen'], {
    familyId: 'mv-vok-frage',
    instruction: 'Türkçeden Almancaya çevir (derste kullanışlı):',
    prompt: 'Soruyu tekrar edebilir misin?',
    answer: 'Kannst du die Frage wiederholen?',
    pronounce: ['Kannst du die Frage wiederholen?'],
  }),
  mv('mv-vok-satz-uebersetzen', 'free-text', 'hard', 'production', [NICHT, KO, 'vocabulary.wort-satz', 'vocabulary.uebersetzen-wiederholen', 'akkusativ.der-den'], {
    familyId: 'mv-vok-satz',
    instruction: 'Türkçeden Almancaya çevir:',
    prompt: 'Cümleyi çeviremiyorum.',
    answer: 'Ich kann den Satz nicht übersetzen.',
    validation: DE,
    explanation: '`nicht` sondaki mastarın (`übersetzen`) önüne gelir; `der Satz` nesne → `den Satz`.',
    pronounce: ['Ich kann den Satz nicht übersetzen.'],
  }),
  mv('mv-vok-wort-sie-mc', 'multiple-choice', 'easy', 'recognition', [FRAGE, KO, 'vocabulary.uebersetzen-wiederholen', 'vocabulary.wort-satz'], {
    familyId: 'mv-vok-wort',
    instruction: 'Cümlenin anlamını seç:',
    prompt: 'Können Sie das Wort wiederholen?',
    answer: 'Kelimeyi tekrar edebilir misiniz?',
    options: ['Kelimeyi tekrar edebilir misiniz?', 'Kelimeyi çevirebilir misiniz?', 'Cümleyi açıklayabilir misiniz?', 'Kelimeyi yazmak ister misiniz?'],
    pronounce: ['Können Sie das Wort wiederholen?'],
  }),
  mv('mv-vok-fehler', 'free-text', 'hard', 'production', [SO, 'vocabulary.fehler-falsch', 'akkusativ.der-den'], {
    familyId: 'mv-vok-fehler',
    instruction: 'Türkçeden Almancaya çevir (sollen):',
    prompt: 'Hatayı düzeltmeliyim.',
    answer: 'Ich soll den Fehler korrigieren.',
    pronounce: ['Ich soll den Fehler korrigieren.'],
  }),
  mv('mv-vok-geschirr', 'free-text', 'medium', 'production', [SO, 'home.spuelen'], {
    familyId: 'mv-vok-geschirr',
    instruction: 'Türkçeden Almancaya çevir (sollen):',
    prompt: 'Bulaşıkları yıkamalıyım.',
    answer: 'Ich soll das Geschirr spülen.',
    validation: DE,
    pronounce: ['Ich soll das Geschirr spülen.'],
  }),
  mv('mv-vok-baby-dictation', 'dictation', 'hard', 'production', [FRAGE, KO, 'vocabulary.baby-nachbar', 'vocabulary.halten-tragen'], {
    familyId: 'mv-vok-baby',
    instruction: 'Duyduğun soruyu aynen yaz:',
    audioText: 'Kannst du das Baby halten?',
    answer: 'Kannst du das Baby halten?',
    audio: listen('Kannst du das Baby halten?'),
  }),
  mv('mv-vok-schluessel-verlieren', 'free-text', 'hard', 'production', [NICHT, WO, 'akkusativ.mein-meinen', 'vocabulary.verlieren'], {
    familyId: 'mv-vok-verlieren',
    instruction: 'Türkçeden Almancaya çevir (wollen):',
    prompt: 'Anahtarımı kaybetmek istemiyorum.',
    answer: 'Ich will meinen Schlüssel nicht verlieren.',
    validation: DE,
    pronounce: ['Ich will meinen Schlüssel nicht verlieren.'],
  }),
  mv('mv-vok-tasche-tragen', 'free-text', 'medium', 'production', [KO, 'vocabulary.halten-tragen', 'vocabulary.tasche-zeitung'], {
    familyId: 'mv-vok-tasche',
    instruction: 'Türkçeden Almancaya çevir:',
    prompt: 'Çantayı taşıyabilirim.',
    answer: 'Ich kann die Tasche tragen.',
    pronounce: ['Ich kann die Tasche tragen.'],
  }),
  mv('mv-vok-malen', 'free-text', 'medium', 'production', [KO, 'vocabulary.malen-tanzen'], {
    familyId: 'mv-vok-malen',
    instruction: 'Türkçeden Almancaya çevir:',
    prompt: 'Teyzem iyi resim yapabiliyor.',
    answer: 'Meine Tante kann gut malen.',
    pronounce: ['Meine Tante kann gut malen.'],
  }),
  mv('mv-vok-warten', 'free-text', 'hard', 'production', [KO, 'vocabulary.warten'], {
    familyId: 'mv-vok-warten',
    instruction: 'Türkçeden Almancaya çevir (warten auf):',
    prompt: 'Seni bekleyebilirim.',
    answer: 'Ich kann auf dich warten.',
    hint: 'Birini beklemek: `warten auf` + kişi (`auf dich`).',
    pronounce: ['Ich kann auf dich warten.'],
  }),

  /* ================================================================
   * Dinleme ve dikte
   * ================================================================ */
  mv('mv-listen-kann', 'listen-choice', 'easy', 'recognition', [KO], {
    familyId: 'mv-tante',
    instruction: 'Duyduğun cümleyi seç:',
    prompt: 'Meine Tante kann Klavier spielen.',
    audioText: 'Meine Tante kann Klavier spielen.',
    answer: 'Meine Tante kann Klavier spielen.',
    options: ['Meine Tante kann Klavier spielen.', 'Meine Tante will Klavier spielen.', 'Meine Tante soll Klavier spielen.', 'Meine Tante darf Klavier spielen.'],
    audio: listen('Meine Tante kann Klavier spielen.'),
  }),
  mv('mv-listen-moechtest', 'listen-choice', 'medium', 'recognition', [FRAGE, MO_C], {
    familyId: 'mv-fussball-frage',
    instruction: 'Duyduğun soruyu seç:',
    prompt: 'Möchtest du Fußball spielen?',
    audioText: 'Möchtest du Fußball spielen?',
    answer: 'Möchtest du Fußball spielen?',
    options: ['Möchtest du Fußball spielen?', 'Willst du Fußball spielen?', 'Kannst du Fußball spielen?', 'Möchten Sie Fußball spielen?'],
    audio: listen('Möchtest du Fußball spielen?'),
  }),
  mv('mv-dictation-parken', 'dictation', 'medium', 'production', [VERBOT, MAN], {
    familyId: 'mv-dictation-parken',
    instruction: 'Duyduğun yasak kuralını aynen yaz:',
    audioText: 'Hier darf man nicht schwimmen.',
    answer: 'Hier darf man nicht schwimmen.',
    audio: listen('Hier darf man nicht schwimmen.'),
  }),
  mv('mv-dictation-hausaufgaben', 'dictation', 'medium', 'production', [SO], {
    familyId: 'mv-hausaufgaben',
    instruction: 'Duyduğun görevi (sollen) aynen yaz:',
    audioText: 'Ich soll meine Hausaufgaben machen.',
    answer: 'Ich soll meine Hausaufgaben machen.',
    audio: listen('Ich soll meine Hausaufgaben machen.'),
  }),
  mv('mv-dictation-tanzen', 'dictation', 'medium', 'production', [KO_C, NICHT], {
    familyId: 'mv-tanzen',
    instruction: 'Duyduğun olumsuz cümleyi aynen yaz:',
    audioText: 'Wir können nicht tanzen.',
    answer: 'Wir können nicht tanzen.',
    validation: DE,
    audio: listen('Wir können nicht tanzen.'),
  }),

  /* ================================================================
   * Hata avı — sık yapılan Modalverb hataları
   * ================================================================ */
  mv('mv-err-spreche', 'error-correction', 'medium', 'correction', [K], {
    familyId: 'mv-deutsch',
    instruction: 'Hatayı düzelt:',
    prompt: 'Ich kann Deutsch spreche.',
    answer: 'Ich kann Deutsch sprechen.',
    explanation: 'Modalverb cümlesinde asıl fiil çekilmez; mastar kalır: `sprechen`.',
    pronounce: ['Ich kann Deutsch sprechen.'],
  }),
  mv('mv-err-sprichst', 'error-correction', 'hard', 'correction', [K, FRAGE], {
    familyId: 'mv-err-sprichst',
    instruction: 'Hatayı düzelt:',
    prompt: 'Kannst du Deutsch sprichst?',
    answer: 'Kannst du Deutsch sprechen?',
    explanation: 'Soruda da yalnızca Modalverb çekilir (`kannst`); asıl fiil mastar: `sprechen`.',
    pronounce: ['Kannst du Deutsch sprechen?'],
  }),
  mv('mv-err-man', 'error-correction', 'medium', 'correction', [MAN, VERBOT], {
    familyId: 'mv-rauchen',
    instruction: 'Hatayı düzelt:',
    prompt: 'Hier darf nicht rauchen.',
    answer: 'Hier darf man nicht rauchen.',
    explanation: 'Cümlenin öznesi eksik: genel kural için `man` gerekir.',
    pronounce: ['Hier darf man nicht rauchen.'],
  }),
  mv('mv-err-du-moechte', 'error-correction', 'medium', 'correction', [MO_C], {
    familyId: 'mv-err-du-moechte',
    instruction: 'Hatayı düzelt:',
    prompt: 'Du möchte Kaffee trinken.',
    answer: 'Du möchtest Kaffee trinken.',
    validation: DE,
    explanation: '`du` ile `-st`: `du möchtest`.',
    pronounce: ['Du möchtest Kaffee trinken.'],
  }),
  mv('mv-err-kannt', 'error-correction', 'medium', 'correction', [ICH_ER, KO_C], {
    familyId: 'mv-err-kannt',
    instruction: 'Hatayı düzelt:',
    prompt: 'Er kannt schwimmen.',
    answer: 'Er kann schwimmen.',
    explanation: 'Modalverblerde `er/sie/es` biçimi `ich` ile aynıdır ve ek almaz: `er kann`.',
    pronounce: ['Er kann schwimmen.'],
  }),
  mv('mv-err-order', 'error-correction', 'medium', 'correction', [K], {
    familyId: 'mv-err-order',
    instruction: 'Kelime sırasını düzelt:',
    prompt: 'Ich möchte essen Pizza.',
    answer: 'Ich möchte Pizza essen.',
    explanation: 'Mastar her zaman cümlenin en sonundadır.',
    pronounce: ['Ich möchte Pizza essen.'],
  }),

  /* ================================================================
   * Serbest üretim ve sesli görev
   * ================================================================ */
  mv('mv-free-koennen', 'free-text', 'hard', 'production', [KO, NICHT], {
    familyId: 'mv-free-koennen',
    instruction: 'Neler yapabildiğini 4 cümleyle anlat (`können`, en az biri olumsuz).',
    prompt: '4 cümle: yapabildiğin 3 şey + yapamadığın 1 şey.',
    answer: 'Ich kann Deutsch sprechen. Ich kann gut kochen. Ich kann Fußball spielen. Ich kann nicht tanzen.',
    validation: DE,
    openEnded: true,
    hint: 'Kalıp: `Ich kann … + mastar.` / `Ich kann nicht … + mastar.`',
    sampleAnswer: 'Ich kann Deutsch sprechen. Ich kann gut kochen. Ich kann Fußball spielen. Ich kann nicht tanzen.',
    explanation: 'Model cevapla karşılaştır. Farklı ama doğru cümlelerin varsa “yine de doğruydu” diyebilirsin.',
  }),
  mv('mv-free-wuensche', 'free-text', 'hard', 'production', [MO, WO], {
    familyId: 'mv-free-wuensche',
    instruction: 'Neler yapmak istediğini 3 cümleyle yaz (`möchten` / `wollen`).',
    prompt: '3 cümle: istediğin / planladığın şeyler.',
    answer: 'Ich möchte Deutsch lernen. Ich möchte eine Pizza essen. Ich will ein Fahrrad kaufen.',
    validation: DE,
    openEnded: true,
    hint: 'Kibar istek: `Ich möchte …`, plan: `Ich will …` — mastar en sonda.',
    sampleAnswer: 'Ich möchte Deutsch lernen. Ich möchte eine Pizza essen. Ich will ein Fahrrad kaufen.',
    explanation: 'Model cevapla karşılaştır. Farklı ama doğru cümlelerin varsa “yine de doğruydu” diyebilirsin.',
  }),
  mv('mv-free-morgen', 'free-text', 'hard', 'production', [WO, TRENN, 'separable-verbs.mit-modal'], {
    familyId: 'mv-free-morgen',
    instruction: 'Yarın yapmak istediğin üç şeyi yaz — en az biri ayrılabilen fiil olsun.',
    prompt: '3 cümle: yarınki planın (`will` / `möchte` + mastar).',
    answer: 'Ich will morgen früh aufstehen. Ich möchte meine Schwester anrufen. Ich will Lebensmittel einkaufen.',
    validation: DE,
    openEnded: true,
    hint: 'Ayrılabilen fiil Modalverb ile bölünmez: `Ich will … aufstehen.`',
    sampleAnswer: 'Ich will morgen früh aufstehen. Ich möchte meine Schwester anrufen. Ich will Lebensmittel einkaufen.',
    explanation: 'Model cevapla karşılaştır. Farklı ama doğru cümlelerin varsa “yine de doğruydu” diyebilirsin.',
  }),
  mv('mv-spoken-regeln', 'spoken', 'medium', 'speaking', [VERBOT, SO, KO], {
    familyId: 'mv-spoken-regeln',
    instruction: 'Sesli görev — Modalverblerle kendini ve evini anlat.',
    requirements: [
      'Yapabildiğin iki şeyi söyle (`Ich kann …`).',
      'Evinde yasak olan bir şeyi söyle (`Hier darf man nicht …`).',
      'Yapman gereken bir işi söyle (`Ich soll …`).',
      'Yarınki bir planını söyle (`Ich will morgen …`).',
    ],
    sampleAnswer: 'Ich kann Deutsch sprechen. Ich kann gut kochen. Hier darf man nicht rauchen. Ich soll mein Zimmer aufräumen. Ich will morgen früh aufstehen.',
  }),
];

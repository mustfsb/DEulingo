/**
 * Genel Tekrar — Fiiller/Çekimler (28) + Saat/Zaman/Sayılar (28).
 */

import type { AuthoredExercise } from '../types.ts';
import { DE_PROD, G } from './generalReviewBase.ts';

const FII = 'private.day1.fiil-cekimi';
const KON = 'private.day1.kontakt-formular';
const P2H = 'private.day2.haben-sein';
const P2O = 'private.day2.cumle-olumlu';
const P3M = 'private.day3.mogen-moechten-gern';
const P3E = 'private.day3.es-gibt';
const P3R = 'private.day3.refleksif';
const P3C = 'private.day3.cumle-dizilisi';
const P5L = 'private.day5.leben';
const P5O = 'private.day5.sayilar-onluklar';
const P5Y = 'private.day5.sayilar-yuzler';
const P3Z = 'private.day3.zaman';
const P7B = 'private.day7.brauchen';
const P7F = 'private.day7.yeni-fiiller';
const P10K = 'private.day10.kern-verben';
const P10F = 'private.day10.uhrzeit-frage';
const P10R = 'private.day10.uhrzeit-resmi';
const P10G = 'private.day10.uhrzeit-gunluk';
const P10H = 'private.day10.halb-viertel';
const P10U = 'private.day10.um-uhr';

export const GENERAL_REVIEW_VERBS_TIME: AuthoredExercise[] = [
  /* ---------- sein / haben çekimi (6) ---------- */
  G('gr-fiil-sein-du-alt', FII, 'fill-blank', 'easy', 'recall', ['private.day1.verben.sein'], {
    instruction: '`sein` fiilini çek:', prompt: 'Du ___ achtzehn Jahre alt.',
    answer: 'bist', explanation: '`du` + `sein` → `bist`.',
    pronounce: ['Du bist achtzehn Jahre alt.'],
  }),
  G('gr-fiil-sein-wir-berlin', FII, 'fill-blank', 'easy', 'recall', ['private.day1.verben.sein'], {
    instruction: '`sein` fiilini çek:', prompt: 'Wir ___ in Sakarya.',
    answer: 'sind', explanation: '`wir` + `sein` → `sind`.',
    pronounce: ['Wir sind in Sakarya.'],
  }),
  G('gr-fiil-haben-er-hunger', P2H, 'fill-blank', 'easy', 'recall', ['private.day2.haben.tablo'], {
    instruction: '`haben` fiilini çek:', prompt: 'Er ___ Hunger.',
    answer: 'hat', explanation: '`er` + `haben` → `hat`. Açlık `haben` ile söylenir.',
    pronounce: ['Er hat Hunger.'],
  }),
  G('gr-fiil-haben-ihr-zeit', P2H, 'fill-blank', 'medium', 'recall', ['private.day2.haben.tablo'], {
    instruction: '`haben` fiilini çek:', prompt: '___ ihr Zeit? (Vaktiniz var mı?)',
    answer: 'Habt', acceptedAnswers: ['habt'], explanation: '`ihr` + `haben` → `habt`.',
    validation: { ...DE_PROD, caseSensitive: false },
  }),
  G('gr-fiil-sein-sie-lehrerin', FII, 'free-text', 'medium', 'production', ['private.day1.verben.sein'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Siz öğretmensiniz. (resmî)',
    answer: 'Sie sind Lehrerin.', acceptedAnswers: ['Sie sind Lehrer.', 'Sie sind Lehrerin'],
    validation: DE_PROD, pronounce: ['Sie sind Lehrerin.'],
  }),
  G('gr-fiil-haben-wir-kein-auto', P2H, 'free-text', 'medium', 'production', ['private.day2.haben.kein-ile'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Arabamız yok.',
    answer: 'Wir haben kein Auto.', acceptedAnswers: ['Wir haben kein Auto'],
    validation: DE_PROD, pronounce: ['Wir haben kein Auto.'],
  }),

  /* ---------- e → i düzensizleri (5) ---------- */
  G('gr-fiil-isst-du-pizza', FII, 'fill-blank', 'medium', 'recall', ['private.day1.verben.essen'], {
    instruction: '`essen` fiilini çek:', prompt: 'Was ___ du gern? (Ne yemeyi seversin?)',
    answer: 'isst', explanation: '`essen` → `du isst` (e → i).',
    pronounce: ['Was isst du gern?'],
  }),
  G('gr-fiil-sprichst-englisch', FII, 'fill-blank', 'medium', 'recall', ['private.day1.verben.sprechen'], {
    instruction: '`sprechen` fiilini çek:', prompt: '___ du Englisch? (İngilizce konuşuyor musun?)',
    answer: 'Sprichst', acceptedAnswers: ['sprichst'],
    explanation: '`sprechen` → `du sprichst` (e → i).',
  }),
  G('gr-fiil-gibt-er-mir', P7F, 'fill-blank', 'medium', 'recall', ['private.day7.fiil.geben-gibt'], {
    instruction: '`geben` fiilini çek:', prompt: 'Er ___ mir das Buch. (Kitabı bana veriyor.)',
    answer: 'gibt', explanation: '`geben` → `er gibt` (e → i).',
    pronounce: ['Er gibt mir das Buch.'],
  }),
  G('gr-fiil-siehst-fern', P10K, 'fill-blank', 'medium', 'recall', ['private.day10.verb.fernsehen'], {
    instruction: '`fernsehen` fiilini çek:', prompt: 'Du ___ am Abend fern.',
    answer: 'siehst', explanation: '`fernsehen` → `du siehst ... fern` (e → ie).',
    pronounce: ['Du siehst am Abend fern.'],
  }),
  G('gr-fiil-error-essst', FII, 'error-correction', 'medium', 'correction', ['private.day1.verben.essen'], {
    instruction: 'Çekim hatasını düzelt:', prompt: 'Du esst gern Pizza.',
    answer: 'Du isst gern Pizza.',
    explanation: '`essen` fiilinde `du` ile e → i olur: `du isst`.',
    pronounce: ['Du isst gern Pizza.'],
  }),

  /* ---------- mögen / möchten / gern (5) ---------- */
  G('gr-fiil-mag-kahve', P3M, 'free-text', 'medium', 'production', ['private.day3.mogen.cekim', 'private.day3.mogen-gern-farki'], {
    instruction: 'Türkçeden Almancaya çevir (`mögen` kullan):', prompt: 'Kahveyi severim.',
    answer: 'Ich mag Kaffee.', acceptedAnswers: ['Ich mag Kaffee'],
    validation: DE_PROD, pronounce: ['Ich mag Kaffee.'],
  }),
  G('gr-fiil-moichte-tee', P3M, 'free-text', 'medium', 'production', ['private.day3.moechten.cekim'], {
    instruction: 'Türkçeden Almancaya çevir (`möchten` kullan):', prompt: 'Bir kahve istiyorum.',
    answer: 'Ich möchte einen Kaffee.', acceptedAnswers: ['Ich möchte einen Kaffee'],
    validation: DE_PROD, hint: 'Kahve eril: `der Kaffee` → istekte `einen Kaffee`.',
  }),
  G('gr-fiil-gern-schwimmen', P3M, 'free-text', 'medium', 'production', ['private.day3.gern.kullanim'], {
    instruction: 'Türkçeden Almancaya çevir (`gern` kullan):', prompt: 'Yüzmeyi severim.',
    answer: 'Ich schwimme gern.', acceptedAnswers: ['Ich schwimme gern'],
    validation: DE_PROD, pronounce: ['Ich schwimme gern.'],
  }),
  G('gr-fiil-nicht-gern-reis', P3M, 'free-text', 'medium', 'production', ['private.day3.gern.kullanim'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Pilavı sevmem.',
    answer: 'Ich esse nicht gern Reis.', acceptedAnswers: ['Ich esse nicht gern Reis', 'Ich mag Reis nicht.'],
    validation: DE_PROD, pronounce: ['Ich esse nicht gern Reis.'],
  }),
  G('gr-fiil-mag-gern-fark', P3M, 'multiple-choice', 'medium', 'recognition', ['private.day3.mogen-gern-farki'], {
    instruction: 'Doğru cümleyi seç:', prompt: '“Futbolu severim” demek istiyorsun.',
    answer: 'Ich mag Fußball.',
    options: ['Ich mag Fußball.', 'Ich fußballe gern mag.', 'Ich gern mag Fußball.', 'Mag ich Fußball gern.'],
    pronounce: ['Ich mag Fußball.'],
  }),

  /* ---------- Günlük fiiller (6) ---------- */
  G('gr-fiil-lebe-seit', P5L, 'free-text', 'medium', 'production', ['private.day5.leben.cekim'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: '2019’dan beri Sakarya’da yaşıyorum.',
    answer: 'Ich lebe seit 2019 in Sakarya.', acceptedAnswers: ['Ich lebe seit 2019 in Sakarya'],
    validation: DE_PROD, pronounce: ['Ich lebe seit 2019 in Sakarya.'],
  }),
  G('gr-fiil-wohnen-leben-fark', P5L, 'multiple-choice', 'medium', 'recognition', ['private.day5.leben.wohnen-farki'], {
    instruction: 'Doğru cümleyi seç:', prompt: '“İstanbul’da oturuyorum” (somut ikamet).',
    answer: 'Ich wohne in Istanbul.',
    options: ['Ich wohne in Istanbul.', 'Ich lebe in Istanbul Haus.', 'Ich wohne Istanbul.', 'Ich bin wohne in Istanbul.'],
  }),
  G('gr-fiil-brauche-milch', P7B, 'free-text', 'medium', 'production', ['private.day7.brauchen.antwort'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Süte ihtiyacım var.',
    answer: 'Ich brauche Milch.', acceptedAnswers: ['Ich brauche Milch'],
    validation: DE_PROD, pronounce: ['Ich brauche Milch.'],
  }),
  G('gr-fiil-kaufe-brot', P2O, 'free-text', 'easy', 'production', ['private.day3.alisveris.kelime'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Her gün ekmek alıyorum.',
    answer: 'Ich kaufe jeden Tag Brot.', acceptedAnswers: ['Ich kaufe jeden Tag Brot'],
    validation: DE_PROD, pronounce: ['Ich kaufe jeden Tag Brot.'],
  }),
  G('gr-fiil-kenne-ihn', P7F, 'free-text', 'medium', 'production', ['private.day7.fiil.kennen', 'private.day7.fiil.kennen-cekim'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Onu tanıyorum. (erkek)',
    answer: 'Ich kenne ihn.', acceptedAnswers: ['Ich kenne ihn'],
    validation: DE_PROD, pronounce: ['Ich kenne ihn.'],
  }),
  G('gr-fiil-error-komme-wohne', P2O, 'error-correction', 'medium', 'correction', ['private.day2.cumle.olumlu-yapi'], {
    instruction: 'Fiil hatasını düzelt:', prompt: 'Ich wohnen in Sakarya.',
    answer: 'Ich wohne in Sakarya.',
    explanation: '`ich` öznesi fiile `-e` takısı ister: `wohne`.',
  }),

  /* ---------- es gibt (3) ---------- */
  G('gr-esgibt-park', P3E, 'free-text', 'medium', 'production', ['private.day3.esgibt.temel', 'private.day3.esgibt.akkusativ'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Parkta bir kedi var.',
    answer: 'Es gibt eine Katze im Park.', acceptedAnswers: ['Es gibt eine Katze im Park'],
    validation: DE_PROD, pronounce: ['Es gibt eine Katze im Park.'],
  }),
  G('gr-esgibt-kein-brot', P3E, 'free-text', 'hard', 'production', ['private.day3.esgibt.temel'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Evde ekmek yok.',
    answer: 'Es gibt kein Brot zu Hause.', acceptedAnswers: ['Es gibt kein Brot zu Hause'],
    validation: DE_PROD, hint: 'Ekmek nötrdür: `das Brot` → `kein Brot`.',
  }),
  G('gr-esgibt-mc-akk', P3E, 'multiple-choice', 'medium', 'recognition', ['private.day3.esgibt.akkusativ'], {
    instruction: 'Doğru cümleyi seç:', prompt: 'Bahçede bir köpek var.',
    answer: 'Es gibt einen Hund im Garten.',
    options: ['Es gibt einen Hund im Garten.', 'Es gibt ein Hund im Garten.', 'Es gibt der Hund im Garten.', 'Es gibt einen Hund in Garten.'],
    pronounce: ['Es gibt einen Hund im Garten.'],
  }),

  /* ---------- Refleksif (2) ---------- */
  G('gr-refl-dusche-mich', P3R, 'fill-blank', 'medium', 'recall', ['private.day3.sich-duschen'], {
    instruction: 'Refleksif zamiri yaz:', prompt: 'Ich dusche ___ .',
    answer: 'mich', explanation: '`ich` → `mich`: `Ich dusche mich.`',
    pronounce: ['Ich dusche mich.'],
  }),
  G('gr-refl-gesicht', P3R, 'free-text', 'medium', 'production', ['private.day10.sabah.gesicht'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Yüzümü yıkıyorum.',
    answer: 'Ich wasche mein Gesicht.', acceptedAnswers: ['Ich wasche mein Gesicht'],
    validation: DE_PROD, pronounce: ['Ich wasche mein Gesicht.'],
  }),

  /* ---------- Fiil hep ikinci sırada (1) ---------- */
  G('gr-v2-heute-gehe', P3C, 'free-text', 'hard', 'production', ['private.day3.dizilisi.verb-ikinci', 'private.day3.dizilisi.zaman-basta'], {
    instruction: 'Türkçeden Almancaya çevir (zaman başta):', prompt: 'Bugün okula gidiyorum.',
    answer: 'Heute gehe ich zur Schule.', acceptedAnswers: ['Heute gehe ich zur Schule'],
    validation: DE_PROD, explanation: 'Zaman başa gelince fiil hemen ardından gelir: `Heute gehe ich ...`.',
    pronounce: ['Heute gehe ich zur Schule.'],
  }),

  /* ================= SAAT / ZAMAN / SAYI (28) ================= */
  G('gr-saat-halb-neun', P10H, 'multiple-choice', 'easy', 'recognition', ['private.day10.halb.anlam'], {
    instruction: 'Doğru saati seç:', prompt: '08:30 → günlük',
    answer: 'Es ist halb neun.',
    options: ['Es ist halb neun.', 'Es ist halb acht.', 'Es ist halb zehn.', 'Es ist neun Uhr dreißig.'],
    pronounce: ['Es ist halb neun.'],
  }),
  G('gr-saat-halb-elf', P10H, 'free-text', 'medium', 'production', ['private.day10.halb.ornek'], {
    instruction: 'Günlük söyleyişle yaz:', prompt: '10:30 → ______',
    answer: 'Es ist halb elf.', acceptedAnswers: ['Es ist halb elf'],
    validation: DE_PROD, explanation: '`halb elf` = 10:30 — `halb` bir sonrakini söyler.',
    pronounce: ['Es ist halb elf.'],
  }),
  G('gr-saat-halb-fb', P10H, 'fill-blank', 'medium', 'recall', ['private.day10.halb.ornek'], {
    instruction: 'Boşluğu tamamla (04:30):', prompt: 'Es ist halb ___.',
    answer: 'fünf', explanation: '04:30 → `halb fünf`.',
  }),
  G('gr-saat-viertel-nach', P10G, 'free-text', 'medium', 'production', ['private.day10.gunluk.viertel'], {
    instruction: 'Günlük söyleyişle yaz:', prompt: '07:15 → ______',
    answer: 'Es ist Viertel nach sieben.', acceptedAnswers: ['Es ist Viertel nach sieben'],
    validation: DE_PROD, pronounce: ['Es ist Viertel nach sieben.'],
  }),
  G('gr-saat-viertel-vor', P10G, 'free-text', 'medium', 'production', ['private.day10.gunluk.viertel'], {
    instruction: 'Günlük söyleyişle yaz:', prompt: '07:45 → ______',
    answer: 'Es ist Viertel vor acht.', acceptedAnswers: ['Es ist Viertel vor acht'],
    validation: DE_PROD, pronounce: ['Es ist Viertel vor acht.'],
  }),
  G('gr-saat-zehn-vor-drei', P10G, 'free-text', 'hard', 'production', ['private.day10.gunluk.nach-vor'], {
    instruction: 'Günlük söyleyişle yaz:', prompt: '14:50 → ______',
    answer: 'Es ist zehn vor drei.', acceptedAnswers: ['Es ist zehn vor drei'],
    validation: DE_PROD, pronounce: ['Es ist zehn vor drei.'],
  }),
  G('gr-saat-yirmibes-geciyor', P10G, 'multiple-choice', 'hard', 'recognition', ['private.day10.gunluk.nach-vor'], {
    instruction: 'Doğru günlük karşılığı seç:', prompt: '17:25 → günlük',
    answer: 'Es ist fünfundzwanzig nach fünf.',
    options: ['Es ist fünfundzwanzig nach fünf.', 'Es ist fünfundzwanzig vor fünf.', 'Es ist halb sechs.', 'Es ist fünf nach halb sechs.'],
    explanation: '25 geçe = `fünfundzwanzig nach fünf`.',
  }),
  G('gr-saat-resmi-1940', P10R, 'free-text', 'medium', 'production', ['private.day10.resmi.kural'], {
    instruction: 'Resmî söyleyişle yaz:', prompt: '19:40 → ______',
    answer: 'Es ist neunzehn Uhr vierzig.', acceptedAnswers: ['Es ist neunzehn Uhr vierzig'],
    validation: DE_PROD, pronounce: ['Es ist neunzehn Uhr vierzig.'],
  }),
  G('gr-saat-resmi-0815', P10R, 'free-text', 'medium', 'production', ['private.day10.resmi.ornek'], {
    instruction: 'Resmî söyleyişle yaz:', prompt: '08:15 → ______',
    answer: 'Es ist acht Uhr fünfzehn.', acceptedAnswers: ['Es ist acht Uhr fünfzehn'],
    validation: DE_PROD, pronounce: ['Es ist acht Uhr fünfzehn.'],
  }),
  G('gr-saat-gunlukten-resmi', P10G, 'free-text', 'hard', 'production', ['private.day10.gunluk.viertel', 'private.day10.resmi.kural'], {
    instruction: 'Resmî söyleyişe çevir:', prompt: '“Es ist Viertel nach sechs.” (akşam) → ______',
    answer: 'Es ist achtzehn Uhr fünfzehn.', acceptedAnswers: ['Es ist achtzehn Uhr fünfzehn'],
    validation: DE_PROD,
  }),
  G('gr-saat-um-acht', P10U, 'free-text', 'medium', 'production', ['private.day10.um.kural'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Saat 8’de okula gidiyorum.',
    answer: 'Ich gehe um acht Uhr zur Schule.', acceptedAnswers: ['Ich gehe um acht Uhr zur Schule'],
    validation: DE_PROD, pronounce: ['Ich gehe um acht Uhr zur Schule.'],
  }),
  G('gr-saat-um-halb', P10U, 'free-text', 'hard', 'production', ['private.day10.um.kural', 'private.day10.halb.anlam'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Saat 7.30’da kahvaltı ediyorum.',
    answer: 'Ich frühstücke um halb acht.', acceptedAnswers: ['Ich frühstücke um halb acht'],
    validation: DE_PROD, pronounce: ['Ich frühstücke um halb acht.'],
  }),
  G('gr-saat-error-um', P10U, 'error-correction', 'medium', 'correction', ['private.day10.um.kural'], {
    instruction: 'Eksik kelimeyi ekleyerek düzelt:', prompt: 'Wir stehen sieben Uhr auf.',
    answer: 'Wir stehen um sieben Uhr auf.',
    explanation: 'Saatin başına `um` gelir: `um sieben Uhr`.',
  }),
  G('gr-saat-wie-spaet', P10F, 'multiple-choice', 'easy', 'recognition', ['private.day10.soru.wie-spaet'], {
    instruction: '“Saat kaç?” diye soruyorsun. Hangisi doğrudur?', prompt: 'Saat sorma kalıbı:',
    answer: 'Wie spät ist es?',
    options: ['Wie spät ist es?', 'Wie viel spät ist es?', 'Was spät ist es?', 'Wie ist die Uhr?'],
    pronounce: ['Wie spät ist es?'],
  }),
  G('gr-saat-wie-viel-uhr', P10F, 'multiple-choice', 'easy', 'recognition', ['private.day10.soru.wie-viel'], {
    instruction: '“Saat kaç?” diye soruyorsun. Hangisi doğrudur?', prompt: 'Saat sorma kalıbı (2):',
    answer: 'Wie viel Uhr ist es?',
    options: ['Wie viel Uhr ist es?', 'Wie viele Uhr ist es?', 'Was Uhr ist es?', 'Wie Uhr viel ist es?'],
    pronounce: ['Wie viel Uhr ist es?'],
  }),
  G('gr-saat-einheiten', P10F, 'matching', 'easy', 'recognition', ['private.day10.soru.einheiten'], {
    instruction: 'Zaman birimini eşleştir:',
    pairs: [
      { left: 'die Stunde', right: 'saat (süre)' },
      { left: 'die Minute', right: 'dakika' },
      { left: 'die Sekunde', right: 'saniye' },
      { left: 'die Uhr', right: 'saat (vakit)' },
    ],
    pronounce: ['die Stunde', 'die Minute', 'die Sekunde', 'die Uhr'],
  }),
  G('gr-zaman-am-abend', P3Z, 'fill-blank', 'easy', 'recall', ['private.day3.zaman.am'], {
    instruction: 'Doğru edatı yaz:', prompt: '___ Abend sehe ich fern. (Akşam televizyon izliyorum.)',
    answer: 'Am', acceptedAnswers: ['am', 'Am'],
    explanation: '`am Abend` — gün bölümlerinde `am`.',
  }),
  G('gr-zaman-im-winter', P3Z, 'fill-blank', 'easy', 'recall', ['private.day3.zaman.im-mevsim'], {
    instruction: 'Doğru edatı yaz:', prompt: '___ Winter ist es kalt. (Kışın hava soğuktur.)',
    answer: 'Im', acceptedAnswers: ['im', 'Im'],
    explanation: 'Mevsimlerde `im`: `im Winter`.',
  }),
  G('gr-zaman-morgen-der', P3Z, 'multiple-choice', 'medium', 'recognition', ['private.day3.zaman.morgen-cift-anlam'], {
    instruction: 'Doğru cümleyi seç:', prompt: '“Yarın okula gidiyorum.”',
    answer: 'Morgen gehe ich zur Schule.',
    options: ['Morgen gehe ich zur Schule.', 'Der Morgen gehe ich zur Schule.', 'Morgen ich gehe zur Schule.', 'Morgens gehe ich zur Schule Haus.'],
    explanation: 'Yarın = küçük harfle `morgen`; `der Morgen` sabah demektir.',
  }),
  G('gr-zaman-jeden-tag', P2O, 'free-text', 'easy', 'production', ['private.day2.zaman.jeden-tag-heute'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Her sabah kahve içiyorum.',
    answer: 'Ich trinke jeden Morgen Kaffee.', acceptedAnswers: ['Ich trinke jeden Morgen Kaffee'],
    validation: DE_PROD, pronounce: ['Ich trinke jeden Morgen Kaffee.'],
  }),
  G('gr-sayi-47', P5O, 'free-text', 'medium', 'production', ['private.day5.sayilar.bilesik'], {
    instruction: 'Sayıyı Almanca yazıyla yaz:', prompt: '47 → ______',
    answer: 'siebenundvierzig', acceptedAnswers: ['Siebenundvierzig'],
    explanation: 'Birler + `und` + onlar: `siebenundvierzig`.',
  }),
  G('gr-sayi-63', P5O, 'free-text', 'medium', 'production', ['private.day5.sayilar.bilesik'], {
    instruction: 'Sayıyı Almanca yazıyla yaz:', prompt: '63 → ______',
    answer: 'dreiundsechzig', acceptedAnswers: ['Dreiundsechzig'],
  }),
  G('gr-sayi-82mc', P5O, 'multiple-choice', 'easy', 'recognition', ['private.day5.sayilar.onluklar'], {
    instruction: 'Doğru yazımı seç:', prompt: '82 → ?',
    answer: 'zweiundachtzig',
    options: ['zweiundachtzig', 'achtundzwanzig', 'zweiachtzig', 'zwanzig und zwei'],
  }),
  G('gr-sayi-150', P5Y, 'free-text', 'medium', 'production', ['private.day5.sayilar.yuzler'], {
    instruction: 'Sayıyı Almanca yazıyla yaz:', prompt: '150 → ______',
    answer: 'hundertfünfzig', acceptedAnswers: ['Hundertfünfzig'],
  }),
  G('gr-sayi-320', P5Y, 'free-text', 'hard', 'production', ['private.day5.sayilar.yuzler', 'private.day5.sayilar.yuzler-bilesik'], {
    instruction: 'Sayıyı Almanca yazıyla yaz:', prompt: '320 → ______',
    answer: 'dreihundertzwanzig', acceptedAnswers: ['Dreihundertzwanzig'],
    explanation: 'Yüzlerde araya `und` girmez: `dreihundertzwanzig`.',
  }),
  G('gr-sayi-telefon', KON, 'dictation', 'medium', 'production', ['private.day1.kontakt.telefon'], {
    instruction: 'Duyduğun numarayı rakamla yaz:',
    audioText: 'Meine Telefonnummer ist fünfzehn dreiundzwanzig.',
    answer: '15 23', acceptedAnswers: ['1523', '15 23', '15-23'],
    audio: { prompt: { text: 'Meine Telefonnummer ist fünfzehn dreiundzwanzig.', language: 'de-DE', role: 'prompt' } },
  }),
  G('gr-saat-dinle-viertel', P10G, 'listen-choice', 'medium', 'recognition', ['private.day10.gunluk.viertel'], {
    instruction: 'Duyduğun saati seç:',
    prompt: 'Es ist Viertel vor neun.',
    audioText: 'Es ist Viertel vor neun.',
    answer: 'Es ist Viertel vor neun.',
    options: ['Es ist Viertel vor neun.', 'Es ist Viertel nach neun.', 'Es ist halb neun.', 'Es ist neun Uhr.'],
    audio: { prompt: { text: 'Es ist Viertel vor neun.', language: 'de-DE', role: 'prompt' } },
    pronounce: ['Es ist Viertel vor neun.'],
  }),
  G('gr-saat-dikte-resmi', P10R, 'dictation', 'hard', 'production', ['private.day10.resmi.kural'], {
    instruction: 'Duyduğun resmî saat cümlesini aynen yaz:',
    audioText: 'Es ist zwanzig Uhr fünfzehn.',
    answer: 'Es ist zwanzig Uhr fünfzehn.',
    audio: { prompt: { text: 'Es ist zwanzig Uhr fünfzehn.', language: 'de-DE', role: 'prompt' } },
    validation: DE_PROD, pronounce: ['Es ist zwanzig Uhr fünfzehn.'],
  }),
];

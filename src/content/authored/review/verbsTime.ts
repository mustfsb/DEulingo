/**
 * Genel Tekrar — Fiiller/Çekimler (28) + Saat/Zaman/Sayılar (28).
 */

import type { AuthoredExercise } from '../types.ts';
import { T } from '../../curriculum/topics.ts';
import { DE_PROD, G } from './base.ts';

export const GENERAL_REVIEW_VERBS_TIME: AuthoredExercise[] = [
  /* ---------- sein / haben çekimi (6) ---------- */
  G('gr-fiil-sein-du-alt', T.verbs, 'fill-blank', 'easy', 'recall', ['verbs.verben.sein'], {
    instruction: '`sein` fiilini çek:', prompt: 'Du ___ achtzehn Jahre alt.',
    answer: 'bist', explanation: '`du` + `sein` → `bist`.',
    pronounce: ['Du bist achtzehn Jahre alt.'],
  }),
  G('gr-fiil-sein-wir-berlin', T.verbs, 'fill-blank', 'easy', 'recall', ['verbs.verben.sein'], {
    instruction: '`sein` fiilini çek:', prompt: 'Wir ___ in Sakarya.',
    answer: 'sind', explanation: '`wir` + `sein` → `sind`.',
    pronounce: ['Wir sind in Sakarya.'],
  }),
  G('gr-fiil-haben-er-hunger', T.verbs, 'fill-blank', 'easy', 'recall', ['verbs.haben.tablo'], {
    instruction: '`haben` fiilini çek:', prompt: 'Er ___ Hunger.',
    answer: 'hat', explanation: '`er` + `haben` → `hat`. Açlık `haben` ile söylenir.',
    pronounce: ['Er hat Hunger.'],
  }),
  G('gr-fiil-haben-ihr-zeit', T.verbs, 'fill-blank', 'medium', 'recall', ['verbs.haben.tablo'], {
    instruction: '`haben` fiilini çek:', prompt: '___ ihr Zeit? (Vaktiniz var mı?)',
    answer: 'Habt', acceptedAnswers: ['habt'], explanation: '`ihr` + `haben` → `habt`.',
    validation: { ...DE_PROD, caseSensitive: false },
  }),
  G('gr-fiil-sein-sie-lehrerin', T.verbs, 'free-text', 'medium', 'production', ['verbs.verben.sein'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Siz öğretmensiniz. (resmî)',
    answer: 'Sie sind Lehrerin.', acceptedAnswers: ['Sie sind Lehrer.', 'Sie sind Lehrerin'],
    validation: DE_PROD, pronounce: ['Sie sind Lehrerin.'],
  }),
  G('gr-fiil-haben-wir-kein-auto', T.verbs, 'free-text', 'medium', 'production', ['verbs.haben.kein-ile'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Arabamız yok.',
    answer: 'Wir haben kein Auto.', acceptedAnswers: ['Wir haben kein Auto'],
    validation: DE_PROD, pronounce: ['Wir haben kein Auto.'],
  }),

  /* ---------- e → i düzensizleri (5) ---------- */
  G('gr-fiil-isst-du-pizza', T.verbs, 'fill-blank', 'medium', 'recall', ['verbs.verben.essen'], {
    instruction: '`essen` fiilini çek:', prompt: 'Was ___ du gern? (Ne yemeyi seversin?)',
    answer: 'isst', explanation: '`essen` → `du isst` (e → i).',
    pronounce: ['Was isst du gern?'],
  }),
  G('gr-fiil-sprichst-englisch', T.verbs, 'fill-blank', 'medium', 'recall', ['verbs.verben.sprechen'], {
    instruction: '`sprechen` fiilini çek:', prompt: '___ du Englisch? (İngilizce konuşuyor musun?)',
    answer: 'Sprichst', acceptedAnswers: ['sprichst'],
    explanation: '`sprechen` → `du sprichst` (e → i).',
  }),
  G('gr-fiil-gibt-er-mir', T.verbs, 'fill-blank', 'medium', 'recall', ['verbs.fiil.geben-gibt'], {
    instruction: '`geben` fiilini çek:', prompt: 'Er ___ mir das Buch. (Kitabı bana veriyor.)',
    answer: 'gibt', explanation: '`geben` → `er gibt` (e → i).',
    pronounce: ['Er gibt mir das Buch.'],
  }),
  G('gr-fiil-siehst-fern', T.separableVerbs, 'fill-blank', 'medium', 'recall', ['separable-verbs.verb.fernsehen'], {
    instruction: '`fernsehen` fiilini çek:', prompt: 'Du ___ am Abend fern.',
    answer: 'siehst', explanation: '`fernsehen` → `du siehst ... fern` (e → ie).',
    pronounce: ['Du siehst am Abend fern.'],
  }),
  G('gr-fiil-error-essst', T.verbs, 'error-correction', 'medium', 'correction', ['verbs.verben.essen'], {
    instruction: 'Çekim hatasını düzelt:', prompt: 'Du esst gern Pizza.',
    answer: 'Du isst gern Pizza.',
    explanation: '`essen` fiilinde `du` ile e → i olur: `du isst`.',
    pronounce: ['Du isst gern Pizza.'],
  }),

  /* ---------- mögen / möchten / gern (5) ---------- */
  G('gr-fiil-mag-kahve', T.likes, 'free-text', 'medium', 'production', ['likes.mogen.cekim', 'likes.mogen-gern-farki'], {
    instruction: 'Türkçeden Almancaya çevir (`mögen` kullan):', prompt: 'Kahveyi severim.',
    answer: 'Ich mag Kaffee.', acceptedAnswers: ['Ich mag Kaffee'],
    validation: DE_PROD, pronounce: ['Ich mag Kaffee.'],
  }),
  G('gr-fiil-moichte-tee', T.modalVerbs, 'free-text', 'medium', 'production', ['modal-verbs.moechten.cekim'], {
    instruction: 'Türkçeden Almancaya çevir (`möchten` kullan):', prompt: 'Bir kahve istiyorum.',
    answer: 'Ich möchte einen Kaffee.', acceptedAnswers: ['Ich möchte einen Kaffee'],
    validation: DE_PROD, hint: 'Kahve eril: `der Kaffee` → istekte `einen Kaffee`.',
  }),
  G('gr-fiil-gern-schwimmen', T.likes, 'free-text', 'medium', 'production', ['likes.gern.kullanim'], {
    instruction: 'Türkçeden Almancaya çevir (`gern` kullan):', prompt: 'Yüzmeyi severim.',
    answer: 'Ich schwimme gern.', acceptedAnswers: ['Ich schwimme gern'],
    validation: DE_PROD, pronounce: ['Ich schwimme gern.'],
  }),
  G('gr-fiil-nicht-gern-reis', T.likes, 'free-text', 'medium', 'production', ['likes.gern.kullanim'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Pilavı sevmem.',
    answer: 'Ich esse nicht gern Reis.', acceptedAnswers: ['Ich esse nicht gern Reis', 'Ich mag Reis nicht.'],
    validation: DE_PROD, pronounce: ['Ich esse nicht gern Reis.'],
  }),
  G('gr-fiil-mag-gern-fark', T.likes, 'multiple-choice', 'medium', 'recognition', ['likes.mogen-gern-farki'], {
    instruction: 'Doğru cümleyi seç:', prompt: '“Futbolu severim” demek istiyorsun.',
    answer: 'Ich mag Fußball.',
    options: ['Ich mag Fußball.', 'Ich fußballe gern mag.', 'Ich gern mag Fußball.', 'Mag ich Fußball gern.'],
    pronounce: ['Ich mag Fußball.'],
  }),

  /* ---------- Günlük fiiller (6) ---------- */
  G('gr-fiil-lebe-seit', T.personalInfo, 'free-text', 'medium', 'production', ['personal-info.leben.cekim'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: '2019’dan beri Sakarya’da yaşıyorum.',
    answer: 'Ich lebe seit 2019 in Sakarya.', acceptedAnswers: ['Ich lebe seit 2019 in Sakarya'],
    validation: DE_PROD, pronounce: ['Ich lebe seit 2019 in Sakarya.'],
  }),
  G('gr-fiil-wohnen-leben-fark', T.personalInfo, 'multiple-choice', 'medium', 'recognition', ['personal-info.leben.wohnen-farki'], {
    instruction: 'Doğru cümleyi seç:', prompt: '“İstanbul’da oturuyorum” (somut ikamet).',
    answer: 'Ich wohne in Istanbul.',
    options: ['Ich wohne in Istanbul.', 'Ich lebe in Istanbul Haus.', 'Ich wohne Istanbul.', 'Ich bin wohne in Istanbul.'],
  }),
  G('gr-fiil-brauche-milch', T.shopping, 'free-text', 'medium', 'production', ['shopping.brauchen.antwort'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Süte ihtiyacım var.',
    answer: 'Ich brauche Milch.', acceptedAnswers: ['Ich brauche Milch'],
    validation: DE_PROD, pronounce: ['Ich brauche Milch.'],
  }),
  G('gr-fiil-kaufe-brot', T.sentenceBuilding, 'free-text', 'easy', 'production', ['shopping.alisveris.kelime'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Her gün ekmek alıyorum.',
    answer: 'Ich kaufe jeden Tag Brot.', acceptedAnswers: ['Ich kaufe jeden Tag Brot'],
    validation: DE_PROD, pronounce: ['Ich kaufe jeden Tag Brot.'],
  }),
  G('gr-fiil-kenne-ihn', T.verbs, 'free-text', 'medium', 'production', ['verbs.fiil.kennen', 'verbs.fiil.kennen-cekim'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Onu tanıyorum. (erkek)',
    answer: 'Ich kenne ihn.', acceptedAnswers: ['Ich kenne ihn'],
    validation: DE_PROD, pronounce: ['Ich kenne ihn.'],
  }),
  G('gr-fiil-error-komme-wohne', T.sentenceBuilding, 'error-correction', 'medium', 'correction', ['sentence-building.cumle.olumlu-yapi'], {
    instruction: 'Fiil hatasını düzelt:', prompt: 'Ich wohnen in Sakarya.',
    answer: 'Ich wohne in Sakarya.',
    explanation: '`ich` öznesi fiile `-e` takısı ister: `wohne`.',
  }),

  /* ---------- es gibt (3) ---------- */
  G('gr-esgibt-park', T.akkusativ, 'free-text', 'medium', 'production', ['akkusativ.esgibt.temel', 'akkusativ.esgibt.akkusativ'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Parkta bir kedi var.',
    answer: 'Es gibt eine Katze im Park.', acceptedAnswers: ['Es gibt eine Katze im Park'],
    validation: DE_PROD, pronounce: ['Es gibt eine Katze im Park.'],
  }),
  G('gr-esgibt-kein-brot', T.akkusativ, 'free-text', 'hard', 'production', ['akkusativ.esgibt.temel'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Evde ekmek yok.',
    answer: 'Es gibt kein Brot zu Hause.', acceptedAnswers: ['Es gibt kein Brot zu Hause'],
    validation: DE_PROD, hint: 'Ekmek nötrdür: `das Brot` → `kein Brot`.',
  }),
  G('gr-esgibt-mc-akk', T.akkusativ, 'multiple-choice', 'medium', 'recognition', ['akkusativ.esgibt.akkusativ'], {
    instruction: 'Doğru cümleyi seç:', prompt: 'Bahçede bir köpek var.',
    answer: 'Es gibt einen Hund im Garten.',
    options: ['Es gibt einen Hund im Garten.', 'Es gibt ein Hund im Garten.', 'Es gibt der Hund im Garten.', 'Es gibt einen Hund in Garten.'],
    pronounce: ['Es gibt einen Hund im Garten.'],
  }),

  /* ---------- Refleksif (2) ---------- */
  G('gr-refl-dusche-mich', T.verbs, 'fill-blank', 'medium', 'recall', ['verbs.sich-duschen'], {
    instruction: 'Refleksif zamiri yaz:', prompt: 'Ich dusche ___ .',
    answer: 'mich', explanation: '`ich` → `mich`: `Ich dusche mich.`',
    pronounce: ['Ich dusche mich.'],
  }),
  G('gr-refl-gesicht', T.verbs, 'free-text', 'medium', 'production', ['daily-routine.sabah.gesicht'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Yüzümü yıkıyorum.',
    answer: 'Ich wasche mein Gesicht.', acceptedAnswers: ['Ich wasche mein Gesicht'],
    validation: DE_PROD, pronounce: ['Ich wasche mein Gesicht.'],
  }),

  /* ---------- Fiil hep ikinci sırada (1) ---------- */
  G('gr-v2-heute-gehe', T.sentenceBuilding, 'free-text', 'hard', 'production', ['sentence-building.dizilisi.verb-ikinci', 'sentence-building.dizilisi.zaman-basta'], {
    instruction: 'Türkçeden Almancaya çevir (zaman başta):', prompt: 'Bugün okula gidiyorum.',
    answer: 'Heute gehe ich zur Schule.', acceptedAnswers: ['Heute gehe ich zur Schule'],
    validation: DE_PROD, explanation: 'Zaman başa gelince fiil hemen ardından gelir: `Heute gehe ich ...`.',
    pronounce: ['Heute gehe ich zur Schule.'],
  }),

  /* ================= SAAT / ZAMAN / SAYI (28) ================= */
  G('gr-saat-halb-neun', T.time, 'multiple-choice', 'easy', 'recognition', ['time.halb.anlam'], {
    instruction: 'Doğru saati seç:', prompt: '08:30 → günlük',
    answer: 'Es ist halb neun.',
    options: ['Es ist halb neun.', 'Es ist halb acht.', 'Es ist halb zehn.', 'Es ist neun Uhr dreißig.'],
    pronounce: ['Es ist halb neun.'],
  }),
  G('gr-saat-halb-elf', T.time, 'free-text', 'medium', 'production', ['time.halb.ornek'], {
    instruction: 'Günlük söyleyişle yaz:', prompt: '10:30 → ______',
    answer: 'Es ist halb elf.', acceptedAnswers: ['Es ist halb elf'],
    validation: DE_PROD, explanation: '`halb elf` = 10:30 — `halb` bir sonrakini söyler.',
    pronounce: ['Es ist halb elf.'],
  }),
  G('gr-saat-halb-fb', T.time, 'fill-blank', 'medium', 'recall', ['time.halb.ornek'], {
    instruction: 'Boşluğu tamamla (04:30):', prompt: 'Es ist halb ___.',
    answer: 'fünf', explanation: '04:30 → `halb fünf`.',
  }),
  G('gr-saat-viertel-nach', T.time, 'free-text', 'medium', 'production', ['time.gunluk.viertel'], {
    instruction: 'Günlük söyleyişle yaz:', prompt: '07:15 → ______',
    answer: 'Es ist Viertel nach sieben.', acceptedAnswers: ['Es ist Viertel nach sieben'],
    validation: DE_PROD, pronounce: ['Es ist Viertel nach sieben.'],
  }),
  G('gr-saat-viertel-vor', T.time, 'free-text', 'medium', 'production', ['time.gunluk.viertel'], {
    instruction: 'Günlük söyleyişle yaz:', prompt: '07:45 → ______',
    answer: 'Es ist Viertel vor acht.', acceptedAnswers: ['Es ist Viertel vor acht'],
    validation: DE_PROD, pronounce: ['Es ist Viertel vor acht.'],
  }),
  G('gr-saat-zehn-vor-drei', T.time, 'free-text', 'hard', 'production', ['time.gunluk.nach-vor'], {
    instruction: 'Günlük söyleyişle yaz:', prompt: '14:50 → ______',
    answer: 'Es ist zehn vor drei.', acceptedAnswers: ['Es ist zehn vor drei'],
    validation: DE_PROD, pronounce: ['Es ist zehn vor drei.'],
  }),
  G('gr-saat-yirmibes-geciyor', T.time, 'multiple-choice', 'hard', 'recognition', ['time.gunluk.nach-vor'], {
    instruction: 'Doğru günlük karşılığı seç:', prompt: '17:25 → günlük',
    answer: 'Es ist fünfundzwanzig nach fünf.',
    options: ['Es ist fünfundzwanzig nach fünf.', 'Es ist fünfundzwanzig vor fünf.', 'Es ist halb sechs.', 'Es ist fünf nach halb sechs.'],
    explanation: '25 geçe = `fünfundzwanzig nach fünf`.',
  }),
  G('gr-saat-resmi-1940', T.time, 'free-text', 'medium', 'production', ['time.resmi.kural'], {
    instruction: 'Resmî söyleyişle yaz:', prompt: '19:40 → ______',
    answer: 'Es ist neunzehn Uhr vierzig.', acceptedAnswers: ['Es ist neunzehn Uhr vierzig'],
    validation: DE_PROD, pronounce: ['Es ist neunzehn Uhr vierzig.'],
  }),
  G('gr-saat-resmi-0815', T.time, 'free-text', 'medium', 'production', ['time.resmi.ornek'], {
    instruction: 'Resmî söyleyişle yaz:', prompt: '08:15 → ______',
    answer: 'Es ist acht Uhr fünfzehn.', acceptedAnswers: ['Es ist acht Uhr fünfzehn'],
    validation: DE_PROD, pronounce: ['Es ist acht Uhr fünfzehn.'],
  }),
  G('gr-saat-gunlukten-resmi', T.time, 'free-text', 'hard', 'production', ['time.gunluk.viertel', 'time.resmi.kural'], {
    instruction: 'Resmî söyleyişe çevir:', prompt: '“Es ist Viertel nach sechs.” (akşam) → ______',
    answer: 'Es ist achtzehn Uhr fünfzehn.', acceptedAnswers: ['Es ist achtzehn Uhr fünfzehn'],
    validation: DE_PROD,
  }),
  G('gr-saat-um-acht', T.time, 'free-text', 'medium', 'production', ['time.um.kural'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Saat 8’de okula gidiyorum.',
    answer: 'Ich gehe um acht Uhr zur Schule.', acceptedAnswers: ['Ich gehe um acht Uhr zur Schule'],
    validation: DE_PROD, pronounce: ['Ich gehe um acht Uhr zur Schule.'],
  }),
  G('gr-saat-um-halb', T.time, 'free-text', 'hard', 'production', ['time.um.kural', 'time.halb.anlam'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Saat 7.30’da kahvaltı ediyorum.',
    answer: 'Ich frühstücke um halb acht.', acceptedAnswers: ['Ich frühstücke um halb acht'],
    validation: DE_PROD, pronounce: ['Ich frühstücke um halb acht.'],
  }),
  G('gr-saat-error-um', T.time, 'error-correction', 'medium', 'correction', ['time.um.kural'], {
    instruction: 'Eksik kelimeyi ekleyerek düzelt:', prompt: 'Wir stehen sieben Uhr auf.',
    answer: 'Wir stehen um sieben Uhr auf.',
    explanation: 'Saatin başına `um` gelir: `um sieben Uhr`.',
  }),
  G('gr-saat-wie-spaet', T.time, 'multiple-choice', 'easy', 'recognition', ['time.soru.wie-spaet'], {
    instruction: '“Saat kaç?” diye soruyorsun. Hangisi doğrudur?', prompt: 'Saat sorma kalıbı:',
    answer: 'Wie spät ist es?',
    options: ['Wie spät ist es?', 'Wie viel spät ist es?', 'Was spät ist es?', 'Wie ist die Uhr?'],
    pronounce: ['Wie spät ist es?'],
  }),
  G('gr-saat-wie-viel-uhr', T.time, 'multiple-choice', 'easy', 'recognition', ['time.soru.wie-viel'], {
    instruction: '“Saat kaç?” diye soruyorsun. Hangisi doğrudur?', prompt: 'Saat sorma kalıbı (2):',
    answer: 'Wie viel Uhr ist es?',
    options: ['Wie viel Uhr ist es?', 'Wie viele Uhr ist es?', 'Was Uhr ist es?', 'Wie Uhr viel ist es?'],
    pronounce: ['Wie viel Uhr ist es?'],
  }),
  G('gr-saat-einheiten', T.time, 'matching', 'easy', 'recognition', ['time.soru.einheiten'], {
    instruction: 'Zaman birimini eşleştir:',
    pairs: [
      { left: 'die Stunde', right: 'saat (süre)' },
      { left: 'die Minute', right: 'dakika' },
      { left: 'die Sekunde', right: 'saniye' },
      { left: 'die Uhr', right: 'saat (vakit)' },
    ],
    pronounce: ['die Stunde', 'die Minute', 'die Sekunde', 'die Uhr'],
  }),
  G('gr-zaman-am-abend', T.time, 'fill-blank', 'easy', 'recall', ['time.zaman.am'], {
    instruction: 'Doğru edatı yaz:', prompt: '___ Abend sehe ich fern. (Akşam televizyon izliyorum.)',
    answer: 'Am', acceptedAnswers: ['am', 'Am'],
    explanation: '`am Abend` — gün bölümlerinde `am`.',
  }),
  G('gr-zaman-im-winter', T.time, 'fill-blank', 'easy', 'recall', ['time.zaman.im-mevsim'], {
    instruction: 'Doğru edatı yaz:', prompt: '___ Winter ist es kalt. (Kışın hava soğuktur.)',
    answer: 'Im', acceptedAnswers: ['im', 'Im'],
    explanation: 'Mevsimlerde `im`: `im Winter`.',
  }),
  G('gr-zaman-morgen-der', T.time, 'multiple-choice', 'medium', 'recognition', ['time.zaman.morgen-cift-anlam'], {
    instruction: 'Doğru cümleyi seç:', prompt: '“Yarın okula gidiyorum.”',
    answer: 'Morgen gehe ich zur Schule.',
    options: ['Morgen gehe ich zur Schule.', 'Der Morgen gehe ich zur Schule.', 'Morgen ich gehe zur Schule.', 'Morgens gehe ich zur Schule Haus.'],
    explanation: 'Yarın = küçük harfle `morgen`; `der Morgen` sabah demektir.',
  }),
  G('gr-zaman-jeden-tag', T.sentenceBuilding, 'free-text', 'easy', 'production', ['sentence-building.zaman.jeden-tag-heute'], {
    instruction: 'Türkçeden Almancaya çevir:', prompt: 'Her sabah kahve içiyorum.',
    answer: 'Ich trinke jeden Morgen Kaffee.', acceptedAnswers: ['Ich trinke jeden Morgen Kaffee'],
    validation: DE_PROD, pronounce: ['Ich trinke jeden Morgen Kaffee.'],
  }),
  G('gr-sayi-47', T.numbers, 'free-text', 'medium', 'production', ['numbers.sayilar.bilesik'], {
    instruction: 'Sayıyı Almanca yazıyla yaz:', prompt: '47 → ______',
    answer: 'siebenundvierzig', acceptedAnswers: ['Siebenundvierzig'],
    explanation: 'Birler + `und` + onlar: `siebenundvierzig`.',
  }),
  G('gr-sayi-63', T.numbers, 'free-text', 'medium', 'production', ['numbers.sayilar.bilesik'], {
    instruction: 'Sayıyı Almanca yazıyla yaz:', prompt: '63 → ______',
    answer: 'dreiundsechzig', acceptedAnswers: ['Dreiundsechzig'],
  }),
  G('gr-sayi-82mc', T.numbers, 'multiple-choice', 'easy', 'recognition', ['numbers.sayilar.onluklar'], {
    instruction: 'Doğru yazımı seç:', prompt: '82 → ?',
    answer: 'zweiundachtzig',
    options: ['zweiundachtzig', 'achtundzwanzig', 'zweiachtzig', 'zwanzig und zwei'],
  }),
  G('gr-sayi-150', T.numbers, 'free-text', 'medium', 'production', ['numbers.sayilar.yuzler'], {
    instruction: 'Sayıyı Almanca yazıyla yaz:', prompt: '150 → ______',
    answer: 'hundertfünfzig', acceptedAnswers: ['Hundertfünfzig'],
  }),
  G('gr-sayi-320', T.numbers, 'free-text', 'hard', 'production', ['numbers.sayilar.yuzler', 'numbers.sayilar.yuzler-bilesik'], {
    instruction: 'Sayıyı Almanca yazıyla yaz:', prompt: '320 → ______',
    answer: 'dreihundertzwanzig', acceptedAnswers: ['Dreihundertzwanzig'],
    explanation: 'Yüzlerde araya `und` girmez: `dreihundertzwanzig`.',
  }),
  G('gr-sayi-telefon', T.personalInfo, 'dictation', 'medium', 'production', ['personal-info.kontakt.telefon'], {
    instruction: 'Duyduğun numarayı rakamla yaz:',
    audioText: 'Meine Telefonnummer ist fünfzehn dreiundzwanzig.',
    answer: '15 23', acceptedAnswers: ['1523', '15 23', '15-23'],
    audio: { prompt: { text: 'Meine Telefonnummer ist fünfzehn dreiundzwanzig.', language: 'de-DE', role: 'prompt' } },
  }),
  G('gr-saat-dinle-viertel', T.time, 'listen-choice', 'medium', 'recognition', ['time.gunluk.viertel'], {
    instruction: 'Duyduğun saati seç:',
    prompt: 'Es ist Viertel vor neun.',
    audioText: 'Es ist Viertel vor neun.',
    answer: 'Es ist Viertel vor neun.',
    options: ['Es ist Viertel vor neun.', 'Es ist Viertel nach neun.', 'Es ist halb neun.', 'Es ist neun Uhr.'],
    audio: { prompt: { text: 'Es ist Viertel vor neun.', language: 'de-DE', role: 'prompt' } },
    pronounce: ['Es ist Viertel vor neun.'],
  }),
  G('gr-saat-dikte-resmi', T.time, 'dictation', 'hard', 'production', ['time.resmi.kural'], {
    instruction: 'Duyduğun resmî saat cümlesini aynen yaz:',
    audioText: 'Es ist zwanzig Uhr fünfzehn.',
    answer: 'Es ist zwanzig Uhr fünfzehn.',
    audio: { prompt: { text: 'Es ist zwanzig Uhr fünfzehn.', language: 'de-DE', role: 'prompt' } },
    validation: DE_PROD, pronounce: ['Es ist zwanzig Uhr fünfzehn.'],
  }),
];

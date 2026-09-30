/**
 * Etiketli semantik kalibrasyon seti (gerçek müfredat örnekleri).
 *
 * Her vaka: alıştırma bağlamı + beklenen cevap + kullanıcı cevabı +
 * altın etiket (accept/reject). Eşik kalibrasyonu (`scripts/jev-calibrate.ts`)
 * bu set üzerindeki Jev P(true) dağılımını kullanır.
 *
 * Birim testler bu dosyayı çevrimdışı kullanır (canlı Jev çağrısı yok);
 * canlı olasılıklar yalnızca açık canlı-komutla doldurulur.
 */

import type { Exercise } from '../../content/types';
import { DATIV_CALIBRATION_CASES } from './calibration.dativ.fixtures';

export interface CalibrationCase {
  id: string;
  exercise: Exercise;
  userAnswer: string;
  gold: 'accept' | 'reject';
  note: string;
}

let seq = 0;
function ex(partial: Partial<Exercise> & Pick<Exercise, 'id' | 'type' | 'instruction' | 'answer'>): Exercise {
  seq += 1;
  return {
    topicId: 'topic.vocabulary',
    topic: 'Kelime',
    source: { file: 'calibration', naturalKey: `cal-${seq}` },
    difficulty: 'medium',
    skill: 'recall',
    conceptIds: [],
    origin: 'authored',
    ...partial,
  };
}

function c(
  id: string,
  exercise: Exercise,
  userAnswer: string,
  gold: 'accept' | 'reject',
  note: string,
): CalibrationCase {
  return { id, exercise, userAnswer, gold, note };
}

/* Gerçek müfredat şekilleri. */
const machenDetr = () =>
  ex({
    id: 'vocab-v-machen-detr-type',
    type: 'free-text',
    instruction: 'Türkçesini yaz:',
    prompt: 'machen',
    answer: 'yapmak',
    topicId: 'topic.verbs',
  });

const schluesselTrde = () =>
  ex({
    id: 'vocab-v-schluessel-trde-type',
    type: 'free-text',
    instruction: 'Almancasını ARTİKELİYLE yaz:',
    prompt: 'anahtar',
    answer: 'der Schlüssel',
    topicId: 'topic.vocabulary',
  });

const perfektMutter = () =>
  ex({
    id: 'pf-haben-mutter-kocht',
    type: 'free-text',
    instruction: 'Türkçeden Almancaya çevir:',
    prompt: 'Annem dün akşam yemek yaptı. → ______',
    answer: 'Meine Mutter hat gestern Abend gekocht.',
    topicId: 'topic.perfekt',
  });

const modalWerKann = () =>
  ex({
    id: 'w-wer-koennen-tr',
    type: 'free-text',
    instruction: 'Türkçeden Almancaya çevir:',
    prompt: 'Kim Almanca konuşabiliyor?',
    answer: 'Wer kann Deutsch sprechen?',
    topicId: 'topic.modal-verbs',
  });

const okulaGittim = () =>
  ex({
    id: 'cal-okula-gittim',
    type: 'free-text',
    instruction: 'Türkçeden Almancaya çevir:',
    prompt: "Dün okula gittim. → ______",
    answer: 'Ich bin gestern zur Schule gegangen.',
    topicId: 'topic.perfekt',
  });

const kannSprechen = () =>
  ex({
    id: 'cal-kann-sprechen',
    type: 'free-text',
    instruction: 'Türkçeden Almancaya çevir:',
    prompt: 'Almanca konuşabiliyorum. → ______',
    answer: 'Ich kann Deutsch sprechen.',
    topicId: 'topic.modal-verbs',
  });

const tischArtikel = () =>
  ex({
    id: 'cal-tisch-artikel',
    type: 'fill-blank',
    instruction: 'Doğru artikeli yaz:',
    prompt: '___ Tisch',
    answer: 'der',
    topicId: 'topic.articles',
  });

const binFill = () =>
  ex({
    id: 'p1-alt-bin-jahre-fill',
    type: 'fill-blank',
    instruction: 'Boşluğu doldur:',
    prompt: 'Ich _____ achtzehn Jahre alt. (sein)',
    answer: 'bin',
    topicId: 'topic.personal-info',
  });

export const CALIBRATION_CASES: CalibrationCase[] = [
  /* ---- Zorunlu uç durumlar (§44) ---- */
  c('machen-exact', machenDetr(), 'yapmak', 'accept', 'birebir kanonik'),
  c('machen-paraphrase', machenDetr(), 'bir şey yapmak', 'accept', 'zararsız Türkçe açıklama'),
  c('machen-wrong', machenDetr(), 'gitmek', 'reject', 'farklı sözlük anlamı'),
  c('schluessel-exact-tr', ex({ id: 'vocab-v-schluessel-detr-type', type: 'free-text', instruction: 'Türkçesini yaz:', prompt: 'der Schlüssel', answer: 'anahtar', topicId: 'topic.vocabulary' }), 'anahtar', 'accept', 'birebir'),
  c('schluessel-paraphrase', ex({ id: 'vocab-v-schluessel-detr-type', type: 'free-text', instruction: 'Türkçesini yaz:', prompt: 'der Schlüssel', answer: 'anahtar', topicId: 'topic.vocabulary' }), 'kapı anahtarı', 'accept', 'doğal daraltma, anlam korunur'),
  c('okula-wordorder', okulaGittim(), 'Gestern bin ich zur Schule gegangen.', 'accept', 'geçerli kelime sırası'),
  c('okula-aux', okulaGittim(), 'Ich habe gestern zur Schule gegangen.', 'reject', 'yanlış yardımcı fiil'),
  c('kann-exact', kannSprechen(), 'Ich kann Deutsch sprechen.', 'accept', 'birebir'),
  c('kann-past', kannSprechen(), 'Ich konnte Deutsch sprechen.', 'reject', 'yanlış zaman/kip'),
  c('tisch-der', tischArtikel(), 'der', 'accept', 'birebir artikel'),
  c('tisch-den', tischArtikel(), 'den', 'reject', 'hâl eki farkı (kapalı küme, Jev çağrılmaz)'),

  /* ---- Kelime de→tr: zararsız varyasyonlar (accept) ---- */
  c('v-gehen', ex({ id: 'vocab-v-gehen-detr-type', type: 'free-text', instruction: 'Türkçesini yaz:', prompt: 'gehen', answer: 'gitmek', topicId: 'topic.verbs' }), 'gitmek', 'accept', 'birebir'),
  c('v-gehen-yurumek', ex({ id: 'vocab-v-gehen-detr-type', type: 'free-text', instruction: 'Türkçesini yaz:', prompt: 'gehen', answer: 'gitmek', topicId: 'topic.verbs' }), 'yürüyerek gitmek', 'reject', 'anlama ek bilgi katar'),
  c('v-essen', ex({ id: 'vocab-v-essen-detr-type', type: 'free-text', instruction: 'Türkçesini yaz:', prompt: 'essen', answer: 'yemek yemek', topicId: 'topic.verbs' }), 'yemek yemek', 'accept', 'birebir'),
  c('v-essen-yemek', ex({ id: 'vocab-v-essen-detr-type', type: 'free-text', instruction: 'Türkçesini yaz:', prompt: 'essen', answer: 'yemek yemek', topicId: 'topic.verbs' }), 'yemek', 'accept', 'doğal kısaltma'),
  c('v-trinken', ex({ id: 'vocab-v-trinken-detr-type', type: 'free-text', instruction: 'Türkçesini yaz:', prompt: 'trinken', answer: 'içmek', topicId: 'topic.verbs' }), 'bir şey içmek', 'accept', 'yedekli sözcük'),
  c('v-trinken-yemek', ex({ id: 'vocab-v-trinken-detr-type', type: 'free-text', instruction: 'Türkçesini yaz:', prompt: 'trinken', answer: 'içmek', topicId: 'topic.verbs' }), 'yemek', 'reject', 'farklı eylem'),
  c('v-wohnen', ex({ id: 'vocab-v-wohnen-detr-type', type: 'free-text', instruction: 'Türkçesini yaz:', prompt: 'wohnen', answer: 'oturmak (ikamet etmek)', topicId: 'topic.verbs' }), 'oturmak', 'accept', 'açıklama parantezi düşer'),
  c('v-wohnen-yasamak', ex({ id: 'vocab-v-wohnen-detr-type', type: 'free-text', instruction: 'Türkçesini yaz:', prompt: 'wohnen', answer: 'oturmak (ikamet etmek)', topicId: 'topic.verbs' }), 'yaşamak', 'reject', 'yakın ama farklı kavram (leben)'),
  c('v-lernen', ex({ id: 'vocab-v-lernen-detr-type', type: 'free-text', instruction: 'Türkçesini yaz:', prompt: 'lernen', answer: 'öğrenmek', topicId: 'topic.verbs' }), 'öğrenmek', 'accept', 'birebir'),
  c('v-lernen-ogretmek', ex({ id: 'vocab-v-lernen-detr-type', type: 'free-text', instruction: 'Türkçesini yaz:', prompt: 'lernen', answer: 'öğrenmek', topicId: 'topic.verbs' }), 'öğretmek', 'reject', 'zıt yönlü eylem'),
  c('v-katze', ex({ id: 'vocab-v-katze-detr-type', type: 'free-text', instruction: 'Türkçesini yaz:', prompt: 'die Katze', answer: 'kedi', topicId: 'topic.vocabulary' }), 'kedi', 'accept', 'birebir'),
  c('v-katze-kopek', ex({ id: 'vocab-v-katze-detr-type', type: 'free-text', instruction: 'Türkçesini yaz:', prompt: 'die Katze', answer: 'kedi', topicId: 'topic.vocabulary' }), 'köpek', 'reject', 'farklı hayvan'),
  c('v-buch', ex({ id: 'vocab-v-buch-detr-type', type: 'free-text', instruction: 'Türkçesini yaz:', prompt: 'das Buch', answer: 'kitap', topicId: 'topic.vocabulary' }), 'kitap', 'accept', 'birebir'),
  c('v-buch-defter', ex({ id: 'vocab-v-buch-detr-type', type: 'free-text', instruction: 'Türkçesini yaz:', prompt: 'das Buch', answer: 'kitap', topicId: 'topic.vocabulary' }), 'defter', 'reject', 'ilişkili ama yanlış'),
  c('v-schnell', ex({ id: 'cal-schnell', type: 'free-text', instruction: 'Türkçesini yaz:', prompt: 'schnell', answer: 'hızlı', topicId: 'topic.vocabulary' }), 'hızlı', 'accept', 'birebir'),
  c('v-schnell-yavas', ex({ id: 'cal-schnell', type: 'free-text', instruction: 'Türkçesini yaz:', prompt: 'schnell', answer: 'hızlı', topicId: 'topic.vocabulary' }), 'yavaş', 'reject', 'zıt anlam'),
  c('v-arbeit', ex({ id: 'vocab-v-arbeiten-detr-type', type: 'free-text', instruction: 'Türkçesini yaz:', prompt: 'arbeiten', answer: 'çalışmak', topicId: 'topic.verbs' }), 'çalışmak', 'accept', 'birebir'),
  c('v-arbeit-ogrenmek', ex({ id: 'vocab-v-arbeiten-detr-type', type: 'free-text', instruction: 'Türkçesini yaz:', prompt: 'arbeiten', answer: 'çalışmak', topicId: 'topic.verbs' }), 'öğrenmek', 'reject', 'farklı fiil'),

  /* ---- Kelime tr→de: artikel politikası ---- */
  c('schluessel-bare', schluesselTrde(), 'Schlüssel', 'reject', 'artikel yok (mod artikelli ister)'),
  c('schluessel-wrong-art', schluesselTrde(), 'die Schlüssel', 'reject', 'yanlış artikel'),
  c('schluessel-exact', schluesselTrde(), 'der Schlüssel', 'accept', 'birebir artikelli'),
  c('kaffee-exact', ex({ id: 'vocab-v-kaffee-trde-type', type: 'free-text', instruction: 'Almancasını ARTİKELİYLE yaz:', prompt: 'kahve', answer: 'der Kaffee', topicId: 'topic.daily-routine' }), 'der Kaffee', 'accept', 'birebir'),
  c('kaffee-bare', ex({ id: 'vocab-v-kaffee-trde-type', type: 'free-text', instruction: 'Almancasını ARTİKELİYLE yaz:', prompt: 'kahve', answer: 'der Kaffee', topicId: 'topic.daily-routine' }), 'Kaffee', 'reject', 'artikel eksik'),
  c('gehen-exact', ex({ id: 'vocab-v-gehen-trde-type', type: 'free-text', instruction: 'Almancasını yaz:', prompt: 'gitmek', answer: 'gehen', topicId: 'topic.verbs' }), 'gehen', 'accept', 'birebir fiil'),
  c('gehen-kommen', ex({ id: 'vocab-v-gehen-trde-type', type: 'free-text', instruction: 'Almancasını yaz:', prompt: 'gitmek', answer: 'gehen', topicId: 'topic.verbs' }), 'kommen', 'reject', 'zıt yön'),

  /* ---- Cümle çevirisi: geçerli varyasyonlar (accept) ---- */
  c('mutter-wordorder', perfektMutter(), 'Gestern Abend hat meine Mutter gekocht.', 'accept', 'geçerli vurgu sırası'),
  c('mutter-punct', perfektMutter(), 'Meine Mutter hat gestern Abend gekocht', 'accept', 'noktalama normalizasyonu'),
  c('mutter-case-insens', perfektMutter(), 'meine mutter hat gestern abend gekocht.', 'accept', 'büyük/küçük harf toleransı'),
  c('kalktim-digit', ex({ id: 'cal-kalktim', type: 'free-text', instruction: 'Türkçeden Almancaya çevir:', prompt: "Dün saat 7'de kalktım. → ______", answer: 'Ich bin gestern um sieben Uhr aufgestanden.', topicId: 'topic.perfekt' }), 'Gestern bin ich um 7 Uhr aufgestanden.', 'accept', 'sıra + rakam yazımı eşdeğer'),
  c('kalktim-wordnum', ex({ id: 'cal-kalktim', type: 'free-text', instruction: 'Türkçeden Almancaya çevir:', prompt: "Dün saat 7'de kalktım. → ______", answer: 'Ich bin gestern um sieben Uhr aufgestanden.', topicId: 'topic.perfekt' }), 'Ich bin gestern um sieben Uhr aufgestanden.', 'accept', 'birebir'),
  c('wer-kann-order', modalWerKann(), 'Deutsch sprechen kann wer?', 'reject', 'bozuk kelime sırası'),
  c('wer-kann-exact', modalWerKann(), 'Wer kann Deutsch sprechen?', 'accept', 'birebir'),

  /* ---- Cümle çevirisi: zaman/kip/yardımcı/özne retleri ---- */
  c('kalktim-present', ex({ id: 'cal-kalktim', type: 'free-text', instruction: 'Türkçeden Almancaya çevir:', prompt: "Dün saat 7'de kalktım. → ______", answer: 'Ich bin gestern um sieben Uhr aufgestanden.', topicId: 'topic.perfekt' }), 'Ich stehe um sieben Uhr auf.', 'reject', 'yanlış zaman'),
  c('kalktim-haben', ex({ id: 'cal-kalktim', type: 'free-text', instruction: 'Türkçeden Almancaya çevir:', prompt: "Dün saat 7'de kalktım. → ______", answer: 'Ich bin gestern um sieben Uhr aufgestanden.', topicId: 'topic.perfekt' }), 'Ich habe gestern um sieben Uhr aufgestanden.', 'reject', 'yanlış yardımcı fiil'),
  c('kalktim-subject', ex({ id: 'cal-kalktim', type: 'free-text', instruction: 'Türkçeden Almancaya çevir:', prompt: "Dün saat 7'de kalktım. → ______", answer: 'Ich bin gestern um sieben Uhr aufgestanden.', topicId: 'topic.perfekt' }), 'Er ist gestern um sieben Uhr aufgestanden.', 'reject', 'yanlış özne'),
  c('kalktim-neg', ex({ id: 'cal-kalktim', type: 'free-text', instruction: 'Türkçeden Almancaya çevir:', prompt: "Dün saat 7'de kalktım. → ______", answer: 'Ich bin gestern um sieben Uhr aufgestanden.', topicId: 'topic.perfekt' }), 'Ich bin gestern um sieben Uhr nicht aufgestanden.', 'reject', 'olumsuzluk eklendi'),
  c('kalktim-partizip', ex({ id: 'cal-kalktim', type: 'free-text', instruction: 'Türkçeden Almancaya çevir:', prompt: "Dün saat 7'de kalktım. → ______", answer: 'Ich bin gestern um sieben Uhr aufgestanden.', topicId: 'topic.perfekt' }), 'Ich bin gestern um sieben Uhr aufgesteht.', 'reject', 'yanlış partizip'),
  c('mutter-past-simple', perfektMutter(), 'Meine Mutter kochte gestern Abend.', 'reject', 'öğretilmeyen Präteritum'),
  c('mutter-sein', perfektMutter(), 'Meine Mutter ist gestern Abend gekocht.', 'reject', 'yanlış yardımcı (sein)'),
  c('mutter-subject', perfektMutter(), 'Mein Vater hat gestern Abend gekocht.', 'reject', 'yanlış özne'),
  c('mutter-object-drop', perfektMutter(), 'Meine Mutter hat gekocht.', 'reject', 'temel anlam eksik (dün akşam)'),
  c('mutter-extra', perfektMutter(), 'Meine Mutter hat gestern Abend gekocht und Kuchen gebacken.', 'reject', 'anlamı değiştiren ek bilgi'),
  c('modal-konnte', kannSprechen(), 'Ich konnte Deutsch sprechen.', 'reject', 'kip/zaman değişimi'),
  c('modal-muss', kannSprechen(), 'Ich muss Deutsch sprechen.', 'reject', 'yanlış modal'),
  c('modal-person', kannSprechen(), 'Du kannst Deutsch sprechen.', 'reject', 'yanlış kişi'),
  c('modal-inf-missing', kannSprechen(), 'Ich kann Deutsch.', 'reject', 'eksik mastar'),
  c('modal-order-ok', kannSprechen(), 'Deutsch kann ich sprechen.', 'accept', 'geçerli vurgu sırası (anlam modu)'),

  /* ---- Perfekt yardımcı seçimi: tek sözcük ---- */
  c('bin-exact', binFill(), 'bin', 'accept', 'birebir'),
  c('bin-ist', binFill(), 'ist', 'reject', 'kişi eki farkı (kapalı küme)'),
  c('pf-habe-exact', ex({ id: 'pf-formula-habe-fill', type: 'fill-blank', instruction: 'Yardımcı fiili yaz — Spor yaptım.', prompt: 'Ich ___ Sport gemacht.', answer: 'habe', topicId: 'topic.perfekt' }), 'habe', 'accept', 'birebir'),
  c('pf-habe-bin', ex({ id: 'pf-formula-habe-fill', type: 'fill-blank', instruction: 'Yardımcı fiili yaz — Spor yaptım.', prompt: 'Ich ___ Sport gemacht.', answer: 'habe', topicId: 'topic.perfekt' }), 'bin', 'reject', 'haben/sein değişimi'),
  c('studiert-exact', ex({ id: 'cal-studiert', type: 'free-text', instruction: 'Türkçeden Almancaya çevir:', prompt: 'Almanca okudum. → ______', answer: 'Ich habe Deutsch studiert.', topicId: 'topic.perfekt' }), 'Ich habe Deutsch studiert.', 'accept', 'birebir'),
  c('studiert-wrongpart', ex({ id: 'cal-studiert', type: 'free-text', instruction: 'Türkçeden Almancaya çevir:', prompt: 'Almanca okudum. → ______', answer: 'Ich habe Deutsch studiert.', topicId: 'topic.perfekt' }), 'Ich habe Deutsch gestudiert.', 'reject', 'yanlış partizip oluşumu'),
  c('studiert-gegangen', ex({ id: 'cal-studiert', type: 'free-text', instruction: 'Türkçeden Almancaya çevir:', prompt: 'Almanca okudum. → ______', answer: 'Ich habe Deutsch studiert.', topicId: 'topic.perfekt' }), 'Ich bin Deutsch studiert gegangen.', 'reject', 'anlamsız yeniden yazım'),

  /* ---- Akkusativ / modal çekim ---- */
  c('akk-einen', ex({ id: 'cal-apfel', type: 'free-text', instruction: 'Türkçeden Almancaya çevir:', prompt: 'Bir elma yemek istiyorum. → ______', answer: 'Ich möchte einen Apfel essen.', topicId: 'topic.akkusativ' }), 'Ich möchte einen Apfel essen.', 'accept', 'birebir'),
  c('akk-ein', ex({ id: 'cal-apfel', type: 'free-text', instruction: 'Türkçeden Almancaya çevir:', prompt: 'Bir elma yemek istiyorum. → ______', answer: 'Ich möchte einen Apfel essen.', topicId: 'topic.akkusativ' }), 'Ich möchte ein Apfel essen.', 'reject', 'Akkusativ hatası'),
  c('akk-meinen', ex({ id: 'cal-bruder', type: 'free-text', instruction: 'Türkçeden Almancaya çevir:', prompt: 'Kardeşimi aramalıyım. → ______', answer: 'Ich soll meinen Bruder anrufen.', topicId: 'topic.akkusativ' }), 'Ich soll mein Bruder anrufen.', 'reject', 'iyelik hâl hatası'),
  c('modal-kannst', ex({ id: 'cal-kochen', type: 'free-text', instruction: 'Türkçeden Almancaya çevir:', prompt: 'İyi yemek yapabilirim. → ______', answer: 'Ich kann gut kochen.', topicId: 'topic.modal-verbs' }), 'Ich kannst gut kochen.', 'reject', 'modal kişi eki'),
  c('modal-moechte', ex({ id: 'cal-kaffee-modal', type: 'free-text', instruction: 'Türkçeden Almancaya çevir:', prompt: 'Kahve içmek istiyorum. → ______', answer: 'Du möchtest Kaffee trinken.', topicId: 'topic.modal-verbs' }), 'Du möchte Kaffee trinken.', 'reject', 'modal kişi eki'),

  /* ---- Hata düzeltme / boşluk doldurma ---- */
  c('err-aus', ex({ id: 'p1-hata-aus-mis', type: 'error-correction', instruction: 'Hata avı — edatı düzelt:', prompt: 'Ich komme in der Türkei.', answer: 'Ich komme aus der Türkei.', topicId: 'topic.personal-info' }), 'Ich komme aus der Türkei.', 'accept', 'birebir düzeltme'),
  c('err-in-keep', ex({ id: 'p1-hata-aus-mis', type: 'error-correction', instruction: 'Hata avı — edatı düzelt:', prompt: 'Ich komme in der Türkei.', answer: 'Ich komme aus der Türkei.', topicId: 'topic.personal-info' }), 'Ich komme in der Türkei.', 'reject', 'hata düzeltilmemiş'),
  c('err-von', ex({ id: 'p1-hata-aus-mis', type: 'error-correction', instruction: 'Hata avı — edatı düzelt:', prompt: 'Ich komme in der Türkei.', answer: 'Ich komme aus der Türkei.', topicId: 'topic.personal-info' }), 'Ich komme von der Türkei.', 'reject', 'yanlış edat ikamesi'),
  c('fill-heisst', ex({ id: 'cal-heisst', type: 'fill-blank', instruction: 'Boşluğu doldur:', prompt: 'Wie _____ du? (heißen)', answer: 'heißt', topicId: 'topic.greetings' }), 'heißt', 'accept', 'birebir'),
  c('fill-heisse', ex({ id: 'cal-heisst', type: 'fill-blank', instruction: 'Boşluğu doldur:', prompt: 'Wie _____ du? (heißen)', answer: 'heißt', topicId: 'topic.greetings' }), 'heiße', 'reject', 'çekim farkı'),
  c('fill-sie', ex({ id: 'cal-sie-convert', type: 'free-text', instruction: 'Samimi soruyu resmî hâle çevir:', prompt: 'Wie heißt du? → ______', answer: 'Wie heißen Sie?', topicId: 'topic.greetings' }), 'Wie heißen Sie?', 'accept', 'birebir resmî'),
  c('fill-sie-lower', ex({ id: 'cal-sie-convert', type: 'free-text', instruction: 'Samimi soruyu resmî hâle çevir:', prompt: 'Wie heißt du? → ______', answer: 'Wie heißen Sie?', topicId: 'topic.greetings' }), 'Wie heißen sie?', 'reject', 'resmî Sie ayrımı'),

  /* ---- Sınırda / kısmen doğru (hepsi reject; muhafazakâr) ---- */
  c('border-extra-gestern', okulaGittim(), 'Ich bin zur Schule gegangen.', 'reject', 'belirleyici zaman eksik (gestern)'),
  c('border-mit-freund', okulaGittim(), 'Ich bin gestern mit meinem Freund zur Schule gegangen.', 'reject', 'ek bilgi anlamı genişletir'),
  c('border-okula-yurudum', ex({ id: 'vocab-v-gehen-detr-type', type: 'free-text', instruction: 'Türkçesini yaz:', prompt: 'gehen', answer: 'gitmek', topicId: 'topic.verbs' }), 'okula gitmek', 'accept', 'bağlamsal tamamlayıcı zararsız'),
  c('border-yapmak-etmek', machenDetr(), 'yapmak etmek', 'reject', 'anlamsız ikileme'),
  c('border-bissey', machenDetr(), 'bir şeyler yapmak', 'accept', 'çoğul varyasyon zararsız'),
  c('border-yapiyorum', machenDetr(), 'yapıyorum', 'reject', 'mastarı çekimli hâle getirme'),
  c('border-empty-ish', machenDetr(), 'şey', 'reject', 'eksik temel anlam'),

  /* ---- Zıt / olumsuzluk / ilişkili-ama-yanlış ---- */
  c('opp-gut-schlecht', ex({ id: 'cal-gut', type: 'free-text', instruction: 'Türkçesini yaz:', prompt: 'gut', answer: 'iyi', topicId: 'topic.vocabulary' }), 'kötü', 'reject', 'zıt anlam'),
  c('neg-ich-komme', ex({ id: 'cal-komme', type: 'free-text', instruction: 'Türkçeden Almancaya çevir:', prompt: 'Türkiye’den geliyorum. → ______', answer: 'Ich komme aus der Türkei.', topicId: 'topic.personal-info' }), 'Ich komme nicht aus der Türkei.', 'reject', 'olumsuzluk anlamı tersine çevirir'),
  c('rel-wasser-bier', ex({ id: 'cal-wasser', type: 'free-text', instruction: 'Türkçesini yaz:', prompt: 'das Wasser', answer: 'su', topicId: 'topic.food' }), 'bira', 'reject', 'aynı alan, farklı içecek'),
  c('rel-arzt-krank', ex({ id: 'cal-arzt', type: 'free-text', instruction: 'Türkçesini yaz:', prompt: 'der Arzt', answer: 'doktor', topicId: 'topic.vocabulary' }), 'hasta', 'reject', 'ilişkili ama eşdeğer değil'),
  c('rel-schule-uni', ex({ id: 'cal-schule-tr', type: 'free-text', instruction: 'Türkçesini yaz:', prompt: 'die Schule', answer: 'okul', topicId: 'topic.daily-routine' }), 'üniversite', 'reject', 'dar anlam kayması'),
  c('rel-haus-wohnung', ex({ id: 'cal-haus', type: 'free-text', instruction: 'Türkçesini yaz:', prompt: 'das Haus', answer: 'ev', topicId: 'topic.home' }), 'ev', 'accept', 'birebir'),
  c('rel-haus-bina', ex({ id: 'cal-haus', type: 'free-text', instruction: 'Türkçesini yaz:', prompt: 'das Haus', answer: 'ev', topicId: 'topic.home' }), 'bina', 'reject', 'genişletilmiş anlam'),

  /* ---- Yazım toleransı deterministikte kalır (Jev'e gitmez ama etiket accept) ---- */
  c('typo-ist', ex({ id: 'cal-ist', type: 'fill-blank', instruction: 'Boşluğu doldur:', prompt: 'Er _____ Lehrer. (sein)', answer: 'ist', topicId: 'topic.verbs' }), 'ist', 'accept', 'birebir'),
  c('kb-ss', ex({ id: 'cal-heisse-kb', type: 'free-text', instruction: 'Türkçeden Almancaya çevir:', prompt: 'Mustafa adındayım. → ______', answer: 'Ich heiße Mustafa.', validation: { keyboardTolerance: true }, topicId: 'topic.greetings' }), 'Ich heisse Mustafa.', 'accept', 'klavye toleransı (deterministik)'),
  c('kb-oe', ex({ id: 'cal-moechte-kb', type: 'free-text', instruction: 'Türkçeden Almancaya çevir:', prompt: 'Kahve istiyorum. → ______', answer: 'Ich möchte Kaffee.', validation: { keyboardTolerance: true }, topicId: 'topic.modal-verbs' }), 'Ich moechte Kaffee.', 'accept', 'klavye toleransı (deterministik)'),

  /* ---- Genel tekrar / cümle kurma şekilleri ---- */
  c('gr-dialog', ex({ id: 'p1-vorstellung-dialog-free', type: 'free-text', instruction: 'Mini diyalog: B ne demeli?', prompt: 'A: Wie heißt du?\nB: ______', answer: 'Ich heiße Mustafa. Freut mich!', acceptedAnswers: ['Ich heiße Mustafa.', 'Mein Name ist Mustafa. Freut mich!'], topicId: 'topic.greetings' }), 'Ich heiße Mustafa. Freut mich!', 'accept', 'birebir'),
  c('gr-dialog-alias', ex({ id: 'p1-vorstellung-dialog-free', type: 'free-text', instruction: 'Mini diyalog: B ne demeli?', prompt: 'A: Wie heißt du?\nB: ______', answer: 'Ich heiße Mustafa. Freut mich!', acceptedAnswers: ['Ich heiße Mustafa.', 'Mein Name ist Mustafa. Freut mich!'], topicId: 'topic.greetings' }), 'Mein Name ist Mustafa. Freut mich!', 'accept', 'kabul edilen alternatif (deterministik)'),
  c('gr-dialog-wrongname', ex({ id: 'p1-vorstellung-dialog-free', type: 'free-text', instruction: 'Mini diyalog: B ne demeli?', prompt: 'A: Wie heißt du?\nB: ______', answer: 'Ich heiße Mustafa. Freut mich!', acceptedAnswers: ['Ich heiße Mustafa.', 'Mein Name ist Mustafa. Freut mich!'], topicId: 'topic.greetings' }), 'Ich heiße Ali. Freut mich!', 'reject', 'yanlış isim bilgisi'),
  c('gr-fill-email', ex({ id: 'p1-kontakt-email-adresse-fill', type: 'fill-blank', instruction: 'Boşluğu doldur:', prompt: '___ ? (e-posta adresin nedir)', answer: 'Wie ist deine E-Mail-Adresse?', topicId: 'topic.personal-info' }), 'Wie ist deine E-Mail-Adresse?', 'accept', 'birebir'),
  c('sep-aufstehen', ex({ id: 'cal-aufstehen', type: 'free-text', instruction: 'Türkçeden Almancaya çevir:', prompt: "Sabah 7'de kalkarım. → ______", answer: 'Ich stehe um sieben Uhr auf.', topicId: 'topic.separable-verbs' }), 'Um sieben Uhr stehe ich auf.', 'accept', 'geçerli kelime sırası'),
  c('sep-aufstehen-verb', ex({ id: 'cal-aufstehen', type: 'free-text', instruction: 'Türkçeden Almancaya çevir:', prompt: "Sabah 7'de kalkarım. → ______", answer: 'Ich stehe um sieben Uhr auf.', topicId: 'topic.separable-verbs' }), 'Ich wache um sieben Uhr auf.', 'reject', 'farklı ayrılabilen fiil'),
  c('clock-halb', ex({ id: 'cal-halb', type: 'fill-blank', instruction: 'Saati yaz:', prompt: '7:30 → ______', answer: 'halb acht', topicId: 'topic.time' }), 'halb acht', 'accept', 'birebir saat'),
  c('clock-sieben', ex({ id: 'cal-halb', type: 'fill-blank', instruction: 'Saati yaz:', prompt: '7:30 → ______', answer: 'halb acht', topicId: 'topic.time' }), 'sieben Uhr dreißig', 'accept', 'eşdeğer saat anlatımı'),
  c('clock-falsch', ex({ id: 'cal-halb', type: 'fill-blank', instruction: 'Saati yaz:', prompt: '7:30 → ______', answer: 'halb acht', topicId: 'topic.time' }), 'halb sieben', 'reject', 'yanlış saat'),
  c('ein-einen', ex({ id: 'cal-ein-apfel', type: 'fill-blank', instruction: 'Doğru artikeli yaz:', prompt: 'Ich möchte ___ Apfel essen.', answer: 'einen', topicId: 'topic.akkusativ' }), 'ein', 'reject', 'Akkusativ artikel hatası'),
  c('mein-meinen', ex({ id: 'cal-mein-bruder', type: 'fill-blank', instruction: 'Doğru biçimi yaz:', prompt: 'Ich soll ___ Bruder anrufen. (mein)', answer: 'meinen', topicId: 'topic.akkusativ' }), 'mein', 'reject', 'hâl eki hatası'),
  c('kein-keinen', ex({ id: 'cal-kein-kaffee', type: 'fill-blank', instruction: 'Doğru biçimi yaz:', prompt: 'Ich möchte ___ Kaffee trinken. (kein)', answer: 'keinen', topicId: 'topic.akkusativ' }), 'kein', 'reject', 'olumsuz artikel hâl hatası'),
  c('will-willst', ex({ id: 'cal-will', type: 'fill-blank', instruction: 'Modal fiili yaz:', prompt: 'Er ___ ein Haus kaufen. (wollen)', answer: 'will', topicId: 'topic.modal-verbs' }), 'willst', 'reject', 'modal kişi eki'),
  c('muss-musst', ex({ id: 'cal-muss', type: 'fill-blank', instruction: 'Modal fiili yaz:', prompt: 'Du ___ Deutsch lernen. (müssen)', answer: 'musst', topicId: 'topic.modal-verbs' }), 'muss', 'reject', 'modal kişi eki'),
  c('darf-darfst', ex({ id: 'cal-darf', type: 'fill-blank', instruction: 'Modal fiili yaz:', prompt: 'Hier ___ man nicht parken. (dürfen)', answer: 'darf', topicId: 'topic.modal-verbs' }), 'darfst', 'reject', 'modal kişi eki'),

  /* ---- Ek kabul edilebilir doğal anlatımlar ---- */
  c('wohne-istanbul', ex({ id: 'cal-wohne', type: 'free-text', instruction: 'Türkçeden Almancaya çevir:', prompt: "İstanbul'da oturuyorum. → ______", answer: 'Ich wohne in Istanbul.', topicId: 'topic.personal-info' }), 'Ich wohne in Istanbul.', 'accept', 'birebir'),
  c('wohne-lebe', ex({ id: 'cal-wohne', type: 'free-text', instruction: 'Türkçeden Almancaya çevir:', prompt: "İstanbul'da oturuyorum. → ______", answer: 'Ich wohne in Istanbul.', topicId: 'topic.personal-info' }), 'Ich lebe in Istanbul.', 'accept', 'eşanlamlı fiil, anlam korunur'),
  c('komme-order', ex({ id: 'cal-komme', type: 'free-text', instruction: 'Türkçeden Almancaya çevir:', prompt: 'Türkiye’den geliyorum. → ______', answer: 'Ich komme aus der Türkei.', topicId: 'topic.personal-info' }), 'Aus der Türkei komme ich.', 'accept', 'geçerli vurgu sırası'),
  c('komme-von', ex({ id: 'cal-komme', type: 'free-text', instruction: 'Türkçeden Almancaya çevir:', prompt: 'Türkiye’den geliyorum. → ______', answer: 'Ich komme aus der Türkei.', topicId: 'topic.personal-info' }), 'Ich komme von der Türkei.', 'reject', 'yanlış edat'),
  c('spreche-deutsch', ex({ id: 'cal-spreche', type: 'free-text', instruction: 'Türkçeden Almancaya çevir:', prompt: 'Biraz Almanca konuşuyorum. → ______', answer: 'Ich spreche ein bisschen Deutsch.', topicId: 'topic.greetings' }), 'Ich spreche ein wenig Deutsch.', 'accept', 'eşanlamlı miktar zarfı'),
  c('spreche-gut', ex({ id: 'cal-spreche', type: 'free-text', instruction: 'Türkçeden Almancaya çevir:', prompt: 'Biraz Almanca konuşuyorum. → ______', answer: 'Ich spreche ein bisschen Deutsch.', topicId: 'topic.greetings' }), 'Ich spreche gut Deutsch.', 'reject', 'farklı miktar anlamı'),
  c('fruehstuecke', ex({ id: 'cal-fruehstueck', type: 'free-text', instruction: 'Türkçeden Almancaya çevir:', prompt: 'Kahvaltı ediyorum. → ______', answer: 'Ich frühstücke.', topicId: 'topic.daily-routine' }), 'Ich frühstücke gerade.', 'accept', 'zararsız zaman zarfı'),
  c('fruehstuecke-esse', ex({ id: 'cal-fruehstueck', type: 'free-text', instruction: 'Türkçeden Almancaya çevir:', prompt: 'Kahvaltı ediyorum. → ______', answer: 'Ich frühstücke.', topicId: 'topic.daily-routine' }), 'Ich esse Frühstück.', 'accept', 'eşdeğer anlatım'),
  c('einkaufen-exact', ex({ id: 'vocab-v-einkaufen-detr-type', type: 'free-text', instruction: 'Türkçesini yaz:', prompt: 'einkaufen', answer: 'alışveriş yapmak', topicId: 'topic.shopping' }), 'alışveriş yapmak', 'accept', 'birebir'),
  c('einkaufen-satin', ex({ id: 'vocab-v-einkaufen-detr-type', type: 'free-text', instruction: 'Türkçesini yaz:', prompt: 'einkaufen', answer: 'alışveriş yapmak', topicId: 'topic.shopping' }), 'satın almak', 'reject', 'farklı fiil (kaufen)'),
  c('aufraeumen', ex({ id: 'vocab-v-aufraeumen-detr-type', type: 'free-text', instruction: 'Türkçesini yaz:', prompt: 'aufräumen', answer: 'odayı toplamak', topicId: 'topic.separable-verbs' }), 'oda toplamak', 'accept', 'doğal varyasyon'),
  c('aufraeumen-temiz', ex({ id: 'vocab-v-aufraeumen-detr-type', type: 'free-text', instruction: 'Türkçesini yaz:', prompt: 'aufräumen', answer: 'odayı toplamak', topicId: 'topic.separable-verbs' }), 'temizlemek', 'reject', 'genel anlam, özgül değil'),

  /* ---- Ek aile/yiyecek/ev kelimeleri ---- */
  c('vater', ex({ id: 'vocab-v-vater-detr-type', type: 'free-text', instruction: 'Türkçesini yaz:', prompt: 'der Vater', answer: 'baba', topicId: 'topic.articles' }), 'baba', 'accept', 'birebir'),
  c('vater-anne', ex({ id: 'vocab-v-vater-detr-type', type: 'free-text', instruction: 'Türkçesini yaz:', prompt: 'der Vater', answer: 'baba', topicId: 'topic.articles' }), 'anne', 'reject', 'farklı aile üyesi'),
  c('mutter-n', ex({ id: 'vocab-v-mutter-detr-type', type: 'free-text', instruction: 'Türkçesini yaz:', prompt: 'die Mutter', answer: 'anne', topicId: 'topic.articles' }), 'annem', 'reject', 'iyelik eki anlamı değiştirir'),
  c('milch', ex({ id: 'vocab-v-milch-detr-type', type: 'free-text', instruction: 'Türkçesini yaz:', prompt: 'die Milch', answer: 'süt', topicId: 'topic.food' }), 'süt', 'accept', 'birebir'),
  c('milch-su', ex({ id: 'vocab-v-milch-detr-type', type: 'free-text', instruction: 'Türkçesini yaz:', prompt: 'die Milch', answer: 'süt', topicId: 'topic.food' }), 'su', 'reject', 'farklı içecek'),
  c('brot-fehl', ex({ id: 'cal-brot', type: 'free-text', instruction: 'Türkçesini yaz:', prompt: 'das Brot', answer: 'ekmek', topicId: 'topic.food' }), 'küçük ekmek', 'reject', 'Brötchen ile karışır'),
  c('brot-exact', ex({ id: 'cal-brot', type: 'free-text', instruction: 'Türkçesini yaz:', prompt: 'das Brot', answer: 'ekmek', topicId: 'topic.food' }), 'ekmek', 'accept', 'birebir'),
  c('wetter', ex({ id: 'vocab-v-wetter-detr-type', type: 'free-text', instruction: 'Türkçesini yaz:', prompt: 'das Wetter', answer: 'hava (durumu)', topicId: 'topic.vocabulary' }), 'hava', 'accept', 'parantez düşer'),
  c('wetter-iklim', ex({ id: 'vocab-v-wetter-detr-type', type: 'free-text', instruction: 'Türkçesini yaz:', prompt: 'das Wetter', answer: 'hava (durumu)', topicId: 'topic.vocabulary' }), 'iklim', 'reject', 'farklı kavram (Klima)'),
  c('hund', ex({ id: 'vocab-v-hund-detr-type', type: 'free-text', instruction: 'Türkçesini yaz:', prompt: 'der Hund', answer: 'köpek', topicId: 'topic.vocabulary' }), 'köpek', 'accept', 'birebir'),
  c('hund-kopegin', ex({ id: 'vocab-v-hund-detr-type', type: 'free-text', instruction: 'Türkçesini yaz:', prompt: 'der Hund', answer: 'köpek', topicId: 'topic.vocabulary' }), 'köpeğin', 'reject', 'hâl eki eklendi'),
  c('kaufen', ex({ id: 'vocab-v-kaufen-detr-type', type: 'free-text', instruction: 'Türkçesini yaz:', prompt: 'kaufen', answer: 'satın almak', topicId: 'topic.shopping' }), 'satın almak', 'accept', 'birebir'),
  c('kaufen-satmak', ex({ id: 'vocab-v-kaufen-detr-type', type: 'free-text', instruction: 'Türkçesini yaz:', prompt: 'kaufen', answer: 'satın almak', topicId: 'topic.shopping' }), 'satmak', 'reject', 'zıt yön (verkaufen)'),
  c('teuer', ex({ id: 'vocab-v-teuer-detr-type', type: 'free-text', instruction: 'Türkçesini yaz:', prompt: 'teuer', answer: 'pahalı', topicId: 'topic.shopping' }), 'pahalı', 'accept', 'birebir'),
  c('teuer-ucuz', ex({ id: 'vocab-v-teuer-detr-type', type: 'free-text', instruction: 'Türkçesini yaz:', prompt: 'teuer', answer: 'pahalı', topicId: 'topic.shopping' }), 'ucuz', 'reject', 'zıt anlam'),

  /* ---- Soru sözcükleri / cümle varyasyonları ---- */
  c('woher-exact', ex({ id: 'cal-woher', type: 'free-text', instruction: 'Türkçeden Almancaya çevir:', prompt: 'Nerelisin? → ______', answer: 'Woher kommst du?', topicId: 'topic.greetings' }), 'Woher kommst du?', 'accept', 'birebir'),
  c('woher-wo', ex({ id: 'cal-woher', type: 'free-text', instruction: 'Türkçeden Almancaya çevir:', prompt: 'Nerelisin? → ______', answer: 'Woher kommst du?', topicId: 'topic.greetings' }), 'Wo kommst du?', 'reject', 'yanlış soru sözcüğü (wo≠woher)'),
  c('woher-wohnst', ex({ id: 'cal-woher', type: 'free-text', instruction: 'Türkçeden Almancaya çevir:', prompt: 'Nerelisin? → ______', answer: 'Woher kommst du?', topicId: 'topic.greetings' }), 'Woher wohnst du?', 'reject', 'yanlış fiil'),
  c('name-exact', ex({ id: 'cal-name', type: 'free-text', instruction: 'Türkçeden Almancaya çevir:', prompt: 'Adın ne? → ______', answer: 'Wie heißt du?', topicId: 'topic.greetings' }), 'Wie heißt du?', 'accept', 'birebir'),
  c('name-wer', ex({ id: 'cal-name', type: 'free-text', instruction: 'Türkçeden Almancaya çevir:', prompt: 'Adın ne? → ______', answer: 'Wie heißt du?', topicId: 'topic.greetings' }), 'Wer bist du?', 'reject', 'farklı soru'),
  c('gehts-exact', ex({ id: 'cal-gehts', type: 'free-text', instruction: 'Türkçeden Almancaya çevir:', prompt: 'Nasılsın? → ______', answer: 'Wie geht es dir?', topicId: 'topic.greetings' }), 'Wie geht es dir?', 'accept', 'birebir'),
  c('gehts-ihnen', ex({ id: 'cal-gehts', type: 'free-text', instruction: 'Türkçeden Almancaya çevir:', prompt: 'Nasılsın? → ______', answer: 'Wie geht es dir?', topicId: 'topic.greetings' }), 'Wie geht es Ihnen?', 'reject', 'samimi/resmî ayrımı test edilir'),
  c('danke-exact', ex({ id: 'cal-danke', type: 'free-text', instruction: 'Türkçeden Almancaya çevir:', prompt: 'Teşekkürler. → ______', answer: 'Danke schön.', topicId: 'topic.greetings' }), 'Danke schön.', 'accept', 'birebir'),
  c('danke-bitte', ex({ id: 'cal-danke', type: 'free-text', instruction: 'Türkçeden Almancaya çevir:', prompt: 'Teşekkürler. → ______', answer: 'Danke schön.', topicId: 'topic.greetings' }), 'Bitte.', 'reject', 'farklı kalıp'),

  /* ---- Modal anlam ikameleri ---- */
  c('sollen-exact', ex({ id: 'cal-sollen', type: 'free-text', instruction: 'Türkçeden Almancaya çevir:', prompt: 'Erken gelmelisin. → ______', answer: 'Du sollst früh kommen.', topicId: 'topic.modal-verbs' }), 'Du sollst früh kommen.', 'accept', 'birebir'),
  c('sollen-muss', ex({ id: 'cal-sollen', type: 'free-text', instruction: 'Türkçeden Almancaya çevir:', prompt: 'Erken gelmelisin. → ______', answer: 'Du sollst früh kommen.', topicId: 'topic.modal-verbs' }), 'Du musst früh kommen.', 'reject', 'farklı modal anlamı'),
  c('wollen-moegen', ex({ id: 'cal-wollen', type: 'free-text', instruction: 'Türkçeden Almancaya çevir:', prompt: 'Kahve istiyorum. → ______', answer: 'Ich will einen Kaffee.', topicId: 'topic.modal-verbs' }), 'Ich mag Kaffee.', 'reject', 'istek/sevgi ayrımı'),
  c('koennen-darf', ex({ id: 'cal-park-koennen', type: 'free-text', instruction: 'Türkçeden Almancaya çevir:', prompt: 'Burada park edebilirsin. → ______', answer: 'Du kannst hier parken.', topicId: 'topic.modal-verbs' }), 'Du darfst hier parken.', 'reject', 'yetenek/izin ayrımı'),

  /* ---- Perfekt ek varyasyonlar ---- */
  c('perf-gestern-ok', ex({ id: 'cal-ferngesehen', type: 'free-text', instruction: 'Türkçeden Almancaya çevir:', prompt: 'Dün televizyon izledim. → ______', answer: 'Ich habe gestern ferngesehen.', topicId: 'topic.perfekt' }), 'Gestern habe ich ferngesehen.', 'accept', 'geçerli sıra'),
  c('perf-gestern-drop', ex({ id: 'cal-ferngesehen', type: 'free-text', instruction: 'Türkçeden Almancaya çevir:', prompt: 'Dün televizyon izledim. → ______', answer: 'Ich habe gestern ferngesehen.', topicId: 'topic.perfekt' }), 'Ich habe ferngesehen.', 'reject', 'zaman belirteci eksik'),
  c('perf-sehen-part', ex({ id: 'cal-ferngesehen', type: 'free-text', instruction: 'Türkçeden Almancaya çevir:', prompt: 'Dün televizyon izledim. → ______', answer: 'Ich habe gestern ferngesehen.', topicId: 'topic.perfekt' }), 'Ich habe gestern fernsehen gesehen.', 'reject', 'yanlış partizip kullanımı'),
];

// Dativ'e özel vakalar (gerçek Dativ alıştırmalarına bağlı): ayrı dosyada.
CALIBRATION_CASES.push(...DATIV_CALIBRATION_CASES);

export const CALIBRATION_ACCEPT_COUNT = CALIBRATION_CASES.filter((c) => c.gold === 'accept').length;
export const CALIBRATION_REJECT_COUNT = CALIBRATION_CASES.filter((c) => c.gold === 'reject').length;

/**
 * Dativ'e özel etiketli semantik doğrulama vakaları.
 *
 * Her vaka GERÇEK bir Dativ alıştırmasına (yazılmış katmandaki kanonik
 * tanım + otomatik kısaltma varyantları) bağlanır; böylece birim testleri
 * uygulamanın gördüğü alıştırmayla birebir aynı şeyi doğrular.
 *
 * Kategori — beklenen karar yolu:
 *   order        geçerli kelime sırası → Jev (kabul beklenir)
 *   contraction  `zu dem` = `zum` → deterministik kabul (Jev yok)
 *   synonym      eşanlamlı içerik kelimesi / zararsız ek → Jev ya da deterministik kabul
 *   form         yanlış Dativ artikel / iyelik / zamir / çoğul -n → deterministik RET (Jev yok)
 *   preposition  yanlış edat → deterministik RET (Jev yok)
 *   meaning      Dativ doğru ama anlam farklı → Jev (ret beklenir)
 */

import type { Exercise } from '../../content/types';
import { DATIV_EXERCISES } from '../../content/authored/topics/dativ';
import type { CalibrationCase } from './calibration.fixtures';

export type DativCategory = 'order' | 'contraction' | 'synonym' | 'form' | 'preposition' | 'meaning';

export interface DativCalibrationCase extends CalibrationCase {
  category: DativCategory;
}

const AUTHORED = new Map(DATIV_EXERCISES.map((exercise) => [exercise.id, exercise]));

/** Yazılmış Dativ alıştırmasını çalışma zamanı `Exercise` şekline getirir. */
function real(id: string): Exercise {
  const authored = AUTHORED.get(id);
  if (!authored) throw new Error(`Dativ kalibrasyonu: bilinmeyen alıştırma ${id}`);
  return {
    ...authored,
    topic: 'Dativ',
    source: { file: 'authored', naturalKey: id },
    origin: 'authored',
  } as Exercise;
}

function d(
  id: string,
  exerciseId: string,
  userAnswer: string,
  gold: 'accept' | 'reject',
  category: DativCategory,
  note: string,
): DativCalibrationCase {
  return { id, exercise: real(exerciseId), userAnswer, gold, category, note };
}

export const DATIV_CALIBRATION_CASES: DativCalibrationCase[] = [
  /* ---- Zorunlu vakalar (görev §55) ---- */
  d('dat-case1-order', 'dat-tr-freund', 'Mit meinem Freund gehe ich.', 'accept', 'order', 'Dativ grubu başta, fiil ikinci — geçerli'),
  d('dat-case2-mein', 'dat-tr-freund', 'Ich gehe mit mein Freund.', 'reject', 'form', 'mit + mein: Dativ eki yok'),
  d('dat-case3-zu-dem', 'dat-tr-arzt', 'Ich gehe zu dem Arzt.', 'accept', 'contraction', 'kısaltma test edilmiyor: zu dem = zum'),
  d('dat-case4-zu-den', 'dat-tr-arzt', 'Ich gehe zu den Arzt.', 'reject', 'form', 'den: yanlış hâl/artikel'),
  d('dat-case5-meine', 'dat-tr-mutter', 'Ich spreche mit meine Mutter.', 'reject', 'form', 'meine → meiner olmalı'),
  d('dat-case6-freunde', 'dat-tr-freunde', 'Ich spiele mit meine Freunde.', 'reject', 'form', 'çoğul Dativ: meinen Freunden'),
  d('dat-case7-dich', 'dat-verb-helfe-dir-free', 'Ich helfe dich.', 'reject', 'form', 'helfen + Dativ: dir'),

  /* ---- Geçerli kelime sırası (Jev) ---- */
  d('dat-order-mutter', 'dat-tr-mutter', 'Mit meiner Mutter spreche ich.', 'accept', 'order', 'geçerli vurgu sırası'),
  d('dat-order-dir', 'dat-verb-helfe-dir-free', 'Dir helfe ich.', 'accept', 'order', 'sıra test edilmiyor'),
  d('dat-order-seit', 'dat-seit-monaten-free', 'Seit zwei Monaten lerne ich Deutsch.', 'accept', 'order', 'seit grubu başta'),
  d('dat-order-bus', 'dat-tr-bus', 'Mit dem Bus fahre ich.', 'accept', 'order', 'araç grubu başta'),
  d('dat-order-freunde', 'dat-tr-freunde', 'Mit meinen Freunden spiele ich.', 'accept', 'order', 'çoğul Dativ başta'),
  d('dat-order-tuerkei', 'dat-tr-tuerkei', 'Aus der Türkei komme ich.', 'accept', 'order', 'köken başta'),
  d('dat-order-akk', 'dat-akk-sehen-free', 'Meinen Freund sehe ich.', 'accept', 'order', 'Akkusativ nesne başta, biçim doğru'),
  d('dat-order-schwester', 'dat-tr-schwester', 'Mit meiner Schwester spreche ich.', 'accept', 'order', 'geçerli sıra'),
  d('dat-order-kinder', 'dat-pl-kinder-free', 'Mit den Kindern spreche ich.', 'accept', 'order', 'geçerli sıra'),
  d('dat-order-abend', 'dat-sb-abend', 'Ich spreche mit meiner Mutter am Abend.', 'accept', 'order', 'zaman sonda — A1 için kabul edilebilir'),
  d('dat-order-zug', 'dat-mit-zug-free', 'Mit dem Zug fahre ich nach Berlin.', 'accept', 'order', 'geçerli sıra'),
  d('dat-order-ihm', 'dat-tr-mit-ihm', 'Mit ihm spreche ich.', 'accept', 'order', 'zamir grubu başta'),

  /* ---- Kısaltma açık yazımı (deterministik kabul) ---- */
  d('dat-contr-zur', 'dat-tr-schule', 'Ich gehe zu der Schule.', 'accept', 'contraction', 'zu der = zur'),
  d('dat-contr-beim', 'dat-tr-beim-arzt', 'Ich bin bei dem Arzt.', 'accept', 'contraction', 'bei dem = beim'),
  d('dat-contr-vom', 'dat-tr-vom-arzt', 'Ich komme von dem Arzt.', 'accept', 'contraction', 'von dem = vom'),
  d('dat-contr-supermarkt', 'dat-tr-supermarkt', 'Ich gehe zu dem Supermarkt.', 'accept', 'contraction', 'zu dem = zum'),

  /* ---- Eşanlamlı / zararsız fark ---- */
  d('dat-syn-reden', 'dat-tr-mutter', 'Ich rede mit meiner Mutter.', 'accept', 'synonym', 'reden ≈ sprechen, Dativ aynı'),
  d('dat-syn-geschenk', 'dat-tr-geschenk', 'Das ist ein Geschenk von meinem Vater.', 'accept', 'synonym', 'kabul edilen tam cümle'),

  /* ---- Yanlış Dativ biçimi (deterministik ret) ---- */
  d('dat-form-meinen-freund', 'dat-tr-freund', 'Ich gehe mit meinen Freund.', 'reject', 'form', 'tekil eril Dativ: meinem'),
  d('dat-form-akk-meinem', 'dat-akk-sehen-free', 'Ich sehe meinem Freund.', 'reject', 'form', 'sehen + Akkusativ: meinen'),
  d('dat-form-den-bus', 'dat-tr-bus', 'Ich fahre mit den Bus.', 'reject', 'form', 'der Bus → dem'),
  d('dat-form-der-bus', 'dat-tr-bus', 'Ich fahre mit der Bus.', 'reject', 'form', 'Nominativ artikel'),
  d('dat-form-die-tuerkei', 'dat-tr-tuerkei', 'Ich komme aus die Türkei.', 'reject', 'form', 'die → der'),
  d('dat-form-kinder-n', 'dat-pl-kinder-free', 'Ich spreche mit den Kinder.', 'reject', 'form', 'çoğul Dativ -n eksik'),
  d('dat-form-freunde-n', 'dat-tr-freunde', 'Ich spiele mit meinen Freunde.', 'reject', 'form', 'çoğul Dativ -n eksik'),
  d('dat-form-zum-schule', 'dat-tr-schule', 'Ich gehe zum Schule.', 'reject', 'form', 'dişil → zur'),
  d('dat-form-zur-arzt', 'dat-tr-arzt', 'Ich gehe zur Arzt.', 'reject', 'form', 'eril → zum'),
  d('dat-form-bei-mein', 'dat-bei-vater-free', 'Ich bin bei mein Vater.', 'reject', 'form', 'bei + meinem'),
  d('dat-form-mit-sie', 'dat-pron-ihr-free', 'Ich spreche mit sie.', 'reject', 'form', 'Dativ zamiri: ihr'),
  d('dat-form-mit-ihn', 'dat-tr-mit-ihm', 'Ich spreche mit ihn.', 'reject', 'form', 'Akkusativ zamiri: ihm olmalı'),
  d('dat-form-monate', 'dat-seit-monaten-free', 'Ich lerne seit zwei Monate Deutsch.', 'reject', 'form', 'Monaten'),
  d('dat-form-order-mein', 'dat-tr-freund', 'Mit mein Freund gehe ich.', 'reject', 'form', 'sıra doğru ama biçim yanlış'),
  d('dat-form-helfe-meine', 'dat-verb-helfen-mutter-free', 'Ich helfe meine Mutter.', 'reject', 'form', 'helfen + meiner'),
  d('dat-form-schwester-meine', 'dat-poss-schwester-free', 'Ich lerne mit meine Schwester.', 'reject', 'form', 'meiner olmalı'),
  d('dat-form-contr-den', 'dat-tr-supermarkt', 'Ich gehe zu den Supermarkt.', 'reject', 'form', 'açık yazımda da yanlış artikel'),

  /* ---- Yanlış edat (deterministik ret) ---- */
  d('dat-prep-von-tuerkei', 'dat-tr-tuerkei', 'Ich komme von der Türkei.', 'reject', 'preposition', 'köken: aus'),
  d('dat-prep-beim-gehe', 'dat-tr-arzt', 'Ich gehe beim Arzt.', 'reject', 'preposition', 'yön: zu, konum: bei'),
  d('dat-prep-zu-berlin', 'dat-mit-zug-free', 'Ich fahre mit dem Zug zu Berlin.', 'reject', 'preposition', 'şehir: nach'),
  d('dat-prep-bei-mutter', 'dat-tr-mutter', 'Ich spreche bei meiner Mutter.', 'reject', 'preposition', 'ile: mit'),

  /* ---- Anlam farkı (Dativ doğru; Jev ret beklenir) ---- */
  d('dat-mean-vater', 'dat-tr-freund', 'Ich gehe mit meinem Vater.', 'reject', 'meaning', 'arkadaş ≠ baba'),
  d('dat-mean-zug', 'dat-tr-bus', 'Ich fahre mit dem Zug.', 'reject', 'meaning', 'otobüs ≠ tren'),
  d('dat-mean-supermarkt', 'dat-tr-arzt', 'Ich gehe zum Supermarkt.', 'reject', 'meaning', 'doktor ≠ süpermarket'),
  d('dat-mean-spielen', 'dat-tr-mutter', 'Ich spiele mit meiner Mutter.', 'reject', 'meaning', 'konuşmak ≠ oynamak'),
  d('dat-mean-nicht', 'dat-tr-freund', 'Ich gehe nicht mit meinem Freund.', 'reject', 'meaning', 'olumsuzluk eklendi'),
  d('dat-mean-jahren', 'dat-seit-monaten-free', 'Ich lerne seit zwei Jahren Deutsch.', 'reject', 'meaning', 'iki ay ≠ iki yıl'),
  d('dat-mean-subject', 'dat-tr-freund', 'Wir gehen mit meinem Freund.', 'reject', 'meaning', 'özne değişti (hâl imzası da farklı)'),
];

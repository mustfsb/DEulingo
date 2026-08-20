/**
 * Kasadan gelen alistirmalarin ustveri etiketleri.
 *
 * Anahtar = `source.naturalKey`. Bu katman yalnizca ustveri EKLER;
 * alistirmanin ID'sine, sorusuna veya cevabina dokunmaz — bu yuzden
 * kayitli ilerleme oldugu gibi bagli kalir.
 */

import type { Difficulty, Skill } from '../types.ts';

export interface VaultTag {
  topicId: string;
  difficulty: Difficulty;
  skill: Skill;
  conceptIds: string[];
  familyId?: string;
  /** Cevaptan sonra okunusu gosterilecek ek Almanca dizeler. */
  pronounce?: string[];
}

export const VAULT_TAGS: Record<string, VaultTag> = {
  /* ---------------------------------------------------------------- */
  /* 1. Gün                                                            */
  /* ---------------------------------------------------------------- */
  '1/1/1': {
    topicId: 'day1.alfabe-telaffuz',
    difficulty: 'easy',
    skill: 'recognition',
    conceptIds: ['day1.kombinasyon.ei'],
    familyId: 'd1-komb-ei',
    pronounce: ['nein'],
  },
  '1/1/2': {
    topicId: 'day1.alfabe-telaffuz',
    difficulty: 'easy',
    skill: 'recognition',
    conceptIds: ['day1.kombinasyon.ie'],
    familyId: 'd1-komb-ie',
    pronounce: ['wie'],
  },
  '1/1/3': {
    topicId: 'day1.alfabe-telaffuz',
    difficulty: 'easy',
    skill: 'recognition',
    conceptIds: ['day1.kombinasyon.eu-aeu'],
    familyId: 'd1-komb-eu',
    pronounce: ['Europa'],
  },
  '1/1/4': {
    topicId: 'day1.alfabe-telaffuz',
    difficulty: 'easy',
    skill: 'recognition',
    conceptIds: ['day1.kombinasyon.sch'],
    familyId: 'd1-komb-sch',
    pronounce: ['Schule'],
  },
  '1/2/oku': {
    topicId: 'day1.alfabe-telaffuz',
    difficulty: 'medium',
    skill: 'speaking',
    conceptIds: [
      'day1.kombinasyon.ei',
      'day1.kombinasyon.ie',
      'day1.kombinasyon.sch',
      'day1.telaffuz.sessiz-h',
    ],
    pronounce: ['nein', 'wie', 'Schule', 'wohnen'],
  },
  '1/3/1': {
    topicId: 'day1.alfabe-telaffuz',
    difficulty: 'medium',
    skill: 'recognition',
    conceptIds: ['day1.telaffuz.sessiz-h'],
    familyId: 'd1-sessiz-h',
    pronounce: ['gehen'],
  },
  '1/3/2': {
    topicId: 'day1.alfabe-telaffuz',
    difficulty: 'medium',
    skill: 'recognition',
    conceptIds: ['day1.telaffuz.z-ts'],
    familyId: 'd1-z',
    pronounce: ['Zahl'],
  },
  '1/3/3': {
    topicId: 'day1.alfabe-telaffuz',
    difficulty: 'medium',
    skill: 'recognition',
    conceptIds: ['day1.kombinasyon.ch-yumusak'],
    familyId: 'd1-ch',
    pronounce: ['ich'],
  },
  '1/3/4': {
    topicId: 'day1.alfabe-telaffuz',
    difficulty: 'medium',
    skill: 'recognition',
    conceptIds: ['day1.kombinasyon.ch-sert'],
    familyId: 'd1-ch',
    pronounce: ['doch'],
  },
  '1/4/a': {
    topicId: 'day1.selamlasma-vedalasma',
    difficulty: 'easy',
    skill: 'recognition',
    conceptIds: ['day1.selamlasma.guten-morgen'],
    familyId: 'd1-sel-morgen',
    pronounce: ['Guten Morgen'],
  },
  '1/4/b': {
    topicId: 'day1.selamlasma-vedalasma',
    difficulty: 'easy',
    skill: 'recognition',
    conceptIds: ['day1.selamlasma.guten-abend'],
    familyId: 'd1-sel-abend',
    pronounce: ['Guten Abend'],
  },
  '1/4/c': {
    topicId: 'day1.selamlasma-vedalasma',
    difficulty: 'medium',
    skill: 'recognition',
    conceptIds: ['day1.vedalasma.auf-wiederhoeren'],
    familyId: 'd1-wiederhoeren',
    pronounce: ['Auf Wiederhören'],
  },
  '1/5/1': {
    topicId: 'day1.selamlasma-vedalasma',
    difficulty: 'medium',
    skill: 'production',
    conceptIds: ['day1.vedalasma.auf-wiedersehen', 'day1.vedalasma.tschuess'],
    familyId: 'd1-veda-yuz',
    pronounce: ['Auf Wiedersehen'],
  },
  '1/5/2': {
    topicId: 'day1.selamlasma-vedalasma',
    difficulty: 'medium',
    skill: 'production',
    conceptIds: ['day1.vedalasma.bis-kaliplari'],
    familyId: 'd1-bis',
    pronounce: ['Bis Montag'],
  },
  '1/6/1': {
    topicId: 'day1.selamlasma-vedalasma',
    difficulty: 'hard',
    skill: 'correction',
    conceptIds: ['day1.selamlasma.gute-nacht'],
    familyId: 'd1-gute-nacht',
    pronounce: ['Gute Nacht'],
  },
  '1/6/2': {
    topicId: 'day1.selamlasma-vedalasma',
    difficulty: 'hard',
    skill: 'correction',
    conceptIds: ['day1.vedalasma.auf-wiederhoeren', 'day1.vedalasma.auf-wiedersehen'],
    familyId: 'd1-wiederhoeren',
    pronounce: ['Auf Wiederhören'],
  },
  '1/7/gorev': {
    topicId: 'day1.alfabe-telaffuz',
    difficulty: 'medium',
    skill: 'speaking',
    conceptIds: ['day1.alfabe.buchstabieren'],
  },
  '1/2-dakikalik-sesli-gorev/gorev': {
    topicId: 'day1.selamlasma-vedalasma',
    difficulty: 'medium',
    skill: 'speaking',
    conceptIds: [
      'day1.selamlasma.guten-morgen',
      'day1.alfabe.buchstabieren',
      'day1.vedalasma.tschuess',
    ],
  },

  /* ---------------------------------------------------------------- */
  /* 2. Gün                                                            */
  /* ---------------------------------------------------------------- */
  '2/1/1': {
    topicId: 'day2.kisi-zamirleri',
    difficulty: 'easy',
    skill: 'recall',
    conceptIds: ['day2.zamir.du'],
    familyId: 'd2-zamir-du',
    pronounce: ['du'],
  },
  '2/1/2': {
    topicId: 'day2.kisi-zamirleri',
    difficulty: 'easy',
    skill: 'recognition',
    conceptIds: ['day2.zamir.wir'],
    familyId: 'd2-zamir-wir',
    pronounce: ['wir'],
  },
  '2/1/3': {
    topicId: 'day2.kisi-zamirleri',
    difficulty: 'easy',
    skill: 'recall',
    conceptIds: ['day2.zamir.er-sie-es'],
    familyId: 'd2-zamir-sie',
    pronounce: ['sie'],
  },
  '2/1/4': {
    topicId: 'day2.kisi-zamirleri',
    difficulty: 'medium',
    skill: 'recall',
    conceptIds: ['day2.zamir.Sie-resmi', 'day2.zamir.sie-Sie-farki'],
    familyId: 'd2-zamir-Sie',
    pronounce: ['Sie'],
  },
  '2/2/kommen-ich': {
    topicId: 'day2.fiil-cekimi',
    difficulty: 'easy',
    skill: 'recall',
    conceptIds: ['day2.konjugation.ich-e', 'day2.konjugation.duzenli-fiiller'],
    familyId: 'd2-konj-ich-kommen',
    pronounce: ['komme'],
  },
  '2/2/kommen-du': {
    topicId: 'day2.fiil-cekimi',
    difficulty: 'medium',
    skill: 'recall',
    conceptIds: ['day2.konjugation.du-st', 'day2.konjugation.duzenli-fiiller'],
    familyId: 'd2-konj-du-kommen',
    pronounce: ['kommst'],
  },
  '2/2/kommen-wir': {
    topicId: 'day2.fiil-cekimi',
    difficulty: 'easy',
    skill: 'recall',
    conceptIds: ['day2.konjugation.wir-en', 'day2.konjugation.duzenli-fiiller'],
    familyId: 'd2-konj-wir-kommen',
    pronounce: ['kommen'],
  },
  '2/2/gehen-du': {
    topicId: 'day2.fiil-cekimi',
    difficulty: 'medium',
    skill: 'recall',
    conceptIds: ['day2.konjugation.du-st', 'day2.konjugation.duzenli-fiiller'],
    familyId: 'd2-konj-du-gehen',
    pronounce: ['gehst'],
  },
  '2/3/1': {
    topicId: 'day2.fiil-cekimi',
    difficulty: 'medium',
    skill: 'production',
    conceptIds: ['day2.konjugation.ich-e', 'day2.konjugation.ornek-cumleler'],
    familyId: 'd2-konj-ich-kommen',
    pronounce: ['Ich komme aus der Türkei.'],
  },
  '2/3/2': {
    topicId: 'day2.fiil-cekimi',
    difficulty: 'medium',
    skill: 'production',
    conceptIds: ['day2.konjugation.du-st'],
    familyId: 'd2-konj-du-kommen',
    pronounce: ['Du kommst aus Deutschland.'],
  },
  '2/3/3': {
    topicId: 'day2.fiil-cekimi',
    difficulty: 'medium',
    skill: 'production',
    conceptIds: ['day2.konjugation.wir-en', 'day2.konjugation.ornek-cumleler'],
    familyId: 'd2-konj-wir-trinken',
    pronounce: ['Wir trinken Wasser.'],
  },
  '2/4/1': {
    topicId: 'day2.sein-haben',
    difficulty: 'easy',
    skill: 'recall',
    conceptIds: ['day2.sein.cekim', 'day2.sein-haben.ayrim'],
    familyId: 'd2-sein-ich',
    pronounce: ['Ich bin Mustafa.'],
  },
  '2/4/2': {
    topicId: 'day2.sein-haben',
    difficulty: 'medium',
    skill: 'recall',
    conceptIds: ['day2.haben.cekim', 'day2.haben.var-yok'],
    familyId: 'd2-haben-ich',
    pronounce: ['Ich habe Zeit.'],
  },
  '2/4/3': {
    topicId: 'day2.sein-haben',
    difficulty: 'medium',
    skill: 'recall',
    conceptIds: ['day2.haben.cekim'],
    familyId: 'd2-haben-du',
    pronounce: ['Du hast ein Auto.'],
  },
  '2/4/4': {
    topicId: 'day2.sein-haben',
    difficulty: 'medium',
    skill: 'recall',
    conceptIds: ['day2.sein.cekim'],
    familyId: 'd2-sein-wir',
    pronounce: ['Wir sind müde.'],
  },
  '2/5/1': {
    topicId: 'day2.artikel',
    difficulty: 'easy',
    skill: 'recognition',
    conceptIds: ['day2.artikel.kelimeler', 'day2.artikel.der-die-das'],
    familyId: 'd2-artikel-tisch',
    pronounce: ['der Tisch'],
  },
  '2/5/2': {
    topicId: 'day2.artikel',
    difficulty: 'easy',
    skill: 'recognition',
    conceptIds: ['day2.artikel.kelimeler', 'day2.artikel.der-die-das'],
    familyId: 'd2-artikel-buch',
    pronounce: ['das Buch'],
  },
  '2/6/1': {
    topicId: 'day2.fiil-cekimi',
    difficulty: 'hard',
    skill: 'correction',
    conceptIds: ['day2.konjugation.du-st'],
    familyId: 'd2-konj-du-kommen',
    pronounce: ['Du kommst aus Deutschland.'],
  },
  '2/6/2': {
    topicId: 'day2.artikel',
    difficulty: 'hard',
    skill: 'correction',
    conceptIds: ['day2.yazim.cumle-buyuk-harf'],
    familyId: 'd2-buyuk-harf',
    pronounce: ['Ich bin Mustafa.'],
  },
  '2/7/1': {
    topicId: 'day2.fiil-cekimi',
    difficulty: 'hard',
    skill: 'production',
    conceptIds: ['day2.konjugation.ich-e', 'day2.konjugation.ornek-cumleler'],
    familyId: 'd2-satz-ich-kommen',
    pronounce: ['Ich komme aus der Türkei.'],
  },
  '2/7/2': {
    topicId: 'day2.fiil-cekimi',
    difficulty: 'hard',
    skill: 'production',
    conceptIds: ['day2.konjugation.du-st', 'day2.konjugation.ornek-cumleler'],
    familyId: 'd2-satz-du-wohnen',
    pronounce: ['Du wohnst in Berlin.'],
  },
  '2/2-dakikalik-sesli-gorev/gorev': {
    topicId: 'day2.sein-haben',
    difficulty: 'medium',
    skill: 'speaking',
    conceptIds: [
      'day2.zamir.ich',
      'day2.zamir.du',
      'day2.zamir.wir',
      'day2.sein.cekim',
      'day2.haben.cekim',
    ],
  },

  /* ---------------------------------------------------------------- */
  /* 3. Gün                                                            */
  /* ---------------------------------------------------------------- */
  '3/1/eslestirme': {
    topicId: 'day3.kendini-tanitma',
    difficulty: 'medium',
    skill: 'recognition',
    conceptIds: [
      'day3.soru.wie-heisst-du',
      'day3.soru.wo-wohnst-du',
      'day3.soru.woher-kommst-du',
      'day3.nasilsin.wie-gehts-dir',
    ],
    familyId: 'd3-soru-cevap',
    pronounce: [
      'Wie heißt du?',
      'Ich heiße Mustafa.',
      'Wo wohnst du?',
      'Ich wohne in Istanbul.',
      'Woher kommst du?',
      'Ich komme aus der Türkei.',
      "Wie geht's dir?",
      'Super!',
    ],
  },
  '3/2/1': {
    topicId: 'day3.kendini-tanitma',
    difficulty: 'hard',
    skill: 'production',
    conceptIds: ['day3.soru.woher-kommst-du'],
    familyId: 'd3-woher',
    pronounce: ['Woher kommst du?'],
  },
  '3/2/2': {
    topicId: 'day3.kendini-tanitma',
    difficulty: 'hard',
    skill: 'production',
    conceptIds: ['day3.soru.wo-wohnst-du'],
    familyId: 'd3-wo-wohnst',
    pronounce: ['Wo wohnst du?'],
  },
  '3/3/1': {
    topicId: 'day3.kendini-tanitma',
    difficulty: 'medium',
    skill: 'production',
    conceptIds: ['day3.soru.wie-heisst-du', 'day3.soru.du-sie-ayrimi'],
    familyId: 'd3-wie-heisst',
    pronounce: ['Wie heißt du?'],
  },
  '3/3/2': {
    topicId: 'day3.kendini-tanitma',
    difficulty: 'hard',
    skill: 'production',
    conceptIds: ['day3.soru.wie-heissen-sie', 'day3.soru.du-sie-ayrimi'],
    familyId: 'd3-wie-heissen-sie',
    pronounce: ['Wie heißen Sie?'],
  },
  '3/4/1': {
    topicId: 'day3.nasilsin',
    difficulty: 'easy',
    skill: 'production',
    conceptIds: ['day3.nasilsin.cevaplar'],
    familyId: 'd3-nasilsin-iyi',
    pronounce: ['Super!'],
  },
  '3/4/2': {
    topicId: 'day3.nasilsin',
    difficulty: 'easy',
    skill: 'production',
    conceptIds: ['day3.nasilsin.cevaplar'],
    familyId: 'd3-nasilsin-orta',
    pronounce: ['Es geht.'],
  },
  '3/4/3': {
    topicId: 'day3.nasilsin',
    difficulty: 'easy',
    skill: 'production',
    conceptIds: ['day3.nasilsin.cevaplar'],
    familyId: 'd3-nasilsin-kotu',
    pronounce: ['Schlecht.'],
  },
  '3/5/1': {
    topicId: 'day3.sayilar',
    difficulty: 'medium',
    skill: 'recall',
    conceptIds: ['day3.sayilar.13-19'],
    familyId: 'd3-say-15',
    pronounce: ['fünfzehn'],
  },
  '3/5/2': {
    topicId: 'day3.sayilar',
    difficulty: 'hard',
    skill: 'recall',
    conceptIds: ['day3.sayilar.16-17-istisna'],
    familyId: 'd3-say-istisna',
    pronounce: ['siebzehn'],
  },
  '3/5/3': {
    topicId: 'day3.sayilar',
    difficulty: 'medium',
    skill: 'recall',
    conceptIds: ['day3.sayilar.und-yapisi'],
    familyId: 'd3-say-24',
    pronounce: ['vierundzwanzig'],
  },
  '3/5/4': {
    topicId: 'day3.sayilar',
    difficulty: 'hard',
    skill: 'recall',
    conceptIds: ['day3.sayilar.und-yapisi', 'day3.sayilar.onluklar'],
    familyId: 'd3-say-35',
    pronounce: ['fünfunddreißig'],
  },
  '3/5/5': {
    topicId: 'day3.sayilar',
    difficulty: 'medium',
    skill: 'recognition',
    conceptIds: ['day3.sayilar.und-yapisi'],
    familyId: 'd3-say-21',
    pronounce: ['einundzwanzig'],
  },
  '3/5/6': {
    topicId: 'day3.sayilar',
    difficulty: 'easy',
    skill: 'recognition',
    conceptIds: ['day3.sayilar.13-19'],
    familyId: 'd3-say-13',
    pronounce: ['dreizehn'],
  },
  '3/6/1': {
    topicId: 'day3.kendini-tanitma',
    difficulty: 'hard',
    skill: 'correction',
    conceptIds: ['day3.cevap.kommen-aus', 'day3.cevap.aus-der-tuerkei'],
    familyId: 'd3-kommen-aus',
    pronounce: ['Ich komme aus der Türkei.'],
  },
  '3/7/1': {
    topicId: 'day3.kendini-tanitma',
    difficulty: 'medium',
    skill: 'production',
    conceptIds: ['day3.cevap.ich-heisse'],
    familyId: 'd3-satz-heisse',
    pronounce: ['Ich heiße Mustafa.'],
  },
  '3/7/2': {
    topicId: 'day3.kendini-tanitma',
    difficulty: 'medium',
    skill: 'production',
    conceptIds: ['day3.cevap.kommen-aus', 'day3.cevap.aus-der-tuerkei'],
    familyId: 'd3-satz-kommen',
    pronounce: ['Ich komme aus der Türkei.'],
  },
  '3/7/3': {
    topicId: 'day3.kendini-tanitma',
    difficulty: 'medium',
    skill: 'production',
    conceptIds: ['day3.cevap.wohnen-in'],
    familyId: 'd3-satz-wohne',
    pronounce: ['Ich wohne in Istanbul.'],
  },
  '3/2-dakikalik-sesli-gorev/gorev': {
    topicId: 'day3.kendini-tanitma',
    difficulty: 'medium',
    skill: 'speaking',
    conceptIds: [
      'day3.cevap.ich-heisse',
      'day3.cevap.kommen-aus',
      'day3.cevap.wohnen-in',
      'day3.nasilsin.cevaplar',
    ],
  },

  /* ---------------------------------------------------------------- */
  /* 4. Gün                                                            */
  /* ---------------------------------------------------------------- */
  '4/1/eslestirme': {
    topicId: 'day4.takvim-kelimeleri', difficulty: 'easy', skill: 'recognition',
    conceptIds: ['day4.takvim.hafta-gunleri', 'day4.takvim.aylar', 'day4.takvim.mevsimler'], familyId: 'd4-vault-takvim-match',
    pronounce: ['Montag', 'Donnerstag', 'Herbst', 'Januar', 'Winter', 'Mittwoch', 'Sommer'],
  },
  '4/2/1': {
    topicId: 'day4.takvim-sorulari', difficulty: 'medium', skill: 'production',
    conceptIds: ['day4.zaman.am-im'], familyId: 'd4-vault-am-montag', pronounce: ['am Montag'],
  },
  '4/2/2': {
    topicId: 'day4.takvim-sorulari', difficulty: 'medium', skill: 'production',
    conceptIds: ['day4.zaman.am-im'], familyId: 'd4-vault-im-mai', pronounce: ['im Mai'],
  },
  '4/2/3': {
    topicId: 'day4.takvim-sorulari', difficulty: 'easy', skill: 'production',
    conceptIds: ['day4.soru.welcher-tag'], familyId: 'd4-vault-heute-tag', pronounce: ['Heute ist Montag.'],
  },
  '4/3/dritter-mai': {
    topicId: 'day4.dogum-gunu-yas', difficulty: 'medium', skill: 'production',
    conceptIds: ['day4.dogum-gunu.wann', 'day4.tarih.am-en'], familyId: 'd4-vault-geburtstag', pronounce: ['Ich habe am dritten Mai Geburtstag.'],
  },
  '4/4/a': {
    topicId: 'day4.dogum-gunu-yas', difficulty: 'easy', skill: 'recognition',
    conceptIds: ['day4.sira-sayisi.temel'], familyId: 'd4-vault-ordinal-erste', pronounce: ['erste'],
  },
  '4/4/b': {
    topicId: 'day4.dogum-gunu-yas', difficulty: 'medium', skill: 'recognition',
    conceptIds: ['day4.sira-sayisi.temel'], familyId: 'd4-vault-ordinal-zwanzigste', pronounce: ['zwanzigste'],
  },
  '4/5/wie-alt-bist': {
    topicId: 'day4.dogum-gunu-yas', difficulty: 'medium', skill: 'recall',
    conceptIds: ['day4.yas.wie-alt'], familyId: 'd4-vault-wie-alt', pronounce: ['Wie alt bist du?'],
  },
  '4/5/wie-alt-bin': {
    topicId: 'day4.dogum-gunu-yas', difficulty: 'medium', skill: 'recall',
    conceptIds: ['day4.yas.wie-alt'], familyId: 'd4-vault-wie-alt', pronounce: ['Ich bin zwanzig Jahre alt.'],
  },
  '4/6/1': {
    topicId: 'day4.takvim-sorulari', difficulty: 'hard', skill: 'correction',
    conceptIds: ['day4.soru.welcher-tag', 'day4.zaman.am-im'], familyId: 'd4-vault-heute-tag', pronounce: ['Heute ist Montag.'],
  },
  '4/7/oku': {
    topicId: 'day4.takvim-kelimeleri', difficulty: 'medium', skill: 'speaking',
    conceptIds: ['day4.takvim.hafta-gunleri', 'day4.dogum-gunu.wann'], familyId: 'd4-vault-takvim-uretim',
    pronounce: ['Mittwoch', 'Ich habe am achten August Geburtstag.'],
  },
  '4/2-dakikalik-sesli-gorev/gorev': {
    topicId: 'day4.dogum-gunu-yas', difficulty: 'medium', skill: 'speaking',
    conceptIds: ['day4.takvim.hafta-gunleri', 'day4.dogum-gunu.wann', 'day4.yas.wie-alt'], familyId: 'd4-vault-takvim-sesli',
    pronounce: ['Ich habe am dritten Mai Geburtstag.', 'Wie alt bist du?'],
  },

  /* ---------------------------------------------------------------- */
  /* 5. Gün                                                            */
  /* ---------------------------------------------------------------- */
  '5/1/1': {
    topicId: 'day5.artikel-secimi', difficulty: 'easy', skill: 'recall',
    conceptIds: ['day5.artikel.artikel-cogul-not'], familyId: 'd5-vault-artikel-tisch', pronounce: ['der Tisch'],
  },
  '5/1/2': {
    topicId: 'day5.artikel-secimi', difficulty: 'easy', skill: 'recall',
    conceptIds: ['day5.artikel.artikel-cogul-not'], familyId: 'd5-vault-artikel-tasche', pronounce: ['die Tasche'],
  },
  '5/1/3': {
    topicId: 'day5.artikel-secimi', difficulty: 'easy', skill: 'recall',
    conceptIds: ['day5.artikel.artikel-cogul-not'], familyId: 'd5-vault-artikel-buch', pronounce: ['das Buch'],
  },
  '5/2/eslestirme': {
    topicId: 'day5.cogul-isimler', difficulty: 'easy', skill: 'recognition',
    conceptIds: ['day5.cogul.die', 'day5.cogul.ekler', 'day5.cogul.umlaut'], familyId: 'd5-vault-cogul-match',
    pronounce: ['die Bücher', 'die Taschen', 'die Äpfel', 'die Lehrer'],
  },
  '5/3/1': {
    topicId: 'day5.cogul-isimler', difficulty: 'medium', skill: 'production',
    conceptIds: ['day5.cogul.ekler', 'day5.cogul.die'], familyId: 'd5-vault-eier', pronounce: ['die Eier'],
  },
  '5/3/2': {
    topicId: 'day5.cogul-isimler', difficulty: 'medium', skill: 'production',
    conceptIds: ['day5.cogul.ekler', 'day5.cogul.die'], familyId: 'd5-vault-tage', pronounce: ['die Tage'],
  },
  '5/3/3': {
    topicId: 'day5.cogul-isimler', difficulty: 'medium', skill: 'production',
    conceptIds: ['day5.cogul.ekler', 'day5.cogul.die'], familyId: 'd5-vault-taschen', pronounce: ['die Taschen'],
  },
  '5/4/a': {
    topicId: 'day5.belirli-belirsiz', difficulty: 'medium', skill: 'recognition',
    conceptIds: ['day5.belirsiz.ein-eine'], familyId: 'd5-vault-ein-buch', pronounce: ['Das ist ein Buch.'],
  },
  '5/4/b': {
    topicId: 'day5.belirli-belirsiz', difficulty: 'medium', skill: 'recognition',
    conceptIds: ['day5.belirli.anlam'], familyId: 'd5-vault-die-tasche', pronounce: ['Das ist die Tasche.'],
  },
  '5/5/ein-buch': {
    topicId: 'day5.belirli-belirsiz', difficulty: 'medium', skill: 'production',
    conceptIds: ['day5.soru.was-ist-das', 'day5.belirsiz.ein-eine'], familyId: 'd5-vault-ein-buch', pronounce: ['Was ist das?', 'Das ist ein Buch.'],
  },
  '5/5/sind-buecher': {
    topicId: 'day5.belirli-belirsiz', difficulty: 'medium', skill: 'production',
    conceptIds: ['day5.soru.was-ist-das', 'day5.cogul.die'], familyId: 'd5-vault-sind-buecher', pronounce: ['Das sind Bücher.'],
  },
  '5/6/1': {
    topicId: 'day5.belirli-belirsiz', difficulty: 'hard', skill: 'correction',
    conceptIds: ['day5.cogul.die', 'day5.belirsiz.ein-eine'], familyId: 'd5-vault-sind-buecher', pronounce: ['Das sind Bücher.'],
  },
  '5/7/1': {
    topicId: 'day5.belirli-belirsiz', difficulty: 'medium', skill: 'production',
    conceptIds: ['day5.belirsiz.ein-eine'], familyId: 'd5-vault-eine-tasche', pronounce: ['Das ist eine Tasche.'],
  },
  '5/7/2': {
    topicId: 'day5.belirli-belirsiz', difficulty: 'hard', skill: 'production',
    conceptIds: ['day5.olumsuz.kein-keine', 'day5.cogul.die'], familyId: 'd5-vault-keine-buecher', pronounce: ['Das sind keine Bücher.'],
  },
  '5/2-dakikalik-sesli-gorev/gorev': {
    topicId: 'day5.belirli-belirsiz', difficulty: 'medium', skill: 'speaking',
    conceptIds: ['day5.belirli.anlam', 'day5.belirsiz.ein-eine', 'day5.soru.was-ist-das'], familyId: 'd5-vault-sesli-esya',
    pronounce: ['Das ist ein Buch.', 'Das ist das Buch.', 'Was ist das?'],
  },

  /* ---------------------------------------------------------------- */
  /* 6. Gün                                                            */
  /* ---------------------------------------------------------------- */
  '6/1/sprechen-ich': {
    topicId: 'day6.onemli-fiiller', difficulty: 'easy', skill: 'recall',
    conceptIds: ['day6.sprechen.anlam-cekim'], familyId: 'd6-vault-sprechen-ich', pronounce: ['ich spreche'],
  },
  '6/1/sprechen-du': {
    topicId: 'day6.onemli-fiiller', difficulty: 'medium', skill: 'recall',
    conceptIds: ['day6.sprechen.du-sprichst'], familyId: 'd6-vault-sprechen-du', pronounce: ['du sprichst'],
  },
  '6/1/sprechen-wir': {
    topicId: 'day6.onemli-fiiller', difficulty: 'easy', skill: 'recall',
    conceptIds: ['day6.sprechen.anlam-cekim'], familyId: 'd6-vault-sprechen-wir', pronounce: ['wir sprechen'],
  },
  '6/1/sprechen-ihr': {
    topicId: 'day6.onemli-fiiller', difficulty: 'medium', skill: 'recall',
    conceptIds: ['day6.sprechen.anlam-cekim'], familyId: 'd6-vault-sprechen-ihr', pronounce: ['ihr sprecht'],
  },
  '6/2/welche-sprache': {
    topicId: 'day6.onemli-fiiller', difficulty: 'medium', skill: 'production',
    conceptIds: ['day6.sprechen.du-sprichst'], familyId: 'd6-vault-welche-sprache', pronounce: ['Welche Sprache sprichst du?'],
  },
  '6/2/ich-spreche': {
    topicId: 'day6.onemli-fiiller', difficulty: 'medium', skill: 'production',
    conceptIds: ['day6.diller.ich-spreche'], familyId: 'd6-vault-ich-spreche', pronounce: ['Ich spreche Türkisch und Deutsch.'],
  },
  '6/3/1': {
    topicId: 'day6.ulkeler-aus', difficulty: 'easy', skill: 'production',
    conceptIds: ['day6.ulkeler.artikelsiz'], familyId: 'd6-vault-aus-deutschland', pronounce: ['Ich komme aus Deutschland.'],
  },
  '6/3/2': {
    topicId: 'day6.ulkeler-aus', difficulty: 'medium', skill: 'production',
    conceptIds: ['day6.ulkeler.artikelli'], familyId: 'd6-vault-aus-tuerkei', pronounce: ['Ich komme aus der Türkei.'],
  },
  '6/3/3': {
    topicId: 'day6.ulkeler-aus', difficulty: 'hard', skill: 'production',
    conceptIds: ['day6.ulkeler.usa'], familyId: 'd6-vault-aus-usa', pronounce: ['Ich komme aus den USA.'],
  },
  '6/4/uyruk-dil-eslestirme': {
    topicId: 'day6.uyruklar-diller', difficulty: 'medium', skill: 'recognition',
    conceptIds: ['day6.uyruk.erkek-kadin', 'day6.diller.ich-spreche'], familyId: 'd6-vault-uyruk-dil-match',
    pronounce: ['Deutsche', 'Deutsch', 'Türkin', 'Türkisch', 'Französin', 'Französisch'],
  },
  '6/5/1': {
    topicId: 'day6.onemli-fiiller', difficulty: 'hard', skill: 'correction',
    conceptIds: ['day6.sprechen.du-sprichst'], familyId: 'd6-vault-sprechen-du', pronounce: ['Du sprichst Deutsch.'],
  },
  '6/6/mini-diyalog': {
    topicId: 'day6.uyruklar-diller', difficulty: 'hard', skill: 'production',
    conceptIds: ['day6.ulkeler.artikelli', 'day6.diller.ich-spreche'], familyId: 'd6-vault-mini-diyalog',
    pronounce: ['Ich komme aus der Türkei.', 'Ich spreche Türkisch und Deutsch.'],
  },
  '6/7/1': {
    topicId: 'day6.uyruklar-diller', difficulty: 'medium', skill: 'recall',
    conceptIds: ['day6.uyruk.erkek-kadin'], familyId: 'd6-vault-turkin', pronounce: ['Ich bin Türkin.'],
  },
  '6/7/2': {
    topicId: 'day6.uyruklar-diller', difficulty: 'medium', skill: 'recall',
    conceptIds: ['day6.diller.ich-spreche'], familyId: 'd6-vault-turkisch', pronounce: ['Ich spreche Türkisch.'],
  },
  '6/7/3': {
    topicId: 'day6.uyruklar-diller', difficulty: 'medium', skill: 'recall',
    conceptIds: ['day6.uyruk.erkek-kadin'], familyId: 'd6-vault-deutscher', pronounce: ['Ich bin Deutscher.'],
  },
  '6/2-dakikalik-sesli-gorev/gorev': {
    topicId: 'day6.uyruklar-diller', difficulty: 'medium', skill: 'speaking',
    conceptIds: ['day6.ulkeler.woher-kommen', 'day6.diller.ich-spreche', 'day6.sprechen.du-sprichst'], familyId: 'd6-vault-sesli-kimlik',
    pronounce: ['Ich komme aus der Türkei.', 'Ich spreche Türkisch und Deutsch.', 'Welche Sprache sprichst du?'],
  },
};

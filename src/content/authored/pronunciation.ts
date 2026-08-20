/**
 * Turkce yaklasik okunus katmani.
 *
 * DURUS: Turkce yazim Almanca sesleri birebir veremez. Buradaki her cikti
 * "Yaklaşık okunuş" etiketiyle sunulur ve fonetik dogruluk iddiasi tasimaz.
 * Amac, Turkce konusan bir A1 ogrencisinin kelimeyi sesli okuyabilmesidir.
 *
 * Yazim uzlasimi kaynak dosyalardan alinmistir (İlk 3 Hafta Alıştırma.md
 * cevap anahtari): `nein` → "nayn", `Schule` → "şuule", `wohnen` → "voonen",
 * `wie` → uzun "i". Ozet dosyasindaki `Lehrer` → "Lehra" ornegine uyarak
 * kelime sonu `-er` → "a" yazilir.
 *
 * Once kurator sozlugu, kapsanmayan dizeler icin deterministik kural motoru.
 */

import type { Pronunciation } from '../types.ts';

/** Zor sesler icin kisa ogrenci notlari. */
export const NOTES = {
  chSoft: '`ch` sesi Türkçedeki tam bir "h" değildir; dili damağa yaklaştırıp yanaklardan çıkarılır.',
  chHard: '`ch` burada boğazdan gelen kaba bir "h" sesidir.',
  longVowel: 'Sesliden sonraki `h` okunmaz, sadece önündeki sesliyi uzatır.',
  finalEr: 'Kelime sonundaki `-er` hafif bir "a" gibi okunur.',
  z: '`z` harfi her zaman "ts" diye okunur.',
  sVoiced: 'Kelime başında sesliden önce gelen `s` "z" gibi okunur.',
  ss: '`ß` iki `s` demektir; sert bir "s" sesi verir.',
} as const;

interface LexiconEntry {
  tr: string;
  note?: string;
}

/**
 * Kurator sozlugu. Kurs materyalinde gecen kelime ve kaliplar.
 * Anahtarlar kucuk harfe cevrilerek aranir.
 */
const LEXICON: Record<string, LexiconEntry> = {
  /* -- 1. Gün: telaffuz örnekleri -------------------------------- */
  nein: { tr: 'nayn' },
  wie: { tr: 'vii', note: '`ie` uzun bir "i" sesidir.' },
  schule: { tr: 'şuule' },
  wohnen: { tr: 'voonen', note: NOTES.longVowel },
  gehen: { tr: 'geen', note: NOTES.longVowel },
  haus: { tr: 'haus' },
  europa: { tr: 'oyroopa' },
  deutschland: { tr: 'doyçlant' },
  tschüss: { tr: 'çüs' },
  ciao: { tr: 'çao' },
  ach: { tr: 'ah', note: NOTES.chHard },
  doch: { tr: 'doh', note: NOTES.chHard },
  ich: { tr: 'ih', note: NOTES.chSoft },
  milch: { tr: 'milh', note: NOTES.chSoft },
  zahl: { tr: 'tsaal', note: NOTES.z },
  sagen: { tr: 'zaagen', note: NOTES.sVoiced },
  sport: { tr: 'şport' },
  stuhl: { tr: 'ştuul' },
  lehrer: { tr: 'leera', note: NOTES.finalEr },
  heißen: { tr: 'haysen', note: NOTES.ss },
  heissen: { tr: 'haysen', note: NOTES.ss },

  /* -- 1. Gün: selamlaşma / vedalaşma ---------------------------- */
  hallo: { tr: 'halo' },
  hi: { tr: 'hay' },
  moin: { tr: 'moyn' },
  'grüß gott': { tr: 'grüs got' },
  'guten morgen': { tr: 'guuten morgen' },
  'guten tag': { tr: 'guuten taak' },
  'guten abend': { tr: 'guuten aabent' },
  'gute nacht': { tr: 'guute naht', note: NOTES.chHard },
  'auf wiedersehen': { tr: 'auf viiderzeen' },
  'auf wiederhören': { tr: 'auf viiderhören' },
  'bis bald': { tr: 'bis balt' },
  'bis dann': { tr: 'bis dan' },
  'bis gleich': { tr: 'bis glayh', note: NOTES.chSoft },
  'bis nachher': { tr: 'bis nahhea' },
  'bis montag': { tr: 'bis moontaak' },
  'bis nächste woche': { tr: 'bis nehste vohe' },

  /* -- 2. Gün: zamirler ------------------------------------------ */
  du: { tr: 'du' },
  er: { tr: 'eea', note: NOTES.finalEr },
  sie: { tr: 'zii', note: NOTES.sVoiced },
  es: { tr: 'es' },
  wir: { tr: 'viia' },
  ihr: { tr: 'iia' },

  /* -- 2. Gün: düzenli fiiller ----------------------------------- */
  kommen: { tr: 'komen' },
  komme: { tr: 'kome' },
  kommst: { tr: 'komst' },
  kommt: { tr: 'komt' },
  gehe: { tr: 'geee', note: NOTES.longVowel },
  gehst: { tr: 'geest', note: NOTES.longVowel },
  geht: { tr: 'geet', note: NOTES.longVowel },
  wohne: { tr: 'voone', note: NOTES.longVowel },
  wohnst: { tr: 'voonst', note: NOTES.longVowel },
  wohnt: { tr: 'voont', note: NOTES.longVowel },
  heiße: { tr: 'hayse' },
  heisse: { tr: 'hayse' },
  heißt: { tr: 'hayst' },
  heisst: { tr: 'hayst' },
  trinken: { tr: 'trinken' },
  trinke: { tr: 'trinke' },
  trinkst: { tr: 'trinkst' },
  trinkt: { tr: 'trinkt' },

  /* -- 2. Gün: sein / haben -------------------------------------- */
  sein: { tr: 'zayn', note: NOTES.sVoiced },
  bin: { tr: 'bin' },
  bist: { tr: 'bist' },
  ist: { tr: 'ist' },
  sind: { tr: 'zint' },
  seid: { tr: 'zayt' },
  haben: { tr: 'haaben' },
  habe: { tr: 'haabe' },
  hast: { tr: 'hast' },
  hat: { tr: 'hat' },
  habt: { tr: 'hapt' },

  /* -- 2. Gün: artikel ve isimler -------------------------------- */
  der: { tr: 'dea', note: NOTES.finalEr },
  die: { tr: 'dii' },
  das: { tr: 'das' },
  tisch: { tr: 'tiş' },
  lampe: { tr: 'lampe' },
  buch: { tr: 'buuh', note: NOTES.chHard },
  wasser: { tr: 'vasa', note: NOTES.finalEr },
  auto: { tr: 'auto' },
  zeit: { tr: 'tsayt', note: NOTES.z },
  hunger: { tr: 'hunga', note: NOTES.finalEr },
  müde: { tr: 'müüde' },
  vater: { tr: 'faata', note: NOTES.finalEr },
  hause: { tr: 'hauze' },
  türkei: { tr: 'türkay' },
  berlin: { tr: 'berliin' },
  istanbul: { tr: 'istanbul' },
  mustafa: { tr: 'mustafa' },
  aus: { tr: 'aus' },
  in: { tr: 'in' },
  ein: { tr: 'ayn' },
  nach: { tr: 'nah', note: NOTES.chHard },
  und: { tr: 'unt' },
  nicht: { tr: 'niht', note: NOTES.chSoft },

  /* -- 3. Gün: soru ve cevap kalıpları --------------------------- */
  'wie heißt du': { tr: 'Vii hayst du' },
  'wie heißen sie': { tr: 'Vii haysen zii' },
  'wie ist dein name': { tr: 'Vii ist dayn naame' },
  'wie ist ihr name': { tr: 'Vii ist iia naame' },
  'wer bist du': { tr: 'Vea bist du' },
  'wer sind sie': { tr: 'Vea zint zii' },
  'wo wohnst du': { tr: 'Voo voonst du' },
  'wo wohnen sie': { tr: 'Voo voonen zii' },
  'woher kommst du': { tr: 'Vohea komst du' },
  'woher kommen sie': { tr: 'Vohea komen zii' },
  'ich heiße mustafa': { tr: 'İh hayse Mustafa' },
  'ich bin mustafa': { tr: 'İh bin Mustafa' },
  'ich wohne in istanbul': { tr: 'İh voone in İstanbul' },
  'ich komme aus der türkei': { tr: 'İh kome aus dea türkay' },
  'du kommst aus deutschland': { tr: 'Du komst aus doyçlant' },
  'du wohnst in berlin': { tr: 'Du voonst in berliin' },
  'wir trinken wasser': { tr: 'Viia trinken vasa' },
  'ich habe zeit': { tr: 'İh haabe tsayt' },
  'ich habe hunger': { tr: 'İh haabe hunga' },
  'du hast ein auto': { tr: 'Du hast ayn auto' },
  'wir sind müde': { tr: 'Viia zint müüde' },
  'du gehst nach hause': { tr: 'Du geest nah hauze' },
  "wie geht's dir": { tr: 'Vii geets dia' },
  'wie geht es dir': { tr: 'Vii geet es dia' },
  'wie geht es ihnen': { tr: 'Vii geet es iinen' },
  'es geht mir gut': { tr: 'Es geet mia guut' },
  'ich buchstabiere': { tr: 'İh buuhştabiire' },
  'mein vater ist lehrer': { tr: 'Mayn faata ist leera' },

  /* -- 3. Gün: Nasılsın? cevapları ------------------------------- */
  super: { tr: 'zuupa', note: NOTES.finalEr },
  spitze: { tr: 'şpitse' },
  sehr: { tr: 'zea', note: NOTES.finalEr },
  gut: { tr: 'guut' },
  'es geht': { tr: 'es geet' },
  'nicht so gut': { tr: 'niht zo guut' },
  schlecht: { tr: 'şleht', note: NOTES.chSoft },
  fürchterlich: { tr: 'fürhtalih', note: NOTES.chSoft },

  /* -- 3. Gün: sayılar ------------------------------------------- */
  null: { tr: 'nul' },
  eins: { tr: 'ayns' },
  zwei: { tr: 'tsvay', note: NOTES.z },
  drei: { tr: 'dray' },
  vier: { tr: 'fiia' },
  fünf: { tr: 'fünf' },
  sechs: { tr: 'zeks' },
  sieben: { tr: 'ziiben' },
  acht: { tr: 'aht', note: NOTES.chHard },
  neun: { tr: 'noyn' },
  zehn: { tr: 'tseen', note: NOTES.z },
  elf: { tr: 'elf' },
  zwölf: { tr: 'tsvölf' },
  dreizehn: { tr: 'draytseen' },
  vierzehn: { tr: 'fiatseen' },
  fünfzehn: { tr: 'fünftseen' },
  sechzehn: { tr: 'zehtseen' },
  siebzehn: { tr: 'ziiptseen' },
  achtzehn: { tr: 'ahtseen' },
  neunzehn: { tr: 'noyntseen' },
  zwanzig: { tr: 'tsvantsih', note: 'Kelime sonundaki `-ig` "ih" gibi okunur.' },
  dreißig: { tr: 'draysih' },
  einundzwanzig: { tr: 'aynunttsvantsih' },
  vierundzwanzig: { tr: 'fiiaunttsvantsih' },
  fünfunddreißig: { tr: 'fünfuntdraysih' },
};

/* ------------------------------------------------------------------ */
/* Kural motoru                                                        */
/* ------------------------------------------------------------------ */

const VOWELS = 'aeiouäöüy';

/**
 * `ch` ve kelime sonu `-ig` sesleri de "h" ile yazilir, ama bunlar sessiz
 * uzatma `h`'si DEGILDIR. Uzatma kurali onlara dokunmasin diye gecici bir
 * isaretleyiciye alinir, kural bittikten sonra geri konur.
 */
const H_MARK = '';

/** Tek bir Almanca sozcugu Turkce yaklasik okunusa cevirir. */
export function transliterateWord(word: string): string {
  let text = word.toLocaleLowerCase('de');

  // Sirasi onemli: uzun kombinasyonlar once.
  text = text.replace(/tsch/g, 'ç');
  text = text.replace(/sch/g, 'ş');
  text = text.replace(/^sp/, 'şp').replace(/^st/, 'şt');
  text = text.replace(/qu/g, 'kv');

  // `ch` iki sesi de "h" ile yazilir; fark note ile aciklanir.
  text = text.replace(/ch/g, H_MARK);

  text = text.replace(/eu/g, 'oy').replace(/äu/g, 'oy');
  text = text.replace(/ei/g, 'ay');
  text = text.replace(/ie/g, 'ii');

  text = text.replace(/ß/g, 's').replace(/ss/g, 's');

  // Sesliden sonra gelen `h` okunmaz.
  //  - Iki sesli arasindaysa yalnizca duser: `gehen` → "geen", `sehen` → "zeen".
  //  - Sessizden once ya da kelime sonundaysa onceki sesliyi uzatir:
  //    `wohnen` → "voonen", `Zahl` → "tsaal".
  text = text.replace(new RegExp(`([${VOWELS}])h(?=[${VOWELS}])`, 'g'), '$1');
  text = text.replace(new RegExp(`([${VOWELS}])h(?=[^${VOWELS}]|$)`, 'g'), '$1$1');

  // Kelime sonu ekleri sessiz `h` cozuldukten SONRA uygulanir; aksi halde
  // `sehr` → "zeer", `Lehrer` → "leerer" gibi yanlis sonuclar cikar.
  text = text.replace(/er$/, 'a');
  text = text.replace(/ig$/, `i${H_MARK}`);

  text = text.replace(new RegExp(H_MARK, 'g'), 'h');

  text = text.replace(/z/g, 'ts');
  text = text.replace(/v/g, 'f');
  text = text.replace(/w/g, 'v');
  text = text.replace(/j/g, 'y');

  // Kelime basinda sesliden once `s` → "z".
  text = text.replace(new RegExp(`^s(?=[${VOWELS}])`), 'z');

  text = text.replace(/ä/g, 'e');

  // Kelime sonu sert sessizlesme.
  text = text.replace(/d$/, 't').replace(/b$/, 'p').replace(/g$/, 'k');

  return text;
}

/** Kaynak sozcugun bas harf buyuklugunu ciktiya tasir (Turkce `i` → `İ`). */
function matchCase(source: string, output: string): string {
  if (!output) return output;
  const first = source[0];
  if (first && first === first.toLocaleUpperCase('de') && first !== first.toLocaleLowerCase('de')) {
    return output[0].toLocaleUpperCase('tr') + output.slice(1);
  }
  return output;
}

/** Sozlukte aranacak bicim: kucuk harf, sondaki noktalama atilmis. */
function lookupKey(value: string): string {
  return value
    .normalize('NFC')
    .replace(/[.!?,;:]+$/g, '')
    .trim()
    .toLocaleLowerCase('de');
}

/**
 * Bir Almanca kelime ya da cumlenin yaklasik okunusunu uretir.
 *
 * Once tam kalip sozlukte aranir, sonra kelime kelime cozulur;
 * sozlukte olmayan kelimeler kural motoruna dusulur.
 */
export function approximate(german: string): Pronunciation {
  const phraseKey = lookupKey(german);
  const phrase = LEXICON[phraseKey];
  if (phrase) {
    // Tek sozcukluk kayitlar sozlukte kucuk harfle tutulur; kaynagin
    // bas harf buyuklugu ciktiya tasinir (`Deutschland` → `Doyçlant`).
    const cased = phraseKey.includes(' ') ? phrase.tr : matchCase(german.trim(), phrase.tr);
    return {
      german,
      turkishApproximation: withTrailingPunctuation(german, cased),
      ...(phrase.note ? { note: phrase.note } : {}),
    };
  }

  const notes: string[] = [];
  const words = german.split(/\s+/).filter(Boolean);
  const rendered = words.map((word) => {
    const key = lookupKey(word);
    const entry = LEXICON[key];
    const punctuation = word.match(/[.!?,;:]+$/)?.[0] ?? '';
    const base = entry ? entry.tr : transliterateWord(key);
    if (entry?.note && !notes.includes(entry.note)) notes.push(entry.note);
    else if (!entry && /ch/.test(key) && !notes.includes(NOTES.chSoft)) notes.push(NOTES.chSoft);
    return matchCase(word, base) + punctuation;
  });

  return {
    german,
    turkishApproximation: rendered.join(' '),
    // Tek bir not gosterilir; geri bildirim karti asiri yuklenmemeli.
    ...(notes.length ? { note: notes[0] } : {}),
  };
}

function withTrailingPunctuation(source: string, output: string): string {
  const punctuation = source.trim().match(/[.!?]+$/)?.[0];
  return punctuation && !/[.!?]$/.test(output) ? output + punctuation : output;
}

/** Sozlukte acikca tanimli mi? (denetim raporu icin) */
export function isCurated(german: string): boolean {
  return lookupKey(german) in LEXICON;
}

export const LEXICON_SIZE = Object.keys(LEXICON).length;

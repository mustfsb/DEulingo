/**
 * Kurasyon katmani.
 *
 * Otomatik ayristirmanin belirsiz kaldigi (ya da kaynak metnin serbest yazilmis
 * oldugu) durumlarda kullanilir. Kaynak Obsidian dosyalari ASLA degistirilmez;
 * duzeltme her zaman burada yapilir.
 *
 * Anahtar bicimi: `gün/bölüm` veya `gün/bölüm/madde`
 */

import type { Exercise } from './types.ts';
import type { DraftExercise } from './parser/extract.ts';

export interface SectionOverride {
  mode: 'replace' | 'append';
  /** Neden gerekli oldugunun kisa aciklamasi — sync raporunda gosterilir. */
  reason: string;
  exercises: Array<Partial<DraftExercise> & { itemKey: string; type: Exercise['type'] }>;
}

export type ExercisePatch = Partial<Omit<Exercise, 'id' | 'source'>> & { reason?: string };

/** Bolum duzeyinde ekleme/degistirme. */
export const SECTION_OVERRIDES: Record<string, SectionOverride> = {
  '4/3': {
    mode: 'replace',
    reason: 'Kaynakta iki boşluk tek tarih kalıbı olarak yazılmış; kanonik tarih cevabı elle tanımlandı.',
    exercises: [
      {
        itemKey: 'dritter-mai', type: 'fill-blank', instruction: 'Doğum günü tarihini tamamla.',
        prompt: 'Ich habe am ___ Mai Geburtstag.', answer: 'dritten',
        explanation: 'Tarih kalıbında `am dritten Mai` denir.',
      },
    ],
  },
  '4/5': {
    mode: 'replace',
    reason: 'Diyalogdaki iki boşluk aynı bölümde yazıldığı için ayrı çekim alıştırmalarına dönüştürüldü.',
    exercises: [
      { itemKey: 'wie-alt-bist', type: 'fill-blank', instruction: '`sein` fiilini `du` ile çek.', prompt: 'Wie alt ___ du?', answer: 'bist' },
      { itemKey: 'wie-alt-bin', type: 'fill-blank', instruction: '`sein` fiilini `ich` ile çek.', prompt: 'Ich ___ zwanzig Jahre alt.', answer: 'bin' },
    ],
  },
  '5/5': {
    mode: 'replace',
    reason: 'İki diyalog boşluğu serbest kod bloğunda olduğu için kanonik tekil ve çoğul cevaplara ayrıldı.',
    exercises: [
      { itemKey: 'ein-buch', type: 'fill-blank', instruction: '`Was ist das?` sorusuna kitapla cevap ver.', prompt: 'Das ist ___ Buch.', answer: 'ein' },
      { itemKey: 'sind-buecher', type: 'fill-blank', instruction: 'Çoğul cevabı tamamla.', prompt: 'Das ___ Bücher.', answer: 'sind' },
    ],
  },
  '6/1': {
    mode: 'replace',
    reason: 'Dört satırlı çekim tablosunun cevapları tek satırda verildiği için her kişi için ayrı alıştırma tanımlandı.',
    exercises: [
      { itemKey: 'sprechen-ich', type: 'fill-blank', instruction: '`sprechen` fiilini `ich` ile çek.', prompt: 'ich ___', answer: 'spreche' },
      { itemKey: 'sprechen-du', type: 'fill-blank', instruction: '`sprechen` fiilini `du` ile çek.', prompt: 'du ___', answer: 'sprichst' },
      { itemKey: 'sprechen-wir', type: 'fill-blank', instruction: '`sprechen` fiilini `wir` ile çek.', prompt: 'wir ___', answer: 'sprechen' },
      { itemKey: 'sprechen-ihr', type: 'fill-blank', instruction: '`sprechen` fiilini `ihr` ile çek.', prompt: 'ihr ___', answer: 'sprecht' },
    ],
  },
  '6/2': {
    mode: 'replace',
    reason: 'Diyalogdaki iki boşluk ayrı düzensiz çekim alıştırmalarına ayrıldı.',
    exercises: [
      { itemKey: 'welche-sprache', type: 'fill-blank', instruction: 'Soru fiilini doğru çek.', prompt: 'Welche Sprache ___ du?', answer: 'sprichst' },
      { itemKey: 'ich-spreche', type: 'fill-blank', instruction: 'Cevap fiilini doğru çek.', prompt: 'Ich ___ Türkisch und Deutsch.', answer: 'spreche' },
    ],
  },
  '6/4': {
    mode: 'replace',
    reason: 'Tablodaki üç farklı boşluk, ülke-uyruk-dil bağını doğrudan ölçen eşleştirmeye dönüştürüldü.',
    exercises: [
      {
        itemKey: 'uyruk-dil-eslestirme', type: 'matching', instruction: 'Ülkeyi uyruk ve dille eşleştir.',
        pairs: [
          { left: 'Deutschland', right: 'Deutsche / Deutsch' },
          { left: 'die Türkei', right: 'Türkin / Türkisch' },
          { left: 'Frankreich', right: 'Französin / Französisch' },
        ],
      },
    ],
  },
  '6/6': {
    mode: 'replace',
    reason: 'Serbest mini diyalog, uygulamanın kanonik örnek cevabı olan tek üretim görevi olarak tanımlandı.',
    exercises: [
      {
        itemKey: 'mini-diyalog', type: 'free-text', instruction: 'Nereli olduğunu ve konuştuğun dilleri iki cümleyle söyle.',
        prompt: 'A: Woher kommst du?\nB: ___\nA: Welche Sprache sprichst du?\nB: ___',
        answer: 'Ich komme aus der Türkei. Ich spreche Türkisch und Deutsch.',
        acceptedAnswers: ['Ich komme aus der Türkei. Ich spreche Türkisch und Deutsch', 'Ich spreche Türkisch und Deutsch. Ich komme aus der Türkei.'],
        openEnded: true,
      },
    ],
  },
  '1/6': {
    mode: 'append',
    reason:
      '2. madde "Yanlış:" kalibi yerine düz soru cümlesiyle yazılmış; hata düzeltme olarak elle tanımlandı.',
    exercises: [
      {
        itemKey: '2',
        type: 'error-correction',
        instruction: 'Telefonda konuşmayı bitiriyorsun. Kalıbı düzelt.',
        prompt: 'Auf Wiedersehen!',
        answer: 'Auf Wiederhören!',
        acceptedAnswers: ['Auf Wiederhören'],
        explanation:
          '`Auf Wiedersehen` yüz yüze görüşmek içindir; telefonda `Auf Wiederhören` denir (`hören` = duymak).',
        validation: { punctuationSensitive: false },
      },
    ],
  },
  '3/7': {
    mode: 'replace',
    reason:
      'Kaynakta tek bir "3-4 cümle yaz" görevi var; cevap anahtarındaki üç örnek cümle üç ayrı cümle kurma alıştırmasına ayrıldı.',
    exercises: [
      {
        itemKey: '1',
        type: 'sentence-builder',
        instruction: 'Adını söyle: kelimelerle doğru cümleyi kur.',
        prompt: 'Adın: Mustafa',
        answer: 'Ich heiße Mustafa.',
      },
      {
        itemKey: '2',
        type: 'sentence-builder',
        instruction: 'Nereden geldiğini söyle: kelimelerle doğru cümleyi kur.',
        prompt: "Türkiye'densin",
        answer: 'Ich komme aus der Türkei.',
      },
      {
        itemKey: '3',
        type: 'sentence-builder',
        instruction: 'Nerede yaşadığını söyle: kelimelerle doğru cümleyi kur.',
        prompt: "İstanbul'da yaşıyorsun",
        answer: 'Ich wohne in Istanbul.',
        acceptedAnswers: ['Ich wohne in İstanbul.'],
      },
    ],
  },
};

/** Tek alistirma duzeyinde duzeltme. */
export const EXERCISE_PATCHES: Record<string, ExercisePatch> = {
  '2/6/2': {
    reason: 'Cevap anahtarı düz açıklama cümlesi; doğru yazım biçimi elle verildi.',
    instruction: 'Yazım hatasını düzelt.',
    prompt: 'ich bin Mustafa.',
    answer: 'Ich bin Mustafa.',
    explanation: 'Cümleler her zaman büyük harfle başlar: `ich` → `Ich`.',
    validation: { caseSensitive: true, punctuationSensitive: false },
  },
  '3/2/1': {
    reason: 'Soru kurma alıştırması kelime sıralama olarak sunuluyor (kelime dizilimi test ediliyor).',
    type: 'ordering',
    instruction: 'Bu cevaba uygun soruyu kur.',
    prompt: 'Ich komme aus der Türkei.',
  },
  '3/2/2': {
    reason: 'Soru kurma alıştırması kelime sıralama olarak sunuluyor (kelime dizilimi test ediliyor).',
    type: 'ordering',
    instruction: 'Bu cevaba uygun soruyu kur.',
    prompt: 'Ich wohne in Istanbul.',
  },
  '3/5/5': {
    reason: 'Kaynakta ters yönlü (Almanca → Türkçe) madde; yönerge ayrıştırılamıyor.',
    instruction: 'Sayının Türkçesini rakamla yaz.',
  },
  '3/5/6': {
    reason: 'Kaynakta ters yönlü (Almanca → Türkçe) madde; yönerge ayrıştırılamıyor.',
    instruction: 'Sayının Türkçesini rakamla yaz.',
  },
  '3/4/1': {
    reason: 'Kaynak "örnek cevaplar" diyor; özetteki diğer geçerli kalıplar kabul listesine eklendi.',
    acceptedAnswers: ['Sehr gut.', 'gut.', 'Spitze!', 'Mir geht es gut.', 'Es geht mir gut.'],
  },
  '3/4/3': {
    reason: 'Kaynak "örnek cevaplar" diyor; özetteki diğer geçerli kalıplar kabul listesine eklendi.',
    acceptedAnswers: ['Nicht so gut.', 'Fürchterlich.'],
  },
  '1/5/1': {
    reason: 'Özetteki diğer geçerli vedalaşma kalıpları kabul listesine eklendi.',
    acceptedAnswers: ['Tschüss!', 'Bis bald!', 'Bis dann!'],
  },
};

/**
 * Bolum yonergesi otomatik olarak ilk paragraftan alinir. Bolum etkilesimli bir
 * tipe donusturuldugunde ("yaz" → "seç") yonerge burada guncellenir.
 */
export const SECTION_INSTRUCTIONS: Record<string, string> = {
  '1/1': 'Bu harf kombinasyonu nasıl okunur?',
  '1/3': 'Kalın yazılan kısım bu kelimede nasıl davranıyor?',
};

/**
 * "Kendine Sor" cevap duzeltmeleri.
 *
 * Ozet dosyasinin 3. Gün cevap listesi kaynakta bir kaydirma iceriyor:
 * 1. cevap 2. soruya, 2. cevap 3. soruya karsilik geliyor ve son cevap
 * hicbir soruyla eslesmiyor. Kaynak dosya DEGISTIRILMEDEN burada duzeltilir.
 *
 * Anahtar: `gün` → soru sirasi (1 tabanli) → cevap.
 */
export const RECALL_ANSWER_FIX: Record<number, Record<number, string>> = {
  3: {
    1: '`ich`',
    2: '`Wie heißt du?` (samimi) / `Wie heißen Sie?` (resmî).',
    3: '`Wo wohnst du?` nerede oturduğunu, `Woher kommst du?` nereli olduğunu/nereden geldiğini sorar.',
    4: 'Örn. `Super!`, `Gut.`, `Es geht.`',
    5: '`einundzwanzig`.',
  },
};

/** UI'da gunun uzerinde gosterilecek konu adlari; Ozet dosyasindan gelmezse yedek. */
export const FALLBACK_DAY_TOPICS: Record<number, string[]> = {
  1: ['Alfabe ve Telaffuz', 'Selamlaşma ve Vedalaşma'],
  2: ['Kişi Zamirleri', 'Fiil Çekimi', 'sein / haben', 'Artikel'],
  3: ['Kendini Tanıtma', 'Nasılsın?', 'Sayılar'],
};

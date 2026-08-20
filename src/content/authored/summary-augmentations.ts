/**
 * Uygulama ici ek ozet aciklamalari.
 *
 * KURAL: Kaynak Obsidian dosyalari ASLA degistirilmez. Bir alistirmanin
 * gerektirdigi kucuk aciklama mevcut materyalden aciкca cikiyor ama Ozet
 * dosyasinda yazili degilse, ek not burada tanimlanir ve gosterim sirasinda
 * ozetle BIRLESTIRILIR.
 *
 * Ilgisiz yeni dilbilgisi eklenmez — her kayit `reason` ile gerekcelendirilir.
 */

import type { SummaryAugmentation } from './types.ts';

export const SUMMARY_AUGMENTATIONS: SummaryAugmentation[] = [
  {
    topicId: 'day2.fiil-cekimi',
    conceptIds: [
      'day2.konjugation.duzenli-fiiller',
      'day2.konjugation.ich-e',
      'day2.konjugation.du-st',
      'day2.konjugation.er-t',
      'day2.konjugation.wir-en',
    ],
    title: 'Aynı kuralı başka fiillerde gör',
    reason:
      'Özet yalnızca `kommen` tablosunu veriyor. Alıştırmalar aynı kuralı `wohnen`, `heißen` ve `trinken` üzerinde de soruyor; kural aynı olduğu için yeni bilgi eklemeden örnek çoğaltıldı.',
    paragraphs: [
      'Kural her düzenli fiilde aynıdır: kökü bul, takıyı ekle. Aşağıdaki tabloda `kommen` ile öğrendiğin takıların diğer fiillerde nasıl göründüğünü görebilirsin.',
    ],
    table: {
      head: ['Zamir', 'wohnen', 'trinken', 'heißen'],
      rows: [
        ['ich', 'wohne', 'trinke', 'heiße'],
        ['du', 'wohnst', 'trinkst', 'heißt'],
        ['er/sie/es', 'wohnt', 'trinkt', 'heißt'],
        ['wir', 'wohnen', 'trinken', 'heißen'],
        ['ihr', 'wohnt', 'trinkt', 'heißt'],
        ['sie/Sie', 'wohnen', 'trinken', 'heißen'],
      ],
    },
    examples: [
      { german: 'Er wohnt in Berlin.', turkish: "Berlin'de oturuyor." },
      { german: 'Ihr trinkt Wasser.', turkish: 'Su içiyorsunuz.' },
      { german: 'Wir gehen nach Hause.', turkish: 'Eve gidiyoruz.' },
    ],
    warning:
      '`heißen` fiilinin kökü `heiß-` zaten bir `s` sesi taşıdığı için `du` ve `er` biçimleri aynı görünür: `du heißt`, `er heißt`.',
  },
  {
    topicId: 'day2.artikel',
    conceptIds: ['day2.yazim.cumle-buyuk-harf'],
    title: 'İki farklı büyük harf kuralı',
    reason:
      'Özet yalnızca isimlerin büyük yazıldığını anlatıyor. Alıştırma cevap anahtarında `ich bin Mustafa.` → `Ich bin Mustafa.` düzeltmesi var; bu, cümle başı kuralıdır ve özette yazılı değil.',
    paragraphs: [
      'Almancada büyük harfle ilgili iki ayrı kural vardır ve ikisi de aynı cümlede işler:',
      '**1) Cümleler her zaman büyük harfle başlar.** Bu Türkçedeki kuralın aynısıdır. `ich bin Mustafa.` yanlış, `Ich bin Mustafa.` doğrudur.',
      '**2) Artikeli olan her isim, cümlenin neresinde olursa olsun büyük yazılır.** Bu Türkçede olmayan bir kuraldır.',
    ],
    examples: [
      { german: 'Ich bin Mustafa.', turkish: 'Ben Mustafa’yım.' },
      { german: 'Mein Vater ist Lehrer.', turkish: 'Babam öğretmen.' },
      { german: 'Wir trinken Wasser.', turkish: 'Su içiyoruz.' },
    ],
  },
  {
    topicId: 'day3.sayilar',
    conceptIds: ['day3.sayilar.11-12', 'day3.sayilar.onluklar'],
    title: '11, 12 ve onluklar',
    reason:
      'Özetin kendi kontrol listesi "0’dan 12’ye kadar sayabiliyorum" diyor ama `elf` ve `zwölf` tabloda yok. Onluklar da yalnızca `einundzwanzig` / `fünfunddreißig` kelimelerinin içinde geçiyor; alıştırmalar için ayrıca yazıldı.',
    paragraphs: [
      '`11` ve `12` kurala uymaz, ayrı ezberlenir. `13`’ten sonra "birler + zehn" mantığı başlar.',
      'Onlukları da bilmen gerekir, çünkü `einundzwanzig` gibi sayılar bunların üzerine kurulur.',
    ],
    table: {
      head: ['Sayı', 'Almanca'],
      rows: [
        ['11', 'elf'],
        ['12', 'zwölf'],
        ['20', 'zwanzig'],
        ['30', 'dreißig'],
      ],
    },
    examples: [
      { german: 'elf', turkish: '11' },
      { german: 'zwölf', turkish: '12' },
      { german: 'einundzwanzig', turkish: '21 — ein + und + zwanzig' },
      { german: 'fünfunddreißig', turkish: '35 — fünf + und + dreißig' },
    ],
    warning:
      'Onlukları ezberlemeden `und` yapısını kuramazsın: `zwanzig` = 20 ve `dreißig` = 30 bilinmeden `einundzwanzig` ya da `fünfunddreißig` üretilemez.',
  },
];

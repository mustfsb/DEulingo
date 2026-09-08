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

/** Tek müfredatta (Özel Ders Özet.md) ek açıklamaya gerek yok; boş tutulur. */
export const SUMMARY_AUGMENTATIONS: SummaryAugmentation[] = [];

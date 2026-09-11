/**
 * Uygulama ici ek ozet aciklamalari.
 *
 * Bir alistirmanin gerektirdigi kucuk aciklama mevcut materyalden acikca
 * cikiyor ama `Konu Özetleri.md` icinde yazili degilse, ek not burada
 * tanimlanir ve gosterim sirasinda ilgili ozet BOLUMUYLE birlestirilir.
 *
 * Ilgisiz yeni dilbilgisi eklenmez — her kayit `reason` ile gerekcelendirilir.
 */

import type { SummaryAugmentation } from './types.ts';

/** Kanonik konu özeti eksiksiz; ek açıklamaya gerek yok. */
export const SUMMARY_AUGMENTATIONS: SummaryAugmentation[] = [];

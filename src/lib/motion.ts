/**
 * Hareket belirtecleri (§43).
 *
 * Her bilesen kendi sure/egrisini uydurmasin diye tek kaynak. CSS tarafinda
 * ayni degerler `--motion-*` degiskenleriyle bulunur (`src/index.css`).
 */

export const MOTION = {
  fast: 120,
  normal: 200,
  rise: 240,
  /** Tam ekran kutlama animasyonunun kendisi. */
  celebration: 900,
  /** Kutlamanin ekranda kalma suresi — ogrenci beklemez (§17). */
  celebrationHold: 1150,
  /** Kucuk, kesintisiz onay (15+ esikler, gunluk hedef). */
  toastHold: 1600,
} as const;

/** `prefers-reduced-motion: reduce` acik mi? Test/SSR ortaminda false. */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

/**
 * Azaltilmis harekette kutlama TAMAMEN kaybolmaz: buyuk olcekleme ve
 * parcaciklar dusur, metni daha kisa sure goster (§44).
 */
export function celebrationHoldMs(reduced = prefersReducedMotion()): number {
  return reduced ? 700 : MOTION.celebrationHold;
}

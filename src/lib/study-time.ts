/**
 * Gerçek AKTİF çalışma süresi ölçümü (yerel, hafif, müdahalesiz).
 *
 * Ne sayılır: sekme görünürken geçen süre — son etkileşimden sonraki ilk
 * `IDLE_LIMIT_MS` dahil (okuma, düşünme, konuşma kaydı meşru çalışmadır).
 * Ne SAYILMAZ: arka plandaki sekme, uzun boşta kalma, bilgisayarın uykuda
 * geçirdiği süre (tek bir tik `TICK_MAX_MS` ile sınırlıdır).
 * İstisna: dış dinleme kaynağı başka sekmede açılır; ekran, medyanın
 * tahmini süresi kadar bir "uzakta çalışma payı" tanımlar ve dönüşte en
 * fazla o kadar süre eklenir (açık bırakılmış sekme süre kazandırmaz).
 *
 * Ses, metin ya da tuş içeriği kaydedilmez; yalnızca saniye toplanır.
 * Süre hiçbir şeyi KİLİTLEMEZ ve tamamlanma ölçütü değildir.
 */

/** Etkileşim olmadan sayılmaya devam eden süre (okuma/düşünme/konuşma). */
export const IDLE_LIMIT_MS = 120_000;
/** Tek tikte sayılabilecek en uzun aralık (uyku / kısılmış zamanlayıcı koruması). */
export const TICK_MAX_MS = 15_000;

export interface ClockState {
  lastTick: number;
  lastInteraction: number;
  visible: boolean;
  /** Sekmenin gizlendiği an (görünürken null). */
  hiddenAt: number | null;
  /** Gizliyken sayılabilecek en fazla süre (dış medya payı). */
  awayAllowanceMs: number;
}

export function createClock(now: number, visible = true): ClockState {
  return { lastTick: now, lastInteraction: now, visible, hiddenAt: visible ? null : now, awayAllowanceMs: 0 };
}

/** Görünür ve boşta değilken geçen süreyi döndürür (ms). */
export function tickClock(state: ClockState, now: number): { state: ClockState; addMs: number } {
  if (!state.visible) return { state: { ...state, lastTick: now }, addMs: 0 };
  const activeUntil = state.lastInteraction + IDLE_LIMIT_MS;
  const counted = Math.min(now, activeUntil) - state.lastTick;
  const addMs = Math.max(0, Math.min(counted, TICK_MAX_MS));
  return { state: { ...state, lastTick: now }, addMs };
}

export function interactClock(state: ClockState, now: number): ClockState {
  // Boştan dönüş: aradaki boşluk sayılmaz, sayaç bu andan devam eder.
  const resumed = now > state.lastInteraction + IDLE_LIMIT_MS;
  return { ...state, lastInteraction: now, lastTick: resumed ? now : state.lastTick };
}

/** Dış kaynağa geçiş: gizliyken en fazla `ms` kadar süre sayılabilir. */
export function allowAway(state: ClockState, ms: number): ClockState {
  return { ...state, awayAllowanceMs: Math.max(state.awayAllowanceMs, Math.max(0, ms)) };
}

export function hideClock(state: ClockState, now: number): { state: ClockState; addMs: number } {
  const ticked = tickClock(state, now);
  return { state: { ...ticked.state, visible: false, hiddenAt: now }, addMs: ticked.addMs };
}

export function showClock(state: ClockState, now: number): { state: ClockState; addMs: number } {
  const away = state.hiddenAt === null ? 0 : now - state.hiddenAt;
  const addMs = Math.max(0, Math.min(away, state.awayAllowanceMs));
  return {
    state: { ...state, visible: true, hiddenAt: null, awayAllowanceMs: 0, lastTick: now, lastInteraction: now },
    addMs,
  };
}

/** Ekranların (dış dinleme) saate pay tanımlaması için tek kanal. */
let pendingAwayMs = 0;
export function requestAwayAllowance(ms: number): void {
  pendingAwayMs = Math.max(pendingAwayMs, ms);
}
export function takeAwayAllowance(): number {
  const value = pendingAwayMs;
  pendingAwayMs = 0;
  return value;
}

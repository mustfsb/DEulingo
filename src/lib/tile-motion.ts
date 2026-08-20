export type TilePosition = Pick<DOMRect, 'left' | 'top'>;

/** FLIP animasyonu için önceki ve sonraki yerleşim arasındaki ters fark. */
export function getTileReflowDelta(
  previous: TilePosition | undefined,
  current: TilePosition,
): { x: number; y: number } | undefined {
  if (!previous) return undefined;
  const x = previous.left - current.left;
  const y = previous.top - current.top;
  return x || y ? { x, y } : undefined;
}

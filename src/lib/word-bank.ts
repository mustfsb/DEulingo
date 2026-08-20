/** Kimlikli kelime-bankası tokenları ve görünmez klavye eşleştirmesi. */
export interface WordBankToken {
  id: string;
  text: string;
  distractor?: boolean;
}

export function normalizeTileTyping(text: string): string {
  return text
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ß/g, 'ss')
    .toLocaleLowerCase('tr')
    .replace(/ı/g, 'i')
    .replace(/\s+/g, ' ');
}

/** Eşleşen normalize ön ekin kanonik tile üzerindeki karakter uzunluğu. */
export function typedPrefixLength(text: string, buffer: string): number {
  const typed = normalizeTileTyping(buffer);
  if (!typed) return 0;
  let normalizedPrefix = '';
  let length = 0;
  for (const character of Array.from(text)) {
    normalizedPrefix += normalizeTileTyping(character);
    length += character.length;
    if (normalizedPrefix === typed) return length;
    if (!typed.startsWith(normalizedPrefix)) return 0;
  }
  return 0;
}

export function selectedTokenText(ids: string[], tokens: WordBankToken[]): string[] {
  const byId = new Map(tokens.map((token) => [token.id, token.text]));
  return ids.map((id) => byId.get(id)).filter((text): text is string => text !== undefined);
}

/** Fareyle kullanılabilir tile'a tıklama: kimliği sıralı cevabın sonuna ekler. */
export function selectWordBankToken(selectedIds: string[], tokenId: string): string[] {
  return selectedIds.includes(tokenId) ? selectedIds : [...selectedIds, tokenId];
}

/** Seçilmiş tile'a tıklama: yalnızca o konumdaki kimliği bankaya geri verir. */
export function removeWordBankToken(selectedIds: string[], index: number): string[] {
  return selectedIds.filter((_, current) => current !== index);
}

export function evaluateWordBank(ids: string[], tokens: WordBankToken[], acceptedSequences: string[][]): boolean {
  const actual = selectedTokenText(ids, tokens).map(normalizeTileTyping);
  return acceptedSequences.some((sequence) => {
    const expected = sequence.map(normalizeTileTyping);
    return expected.length === actual.length && expected.every((token, index) => token === actual[index]);
  });
}

export interface TypedTileResolution {
  selectId?: string;
  candidates: WordBankToken[];
}

/**
 * Esdeger tekrarlar (iki `die`) tek bir yazim sayilir; farkli kelimeler ayni
 * oneke sahipse ancak tam eslesme ile secilir.
 */
export function resolveTypedTile(
  buffer: string,
  available: WordBankToken[],
  options: { commitUniquePrefix?: boolean } = {},
): TypedTileResolution {
  const typed = normalizeTileTyping(buffer);
  if (!typed) return { candidates: [] };
  const candidates = available.filter((token) => normalizeTileTyping(token.text).startsWith(typed));
  const exact = candidates.filter((token) => normalizeTileTyping(token.text) === typed);
  const exactSpellings = new Set(exact.map((token) => normalizeTileTyping(token.text)));
  if (exactSpellings.size === 1 && exact.length) return { selectId: exact[0].id, candidates };
  const spellings = new Set(candidates.map((token) => normalizeTileTyping(token.text)));
  // Normal yazımda kullanıcı `ich`in tamamını yazabilsin: tek harfli `i`
  // henüz tile'ı yutmaz. Tek aday önek, Space/Enter ile açıkça onaylanabilir.
  if (options.commitUniquePrefix && spellings.size === 1 && candidates.length) {
    return { selectId: candidates[0].id, candidates };
  }
  return { candidates };
}

export interface WordBankKeyState {
  key: string;
  buffer: string;
  selectedIds: string[];
  tokens: WordBankToken[];
}

export interface WordBankKeyResult {
  buffer: string;
  selectedIds: string[];
  handled: boolean;
  submit: boolean;
  usedTyping: boolean;
  noMatch: boolean;
}

/** Görünmez klavye girişi: hiçbir metin alanı oluşturmaz, yalnızca tile seçer. */
export function reduceWordBankKey(state: WordBankKeyState): WordBankKeyResult {
  const available = state.tokens.filter((token) => !state.selectedIds.includes(token.id));
  const base = { buffer: state.buffer, selectedIds: state.selectedIds, handled: true, submit: false, usedTyping: false, noMatch: false };
  if (state.key === 'Escape') return { ...base, buffer: '' };
  if (state.key === 'Backspace') {
    if (state.buffer) return { ...base, buffer: state.buffer.slice(0, -1) };
    return { ...base, selectedIds: state.selectedIds.slice(0, -1) };
  }
  if (state.key === 'Enter' || state.key === ' ') {
    if (!state.buffer) return { ...base, submit: state.key === 'Enter' };
    const resolved = resolveTypedTile(state.buffer, available, { commitUniquePrefix: true });
    return resolved.selectId
      ? { ...base, buffer: '', selectedIds: [...state.selectedIds, resolved.selectId], usedTyping: true }
      : base;
  }
  if (state.key.length !== 1 || /[\u0000-\u001f]/.test(state.key)) return { ...base, handled: false };
  const nextBuffer = `${state.buffer}${state.key}`;
  const resolved = resolveTypedTile(nextBuffer, available);
  if (!resolved.candidates.length) return { ...base, buffer: nextBuffer, usedTyping: true, noMatch: true };
  return resolved.selectId
    ? { ...base, buffer: '', selectedIds: [...state.selectedIds, resolved.selectId], usedTyping: true }
    : { ...base, buffer: nextBuffer, usedTyping: true };
}

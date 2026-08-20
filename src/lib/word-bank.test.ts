import { describe, expect, it } from 'vitest';
import {
  evaluateWordBank,
  normalizeTileTyping,
  reduceWordBankKey,
  removeWordBankToken,
  resolveTypedTile,
  selectWordBankToken,
  selectedTokenText,
  typedPrefixLength,
  type WordBankToken,
} from './word-bank';

const tokens: WordBankToken[] = [
  { id: 'ich-1', text: 'Ich' },
  { id: 'bin-1', text: 'bin' },
  { id: 'mustafa-1', text: 'Mustafa' },
  { id: 'bist-1', text: 'bist', distractor: true },
  { id: 'die-1', text: 'die' },
  { id: 'die-2', text: 'die' },
];

describe('word-bank selection model', () => {
  it('keeps duplicate words distinct through stable token ids', () => {
    expect(selectedTokenText(['die-2', 'die-1'], tokens)).toEqual(['die', 'die']);
  });

  it('models click-to-select and click-selected-to-remove without losing duplicate identity', () => {
    const selected = selectWordBankToken(selectWordBankToken([], 'die-1'), 'die-2');
    expect(selected).toEqual(['die-1', 'die-2']);
    expect(removeWordBankToken(selected, 0)).toEqual(['die-2']);
  });

  it('accepts only an authored target sequence or alternate Turkish sequence', () => {
    expect(
      evaluateWordBank(['ich-1', 'bin-1', 'mustafa-1'], tokens, [['Ich', 'bin', 'Mustafa']]),
    ).toBe(true);
    expect(
      evaluateWordBank(['bin-1', 'ich-1', 'mustafa-1'], tokens, [['Ich', 'bin', 'Mustafa']]),
    ).toBe(false);
    expect(
      evaluateWordBank(['mustafa-1', 'ich-1'], [
        { id: 'mustafa-1', text: "Mustafa'yım" },
        { id: 'ich-1', text: 'Ben' },
      ], [['Ben', "Mustafa'yım"], ["Mustafa'yım", 'Ben']]),
    ).toBe(true);
  });

  it('normalizes case, unicode and keyboard-friendly German characters only for tile lookup', () => {
    expect(normalizeTileTyping('  TÜrkei ')).toBe('turkei');
    expect(normalizeTileTyping('straße')).toBe('strasse');
    expect(normalizeTileTyping('Adın')).toBe('adin');
    expect(selectedTokenText(['mustafa'], [{ id: 'mustafa', text: "Mustafa'yım" }])).toEqual(["Mustafa'yım"]);
  });

  it('selects only a full typed tile and waits for ambiguous prefixes', () => {
    expect(resolveTypedTile('ich', tokens).selectId).toBe('ich-1');
    expect(resolveTypedTile('i', tokens).selectId).toBeUndefined();
    expect(resolveTypedTile('b', tokens).selectId).toBeUndefined();
    expect(
      resolveTypedTile('der', [
        { id: 'der', text: 'der' },
        { id: 'derjenige', text: 'derjenige' },
      ]).selectId,
    ).toBe('der');
  });

  it('treats identical duplicate exact words as one selectable spelling', () => {
    expect(resolveTypedTile('die', tokens.filter((token) => token.text === 'die')).selectId).toBe('die-1');
  });

  it('uses backspace for buffer first, then returns the newest selected tile', () => {
    expect(reduceWordBankKey({ key: 'Backspace', buffer: 'ic', selectedIds: ['ich-1'], tokens }).buffer).toBe('i');
    expect(reduceWordBankKey({ key: 'Backspace', buffer: '', selectedIds: ['ich-1', 'bin-1'], tokens }).selectedIds).toEqual(['ich-1']);
  });

  it('commits an exact buffered match and lets Enter submit when the buffer is empty', () => {
    expect(reduceWordBankKey({ key: 'Enter', buffer: 'ich', selectedIds: [], tokens })).toMatchObject({
      selectedIds: ['ich-1'], buffer: '', submit: false,
    });
    expect(reduceWordBankKey({ key: 'Enter', buffer: '', selectedIds: ['ich-1'], tokens }).submit).toBe(true);
    expect(reduceWordBankKey({ key: ' ', buffer: 'mus', selectedIds: [], tokens })).toMatchObject({
      selectedIds: ['mustafa-1'], buffer: '', submit: false,
    });
  });

  it('keeps a non-matching typed buffer visible until the learner edits it', () => {
    expect(reduceWordBankKey({ key: 'x', buffer: '', selectedIds: [], tokens })).toMatchObject({
      buffer: 'x',
      noMatch: true,
      handled: true,
    });
  });

  it('maps a normalized Turkish or German typed prefix back to the canonical tile letters', () => {
    expect(typedPrefixLength('Günaydın', 'gü')).toBe(2);
    expect(typedPrefixLength('Ich', 'ic')).toBe(2);
    expect(typedPrefixLength('Straße', 'strass')).toBe(5);
    expect(typedPrefixLength('kommen', 'kom')).toBe(3);
  });
});

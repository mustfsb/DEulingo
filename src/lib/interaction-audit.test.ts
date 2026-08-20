/**
 * Olu UI taramasi (§47, §55).
 *
 * Amac: "gorunuyor ama hicbir sey yapmiyor" kontrollerinin geri donmesini
 * zorlastirmak. Bu test kaynak metnini tarar; davranis testleri ayrica
 * `src/screens/LessonCompleteScreen.test.tsx` icindedir.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const UI_ROOTS = ['src/screens', 'src/components', 'src/App.tsx'];

function collect(target: string): string[] {
  const stats = statSync(target);
  if (stats.isFile()) return target.endsWith('.tsx') ? [target] : [];
  return readdirSync(target).flatMap((entry) => collect(join(target, entry)));
}

const files = UI_ROOTS.flatMap(collect).filter((file) => !file.includes('.test.'));

/** Etkilesimli olmasi beklenen acilis etiketlerini cikarir. */
function openingTags(source: string, tag: 'button' | 'a'): string[] {
  return source.match(new RegExp(`<${tag}\\b[^>]*>`, 'g')) ?? [];
}

describe('olu UI taramasi', () => {
  it('taranacak ekran dosyalarini bulur', () => {
    expect(files.length).toBeGreaterThan(8);
  });

  it('bos ya da yer tutucu tiklama isleyicisi yok', () => {
    for (const file of files) {
      const source = readFileSync(file, 'utf8');
      expect(source, file).not.toMatch(/onClick=\{\s*\(\)\s*=>\s*\{\s*\}\s*\}/);
      expect(source, file).not.toMatch(/onClick=\{\s*\(\)\s*=>\s*undefined\s*\}/);
      expect(source, file).not.toMatch(/onClick=\{[^}]*console\.log/);
      expect(source, file).not.toMatch(/href="#"/);
    }
  });

  it('gorunen hicbir eylem "yakında" olarak birakilmamis', () => {
    for (const file of files) {
      const source = readFileSync(file, 'utf8');
      expect(source, file).not.toMatch(/>\s*Yakında\s*</);
      expect(source, file).not.toMatch(/Çok yakında/);
      expect(source, file).not.toMatch(/TODO|FIXME/);
    }
  });

  it('her <button> bir davranis tasir (onClick / submit / disabled)', () => {
    for (const file of files) {
      const source = readFileSync(file, 'utf8');
      for (const tag of openingTags(source, 'button')) {
        const wired =
          tag.includes('onClick') ||
          tag.includes('type="submit"') ||
          tag.includes('disabled') ||
          // Prop olarak disaridan gelen isleyiciler (yayilim) da gecerlidir.
          tag.includes('{...');
        expect(wired, `${file}: ${tag}`).toBe(true);
      }
    }
  });

  it('her <a> gercek bir hedefe gider', () => {
    for (const file of files) {
      const source = readFileSync(file, 'utf8');
      for (const tag of openingTags(source, 'a')) {
        expect(tag.includes('href'), `${file}: ${tag}`).toBe(true);
      }
    }
  });
});

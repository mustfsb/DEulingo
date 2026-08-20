import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { parseContent, validateExercises, type SourceFile } from './index.ts';
import { parseAnswerText } from './answers.ts';
import { parseDocument } from './document.ts';

const FIXTURE = `# 📅 1. Gün

## 🔤 1. Hızlı Hatırlama

Kombinasyonların okunuşunu yaz:

1. \`ei\` → ______
2. \`ie\` → ______
3. \`sch\` → ______

## ✍️ 2. Boşluk Doldurma

Fiili doğru çekimle tamamla:

1. Ich _____ aus der Türkei. (kommen)
2. Du _____ aus Deutschland. (kommen)

## 🧩 3. Artikel

Artikeli yaz:

1. _____ Tisch (masa)

## 🔍 4. Hata Avı

Aşağıdaki cümledeki hatayı düzelt:

1. Yanlış: \`Du kommen aus Deutschland.\`
   Doğrusu: __________

## ✅ Bugün Yapabiliyor muyum?

- [ ] Bu bölüm alıştırmaya çevrilmemeli.

---

<details>
<summary>✅ 1. Gün Cevaplarını Göster</summary>

**1. Hızlı Hatırlama**
1. \`ei\` → "ay" gibi
2. \`ie\` → uzun "i" gibi
3. \`sch\` → "ş" gibi

**2. Boşluk Doldurma**
1. Ich **komme** aus der Türkei.
2. Du **kommst** aus Deutschland.

**3. Artikel**
1. **der** Tisch

**4. Hata Avı**
1. Doğrusu: \`Du kommst aus Deutschland.\` (\`du\` ile fiil \`-st\` takısı alır.)

</details>
`;

function parseFixture(markdown = FIXTURE) {
  const files: SourceFile[] = [{ name: 'test.md', markdown, role: 'exercises' }];
  return parseContent(files);
}

describe('belge yapisi', () => {
  it('gunleri bulur ve sayisal siralar', () => {
    const document = parseDocument('t.md', '# 2. Gün\n\n## 1. A\n\n# 10. Gün\n\n## 1. B\n\n# 1. Gün\n\n## 1. C\n');
    expect(document.days.map((day) => day.day)).toEqual([1, 2, 10]);
  });

  it('cevap anahtarini govdeden ayirir', () => {
    const document = parseDocument('t.md', FIXTURE);
    const [day] = document.days;
    expect(day.answerGroups.length).toBe(4);
    expect(day.answerGroups[0].items.get('1')).toContain('ay');
    // <details> icerigi bolum olarak parse edilmemeli
    expect(day.sections.some((section) => section.title.includes('Cevapları'))).toBe(false);
  });
});

describe('alistirma cikarimi', () => {
  const bundle = parseFixture();
  const byKey = new Map(bundle.exercises.map((exercise) => [exercise.source.naturalKey, exercise]));

  it('cevap anahtarini soruya cevirmez', () => {
    expect(bundle.exercises.length).toBe(7);
    expect(bundle.exercises.every((exercise) => !exercise.instruction.includes('Cevapları'))).toBe(true);
  });

  it('kendini degerlendirme bolumunu atlar', () => {
    expect(bundle.exercises.some((exercise) => exercise.topic.includes('Yapabiliyor'))).toBe(false);
  });

  it('kisa Turkce cevaplari coktan secmeliye cevirir', () => {
    const exercise = byKey.get('1/1/1');
    expect(exercise?.type).toBe('multiple-choice');
    expect(exercise?.answer).toBe('"ay" gibi');
    expect(exercise?.options).toHaveLength(3);
    expect(exercise?.options).toContain('"ş" gibi');
  });

  it('cumle ici bosluklari fill-blank yapar ve kalin cevabi alir', () => {
    const exercise = byKey.get('1/2/1');
    expect(exercise?.type).toBe('fill-blank');
    expect(exercise?.prompt).toBe('Ich ___ aus der Türkei.');
    expect(exercise?.answer).toBe('komme');
  });

  it('artikel sorularini der/die/das secenegine cevirir', () => {
    const exercise = byKey.get('1/3/1');
    expect(exercise?.type).toBe('multiple-choice');
    expect(exercise?.options).toEqual(expect.arrayContaining(['der', 'die', 'das']));
    expect(exercise?.answer).toBe('der');
    expect(exercise?.validation?.noTypoTolerance).toBe(true);
  });

  it('hata avini error-correction yapar ve gerekceyi ayirir', () => {
    const exercise = byKey.get('1/4/1');
    expect(exercise?.type).toBe('error-correction');
    expect(exercise?.prompt).toBe('Du kommen aus Deutschland.');
    expect(exercise?.answer).toBe('Du kommst aus Deutschland.');
    expect(exercise?.explanation).toContain('-st');
  });

  it('kaynak izlenebilirligini korur', () => {
    const exercise = byKey.get('1/2/2');
    expect(exercise?.source.file).toBe('test.md');
    expect(exercise?.source.section).toBe('Boşluk Doldurma');
    expect(exercise?.source.sectionNumber).toBe(2);
  });

  it('uyari uretmez', () => {
    expect(bundle.warnings.filter((warning) => warning.level === 'error')).toEqual([]);
  });
});

describe('kimlik kararliligi', () => {
  it('ayni kaynaktan ayni ID uretir', () => {
    expect(parseFixture().exercises.map((e) => e.id)).toEqual(parseFixture().exercises.map((e) => e.id));
  });

  it('ID benzersizdir', () => {
    const ids = parseFixture().exercises.map((exercise) => exercise.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('cevap anahtari duzeltilse bile ID degismez (ilerleme korunur)', () => {
    const fixed = FIXTURE.replace('1. Ich **komme** aus der Türkei.', '1. Ich **komme!** aus der Türkei.');
    const before = parseFixture().exercises.find((e) => e.source.naturalKey === '1/2/1');
    const after = parseFixture(fixed).exercises.find((e) => e.source.naturalKey === '1/2/1');
    expect(after?.id).toBe(before?.id);
    expect(after?.answer).not.toBe(before?.answer);
  });

  it('soru metni degisirse ID degisir', () => {
    const changed = FIXTURE.replace('1. Ich _____ aus der Türkei. (kommen)', '1. Ich _____ aus Berlin. (kommen)');
    const before = parseFixture().exercises.find((e) => e.source.naturalKey === '1/2/1');
    const after = parseFixture(changed).exercises.find((e) => e.source.naturalKey === '1/2/1');
    expect(after?.id).not.toBe(before?.id);
  });
});

describe('cevap metni ayristirma', () => {
  it('alternatifleri ve opsiyonel parantezi acar', () => {
    const parsed = parseAnswerText('İyi: `Super!` ya da `(Sehr) gut.`');
    expect(parsed.answer).toBe('Super!');
    expect(parsed.acceptedAnswers).toEqual(['Sehr gut.', 'gut.']);
  });

  it('"örnek cevap" ifadesini acik uclu olarak isaretler', () => {
    expect(parseAnswerText('Örnek cevap: `Bis Montag!`').openEnded).toBe(true);
    expect(parseAnswerText('`Bis Montag!`').openEnded).toBe(false);
  });

  it('sondaki parantezli aciklamayi cevaptan ayirir', () => {
    const parsed = parseAnswerText('Doğrusu: `Gute Nacht.` (`Guten` değil `Gute` — vedalaşma kalıbıdır.)');
    expect(parsed.answer).toBe('Gute Nacht.');
    expect(parsed.explanation).toContain('vedalaşma');
  });
});

describe('kelime bankasi butunlugu', () => {
  it('her kabul edilen dizinin kutucuklarda kurulabildigini zorunlu tutar', () => {
    const warnings = validateExercises([{
      id: 'eksik-alternatif-kutucuk',
      day: 1,
      topicId: 'day1.ornek',
      topic: 'Örnek',
      type: 'word-bank-translation',
      difficulty: 'easy',
      skill: 'recognition',
      conceptIds: ['day1.ornek'],
      origin: 'authored',
      instruction: 'Almancayı Türkçe oluştur.',
      answer: 'Babam öğretmen.',
      wordBank: {
        direction: 'de-to-tr',
        sourceText: 'Mein Vater ist Lehrer.',
        targetLanguage: 'tr',
        tokens: [{ id: 'babam', text: 'Babam' }, { id: 'ogretmen', text: 'öğretmen' }],
        acceptedSequences: [['Babam', 'öğretmen'], ['Benim', 'babam', 'öğretmen']],
      },
      source: { file: 'test.md', day: 1, naturalKey: '1/1/1' },
    }]);

    expect(warnings).toContainEqual(expect.objectContaining({
      level: 'error',
      code: 'word-bank-unbuildable-answer',
      ref: 'eksik-alternatif-kutucuk',
    }));
  });
});

describe('gercek Obsidian icerigi', () => {
  const bundle = JSON.parse(readFileSync('generated/exercises.json', 'utf8'));

  it('ilk alti gunu uretir', () => {
    expect(bundle.days.map((day: { day: number }) => day.day)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('hicbir icerik hatasi yok', () => {
    expect(bundle.warnings.filter((w: { level: string }) => w.level === 'error')).toEqual([]);
  });

  it('dinleme ve kelime-bankası dahil on bir alistirma tipinin tamamini uretir', () => {
    const types = new Set(bundle.exercises.map((exercise: { type: string }) => exercise.type));
    expect([...types].sort()).toEqual(
      [
        'dictation',
        'error-correction',
        'fill-blank',
        'free-text',
        'listen-choice',
        'matching',
        'multiple-choice',
        'ordering',
        'sentence-builder',
        'spoken',
        'word-bank-translation',
      ].sort(),
    );
  });

  it('kaynaktaki cevaplarla birebir ortusur', () => {
    const find = (key: string) =>
      bundle.exercises.find((exercise: { source: { naturalKey: string } }) => exercise.source.naturalKey === key);
    expect(find('2/3/1').answer).toBe('komme');
    expect(find('2/4/3').answer).toBe('hast');
    expect(find('2/5/2').answer).toBe('das');
    expect(find('2/6/1').answer).toBe('Du kommst aus Deutschland.');
    expect(find('3/5/4').answer).toBe('fünfunddreißig');
    expect(find('3/6/1').answer).toBe('Ich komme aus der Türkei.');
  });

  it('sesli gorevler disinda her alistirmanin cevabi var', () => {
    const missing = bundle.exercises.filter(
      (exercise: { type: string; answer?: string; pairs?: unknown }) =>
        !['spoken', 'matching'].includes(exercise.type) && !exercise.answer,
    );
    expect(missing).toEqual([]);
  });
});

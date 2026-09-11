import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import type { Concept, ContentBundle, Exercise } from '../types.ts';
import { enrichExercise, parseContent, validateExercises } from './index.ts';
import { parseSectionTitle, parseTopicDocument } from './document.ts';
import { T } from '../curriculum/topics.ts';

const TOPIC_FIXTURE = `# 🗂️ Konu Özetleri

> Belge başlığı; bölümsüz H1 konu sayılmaz.

# 🗝️ Modalverben

> Modalverb ikinci sırada, asıl fiil mastar hâlinde sonda.

## 🔎 Modalverben Nedir?

\`können\`, \`möchten\`, \`wollen\` birer Modalverb'dir: Ich kann Deutsch sprechen.

### ⚠️ Dikkat

Asıl fiil çekilmez: ~~Ich kann Deutsch spreche.~~

\`\`\`
# kod bloğundaki başlık konu değildir
\`\`\`

## 1. Temel Kural — Modalverb İkinci Sırada, Mastar Sonda

Özne + Modalverb + … + mastar.

## 🧠 Kendine Sor

1. "Yüzebilirim" nasıl denir? → \`Ich kann schwimmen.\`

<details>
<summary>✅ Cevaplar</summary>

1. \`Ich kann schwimmen.\`

</details>
`;

describe('belge yapisi', () => {
  it('H1 konu bloklarini, girisi ve bolumleri ayirir; kod blogundaki # baslik sayilmaz', () => {
    const document = parseTopicDocument(TOPIC_FIXTURE);
    expect(document.topics.map((topic) => topic.title)).toEqual(['Konu Özetleri', 'Modalverben']);
    const [, modal] = document.topics;
    expect(modal.intro).toEqual(['Modalverb ikinci sırada, asıl fiil mastar hâlinde sonda.']);
    expect(modal.sections.filter((section) => section.level === 2).map((section) => section.title)).toEqual([
      'Modalverben Nedir?',
      'Temel Kural — Modalverb İkinci Sırada, Mastar Sonda',
      'Kendine Sor',
    ]);
    expect(modal.sections.find((section) => section.level === 3)?.title).toBe('Dikkat');
  });

  it('cevap anahtarini govdeden ayirir', () => {
    const [, modal] = parseTopicDocument(TOPIC_FIXTURE).topics;
    expect(modal.answerGroups).toHaveLength(1);
    expect(modal.answerGroups[0].items.get('1')).toContain('Ich kann schwimmen.');
    expect(modal.sections.some((section) => section.title.includes('Cevaplar'))).toBe(false);
  });

  it('numarali ve emojili basliklari sadelestirir', () => {
    expect(parseSectionTitle('🔤 1. Hızlı Hatırlama')).toEqual({ number: 1, title: 'Hızlı Hatırlama' });
    expect(parseSectionTitle('⏰ Saat Sorma')).toEqual({ title: 'Saat Sorma' });
  });
});

describe('alistirma zenginlestirme', () => {
  const concepts = new Map<string, Concept>([
    ['modal-verbs.kural', { id: 'modal-verbs.kural', topicId: T.modalVerbs, sectionId: 'modal-verbs.rule', label: 'kural' }],
    [
      'separable-verbs.verb.aufstehen',
      { id: 'separable-verbs.verb.aufstehen', topicId: T.separableVerbs, sectionId: 'separable-verbs.core', label: 'aufstehen' },
    ],
  ]);
  const base: Exercise = {
    id: 'mv-ornek',
    topicId: T.modalVerbs,
    topic: '',
    type: 'free-text',
    difficulty: 'medium',
    skill: 'production',
    conceptIds: ['separable-verbs.verb.aufstehen', 'modal-verbs.kural'],
    origin: 'authored',
    instruction: 'Çevir:',
    answer: 'Ich will früh aufstehen.',
    source: { file: 'test', naturalKey: 'mv-ornek' },
  };

  it('bolumu birincil konudaki ilk kavramdan, ikincil konulari kavramlardan turetir', () => {
    const enriched = enrichExercise(base, concepts);
    expect(enriched.sectionId).toBe('modal-verbs.rule');
    expect(enriched.secondaryTopicIds).toContain(T.separableVerbs);
    expect(enriched.secondaryTopicIds).not.toContain(T.modalVerbs);
    expect(enriched.topic).toBe('Modalverben');
  });

  it('acik bolum ve acik ikincil etiket korunur', () => {
    const enriched = enrichExercise({ ...base, sectionId: 'modal-verbs.separable', secondaryTopicIds: [T.dailyRoutine] }, concepts);
    expect(enriched.sectionId).toBe('modal-verbs.separable');
    expect(enriched.secondaryTopicIds).toEqual(expect.arrayContaining([T.dailyRoutine, T.separableVerbs]));
  });
});

describe('alistirma dogrulamasi', () => {
  const wordBankExercise: Exercise = {
    id: 'eksik-alternatif-kutucuk',
    topicId: T.pronouns,
    topic: 'Zamirler ve İyelik',
    type: 'word-bank-translation',
    difficulty: 'easy',
    skill: 'recognition',
    conceptIds: ['pronouns.ornek'],
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
    source: { file: 'test.md', naturalKey: 'x' },
  };

  it('her kabul edilen dizinin kutucuklarda kurulabildigini zorunlu tutar', () => {
    expect(validateExercises([wordBankExercise])).toContainEqual(
      expect.objectContaining({ level: 'error', code: 'word-bank-unbuildable-answer', ref: 'eksik-alternatif-kutucuk' }),
    );
  });

  it('ogrenciye gorunen metinde "N. Gün" dilini HATA yapar', () => {
    const warnings = validateExercises([
      { ...wordBankExercise, id: 'gun-dili', type: 'free-text', wordBank: undefined, instruction: '3. Günden hatırla: çevir.' },
    ]);
    expect(warnings).toContainEqual(expect.objectContaining({ level: 'error', code: 'day-language', ref: 'gun-dili' }));
  });

  it('ayni ID iki kez uretilirse HATA yapar', () => {
    const exercise = { ...wordBankExercise, wordBank: undefined, type: 'free-text' as const };
    expect(validateExercises([exercise, exercise])).toContainEqual(expect.objectContaining({ code: 'duplicate-id' }));
  });
});

describe('boru hatti', () => {
  it('konu ozeti dosyasi yoksa HATA verir', () => {
    const bundle = parseContent([]);
    expect(bundle.warnings).toContainEqual(expect.objectContaining({ level: 'error', code: 'no-topic-summary' }));
  });

  it('kanonik konu haritasini her zaman 20 konuyla uretir', () => {
    const bundle = parseContent([{ name: 'Konu Özetleri.md', markdown: TOPIC_FIXTURE, role: 'topic-summary' }]);
    expect(bundle.topics).toHaveLength(20);
    expect(bundle.summaries.map((summary) => summary.topicId)).toEqual([T.modalVerbs]);
  });
});

describe('gercek Obsidian icerigi', () => {
  const bundle = JSON.parse(readFileSync('generated/exercises.json', 'utf8')) as ContentBundle;

  it('kaynak dosyalari konu ozeti ve Genel Tekrar ozetidir', () => {
    expect(bundle.sourceFiles).toEqual(['Konu Özetleri.md', 'Genel Tekrar Özet.md']);
  });

  it('hicbir icerik hatasi yok', () => {
    expect(bundle.warnings.filter((warning) => warning.level === 'error')).toEqual([]);
  });

  it('dinleme ve kelime-bankası dahil on bir alistirma tipinin tamamini uretir', () => {
    expect([...new Set(bundle.exercises.map((exercise) => exercise.type))].sort()).toEqual(
      [
        'dictation', 'error-correction', 'fill-blank', 'free-text', 'listen-choice', 'matching',
        'multiple-choice', 'ordering', 'sentence-builder', 'spoken', 'word-bank-translation',
      ].sort(),
    );
  });

  it('yazilmis alistirmalar konumdan bagimsiz kararli ID tasir', () => {
    const find = (id: string) => bundle.exercises.find((exercise) => exercise.id === id);
    expect(find('p1-vor-wie-heisst-mc')?.answer).toBe('Wie heißt du?');
    expect(find('p1-vor-wie-heisst-mc')?.topicId).toBe(T.greetings);
    expect(find('gr-cum-l4-stehe-sieben-auf')?.answer).toBe('Ich stehe jeden Morgen um sieben Uhr auf.');
    expect(find('gr-cum-l4-stehe-sieben-auf')?.reviewOnly).toBe(true);
  });

  it('konu uyelikleri alistirma etiketleriyle tutarlidir; Genel Tekrar ders havuzuna karismaz', () => {
    const byId = new Map(bundle.exercises.map((exercise) => [exercise.id, exercise]));
    for (const topic of bundle.topics) {
      for (const id of topic.exerciseIds) {
        expect(byId.get(id)?.topicId, id).toBe(topic.id);
        expect(byId.get(id)?.reviewOnly, id).toBeFalsy();
      }
      for (const id of topic.secondaryExerciseIds) expect(byId.get(id)?.secondaryTopicIds, id).toContain(topic.id);
      for (const id of topic.reviewExerciseIds) expect(byId.get(id)?.reviewOnly, id).toBe(true);
    }
    const lessonCount = bundle.exercises.filter((exercise) => !exercise.reviewOnly).length;
    expect(bundle.topics.reduce((total, topic) => total + topic.exerciseIds.length, 0)).toBe(lessonCount);
  });

  it('Genel Tekrar ozeti ayri, kumulatif ozet olarak paketlenir', () => {
    expect(bundle.reviewSummary?.title).toBe('Genel Tekrar');
    expect(bundle.reviewSummary?.sections.length).toBeGreaterThanOrEqual(25);
  });

  it('sesli gorevler disinda her alistirmanin cevabi var', () => {
    const missing = bundle.exercises.filter((exercise) => !['spoken', 'matching'].includes(exercise.type) && !exercise.answer);
    expect(missing).toEqual([]);
  });
});

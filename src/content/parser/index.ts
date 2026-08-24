/**
 * Icerik boru hatti:
 *   Markdown → belge yapisi → alistirma taslaklari → kurasyon → dogrulama → JSON
 */

import {
  CONTENT_SCHEMA_VERSION,
  type Concept,
  type ContentBundle,
  type ContentWarning,
  type Day,
  type Exercise,
  type LessonNote,
  type SummaryDay,
  type LearningTrack,
} from '../types.ts';
import {
  EXERCISE_PATCHES,
  FALLBACK_DAY_TOPICS,
  SECTION_INSTRUCTIONS,
  SECTION_OVERRIDES,
  type SectionOverride,
} from '../overrides.ts';
import type { AuthoredExercise } from '../authored/types.ts';
import type { VaultTag } from '../authored/vault-tags.ts';
import {
  validateSourceMappings,
  type LearningSourceVideo,
  type SourceTopicMapping,
} from '../authored/sources.ts';
import { findAnswerGroup, parseDocument, type RawSection } from './document.ts';
import { extractSection, isSkippableSection, type DraftExercise } from './extract.ts';
import { sectionToNote } from './notes.ts';
import { refineDraft, toExercise } from './refine.ts';
import { attachPronunciation, buildAuthoredExercise } from './metadata.ts';
import { attributionKeywords, buildSummaries } from './summary.ts';
import { validateCoverage, validateNoDuplicates, type ConceptCoverage } from './coverage.ts';
import { slugify, stableHash } from './text.ts';
import { assignExerciseSets } from '../exercise-sets.ts';

export interface SourceFile {
  /** Sadece dosya adi — kaynak izlenebilirligi icin saklanir. */
  name: string;
  markdown: string;
  role: 'exercises' | 'summary';
}

type AnchoredConcept = Concept & { anchor: string };

/**
 * Yazilmis icerik katmani.
 */
export interface AuthoredLayer {
  concepts: AnchoredConcept[];
  exercises: AuthoredExercise[];
  vaultTags: Record<string, VaultTag>;
  sources?: LearningSourceVideo[];
  sourceTopics?: SourceTopicMapping[];
}

export interface ParseOptions {
  authored?: AuthoredLayer;
  topicTitles?: Record<string, string>;
}

function sectionKey(section: RawSection): string {
  return section.number !== undefined ? String(section.number) : slugify(section.title);
}

function topicOf(section: RawSection): string {
  return section.title.split(/\s+[—–-]\s+/)[0].trim() || section.title;
}

function cleanTopic(title: string): string {
  return title
    .split(/\s+[—–]\s+/)[0]
    .replace(/\s*\([^)]*\)\s*$/, '')
    .trim();
}

function inferTrack(fileName: string): LearningTrack {
  const normalized = fileName.normalize('NFC').toLocaleLowerCase('tr');
  return normalized.includes('özel') ? 'private' : 'normal';
}

function dayKey(track: LearningTrack, day: number): string {
  return `${track}:${day}`;
}

/** ID'ler cevaptan bagimsizdir: cevap anahtari duzeltilse bile ilerleme korunur. */
function exerciseId(draft: DraftExercise, naturalKey: string): string {
  const signature = [naturalKey, draft.type, draft.prompt ?? '', draft.instruction].join('|');
  return `d${draft.day}-${slugify(naturalKey.replace(/\//g, '-'))}-${stableHash(signature)}`;
}

export function parseContent(files: SourceFile[], options: ParseOptions = {}): ContentBundle {
  const warnings: ContentWarning[] = [];
  const exercises: Exercise[] = [];
  const days = new Map<string, Day>();
  const usedOverrides = new Set<string>();
  const authored = options.authored;
  const vaultTags = authored?.vaultTags ?? {};
  const topicTitles = new Map(Object.entries(options.topicTitles ?? {}));

  const exerciseFiles = files.filter((file) => file.role === 'exercises');
  const summaryFiles = files.filter((file) => file.role === 'summary');

  const notesByDay = new Map<string, LessonNote[]>();
  const summaries: SummaryDay[] = [];
  const missingTopicIds: string[] = [];

  const conceptsByTopic = new Map<string, string[]>();
  for (const concept of authored?.concepts ?? []) {
    conceptsByTopic.set(concept.topicId, [...(conceptsByTopic.get(concept.topicId) ?? []), concept.id]);
  }
  const attributionKeys = attributionKeywords(
    [...topicTitles].map(([id, title]) => ({ id, title })),
    authored?.concepts ?? [],
  );

  for (const file of summaryFiles) {
    const track = inferTrack(file.name);
    const document = parseDocument(file.name, file.markdown);
    for (const rawDay of document.days) {
      const notes = rawDay.sections
        .map(sectionToNote)
        .filter((note): note is NonNullable<typeof note> => note !== null);
      const key = dayKey(track, rawDay.day);
      notesByDay.set(key, [...(notesByDay.get(key) ?? []), ...notes]);
    }
    if (authored) {
      const built = buildSummaries(document.days, file.markdown, attributionKeys, conceptsByTopic, track);
      summaries.push(...built.days);
      missingTopicIds.push(...built.missingTopicIds);
    }
  }

  // 2) Alistirma dosyalarindan alistirmalar.
  for (const file of exerciseFiles) {
    const track = inferTrack(file.name);
    const document = parseDocument(file.name, file.markdown);
    if (!document.days.length) {
      warnings.push({
        level: 'error',
        code: 'no-days',
        message: `Gün başlığı bulunamadı ("# N. Gün" bekleniyor).`,
        ref: file.name,
      });
    }

    for (const rawDay of document.days) {
      const dayExercises: Exercise[] = [];

      for (const section of rawDay.sections) {
        if (isSkippableSection(section)) continue;

        const answers = findAnswerGroup(rawDay, section);
        const key = `${rawDay.day}/${sectionKey(section)}`;
        const topic = topicOf(section);

        let drafts = extractSection({
          file: file.name,
          day: rawDay.day,
          section,
          answers,
          topic,
        });

        const override: SectionOverride | undefined = SECTION_OVERRIDES[key];
        if (override) {
          usedOverrides.add(key);
          const extra = override.exercises.map((partial) => ({
            day: rawDay.day,
            topic,
            instruction: section.title,
            ...partial,
          })) as DraftExercise[];
          drafts = override.mode === 'replace' ? extra : [...drafts, ...extra];
        }

        if (!drafts.length) {
          warnings.push({
            level: 'warn',
            code: 'section-not-converted',
            message: `Bölüm alıştırmaya çevrilemedi: "${section.title}".`,
            ref: key,
          });
          continue;
        }
        const spokenOnly = drafts.every((draft) => draft.type === 'spoken');
        if (!answers && !override && !spokenOnly) {
          warnings.push({
            level: 'warn',
            code: 'no-answer-key',
            message: `Bölüm için cevap anahtarı bulunamadı: "${section.title}".`,
            ref: key,
          });
        }

        const sectionInstruction = SECTION_INSTRUCTIONS[key];
        if (sectionInstruction) {
          usedOverrides.add(key);
          for (const draft of drafts) draft.instruction = sectionInstruction;
        }

        for (const draft of drafts) {
          const trackAwareKey = track === 'private' ? `private/${key}/${draft.itemKey}` : `${key}/${draft.itemKey}`;
          const patch = EXERCISE_PATCHES[trackAwareKey] ?? EXERCISE_PATCHES[`${key}/${draft.itemKey}`];
          if (patch) {
            usedOverrides.add(trackAwareKey in EXERCISE_PATCHES ? trackAwareKey : `${key}/${draft.itemKey}`);
            const { reason: _reason, ...fields } = patch;
            Object.assign(draft, fields);
          }

          refineDraft(draft, trackAwareKey);

          const id = exerciseId(draft, trackAwareKey);

          const vaultNaturalKey = `${key}/${draft.itemKey}`;
          const tag = vaultTags[vaultNaturalKey] ?? vaultTags[trackAwareKey];
          if (tag) {
            draft.difficulty = tag.difficulty;
            draft.skill = tag.skill;
            draft.conceptIds = tag.conceptIds;
            draft.topicId = tag.topicId;
            draft.topic = topicTitles.get(tag.topicId) ?? draft.topic;
            if (tag.familyId) draft.familyId = tag.familyId;
          } else if (authored) {
            warnings.push({
              level: 'warn',
              code: 'untagged-vault-exercise',
              message: `Kasa alıştırması etiketlenmemiş (kavram/zorluk yok).`,
              ref: trackAwareKey,
            });
          }

          const exercise = toExercise(draft, id, {
            file: file.name,
            day: rawDay.day,
            section: section.title,
            sectionNumber: section.number,
            itemKey: draft.itemKey,
            naturalKey: trackAwareKey,
          });
          (exercise as Exercise & { track?: LearningTrack }).track = track;
          dayExercises.push(attachPronunciation(exercise, tag?.pronounce));
        }
      }

      exercises.push(...dayExercises);
      const dk = dayKey(track, rawDay.day);
      const existing = days.get(dk);
      const ids = dayExercises.map((exercise) => exercise.id);
      if (existing) existing.exerciseIds.push(...ids);
      else
        days.set(dk, {
          day: rawDay.day,
          track,
          topics: [],
          exerciseIds: ids,
          estimatedMinutes: 0,
          conceptIds: [],
          summaryTopicIds: [],
        });
    }
  }

  // 3) Yazilmis alistirmalari havuza ekle.
  for (const item of authored?.exercises ?? []) {
    const track: LearningTrack = (item.track as LearningTrack) ?? 'normal';
    const exercise = buildAuthoredExercise(item);
    (exercise as Exercise & { track?: LearningTrack }).track = track;
    exercise.topic = topicTitles.get(item.topicId) ?? item.topicId;
    exercises.push(exercise);

    const dk = dayKey(track, item.day);
    const existing = days.get(dk);
    if (existing) existing.exerciseIds.push(exercise.id);
    else
      days.set(dk, {
        day: item.day,
        track,
        topics: [],
        exerciseIds: [exercise.id],
        estimatedMinutes: 0,
        conceptIds: [],
        summaryTopicIds: [],
      });
  }

  // 4) Gunleri tamamla.
  exercises.splice(0, exercises.length, ...assignExerciseSets(exercises));

  for (const day of days.values()) {
    const noteKey = dayKey((day.track as import('../types.ts').LearningTrack | undefined) ?? 'normal', day.day);
    const noteTopics = (notesByDay.get(noteKey) ?? [])
      .filter((note) => note.level === 2)
      .map((note) => cleanTopic(note.title))
      .filter(Boolean);
    day.topics = noteTopics.length ? noteTopics : (FALLBACK_DAY_TOPICS[day.day] ?? []);

    const dayExercises = exercises.filter((exercise) => exercise.day === day.day && (exercise.track ?? 'normal') === day.track);
    day.estimatedMinutes = Math.max(
      3,
      Math.round(dayExercises.reduce((total, item) => total + (item.estimatedSeconds ?? 25), 0) / 60),
    );
    day.conceptIds = [...new Set((authored?.concepts ?? []).filter((c) => c.day === day.day && ((c.track as LearningTrack | undefined) ?? 'normal') === day.track).map((c) => c.id))];
    const summaryForDay = summaries.find((entry) => entry.day === day.day && ((entry.track as import('../types.ts').LearningTrack | undefined) ?? 'normal') === ((day.track as import('../types.ts').LearningTrack | undefined) ?? 'normal'));
    day.summaryTopicIds = summaryForDay?.topics.map((t) => t.id) ?? [];
  }

  // 5) Kullanilmayan override uyarilari
  for (const key of [
    ...Object.keys(SECTION_OVERRIDES),
    ...Object.keys(EXERCISE_PATCHES),
    ...Object.keys(SECTION_INSTRUCTIONS),
  ]) {
    if (!usedOverrides.has(key)) {
      warnings.push({
        level: 'warn',
        code: 'unused-override',
        message: `Kurasyon kaydı hiçbir bölümle eşleşmedi — kaynak değişmiş olabilir.`,
        ref: key,
      });
    }
  }

  warnings.push(...validateExercises(exercises));

  // 6) Kavram / ozet kapsami.
  let coverage: ConceptCoverage[] = [];
  if (authored) {
    const result = validateCoverage({
      exercises,
      concepts: authored.concepts,
      summaries,
      missingTopicIds,
    });
    warnings.push(...result.warnings, ...validateNoDuplicates(exercises));
    coverage = result.coverage;
    if (authored.sources?.length || authored.sourceTopics?.length) {
      warnings.push(
        ...validateSourceMappings({
          sources: authored.sources ?? [],
          mappings: authored.sourceTopics ?? [],
          concepts: authored.concepts,
          summaries,
        }),
      );
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    schemaVersion: CONTENT_SCHEMA_VERSION,
    contentVersion: contentVersionOf(exercises),
    sourceFiles: files.map((file) => file.name),
    days: [...days.values()].sort((a, b) => ((a.track ?? 'normal') === (b.track ?? 'normal') ? a.day - b.day : (a.track ?? 'normal').localeCompare(b.track ?? 'normal'))),
    exercises,
    concepts: authored?.concepts.map(({ anchor: _anchor, ...rest }) => rest) ?? [],
    summaries: summaries.sort((a, b) => ((a.track ?? 'normal') === (b.track ?? 'normal') ? a.day - b.day : (a.track ?? 'normal').localeCompare(b.track ?? 'normal'))),
    warnings,
    coverage,
  };
}

function contentVersionOf(exercises: Exercise[]): string {
  const signature = exercises
    .map((exercise) => [
      exercise.id,
      exercise.exerciseSetId ?? '',
      exercise.answer ?? '',
      ...(exercise.wordBank?.acceptedSequences.map((sequence) => sequence.join(' ')) ?? []),
    ].join(':'))
    .sort()
    .join('|');
  return `${CONTENT_SCHEMA_VERSION}.${stableHash(signature)}`;
}

function normalizeWordBankToken(text: string): string {
  return text
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ß/g, 'ss')
    .toLocaleLowerCase('tr')
    .replace(/ı/g, 'i')
    .replace(/\s+/g, ' ');
}

export function validateExercises(exercises: Exercise[]): ContentWarning[] {
  const warnings: ContentWarning[] = [];
  const seenIds = new Set<string>();
  const seenPrompts = new Map<string, string>();
  const metaQuestion = /video|videoda|videolar|sıradaki|sonraki\s+(?:video|ders)/i;

  for (const exercise of exercises) {
    if (seenIds.has(exercise.id)) {
      warnings.push({
        level: 'error',
        code: 'duplicate-id',
        message: `Aynı ID iki kez üretildi.`,
        ref: exercise.id,
      });
    }
    seenIds.add(exercise.id);

    if (metaQuestion.test([exercise.instruction, exercise.prompt, exercise.explanation].filter(Boolean).join(' '))) {
      warnings.push({
        level: 'error',
        code: 'non-learning-meta-question',
        message: 'Alıştırma video/sonraki ders bilgisini değil, Almanca kullanımını ölçmeli.',
        ref: exercise.id,
      });
    }

    const promptKey = `${exercise.track ?? 'normal'}|${exercise.day}|${exercise.type}|${exercise.instruction}|${exercise.prompt ?? ''}`;
    const previous = seenPrompts.get(promptKey);
    if (previous) {
      warnings.push({
        level: 'warn',
        code: 'duplicate-prompt',
        message: `Aynı soru metni tekrar ediyor (${previous}).`,
        ref: exercise.id,
      });
    }
    seenPrompts.set(promptKey, exercise.id);

    if (!Number.isInteger(exercise.day) || exercise.day < 1) {
      warnings.push({
        level: 'error',
        code: 'invalid-day',
        message: `Geçersiz gün numarası.`,
        ref: exercise.id,
      });
    }

    const needsAnswer = !['spoken', 'matching'].includes(exercise.type);
    if (needsAnswer && !exercise.answer) {
      warnings.push({
        level: 'error',
        code: 'missing-answer',
        message: `Cevabı olmayan alıştırma: "${exercise.prompt ?? exercise.instruction}".`,
        ref: exercise.id,
      });
    }
    if (exercise.type === 'multiple-choice') {
      if (!exercise.options?.length) {
        warnings.push({
          level: 'error',
          code: 'missing-options',
          message: `Çoktan seçmeli alıştırmanın seçenekleri yok.`,
          ref: exercise.id,
        });
      } else if (exercise.answer && !exercise.options.includes(exercise.answer)) {
        warnings.push({
          level: 'error',
          code: 'answer-not-in-options',
          message: `Doğru cevap seçenekler arasında değil: "${exercise.answer}".`,
          ref: exercise.id,
        });
      }
    }
    if (
      (exercise.type === 'sentence-builder' || exercise.type === 'ordering') &&
      (!exercise.words || exercise.words.length < 2)
    ) {
      warnings.push({
        level: 'error',
        code: 'missing-words',
        message: `Cümle kurma alıştırmasının kelime çipleri yok.`,
        ref: exercise.id,
      });
    }
    if (exercise.type === 'matching' && (!exercise.pairs || exercise.pairs.length < 2)) {
      warnings.push({
        level: 'error',
        code: 'missing-pairs',
        message: `Eşleştirme alıştırmasının çiftleri eksik.`,
        ref: exercise.id,
      });
    }
    if (exercise.wordBank) {
      const available = new Map<string, number>();
      for (const token of exercise.wordBank.tokens) {
        const key = normalizeWordBankToken(token.text);
        available.set(key, (available.get(key) ?? 0) + 1);
      }
      const impossible = exercise.wordBank.acceptedSequences.find((sequence) => {
        const required = new Map<string, number>();
        for (const word of sequence) {
          const key = normalizeWordBankToken(word);
          required.set(key, (required.get(key) ?? 0) + 1);
        }
        return [...required].some(([word, needed]) => (available.get(word) ?? 0) < needed);
      });
      if (impossible) {
        warnings.push({
          level: 'error',
          code: 'word-bank-unbuildable-answer',
          message: `Kabul edilen kelime-bankası cevabı kutucuklardan kurulamaz: "${impossible.join(' ')}".`,
          ref: exercise.id,
        });
      }
    }
  }
  return warnings;
}

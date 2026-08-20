/**
 * Bolum → alistirma donusumu.
 * Her extractor belirli bir markdown desenini tanir; taniyamazsa null doner
 * ve sirayla bir sonraki extractor denenir.
 */

import type { Exercise, ExercisePair, ExerciseType } from '../types.ts';
import type { AnswerGroup, RawSection } from './document.ts';
import { parseBody, type BodyItem, type ParsedBody } from './body.ts';
import { afterArrow, hasNoSingleAnswer, parseAnswerText } from './answers.ts';
import {
  backtickTokens,
  boldTokens,
  collapseSpaces,
  hasBlank,
  plain,
  stripBackticks,
} from './text.ts';

/**
 * Cikarim asamasindaki alistirma.
 *
 * v2 ustverisi (zorluk, beceri, kavram) bu asamada HENUZ bilinmez; kasa
 * alistirmalari icin `authored/vault-tags.ts` katmanindan, yazilmis
 * alistirmalar icin tanimin kendisinden gelir. Bu yuzden burada opsiyoneldir.
 */
export type DraftExercise = Omit<
  Exercise,
  'id' | 'source' | 'difficulty' | 'skill' | 'conceptIds' | 'origin' | 'topicId'
> & {
  itemKey: string;
  difficulty?: Exercise['difficulty'];
  skill?: Exercise['skill'];
  conceptIds?: string[];
  origin?: Exercise['origin'];
  /** Cevaptan sonra okunusu gosterilecek Almanca dizeler. */
  pronounce?: string[];
  topicId?: string;
  familyId?: string;
};

export interface SectionContext {
  file: string;
  day: number;
  section: RawSection;
  body: ParsedBody;
  answers?: AnswerGroup;
  topic: string;
}

type Extractor = (ctx: SectionContext) => DraftExercise[] | null;

const ARTICLES = ['der', 'die', 'das'];

/** Ders disi bolumler — alistirmaya cevrilmez. */
const SKIP_TITLE =
  /(Bugün Yapabiliyor|Sonuç|Eğer zorlandıysan|Bu Özeti Oluşturan|Hızlı Tekrar|Kendine Sor|Dikkat)/i;

export function isSkippableSection(section: RawSection): boolean {
  return SKIP_TITLE.test(section.title) || section.level > 2;
}

function answerFor(ctx: SectionContext, key: string): string | undefined {
  return ctx.answers?.items.get(key.toLowerCase());
}

function answerLines(ctx: SectionContext): string[] {
  return (ctx.answers?.lines ?? []).map((line) => line.trim()).filter(Boolean);
}

function baseDraft(ctx: SectionContext, item: BodyItem, type: ExerciseType): DraftExercise {
  return {
    itemKey: item.key,
    day: ctx.day,
    topic: ctx.topic,
    type,
    instruction: sectionInstruction(ctx),
    hint: ctx.body.hint,
  };
}

/** Bolumun ilk paragrafi genelde yonergedir; yoksa baslik kullanilir. */
function sectionInstruction(ctx: SectionContext): string {
  const paragraph = ctx.body.paragraphs.find((text) => text.length > 12);
  return plain(paragraph ?? ctx.section.title);
}

function applyAnswer(draft: DraftExercise, raw: string | undefined): DraftExercise {
  if (!raw) return draft;
  const parsed = parseAnswerText(raw);
  draft.answer = parsed.answer;
  if (parsed.acceptedAnswers.length) draft.acceptedAnswers = parsed.acceptedAnswers;
  if (parsed.explanation) draft.explanation = parsed.explanation;
  if (parsed.openEnded) draft.openEnded = true;
  return draft;
}

/* ------------------------------------------------------------------ */
/* Extractor'lar                                                       */
/* ------------------------------------------------------------------ */

/** 🎙️ Sesli gorev / tek dogru cevabi olmayan aktif hatirlama karti. */
const spokenExtractor: Extractor = (ctx) => {
  const isSpokenTitle = /Sesli Görev|Sesli|Buchstabieren/i.test(ctx.section.title);
  const keyText = answerLines(ctx).join(' ');
  if (!isSpokenTitle && !hasNoSingleAnswer(keyText)) return null;

  const instruction = sectionInstruction(ctx);
  const fromItems = ctx.body.items.map((item) => plain(item.text.replace(/_{3,}/g, '…')));
  const fromBullets = ctx.body.bullets.map(plain);
  const fromParagraphs = ctx.body.paragraphs
    .filter((paragraph) => paragraph !== instruction)
    .map((paragraph) => plain(paragraph.replace(/_{3,}/g, '…')));

  const draft: DraftExercise = {
    itemKey: 'gorev',
    day: ctx.day,
    topic: ctx.topic,
    type: 'spoken',
    instruction,
    requirements: [fromItems, fromBullets, fromParagraphs].find((list) => list.length) ?? [],
    hint: ctx.body.hint,
  };
  if (keyText) draft.sampleAnswer = plain(keyText);
  return [draft];
};

/** Fenced blok icinde 1./2./3. sorular ve A./B./C. cevaplar → eslestirme. */
const matchingExtractor: Extractor = (ctx) => {
  const fence = ctx.body.fences.find((block) => {
    const numbered = block.lines.filter((line) => /^\s*\d+\.\s+\S/.test(line));
    const lettered = block.lines.filter((line) => /^\s*[A-Z]\.\s+\S/.test(line));
    return numbered.length >= 2 && lettered.length >= 2;
  });
  if (!fence) return null;

  const left = new Map<string, string>();
  const right = new Map<string, string>();
  for (const line of fence.lines) {
    const numbered = line.match(/^\s*(\d+)\.\s+(.+)$/);
    if (numbered) left.set(numbered[1], numbered[2].trim());
    const lettered = line.match(/^\s*([A-Z])\.\s+(.+)$/);
    if (lettered) right.set(lettered[1].toLowerCase(), lettered[2].trim());
  }

  // Cevap anahtari: "1-B, 2-D, 3-A, 4-C"
  const mapping = answerLines(ctx).join(' ');
  const pairs: ExercisePair[] = [];
  for (const match of mapping.matchAll(/(\d+)\s*[-–:]\s*([A-Za-z])/g)) {
    const leftText = left.get(match[1]);
    const rightText = right.get(match[2].toLowerCase());
    if (leftText && rightText) pairs.push({ left: leftText, right: rightText });
  }
  if (pairs.length < 2) return null;

  return [
    {
      itemKey: 'eslestirme',
      day: ctx.day,
      topic: ctx.topic,
      type: 'matching',
      instruction: sectionInstruction(ctx),
      pairs,
      hint: ctx.body.hint,
    },
  ];
};

/** "**a)** durum" + "A) x  B) y  C) z" → coktan secmeli. */
const multipleChoiceExtractor: Extractor = (ctx) => {
  const drafts: DraftExercise[] = [];
  for (const item of ctx.body.items) {
    const optionLine = item.lines.find((line) => /^[A-ZÇĞİÖŞÜ]\)\s+/.test(line.trim()));
    if (!optionLine) continue;
    const options = optionLine
      .split(/\s{2,}(?=[A-ZÇĞİÖŞÜ]\))/)
      .map((part) => part.replace(/^[A-ZÇĞİÖŞÜ]\)\s*/, '').trim())
      .filter(Boolean);
    if (options.length < 2) continue;

    const promptLines = item.lines.filter((line) => line !== optionLine);
    const draft = baseDraft(ctx, item, 'multiple-choice');
    draft.prompt = plain(promptLines.join(' '));
    draft.options = options;
    const raw = answerFor(ctx, item.key);
    if (raw) applyAnswer(draft, raw.replace(/^[A-ZÇĞİÖŞÜ]\)\s*/, ''));
    drafts.push(draft);
  }
  return drafts.length ? drafts : null;
};

/** "Yanlış: `...`" → hata duzeltme. */
const errorCorrectionExtractor: Extractor = (ctx) => {
  const drafts: DraftExercise[] = [];

  const build = (key: string, wrongText: string, rawAnswer?: string) => {
    const wrong = backtickTokens(wrongText)[0] ?? plain(wrongText);
    const draft: DraftExercise = {
      itemKey: key,
      day: ctx.day,
      topic: ctx.topic,
      type: 'error-correction',
      instruction: 'Cümledeki hatayı bul ve doğrusunu yaz.',
      prompt: wrong,
      hint: ctx.body.hint,
    };
    applyAnswer(draft, rawAnswer);
    drafts.push(draft);
  };

  for (const item of ctx.body.items) {
    if (!/Yanlış|Yanlis/i.test(item.text)) continue;
    const wrongPart = item.text.split(/Doğrusu|Dogrusu/i)[0].replace(/^Yanlış\s*:?/i, '');
    if (!backtickTokens(wrongPart).length) continue;
    build(item.key, wrongPart, answerFor(ctx, item.key));
  }

  if (!drafts.length) {
    const wrongLine = ctx.body.looseLines.find((line) => /^Yanlış|^Yanlis/i.test(line));
    if (wrongLine && backtickTokens(wrongLine).length) {
      const rawAnswer = answerLines(ctx).join(' ');
      build('1', wrongLine, rawAnswer || undefined);
    }
  }

  return drafts.length ? drafts : null;
};

/** ```text  ich → ______  ``` → fiil cekimi bosluk doldurma. */
const conjugationExtractor: Extractor = (ctx) => {
  const drafts: DraftExercise[] = [];
  const keyText = answerLines(ctx).join('\n');

  for (const fence of ctx.body.fences) {
    const rows = fence.lines
      .map((line) => line.match(/^\s*(\S+)\s*→\s*_{3,}\s*$/))
      .filter((match): match is RegExpMatchArray => Boolean(match));
    if (!rows.length) continue;

    const verb = fence.lead ? backtickTokens(fence.lead)[0] : undefined;
    for (const row of rows) {
      const pronoun = row[1];
      const answer = findConjugation(keyText, verb, pronoun);
      const draft: DraftExercise = {
        itemKey: `${verb ?? 'fiil'}-${pronoun}`,
        day: ctx.day,
        topic: ctx.topic,
        type: 'fill-blank',
        instruction: verb ? `\`${verb}\` fiilini doğru çek.` : sectionInstruction(ctx),
        prompt: `${pronoun} ___`,
        answer,
        hint: ctx.body.hint,
      };
      drafts.push(draft);
    }
  }
  return drafts.length ? drafts : null;
};

/** "`kommen`: ich komme, du kommst, wir kommen" satirindan tek cekimi bulur. */
function findConjugation(keyText: string, verb: string | undefined, pronoun: string): string | undefined {
  const lines = keyText.split('\n');
  const line = verb
    ? lines.find((candidate) => backtickTokens(candidate).includes(verb))
    : lines.find((candidate) => new RegExp(`\\b${pronoun}\\s+\\S`).test(candidate));
  if (!line) return undefined;
  const match = stripBackticks(line).match(new RegExp(`\\b${pronoun}\\s+([\\p{L}ß]+)`, 'u'));
  return match?.[1];
}

/** "1. Ich _____ aus der Türkei. (kommen)" → cumle ici bosluk doldurma. */
const inlineBlankExtractor: Extractor = (ctx) => {
  const drafts: DraftExercise[] = [];
  for (const item of ctx.body.items) {
    const text = item.text;
    if (!hasBlank(text)) continue;
    // Bosluk cumlenin sonundaysa bu bir "uretim" sorusudur, burada islenmez.
    if (/_{3,}\s*$/.test(text.replace(/\([^)]*\)\s*$/, '').trim())) continue;

    const cueMatch = text.match(/\(([^)]+)\)\s*$/);
    const cue = cueMatch?.[1];
    // "*(müde = yorgun)*" gibi italik kelime aciklamalari sorudan ayrilir.
    const withoutCue = text.replace(/\([^)]*\)\s*$/, '');
    const glossMatch = withoutCue.match(/\*\(([^)]+)\)\*/);
    const sentence = collapseSpaces(withoutCue.replace(/\*\([^)]+\)\*/g, ''));
    const raw = answerFor(ctx, item.key);
    const answer = raw ? boldTokens(raw)[0] ?? parseAnswerText(raw).answer : undefined;

    const isArticleDrill = !!answer && ARTICLES.includes(answer.toLowerCase());
    const draft = baseDraft(ctx, item, 'fill-blank');
    draft.prompt = sentence.replace(/_{3,}/, '___');
    draft.answer = answer;

    if (isArticleDrill) {
      // Artikel sorusu → der / die / das; yazim toleransi kapali.
      draft.type = 'multiple-choice';
      draft.options = [...ARTICLES];
      draft.instruction = cue ? `Doğru artikeli seç. (${cue})` : 'Doğru artikeli seç.';
      draft.validation = { caseSensitive: false, noTypoTolerance: true };
    } else {
      draft.instruction = cue
        ? `Boşluğu \`${cue}\` fiiliyle doğru çekimde doldur.`
        : sectionInstruction(ctx);
      if (glossMatch) draft.hint = [draft.hint, glossMatch[1]].filter(Boolean).join(' · ');
    }
    drafts.push(draft);
  }
  return drafts.length ? drafts : null;
};

/** "1. `ei` → ______" → kisa cevap (gerekirse coktan secmeliye yukseltilir). */
const arrowExtractor: Extractor = (ctx) => {
  const drafts: DraftExercise[] = [];
  for (const item of ctx.body.items) {
    const match = item.text.match(/^(.+?)→\s*_{3,}/);
    if (!match) continue;
    const raw = answerFor(ctx, item.key);
    const lemmas = backtickTokens(match[1]);
    const draft = baseDraft(ctx, item, 'fill-blank');
    // `**h**` gibi vurgular korunur; arayuz bunlari isaretli gosterir.
    draft.prompt = collapseSpaces(stripBackticks(match[1])).replace(/[:\s]+$/, '');
    if (raw) applyAnswer(draft, afterArrow(raw));

    // "`ich`, `kommen`, `Türkei` → ______" — verilen kelimelerle cumle kurma.
    if (lemmas.length >= 2 && draft.answer && draft.answer.split(/\s+/).length >= 3) {
      draft.type = 'sentence-builder';
      draft.instruction = 'Verilen kelimelerle doğru Almanca cümleyi kur.';
    }
    drafts.push(draft);
  }
  if (!drafts.length) return null;

  maybePromoteToMultipleChoice(drafts);
  return drafts;
};

/**
 * Kardes maddelerin cevaplari kisa Turkce ifadelerse (bosluk iceren, benzersiz)
 * bu bolum coktan secmeliye yukseltilir — cevaplar birbirinin celdiricisi olur.
 * Uretilmesi gereken Almanca kelimeler (tek sozcuk) bu kurala takilmaz.
 */
function maybePromoteToMultipleChoice(drafts: DraftExercise[]): void {
  if (drafts.some((draft) => draft.type !== 'fill-blank')) return;
  const answers = drafts.map((draft) => draft.answer).filter((value): value is string => !!value);
  if (answers.length !== drafts.length || answers.length < 3) return;
  if (!answers.every((answer) => /\s/.test(answer) && answer.length <= 90)) return;
  const unique = new Set(answers.map((answer) => answer.toLocaleLowerCase('tr')));
  if (unique.size !== answers.length) return;

  for (const draft of drafts) {
    draft.type = 'multiple-choice';
    draft.options = answers;
    draft.acceptedAnswers = undefined;
  }
}

/** Sadece madde imli okuma listesi (bosluk yok) → sesli okuma karti. */
const readAloudExtractor: Extractor = (ctx) => {
  if (ctx.body.items.length || !ctx.body.bullets.length) return null;
  if (ctx.body.bullets.some((bullet) => hasBlank(bullet))) return null;

  return [
    {
      itemKey: 'oku',
      day: ctx.day,
      topic: ctx.topic,
      type: 'spoken',
      instruction: sectionInstruction(ctx),
      requirements: ctx.body.bullets.map((bullet) => plain(bullet)),
      sampleAnswer: answerLines(ctx).map(plain).join('\n') || undefined,
      hint: ctx.body.hint,
    },
  ];
};

/** "1. ... : __________" → serbest uretim. */
const openProduceExtractor: Extractor = (ctx) => {
  const drafts: DraftExercise[] = [];
  for (const item of ctx.body.items) {
    if (!hasBlank(item.text)) continue;
    const prompt = collapseSpaces(item.text.replace(/_{3,}/g, '').replace(/[:\s]+$/, ''));
    const raw = answerFor(ctx, item.key);
    const draft = baseDraft(ctx, item, 'free-text');
    draft.prompt = plain(prompt);
    if (raw) {
      const parsed = parseAnswerText(afterArrow(raw));
      draft.answer = parsed.answer;
      if (parsed.acceptedAnswers.length) draft.acceptedAnswers = parsed.acceptedAnswers;
      if (parsed.explanation) draft.explanation = parsed.explanation;
      draft.openEnded = parsed.openEnded || !parsed.isQuotedTarget;
    } else {
      draft.openEnded = true;
    }
    drafts.push(draft);
  }
  return drafts.length ? drafts : null;
};

const EXTRACTORS: Extractor[] = [
  spokenExtractor,
  matchingExtractor,
  multipleChoiceExtractor,
  errorCorrectionExtractor,
  conjugationExtractor,
  inlineBlankExtractor,
  arrowExtractor,
  readAloudExtractor,
  openProduceExtractor,
];

export function extractSection(ctx: Omit<SectionContext, 'body'>): DraftExercise[] {
  const body = parseBody(ctx.section.lines);
  const full: SectionContext = { ...ctx, body };
  for (const extractor of EXTRACTORS) {
    const drafts = extractor(full);
    if (drafts && drafts.length) return drafts;
  }
  return [];
}

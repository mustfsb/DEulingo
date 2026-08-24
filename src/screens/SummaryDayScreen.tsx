import { useEffect, useState } from 'react';
import { Markup } from '../components/Markup';
import { NoteBlockView } from '../components/NoteBlocks';
import { AudioButton } from '../components/AudioButton';
import { getSummary } from '../lib/content';
import type { LearningTrack } from '../content/types';
import { audioController } from '../lib/audio/playback';
import type { GermanExample, RecallQuestion, SummaryTopic } from '../content/types';
import type { ProgressApi } from '../hooks/useProgress';
import type { Route } from '../lib/router';

export function SummaryDayScreen({
  track = 'normal',
  day,
  topicId,
  api,
  navigate,
}: {
  track?: LearningTrack;
  day: number;
  topicId?: string;
  api: ProgressApi;
  navigate: (route: Route) => void;
}) {
  const resolvedTrack: LearningTrack = track ?? 'normal';
  const summary = getSummary(day, resolvedTrack);
  const { progress, update } = api;
  const showPronunciation = progress.settings.showPronunciation;
  const speechSpeed = progress.settings.speechSpeed;
  const speechVoice = progress.settings.speechVoice;
  const audioContextId = `summary:${resolvedTrack}:${day}`;

  // Özet sayfasından ayrılınca elle başlatılmış telaffuz da sayfada kalmaz.
  useEffect(() => {
    audioController.activate(audioContextId);
    return () => audioController.dispose(audioContextId);
  }, [audioContextId]);

  // Okundu isareti — yalnizca bilgilendirme, ustalik anlamina GELMEZ (§52).
  useEffect(() => {
    if (!summary) return;
    const now = new Date().toISOString();
    update((current) => {
      const read = { ...(current.settings.readSummaries ?? {}) };
      let changed = false;
      for (const topic of summary.topics) {
        if (!read[topic.id]) {
          read[topic.id] = now;
          changed = true;
        }
      }
      return changed ? { ...current, settings: { ...current.settings, readSummaries: read } } : current;
    });
  }, [summary, update]);

  // Konuya kaydir.
  useEffect(() => {
    if (!topicId) return;
    const element = document.getElementById(`konu-${topicId}`);
    element?.scrollIntoView({ block: 'start' });
  }, [topicId, summary]);

  if (!summary) {
    return (
      <main className="mx-auto max-w-[640px] px-5 py-20 text-center">
        <h1 className="text-3xl">Bu günün özeti bulunamadı</h1>
        <button type="button" className="btn mt-6" onClick={() => navigate({ name: 'summaries' })}>
          Özetlere Dön
        </button>
      </main>
    );
  }

  const toggleBookmark = (id: string) =>
    update((current) => {
      const bookmarks = current.settings.bookmarks ?? [];
      return {
        ...current,
        settings: {
          ...current.settings,
          bookmarks: bookmarks.includes(id)
            ? bookmarks.filter((item) => item !== id)
            : [...bookmarks, id],
        },
      };
    });

  return (
    <div className="mx-auto flex w-full max-w-[1000px] gap-10 px-5 pb-24 pt-6 sm:pt-10">
      {/* Masaustunde yapiskan konu gezinmesi */}
      <nav className="sticky top-24 hidden h-fit w-52 flex-none lg:block" aria-label="Konular">
        <p className="eyebrow mb-2">Bu günün konuları</p>
        <ul className="flex flex-col gap-1">
          {summary.topics.map((topic) => (
            <li key={topic.id}>
              <a
                href={`#konu-${topic.id}`}
                className="block rounded-lg px-2 py-1.5 text-[0.92rem] text-ink-soft hover:bg-sunk"
                onClick={(event) => {
                  event.preventDefault();
                  document.getElementById(`konu-${topic.id}`)?.scrollIntoView({ block: 'start' });
                }}
              >
                {topic.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <main className="min-w-0 flex-1">
        <button
          type="button"
          className="btn btn-quiet px-0"
          onClick={() => navigate({ name: 'summaries' })}
        >
          ← Özetler
        </button>

        <header className="mt-4 anim-pop">
          <p className="eyebrow">{resolvedTrack === 'private' ? '🎓 Özel Ders • ' : ''}{summary.topics.map((topic) => topic.title).join(' • ')}</p>
          <h1 className="mt-1 text-[2.75rem] sm:text-6xl">{summary.title}{resolvedTrack === 'private' ? ' — Özel Ders' : ''}</h1>
          <p className="mt-3 text-ink-soft">~{summary.estimatedReadingMinutes} dakikalık okuma</p>
        </header>

        <div className="mt-10 flex flex-col gap-14">
          {summary.topics.map((topic) => (
            <TopicSection
              key={topic.id}
              topic={topic}
              day={day}
              bookmarked={(progress.settings.bookmarks ?? []).includes(topic.id)}
              showPronunciation={showPronunciation}
              speechSpeed={speechSpeed}
              speechVoice={speechVoice}
              audioContextId={audioContextId}
              onToggleBookmark={() => toggleBookmark(topic.id)}
              onPractice={() => navigate({ name: 'lesson', track: resolvedTrack, day, mode: 'topic', topicId: topic.id })}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

function TopicSection({
  topic,
  day,
  bookmarked,
  showPronunciation,
  speechSpeed,
  speechVoice,
  audioContextId,
  onToggleBookmark,
  onPractice,
}: {
  topic: SummaryTopic;
  day: number;
  bookmarked: boolean;
  showPronunciation: boolean;
  speechSpeed: import('../lib/audio/tts').SpeechSpeed;
  speechVoice: import('../lib/audio/tts').GermanVoiceId;
  audioContextId: string;
  onToggleBookmark: () => void;
  onPractice: () => void;
}) {
  return (
    <section id={`konu-${topic.id}`} className="scroll-mt-24">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-3xl sm:text-4xl">{topic.title}</h2>
        <button
          type="button"
          className="btn btn-quiet flex-none px-2 text-xl leading-none"
          aria-pressed={bookmarked}
          aria-label={bookmarked ? 'Kaydedilenlerden çıkar' : 'Kaydet'}
          title={bookmarked ? 'Kaydedilenlerden çıkar' : 'Kaydet'}
          onClick={onToggleBookmark}
        >
          {bookmarked ? '⭐' : '☆'}
        </button>
      </div>

      <div className="prose-body mt-5 flex flex-col gap-4 text-[1.02rem] leading-[1.7]">
        {topic.blocks.map((block, index) => (
          <NoteBlockView key={index} block={block} />
        ))}
      </div>

      {topic.warnings.length > 0 && (
        <div className="mt-6 flex flex-col gap-3">
          {topic.warnings.map((warning, index) => (
            <p
              key={index}
              className="rounded-2xl border-l-4 px-4 py-3 text-[0.98rem] leading-relaxed"
              style={{
                background: 'var(--color-bad-soft)',
                borderColor: 'var(--color-bad)',
              }}
            >
              <span className="font-bold">⚠ Dikkat · </span>
              <Markup text={warning} />
            </p>
          ))}
        </div>
      )}

      {showPronunciation && topic.pronunciation.length > 0 && (
        <details className="mt-6 rounded-2xl bg-sunk px-4 py-3">
          <summary className="cursor-pointer font-bold">🔊 Yaklaşık okunuş</summary>
          <p className="mt-1 text-[0.85rem] text-ink-faint">
            Türkçe yazım Almanca sesleri birebir veremez; bunlar yaklaşık karşılıklardır.
          </p>
          <ul className="mt-2 flex flex-col gap-1">
            {topic.pronunciation.map((item) => (
              <li key={item.german} className="flex flex-wrap items-center gap-1.5 text-[0.95rem]">
                <span className="pronunciation-hover-target">
                  <span className="pronunciation-hover-text de" lang="de">
                    {item.german}
                  </span>
                  <AudioButton
                    target={{ text: item.german, language: 'de-DE', role: 'vocabulary' }}
                    contextId={audioContextId}
                    speed={speechSpeed}
                    voice={speechVoice}
                    compact
                    revealOnHover
                  />
                </span>{' '}
                <span aria-hidden="true">·</span>{' '}
                <span className="font-mono text-ink-soft">{item.turkishApproximation}</span>
              </li>
            ))}
          </ul>
        </details>
      )}

      {topic.examples.length > 0 && (
        <Examples
          items={topic.examples}
          showPronunciation={showPronunciation}
          speechSpeed={speechSpeed}
          speechVoice={speechVoice}
          audioContextId={audioContextId}
        />
      )}

      {topic.keyPoints.length > 0 && (
        <div className="mt-6 rounded-2xl px-4 py-3" style={{ background: 'var(--color-brand-soft)' }}>
          <p className="eyebrow" style={{ color: 'var(--color-brand)' }}>
            Bunları yapabiliyor musun?
          </p>
          <ul className="mt-2 ml-4 flex list-disc flex-col gap-1 text-[0.95rem]">
            {topic.keyPoints.map((point, index) => (
              <li key={index}>
                <Markup text={point} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {topic.recallQuestions.length > 0 && <RecallList items={topic.recallQuestions} />}

      <div className="mt-7 flex flex-wrap gap-3">
        <button type="button" className="btn btn-primary" onClick={onPractice}>
          Bu Konuyu Çalış
        </button>
        <span className="self-center text-sm text-ink-faint">{day}. Gün · {topic.title}</span>
      </div>
    </section>
  );
}

function Examples({
  items,
  showPronunciation,
  speechSpeed,
  speechVoice,
  audioContextId,
}: {
  items: GermanExample[];
  showPronunciation: boolean;
  speechSpeed: import('../lib/audio/tts').SpeechSpeed;
  speechVoice: import('../lib/audio/tts').GermanVoiceId;
  audioContextId: string;
}) {
  return (
    <div className="mt-6">
      <p className="eyebrow mb-2">Örnekler</p>
      <ul className="flex flex-col gap-2.5">
        {items.slice(0, 8).map((example, index) => (
          <li key={index} className="border-l-2 border-line pl-3.5">
            <div>
              <span className="pronunciation-hover-target">
                <span className="pronunciation-hover-text de text-[1.05rem] font-bold" lang="de">
                  {example.german}
                </span>
                <AudioButton
                  target={{ text: example.german, language: 'de-DE', role: 'example' }}
                  contextId={audioContextId}
                  speed={speechSpeed}
                  voice={speechVoice}
                  compact
                  revealOnHover
                />
              </span>
            </div>
            {example.turkish && <p className="text-[0.92rem] text-ink-soft">{example.turkish}</p>}
            {showPronunciation && example.pronunciation && (
              <p className="font-mono text-[0.82rem] text-ink-faint">
                {example.pronunciation.turkishApproximation}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function RecallList({ items }: { items: RecallQuestion[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="mt-6">
      <p className="eyebrow mb-2">Kendine sor</p>
      <ul className="flex flex-col gap-1.5">
        {items.map((item, index) => (
          <li key={index}>
            <button
              type="button"
              className="w-full rounded-xl bg-sunk px-3.5 py-2.5 text-left text-[0.95rem]"
              aria-expanded={open === index}
              onClick={() => setOpen(open === index ? null : index)}
            >
              <span className="font-bold">{open === index ? '▾' : '▸'} </span>
              <Markup text={item.question} />
            </button>
            {open === index && (
              <p className="mt-1 px-3.5 text-[0.95rem] leading-snug text-ink-soft anim-pop">
                <Markup text={item.answer} />
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

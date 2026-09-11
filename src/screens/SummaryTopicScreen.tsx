import { useEffect, useState } from 'react';
import { Markup } from '../components/Markup';
import { NoteBlockView } from '../components/NoteBlocks';
import { AudioButton } from '../components/AudioButton';
import { exercisesForSection, getTopic, getTopicSummary, reviewSummary, topicTitle } from '../lib/content';
import { reviewSectionAction } from '../lib/general-review';
import { previewReviewSize, startReviewSession } from '../lib/start-review';
import { audioController } from '../lib/audio/playback';
import type { GermanExample, RecallQuestion, SummarySection } from '../content/types';
import type { ProgressApi } from '../hooks/useProgress';
import type { Route } from '../lib/router';
import type { GermanVoiceId, SpeechSpeed } from '../lib/audio/tts';

/** Okundu işareti — yalnızca bilgilendirme, ustalık anlamına GELMEZ (§52). */
function useMarkRead(api: ProgressApi, sectionIds: string[]) {
  const { update } = api;
  const key = sectionIds.join('|');
  useEffect(() => {
    if (!key) return;
    const now = new Date().toISOString();
    update((current) => {
      const read = { ...(current.settings.readSummaries ?? {}) };
      let changed = false;
      for (const id of key.split('|')) {
        if (!read[id]) {
          read[id] = now;
          changed = true;
        }
      }
      return changed ? { ...current, settings: { ...current.settings, readSummaries: read } } : current;
    });
  }, [key, update]);
}

function useAudioContext(contextId: string) {
  // Özet sayfasından ayrılınca elle başlatılmış telaffuz da sayfada kalmaz.
  useEffect(() => {
    audioController.activate(contextId);
    return () => audioController.dispose(contextId);
  }, [contextId]);
}

function useScrollToSection(sectionId: string | undefined) {
  useEffect(() => {
    if (!sectionId) return;
    document.getElementById(`bolum-${sectionId}`)?.scrollIntoView({ block: 'start' });
  }, [sectionId]);
}

function toggleBookmark(api: ProgressApi, id: string) {
  api.update((current) => {
    const bookmarks = current.settings.bookmarks ?? [];
    return {
      ...current,
      settings: {
        ...current.settings,
        bookmarks: bookmarks.includes(id) ? bookmarks.filter((item) => item !== id) : [...bookmarks, id],
      },
    };
  });
}

/* ------------------------------------------------------------------ */
/* Konu özeti                                                           */
/* ------------------------------------------------------------------ */

export function SummaryTopicScreen({
  topicId,
  sectionId,
  api,
  navigate,
}: {
  topicId: string;
  sectionId?: string;
  api: ProgressApi;
  navigate: (route: Route) => void;
}) {
  const summary = getTopicSummary(topicId);
  const topic = getTopic(topicId);
  const { progress } = api;
  const audioContextId = `summary:${topicId}`;
  useAudioContext(audioContextId);
  useMarkRead(api, summary?.sections.map((section) => section.id) ?? []);
  useScrollToSection(sectionId);

  if (!summary || !topic) {
    return (
      <main className="mx-auto max-w-[640px] px-5 py-20 text-center">
        <h1 className="text-3xl">Bu konunun özeti bulunamadı</h1>
        <button type="button" className="btn mt-6" onClick={() => navigate({ name: 'summaries' })}>
          Özetlere Dön
        </button>
      </main>
    );
  }

  const practiceTopic = () => navigate({ name: 'lesson', topicId, mode: 'normal' });

  return (
    <div className="mx-auto flex w-full max-w-[1000px] gap-10 px-5 pb-24 pt-6 sm:pt-10">
      <SectionNav sections={summary.sections} />

      <main className="min-w-0 flex-1">
        <button type="button" className="btn btn-quiet px-0" onClick={() => navigate({ name: 'summaries' })}>
          ← Özetler
        </button>

        <header className="mt-4 anim-pop">
          <p className="eyebrow">Konu özeti · {summary.sections.length} bölüm</p>
          <h1 className="mt-1 text-[2.75rem] sm:text-6xl">
            <span aria-hidden="true">{topic.emoji} </span>
            {summary.title}
          </h1>
          {summary.intro.map((line, index) => (
            <p key={index} className="prose-body mt-3 text-[1.02rem] leading-[1.7] text-ink-soft">
              <Markup text={line} />
            </p>
          ))}
          <p className="mt-3 text-sm text-ink-faint">~{summary.estimatedReadingMinutes} dakikalık okuma</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" className="btn btn-primary" onClick={practiceTopic}>
              Bu Konuyu Çalış
            </button>
            <button type="button" className="btn btn-quiet" onClick={() => navigate({ name: 'topic', topicId })}>
              Konu sayfası →
            </button>
          </div>
        </header>

        <div className="mt-10 flex flex-col gap-14">
          {summary.sections.map((section) => {
            const count = exercisesForSection(section.id).length;
            return (
              <SectionView
                key={section.id}
                section={section}
                bookmarked={(progress.settings.bookmarks ?? []).includes(section.id)}
                settings={progress.settings}
                audioContextId={audioContextId}
                onToggleBookmark={() => toggleBookmark(api, section.id)}
                practice={
                  count > 0
                    ? {
                      label: 'Bu Bölümü Çalış',
                      detail: `${count} alıştırma`,
                      onClick: () => navigate({ name: 'lesson', topicId, mode: 'section', sectionId: section.id }),
                    }
                    : undefined
                }
                footnote={topic.title}
              />
            );
          })}
        </div>

        {summary.keyPoints.length > 0 && (
          <section className="mt-14 rounded-2xl px-4 py-3" style={{ background: 'var(--color-brand-soft)' }}>
            <p className="eyebrow" style={{ color: 'var(--color-brand)' }}>
              Bunları yapabiliyor musun?
            </p>
            <ul className="mt-2 ml-4 flex list-disc flex-col gap-1 text-[0.95rem]">
              {summary.keyPoints.map((point, index) => (
                <li key={index}>
                  <Markup text={point} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {summary.recallQuestions.length > 0 && <RecallList items={summary.recallQuestions} />}

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <button type="button" className="btn btn-primary" onClick={practiceTopic}>
            Bu Konuyu Çalış
          </button>
          <span className="text-sm text-ink-faint">{topic.title} · {topic.exerciseIds.length} alıştırma</span>
        </div>
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Genel Tekrar özeti                                                   */
/* ------------------------------------------------------------------ */

export function ReviewSummaryScreen({
  sectionId,
  api,
  navigate,
}: {
  sectionId?: string;
  api: ProgressApi;
  navigate: (route: Route) => void;
}) {
  const summary = reviewSummary;
  const { progress } = api;
  const audioContextId = 'summary:genel';
  useAudioContext(audioContextId);
  useMarkRead(api, summary?.sections.map((section) => section.id) ?? []);
  useScrollToSection(sectionId);

  if (!summary) {
    return (
      <main className="mx-auto max-w-[640px] px-5 py-20 text-center">
        <h1 className="text-3xl">Genel Tekrar özeti bulunamadı</h1>
        <button type="button" className="btn mt-6" onClick={() => navigate({ name: 'summaries' })}>
          Özetlere Dön
        </button>
      </main>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1000px] gap-10 px-5 pb-24 pt-6 sm:pt-10">
      <SectionNav sections={summary.sections} />

      <main className="min-w-0 flex-1">
        <button type="button" className="btn btn-quiet px-0" onClick={() => navigate({ name: 'summaries' })}>
          ← Özetler
        </button>

        <header className="mt-4 anim-pop">
          <p className="eyebrow">🔁 Kümülatif tekrar</p>
          <h1 className="mt-1 text-[2.75rem] sm:text-6xl">🔁 Genel Tekrar</h1>
          {summary.intro.map((line, index) => (
            <p key={index} className="prose-body mt-3 text-[1.02rem] leading-[1.7] text-ink-soft">
              <Markup text={line} />
            </p>
          ))}
          <p className="mt-3 text-sm text-ink-faint">~{summary.estimatedReadingMinutes} dakikalık okuma</p>
        </header>

        <div className="mt-10 flex flex-col gap-14">
          {summary.sections.map((section) => {
            const action = reviewSectionAction(section.id);
            const size = action ? previewReviewSize(action.mode ?? 'topic', action.topicId) : 0;
            return (
              <SectionView
                key={section.id}
                section={section}
                bookmarked={(progress.settings.bookmarks ?? []).includes(section.id)}
                settings={progress.settings}
                audioContextId={audioContextId}
                onToggleBookmark={() => toggleBookmark(api, section.id)}
                practice={
                  action && size > 0
                    ? {
                      label: 'Bu Konuyu Çalış',
                      detail: `~${size} soru`,
                      onClick: () =>
                        startReviewSession(api, navigate, { mode: action.mode ?? 'topic', topicId: action.topicId }),
                    }
                    : undefined
                }
                footnote={section.topicId ? `Genel Tekrar · ${topicTitle(section.topicId)}` : 'Genel Tekrar'}
                extra={
                  section.topicId ? (
                    <button
                      type="button"
                      className="btn btn-quiet"
                      onClick={() => navigate({ name: 'summary', topicId: section.topicId })}
                    >
                      Konu özetini aç →
                    </button>
                  ) : undefined
                }
              />
            );
          })}
        </div>
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Ortak parçalar                                                       */
/* ------------------------------------------------------------------ */

function SectionNav({ sections }: { sections: SummarySection[] }) {
  return (
    <nav className="sticky top-24 hidden h-fit max-h-[calc(100dvh-8rem)] w-52 flex-none overflow-y-auto lg:block" aria-label="Bölümler">
      <p className="eyebrow mb-2">Bölümler</p>
      <ul className="flex flex-col gap-1">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#bolum-${section.id}`}
              className="block rounded-lg px-2 py-1.5 text-[0.92rem] text-ink-soft hover:bg-sunk"
              onClick={(event) => {
                event.preventDefault();
                document.getElementById(`bolum-${section.id}`)?.scrollIntoView({ block: 'start' });
              }}
            >
              {section.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function SectionView({
  section,
  bookmarked,
  settings,
  audioContextId,
  onToggleBookmark,
  practice,
  footnote,
  extra,
}: {
  section: SummarySection;
  bookmarked: boolean;
  settings: { showPronunciation: boolean; speechSpeed: SpeechSpeed; speechVoice: GermanVoiceId };
  audioContextId: string;
  onToggleBookmark: () => void;
  practice?: { label: string; detail: string; onClick: () => void };
  footnote: string;
  extra?: React.ReactNode;
}) {
  const { showPronunciation, speechSpeed, speechVoice } = settings;
  return (
    <section id={`bolum-${section.id}`} className="scroll-mt-24">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-3xl sm:text-4xl">{section.title}</h2>
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
        {section.blocks.map((block, index) => (
          <NoteBlockView key={index} block={block} />
        ))}
      </div>

      {section.warnings.length > 0 && (
        <div className="mt-6 flex flex-col gap-3">
          {section.warnings.map((warning, index) => (
            <p
              key={index}
              className="rounded-2xl border-l-4 px-4 py-3 text-[0.98rem] leading-relaxed"
              style={{ background: 'var(--color-bad-soft)', borderColor: 'var(--color-bad)' }}
            >
              <span className="font-bold">⚠ Dikkat · </span>
              <Markup text={warning} />
            </p>
          ))}
        </div>
      )}

      {showPronunciation && section.pronunciation.length > 0 && (
        <details className="mt-6 rounded-2xl bg-sunk px-4 py-3">
          <summary className="cursor-pointer font-bold">🔊 Yaklaşık okunuş</summary>
          <p className="mt-1 text-[0.85rem] text-ink-faint">
            Türkçe yazım Almanca sesleri birebir veremez; bunlar yaklaşık karşılıklardır.
          </p>
          <ul className="mt-2 flex flex-col gap-1">
            {section.pronunciation.map((item) => (
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

      {section.examples.length > 0 && (
        <Examples
          items={section.examples}
          showPronunciation={showPronunciation}
          speechSpeed={speechSpeed}
          speechVoice={speechVoice}
          audioContextId={audioContextId}
        />
      )}

      {section.recallQuestions && section.recallQuestions.length > 0 && <RecallList items={section.recallQuestions} />}

      <div className="mt-7 flex flex-wrap items-center gap-3">
        {practice && (
          <button type="button" className="btn btn-primary" onClick={practice.onClick}>
            {practice.label}
          </button>
        )}
        {extra}
        <span className="text-sm text-ink-faint">
          {footnote}
          {practice ? ` · ${practice.detail}` : ''}
        </span>
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
  speechSpeed: SpeechSpeed;
  speechVoice: GermanVoiceId;
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

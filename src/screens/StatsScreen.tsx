import { useMemo, useRef, useState } from 'react';
import {
  allExercises,
  lessonExercises,
  migrationContext,
  primaryExercisesForTopic,
  reviewBank,
  topicMasteryDefs,
  topics as curriculumTopics,
  topicTitle,
} from '../lib/content';
import {
  getGlobalSummary,
  getTopicProgressStats,
  getTopicStats,
  resetAllProgress,
  resetTopicProgress,
} from '../lib/progress';
import { computeTopicMastery } from '../lib/mastery';
import { parseImportedProgress, serializeProgress } from '../lib/storage';
import type { ProgressApi } from '../hooks/useProgress';
import { DEFAULT_GERMAN_VOICE_ID, GERMAN_VOICE_PROFILES, isSpeechSpeed } from '../lib/audio/tts';
import { GOAL_OPTIONS, goalProgress } from '../lib/daily-goal';

export function StatsScreen({ api }: { api: ProgressApi }) {
  const { progress, update, replace } = api;
  const summary = getGlobalSummary(progress, lessonExercises);
  const reviewAttempted = reviewBank.filter((exercise) => progress.exercises[exercise.id]?.attempts.length).length;
  // Zorlanılan konular Genel Tekrar cevaplarını da kanonik konusuna sayar.
  const topics = getTopicStats(progress, allExercises).filter((topic) => topic.incorrect + topic.typo > 0);
  const today = goalProgress(progress);
  const mastery = useMemo(
    () => new Map(computeTopicMastery(progress, allExercises, topicMasteryDefs).map((item) => [item.topicId, item])),
    [progress],
  );

  const [confirmReset, setConfirmReset] = useState(false);
  const [resetTopic, setResetTopic] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const exportProgress = () => {
    const blob = new Blob([serializeProgress(progress)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `almanca-ilerleme-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setMessage('İlerleme JSON olarak indirildi.');
  };

  const importProgress = async (file: File) => {
    const result = parseImportedProgress(await file.text(), migrationContext);
    if (!result.ok || !result.progress) {
      setMessage(`İçe aktarılamadı: ${result.error}`);
      return;
    }
    replace(result.progress);
    setMessage('İlerleme geri yüklendi.');
  };

  return (
    <main className="mx-auto w-full max-w-[820px] px-5 pb-24 pt-6 sm:pt-10">
      <header className="anim-pop">
        <p className="eyebrow">Genel durum</p>
        <h1 className="mt-1 text-[2.5rem] sm:text-5xl">İstatistik</h1>
      </header>

      <section className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Metric label="Çözülen alıştırma" value={`${summary.attemptedExercises}/${summary.totalExercises}`} />
        <Metric
          label="Doğruluk"
          value={summary.accuracy === null ? '—' : `%${Math.round(summary.accuracy * 100)}`}
        />
        <Metric label="Toplam yanlış" value={String(summary.totalIncorrect)} tone="var(--color-bad)" />
        <Metric label="Yazım hatası" value={String(summary.totalTypos)} tone="var(--color-warn)" />
        <Metric label="Tamamlanan konu" value={`${summary.completedTopics}/${curriculumTopics.length}`} />
        <Metric label="Çalışılan takvim günü" value={String(summary.studyDays)} />
        <Metric
          label="Bugün"
          value={`${Math.round(today.minutes)}/${today.targetMinutes} dk`}
          tone={today.reached ? 'var(--color-good-deep)' : undefined}
        />
      </section>

      <section className="mt-10">
        <h2 className="text-2xl">En çok zorlandığım konular</h2>
        {topics.length === 0 ? (
          <p className="mt-3 text-ink-soft">Henüz yeterli veri yok.</p>
        ) : (
          <ol className="mt-4 flex flex-col gap-2">
            {topics.slice(0, 6).map((topic, index) => (
              <li key={topic.topicId} className="card flex items-center gap-4 px-4 py-3">
                <span className="numeral text-2xl text-ink-faint">{index + 1}</span>
                <span className="flex-1 font-bold">{topicTitle(topic.topicId)}</span>
                <span className="text-sm text-ink-soft">
                  {topic.incorrect} yanlış · {topic.typo} yazım
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="mt-7 grid grid-cols-2 gap-3">
        <Metric label="Genel Tekrar — Çözülen" value={`${reviewAttempted}/${reviewBank.length}`} />
        <Metric label="Tamamlanan konu" value={`${summary.completedTopics}/${curriculumTopics.length}`} />
      </section>

      <section className="mt-10">
        <h2 className="text-2xl">Konu konu ustalık</h2>
        <p className="mt-1 text-[0.92rem] text-ink-soft">
          Ustalık kavram bazlıdır (Genel Tekrar cevapları dahil); tamamlanma konunun kendi alıştırmalarıyla ölçülür.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          {curriculumTopics.map((topic) => {
            const stats = getTopicProgressStats(progress, topic.id, primaryExercisesForTopic(topic.id));
            const score = mastery.get(topic.id)?.masteryScore ?? 0;
            return (
              <div key={topic.id} className="card flex items-center gap-4 px-4 py-3">
                <span className="w-44 flex-none truncate font-bold sm:w-56">
                  <span aria-hidden="true">{topic.emoji} </span>
                  {topic.title}
                </span>
                <div className="flex-1">
                  <div
                    className="rail h-2"
                    role="progressbar"
                    aria-label={`${topic.title} ustalığı`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(score * 100)}
                  >
                    <div
                      className="rail-fill"
                      style={{
                        width: `${Math.max(2, Math.round(score * 100))}%`,
                        background: stats.state === 'completed' ? 'var(--color-good)' : 'var(--color-brand)',
                      }}
                    />
                  </div>
                </div>
                <span className="w-32 flex-none text-right text-sm text-ink-soft">
                  %{Math.round(score * 100)} · {stats.completed}/{stats.total}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl">Ayarlar</h2>
        <fieldset className="card mt-4 p-4">
          <legend className="px-1 text-lg font-bold">Görünüm</legend>
          <p className="mt-1 text-[0.92rem] text-ink-soft">Sistem ayarında cihazının renk tercihi otomatik takip edilir.</p>
          <div className="theme-segment mt-3" role="radiogroup" aria-label="Görünüm tercihi">
            {([
              ['system', 'Sistem'],
              ['light', 'Açık'],
              ['dark', 'Koyu'],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={api.progress.settings.themePreference === value}
                className="theme-segment-option"
                data-selected={api.progress.settings.themePreference === value || undefined}
                onClick={() =>
                  api.update((current) => ({
                    ...current,
                    settings: { ...current.settings, themePreference: value },
                  }))
                }
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>
        <label className="card mt-4 flex items-center justify-between gap-4 p-4">
          <span>
            <span className="block text-lg font-bold">Günlük hedef</span>
            <span className="block text-[0.92rem] text-ink-soft">
              Ana sayfadaki bugünkü hedef çubuğu bu süreyi hedefler. Yalnızca bu tarayıcıda tutulur.
            </span>
          </span>
          <select
            className="rounded-xl border-2 border-line bg-surface px-3 py-2 font-bold"
            value={String(progress.settings.dailyGoalMinutes)}
            aria-label="Günlük hedef"
            onChange={(event) => {
              const dailyGoalMinutes = Number(event.target.value) || 10;
              update((current) => ({
                ...current,
                settings: { ...current.settings, dailyGoalMinutes },
              }));
            }}
          >
            {GOAL_OPTIONS.map((minutes) => (
              <option key={minutes} value={minutes}>
                {minutes} dakika
              </option>
            ))}
          </select>
        </label>
        <ToggleSetting
          title="Ses efektleri"
          description="Doğru ve yanlış cevaplarda kısa, yerel geri bildirim sesi çalar."
          checked={api.progress.settings.soundEffects}
          onChange={(soundEffects) =>
            api.update((current) => ({ ...current, settings: { ...current.settings, soundEffects } }))
          }
        />
        <ToggleSetting
          title="Otomatik telaffuz"
          description="Uygun Almanca soru ve doğru cevap, geri bildirimden sonra Piper ile dinletilir."
          checked={api.progress.settings.autoPronunciation}
          onChange={(autoPronunciation) =>
            api.update((current) => ({ ...current, settings: { ...current.settings, autoPronunciation } }))
          }
        />
        <ToggleSetting
          title="Türkçe yaklaşık okunuş"
          description="Cevap verdikten sonra “Yaklaşık okunuş” bilgisi görünür; sesin yerine geçmez."
          checked={api.progress.settings.showPronunciation}
          onChange={(showPronunciation) =>
            api.update((current) => ({ ...current, settings: { ...current.settings, showPronunciation } }))
          }
        />
        <label className="card mt-4 flex items-center justify-between gap-4 p-4">
          <span>
            <span className="block text-lg font-bold">Telaffuz sesi</span>
            <span className="block text-[0.92rem] text-ink-soft">Yerel Piper sesi; seçimin tüm Almanca telaffuzlarda kullanılır.</span>
          </span>
          <select
            className="min-w-0 max-w-[55%] truncate rounded-xl border-2 border-line bg-surface px-3 py-2 font-bold"
            value={api.progress.settings.speechVoice}
            aria-label="Telaffuz sesi"
            onChange={(event) => {
              const speechVoice = GERMAN_VOICE_PROFILES.find((profile) => profile.id === event.target.value)?.id ?? DEFAULT_GERMAN_VOICE_ID;
              api.update((current) => ({
                ...current,
                settings: { ...current.settings, speechVoice },
              }));
            }}
          >
            {GERMAN_VOICE_PROFILES.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.label} — {profile.description}
              </option>
            ))}
          </select>
        </label>
        <label className="card mt-4 flex items-center justify-between gap-4 p-4">
          <span>
            <span className="block text-lg font-bold">Telaffuz hızı</span>
            <span className="block text-[0.92rem] text-ink-soft">Dört ses için dengelenmiş yavaş, normal veya hızlı tekrar.</span>
          </span>
          <select
            className="rounded-xl border-2 border-line bg-surface px-3 py-2 font-bold"
            value={api.progress.settings.speechSpeed}
            aria-label="Telaffuz hızı"
            onChange={(event) =>
              api.update((current) => ({
                ...current,
                settings: {
                  ...current.settings,
                  speechSpeed: isSpeechSpeed(event.target.value) ? event.target.value : 'normal',
                },
              }))
            }
          >
            <option value="slow">Yavaş</option>
            <option value="normal">Normal</option>
            <option value="fast">Hızlı</option>
          </select>
        </label>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl">Yedekleme</h2>
        <p className="mt-2 text-ink-soft">
          İlerleme yalnızca bu tarayıcıda saklanır. Düzenli olarak dışa aktarman önerilir.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" className="btn" onClick={exportProgress}>
            İlerlemeyi Dışa Aktar
          </button>
          <button type="button" className="btn" onClick={() => fileInput.current?.click()}>
            İlerlemeyi İçe Aktar
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void importProgress(file);
              event.target.value = '';
            }}
          />
        </div>
        {message && <p className="mt-3 text-[0.95rem] font-bold">{message}</p>}
      </section>

      <section className="mt-12">
        <h2 className="text-2xl">Sıfırlama</h2>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="text-[0.95rem] text-ink-soft" htmlFor="reset-topic">
            Tek bir konuyu sıfırla:
          </label>
          <select
            id="reset-topic"
            className="rounded-xl border-2 border-line bg-surface px-3 py-2 font-bold"
            value={resetTopic ?? ''}
            onChange={(event) => setResetTopic(event.target.value || null)}
          >
            <option value="">Konu seç</option>
            {curriculumTopics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.title}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn"
            disabled={resetTopic === null}
            onClick={() => {
              if (resetTopic === null) return;
              const title = topicTitle(resetTopic);
              if (!window.confirm(`“${title}” konusunun ilerlemesi silinsin mi? Bu işlem geri alınamaz.`)) return;
              const ids = primaryExercisesForTopic(resetTopic).map((exercise) => exercise.id);
              update((current) => resetTopicProgress(current, resetTopic, ids));
              setMessage(`“${title}” ilerlemesi sıfırlandı.`);
              setResetTopic(null);
            }}
          >
            Sadece bu konuyu sıfırla
          </button>
        </div>

        <div className="mt-6">
          {confirmReset ? (
            <div
              className="card p-5"
              style={{ borderColor: 'var(--color-bad)', boxShadow: '0 5px 0 0 var(--color-bad)' }}
            >
              <p className="font-bold">Tüm ilerleme kalıcı olarak silinecek. Emin misin?</p>
              <p className="mt-1 text-[0.95rem] text-ink-soft">
                Önce “İlerlemeyi Dışa Aktar” ile yedek almanı öneririm.
              </p>
              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  className="btn btn-bad"
                  onClick={() => {
                    replace(resetAllProgress());
                    setConfirmReset(false);
                    setMessage('Tüm ilerleme sıfırlandı.');
                  }}
                >
                  Evet, hepsini sil
                </button>
                <button type="button" className="btn" onClick={() => setConfirmReset(false)}>
                  Vazgeç
                </button>
              </div>
            </div>
          ) : (
            <button type="button" className="btn btn-quiet px-0" onClick={() => setConfirmReset(true)}>
              Tüm ilerlemeyi sıfırla…
            </button>
          )}
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="card px-4 py-4">
      <p className="eyebrow">{label}</p>
      <p className="numeral mt-1 text-3xl" style={{ color: tone }}>
        {value}
      </p>
    </div>
  );
}

function ToggleSetting({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="card mt-4 flex cursor-pointer items-center justify-between gap-4 p-4">
      <span>
        <span className="block text-lg font-bold">{title}</span>
        <span className="block text-[0.92rem] text-ink-soft">{description}</span>
      </span>
      <input
        type="checkbox"
        className="size-6 flex-none accent-[var(--color-brand)]"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}

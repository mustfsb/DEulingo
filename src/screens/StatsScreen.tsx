import { useRef, useState } from 'react';
import { allExercises, days, exercisesForDay } from '../lib/content';
import { getDayStats, getGlobalSummary, getTopicStats, resetAllProgress, resetDayProgress } from '../lib/progress';
import { parseImportedProgress, serializeProgress } from '../lib/storage';
import type { ProgressApi } from '../hooks/useProgress';
import { GERMAN_VOICE_PROFILES, isSpeechSpeed } from '../lib/audio/tts';
import { GOAL_OPTIONS, goalProgress } from '../lib/daily-goal';

export function StatsScreen({ api }: { api: ProgressApi }) {
  const { progress, update, replace } = api;
  const dayNumbers = days.map((day) => day.day);
  const summary = getGlobalSummary(progress, allExercises, dayNumbers);
  const topics = getTopicStats(progress, allExercises).filter((topic) => topic.incorrect + topic.typo > 0);
  const today = goalProgress(progress);

  const [confirmReset, setConfirmReset] = useState(false);
  const [resetDay, setResetDay] = useState<number | null>(null);
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
    const result = parseImportedProgress(await file.text());
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
        <Metric label="Tamamlanan gün" value={String(summary.completedDays)} />
        <Metric label="Çalışılan gün" value={String(summary.studyDays)} />
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
              <li key={topic.topic} className="card flex items-center gap-4 px-4 py-3">
                <span className="numeral text-2xl text-ink-faint">{index + 1}</span>
                <span className="flex-1 font-bold">{topic.topic}</span>
                <span className="text-sm text-ink-soft">
                  {topic.incorrect} yanlış · {topic.typo} yazım
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-2xl">Gün gün</h2>
        <div className="mt-4 flex flex-col gap-2">
          {days.map((day) => {
            const stats = getDayStats(progress, day.day, exercisesForDay(day.day));
            return (
              <div key={day.day} className="card flex items-center gap-4 px-4 py-3">
                <span className="numeral w-8 text-2xl">{day.day}</span>
                <div className="flex-1">
                  <div className="rail h-2">
                    <div
                      className="rail-fill"
                      style={{
                        width: `${Math.round(stats.completionPct * 100)}%`,
                        background: stats.state === 'completed' ? 'var(--color-good)' : 'var(--color-brand)',
                      }}
                    />
                  </div>
                </div>
                <span className="w-28 text-right text-sm text-ink-soft">
                  {stats.completed}/{stats.total} ·{' '}
                  {stats.accuracy === null ? '—' : `%${Math.round(stats.accuracy * 100)}`}
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
            className="rounded-xl border-2 border-line bg-surface px-3 py-2 font-bold"
            value={api.progress.settings.speechVoice}
            aria-label="Telaffuz sesi"
            onChange={(event) => {
              const speechVoice = GERMAN_VOICE_PROFILES.find((profile) => profile.id === event.target.value)?.id ?? 'thorsten';
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
          <label className="text-[0.95rem] text-ink-soft" htmlFor="reset-day">
            Tek bir günü sıfırla:
          </label>
          <select
            id="reset-day"
            className="rounded-xl border-2 border-line bg-surface px-3 py-2 font-bold"
            value={resetDay ?? ''}
            onChange={(event) => setResetDay(event.target.value ? Number(event.target.value) : null)}
          >
            <option value="">Gün seç</option>
            {days.map((day) => (
              <option key={day.day} value={day.day}>
                {day.day}. Gün
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn"
            disabled={resetDay === null}
            onClick={() => {
              if (resetDay === null) return;
              if (!window.confirm(`${resetDay}. Gün ilerlemesi silinsin mi? Bu işlem geri alınamaz.`)) return;
              update((current) => resetDayProgress(current, resetDay));
              setMessage(`${resetDay}. Gün ilerlemesi sıfırlandı.`);
              setResetDay(null);
            }}
          >
            Sadece bu günü sıfırla
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

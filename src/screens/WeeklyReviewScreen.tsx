/**
 * 1. Hafta Çalışma Planı (Session A–G): gerçek bir 15–20 saatlik yol haritası.
 *
 * Süreler içerikten türetilir (`lib/week-workload.ts`) ve aralık olarak
 * gösterilir (hızlı – tipik öğrenci). `Git` ile açılan aktivitenin gerçek
 * aktif süresi ölçülür ve satırda "sen: 14 dk" olarak görünür; süre hiçbir
 * şeyi kilitlemez, tamamlanma manuel kutudur.
 *
 * Her satır: onay kutusu + ne yapılacak + süre + hedefin tam yolu + `Git`.
 * Onay kutusu = "tamamladım" (yetkili); `Git` = tam pratiğe git. Oturum ve
 * hafta ilerlemesi yalnızca işaretlerden TÜRETİLİR (ayrı durum yok).
 */

import { useState } from 'react';
import {
  EN_WEEK_1_MINUTES,
  EN_WEEK_1_MINUTES_TYPICAL,
  EN_WEEK_1_PLAN,
  formatMinutes,
  weekPlanProgress,
  type WeekLink,
} from '../content/en/skills-weekly';
import { extensionFor, familyFactors, finishedEarly, personalMinutes } from '../lib/week-calibration';
import { startReviewSession } from '../lib/start-review';
import { startWeekReview } from '../lib/week-review';
import { hrefFor } from '../lib/router';
import { isImperativeLink, routeForWeekLink, weekLinkLabel } from '../lib/week-destination';
import { startActivityTracking, toggleWeekActivity } from '../lib/skills-storage';
import type { ProgressApi } from '../hooks/useProgress';
import type { EnSkillsState } from '../lib/skills-storage';
import type { Route } from '../lib/router';

export function WeeklyReviewScreen({
  api,
  skills,
  onSkills,
  navigate,
}: {
  api: ProgressApi;
  skills: EnSkillsState;
  onSkills: (fn: (s: EnSkillsState) => EnSkillsState) => void;
  navigate: (route: Route) => void;
}) {
  const completed = skills.weekly.completedActivities ?? [];
  const done = new Set(completed);
  const progress = weekPlanProgress(completed);
  const sessionProgress = new Map(progress.sessions.map((entry) => [entry.id, entry]));
  const [notice, setNotice] = useState<string | null>(null);
  // Başlangıçta ilk tamamlanmamış oturum açık; kullanıcı istediğini açar.
  const [openSessions, setOpen] = useState<Set<string>>(() => {
    const first = progress.sessions.find((entry) => !entry.complete) ?? progress.sessions[0];
    return new Set(first ? [first.id] : []);
  });
  const toggleOpen = (id: string) =>
    setOpen((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const allOpen = openSessions.size === EN_WEEK_1_PLAN.length;

  const toggle = (id: string) => {
    onSkills((s) => ({
      ...s,
      weekly: {
        ...s.weekly,
        completedActivities: toggleWeekActivity(s.weekly.completedActivities ?? [], id),
        updatedAt: new Date().toISOString(),
      },
    }));
  };

  const factors = familyFactors(skills);
  const measuredSeconds = Object.values(skills.weekly.timing).reduce((total, entry) => total + entry.activeSeconds, 0);

  /** `trackId` verilirse o aktivitenin gerçek süresi ölçülmeye başlar. */
  const open = (link: WeekLink, label: string, trackId?: string) => {
    setNotice(null);
    if (trackId) onSkills((s) => startActivityTracking(s, trackId));
    if (link.kind === 'review-mixed') {
      startReviewSession(api, navigate, { mode: 'mixed' });
      return;
    }
    if (link.kind === 'review-set') {
      if (!startWeekReview(api, navigate, link.setId)) setNotice(`“${label}” için soru havuzu hazırlanamadı.`);
      return;
    }
    const route = routeForWeekLink(link);
    if (route) navigate(route);
  };

  const go = (activityId: string) => {
    const activity = EN_WEEK_1_PLAN.flatMap((s) => s.activities).find((a) => a.id === activityId);
    if (activity) open(activity.link, activity.label, activity.id);
  };

  return (
    <main className="mx-auto w-full max-w-[980px] px-5 pb-24 pt-6 sm:pt-10">
      <button type="button" className="btn btn-quiet px-0" onClick={() => navigate({ name: 'home' })}>← Dersler</button>
      <header className="mt-4 anim-pop">
        <p className="eyebrow">1. hafta · {formatMinutes(EN_WEEK_1_MINUTES)} – {formatMinutes(EN_WEEK_1_MINUTES_TYPICAL)} · önerilen sıra A → G</p>
        <h1 className="mt-1 text-[2.5rem] sm:text-5xl">Haftalık Plan</h1>
        <p className="mt-3 text-lg text-ink-soft">
          {progress.done} / {progress.total} tamamlandı · %{progress.percent}
        </p>
        <p className="mt-1 text-[0.95rem] text-ink-soft">
          Sırayla çalış: öğren → tanı → kontrollü pratik → üret → beceriye uygula → tekrar et. Kutu “tamamladım”, <strong>Git</strong> seni tam o alıştırmaya götürür.
        </p>
        <p className="mt-1 text-sm text-ink-faint" data-estimate-note="true">
          Süreler içerikten hesaplanan tahminlerdir: hızlı – tipik tempo. Erken bitirirsen beklemen gerekmez.
          {measuredSeconds >= 60 && <> Bu hafta ölçülen aktif çalışman: <strong>{formatMinutes(Math.round(measuredSeconds / 60))}</strong>.</>}
        </p>
      </header>

      <div className="rail mt-4 h-2.5" role="progressbar" aria-label="Haftalık ilerleme"
        aria-valuemin={0} aria-valuemax={progress.total} aria-valuenow={progress.done}>
        <div className="rail-fill" style={{ width: `${Math.max(2, progress.percent)}%` }} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="btn btn-quiet"
          onClick={() => setOpen(allOpen ? new Set() : new Set(EN_WEEK_1_PLAN.map((s) => s.id)))}
        >
          {allOpen ? 'Hepsini kapat' : 'Hepsini aç'}
        </button>
        {notice && <span className="text-sm" role="alert" style={{ color: 'var(--color-bad)' }}>{notice}</span>}
      </div>

      <section className="mt-4 grid gap-4">
        {EN_WEEK_1_PLAN.map((s) => {
          const entry = sessionProgress.get(s.id)!;
          const isOpen = openSessions.has(s.id);
          const panelId = `${s.id}-activities`;
          return (
          <article key={s.id} className="card p-5" data-session={s.code}>
            <button
              type="button"
              className="flex w-full items-start justify-between gap-3 text-left"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => toggleOpen(s.id)}
            >
              <span className="block min-w-0">
                <span className="eyebrow block">{s.code} · {s.hours} · {entry.total} aktivite</span>
                <span className="block text-xl font-bold">{s.title}</span>
                <span className="mt-0.5 block text-[0.95rem] text-ink-soft">{s.goal}</span>
              </span>
              <span className="flex flex-none flex-col items-end gap-1">
                <span className="badge numeral" aria-label={`${s.title}: ${entry.done} / ${entry.total} tamamlandı`}>
                  {entry.done} / {entry.total}
                </span>
                {entry.complete && (
                  <span className="badge" style={{ background: 'var(--color-good-soft)', color: 'var(--color-good-deep)' }}>Tamamlandı</span>
                )}
                <span aria-hidden="true" className="text-ink-faint">{isOpen ? '▾' : '▸'}</span>
              </span>
            </button>
            <div className="rail mt-3 h-1.5" aria-hidden="true">
              <div className="rail-fill" style={{ width: `${Math.round((entry.done / entry.total) * 100)}%`, background: entry.complete ? 'var(--color-good)' : undefined }} />
            </div>
            <ol id={panelId} hidden={!isOpen} className="mt-3 flex flex-col gap-3">
              {s.activities.map((a, index) => {
                const checked = done.has(a.id);
                const route = isImperativeLink(a.link) ? null : routeForWeekLink(a.link);
                const actual = skills.weekly.timing[a.id]?.activeSeconds ?? 0;
                const personal = actual >= 60 ? null : personalMinutes(a, factors);
                const extension = finishedEarly(a, skills) ? extensionFor(a) : null;
                return (
                <li
                  key={a.id}
                  className="flex items-start justify-between gap-3 text-[0.95rem]"
                  style={checked ? { opacity: 0.72 } : undefined}
                >
                  <span className="flex min-w-0 items-start gap-2.5">
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={checked}
                      aria-label={`${a.label}: ${a.detail} — ${checked ? 'tamamlandı, geri al' : 'tamamlandı olarak işaretle'}`}
                      className="badge flex-none"
                      style={checked ? { background: 'var(--color-good)', color: 'white' } : undefined}
                      onClick={() => toggle(a.id)}
                    >
                      {checked ? '✓' : '○'}
                    </button>
                    <span className="min-w-0">
                      <strong style={checked ? { fontWeight: 600 } : undefined}>{index + 1}. {a.label}:</strong>{' '}
                      {a.tier === 'extra' && <span className="badge mr-1" title="Ek pratik: toplam süreye ve ilerlemeye dahil değil">Ek</span>}
                      <span style={checked ? { textDecoration: 'line-through', textDecorationThickness: '1px' } : undefined}>
                        {a.detail}
                      </span>
                      <span className="block text-xs text-ink-faint" data-destination="true">{weekLinkLabel(a.link)}</span>
                      {extension && (
                        <button type="button" className="btn btn-quiet mt-1 px-0 text-sm" aria-label={`${a.label}: daha fazla pratik`}
                          onClick={() => open(extension.link, extension.label)}>
                          Hızlı bitirdin · Daha fazla pratik: {extension.label} →
                        </button>
                      )}
                    </span>
                  </span>
                  <span className="flex flex-none items-center gap-2">
                    <span className="text-right text-sm text-ink-soft">
                      <span className="numeral block" aria-label={`Tahmini süre: ${a.duration}`} title={a.workload.components.map((c) => `${c.label}: ${c.units} ${c.unit}`).join('\n')}>
                        {a.duration}
                      </span>
                      {actual >= 60 && (
                        <span className="numeral block text-xs text-ink-faint" data-actual="true">sen: {formatMinutes(Math.round(actual / 60))}</span>
                      )}
                      {personal !== null && (
                        <span className="numeral block text-xs text-ink-faint" data-personal="true">sana göre ~{personal} dk</span>
                      )}
                    </span>
                    <a
                      className="btn btn-quiet"
                      href={route ? hrefFor(route) : '#/haftalik'}
                      aria-label={`${a.label}: Git`}
                      onClick={(event) => {
                        event.preventDefault();
                        go(a.id);
                      }}
                    >
                      Git →
                    </a>
                  </span>
                </li>
                );
              })}
            </ol>
          </article>
          );
        })}
      </section>

      <section className="card mt-8 p-5">
        <p className="eyebrow">Plan dışı</p>
        <h2 className="mt-1 text-xl font-bold">Serbest Pratik</h2>
        <p className="text-[0.95rem] text-ink-soft">
          Plandaki aktiviteler tam hedefe gider. Planın dışında dilediğin beceriyi genel sayfalardan da açabilirsin.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className="btn" onClick={() => startReviewSession(api, navigate, { mode: 'mixed' })}>Karışık Genel Tekrar →</button>
          <button type="button" className="btn" onClick={() => navigate({ name: 'reading' })}>Okuma →</button>
          <button type="button" className="btn" onClick={() => navigate({ name: 'listening' })}>Dinleme →</button>
          <button type="button" className="btn" onClick={() => navigate({ name: 'writing' })}>Yazma →</button>
          <button type="button" className="btn" onClick={() => navigate({ name: 'speaking' })}>Konuşma →</button>
        </div>
      </section>
    </main>
  );
}

/**
 * Writing: kısa yazma / grammar writing / guided / IELTS intro + geçmiş.
 * Draft → feedback (kural tabanlı, 3–5 öncelik) → rewrite → karşılaştır.
 */

import { useMemo, useState } from 'react';
import { EN_WRITING_BY_ID, EN_WRITING_TASKS, analyzeWriting, countWords, week1GrammarUse } from '../content/en/skills-writing';
import type { EnSkillsState } from '../lib/skills-storage';
import type { Route } from '../lib/router';

export function WritingHomeScreen({
  skills,
  onRecord,
  navigate,
  initialTaskId,
  initialStage,
}: {
  skills: EnSkillsState;
  onRecord: (fn: (s: EnSkillsState) => EnSkillsState) => void;
  navigate: (route: Route) => void;
  /** Derin baglanti: bu gorevle acilir (gecersizse ilk gorev). */
  initialTaskId?: string;
  /** `rewrite`: kayıtlı taslağı ve geri bildirimi yükleyip yeniden yazmaya odaklan. */
  initialStage?: 'rewrite';
}) {
  const firstTaskId = initialTaskId && EN_WRITING_BY_ID.has(initialTaskId) ? initialTaskId : EN_WRITING_TASKS[0].id;
  /** Bir görevin en son kayıtlı denemesi (taslak + geri bildirim + yeniden yazma). */
  const latestEntry = (id: string) => [...skills.writing].reverse().find((entry) => entry.taskId === id);
  const resumed = latestEntry(firstTaskId);
  const [taskId, setTaskId] = useState(firstTaskId);
  const [draft, setDraft] = useState(resumed?.draft1 ?? '');
  const [feedback, setFeedback] = useState<ReturnType<typeof analyzeWriting> | null>(
    resumed && (initialStage === 'rewrite' || resumed.rewrite)
      ? analyzeWriting(resumed.draft1, EN_WRITING_BY_ID.get(firstTaskId)!)
      : null,
  );
  const [rewrite, setRewrite] = useState(resumed?.rewrite ?? '');
  const [plan, setPlan] = useState(resumed?.plan ?? '');
  const [checks, setChecks] = useState<string[]>(resumed?.checks ?? []);
  const [savedId, setSavedId] = useState<string | null>(resumed?.id ?? null);
  const task = EN_WRITING_BY_ID.get(taskId)!;
  const isTest = task.kind === 'weekly-test';
  const missingDraft = initialStage === 'rewrite' && !resumed;
  const words = useMemo(() => countWords(draft), [draft]);
  const words2 = useMemo(() => countWords(rewrite), [rewrite]);

  const getFeedback = () => {
    setFeedback(analyzeWriting(draft, task));
    window.scrollTo({ top: document.body.scrollHeight });
  };

  /** Taslak (ve varsa yeniden yazma) aynı kayıt üzerinde güncellenir: Git → devam eder. */
  const save = () => {
    const id = savedId ?? `wr-${Date.now()}`;
    const now = new Date().toISOString();
    onRecord((s) => {
      const existing = s.writing.find((entry) => entry.id === id);
      const entry = {
        id, taskId: task.id, draft1: draft,
        feedback: feedback ?? [], rewrite: rewrite || undefined,
        plan: plan || undefined, checks: checks.length ? checks : undefined,
        words1: words, words2: rewrite ? words2 : undefined,
        at: existing?.at ?? now, updatedAt: now,
      };
      return { ...s, writing: existing ? s.writing.map((e) => (e.id === id ? entry : e)) : [...s.writing, entry] };
    });
    setSavedId(id);
  };

  const selectTask = (id: string) => {
    const entry = latestEntry(id);
    setTaskId(id);
    setDraft(entry?.draft1 ?? '');
    setFeedback(entry && entry.rewrite ? analyzeWriting(entry.draft1, EN_WRITING_BY_ID.get(id)!) : null);
    setRewrite(entry?.rewrite ?? '');
    setPlan(entry?.plan ?? '');
    setChecks(entry?.checks ?? []);
    setSavedId(entry?.id ?? null);
  };

  /** Alan odaktan çıkınca sessizce kaydet: yenilemede iş kaybolmaz. */
  const autosave = () => {
    if (words >= 10 || plan.trim()) save();
  };

  return (
    <main className="mx-auto w-full max-w-[980px] px-5 pb-24 pt-6 sm:pt-10">
      <button type="button" className="btn btn-quiet px-0" onClick={() => navigate({ name: 'home' })}>← Dersler</button>
      <header className="mt-4 anim-pop">
        <p className="eyebrow">İngilizce · temiz B1 üretimi</p>
        <h1 className="mt-1 text-[2.5rem] sm:text-5xl">Writing</h1>
        <p className="mt-3 text-lg text-ink-soft">{EN_WRITING_TASKS.length} görev · taslak → geri bildirim → yeniden yazma</p>
      </header>

      <div className="mt-6 grid gap-4 lg:grid-cols-[280px_1fr]">
        <aside className="flex flex-col gap-2">
          {EN_WRITING_TASKS.map((t) => (
            <button
              key={t.id}
              type="button"
              className="card p-3 text-left"
              aria-pressed={taskId === t.id}
              style={taskId === t.id ? { borderColor: 'var(--color-brand)', boxShadow: '0 5px 0 0 var(--color-brand)' } : undefined}
              onClick={() => selectTask(t.id)}
            >
              <p className="font-bold">{t.title}</p>
              <p className="text-xs text-ink-soft">{t.kind} · {t.minWords}–{t.maxWords} kelime</p>
            </button>
          ))}
        </aside>

        <section className="card p-5">
          <p className="eyebrow">{task.kind} · {task.level}</p>
          <h2 className="mt-1 text-2xl font-bold">{task.title}</h2>
          <p className="mt-2">{task.prompt}</p>
          <p className="text-sm text-ink-soft">{task.promptTr}</p>
          {isTest ? (
            <p className="mt-2 rounded-lg p-2 text-sm" style={{ background: 'var(--color-sunk)' }} role="note">
              Test modu: gramer ipucu yok. Hafta 1’de öğrendiklerini doğal biçimde kullan; geri bildirimde hangi yapıları kullandığın gösterilir.
            </p>
          ) : (
            <ul className="mt-2 flex flex-wrap gap-2">
              {task.requirements.map((r) => <li key={r} className="badge" style={{ background: 'var(--color-sunk)' }}>{r}</li>)}
            </ul>
          )}
          {task.outline && (
            <ol className="mt-3 grid gap-1 rounded-lg p-3 text-[0.95rem]" style={{ background: 'var(--color-sunk)' }} aria-label="Yazma iskeleti">
              {task.outline.map((part, i) => <li key={part}><span className="badge numeral mr-2">{i + 1}</span>{part}</li>)}
            </ol>
          )}
          {missingDraft && (
            <p className="card mt-3 p-3 text-sm" role="status">
              Bu görev için kayıtlı taslak yok. Önce taslağı yaz ve “Taslağı Kaydet”e bas; sonra buradan yeniden yazmaya devam edebilirsin.
            </p>
          )}

          <h3 className="eyebrow mt-5 mb-2">1 · Plan (3–5 dk)</h3>
          <p className="text-sm text-ink-soft">Yazmadan önce: her bölüm için 2–3 anahtar kelime ve kullanacağın 2 yapı/öbek. Tam cümle yazma.</p>
          <textarea
            className="mt-2 w-full rounded-lg border border-line bg-paper px-3 py-2"
            rows={3}
            value={plan}
            aria-label={`${task.title} planı`}
            placeholder="Fikirler · sıra · kullanacağım yapılar…"
            onChange={(e) => setPlan(e.target.value)}
            onBlur={autosave}
          />

          <h3 className="eyebrow mt-5 mb-2">2 · Taslak 1 ({words} kelime)</h3>
          <textarea
            className="w-full rounded-lg border border-line bg-paper px-3 py-2"
            rows={8}
            value={draft}
            aria-label={`${task.title} taslağı`}
            placeholder="İngilizce yaz… (80–150 kelime)"
            onChange={(e) => setDraft(e.target.value)}
            onBlur={autosave}
          />
          {words >= 10 && (
            <fieldset className="mt-3 rounded-lg p-3 text-[0.95rem]" style={{ background: 'var(--color-sunk)' }}>
              <legend className="eyebrow px-1">3 · Öz denetim — geri bildirimden ÖNCE kendin kontrol et</legend>
              {task.checklist.map((item) => (
                <label key={item} className="mt-1 flex items-start gap-2">
                  <input type="checkbox" className="mt-1" checked={checks.includes(item)}
                    onChange={() => setChecks((c) => (c.includes(item) ? c.filter((x) => x !== item) : [...c, item]))} />
                  <span>{item}</span>
                </label>
              ))}
            </fieldset>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className="btn btn-primary" disabled={words < 10} onClick={getFeedback}>
              Geri Bildirim Al
            </button>
            <button type="button" className="btn" disabled={words < 10} onClick={save}>
              {savedId ? '✓ Taslağı Kaydet (güncelle)' : 'Taslağı Kaydet'}
            </button>
          </div>

          {feedback && (
            <div className="mt-5">
              <h3 className="eyebrow mb-2">4 · Geri bildirim ({feedback.length || 'temiz'} öncelik)</h3>
              {feedback.length === 0 ? (
                <p className="card p-3" style={{ background: 'var(--color-good-soft)' }}>✓ Bilinen hata kalıbı bulunamadı. Cümlelerini yüksek sesle oku ve yeniden yaz.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {feedback.map((f, i) => (
                    <li key={i} className="card p-3">
                      <p className="font-bold">[{f.category}] {f.message}</p>
                      {f.suggestion && <p className="text-sm text-ink-soft">→ {f.suggestion}</p>}
                    </li>
                  ))}
                </ul>
              )}
              {isTest && (
                <ul className="mt-3 grid gap-1 text-[0.95rem]" aria-label="Hafta 1 yapıları">
                  {week1GrammarUse(draft).map((g) => (
                    <li key={g.label}>{g.used ? '✓' : '○'} {g.label}</li>
                  ))}
                </ul>
              )}
              <h3 className="eyebrow mt-5 mb-2">5 · Yeniden yazma ({words2} kelime)</h3>
              <p className="text-sm text-ink-soft">Kopyala-yapıştır yapma: taslağına bakarak baştan yaz; geri bildirimdeki ve öz denetimde bulduğun her noktayı düzelt, en az iki cümleyi bağlaçla birleştir.</p>
              <textarea
                className="w-full rounded-lg border border-line bg-paper px-3 py-2"
                rows={8}
                value={rewrite}
                aria-label="Yeniden yazma"
                placeholder="Geri bildirime göre yeniden yaz…"
                onChange={(e) => setRewrite(e.target.value)}
                onBlur={autosave}
              />
              <div className="mt-3 flex gap-2">
                <button type="button" className="btn" disabled={!rewrite.trim()} onClick={save}>
                  {savedId ? '✓ Taslak + yeniden yazma kaydedildi (güncelle)' : 'Kaydet (geçmişe ekle)'}
                </button>
              </div>
              {rewrite && (
                <p className="mt-2 text-sm text-ink-soft">
                  Gelişim: {words} → {words2} kelime · geri bildirim {feedback.length} öncelik kapandı mı diye karşılaştır.
                </p>
              )}
              {rewrite.trim() && (
                <div className="mt-4" data-compare="true">
                  <h3 className="eyebrow mb-2">6 · Karşılaştır</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-line p-3">
                      <p className="text-xs font-bold text-ink-faint">Taslak 1 · {words} kelime</p>
                      <p className="mt-1 whitespace-pre-line text-[0.95rem]">{draft}</p>
                    </div>
                    <div className="rounded-lg border border-line p-3">
                      <p className="text-xs font-bold text-ink-faint">Yeniden yazma · {words2} kelime · kalan uyarı: {analyzeWriting(rewrite, task).length}</p>
                      <p className="mt-1 whitespace-pre-line text-[0.95rem]">{rewrite}</p>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-ink-soft">Düzelttiğin 3 şeyi yüksek sesle söyle; aynı hatayı bir sonraki yazıda arayacaksın.</p>
                </div>
              )}
              <details className="mt-3">
                <summary className="cursor-pointer text-sm underline">Örnek cevabı göster</summary>
                <p className="mt-2 whitespace-pre-line text-[0.95rem]">{task.sampleAnswer}</p>
              </details>
            </div>
          )}
        </section>
      </div>

      {skills.writing.length > 0 && (
        <section className="mt-10">
          <h2 className="eyebrow mb-3">Writing geçmişi ({skills.writing.length})</h2>
          <ul className="grid gap-2">
            {[...skills.writing].reverse().slice(0, 8).map((w) => (
              <li key={w.id} className="card px-4 py-3">
                <p className="font-bold">{EN_WRITING_BY_ID.get(w.taskId)?.title ?? w.taskId} · {w.words1}{w.words2 ? ` → ${w.words2}` : ''} kelime</p>
                <p className="text-sm text-ink-soft">{new Date(w.at).toLocaleString('tr')} · {w.feedback.length} geri bildirim{w.rewrite ? ' · yeniden yazıldı' : ''}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}

/**
 * Gerçek dinleme görevi: dış kaynakta (insan sesi) dinle → uygulamada çalış.
 *
 * Akış: hazırlık → 1. dinleme + genel fikir → 2. dinleme + ayrıntı →
 * transkript incelemesi + öbekler → sözlü özet → yazılı özet.
 * Ses/transkript kopyalanmaz ve gömülmez; kaynak yeni sekmede açılır.
 * İlerleme `skills.listeningTasks` içinde saklanır: yenilemede kaybolmaz.
 * Tamamlanma süreye değil yapılan işe bağlıdır; hiçbir adım kilitli değildir.
 */

import { useMemo, useState } from 'react';
import {
  EN_EXTERNAL_LISTENING_BY_ID, estimatedMediaSeconds, type ExternalListeningTask, type ExternalQuestion,
} from '../content/en/skills-listening-external';
import { countWords } from '../content/en/skills-writing';
import { isRecordingSupported, useRecorder } from '../lib/audio/voice';
import { shuffledOptions } from '../lib/presentation';
import { requestAwayAllowance } from '../lib/study-time';
import { addReadingVocab, type EnSkillsState, type ExternalListeningProgress } from '../lib/skills-storage';
import { userVocabId } from '../content/en/user-vocab';
import type { Route } from '../lib/router';

function norm(value: string): string {
  return value.toLowerCase().replace(/[’']/g, "'").replace(/[.!?,;:"()%]/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Kısa cevap: kabul edilen yazımlardan biriyle eşleşir ya da onu içerir. */
export function isExternalAnswerCorrect(question: ExternalQuestion, raw: string): boolean {
  const given = norm(raw);
  if (!given) return false;
  if (question.type !== 'short') return given === norm(question.answer);
  return [question.answer, ...(question.acceptedAnswers ?? [])]
    .map(norm)
    .some((candidate) => given === candidate || (` ${given} `).includes(` ${candidate} `));
}

/** Akışın tamamlanma ölçütü (süre değil, iş). */
export function externalTaskComplete(task: ExternalListeningTask, progress: ExternalListeningProgress | undefined): boolean {
  if (!progress) return false;
  return progress.checked.gist === true && progress.checked.detail === true && progress.transcriptReviewed === true
    && progress.spoken !== undefined && countWords(progress.summary ?? '') >= task.writing.minWords;
}

const mmss = (seconds: number): string => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

export function ListeningTaskScreen({
  taskId,
  skills,
  onRecord,
  navigate,
}: {
  taskId: string;
  skills: EnSkillsState;
  onRecord: (fn: (s: EnSkillsState) => EnSkillsState) => void;
  navigate: (route: Route) => void;
}) {
  const task = EN_EXTERNAL_LISTENING_BY_ID.get(taskId);
  const [mountNonce] = useState(() => Math.floor(Math.random() * 1e9));
  const rec = useRecorder();
  const progress: ExternalListeningProgress = useMemo(
    () => skills.listeningTasks[taskId] ?? { taskId, answers: {}, checked: {}, updatedAt: new Date(0).toISOString() },
    [skills.listeningTasks, taskId],
  );

  if (!task) {
    return (
      <main className="mx-auto w-full max-w-[980px] px-5 pb-24 pt-6 sm:pt-10">
        <p className="card p-5" role="status">Bu dinleme görevi bulunamadı.</p>
        <button type="button" className="btn mt-4" onClick={() => navigate({ name: 'listening' })}>Listening →</button>
      </main>
    );
  }

  const media = estimatedMediaSeconds(task);
  const patch = (change: Partial<ExternalListeningProgress>) =>
    onRecord((state) => {
      const current = state.listeningTasks[task.id] ?? { taskId: task.id, answers: {}, checked: {}, updatedAt: '' };
      const now = new Date().toISOString();
      const next: ExternalListeningProgress = { ...current, ...change, updatedAt: now };
      if (!next.completedAt && externalTaskComplete(task, next)) next.completedAt = now;
      return { ...state, listeningTasks: { ...state.listeningTasks, [task.id]: next } };
    });
  const setAnswer = (questionId: string, value: string) => patch({ answers: { ...progress.answers, [questionId]: value } });

  const savedChunkIds = new Set(skills.readingVocab.map((entry) => entry.id));
  const summaryWords = countWords(progress.summary ?? '');
  const complete = externalTaskComplete(task, progress);

  const openSource = () => {
    // Kaynak başka sekmede çalar: en fazla ~3 dinleme kadar "uzakta çalışma" sayılır.
    requestAwayAllowance((media * 3 + 60) * 1000);
  };

  const sourceLink = (label: string) => (
    <a className="btn btn-primary" href={task.url} target="_blank" rel="noopener noreferrer" onClick={openSource}>
      {label} ↗
    </a>
  );

  const stage = (questions: ExternalQuestion[], key: 'gist' | 'detail') => {
    const checked = progress.checked[key] === true;
    const answered = questions.filter((q) => (progress.answers[q.id] ?? '').trim()).length;
    const correct = questions.filter((q) => isExternalAnswerCorrect(q, progress.answers[q.id] ?? '')).length;
    return (
      <>
        <ol className="mt-3 flex flex-col gap-4">
          {questions.map((question, index) => {
            const given = progress.answers[question.id] ?? '';
            const ok = isExternalAnswerCorrect(question, given);
            return (
              <li key={question.id}>
                <p className="font-bold">{index + 1}. {question.prompt}</p>
                {question.options ? (
                  <div className="mt-1 flex flex-col gap-1.5">
                    {(question.type === 'tf' ? question.options : shuffledOptions(question.options, `${mountNonce}:${question.id}`)).map((option) => (
                      <label key={option} className="flex items-start gap-2">
                        <input type="radio" name={question.id} className="mt-1" checked={given === option} disabled={checked}
                          onChange={() => setAnswer(question.id, option)} />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <input type="text" className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2" value={given} disabled={checked}
                    aria-label={question.prompt} placeholder="Kısa cevabını yaz…" onChange={(event) => setAnswer(question.id, event.target.value)} />
                )}
                {checked && (
                  <p className="mt-1.5 rounded-lg p-2 text-sm" style={{ background: ok ? 'var(--color-good-soft)' : 'var(--color-bad-soft)' }}>
                    <strong>{ok ? '✓ Doğru' : `✗ Doğru cevap: ${question.answer}`}</strong> — {question.explanation}
                  </p>
                )}
              </li>
            );
          })}
        </ol>
        {!checked ? (
          <button type="button" className="btn mt-4" disabled={answered < questions.length}
            onClick={() => patch({ checked: { ...progress.checked, [key]: true } })}>
            {answered < questions.length ? `Cevapla: ${answered} / ${questions.length}` : 'Cevapları Kontrol Et'}
          </button>
        ) : (
          <p className="mt-3 flex flex-wrap items-center gap-3 text-[0.95rem] font-bold" role="status">
            <span>{correct} / {questions.length} doğru</span>
            <button type="button" className="btn btn-quiet"
              onClick={() => patch({
                checked: { ...progress.checked, [key]: false },
                answers: Object.fromEntries(Object.entries(progress.answers).filter(([id]) => !questions.some((q) => q.id === id))),
              })}>
              ↺ Bu bölümü yeniden çöz
            </button>
          </p>
        )}
      </>
    );
  };

  return (
    <main className="mx-auto w-full max-w-[980px] px-5 pb-24 pt-6 sm:pt-10">
      <button type="button" className="btn btn-quiet px-0" onClick={() => navigate({ name: 'weekly' })}>← Haftalık Plan</button>
      <header className="mt-4 anim-pop">
        <p className="eyebrow">Gerçek dinleme · {task.provider} · {task.level}</p>
        <h1 className="mt-1 text-[2rem] sm:text-4xl">{task.title}</h1>
        <p className="mt-3 text-lg text-ink-soft">{task.about}</p>
        <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-[0.95rem]">
          <div><dt className="inline text-ink-faint">Kaynak: </dt><dd className="inline font-bold">{task.provider}</dd></div>
          <div><dt className="inline text-ink-faint">Seviye: </dt><dd className="inline font-bold">{task.level}</dd></div>
          <div>
            <dt className="inline text-ink-faint">Ses: </dt>
            <dd className="inline font-bold">
              {task.mediaSeconds !== null ? mmss(task.mediaSeconds) : `≈ ${mmss(media)} (tahmini; sayfa süre belirtmiyor · ~${task.transcriptWords} kelime)`}
            </dd>
          </div>
        </dl>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {sourceLink('Kaynağı aç (yeni sekme)')}
          <span className="text-sm text-ink-soft">Dinle, sonra bu sekmeye dön. Transkripti 3. adıma kadar AÇMA.</span>
        </div>
        {complete && (
          <p className="mt-3 badge" style={{ background: 'var(--color-good-soft)', color: 'var(--color-good-deep)' }} role="status">
            ✓ Akış tamamlandı — Haftalık Plan’da kutuyu işaretleyebilirsin.
          </p>
        )}
      </header>

      <section className="card mt-6 p-5" aria-labelledby="lx-prep">
        <p className="eyebrow">1 · Dinlemeden önce</p>
        <h2 id="lx-prep" className="mt-1 text-xl font-bold">Hazırlık</h2>
        <ul className="mt-2 flex list-disc flex-col gap-1 pl-5">
          {task.prep.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>

      <section className="card mt-4 p-5" aria-labelledby="lx-gist">
        <p className="eyebrow">2 · 1. dinleme — durdurmadan</p>
        <h2 id="lx-gist" className="mt-1 text-xl font-bold">Genel fikir</h2>
        <p className="text-[0.95rem] text-ink-soft">Kaydı baştan sona bir kez dinle; her kelimeyi anlamaya çalışma. Sonra cevapla.</p>
        {stage(task.gist, 'gist')}
      </section>

      <section className="card mt-4 p-5" aria-labelledby="lx-detail">
        <p className="eyebrow">3 · 2. dinleme — not alarak</p>
        <h2 id="lx-detail" className="mt-1 text-xl font-bold">Ayrıntı</h2>
        <p className="text-[0.95rem] text-ink-soft">Önce soruları oku, sonra tekrar dinle. İsim, sayı ve nedenleri not al; gerekirse durdur.</p>
        {stage(task.detail, 'detail')}
      </section>

      <section className="card mt-4 p-5" aria-labelledby="lx-review">
        <p className="eyebrow">4 · Transkriptle 3. dinleme</p>
        <h2 id="lx-review" className="mt-1 text-xl font-bold">Kaçırdıklarını bul</h2>
        <ol className="mt-2 flex list-decimal flex-col gap-1 pl-5 text-[0.95rem]">
          <li>Kaynak sayfada <strong>Transcript</strong> bölümünü aç ve okuyarak bir kez daha dinle.</li>
          <li>Yanlış yaptığın her soru için cevabın geçtiği cümleyi bul: kelimeyi mi bilmiyordun, yoksa hızdan mı kaçtı?</li>
          <li>İşine yarayacak öbekleri aşağıdan seç; transkriptte gördüğün başka öbekleri de defterine yaz.</li>
        </ol>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {sourceLink('Transkripti kaynakta aç')}
          <label className="flex items-center gap-2 font-bold">
            <input type="checkbox" checked={progress.transcriptReviewed === true}
              onChange={(event) => patch({ transcriptReviewed: event.target.checked })} />
            Transkriptle dinledim, yanlışlarımın yerini buldum
          </label>
        </div>
        <h3 className="eyebrow mt-5 mb-2">Bu konuyu anlatırken işe yarayan öbekler</h3>
        <ul className="grid gap-2 sm:grid-cols-2">
          {task.chunks.map((chunk) => {
            const saved = savedChunkIds.has(userVocabId(chunk.en));
            return (
              <li key={chunk.en} className="flex items-center justify-between gap-2 rounded-lg border border-line p-2.5">
                <span className="min-w-0"><strong>{chunk.en}</strong><span className="block text-sm text-ink-soft">{chunk.tr}</span></span>
                <button type="button" className="btn btn-quiet flex-none" disabled={saved} aria-label={`${chunk.en}: öğrenilecek kelimelere ekle`}
                  onClick={() => onRecord((state) => addReadingVocab(state, chunk, task.id))}>
                  {saved ? '✓ Eklendi' : '+ Ekle'}
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="card mt-4 p-5" aria-labelledby="lx-speak">
        <p className="eyebrow">5 · Konuş — yaklaşık {task.speaking.seconds} saniye</p>
        <h2 id="lx-speak" className="mt-1 text-xl font-bold">Sözlü özet</h2>
        <p className="mt-1 text-lg">{task.speaking.prompt}</p>
        <p className="text-sm text-ink-soft">{task.speaking.promptTr}</p>
        <ul className="mt-2 flex list-disc flex-col gap-0.5 pl-5 text-[0.95rem]">
          {task.speaking.points.map((point) => <li key={point}>{point}</li>)}
        </ul>
        <p className="mt-2 text-sm text-ink-soft">Önce 1 dakika anahtar kelime notu al (cümle yazma). Sonra kaydet, kaydını dinle ve noktaların hepsine değindin mi kontrol et.</p>
        {isRecordingSupported() ? (
          <div className="mt-3">
            {rec.state === 'recording' ? (
              <button type="button" className="btn w-full" aria-label="Kaydı durdur" onClick={rec.stop}>⏹ Durdur</button>
            ) : (
              <button type="button" className="btn w-full" aria-label="Kayda başla" disabled={rec.state === 'requesting'} onClick={() => void rec.start()}>
                🎙 {rec.state === 'requesting' ? 'İzin bekleniyor…' : rec.recording ? 'Yeniden Kaydet' : 'Kayda Başla'}
              </button>
            )}
            {rec.error && <p className="mt-2 text-sm" role="alert">{rec.error}</p>}
            {rec.recording && <audio controls src={rec.recording.url} className="mt-2 w-full" aria-label="Kaydını dinle" />}
          </div>
        ) : (
          <p className="mt-3 text-sm text-ink-soft" role="status">Bu tarayıcı mikrofon kaydını desteklemiyor: yüksek sesle söyle ve kendini değerlendir.</p>
        )}
        <p className="mt-3 text-sm font-bold">Özetin nasıldı?</p>
        <div className="mt-1 flex flex-wrap gap-2">
          <button type="button" className="btn" aria-pressed={progress.spoken === 'good'}
            style={progress.spoken === 'good' ? { background: 'var(--color-good-soft)' } : undefined} onClick={() => patch({ spoken: 'good' })}>
            ✓ Tüm noktalara değindim
          </button>
          <button type="button" className="btn" aria-pressed={progress.spoken === 'needs-work'}
            style={progress.spoken === 'needs-work' ? { background: 'var(--color-bad-soft)' } : undefined} onClick={() => patch({ spoken: 'needs-work' })}>
            ↻ Eksik kaldı — bir kez daha kaydedeceğim
          </button>
        </div>
      </section>

      <section className="card mt-4 p-5" aria-labelledby="lx-write">
        <p className="eyebrow">6 · Yaz — {task.writing.minWords}–{task.writing.maxWords} kelime</p>
        <h2 id="lx-write" className="mt-1 text-xl font-bold">Yazılı özet / görüş</h2>
        <p className="mt-1 text-lg">{task.writing.prompt}</p>
        <p className="text-sm text-ink-soft">{task.writing.promptTr}</p>
        <textarea className="mt-3 w-full rounded-lg border border-line bg-paper px-3 py-2" rows={6} value={progress.summary ?? ''}
          aria-label={`${task.title}: yazılı özet`} placeholder="İngilizce yaz… (otomatik kaydedilir)"
          onChange={(event) => patch({ summary: event.target.value })} />
        <p className="mt-1 text-sm text-ink-soft" role="status">
          {summaryWords} kelime · hedef {task.writing.minWords}–{task.writing.maxWords}
          {summaryWords >= task.writing.minWords ? ' ✓' : ''}
        </p>
      </section>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button type="button" className="btn btn-primary" onClick={() => navigate({ name: 'weekly' })}>Haftalık Plan’a dön →</button>
        <span className="text-sm text-ink-soft">
          Kaynak: <a className="underline" href={task.url} target="_blank" rel="noopener noreferrer" onClick={openSource}>{task.provider} — {task.title}</a> · ses ve transkriptin hakları kaynağa aittir; sorular bu uygulamaya özgüdür.
        </span>
      </div>
    </main>
  );
}

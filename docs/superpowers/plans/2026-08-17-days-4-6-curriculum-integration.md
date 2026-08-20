# Days 4–6 Curriculum Integration Implementation Plan

> **For agentic workers:** Execute inline with a red-green test cycle per task; this workspace is not a git checkout, so no commit step is available.

**Goal:** Integrate Day 4, Day 5 and Day 6 as source-traceable, A1-safe first-class content without changing the existing Day 1–3 curriculum.

**Architecture:** Keep the existing generic pipeline: the two Obsidian Markdown documents supply human study material, while `src/content/authored/` supplies semantic concepts, curated interactive variants and source provenance. The existing parser, coverage validation, session builder, TTS targets and screen components discover the new days from generated content rather than day-specific UI branches.

**Tech Stack:** Obsidian Markdown, TypeScript, React 19, Vitest, Vite, local Piper TTS.

## Global Constraints

- Preserve the original Day 1–3 text byte-for-byte in both vault documents.
- Use only content supported by Day 4–6 plan videos; record unavailable subtitles explicitly.
- Every new exercise has semantic ID, day, topic, concept, difficulty, skill and family metadata.
- Every new concept has source-summary coverage and only same-or-earlier-day prerequisites.
- Piper targets must have explicit `de-DE`; never mark Turkish text or hidden Turkish-to-German answers as a prompt target.
- No day-number UI branch: existing `days`, summaries and session APIs remain the source of UI discovery.

---

### Task 1: Add red content-integrity tests

**Files:**
- Modify: `src/content/authored/authored.test.ts`
- Modify: `src/content/parser/summary.test.ts`

**Produces:** Assertions for all six days, Day 4–6 pools, provenance records, prerequisite validity, translations, listening, per-day difficulty mix and nonempty challenge pools.

- [ ] Write tests that require `[1, 2, 3, 4, 5, 6]`, 40+ new exercises per day, both word-bank directions, at least two listening exercises, and source inventory coverage.
- [ ] Run `npm test -- --run`; expect Day 4–6 assertions to fail against the three-day generated bundle.

### Task 2: Append idempotent human curriculum material

**Files:**
- Modify: `/Users/mustafa/Library/Mobile Documents/iCloud~md~obsidian/Documents/almanca/İlk 3 Hafta/İlk 3 Hafta Özet.md`
- Modify: `/Users/mustafa/Library/Mobile Documents/iCloud~md~obsidian/Documents/almanca/İlk 3 Hafta/İlk 3 Hafta Alıştırma.md`

**Produces:** One Day 4–6 summary and representative exercise section per day, inserted before the existing answer-key section and with their own answer details blocks.

- [ ] Create a reversible copy outside the vault and hash the Day 1–3 prefixes.
- [ ] Append the three summaries and three manual practice sets, preserving the established headings, recall/answer pattern and full per-day video attribution.
- [ ] Confirm each document contains exactly one heading for Days 1–6 and that its original Day 1–3 prefix hash is unchanged.

### Task 3: Add provenance, concepts, tagging and authored pools

**Files:**
- Create: `src/content/authored/sources.ts`
- Create: `src/content/authored/exercises/day4.ts`
- Create: `src/content/authored/exercises/day5.ts`
- Create: `src/content/authored/exercises/day6.ts`
- Modify: `src/content/authored/concepts.ts`
- Modify: `src/content/authored/index.ts`
- Modify: `src/content/authored/vault-tags.ts`
- Modify: `src/content/overrides.ts`

**Produces:** A source inventory for all 15 plan videos; source-to-topic mapping; semantic concepts and balanced 40–55 item application pools per new day.

- [ ] Implement the smallest registry/types needed for auditable records and source-topic mappings.
- [ ] Add Day 4 calendar/date/birthday content, Day 5 article/plural/indefinite content, and Day 6 verbs/countries/languages content with only declared prerequisites.
- [ ] Run `npm run sync`; expect zero coverage, source-mapping, duplicate-ID and unknown-concept errors.

### Task 4: Extend audit and regression tests

**Files:**
- Modify: `src/screens/DebugScreen.tsx`
- Modify: `src/content/authored/authored.test.ts`
- Modify: `src/content/parser/summary.test.ts`
- Modify: `src/lib/session.test.ts`
- Modify: `scripts/audit-sessions.ts`

**Produces:** Per-day development audit evidence for source coverage, content mix and session uniqueness, and regression coverage for parser/UI-generic day discovery.

- [ ] Verify the red assertions from Task 1 become green, then add focused tests for Day 4–6 source coverage and session targets.
- [ ] Run `npm test -- --run`, `npm run sync`, and `npm run audit:sessions`.

### Task 5: End-to-end content and production verification

**Files:**
- Generated: `generated/exercises.json`, `generated/audio/`

- [ ] Generate deduplicated new German audio and run the real Piper integration test when its local voice is available.
- [ ] Run `npm run build`; inspect generated JSON and rendered application flows for Day 4–6 summaries, topic practice, lesson modes, completion next-day transitions and mistake routing.
- [ ] Rehash vault prefixes and report exact pass/fail/skip status with source, exercise and audit counts.

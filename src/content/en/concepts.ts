/**
 * İngilizce kavram kaydı — Almanca `concepts.ts` ile aynı sözleşme.
 *
 * Her alıştırma en az bir kavrama, her kavram bir ÖZET BÖLÜMÜNE ve
 * dolayısıyla kanonik konusuna bağlanır. `anchor`, kavramın
 * öğretildiği özet bölümünün metninde geçmesi GEREKEN kısa dizedir;
 * İngilizce içerik denetimi (`en-content.test.ts`) bunu doğrular.
 */

import type { Concept } from '../types.ts';
import { EN_SECTION_BY_ID } from './topics.ts';

export interface EnConceptSpec {
  id: string;
  sectionId: string;
  label: string;
  /** Özet bölümü metninde geçmesi gereken dize. */
  anchor: string;
  prerequisites?: string[];
}

function build(specs: EnConceptSpec[]): Array<Concept & { anchor: string }> {
  return specs.map((spec) => {
    const section = EN_SECTION_BY_ID.get(spec.sectionId);
    if (!section) throw new Error(`Tanımsız İngilizce özet bölümü: ${spec.sectionId} (${spec.id})`);
    return {
      id: spec.id,
      topicId: section.topicId,
      sectionId: spec.sectionId,
      label: spec.label,
      anchor: spec.anchor,
      ...(spec.prerequisites?.length ? { prerequisites: spec.prerequisites } : {}),
    };
  });
}

export const EN_CONCEPTS: Array<Concept & { anchor: string }> = build([
  { id: 'pp.formula.core', sectionId: 'present-perfect.formula', label: 'Özne + have/has + V3 iskeleti', anchor: 'have/has + V3' },
  { id: 'pp.have-has.table', sectionId: 'present-perfect.have-has', label: 'have/has çekim tablosu', anchor: 'I have', prerequisites: ['pp.formula.core'] },
  { id: 'pp.have-has.contractions', sectionId: 'present-perfect.have-has', label: 'Kısaltmalar (I\'ve, she\'s, hasn\'t)', anchor: 'I\'ve', prerequisites: ['pp.have-has.table'] },
  { id: 'pp.neg.havent', sectionId: 'present-perfect.negatives', label: 'haven\'t / hasn\'t + V3', anchor: 'haven\'t', prerequisites: ['pp.have-has.table'] },
  { id: 'pp.q.have-has', sectionId: 'present-perfect.questions', label: 'Have/Has + özne + V3 sorusu', anchor: 'Have you', prerequisites: ['pp.have-has.table'] },
  { id: 'pp.q.short-answers', sectionId: 'present-perfect.questions', label: 'Yes, I have. / No, she hasn\'t.', anchor: 'Yes, I have', prerequisites: ['pp.q.have-has'] },
  { id: 'pp.v3.irregular-core', sectionId: 'present-perfect.v3', label: 'En önemli düzensiz V3\'ler (seen, been, gone…)', anchor: 'see → seen' },
  { id: 'pp.v3.regular', sectionId: 'present-perfect.v3', label: 'Düzenli V3 (worked, studied, finished)', anchor: 'work → worked', prerequisites: ['pp.v3.irregular-core'] },
  { id: 'pp.v3.v1v2v3', sectionId: 'present-perfect.v3', label: 'V1 → V2 → V3 zinciri (test V3\'tedir)', anchor: 'saw', prerequisites: ['pp.v3.irregular-core'] },
  { id: 'pp.for-since.rule', sectionId: 'present-perfect.for-since', label: 'for = süre, since = başlangıç', anchor: 'for = süre' },
  { id: 'pp.for-since.states', sectionId: 'present-perfect.for-since', label: 'for/since ile tam cümle', anchor: 'for three years', prerequisites: ['pp.for-since.rule', 'pp.formula.core'] },
  { id: 'pp.states.know-live', sectionId: 'present-perfect.states', label: 'know/live/work ile süregelen durum', anchor: 'I have known', prerequisites: ['pp.for-since.states'] },
  { id: 'pp.ever-never.use', sectionId: 'present-perfect.ever-never', label: 'Have you ever…? / I have never…', anchor: 'Have you ever', prerequisites: ['pp.q.have-has'] },
  { id: 'pp.markers.already-yet-just', sectionId: 'present-perfect.markers', label: 'already / yet / just kalıpları', anchor: 'already', prerequisites: ['pp.formula.core'] },
  { id: 'pp.vs-past.time-words', sectionId: 'present-perfect.vs-past', label: 'yesterday/last/in 2023 → Simple Past', anchor: 'yesterday', prerequisites: ['pp.formula.core'] },
  { id: 'pp.vs-past.experience-count', sectionId: 'present-perfect.vs-past', label: 'three times / never → Present Perfect', anchor: 'three times', prerequisites: ['pp.vs-past.time-words', 'pp.ever-never.use'] },
  { id: 'pp.mistakes.v3', sectionId: 'present-perfect.mistakes', label: 'V3 hatası düzeltme (haven\'t see → seen)', anchor: 'haven\'t see', prerequisites: ['pp.v3.irregular-core', 'pp.neg.havent'] },
  { id: 'pp.mistakes.for-since', sectionId: 'present-perfect.mistakes', label: 'for/since hatası düzeltme', anchor: 'since three years', prerequisites: ['pp.for-since.rule'] },
  // Sentence Structure
  { id: 'ss.svo.core', sectionId: 'sentence-structure.svo', label: 'SVO iskeleti (I study English)', anchor: 'I study English' },
  { id: 'ss.svo.time', sectionId: 'sentence-structure.svo', label: 'SVO + zaman (every evening)', anchor: 'every evening', prerequisites: ['ss.svo.core'] },
  { id: 'ss.place-time.order', sectionId: 'sentence-structure.place-time', label: 'yer + zaman sırası (place before time)', anchor: 'place before time', prerequisites: ['ss.svo.core'] },
  { id: 'ss.questions.direct', sectionId: 'sentence-structure.questions', label: 'Doğrudan soru (Where is the bank?)', anchor: 'Where is the bank?' },
  { id: 'ss.questions.indirect', sectionId: 'sentence-structure.questions', label: 'Dolaylı soru (Do you know where…?)', anchor: 'Do you know where', prerequisites: ['ss.questions.direct'] },
  { id: 'ss.expansion.steps', sectionId: 'sentence-structure.expansion', label: 'Cümle genişletme basamakları', anchor: 'because I want', prerequisites: ['ss.svo.core'] },
  { id: 'ss.connectors.basic', sectionId: 'sentence-structure.connectors', label: 'and/but/because/so/however', anchor: 'however', prerequisites: ['ss.svo.core'] },
  { id: 'ss.mistakes.order', sectionId: 'sentence-structure.mistakes', label: 'Sıra hatası düzeltme', anchor: 'where the bank is', prerequisites: ['ss.questions.indirect'] },
  // Past Perfect
  { id: 'ppf.formula.core', sectionId: 'past-perfect.formula', label: 'had + V3 iskeleti', anchor: 'had + V3' },
  { id: 'ppf.timeline.earlier', sectionId: 'past-perfect.timeline', label: 'önce olan olay (The film had started)', anchor: 'The film had started', prerequisites: ['ppf.formula.core'] },
  { id: 'ppf.vs-past.arrived', sectionId: 'past-perfect.vs-past', label: 'We arrived vs had started', anchor: 'We arrived', prerequisites: ['ppf.timeline.earlier'] },
  { id: 'ppf.by-time.before', sectionId: 'past-perfect.by-the-time', label: 'By the time / before / after', anchor: 'By the time', prerequisites: ['ppf.timeline.earlier'] },
  { id: 'ppf.mistakes.has-had', sectionId: 'past-perfect.mistakes', label: 'has started → had started düzeltme', anchor: 'the film has started', prerequisites: ['ppf.formula.core'] },
  // Gerund & Infinitive
  { id: 'gi.gerund.chunks', sectionId: 'gerund-infinitive.gerund', label: 'enjoy/finish/avoid/keep + doing', anchor: 'enjoy doing', prerequisites: [] },
  { id: 'gi.infinitive.chunks', sectionId: 'gerund-infinitive.infinitive', label: 'want/decide/need/plan/hope + to do', anchor: 'decide to do', prerequisites: [] },
  { id: 'gi.look-forward.doing', sectionId: 'gerund-infinitive.look-forward', label: 'look forward to doing', anchor: 'look forward to doing', prerequisites: ['gi.gerund.chunks'] },
  { id: 'gi.production.choice', sectionId: 'gerund-infinitive.production', label: 'kalıp seçimi (doing mi to do mu?)', anchor: 'doing mi to do mu', prerequisites: ['gi.gerund.chunks', 'gi.infinitive.chunks'] },
  { id: 'gi.mistakes.chunks', sectionId: 'gerund-infinitive.mistakes', label: 'enjoy to visit → enjoy visiting', anchor: 'enjoy to visit', prerequisites: ['gi.production.choice'] },
  // Conditionals
  { id: 'cond.zero-first.rule', sectionId: 'conditionals.zero-first', label: 'Zero & First Conditional', anchor: 'If you heat', prerequisites: [] },
  { id: 'cond.second.formula', sectionId: 'conditionals.second', label: 'If + Past, would + V1', anchor: 'If I had more time', prerequisites: ['cond.zero-first.rule'] },
  { id: 'cond.second.hypotheticals', sectionId: 'conditionals.hypotheticals', label: 'kişisel hayaller (If I lived abroad…)', anchor: 'If I lived abroad', prerequisites: ['cond.second.formula'] },
  { id: 'cond.mistakes.would', sectionId: 'conditionals.mistakes', label: 'If I would have → If I had', anchor: 'If I would have', prerequisites: ['cond.second.formula'] },
  // Prepositions & Collocations
  { id: 'pc.chunks-a.core', sectionId: 'prepositions-collocations.chunks-a', label: 'interested in / good at / listen to', anchor: 'interested in', prerequisites: [] },
  { id: 'pc.chunks-b.core', sectionId: 'prepositions-collocations.chunks-b', label: 'wait for / depend on / believe in', anchor: 'depend on', prerequisites: [] },
  { id: 'pc.chunks-c.core', sectionId: 'prepositions-collocations.chunks-c', label: 'pay attention to / afraid of / ready for', anchor: 'pay attention to', prerequisites: [] },
  { id: 'pc.production.choice', sectionId: 'prepositions-collocations.production', label: 'öbek seçimi (in mi for mu?)', anchor: 'in mi for mu', prerequisites: ['pc.chunks-a.core'] },
  { id: 'pc.mistakes.chunks', sectionId: 'prepositions-collocations.mistakes', label: 'interested for → interested in', anchor: 'interested for', prerequisites: ['pc.production.choice'] },
]);

export const EN_CONCEPT_BY_ID = new Map(EN_CONCEPTS.map((concept) => [concept.id, concept]));

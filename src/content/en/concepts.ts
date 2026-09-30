/**
 * İngilizce kavram kaydı — Almanca `concepts.ts` ile aynı sözleşme.
 *
 * Her alıştırma en az bir kavrama, her kavram bir ÖZET BÖLÜMÜNE ve
 * dolayısıyla `en.present-perfect` konusuna bağlanır. `anchor`, kavramın
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
]);

export const EN_CONCEPT_BY_ID = new Map(EN_CONCEPTS.map((concept) => [concept.id, concept]));

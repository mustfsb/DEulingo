/** Özel Ders 7. Gün — içerik, kelime ve bilgi sınırı denetimi (tek seferlik rapor). */
import { readFileSync } from 'node:fs';
import type { ContentBundle } from '../src/content/types.ts';
import { CONCEPTS, SUMMARY_TOPICS } from '../src/content/authored/concepts.ts';

const bundle = JSON.parse(readFileSync('generated/exercises.json', 'utf8')) as ContentBundle;
const d7 = bundle.exercises.filter((e) => e.day === 7 && (e as any).track === 'private');
const summary = bundle.summaries.find((s) => s.day === 7 && (s as any).track === 'private')!;
const concepts = CONCEPTS.filter((c) => c.day === 7 && (c as any).track === 'private');
const topics = SUMMARY_TOPICS.filter((t) => t.day === 7 && t.track === 'private');

const surfaces = (e: (typeof d7)[number]) =>
  [e.answer, e.prompt, e.sampleAnswer, e.instruction, e.hint, e.explanation,
   ...(e.acceptedAnswers ?? []), ...(e.options ?? []),
   ...(e.pairs?.flatMap((p) => [p.left, p.right]) ?? []),
   ...(e.wordBank?.tokens.map((t) => t.text) ?? []),
   ...(e.pronunciation?.map((p) => p.german) ?? []),
   ...(e.requirements ?? [])].filter(Boolean).join(' ');

const all = d7.map(surfaces).join(' \n ');

/* -- 1) Kelime kapsamı ------------------------------------------- */
const VOCAB: Array<[string, string]> = [
  ['ev', 'die Wohnung'], ['ev', 'das Bad'], ['ev', 'das Schlafzimmer'], ['ev', 'der Flur'],
  ['ev', 'die Küche'], ['ev', 'das Wohnzimmer'], ['ev', 'Toilette'],
  ['mobilya', 'die Möbel'], ['mobilya', 'der Schrank'], ['mobilya', 'das Bett'], ['mobilya', 'das Sofa'],
  ['mobilya', 'der Sessel'], ['mobilya', 'der Fernseher'], ['mobilya', 'der Teppich'], ['mobilya', 'das Regal'],
  ['mobilya', 'der Herd'], ['mobilya', 'die Badewanne'], ['mobilya', 'das Waschbecken'], ['mobilya', 'auf dem Sessel'],
  ['sıfat', 'hell'], ['sıfat', 'dunkel'], ['sıfat', 'breit'], ['sıfat', 'schmal'], ['sıfat', 'kühl'], ['sıfat', 'grau'],
  ['zamir', 'der'], ['zamir', 'das'], ['zamir', 'die'],
  ['fiil', 'kennen'], ['fiil', 'kennst'], ['fiil', 'geben'], ['fiil', 'gibst'], ['fiil', 'gibt'],
  ['fiil', 'anrufen'], ['fiil', 'rufe'], ['fiil', 'stellen'], ['fiil', 'gefallen'], ['fiil', 'gefällt'],
  ['fiil', 'brauchen'], ['fiil', 'brauche'], ['fiil', 'kosten'], ['fiil', 'kostet'], ['fiil', 'schmeckt'],
  ['yemek', 'gern'], ['yemek', 'Lieblingsessen'], ['yemek', 'Lieblingsgetränk'], ['yemek', 'Pommes'],
  ['yemek', 'Pizza'], ['yemek', 'Reis'], ['yemek', 'Orangensaft'], ['yemek', 'Apfelsaft'],
  ['yemek', 'Hunger'], ['yemek', 'Durst'],
  ['sıklık', 'immer'], ['sıklık', 'meistens'], ['sıklık', 'oft'], ['sıklık', 'manchmal'], ['sıklık', 'nie'],
  ['sıklık', 'pro Woche'], ['sıklık', 'zweimal'],
  ['alışveriş', 'Einkaufszettel'], ['alışveriş', 'Einkaufswagen'], ['alışveriş', 'Natürlich'], ['alışveriş', 'Sonst noch etwas'],
  ['miktar', 'Flasche'], ['miktar', 'Packung'], ['miktar', 'Dose'], ['miktar', 'Becher'], ['miktar', 'Bund'], ['miktar', 'Portion'],
  ['yiyecek', 'Fleisch'], ['yiyecek', 'Wein'], ['yiyecek', 'Obst'], ['yiyecek', 'Gemüse'], ['yiyecek', 'Zwiebel'],
  ['yiyecek', 'Frühlingszwiebeln'], ['yiyecek', 'Knoblauchzehe'], ['yiyecek', 'Salatgurke'], ['yiyecek', 'saure Gurken'],
  ['yiyecek', 'Essig'], ['yiyecek', 'Öl'], ['yiyecek', 'Pfeffer'], ['yiyecek', 'Hähnchen'], ['yiyecek', 'Gemüsesuppe'],
  ['yiyecek', 'Sahne'], ['yiyecek', 'Tomaten'], ['yiyecek', 'Nüsse'], ['yiyecek', 'Rosinen'],
  ['yiyecek', 'Staubzucker'], ['yiyecek', 'Käse'], ['yiyecek', 'Mehl'],
  ['kelime', 'glücklich'], ['kelime', 'Traum'], ['kelime', 'Gast'], ['kelime', 'Leute'], ['kelime', 'Mensa'],
  ['kelime', 'für'], ['kelime', 'dafür'], ['kelime', 'nur'], ['kelime', 'viele'], ['kelime', 'fertig'],
  ['kelime', 'zusammen'], ['kelime', 'dort'], ['kelime', 'auch'], ['kelime', 'teuer'],
];
const summaryText = summary.topics
  .map((t) => [t.title, ...t.blocks.map((b) => JSON.stringify(b)), ...t.examples.map((e) => `${e.german} ${e.turkish ?? ''}`), ...t.warnings, ...t.keyPoints].join(' '))
  .join('\n');

const missingInExercises = VOCAB.filter(([, w]) => !all.includes(w));
const missingInSummary = VOCAB.filter(([, w]) => !summaryText.includes(w));

/* -- 2) Bilgi sınırı --------------------------------------------- */
const FORBIDDEN = /\b(größer|kleiner|heller|dunkler|schöner|billiger|am besten|weil|dass|obwohl|deshalb|trotzdem|würde|hätte|wäre|könnte|müsste|gewesen|gemacht|hat\s+\w+t\b|welcher\s|dessen|deren)\b/i;
const violations = d7.filter((e) => FORBIDDEN.test(surfaces(e)));
const summaryViolations = summary.topics.filter((t) =>
  FORBIDDEN.test([...t.blocks.map((b) => JSON.stringify(b)), ...t.warnings].join(' ')),
);

/* -- 3) Ev hikâyesi kapsamı --------------------------------------- */
const FACTS: Array<[string, RegExp]> = [
  ['3 tuvalet', /Wir haben drei Toiletten\./],
  ['benim odam var', /Ich habe ein Zimmer\./],
  ['ablamın odası var', /Meine Schwester hat auch ein Zimmer\./],
  ['ablamın odası açık renkli', /Ihr Zimmer ist hell/],
  ['benim odam gri', /Mein Zimmer ist grau/],
  ['benim odam koyu', /Mein Zimmer ist dunkel/],
  ['ablamın odası büyük', /Ihr Zimmer ist groß/],
  ['benim odam küçük', /Mein Zimmer ist klein|dunkel und klein|grau und klein/],
  ['salon', /Wir haben ein Wohnzimmer\./],
  ['büyük balkon', /Der Balkon ist groß\.|Wir haben einen Balkon\./],
  ['mutfak', /Wir haben eine Küche\./],
  ['mutfak açık renkli', /Unsere Küche ist hell\./],
  ['kedinin odası', /Unsere Katze hat auch ein Zimmer\./],
];
const missingFacts = FACTS.filter(([, r]) => !r.test(all));

/* -- 4) Konu / kavram kapsamı ------------------------------------- */
const coveredConcepts = new Set(d7.flatMap((e) => e.conceptIds));
const coveredTopics = new Set(d7.map((e) => e.topicId));

const line = (label: string, value: unknown) => console.log(`${label.padEnd(42)} ${value}`);
console.log('=== Özel Ders 7. Gün — İçerik Denetimi ===\n');
line('Alıştırma sayısı', d7.length);
line('Benzersiz ID', new Set(d7.map((e) => e.id)).size);
line('Kolay / Orta / Zor', ['easy','medium','hard'].map((d)=>d7.filter((e)=>e.difficulty===d).length).join(' / '));
line('Kavram sayısı', concepts.length);
line('Kavram kapsamı', `${concepts.filter((c)=>coveredConcepts.has(c.id)).length} / ${concepts.length}`);
line('Özet konusu sayısı', topics.length);
line('Konu kapsamı', `${topics.filter((t)=>coveredTopics.has(t.id)).length} / ${topics.length}`);
line('Kelime listesi', VOCAB.length);
line('Alıştırmada geçmeyen kelime', missingInExercises.length ? missingInExercises.map(([,w])=>w).join(', ') : '0');
line('Özette geçmeyen kelime', missingInSummary.length ? missingInSummary.map(([,w])=>w).join(', ') : '0');
line('Ev hikâyesi kapsamı', `${FACTS.length - missingFacts.length} / ${FACTS.length}`);
if (missingFacts.length) line('  eksik', missingFacts.map(([l])=>l).join(', '));
line('7. Gün sonrası kavram isteyen alıştırma', violations.length ? violations.map((e)=>e.id).join(', ') : 0);
line('Öğretilmemiş yapı içeren özet konusu', summaryViolations.length ? summaryViolations.map((t)=>t.id).join(', ') : 0);
line('Paket uyarısı', bundle.warnings.length);

/**
 * 1. hafta çalışma planı + KAYNAK ENVANTERİ (tek doğruluk kaynağı).
 *
 * Oturumlar (Session A–G) konu kimliği DEĞİLDİR: müfredat konu tabanlı
 * kalır; plan yalnızca önerilen çalışma akışıdır. Her aktivite:
 *   kararlı kimlik (`en.w1.*`) + yapılı hedef (`WeekLink`) + beceri/aile +
 *   beklenen öğrenci çıktısı + tamamlanma ölçütü.
 *
 * SÜRE BURADA YAZILMAZ. Her aktivitenin süresi `lib/week-workload.ts`
 * tarafından hedefteki GERÇEK içerikten (soru kuyruğu, pasaj uzunluğu,
 * dinleme akışı, yazma kelime hedefi) türetilir; oturum ve hafta toplamları
 * da bu türetilmiş sürelerin toplamıdır. Sıra: önce iş yükü kurulur, sonra
 * süresi hesaplanır — toplamdan geriye doğru sayı uydurulmaz.
 *
 * Her oturum aynı akışı izler:
 *   öğren → tanı → kontrollü pratik → aktif üretim → gerçek dil girdisi
 *   → yazma/konuşma uygulaması → geri bildirim/düzeltme → geri çağırma.
 *
 * Kalıcılık `skills-en` anahtarında `weekly.completedActivities` listesinde
 * yaşar (manuel onay kutusu yetkilidir); oturum ve hafta ilerlemesi bu
 * listeden TÜRETİLİR, ayrıca saklanmaz. Almanca verisine dokunulmaz.
 */

import type { SpeakingKind } from './skills-speaking.ts';
import { displayRange, modelWorkload, toMinutes, type Workload } from '../../lib/week-workload.ts';

/** Imperatif karma oturumlar (`lib/week-review.ts` havuzu kurar). */
export type WeekReviewSetId = 'b-mini' | 'd-mixed' | 'g-weak' | 'g-grammar';

/** Haftalık aktivitenin yapılı hedefi — genel beceri sayfası yok, tam pratik. */
export type WeekLink =
  | { kind: 'summary'; topicId: string; sectionId?: string }
  /**
   * `sectionId`: özet bölümü kimliği YA DA pratik seti (`set.*`).
   * `all`: bölümün/setin TÜM havuzu tek oturumda (12 soruluk örnek değil).
   */
  | { kind: 'lesson'; topicId: string; mode: 'normal' | 'full' | 'quick' | 'challenge' | 'section'; sectionId?: string; all?: boolean }
  | { kind: 'review-set'; setId: WeekReviewSetId }
  | { kind: 'listening'; topicId?: string; listenKind?: 'short' | 'dictation' | 'ielts'; focus?: string; itemId?: string }
  /** Gerçek insan sesiyle dış kaynak + uygulama içi tam akış. */
  | { kind: 'listening-task'; taskId: string }
  /** `draftOnly`: plan + taslak + öz denetim (yeniden yazma ayrı aktivitedir). */
  | { kind: 'writing'; taskId: string; stage?: 'rewrite'; draftOnly?: boolean }
  | { kind: 'speaking'; speakKind?: SpeakingKind; topicId?: string; focus?: string; promptId?: string; retry?: boolean }
  | { kind: 'reading'; filter?: 'short' | 'ielts' }
  | { kind: 'reading-intro' }
  | { kind: 'reading-passage'; passageId: string; view?: 'review' }
  | { kind: 'reading-vocab' }
  | { kind: 'vocab-topic'; topicId?: string; study?: 'topic' | 'mixed' | 'flash' | 'type' | 'trde'; size?: 'quick' | 'normal' | 'full' | 'marathon' }
  | { kind: 'review-mixed' }
  | { kind: 'weekly-analysis' }
  | { kind: 'mistakes'; scope?: 'week1' };

export type WeekSkill = 'Grammar' | 'Listening' | 'Speaking' | 'Writing' | 'Reading' | 'Vocabulary' | 'Review';

/** Süre kalibrasyonunun gruplandığı alıştırma ailesi. */
export type WeekFamily =
  | 'summary'
  | 'grammar-recognition'
  | 'grammar-production'
  | 'listening-drill'
  | 'listening-authentic'
  | 'speaking'
  | 'writing'
  | 'reading'
  | 'vocabulary'
  | 'review';

/** Envanter satırı: yazarın elle girdiği tek şey budur (süre yok). */
interface ActivityInput {
  /** Kararlı kimlik: `en.w1.<oturum>.<kısa-ad>` (dizin sırası değil). */
  id: string;
  label: string;
  detail: string;
  link: WeekLink;
  skill: WeekSkill;
  family: WeekFamily;
  /** Çekirdek mi, ek pratik mi? Ek pratik toplamlara ve ilerlemeye GİRMEZ. */
  tier?: 'extra';
  /** Öğrenciden beklenen somut çıktı. */
  output: string;
  /** Aktivite ne zaman "bitti" sayılır (süre değil, iş). */
  completion: string;
}

export interface WeekActivity extends Omit<ActivityInput, 'tier'> {
  tier: 'core' | 'extra';
  /** İçerikten türetilen iş yükü (bileşenleriyle). */
  workload: Workload;
  /** Hızlı öğrenci tahmini (dk) — toplamlar bununla yapılır. */
  minutes: number;
  /** Tipik öğrenci tahmini (dk). */
  minutesTypical: number;
  /** Gösterilen aralık: "20–30 dk". */
  duration: string;
}

export interface WeekSession {
  id: string;
  title: string;
  /** Session A..G */
  code: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
  /** Kısa konu başlığı: "Past Perfect + Gerund & Infinitive". */
  subtitle: string;
  /** Oturumun amacı (tek cümle). */
  goal: string;
  /** Çekirdek aktivitelerin hızlı-profil toplamı (dk); elle yazılmaz. */
  minutes: number;
  /** Çekirdek aktivitelerin tipik-profil toplamı (dk). */
  minutesTypical: number;
  /** Okunabilir aralık: "2 sa 40 dk – 3 sa 50 dk". */
  hours: string;
  description: string;
  activities: WeekActivity[];
}

/** 150 → "2 sa 30 dk", 120 → "2 sa", 45 → "45 dk". */
export function formatMinutes(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m} dk`;
  return m === 0 ? `${h} sa` : `${h} sa ${m} dk`;
}

/** "2 sa 40 dk – 3 sa 50 dk" (hızlı – tipik). */
export function formatRange(fast: number, typical: number): string {
  return fast === typical ? formatMinutes(fast) : `${formatMinutes(fast)} – ${formatMinutes(typical)}`;
}

type SessionInput = Omit<WeekSession, 'minutes' | 'minutesTypical' | 'hours' | 'activities'> & { activities: ActivityInput[] };

function timed(input: ActivityInput): WeekActivity {
  const workload = modelWorkload(input.link);
  return {
    ...input,
    tier: input.tier ?? 'core',
    workload,
    minutes: toMinutes(workload.seconds.fast),
    minutesTypical: toMinutes(workload.seconds.typical),
    duration: displayRange(workload.seconds).label,
  };
}

function session(input: SessionInput): WeekSession {
  const activities = input.activities.map(timed);
  const core = activities.filter((activity) => activity.tier === 'core');
  const minutes = core.reduce((total, activity) => total + activity.minutes, 0);
  const minutesTypical = core.reduce((total, activity) => total + activity.minutesTypical, 0);
  return { ...input, activities, minutes, minutesTypical, hours: formatRange(minutes, minutesTypical) };
}

const PP = 'en.present-perfect';
const SS = 'en.sentence-structure';
const PPF = 'en.past-perfect';
const GI = 'en.gerund-infinitive';
const COND = 'en.conditionals';
const PREP = 'en.prepositions-collocations';

const DONE_SET = 'Setteki tüm sorular cevaplandı ve yanlışların oturum içi tekrarı bitti.';
const DONE_SPEAK = 'Kapsamdaki her istem için kayıt yapıldı, dinlendi ve öz değerlendirme kaydedildi.';
const DONE_WRITE = 'Plan + taslak + öz denetim + geri bildirim + yeniden yazma kaydedildi.';
const DONE_LISTEN = 'İki dinleme, tüm sorular, transkript incelemesi, sözlü ve yazılı özet tamamlandı.';
const DONE_SUMMARY = 'Özet okundu; her bölümden bir örnek kapalıyken söylenebildi.';

/** Bölüm/set havuzunun tamamını tek oturumda açan ders bağlantısı. */
const set = (topicId: string, sectionId: string): WeekLink => ({ kind: 'lesson', topicId, mode: 'section', sectionId, all: true });

export const EN_WEEK_1_PLAN: WeekSession[] = [
  session({
    id: 'week1-A', code: 'A', title: 'Session A — Present Perfect', subtitle: 'Present Perfect',
    goal: 'have/has + V3’ü tanı, V3 ve for/since’i ayrı ayrı sağlamlaştır, sonra cümle üret, dinle, konuş ve yaz.',
    description: 'Özet → tanı → V3 → for/since → aktif üretim → hata düzeltme → dikte → gerçek dinleme → mini monolog → iki yazı.',
    activities: [
      { id: 'en.w1.a.summary', label: 'Özeti oku', detail: 'Present Perfect özeti: 12 bölüm, örnekleriyle', link: { kind: 'summary', topicId: PP }, skill: 'Grammar', family: 'summary', output: 'Her bölümden bir örnek cümleyi ezberden söyle.', completion: DONE_SUMMARY },
      { id: 'en.w1.a.recognition', label: 'Tanı + Kontrollü Pratik', detail: 'have/has, ever/never, already/yet/just, Simple Past ayrımı — seç ve doldur', link: set(PP, 'set.pp.recognition'), skill: 'Grammar', family: 'grammar-recognition', output: 'Doğru yapıyı tanı; hangi alt konuda takıldığını gör.', completion: DONE_SET },
      { id: 'en.w1.a.v3', label: 'V3 pratiği', detail: 'Düzensiz + düzenli üçüncü hâller: tanı, doldur, cümlede kullan', link: set(PP, 'present-perfect.v3'), skill: 'Grammar', family: 'grammar-recognition', output: 'V3 formlarını yaz ve cümle içinde kullan.', completion: DONE_SET },
      { id: 'en.w1.a.forsince', label: 'For / Since pratiği', detail: 'Süre mi, başlangıç mı? Seç, doldur, cümle yaz', link: set(PP, 'present-perfect.for-since'), skill: 'Grammar', family: 'grammar-production', output: 'for/since ile kendi cümlelerini yaz.', completion: DONE_SET },
      { id: 'en.w1.a.production', label: 'Aktif Üretim', detail: 'Türkçe → İngilizce, cümle kurma, kişisel cümleler: I have … / I haven’t … yet', link: set(PP, 'set.pp.production'), skill: 'Grammar', family: 'grammar-production', output: 'Tam İngilizce cümleler yaz (seçenek yok).', completion: DONE_SET },
      { id: 'en.w1.a.errors', label: 'Hata Düzeltme', detail: 'I haven’t see ❌ · since three years ❌ · I have seen it yesterday ❌', link: set(PP, 'set.pp.errors'), skill: 'Grammar', family: 'grammar-production', output: 'Hatalı cümleyi doğru hâliyle yeniden yaz.', completion: DONE_SET },
      { id: 'en.w1.a.dictation', label: 'For / Since Dikte', detail: '13 cümle: dinle ve tam cümleyi yaz', link: { kind: 'listening', topicId: PP, listenKind: 'dictation', focus: 'for-since', itemId: 'en-lis-d9' }, skill: 'Listening', family: 'listening-drill', output: 'Duyduğun 13 cümleyi yaz.', completion: 'Kapsamdaki 13 dikte gönderildi ve transkriptle karşılaştırıldı.' },
      { id: 'en.w1.a.listening', label: 'Gerçek Dinleme: Meeting an old friend', detail: 'British Council · B1 · iki arkadaş yıllar sonra karşılaşır (Present Perfect bağlamda)', link: { kind: 'listening-task', taskId: 'en-lx-old-friend' }, skill: 'Listening', family: 'listening-authentic', output: '11 soru + ~75 sn sözlü özet + 50–80 kelime yazı.', completion: DONE_LISTEN },
      { id: 'en.w1.a.speaking', label: 'Mini Monolog', detail: '3 konu × 60–90 sn: My English so far · A place I have visited · This year', link: { kind: 'speaking', topicId: PP, focus: 'pp-monologue' }, skill: 'Speaking', family: 'speaking', output: '3 kayıt: her biri 60–90 sn kesintisiz konuşma.', completion: DONE_SPEAK },
      { id: 'en.w1.a.writing-1', label: 'Yazma: Why I Want', detail: 'Why I Want to Improve My English (80–100 kelime): plan → taslak → geri bildirim → yeniden yaz', link: { kind: 'writing', taskId: 'en-write-1' }, skill: 'Writing', family: 'writing', output: '80–100 kelimelik taslak + düzeltilmiş ikinci sürüm.', completion: DONE_WRITE },
      { id: 'en.w1.a.writing-2', label: 'Yazma: Journey', detail: 'My English Learning Journey (100–120 kelime): for + since + düzensiz V3', link: { kind: 'writing', taskId: 'en-write-2' }, skill: 'Writing', family: 'writing', output: '100–120 kelimelik taslak + düzeltilmiş ikinci sürüm.', completion: DONE_WRITE },
    ],
  }),
  session({
    id: 'week1-B', code: 'B', title: 'Session B — Listening + Speaking', subtitle: 'Listening + Speaking',
    goal: 'Kulağı ısıt, gerçek insan sesiyle iki tam dinleme akışı yap, sonra cümleden uzun konuşmaya geç.',
    description: 'Kısa dinleme → V3 tanıma → karışık dikte → 2 gerçek dinleme → gölgeleme → sesli okuma → kişisel sorular → tekrar → uzun konuşma → mini tekrar.',
    activities: [
      { id: 'en.w1.b.short', label: 'Present Perfect Kısa Dinleme', detail: '19 kısa parça: have/has V3, for, since, ever, never, already, yet', link: { kind: 'listening', topicId: PP, listenKind: 'short', focus: 'pp-short' }, skill: 'Listening', family: 'listening-drill', output: '19 kısa cevap.', completion: 'Kapsamdaki 19 parça gönderildi.' },
      { id: 'en.w1.b.v3', label: 'V3 Dinleme Tanıma', detail: '14 parça: seen, written, taken, spoken, known, been, gone… — duy ve yaz', link: { kind: 'listening', topicId: PP, focus: 'v3' }, skill: 'Listening', family: 'listening-drill', output: 'Duyduğun V3 formunu yaz.', completion: 'Kapsamdaki 14 parça gönderildi.' },
      { id: 'en.w1.b.mixed-dictation', label: 'Karışık Dikte', detail: '19 cümle: 11 kısa + 8 iki yan cümleli uzun (altı konudan)', link: { kind: 'listening', listenKind: 'dictation', focus: 'mixed-dictation' }, skill: 'Listening', family: 'listening-drill', output: '19 tam cümle yaz; uzunlarda bağlacı ve virgülü yakala.', completion: 'Kapsamdaki 19 dikte gönderildi ve transkriptle karşılaştırıldı.' },
      { id: 'en.w1.b.listening-skills', label: 'Gerçek Dinleme: An interview about listening skills', detail: 'British Council · B1 · dinleme neden zor, iki strateji', link: { kind: 'listening-task', taskId: 'en-lx-listening-skills' }, skill: 'Listening', family: 'listening-authentic', output: '10 soru + ~90 sn sözlü özet + 60–90 kelime yazı.', completion: DONE_LISTEN },
      { id: 'en.w1.b.work-life', label: 'Gerçek Dinleme: Work–life balance', detail: 'British Council · B1 · radyo röportajı: iş ve özel hayat dengesi', link: { kind: 'listening-task', taskId: 'en-lx-work-life' }, skill: 'Listening', family: 'listening-authentic', output: '10 soru + ~90 sn sözlü özet + 60–90 kelime yazı.', completion: DONE_LISTEN },
      { id: 'en.w1.b.shadowing', label: 'Present Perfect Gölgeleme', detail: '16 doğal cümle: dinle → tekrarla → kaydet → karşılaştır', link: { kind: 'speaking', topicId: PP, speakKind: 'shadowing', focus: 'pp-shadowing' }, skill: 'Speaking', family: 'speaking', output: '16 kayıt; kısaltmalar (I’ve, she’s) doğal.', completion: DONE_SPEAK },
      { id: 'en.w1.b.read-aloud', label: 'Sesli Okuma', detail: '9 cümle + 3 bağlı paragraf (50–60 kelime): kaydet ve dinle', link: { kind: 'speaking', topicId: PP, speakKind: 'read-aloud', focus: 'pp-read' }, skill: 'Speaking', family: 'speaking', output: '12 kayıt; paragraflarda duraksamadan okuma.', completion: DONE_SPEAK },
      { id: 'en.w1.b.personal', label: 'Kişisel Konuşma Soruları', detail: '14 soru: How long have you…? Have you ever…? — her birine 2–3 cümle', link: { kind: 'speaking', topicId: PP, speakKind: 'short-answer', focus: 'pp-personal' }, skill: 'Speaking', family: 'speaking', output: '14 sözlü cevap (her biri 2–3 cümle).', completion: DONE_SPEAK },
      { id: 'en.w1.b.retry', label: 'Konuşma Tekrarı', detail: '“Tekrar gerek” dediğin cevapları yeniden söyle', link: { kind: 'speaking', topicId: PP, speakKind: 'short-answer', focus: 'pp-personal', retry: true }, skill: 'Speaking', family: 'speaking', output: 'Zayıf cevapların daha iyi ikinci kaydı.', completion: 'Tekrar listesindeki cevaplar yeniden kaydedildi.' },
      { id: 'en.w1.b.long-turn', label: 'Uzun Konuşma (kart)', detail: '2 kart × 1,5–2 dk: A skill I have learned · A person I have known for a long time', link: { kind: 'speaking', topicId: PP, focus: 'pp-long-turn' }, skill: 'Speaking', family: 'speaking', output: '2 kayıt: 1,5–2 dakikalık kesintisiz konuşma.', completion: DONE_SPEAK },
      { id: 'en.w1.b.mini', label: 'Mini Tekrar', detail: 'Karışık dinle-seç + dikte + sesli cevap (Present Perfect)', link: { kind: 'review-set', setId: 'b-mini' }, skill: 'Review', family: 'review', output: 'Karışık dinleme/konuşma soruları.', completion: DONE_SET },
    ],
  }),
  session({
    id: 'week1-C', code: 'C', title: 'Session C — Sentence Structure + Writing', subtitle: 'Sentence Structure + Writing',
    goal: 'Doğal İngilizce cümle sırasını kur; sonra bunu 120–150 kelimelik planlı bir yazıya taşı ve yeniden yaz.',
    description: 'Özet → tanıma → sıralama → Türkçe→İngilizce → soru düzeni → genişletme → hata düzeltme → gerçek dinleme → rehberli yazma → yeniden yazma.',
    activities: [
      { id: 'en.w1.c.summary', label: 'Sentence Structure Özeti', detail: 'SVO, yer + zaman, bağlaçlar, soru ve dolaylı soru', link: { kind: 'summary', topicId: SS }, skill: 'Grammar', family: 'summary', output: 'Her bölümden bir örnek cümleyi ezberden söyle.', completion: DONE_SUMMARY },
      { id: 'en.w1.c.recognition', label: 'Cümle Sırası: Tanıma', detail: 'SVO, yer + zaman, bağlaçlar — doğru sırayı seç ve doldur', link: set(SS, 'set.ss.recognition'), skill: 'Grammar', family: 'grammar-recognition', output: 'Doğru sırayı tanı.', completion: DONE_SET },
      { id: 'en.w1.c.ordering', label: 'Cümle Sıralama', detail: 'Karışık kelimeleri diz: düz cümle, yer + zaman, because/but/so', link: set(SS, 'set.ss.ordering'), skill: 'Grammar', family: 'grammar-production', output: 'Kelimeleri doğru sıraya diz.', completion: DONE_SET },
      { id: 'en.w1.c.tr-en', label: 'Türkçe → İngilizce', detail: 'Doğal kelime sırasıyla tam cümle üret (yazarak + kutucukla)', link: set(SS, 'set.ss.tr-en'), skill: 'Grammar', family: 'grammar-production', output: 'Tam İngilizce cümleler yaz.', completion: DONE_SET },
      { id: 'en.w1.c.questions', label: 'Soru Yapısı', detail: 'Where is the bank? ↔ Do you know where the bank is?', link: set(SS, 'sentence-structure.questions'), skill: 'Grammar', family: 'grammar-production', output: 'Doğrudan ve dolaylı sorular kur.', completion: DONE_SET },
      { id: 'en.w1.c.expansion', label: 'Cümle Genişletme', detail: 'I study English → every evening → because I want to study abroad', link: set(SS, 'sentence-structure.expansion'), skill: 'Grammar', family: 'grammar-production', output: 'Kısa cümleyi yer, zaman ve nedenle genişlet.', completion: DONE_SET },
      { id: 'en.w1.c.errors', label: 'Hata Düzeltme', detail: 'Sıra, eksik edat, çift özne, yardımcı fiil, bağlaç hataları', link: set(SS, 'set.ss.error-correction'), skill: 'Grammar', family: 'grammar-production', output: 'Hatalı cümleyi doğru hâliyle yeniden yaz.', completion: DONE_SET },
      { id: 'en.w1.c.listening', label: 'Gerçek Dinleme: Arriving late to class', detail: 'British Council · B1 · derste fısıldaşan iki öğrenci; sorular ve bir sürpriz', link: { kind: 'listening-task', taskId: 'en-lx-late-class' }, skill: 'Listening', family: 'listening-authentic', output: '10 soru + ~75 sn hikâye anlatımı + 50–80 kelime yazı.', completion: DONE_LISTEN },
      { id: 'en.w1.c.writing', label: 'Rehberli Yazma', detail: 'Why I Want to Improve My English — 5 bölümlü iskelet, 120–150 kelime: plan → taslak → öz denetim', link: { kind: 'writing', taskId: 'en-write-w1-guided', draftOnly: true }, skill: 'Writing', family: 'writing', output: 'Plan notları + 120–150 kelimelik taslak.', completion: 'Plan notu, taslak ve öz denetim kaydedildi.' },
      { id: 'en.w1.c.rewrite', label: 'Geri Bildirim + Yeniden Yazma', detail: 'Geri bildirimi oku, taslağı düzelterek yeniden yaz, örnekle karşılaştır', link: { kind: 'writing', taskId: 'en-write-w1-guided', stage: 'rewrite' }, skill: 'Writing', family: 'writing', output: 'Düzeltilmiş ikinci sürüm.', completion: 'Yeniden yazma kaydedildi ve taslakla karşılaştırıldı.' },
      { id: 'en.w1.c.routine', label: 'My Daily Routine', detail: 'Yer + zaman sırasıyla 80–100 kelime (ek yazma pratiği)', link: { kind: 'writing', taskId: 'en-write-4' }, skill: 'Writing', family: 'writing', tier: 'extra', output: '80–100 kelimelik taslak + ikinci sürüm.', completion: DONE_WRITE },
    ],
  }),
  session({
    id: 'week1-D', code: 'D', title: 'Session D — Past Perfect + Gerund & Infinitive', subtitle: 'Past Perfect + Gerund & Infinitive',
    goal: 'had + V3 ile “önce olan” olayı anlat; enjoy doing / decide to do kalıplarını üret; ikisini bir hikâyede birleştir.',
    description: 'Her konu için: özet → tanıma/karşıtlık → kurma → serbest üretim → hata düzeltme; sonra konuşma, hikâye yazma ve karışık tekrar.',
    activities: [
      { id: 'en.w1.d.pp-summary', label: 'Past Perfect Özeti', detail: 'had + V3, önce olan olay, by the time', link: { kind: 'summary', topicId: PPF }, skill: 'Grammar', family: 'summary', output: 'Her bölümden bir örnek cümleyi ezberden söyle.', completion: DONE_SUMMARY },
      { id: 'en.w1.d.contrast', label: 'Formül + Past Simple vs Past Perfect', detail: 'had + V3 formülü, bağlamdan doğru zamanı seç, by the time, tipik hatalar', link: set(PPF, 'set.ppf.contrast'), skill: 'Grammar', family: 'grammar-recognition', output: 'Doğru zamanı seç ve hatalı cümleleri düzelt.', completion: DONE_SET },
      { id: 'en.w1.d.timeline-build', label: 'Zaman Çizgisi: Kur', detail: 'film başladı → biz vardık: sırala ve kutucukla kur', link: set(PPF, 'set.ppf.timeline-build'), skill: 'Grammar', family: 'grammar-production', output: 'İki olayı doğru sırayla tek cümlede kur.', completion: DONE_SET },
      { id: 'en.w1.d.pp-tr-en', label: 'Past Perfect: Türkçe → İngilizce', detail: 'Serbest yazım: had + V3 cümleleri', link: set(PPF, 'set.ppf.tr-en'), skill: 'Grammar', family: 'grammar-production', output: 'Tam İngilizce cümleler yaz.', completion: DONE_SET },
      { id: 'en.w1.d.gi-summary', label: 'Gerund & Infinitive Özeti', detail: 'enjoy doing · decide to do · look forward to doing', link: { kind: 'summary', topicId: GI }, skill: 'Grammar', family: 'summary', output: 'Her bölümden bir örnek cümleyi ezberden söyle.', completion: DONE_SUMMARY },
      { id: 'en.w1.d.patterns', label: 'Fiil Kalıbı Tanıma', detail: 'enjoy, decide, avoid, plan, finish, want, look forward to — seç, doldur, eşleştir', link: set(GI, 'set.gi.patterns'), skill: 'Grammar', family: 'grammar-recognition', output: 'Fiilden sonra -ing mi to mu: hızlı ve doğru karar.', completion: DONE_SET },
      { id: 'en.w1.d.gi-build', label: 'Kalıp Kurma', detail: 'Kutucukla çeviri + sıralama: I decided to… / I look forward to…', link: set(GI, 'set.gi.build'), skill: 'Grammar', family: 'grammar-production', output: 'Kalıbı cümle içinde kur.', completion: DONE_SET },
      { id: 'en.w1.d.gi-production', label: 'Kalıp Üretimi', detail: 'Serbest yazım: Türkçe → İngilizce ve kişisel cümleler', link: set(GI, 'set.gi.production'), skill: 'Grammar', family: 'grammar-production', output: 'Tam İngilizce cümleler yaz.', completion: DONE_SET },
      { id: 'en.w1.d.errors', label: 'Gerund/Infinitive Hata Düzeltme', detail: 'enjoy to visit ❌ · decide take ❌ · look forward to see ❌', link: set(GI, 'gerund-infinitive.mistakes'), skill: 'Grammar', family: 'grammar-production', output: 'Hatalı cümleyi doğru hâliyle yeniden yaz.', completion: DONE_SET },
      { id: 'en.w1.d.speaking', label: 'Konuşma: Had… / Enjoy…', detail: '8 kişisel soru + 1 hikâye (60–90 sn): A day when everything went wrong', link: { kind: 'speaking', focus: 'ppf-gi' }, skill: 'Speaking', family: 'speaking', output: '8 sözlü cevap + 1 mini hikâye kaydı.', completion: DONE_SPEAK },
      { id: 'en.w1.d.writing', label: 'Yazma: A Day That Went Wrong', detail: 'Past Perfect hikâyesi, 110–140 kelime: plan → taslak → geri bildirim → yeniden yaz', link: { kind: 'writing', taskId: 'en-write-w1-story' }, skill: 'Writing', family: 'writing', output: '110–140 kelimelik hikâye + düzeltilmiş ikinci sürüm.', completion: DONE_WRITE },
      { id: 'en.w1.d.mixed', label: 'Karışık Tekrar', detail: 'Past Perfect + Gerund & Infinitive karışık (yanlış yaptıkların ve az gördüklerin önce)', link: { kind: 'review-set', setId: 'd-mixed' }, skill: 'Review', family: 'review', output: 'İki konuyu karışık koşulda hatırla.', completion: DONE_SET },
    ],
  }),
  session({
    id: 'week1-E', code: 'E', title: 'Session E — IELTS Reading + Vocabulary', subtitle: 'IELTS Reading + Vocabulary & Collocations',
    goal: 'Okuma hacmi değil soru tekniği: kanıt bul, varsayımla cevaplama; okuduğunu anlat ve yaz; öbekleri aktif kullan.',
    description: 'Giriş → Passage 1 → kanıt → Passage 2 → kanıt → kelime çıkarma → okuduğunu anlat → okuma yanıtı yaz → akademik dinleme → öbek kartları → karışık → öbekle cümle.',
    activities: [
      { id: 'en.w1.e.intro', label: 'IELTS Reading Girişi', detail: 'Anlamı oku · kanıtı bul · varsayımla cevaplama (+ 3 soruluk deneme)', link: { kind: 'reading-intro' }, skill: 'Reading', family: 'reading', output: 'True / False / Not Given ayrımını örnekle açıkla.', completion: 'Giriş okundu ve 3 deneme sorusu çözüldü.' },
      { id: 'en.w1.e.passage-1', label: 'IELTS Passage 1', detail: 'Green Roofs and Cooler Cities — çoktan seçmeli, True/False/Not Given, kısa cevap (12 soru)', link: { kind: 'reading-passage', passageId: 'en-read-w1-1' }, skill: 'Reading', family: 'reading', output: '12 cevap.', completion: 'Pasaj okundu, 12 soru gönderildi.' },
      { id: 'en.w1.e.evidence', label: 'Kanıt İncelemesi 1', detail: 'Her cevabın destekleyen cümlesini pasajda bul; yanlışlarının nedenini not et', link: { kind: 'reading-passage', passageId: 'en-read-w1-1', view: 'review' }, skill: 'Reading', family: 'reading', output: 'Yanlışların için “neden yanlış” notu.', completion: 'Tüm soruların kanıtı açıldı.' },
      { id: 'en.w1.e.passage-2', label: 'IELTS Passage 2', detail: 'Learning a Language as an Adult — başlık eşleştirme, cümle tamamlama, çoktan seçmeli (13 soru)', link: { kind: 'reading-passage', passageId: 'en-read-w1-2' }, skill: 'Reading', family: 'reading', output: '13 cevap.', completion: 'Pasaj okundu, 13 soru gönderildi.' },
      { id: 'en.w1.e.evidence-2', label: 'Kanıt İncelemesi 2', detail: 'Başlık eşleştirmede seni yanıltan çeldiriciyi bul', link: { kind: 'reading-passage', passageId: 'en-read-w1-2', view: 'review' }, skill: 'Reading', family: 'reading', output: 'Yanlışların için “neden yanlış” notu.', completion: 'Tüm soruların kanıtı açıldı.' },
      { id: 'en.w1.e.vocab-extract', label: 'Kelime Çıkarma', detail: 'Pasajlardan işine yarayanları SEN seç ve kaydet; her biriyle bir cümle kur', link: { kind: 'reading-vocab' }, skill: 'Vocabulary', family: 'vocabulary', output: 'Kendi seçtiğin öbek listesi (kelime çalışmasına girer).', completion: 'En az 5 öbek seçilip kaydedildi.' },
      { id: 'en.w1.e.talk', label: 'Okuduğunu Anlat', detail: '2 konuşma × 60–90 sn: yeşil çatı fikrini açıkla · yetişkin öğrenciye tavsiye ver', link: { kind: 'speaking', focus: 'reading-talk' }, skill: 'Speaking', family: 'speaking', output: '2 kayıt: pasaj fikirlerini kendi cümlelerinle anlatma.', completion: DONE_SPEAK },
      { id: 'en.w1.e.response', label: 'Yazma: Okuma Yanıtı', detail: 'Passage 2’den iki fikri özetle + kendi kararın (100–130 kelime): plan → taslak → geri bildirim → yeniden yaz', link: { kind: 'writing', taskId: 'en-write-w1-response' }, skill: 'Writing', family: 'writing', output: '100–130 kelimelik özet + görüş, düzeltilmiş ikinci sürüm.', completion: DONE_WRITE },
      { id: 'en.w1.e.listening', label: 'Gerçek Dinleme: An introduction to a lecture', detail: 'British Council · B1 · üniversite dersi açılışı: mutluluk ve “flow”', link: { kind: 'listening-task', taskId: 'en-lx-lecture-intro' }, skill: 'Listening', family: 'listening-authentic', output: '11 soru + ~90 sn sözlü özet + 60–90 kelime yazı.', completion: DONE_LISTEN },
      { id: 'en.w1.e.collocations', label: 'Öbek Kartları', detail: '33 öbek: pay attention to · interested in · depend on · believe in · good at', link: { kind: 'vocab-topic', topicId: PREP, study: 'flash', size: 'full' }, skill: 'Vocabulary', family: 'vocabulary', output: 'Her kartta anlamı kapalıyken hatırla.', completion: '33 kartın tamamı görüldü ve değerlendirildi.' },
      { id: 'en.w1.e.mixed', label: 'Öbek Karışık Pratik', detail: 'İng→Tr, Tr→İng, eşleştirme, yazarak — tüm öbekler', link: { kind: 'vocab-topic', topicId: PREP, study: 'mixed', size: 'full' }, skill: 'Vocabulary', family: 'vocabulary', output: 'Öbeği iki yönde hatırla ve yaz.', completion: 'Oturumdaki tüm sorular cevaplandı.' },
      { id: 'en.w1.e.chunk-writing', label: 'Öbekle Cümle Yaz', detail: 'Serbest yazım: her öbeği tam bir cümlede kullan (Türkçe → İngilizce)', link: set(PREP, 'set.prep.chunk-writing'), skill: 'Vocabulary', family: 'grammar-production', output: 'Öbeği edatıyla birlikte tam cümlede yaz.', completion: DONE_SET },
    ],
  }),
  session({
    id: 'week1-F', code: 'F', title: 'Session F — Conditionals + Prepositions', subtitle: 'Conditionals + Prepositions & Collocations',
    goal: 'Second Conditional ile hayal kur (If I had…, I would…); edat + öbekleri bütün halinde üret; ikisini yazıda birleştir.',
    description: 'Conditionals: özet → yapı → üretim → hata → konuşma → gerçek dinleme. Prepositions: özet → tanıma → üretim → hata. Sonunda birleştiren yazı.',
    activities: [
      { id: 'en.w1.f.cond-summary', label: 'Conditionals Özeti', detail: 'Zero · First · Second (öncelik: Second)', link: { kind: 'summary', topicId: COND }, skill: 'Grammar', family: 'summary', output: 'Her bölümden bir örnek cümleyi ezberden söyle.', completion: DONE_SUMMARY },
      { id: 'en.w1.f.structure', label: 'Conditional Yapısı', detail: 'Zero/First ayrımı + If + Past Simple, would + V1: seç, doldur, sırala, kutucukla kur', link: set(COND, 'set.cond.second-structure'), skill: 'Grammar', family: 'grammar-recognition', output: 'Yapıyı tanı ve parçalardan kur.', completion: DONE_SET },
      { id: 'en.w1.f.tr-en', label: 'Conditionals: Türkçe → İngilizce', detail: 'Serbest yazım: If I had more time, I would…', link: set(COND, 'set.cond.tr-en'), skill: 'Grammar', family: 'grammar-production', output: 'Tam koşul cümleleri yaz.', completion: DONE_SET },
      { id: 'en.w1.f.errors', label: 'Conditionals Hata Düzeltme', detail: 'If I would have… ❌ · If I will… ❌', link: set(COND, 'conditionals.mistakes'), skill: 'Grammar', family: 'grammar-production', output: 'Hatalı cümleyi doğru hâliyle yeniden yaz.', completion: DONE_SET },
      { id: 'en.w1.f.speaking', label: 'Kişisel Conditional Konuşma', detail: '12 soru + 1 mini konuşma: What would you do if you had more free time?', link: { kind: 'speaking', topicId: COND, focus: 'second-conditional' }, skill: 'Speaking', family: 'speaking', output: '13 sözlü cevap; her birinde If + Past, would + V1.', completion: DONE_SPEAK },
      { id: 'en.w1.f.listening', label: 'Gerçek Dinleme: A student discussion', detail: 'British Council · B1 · iki öğrenci Mars ile Dünya’yı karşılaştırır (sayı yakalama)', link: { kind: 'listening-task', taskId: 'en-lx-student-discussion' }, skill: 'Listening', family: 'listening-authentic', output: '11 soru + ~90 sn karşılaştırma + 60–90 kelime (If I lived on Mars…).', completion: DONE_LISTEN },
      { id: 'en.w1.f.prep-summary', label: 'Prepositions & Collocations Özeti', detail: 'interested in · listen to · wait for · depend on', link: { kind: 'summary', topicId: PREP }, skill: 'Vocabulary', family: 'summary', output: 'Her bölümden bir örnek cümleyi ezberden söyle.', completion: DONE_SUMMARY },
      { id: 'en.w1.f.recognition', label: 'Öbek Tanıma', detail: 'interested ___ · depend ___ · listen ___ · wait ___ — seç, doldur, eşleştir, duy', link: set(PREP, 'set.prep.recognition'), skill: 'Vocabulary', family: 'grammar-recognition', output: 'Doğru edatı hızlı ve doğru seç.', completion: DONE_SET },
      { id: 'en.w1.f.production', label: 'Öbek Üretimi', detail: 'İngilizceyle ilgileniyorum → I’m interested in English. (kutucuk, sıralama, serbest yazım)', link: set(PREP, 'set.prep.production'), skill: 'Vocabulary', family: 'grammar-production', output: 'Öbekli tam cümleler yaz.', completion: DONE_SET },
      { id: 'en.w1.f.prep-errors', label: 'Öbek Hata Düzeltme', detail: 'interested for ❌ · give attention ❌ · believe myself ❌', link: set(PREP, 'prepositions-collocations.mistakes'), skill: 'Vocabulary', family: 'grammar-production', output: 'Hatalı cümleyi doğru hâliyle yeniden yaz.', completion: DONE_SET },
      { id: 'en.w1.f.writing', label: 'Yazma: If I Could Change One Thing', detail: 'Second Conditional + öbekler, 110–140 kelime: plan → taslak → geri bildirim → yeniden yaz', link: { kind: 'writing', taskId: 'en-write-w1-if' }, skill: 'Writing', family: 'writing', output: '110–140 kelimelik yazı + düzeltilmiş ikinci sürüm.', completion: DONE_WRITE },
      { id: 'en.w1.f.hypotheticals', label: 'Kişisel Varsayımlar', detail: 'Serbest yazım: kendi hayatından If… cümleleri (ek üretim pratiği)', link: set(COND, 'set.cond.hypotheticals'), skill: 'Grammar', family: 'grammar-production', tier: 'extra', output: 'Kendi hayatından koşul cümleleri yaz.', completion: DONE_SET },
    ],
  }),
  session({
    id: 'week1-G', code: 'G', title: 'Session G — Weekly Review + Weekly Test', subtitle: 'Weekly Review + Weekly Test',
    goal: 'Haftanın tamamını karışık koşullarda, ipucu olmadan hatırla. Yeni konu yok; hatalarını sınıflandır ve temizle.',
    description: 'Zayıf alanlar → karışık gramer → kelime → görülmemiş okuma → dinleme (drill + gerçek) → yazma testi → konuşma testi → hata analizi → hata temizliği.',
    activities: [
      { id: 'en.w1.g.weak', label: 'Zayıf Alanlar Isınma', detail: 'Hata ve ustalığa göre: yanlış yaptıkların, V3, öbek, hata düzeltme', link: { kind: 'review-set', setId: 'g-weak' }, skill: 'Review', family: 'review', output: 'Hafta içinde takıldığın soruları doğru çöz.', completion: DONE_SET },
      { id: 'en.w1.g.grammar', label: 'Haftalık Gramer Tekrarı', detail: 'Altı konudan karışık; hiç görmediklerin ve yanlış yaptıkların önce gelir', link: { kind: 'review-set', setId: 'g-grammar' }, skill: 'Grammar', family: 'review', output: 'Altı konuyu karışık koşulda uygula.', completion: DONE_SET },
      { id: 'en.w1.g.vocab', label: 'Kelime ve Öbek Tekrarı', detail: 'Hafta 1’in tüm kelime/öbekleri (okumadan seçtiklerin dahil) karışık', link: { kind: 'vocab-topic', study: 'mixed', size: 'full' }, skill: 'Vocabulary', family: 'vocabulary', output: 'Öbekleri iki yönde hatırla.', completion: 'Oturumdaki tüm sorular cevaplandı.' },
      { id: 'en.w1.g.reading', label: 'Okuma Mini Testi', detail: 'Görmediğin yeni pasaj: Sleep and Learning (10 soru)', link: { kind: 'reading-passage', passageId: 'en-read-wt-1' }, skill: 'Reading', family: 'reading', output: '10 cevap.', completion: 'Pasaj okundu, 10 soru gönderildi.' },
      { id: 'en.w1.g.listening', label: 'Dinleme Mini Testi', detail: '12 yeni parça: dinle-seç, eksik kelime, kısa cevap, dikte', link: { kind: 'listening', focus: 'week1-test' }, skill: 'Listening', family: 'listening-drill', output: '12 cevap.', completion: 'Kapsamdaki 12 parça gönderildi.' },
      { id: 'en.w1.g.listening-test', label: 'Gerçek Dinleme Testi: Making a decision', detail: 'British Council · B1 · dört kişilik iş toplantısı (ipucu yok)', link: { kind: 'listening-task', taskId: 'en-lx-decision' }, skill: 'Listening', family: 'listening-authentic', output: '11 soru + ~90 sn özet + 60–90 kelime yazı.', completion: DONE_LISTEN },
      { id: 'en.w1.g.writing', label: 'Yazma Mini Testi', detail: '120–150 kelime; gramer ipucu yok: plan → taslak → geri bildirim → yeniden yaz', link: { kind: 'writing', taskId: 'en-write-wt-1' }, skill: 'Writing', family: 'writing', output: '120–150 kelimelik yazı + düzeltilmiş ikinci sürüm.', completion: DONE_WRITE },
      { id: 'en.w1.g.speaking', label: 'Konuşma Mini Testi', detail: '6 soru + 2 uzun konuşma (1,5–2 dk); ipucu ve örnek cevap yok', link: { kind: 'speaking', focus: 'week1-test' }, skill: 'Speaking', family: 'speaking', output: '8 kayıt; ikisi 1,5–2 dakikalık.', completion: DONE_SPEAK },
      { id: 'en.w1.g.analysis', label: 'Hata Sınıflandırma', detail: 'Gramer · kelime · öbek · cümle yapısı · okuma · dinleme · yazma · konuşma', link: { kind: 'weekly-analysis' }, skill: 'Review', family: 'review', output: 'En sık 3 hata kalıbın için birer doğru cümle.', completion: 'Analiz incelendi; 3 düzeltme cümlesi yazıldı.' },
      { id: 'en.w1.g.mistakes', label: 'Hataları Tekrarla', detail: 'Hafta 1’in öncelikli hatalarını hemen tekrar çalış', link: { kind: 'mistakes', scope: 'week1' }, skill: 'Review', family: 'review', output: 'Aktif hataların doğru çözümü.', completion: 'Hafta 1 hata listesi tekrar edildi.' },
    ],
  }),
];

/** Tüm 1. hafta aktiviteleri (çekirdek + ek). */
export const EN_WEEK_1_ACTIVITIES: WeekActivity[] = EN_WEEK_1_PLAN.flatMap((s) => s.activities);

/** Çekirdek aktiviteler: ilerleme paydası ve süre toplamları bunlardan türetilir. */
export const EN_WEEK_1_CORE: WeekActivity[] = EN_WEEK_1_ACTIVITIES.filter((a) => a.tier === 'core');

export const EN_WEEK_1_ACTIVITY_IDS: ReadonlySet<string> = new Set(EN_WEEK_1_ACTIVITIES.map((a) => a.id));
const CORE_IDS: ReadonlySet<string> = new Set(EN_WEEK_1_CORE.map((a) => a.id));

export const EN_WEEK_1_ACTIVITY_BY_ID = new Map(EN_WEEK_1_ACTIVITIES.map((a) => [a.id, a]));

/** Haftanın çekirdek toplamı — hızlı öğrenci (dakika). */
export const EN_WEEK_1_MINUTES: number = EN_WEEK_1_PLAN.reduce((sum, s) => sum + s.minutes, 0);
/** Haftanın çekirdek toplamı — tipik öğrenci (dakika). */
export const EN_WEEK_1_MINUTES_TYPICAL: number = EN_WEEK_1_PLAN.reduce((sum, s) => sum + s.minutesTypical, 0);

export interface WeekPlanProgress {
  done: number;
  total: number;
  percent: number;
  sessions: Array<{ id: string; code: string; done: number; total: number; complete: boolean }>;
}

/**
 * Oturum ve hafta ilerlemesi: yalnızca işaretli ÇEKİRDEK kimlikler sayılır, ve
 * yalnızca planda GERÇEKTEN var olan kimlikler (eski/yanlış kimlik ya da ek
 * pratik sayacı şişirmez). Hiçbir yerde ayrı bir "tamamlandı" durumu tutulmaz.
 */
export function weekPlanProgress(completed: readonly string[]): WeekPlanProgress {
  const marked = new Set(completed.filter((id) => CORE_IDS.has(id)));
  const sessions = EN_WEEK_1_PLAN.map((s) => {
    const core = s.activities.filter((a) => a.tier === 'core');
    const done = core.filter((a) => marked.has(a.id)).length;
    return { id: s.id, code: s.code, done, total: core.length, complete: done === core.length };
  });
  const total = EN_WEEK_1_CORE.length;
  const done = marked.size;
  return { done, total, percent: total ? Math.round((done / total) * 100) : 0, sessions };
}

/** Önerilen sıra (katı takvim değil): konu + beceri akışı. */
export const EN_WEEK_1_ORDER: string[] = [
  'en.present-perfect',
  'skill:listening+speaking',
  'en.sentence-structure',
  'en.past-perfect',
  'en.gerund-infinitive',
  'skill:reading',
  'en.conditionals',
  'en.prepositions-collocations',
  'weekly-review',
];

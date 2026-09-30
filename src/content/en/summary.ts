/**
 * Present Perfect konu özeti — öğrenicinin ana dili Türkçedir, bu yüzden
 * açıklamalar Türkçe; örnekler İngilizcedir.
 *
 * Bölümler `EN_SUMMARY_SECTIONS` ile birebir eşleşir; her kavramın `anchor`
 * dizesi kendi bölümünün metninde geçer.
 */

import type { TopicSummary } from '../types.ts';

export const EN_PRESENT_PERFECT_SUMMARY: TopicSummary = {
  topicId: 'en.present-perfect',
  title: 'Present Perfect',
  intro: [
    'Present Perfect, geçmişte başlayıp bugüne bağlanan durumları anlatır: deneyimler, hâlâ süren durumlar ve sonucu bugünde görülen işler.',
    'Bu özet seni kuralı tanımaktan otomatik doğru cümle kurmaya taşır. Önce formülü, sonra V3\'ü, sonra for/since ayrımını öğren.',
  ],
  estimatedReadingMinutes: 25,
  sections: [
    {
      id: 'present-perfect.formula',
      topicId: 'en.present-perfect',
      title: 'Temel Formül — Özne + have/has + V3',
      conceptIds: ['pp.formula.core'],
      blocks: [
        {
          kind: 'paragraph',
          text: 'Present Perfectin iskeleti her zaman aynıdır: ÖZNE + have/has + V3. Yani önce kim, sonra have ya da has, en sonda fiilin üçüncü hâli (past participle). Formül: have/has + V3.',
        },
        { kind: 'code', lines: ['I have seen this film.', 'She has finished her homework.', 'We have lived here for three years.', 'He has already eaten.'] },
        { kind: 'callout', text: 'V3, fiilin üçüncü hâlidir: see → seen, finish → finished. have/has\'ten sonra ASLA V1 (see) ya da V2 (saw) gelmez.' },
      ],
      warnings: [],
      examples: [
        { german: 'I have seen this film.', turkish: 'Bu filmi gördüm. (deneyim olarak, hayatımda)' },
        { german: 'She has finished her homework.', turkish: 'Ödevini bitirdi. (sonuç bugünde)' },
      ],
      pronunciation: [],
    },
    {
      id: 'present-perfect.have-has',
      topicId: 'en.present-perfect',
      title: 'have / has ve Kısaltmalar',
      conceptIds: ['pp.have-has.table', 'pp.have-has.contractions'],
      blocks: [
        { kind: 'paragraph', text: 'Özneye göre have ya da has seçilir. I, you, we, they ile have; he, she, it ile has kullanılır: I have, you have, we have, they have, he has, she has, it has.' },
        {
          kind: 'table',
          head: ['Özne', 'Yardımcı', 'Örnek'],
          rows: [
            ['I / you / we / they', 'have', 'I have seen it.'],
            ['he / she / it', 'has', 'She has seen it.'],
          ],
        },
        { kind: 'paragraph', text: 'Günlük konuşmada kısaltmalar çok doğaldır: I\'ve, you\'ve, we\'ve, they\'ve, he\'s, she\'s, it\'s. Dikkat: he\'s iki anlama gelebilir — he is (o …dir) ya da he has (o …-miştir). Anlamı cümlenin devamı belli eder: He\'s tired. (yorgun = is) ama He\'s finished. (bitirdi = has).' },
        { kind: 'code', lines: ["I've seen this film. (= I have seen)", "She's finished. (= She has finished)", "He's tired. (= He is tired)"] },
      ],
      warnings: ['She have finished YANLIŞTIR — she ile has gelir: She has finished.'],
      examples: [
        { german: "I've lived here for three years.", turkish: 'Üç yıldır burada yaşıyorum.' },
        { german: 'She has called me.', turkish: 'Beni aradı. (bana ulaştı, sonuç bugünde)' },
      ],
      pronunciation: [],
    },
    {
      id: 'present-perfect.negatives',
      topicId: 'en.present-perfect',
      title: 'Olumsuz Cümle — haven\'t / hasn\'t',
      conceptIds: ['pp.neg.havent'],
      blocks: [
        { kind: 'paragraph', text: 'Olumsuzda have not kısalır: haven\'t; has not kısalır: hasn\'t. Yapı değişmez: özne + haven\'t/hasn\'t + V3. Örnek: I haven\'t seen that film. / She hasn\'t finished yet.' },
        { kind: 'code', lines: ["I haven't seen that film.", "She hasn't finished yet.", "He hasn't called me."] },
        { kind: 'callout', text: 'En yaygın hata: haven\'t see (V1) yazmaktır. have/has\'ten sonra HER ZAMAN V3 gelir: I haven\'t seen it. ✅' },
      ],
      warnings: ['I haven\'t see it. ❌ — doğrusu I haven\'t seen it. ✅'],
      examples: [
        { german: "I haven't seen that film.", turkish: 'O filmi görmedim. (hayatımda hiç)' },
        { german: "She hasn't finished yet.", turkish: 'Henüz bitirmedi.' },
      ],
      pronunciation: [],
    },
    {
      id: 'present-perfect.questions',
      topicId: 'en.present-perfect',
      title: 'Soru ve Kısa Cevaplar',
      conceptIds: ['pp.q.have-has', 'pp.q.short-answers'],
      blocks: [
        { kind: 'paragraph', text: 'Soruda Have/Has başa gelir: Have + özne + V3? / Has + özne + V3? Örnek: Have you seen this film? / Has she finished her homework? / Have you ever been to Germany?' },
        { kind: 'code', lines: ['Have you seen this film?', 'Have you ever been to Germany?', 'Has she finished her homework?'] },
        { kind: 'paragraph', text: 'Kısa cevaplar kalıptır: Yes, I have. / No, I haven\'t. / Yes, she has. / No, she hasn\'t. Kısa cevapta V3 tekrarlanmaz.' },
      ],
      warnings: ['Have you ever went…? ❌ — soruda da V3 gerekir: Have you ever been…? ✅'],
      examples: [
        { german: 'Have you ever been to Germany?', turkish: 'Hiç Almanya\'da bulundun mu?' },
        { german: 'Yes, I have. / No, I haven\'t.', turkish: 'Evet, bulundum. / Hayır, bulunmadım.' },
      ],
      pronunciation: [],
    },
    {
      id: 'present-perfect.v3',
      topicId: 'en.present-perfect',
      title: 'V3 — En Önemli Üçüncü Hâller',
      conceptIds: ['pp.v3.irregular-core', 'pp.v3.regular', 'pp.v3.v1v2v3'],
      blocks: [
        { kind: 'paragraph', text: 'Bu konunun sınavı V3\'tedir: have/has\'i herkes öğrenir, V3\'ü bilen kazanır. Önce en sık kullanılan düzensizleri ezberle: see → seen, know → known, be → been, go → gone, do → done, have → had.' },
        {
          kind: 'table',
          head: ['V1', 'V2', 'V3'],
          rows: [
            ['see', 'saw', 'seen'],
            ['go', 'went', 'gone'],
            ['write', 'wrote', 'written'],
            ['speak', 'spoke', 'spoken'],
            ['take', 'took', 'taken'],
            ['eat', 'ate', 'eaten'],
            ['know', 'knew', 'known'],
            ['come', 'came', 'come'],
            ['meet', 'met', 'met'],
            ['think', 'thought', 'thought'],
            ['find', 'found', 'found'],
            ['give', 'gave', 'given'],
          ],
        },
        { kind: 'paragraph', text: 'Düzenli fiillerde V3 kolaydır: work → worked, study → studied, finish → finished, visit → visited, start → started. V2\'yi (saw, went) ayrı ezberleme derdin yok: sorular V3\'ü ölçer, V2 yalnızca zinciri anlaman için tabloda durur.' },
        { kind: 'callout', text: 'read fiilinde üç hâl de aynı yazılır: read → read → read (okunuşu değişir: /riːd/ → /rɛd/).' },
      ],
      warnings: ['She has went ❌ → She has gone ✅ · I have wrote ❌ → I have written ✅ · He has took ❌ → He has taken ✅'],
      examples: [
        { german: 'I have written an email.', turkish: 'Bir e-posta yazdım.' },
        { german: 'She has gone home.', turkish: 'Eve gitti. (orada / yolda — sonuç bugünde)' },
      ],
      pronunciation: [],
    },
    {
      id: 'present-perfect.for-since',
      topicId: 'en.present-perfect',
      title: 'for / since — Süre mi, Başlangıç mı?',
      conceptIds: ['pp.for-since.rule', 'pp.for-since.states'],
      blocks: [
        { kind: 'paragraph', text: 'Bu bölüm konunun kalbidir. Kural tek cümle: for = süre (ne kadar zamandır), since = başlangıç (hangi noktadan beri). for three years (üç yıldır) bir SÜRE anlatır; since 2023 (2023\'ten beri) bir BAŞLANGIÇ noktası verir.' },
        {
          kind: 'table',
          head: ['for (süre)', 'since (başlangıç)'],
          rows: [
            ['for two hours', 'since 2023'],
            ['for three years', 'since Monday'],
            ['for five minutes', 'since January'],
            ['for a long time', 'since last year'],
            ['—', 'since I was a child'],
          ],
        },
        { kind: 'paragraph', text: 'Aynı cümleyi iki yolla kurabilirsin: I have lived here for three years. / I have lived here since 2023. İkisi de doğru; biri süreye, biri başlangıca odaklanır.' },
        { kind: 'code', lines: ['I have lived here for three years.', 'I have lived here since 2023.'] },
        { kind: 'callout', text: 'Hızlı tanıma: sayı + süre (three years, two hours) görürsen for; yıl/gün/ay/olay (2023, Monday, I was a child) görürsen since.' },
      ],
      warnings: ['since three years ❌ → for three years ✅ · for 2024 ❌ → since 2024 ✅'],
      examples: [
        { german: 'I have lived here for three years.', turkish: 'Üç yıldır burada yaşıyorum.' },
        { german: 'I have lived here since 2023.', turkish: '2023\'ten beri burada yaşıyorum.' },
      ],
      pronunciation: [],
    },
    {
      id: 'present-perfect.states',
      topicId: 'en.present-perfect',
      title: 'Süregelen Durumlar — know, live, work',
      conceptIds: ['pp.states.know-live'],
      blocks: [
        { kind: 'paragraph', text: 'Geçmişte başlayıp hâlâ doğru olan durumlar (tanımak, yaşamak, çalışmak, okumak) Present Perfect ister: I have known him for two years. / I have lived here since 2020. / I have studied English for three years. / She has worked here since January.' },
        { kind: 'code', lines: ['I have known him for two years.', 'I have lived here since 2020.', 'I have studied English for three years.', 'She has worked here since January.'] },
        { kind: 'callout', text: 'Bilinen hatanı düzelt: I know her since 2023. ❌ — durum geçmişte başladı ve hâlâ doğru, o yüzden: I have known her since 2023. ✅ Aynı anlam süreyle: I have known her for three years. ✅' },
      ],
      warnings: [],
      examples: [
        { german: 'I have known her since 2023.', turkish: 'Onu 2023\'ten beri tanıyorum.' },
        { german: 'I have studied English for three years.', turkish: 'Üç yıldır İngilizce çalışıyorum.' },
      ],
      pronunciation: [],
    },
    {
      id: 'present-perfect.ever-never',
      topicId: 'en.present-perfect',
      title: 'Deneyim — ever / never',
      conceptIds: ['pp.ever-never.use'],
      blocks: [
        { kind: 'paragraph', text: 'Hayat deneyimini sormak için Have you ever…? kalıbı kullanılır; ever "hayatında herhangi bir zamanda" demektir. Olumsuz deneyim: I have never… ("hiçbir zaman"). Örnek: Have you ever visited Germany? / I have never been to Poland. / Have you ever tried sushi?' },
        { kind: 'code', lines: ['Have you ever visited Germany?', 'I have never been to Poland.', 'Have you ever tried sushi?'] },
      ],
      warnings: [],
      examples: [
        { german: 'Have you ever travelled abroad?', turkish: 'Hiç yurt dışına çıktın mı?' },
        { german: 'I have never visited London.', turkish: 'Londra\'da hiç bulunmadım.' },
      ],
      pronunciation: [],
    },
    {
      id: 'present-perfect.markers',
      topicId: 'en.present-perfect',
      title: 'already / yet / just',
      conceptIds: ['pp.markers.already-yet-just'],
      blocks: [
        { kind: 'paragraph', text: 'Bu üç işaret kelime Present Perfectin en pratik göstergeleridir. already (zaten): I\'ve already finished. yet (henüz — olumsuz ve soruda, cümle sonunda): I haven\'t finished yet. / Have you finished yet? just (az önce): I\'ve just finished.' },
        { kind: 'code', lines: ["I've already finished.", "I haven't finished yet.", 'Have you finished yet?', "I've just finished."] },
        { kind: 'list', items: ['already → olumlu cümlede, finished ile: already finished', 'yet → cümlenin SONUNDA: finished yet / finished yet?', 'just → have/has ile V3 arasında: have just finished'] },
      ],
      warnings: [],
      examples: [
        { german: 'He has already eaten.', turkish: 'O çoktan yemek yedi.' },
        { german: "I haven't finished my homework yet.", turkish: 'Ödevimi henüz bitirmedim.' },
      ],
      pronunciation: [],
    },
    {
      id: 'present-perfect.vs-past',
      topicId: 'en.present-perfect',
      title: 'Present Perfect vs Simple Past',
      conceptIds: ['pp.vs-past.time-words', 'pp.vs-past.experience-count'],
      blocks: [
        { kind: 'paragraph', text: 'Küçük ama kritik ayrım: Present Perfect deneyimi / bugüne bağı anlatır (bitmemiş zaman); Simple Past bitmiş bir olayı bitmiş bir zamanda anlatır. I have visited Germany. (deneyim olarak) ↔ I visited Germany in 2024. (bitmiş olay, bitmiş zaman).' },
        { kind: 'code', lines: ['I have seen that film. ↔ I saw that film yesterday.', 'I have seen this film three times. ↔ I saw this film yesterday.'] },
        { kind: 'paragraph', text: 'Başlangıç kuralı: yesterday, last year, in 2023 gibi bitmiş zaman sözcükleri Simple Past ister. I have seen him yesterday. ❌ → I saw him yesterday. ✅ Sayı saymak (three times) ise deneyimdir: I have been to Germany three times. ✅' },
        { kind: 'callout', text: 'Bağlam her zaman tek anlam taşımaz; ama bu konuda zaman sözcüğü net verilir: yesterday görürsen saw, three times görürsen have seen.' },
      ],
      warnings: ['I went to Germany three times. (deneyim sayarken) → I have been to Germany three times. ✅'],
      examples: [
        { german: 'I have visited Germany.', turkish: 'Almanya\'da bulundum. (deneyim)' },
        { german: 'I visited Germany in 2024.', turkish: '2024\'te Almanya\'ya gittim. (bitmiş olay)' },
      ],
      pronunciation: [],
    },
    {
      id: 'present-perfect.mistakes',
      topicId: 'en.present-perfect',
      title: 'Sık Hatalar',
      conceptIds: ['pp.mistakes.v3', 'pp.mistakes.for-since'],
      blocks: [
        { kind: 'paragraph', text: 'Bu konudaki hataların neredeyse tamamı üç kutuya girer: yanlış V3, yanlış for/since ve yanlış yardımcı. Kutuları tek tek kapat.' },
        {
          kind: 'table',
          head: ['Yanlış ❌', 'Doğru ✅', 'Neden'],
          rows: [
            ["I haven't see it.", "I haven't seen it.", 'have/has sonrası V3'],
            ['She has went home.', 'She has gone home.', 'went V2\'dir, V3 gone'],
            ['I have wrote an email.', 'I have written an email.', 'wrote V2\'dir, V3 written'],
            ['He has took the bus.', 'He has taken the bus.', 'took V2\'dir, V3 taken'],
            ['I have lived here since three years.', 'I have lived here for three years.', 'süre → for'],
            ['I have studied English for 2024.', 'I have studied English since 2024.', 'başlangıç → since'],
            ['Have you ever went to Germany?', 'Have you ever been to Germany?', 'soruda da V3'],
            ["She haven't finished.", "She hasn't finished.", 'she ile has'],
            ['I know her since 2023.', 'I have known her since 2023.', 'süregelen durum → Present Perfect'],
            ['I have seen him yesterday.', 'I saw him yesterday.', 'yesterday → Simple Past'],
          ],
        },
      ],
      warnings: ['Hata kutunu kapatmadan yazmaya geçme: her kutudan en az bir düzeltme alıştırmasını doğru yap.'],
      examples: [],
      pronunciation: [],
    },
    {
      id: 'present-perfect.writing',
      topicId: 'en.present-perfect',
      title: 'Yazma Görevleri',
      conceptIds: [],
      blocks: [
        { kind: 'paragraph', text: 'İki yönlendirmeli yazma görevi seni cümle üretiminden kısa metne taşır. İlki "My Experience So Far" (8–10 cümle: en az 2 for/since, 2 düzensiz V3, 1 never, 1 already/yet). İkincisi "My English Learning Journey" (120–150 kelime: ne kadar süredir çalıştığın, neler öğrendiğin, neyin zor geldiği, neyi henüz geliştiremediğin).' },
        { kind: 'list', items: ['Önce kısa cümleleri doğru kur; sonra metne geç', 'Her cümlede have/has + V3 iskeletini kontrol et', 'for/since seçimini yazmadan önce sor: süre mi, başlangıç mı?'] },
      ],
      warnings: [],
      examples: [
        { german: 'I have studied English for three years.', turkish: 'Üç yıldır İngilizce çalışıyorum.' },
        { german: "I haven't improved my writing yet.", turkish: 'Yazmamı henüz geliştirmedim.' },
      ],
      pronunciation: [],
    },
  ],
  keyPoints: [
    'Formül: Özne + have/has + V3 (I have seen, She has finished).',
    'I/you/we/they → have; he/she/it → has. Kısaltmalar: I\'ve, she\'s, haven\'t, hasn\'t.',
    'Olumsuz: haven\'t / hasn\'t + V3. Soru: Have/Has + özne + V3? Kısa cevap: Yes, I have.',
    'have/has sonrası HER ZAMAN V3: haven\'t seen ✅, haven\'t see ❌.',
    'for = süre (for three years), since = başlangıç (since 2023).',
    'Süregelen durum: I have known her since 2023. (I know… since ❌)',
    'Deneyim: Have you ever…? / I have never… been to Poland.',
    'already (zaten), yet (henüz, sonda), just (az önce).',
    'yesterday / last year / in 2023 → Simple Past (I saw); three times / never → Present Perfect (I have seen).',
  ],
  recallQuestions: [
    { question: 'Present Perfect formülü nedir?', answer: 'Özne + have/has + V3 (örn. I have seen).' },
    { question: 'She ile have mi has mi gelir?', answer: 'has: She has finished.' },
    { question: 'for ile since farkı nedir?', answer: 'for süre (for three years), since başlangıç (since 2023).' },
    { question: 'Dün olan bitmiş olay hangi zamanla anlatılır?', answer: 'Simple Past: I saw him yesterday.' },
    { question: 'Hayatında hiç sorusu hangi kalıpla sorulur?', answer: 'Have you ever…? (örn. Have you ever been to Germany?)' },
  ],
};

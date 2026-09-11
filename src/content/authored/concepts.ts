/**
 * Kavram kaydı — "neyin öğretilmiş sayıldığının" tek kaynağı.
 *
 * Her alıştırma en az bir kavrama, her kavram bir ÖZET BÖLÜMÜNE ve dolayısıyla
 * tek bir kanonik KONUYA bağlanır (`curriculum/topics.ts`). Burada olmayan bir
 * kavram alıştırmada kullanılamaz (senkron HATA verir).
 *
 * ANCHOR: Her kavram, öğretildiği özet bölümünün metninde geçmesi GEREKEN kısa
 * bir dize taşır. Senkron sırasında bu dize `Konu Özetleri.md` içindeki kendi
 * bölümünde aranır; bulunamazsa kapsam hatası verilir. Böylece "alıştırma X
 * kavramını soruyor ama özet onu anlatmıyor" durumu kaynak metin değiştiğinde
 * de yakalanır.
 *
 * DURUM: `status: 'planned'` olan bir kavramı gerektiren alıştırma oturumlarda
 * gösterilmez (ön koşul kilidi). Varsayılan `learned`'dır.
 *
 * Eski gün tabanlı kimliklerden bu kimliklere eşleme: `curriculum/legacy.ts`.
 */

import type { Concept } from '../types.ts';
import { SECTION_BY_ID } from '../curriculum/topics.ts';

interface ConceptSpec {
  id: string;
  sectionId: string;
  label: string;
  /** Özet bölümü metninde geçmesi gereken dize. */
  anchor: string;
  prerequisites?: string[];
  status?: Concept['status'];
}

function build(specs: ConceptSpec[]): Array<Concept & { anchor: string }> {
  return specs.map((spec) => {
    const section = SECTION_BY_ID.get(spec.sectionId);
    if (!section) throw new Error(`Tanımsız özet bölümü: ${spec.sectionId} (${spec.id})`);
    return {
      id: spec.id,
      topicId: section.topicId,
      sectionId: spec.sectionId,
      label: spec.label,
      anchor: spec.anchor,
      ...(spec.prerequisites?.length ? { prerequisites: spec.prerequisites } : {}),
      ...(spec.status ? { status: spec.status } : {}),
    };
  });
}

export const CONCEPTS: Array<Concept & { anchor: string }> = build([
  /* ---------------------------------------------------------------- */
  /* Selamlaşma ve Tanışma                                            */
  /* ---------------------------------------------------------------- */
  { id: 'greetings.vorstellung.wie-heisst-du', sectionId: 'greetings.introduce', label: 'Wie heißt du? / Wie heißen Sie?', anchor: 'Wie heißt du?' },
  { id: 'greetings.vorstellung.wie-ist-dein-name', sectionId: 'greetings.introduce', label: 'Wie ist dein Name? / Ihr Name?', anchor: 'Wie ist dein Name?' },
  { id: 'greetings.vorstellung.wer-bist-du', sectionId: 'greetings.introduce', label: 'Wer bist du? / Wer sind Sie?', anchor: 'Wer bist du?' },
  { id: 'greetings.vorstellung.freut-mich', sectionId: 'greetings.introduce', label: 'Freut mich! / Ich habe mich gefreut!', anchor: 'Freut mich!' },
  { id: 'greetings.vorstellung.sich-vorstellen', sectionId: 'greetings.introduce', label: 'Kannst du dich bitte vorstellen?', anchor: 'Kannst du dich bitte vorstellen?' },
  { id: 'greetings.sprachen.welche', sectionId: 'greetings.hello', label: 'Welche Sprachen sprichst du?', anchor: 'Welche Sprachen sprichst du?' },
  { id: 'greetings.sprachen.antwort', sectionId: 'greetings.hello', label: 'Ich spreche Englisch, Türkisch ...', anchor: 'Ich spreche Englisch' },
  { id: 'greetings.selamlasma.hallo', sectionId: 'greetings.hello', label: 'Hallo!, Guten Morgen ...', anchor: 'Hallo!' },
  { id: 'greetings.nezaket.entschuldigung', sectionId: 'greetings.hello', label: 'Entschuldigung, Danke schön, Bitte', anchor: 'Entschuldigung' },
  { id: 'greetings.es-geht-mir', sectionId: 'greetings.wellbeing', label: 'Es geht mir gut = iyiyim', anchor: 'Es geht mir gut' },

  /* ---------------------------------------------------------------- */
  /* Kişisel Bilgiler                                                 */
  /* ---------------------------------------------------------------- */
  { id: 'personal-info.alter.wie-alt', sectionId: 'personal-info.age-origin', label: 'Wie alt bist du? / Wie alt sind Sie?', anchor: 'Wie alt bist du?' },
  { id: 'personal-info.herkunft.woher', sectionId: 'personal-info.age-origin', label: 'Woher kommst du? / Woher kommen Sie?', anchor: 'Woher kommst du?' },
  { id: 'personal-info.wohnort.wo-wohnst', sectionId: 'personal-info.age-origin', label: 'Wo wohnst du? / Wo wohnen Sie?', anchor: 'Wo wohnst du?' },
  { id: 'personal-info.herkunft.aus', sectionId: 'personal-info.age-origin', label: 'Ich komme aus ...', anchor: 'Ich komme aus Sakarya' },
  { id: 'personal-info.wohnort.in', sectionId: 'personal-info.age-origin', label: 'Ich wohne in ...', anchor: 'Ich wohne in Sakarya' },
  { id: 'personal-info.beruf.frage', sectionId: 'personal-info.job', label: 'Was machst du beruflich?', anchor: 'Was machst du beruflich?' },
  { id: 'personal-info.beruf.antwort-bin', sectionId: 'personal-info.job', label: 'Ich bin Student.', anchor: 'Ich bin Student' },
  { id: 'personal-info.beruf.als-bei', sectionId: 'personal-info.job', label: 'Ich arbeite als / bei ...', anchor: 'Ich arbeite als Lehrerin' },
  { id: 'personal-info.kontakt.email', sectionId: 'personal-info.contact', label: 'Wie ist deine E-Mail-Adresse?', anchor: 'Wie ist deine E-Mail-Adresse?' },
  { id: 'personal-info.kontakt.punkt', sectionId: 'personal-info.contact', label: 'Punkt (e-posta nokta)', anchor: 'Punkt' },
  { id: 'personal-info.kontakt.telefon', sectionId: 'personal-info.contact', label: 'Wie ist deine Telefonnummer?', anchor: 'Wie ist deine Telefonnummer?' },
  { id: 'personal-info.kontakt.antwort-telefon', sectionId: 'personal-info.contact', label: 'Meine Telefonnummer ist ...', anchor: 'Meine Telefonnummer ist' },
  { id: 'personal-info.formular.felder', sectionId: 'personal-info.form', label: 'Form alanları: Vorname, Nachname...', anchor: 'Vorname' },
  { id: 'personal-info.formular.familienstand', sectionId: 'personal-info.form', label: 'Familienstand: ledig', anchor: 'Familienstand' },
  { id: 'personal-info.formular.kinder', sectionId: 'personal-info.form', label: 'Ich habe keine Kinder.', anchor: 'Ich habe keine Kinder' },
  { id: 'personal-info.formular.heimat', sectionId: 'personal-info.form', label: 'Heimat: Türkei', anchor: 'Heimat' },
  { id: 'personal-info.leben.anlam', sectionId: 'personal-info.leben', label: 'leben = yaşamak', anchor: 'leben = yaşamak' },
  { id: 'personal-info.leben.cekim', sectionId: 'personal-info.leben', label: 'leben çekimi: ich lebe, du lebst ...', anchor: 'ich lebe', prerequisites: ['personal-info.leben.anlam'] },
  { id: 'personal-info.leben.wohnen-farki', sectionId: 'personal-info.leben', label: 'leben (genel) ↔ wohnen (somut ikamet) farkı', anchor: 'Ich wohne in Berlin', prerequisites: ['personal-info.wohnort.in', 'personal-info.herkunft.aus', 'personal-info.leben.cekim'] },
  { id: 'personal-info.form.alanlar', sectionId: 'personal-info.form', label: 'Form alanları: Familienname, Vorname, Heimatland, Geburtsort, Straße, Wohnort, Telefonnummer, Familienstand', anchor: 'der Familienname', prerequisites: ['personal-info.formular.felder'] },
  { id: 'personal-info.form.kinder', sectionId: 'personal-info.form', label: 'Kinder alanı (Ich habe keine Kinder.)', anchor: 'Ich habe keine Kinder', prerequisites: ['personal-info.formular.kinder'] },
  { id: 'personal-info.dogum.soru-cevap', sectionId: 'personal-info.birthplace', label: 'Wo bist du geboren? / Wo sind Sie geboren? / Ich bin in ... geboren.', anchor: 'Wo bist du geboren?', prerequisites: ['personal-info.wohnort.wo-wohnst'] },
  { id: 'personal-info.dogum.aciklik', sectionId: 'personal-info.birthplace', label: 'kommen aus / geboren sein / wohnen-leben ayrımı', anchor: 'kommen aus = nereli olduğun', prerequisites: ['personal-info.herkunft.woher', 'personal-info.wohnort.wo-wohnst', 'personal-info.dogum.soru-cevap', 'personal-info.leben.wohnen-farki'] },
  { id: 'personal-info.medeni-hal.ledig-verheiratet', sectionId: 'personal-info.marital', label: 'ledig (bekar) / verheiratet (evli)', anchor: 'ledig = bekar', prerequisites: ['personal-info.formular.familienstand'] },
  { id: 'personal-info.tanitma.model', sectionId: 'personal-info.self-intro', label: 'Genişletilmiş kendini tanıtma modeli', anchor: 'Ich bin ... Jahre alt', prerequisites: ['greetings.vorstellung.wie-heisst-du', 'personal-info.beruf.antwort-bin', 'personal-info.dogum.soru-cevap', 'personal-info.leben.wohnen-farki'] },
  { id: 'personal-info.tanitma.ornekler', sectionId: 'personal-info.self-intro', label: 'Örnek tanıtımlar (Mustafa, Nazar)', anchor: 'Ich heiße Nazar', prerequisites: ['personal-info.tanitma.model'] },

  /* ---------------------------------------------------------------- */
  /* Sayılar                                                          */
  /* ---------------------------------------------------------------- */
  { id: 'numbers.sayilar.onlu-sayilar', sectionId: 'numbers.teens-tens', label: '10–19 arası sayılar', anchor: 'dreizehn' },
  { id: 'numbers.sayilar.onluklar', sectionId: 'numbers.teens-tens', label: '20, 30 (dreißig)... 100', anchor: 'dreißig', prerequisites: ['numbers.sayilar.onlu-sayilar'] },
  { id: 'numbers.sayilar.bilesik', sectionId: 'numbers.teens-tens', label: 'Birler + und + Onlar (vierundfünfzig)', anchor: 'vierundfünfzig', prerequisites: ['numbers.sayilar.onluklar'] },
  { id: 'numbers.sayilar.yuzler', sectionId: 'numbers.hundreds', label: '100, 200 (hundert, zweihundert)', anchor: 'zweihundert', prerequisites: ['numbers.sayilar.onluklar'] },
  { id: 'numbers.sayilar.yuzler-bilesik', sectionId: 'numbers.hundreds', label: '205 = zweihundertfünf (und yok)', anchor: 'zweihundertfünf', prerequisites: ['numbers.sayilar.yuzler', 'numbers.sayilar.bilesik'] },
  { id: 'numbers.sayilar.bin', sectionId: 'numbers.hundreds', label: '1000 = tausend', anchor: 'tausend', prerequisites: ['numbers.sayilar.yuzler'] },

  /* ---------------------------------------------------------------- */
  /* Fiiller ve Çekim                                                 */
  /* ---------------------------------------------------------------- */
  { id: 'verbs.verben.sein', sectionId: 'verbs.conjugation', label: 'sein: ich bin, du bist ...', anchor: 'ich bin' },
  { id: 'verbs.verben.heissen', sectionId: 'verbs.conjugation', label: 'heißen: ich heiße ...', anchor: 'ich heiße' },
  { id: 'verbs.verben.kommen', sectionId: 'verbs.conjugation', label: 'kommen: ich komme ...', anchor: 'ich komme' },
  { id: 'verbs.verben.essen', sectionId: 'verbs.conjugation', label: 'essen: ich esse, du isst', anchor: 'ich esse' },
  { id: 'verbs.verben.sagen', sectionId: 'verbs.conjugation', label: 'sagen: ich sage ...', anchor: 'ich sage' },
  { id: 'verbs.verben.sprechen', sectionId: 'verbs.conjugation', label: 'sprechen: ich spreche, du sprichst', anchor: 'ich spreche' },
  { id: 'verbs.verben.kochen', sectionId: 'verbs.conjugation', label: 'kochen: ich koche ...', anchor: 'ich koche' },
  { id: 'verbs.haben.tablo', sectionId: 'verbs.haben-sein', label: 'haben çekimi: habe, hast, hat, haben, habt', anchor: 'haben — sahip olmak' },
  { id: 'verbs.sein.tekrar', sectionId: 'verbs.haben-sein', label: 'sein çekimi tekrar', anchor: 'sein çekimi (tekrar)', prerequisites: ['verbs.verben.sein'] },
  { id: 'verbs.haben.kein-ile', sectionId: 'verbs.haben-sein', label: 'haben + kein/keine kalıbı (pekiştirme)', anchor: 'Ich habe kein Geld', prerequisites: ['verbs.haben.tablo', 'articles.artikel.kein-keine'] },
  { id: 'verbs.refleksif.temel', sectionId: 'verbs.reflexive', label: 'refleksif zamirler: mich, dich, sich, uns, euch, sich', anchor: 'mich, dich, sich' },
  { id: 'verbs.sich-duschen', sectionId: 'verbs.reflexive', label: 'sich duschen = duş almak', anchor: 'sich duschen', prerequisites: ['verbs.refleksif.temel'] },
  { id: 'verbs.sich-ausruhen', sectionId: 'verbs.reflexive', label: 'sich ausruhen = dinlenmek', anchor: 'sich ausruhen', prerequisites: ['verbs.refleksif.temel'] },
  { id: 'verbs.refleksif-ayrilabilen', sectionId: 'verbs.reflexive', label: 'refleksif + ayrılabilen birlikte: ruhe mich ... aus', anchor: 'ruhe mich', prerequisites: ['verbs.sich-ausruhen', 'separable-verbs.ayrilabilen.kural'] },
  { id: 'verbs.fiil.kennen', sectionId: 'verbs.more-verbs', label: 'kennen = tanımak', anchor: 'kennen = tanımak' },
  { id: 'verbs.fiil.kennen-cekim', sectionId: 'verbs.more-verbs', label: 'kennen çekimi: ich kenne, du kennst ...', anchor: 'du kennst', prerequisites: ['verbs.fiil.kennen'] },
  { id: 'verbs.fiil.geben', sectionId: 'verbs.more-verbs', label: 'geben = vermek', anchor: 'geben = vermek' },
  { id: 'verbs.fiil.geben-gibt', sectionId: 'verbs.more-verbs', label: 'geben düzensiz: du gibst, er gibt (e → i)', anchor: 'du gibst', prerequisites: ['verbs.fiil.geben'] },
  { id: 'verbs.fiil.es-gibt-fark', sectionId: 'verbs.more-verbs', label: 'geben (vermek) ↔ es gibt (var) ayrımı', anchor: 'geben tek başına', prerequisites: ['akkusativ.esgibt.temel', 'verbs.fiil.geben'] },
  { id: 'verbs.fiil.stellen', sectionId: 'verbs.more-verbs', label: 'stellen = koymak', anchor: 'stellen = koymak' },

  /* ---------------------------------------------------------------- */
  /* Artikeller ve Olumsuzluk                                         */
  /* ---------------------------------------------------------------- */
  { id: 'articles.artikel.der-die-das-die-pl', sectionId: 'articles.definite-indefinite', label: 'der / die / das / die (Pl.)', anchor: 'der, die, das, die (Pl.)' },
  { id: 'articles.artikel.ein-eine', sectionId: 'articles.definite-indefinite', label: 'ein / eine', anchor: 'ein, eine' },
  { id: 'articles.artikel.cogul-belirsiz-yok', sectionId: 'articles.definite-indefinite', label: 'çoğulda belirsiz artikel yok', anchor: 'çoğulda belirsiz artikel yoktur' },
  { id: 'articles.artikel.was-ist-das', sectionId: 'articles.definite-indefinite', label: 'Was ist das? → Das ist ein/eine ...', anchor: 'Was ist das?' },
  { id: 'articles.wortschatz.nesneler', sectionId: 'articles.definite-indefinite', label: 'Temel nesne kelimeleri (der Vater, die Mutter ...)', anchor: 'der Vater' },
  { id: 'articles.artikel.kein-keine', sectionId: 'articles.chain', label: 'kein / keine', anchor: 'kein, keine', prerequisites: ['articles.artikel.ein-eine'] },
  { id: 'articles.artikel.mein-meine', sectionId: 'articles.chain', label: 'mein / meine', anchor: 'mein, meine', prerequisites: ['articles.artikel.kein-keine'] },
  { id: 'articles.artikel.dein-deine', sectionId: 'articles.chain', label: 'dein / deine', anchor: 'dein, deine', prerequisites: ['articles.artikel.kein-keine'] },
  { id: 'articles.artikel.zincir', sectionId: 'articles.chain', label: 'artikel zinciri: der/das → ein → kein → dein → mein', anchor: 'Artikel zinciri', prerequisites: ['articles.artikel.ein-eine', 'articles.artikel.kein-keine', 'articles.artikel.mein-meine', 'articles.artikel.dein-deine'] },
  { id: 'articles.artikel.wie-ist-dein', sectionId: 'articles.chain', label: 'Wie ist dein/deine ...?', anchor: 'Wie ist dein', prerequisites: ['articles.artikel.dein-deine', 'articles.artikel.mein-meine'] },
  { id: 'articles.olumsuzluk.nicht', sectionId: 'articles.negation', label: 'nicht: fiili/diğer bilgiyi olumsuzlar', anchor: 'fiili ya da zaman/yer bilgisini olumsuzlar', prerequisites: ['sentence-building.cumle.olumlu-yapi'] },
  { id: 'articles.olumsuzluk.kein-haben', sectionId: 'articles.negation', label: 'kein/keine: haben + nesneyi olumsuzlar', anchor: 'haben + isim kalıbında nesneyi olumsuzlamak', prerequisites: ['articles.artikel.kein-keine', 'personal-info.formular.kinder'] },
  { id: 'articles.olumsuzluk.donusum', sectionId: 'articles.negation', label: 'olumlu → olumsuz cümle dönüşümü', anchor: 'Sie geht heute nicht zur Schule', prerequisites: ['articles.olumsuzluk.nicht', 'articles.olumsuzluk.kein-haben'] },
  { id: 'articles.miktar.oda', sectionId: 'articles.plural', label: 'Zahl + Zimmer (çoğulu değişmez)', anchor: 'drei Zimmer' },
  { id: 'articles.cogul.genel', sectionId: 'articles.plural', label: 'genel ifadelerde çoğul isim artikelsiz', anchor: 'Genel ifadelerde' },
  { id: 'articles.cogul.umlaut', sectionId: 'articles.plural', label: 'Buch → Bücher (Umlaut çoğul, tekrar)', anchor: 'Bücher' },
  { id: 'articles.fiil.nicht-yeri', sectionId: 'articles.nicht-position', label: 'nicht cümlenin sonuna gider: Ich komme heute nicht.', anchor: 'Ich komme heute nicht.', prerequisites: ['articles.olumsuzluk.nicht'] },

  /* ---------------------------------------------------------------- */
  /* Zamirler ve İyelik                                               */
  /* ---------------------------------------------------------------- */
  { id: 'pronouns.iyelik.unser', sectionId: 'pronouns.unser-ihr', label: 'unser / unsere = bizim', anchor: 'unser / unsere' },
  { id: 'pronouns.iyelik.ihr', sectionId: 'pronouns.unser-ihr', label: 'ihr / ihre = onun (kadın) / onların', anchor: 'ihr / ihre' },
  { id: 'pronouns.iyelik.dativ-cogul', sectionId: 'pronouns.unser-ihr', label: 'iyelik + Dativ çoğul: meinen, deinen ...', anchor: 'meinen, deinen', prerequisites: ['places.mit-meinen-freunden'] },
  { id: 'pronouns.iyelik.sein-onun', sectionId: 'pronouns.possessive-table', label: 'sein / seine = onun (erkek/nötr sahip)', anchor: 'sein / seine', prerequisites: ['articles.artikel.mein-meine', 'articles.artikel.dein-deine'] },
  { id: 'pronouns.iyelik.zincir', sectionId: 'pronouns.possessive-table', label: 'iyelik zamiri zinciri: mein → dein → sein → ihr → unser → ihr', anchor: 'İyelik zamiri zinciri', prerequisites: ['pronouns.iyelik.sein-onun', 'pronouns.iyelik.unser', 'pronouns.iyelik.ihr'] },
  { id: 'pronouns.cumle.kalip', sectionId: 'pronouns.sentence', label: 'Cümle kalıbı: Kişi zamiri + Fiil + iyelik zamiri + isim', anchor: 'Kişi zamiri + Fiil + iyelik zamiri + isim', prerequisites: ['pronouns.iyelik.zincir', 'verbs.haben.tablo'] },
  { id: 'pronouns.zamir.der-er', sectionId: 'pronouns.article-to-pronoun', label: 'der → er', anchor: 'der → er' },
  { id: 'pronouns.zamir.das-es', sectionId: 'pronouns.article-to-pronoun', label: 'das → es', anchor: 'das → es' },
  { id: 'pronouns.zamir.die-sie', sectionId: 'pronouns.article-to-pronoun', label: 'die → sie', anchor: 'die → sie' },
  { id: 'pronouns.zamir.cumlede', sectionId: 'pronouns.article-to-pronoun', label: 'cümlede zamire geçiş: Der Schrank ist groß. Er ist grau.', anchor: 'Er ist grau.', prerequisites: ['pronouns.zamir.der-er'] },

  /* ---------------------------------------------------------------- */
  /* Cümle Kurma                                                      */
  /* ---------------------------------------------------------------- */
  { id: 'sentence-building.cumle.olumlu-yapi', sectionId: 'sentence-building.basic', label: 'Özne + Fiil + Nesne + diğer bilgiler', anchor: 'Özne + Fiil + Nesne' },
  { id: 'sentence-building.verben.machen', sectionId: 'sentence-building.basic', label: 'machen = yapmak', anchor: 'machen = yapmak', prerequisites: ['sentence-building.cumle.olumlu-yapi'] },
  { id: 'sentence-building.verben.gehen-zur', sectionId: 'sentence-building.basic', label: 'gehen + zur Schule / zur Arbeit', anchor: 'zur Schule', prerequisites: ['sentence-building.cumle.olumlu-yapi'] },
  { id: 'sentence-building.zaman.jeden-tag-heute', sectionId: 'sentence-building.basic', label: 'jeden Tag, heute, jeden Morgen, um ... Uhr', anchor: 'jeden Morgen', prerequisites: ['sentence-building.cumle.olumlu-yapi'] },
  { id: 'sentence-building.dizilisi.verb-ikinci', sectionId: 'sentence-building.v2', label: 'fiil her zaman ikinci sırada (V2)', anchor: 'fiil her zaman ikinci sırada' },
  { id: 'sentence-building.dizilisi.zaman-basta', sectionId: 'sentence-building.v2', label: 'zaman ifadesi başa geldiğinde fiil hemen arkasından gelir', anchor: 'Zaman ifadesi cümle başına', prerequisites: ['sentence-building.dizilisi.verb-ikinci'] },
  { id: 'sentence-building.baglac.und', sectionId: 'sentence-building.und-aber', label: 'und = ve (ekleme)', anchor: 'und = ve' },
  { id: 'sentence-building.baglac.aber', sectionId: 'sentence-building.und-aber', label: 'aber = ama (zıtlık)', anchor: 'aber = ama' },
  { id: 'sentence-building.dann.dann', sectionId: 'sentence-building.dann-danach', label: 'Dann gehe ich zur Schule.', anchor: 'Dann gehe ich zur Schule.', prerequisites: ['time.zaman.dann'] },
  { id: 'sentence-building.dann.danach', sectionId: 'sentence-building.dann-danach', label: 'Danach komme ich nach Hause.', anchor: 'Danach komme ich nach Hause.', prerequisites: ['time.zaman.dann'] },
  { id: 'sentence-building.dann.v2', sectionId: 'sentence-building.dann-danach', label: 'Danach başta → fiil ikinci sırada', anchor: 'Danach komme ich', prerequisites: ['sentence-building.dann.danach', 'sentence-building.dizilisi.zaman-basta'] },

  /* ---------------------------------------------------------------- */
  /* Soru Kurma                                                       */
  /* ---------------------------------------------------------------- */
  { id: 'questions.sorular.evet-hayir-yapi', sectionId: 'questions.yes-no', label: 'Fiil + Özne + ... ? yapısı', anchor: 'Fiil + Özne + Nesne + (diğer bilgiler) ?', prerequisites: ['sentence-building.cumle.olumlu-yapi'] },
  { id: 'questions.sorular.donusum', sectionId: 'questions.yes-no', label: 'cümle → soru dönüşümü', anchor: 'Cümle → Soru dönüşümü', prerequisites: ['questions.sorular.evet-hayir-yapi'] },
  { id: 'questions.sorular.ja-nein-cevap', sectionId: 'questions.yes-no', label: 'Ja / Nein tam cümle cevap', anchor: 'Soru + Ja/Nein cevabı', prerequisites: ['questions.sorular.donusum', 'articles.olumsuzluk.kein-haben'] },
  { id: 'questions.w-woerter', sectionId: 'questions.w-questions', label: 'W-soruları: Wer, Was, Wo, Woher, Wie, Wann, Welche', anchor: 'W-sorusunda fiil ikinci sıradadır' },

  /* ---------------------------------------------------------------- */
  /* Yer ve Yön                                                       */
  /* ---------------------------------------------------------------- */
  { id: 'places.kontraksiyon.zum', sectionId: 'places.prepositions', label: 'zum = zu + dem', anchor: 'zum = zu + dem' },
  { id: 'places.kontraksiyon.zur', sectionId: 'places.prepositions', label: 'zur = zu + der', anchor: 'zur = zu + der' },
  { id: 'places.kontraksiyon.im', sectionId: 'places.prepositions', label: 'im = in + dem', anchor: 'im = in + dem' },
  { id: 'places.kontraksiyon.ins', sectionId: 'places.prepositions', label: 'ins = in + das', anchor: 'ins = in + das' },
  { id: 'places.kontraksiyon.am', sectionId: 'places.prepositions', label: 'am = an + dem', anchor: 'am = an + dem' },
  { id: 'places.kontraksiyon.ans', sectionId: 'places.prepositions', label: 'ans = an + das (bonus)', anchor: 'ans = an + das' },
  { id: 'places.im-ins-farki', sectionId: 'places.prepositions', label: 'im (yerde) ↔ ins (yöne) farkı', anchor: 'im yerde kalmayı, ins ise bir yöne gitmeyi anlatır', prerequisites: ['places.kontraksiyon.im', 'places.kontraksiyon.ins'] },
  { id: 'places.nach-hause', sectionId: 'places.prepositions', label: 'nach Hause = eve (yöne)', anchor: 'nach Hause' },
  { id: 'places.zu-hause', sectionId: 'places.prepositions', label: 'zu Hause = evde', anchor: 'zu Hause' },
  { id: 'places.mit-dativ', sectionId: 'places.prepositions', label: 'mit + Dativ ister', anchor: 'mit her zaman Dativ ister' },
  { id: 'places.mit-meinen-freunden', sectionId: 'places.prepositions', label: 'mit meinen Freunden — Dativ çoğulda -n', anchor: 'meinen Freunden', prerequisites: ['places.mit-dativ'] },
  { id: 'places.der-den-dem', sectionId: 'places.prepositions', label: 'der (Nominativ) / den (Akkusativ) / dem (Dativ)', anchor: 'der / den / dem' },
  { id: 'places.in-akkusativ-yon', sectionId: 'places.prepositions', label: 'in + Akkusativ (yöne giderken): in den Park', anchor: 'in den Park', prerequisites: ['places.der-den-dem'] },
  { id: 'places.auf-dem', sectionId: 'places.prepositions', label: 'auf + dem (üzerinde)', anchor: 'auf dem' },
  { id: 'places.bei-der', sectionId: 'places.prepositions', label: 'bei + Dativ (yanında)', anchor: 'bei der Schule' },

  /* ---------------------------------------------------------------- */
  /* Sevmek ve Beğenmek                                               */
  /* ---------------------------------------------------------------- */
  { id: 'likes.mogen.cekim', sectionId: 'likes.moegen-gern', label: 'mögen çekimi: ich mag, du magst ...', anchor: 'ich mag' },
  { id: 'likes.gern.kullanim', sectionId: 'likes.moegen-gern', label: 'Fiil + gern kalıbı', anchor: 'Fiil + gern' },
  { id: 'likes.mogen-gern-farki', sectionId: 'likes.moegen-gern', label: 'mag (isim ister) ↔ gern (fiilden sonra gelir)', anchor: 'mag bir ismi doğrudan sever' },
  { id: 'likes.gefallen.anlam', sectionId: 'likes.gefallen', label: 'gefallen = beğenmek, hoşuna gitmek', anchor: 'gefallen = beğenmek, hoşuna gitmek' },
  { id: 'likes.gefallen.kalip', sectionId: 'likes.gefallen', label: 'Das gefällt mir. (hazır kalıp)', anchor: 'Das gefällt mir.', prerequisites: ['likes.gefallen.anlam'] },

  /* ---------------------------------------------------------------- */
  /* Essen und Trinken                                                */
  /* ---------------------------------------------------------------- */
  { id: 'food.yiyecek.kelimeler', sectionId: 'food.words-basic', label: 'das Ei, das Mehl, der Pfannkuchen, der Kuchen, das Brötchen, die Birne, der Saft', anchor: 'das Ei' },
  { id: 'food.essen.frage', sectionId: 'food.preferences', label: 'Was isst du gern? / Was essen Sie gern?', anchor: 'Was isst du gern?', prerequisites: ['likes.gern.kullanim'] },
  { id: 'food.essen.antwort', sectionId: 'food.preferences', label: 'Ich esse gern ...', anchor: 'Ich esse gern Pommes.', prerequisites: ['food.essen.frage'] },
  { id: 'food.essen.nicht-gern', sectionId: 'food.preferences', label: 'Ich esse ... nicht gern.', anchor: 'Nein, ich esse nicht gern Pizza.', prerequisites: ['food.essen.antwort'] },
  { id: 'food.essen.lieblingsessen', sectionId: 'food.preferences', label: 'Was ist dein/Ihr Lieblingsessen?', anchor: 'Was ist dein Lieblingsessen?' },
  { id: 'food.trinken.frage', sectionId: 'food.preferences', label: 'Was trinkst du gern? → Ich trinke gern ...', anchor: 'Was trinkst du gern?' },
  { id: 'food.trinken.lieblingsgetraenk', sectionId: 'food.preferences', label: 'Was ist dein/Ihr Lieblingsgetränk?', anchor: 'Was ist dein Lieblingsgetränk?' },
  { id: 'food.essen.kelimeler', sectionId: 'food.preferences', label: 'das Essen, die Pommes, die Pizza, der Reis', anchor: 'die Pommes — patates kızartması' },
  { id: 'food.getraenke.kelimeler', sectionId: 'food.preferences', label: 'der Orangensaft, der Apfelsaft, die Milch, die Limonade', anchor: 'der Orangensaft — portakal suyu' },
  { id: 'food.essen.hunger-durst', sectionId: 'food.preferences', label: 'Ich habe Hunger. / Ich habe Durst.', anchor: 'Ich habe Hunger.', prerequisites: ['verbs.haben.tablo'] },
  { id: 'food.yiyecek.temel', sectionId: 'food.words-more', label: 'das Fleisch, der Wein, das Obst, das Gemüse', anchor: 'Fleisch = et' },
  { id: 'food.yiyecek.zwiebel', sectionId: 'food.words-more', label: 'die Zwiebel, die Frühlingszwiebeln, die Knoblauchzehe', anchor: 'die Zwiebel = soğan' },
  { id: 'food.yiyecek.gurke', sectionId: 'food.words-more', label: 'die Salatgurke, die sauren Gurken', anchor: 'die Salatgurke = salatalık' },
  { id: 'food.yiyecek.essig', sectionId: 'food.words-more', label: 'der Essig = sirke', anchor: 'der Essig — sirke' },
  { id: 'food.yiyecek.oel-pfeffer', sectionId: 'food.words-more', label: 'das Öl = yağ, der Pfeffer = kara biber', anchor: 'das Öl = yağ' },
  { id: 'food.yiyecek.haehnchen', sectionId: 'food.words-more', label: 'das Hähnchen = tavuk, die Gemüsesuppe = sebze çorbası', anchor: 'das Hähnchen = tavuk' },
  { id: 'food.yiyecek.sahne', sectionId: 'food.words-more', label: 'die Sahne = krema, die Tomaten = domatesler, der Käse = peynir', anchor: 'die Sahne = krema' },
  { id: 'food.yiyecek.nuesse', sectionId: 'food.words-more', label: 'die Nüsse, die Rosinen, der Staubzucker', anchor: 'die Nüsse = kuruyemiş' },
  { id: 'food.suppe-teller', sectionId: 'food.meal-words', label: 'die Suppe = çorba, der Teller = tabak', anchor: 'die Suppe — çorba' },
  { id: 'food.lebensmittel', sectionId: 'food.meal-words', label: 'die Lebensmittel = gıda, yiyecekler (çoğul)', anchor: 'die Lebensmittel — gıda' },

  /* ---------------------------------------------------------------- */
  /* Alışveriş ve Fiyatlar                                            */
  /* ---------------------------------------------------------------- */
  { id: 'shopping.miktar.sise', sectionId: 'shopping.quantities', label: 'Zahl + Flasche(n) + Nomen: zwei Flaschen Wasser', anchor: 'zwei Flaschen' },
  { id: 'shopping.alisveris.kelime', sectionId: 'shopping.frequency', label: 'Alışveriş kelimeleri: kaufen, T-Shirt, Schuhe, Hose', anchor: 'kaufen' },
  { id: 'shopping.kaufen.frage', sectionId: 'shopping.frequency', label: 'Was kaufst du oft? / Was kaufen Sie oft?', anchor: 'Was kaufst du oft?', prerequisites: ['shopping.alisveris.kelime'] },
  { id: 'shopping.siklik.immer', sectionId: 'shopping.frequency', label: 'immer = her zaman', anchor: 'immer = her zaman' },
  { id: 'shopping.siklik.meistens', sectionId: 'shopping.frequency', label: 'meistens = çoğunlukla', anchor: 'meistens = çoğunlukla' },
  { id: 'shopping.siklik.oft', sectionId: 'shopping.frequency', label: 'oft = sık sık', anchor: 'oft = sık sık' },
  { id: 'shopping.siklik.manchmal', sectionId: 'shopping.frequency', label: 'manchmal = bazen', anchor: 'manchmal = bazen' },
  { id: 'shopping.siklik.nie', sectionId: 'shopping.frequency', label: 'nie = asla, hiç', anchor: 'nie = asla' },
  { id: 'shopping.siklik.cumlede', sectionId: 'shopping.frequency', label: 'sıklık kelimesi fiilden hemen sonra gelir', anchor: 'Ich kaufe immer Obst.', prerequisites: ['shopping.siklik.immer'] },
  { id: 'shopping.kaufen.pro-woche', sectionId: 'shopping.frequency', label: 'Ich kaufe pro Woche zweimal.', anchor: 'Ich kaufe pro Woche zweimal.' },
  { id: 'shopping.alisveris.einkaufszettel', sectionId: 'shopping.frequency', label: 'der Einkaufszettel = alışveriş listesi', anchor: 'der Einkaufszettel — alışveriş listesi' },
  { id: 'shopping.alisveris.einkaufswagen', sectionId: 'shopping.frequency', label: 'der Einkaufswagen = alışveriş arabası', anchor: 'der Einkaufswagen — alışveriş arabası' },
  { id: 'shopping.alisveris.ifadeler', sectionId: 'shopping.frequency', label: 'Natürlich. / Sonst noch etwas?', anchor: 'Sonst noch etwas?' },
  { id: 'shopping.miktar.flasche', sectionId: 'shopping.quantities', label: 'eine Flasche ... = bir şişe', anchor: 'eine Flasche Wasser — bir şişe su', prerequisites: ['shopping.miktar.sise'] },
  { id: 'shopping.miktar.packung', sectionId: 'shopping.quantities', label: 'eine Packung ... = bir paket', anchor: 'eine Packung Mehl — bir paket un' },
  { id: 'shopping.miktar.dose', sectionId: 'shopping.quantities', label: 'eine Dose ... = bir kutu (konserve)', anchor: 'eine Dose Tomaten — bir kutu domates' },
  { id: 'shopping.miktar.becher', sectionId: 'shopping.quantities', label: 'ein Becher ... = bir kutu (krema/yoğurt)', anchor: 'ein Becher Sahne — bir kutu krema' },
  { id: 'shopping.miktar.bund', sectionId: 'shopping.quantities', label: 'ein Bund ... = bir demet', anchor: 'ein Bund Frühlingszwiebeln' },
  { id: 'shopping.miktar.portion', sectionId: 'shopping.quantities', label: 'die Portion = porsiyon', anchor: 'eine Portion Gemüsesuppe' },
  { id: 'shopping.miktar.artikel', sectionId: 'shopping.quantities', label: 'ein/eine kabın artikeline göre seçilir', anchor: 'Kabın artikeli neyse', prerequisites: ['articles.artikel.ein-eine'] },
  { id: 'shopping.fiyat.kosten', sectionId: 'shopping.prices', label: 'kosten = fiyatında olmak', anchor: 'kosten = fiyatında olmak' },
  { id: 'shopping.fiyat.was-kostet', sectionId: 'shopping.prices', label: 'Was kostet das?', anchor: 'Was kostet das?', prerequisites: ['shopping.fiyat.kosten'] },
  { id: 'shopping.fiyat.antwort', sectionId: 'shopping.prices', label: 'Das kostet fünf Euro. / Das ist fünf Euro.', anchor: 'Das kostet fünf Euro.', prerequisites: ['numbers.sayilar.onlu-sayilar'] },
  { id: 'shopping.fiyat.wie-viel', sectionId: 'shopping.prices', label: 'Wie viel kostet ein Kilo ...?', anchor: 'Wie viel kostet ein Kilo Tomaten?' },
  { id: 'shopping.fiyat.teuer', sectionId: 'shopping.prices', label: 'teuer = pahalı', anchor: 'teuer = pahalı' },
  { id: 'shopping.brauchen.frage', sectionId: 'shopping.brauchen', label: 'Was brauchst du? / Was brauchen Sie?', anchor: 'Was brauchst du?' },
  { id: 'shopping.brauchen.antwort', sectionId: 'shopping.brauchen', label: 'Ich brauche ...', anchor: 'Ich brauche den Apfel.', prerequisites: ['shopping.brauchen.frage'] },
  { id: 'shopping.brauchen.kein', sectionId: 'shopping.brauchen', label: 'Nein, ich brauche kein ...', anchor: 'Nein, ich brauche kein Mehl.', prerequisites: ['articles.artikel.kein-keine'] },
  { id: 'shopping.wort.kosten', sectionId: 'shopping.prices', label: 'Es kostet nur 180 Euro im Monat.', anchor: 'Es kostet nur 180 Euro im Monat.', prerequisites: ['shopping.fiyat.kosten'] },
  { id: 'shopping.verkaufen', sectionId: 'shopping.buy-sell', label: 'verkaufen = satmak (kaufen ↔ verkaufen)', anchor: 'verkaufen — satmak' },

  /* ---------------------------------------------------------------- */
  /* Ev ve Mobilyalar                                                 */
  /* ---------------------------------------------------------------- */
  { id: 'home.ev-kelime', sectionId: 'home.rooms', label: 'Ev kelimeleri: die Wohnung, das Zimmer, der Balkon, der Garten', anchor: 'die Wohnung' },
  { id: 'home.ev.wohnung', sectionId: 'home.rooms', label: 'die Wohnung = ev, daire', anchor: 'die Wohnung — ev, daire' },
  { id: 'home.ev.bad', sectionId: 'home.rooms', label: 'das Bad = banyo', anchor: 'das Bad — banyo' },
  { id: 'home.ev.schlafzimmer', sectionId: 'home.rooms', label: 'das Schlafzimmer = yatak odası', anchor: 'das Schlafzimmer — yatak odası' },
  { id: 'home.ev.flur', sectionId: 'home.rooms', label: 'der Flur = koridor', anchor: 'der Flur — koridor' },
  { id: 'home.ev.kueche', sectionId: 'home.rooms', label: 'die Küche = mutfak', anchor: 'die Küche — mutfak' },
  { id: 'home.ev.wohnzimmer', sectionId: 'home.rooms', label: 'das Wohnzimmer = salon', anchor: 'das Wohnzimmer — salon' },
  { id: 'home.ev.toilette', sectionId: 'home.rooms', label: 'die Toilette / die Toiletten = tuvalet(ler)', anchor: 'die Toilette — tuvalet' },
  { id: 'home.moebel.genel', sectionId: 'home.furniture', label: 'die Möbel = mobilyalar', anchor: 'die Möbel — mobilyalar' },
  { id: 'home.moebel.schrank', sectionId: 'home.furniture', label: 'der Schrank = dolap', anchor: 'der Schrank — dolap' },
  { id: 'home.moebel.bett', sectionId: 'home.furniture', label: 'das Bett = yatak', anchor: 'das Bett — yatak' },
  { id: 'home.moebel.sofa', sectionId: 'home.furniture', label: 'das Sofa = kanepe', anchor: 'das Sofa — kanepe' },
  { id: 'home.moebel.sessel', sectionId: 'home.furniture', label: 'der Sessel = koltuk', anchor: 'der Sessel — koltuk' },
  { id: 'home.moebel.fernseher', sectionId: 'home.furniture', label: 'der Fernseher = televizyon', anchor: 'der Fernseher — televizyon' },
  { id: 'home.moebel.teppich-regal', sectionId: 'home.furniture', label: 'der Teppich = halı, das Regal = raf', anchor: 'der Teppich — halı' },
  { id: 'home.moebel.herd-bad', sectionId: 'home.furniture', label: 'der Herd = ocak, die Badewanne = küvet, das Waschbecken = lavabo', anchor: 'der Herd — ocak' },
  { id: 'home.moebel.auf-dem-sessel', sectionId: 'home.furniture', label: 'auf dem Sessel = koltukta', anchor: 'auf dem Sessel — koltukta', prerequisites: ['places.auf-dem'] },
  { id: 'home.evim.model', sectionId: 'home.my-home', label: 'Evimi anlatan A1 model metni', anchor: 'Wir haben eine Wohnung.' },
  { id: 'home.evim.toiletten', sectionId: 'home.my-home', label: 'Wir haben drei Toiletten.', anchor: 'Wir haben drei Toiletten.', prerequisites: ['home.ev.toilette'] },
  { id: 'home.evim.mein-zimmer', sectionId: 'home.my-home', label: 'Mein Zimmer ist grau / dunkel / klein.', anchor: 'Mein Zimmer ist grau.', prerequisites: ['adjectives.tarif.grau'] },
  { id: 'home.evim.schwester', sectionId: 'home.my-home', label: 'Meine Schwester hat auch ein Zimmer.', anchor: 'Meine Schwester hat auch ein Zimmer.', prerequisites: ['vocabulary.kelime.auch'] },
  { id: 'home.evim.ihr-zimmer', sectionId: 'home.my-home', label: 'Ihr Zimmer ist hell / groß.', anchor: 'Ihr Zimmer ist hell.', prerequisites: ['pronouns.iyelik.ihr'] },
  { id: 'home.evim.wohnzimmer', sectionId: 'home.my-home', label: 'Wir haben ein Wohnzimmer.', anchor: 'Wir haben ein Wohnzimmer.' },
  { id: 'home.evim.balkon', sectionId: 'home.my-home', label: 'Wir haben einen Balkon. Der Balkon ist groß.', anchor: 'Wir haben einen Balkon.', prerequisites: ['akkusativ.esgibt.akkusativ'] },
  { id: 'home.evim.kueche', sectionId: 'home.my-home', label: 'Wir haben eine Küche. Unsere Küche ist hell.', anchor: 'Unsere Küche ist hell.', prerequisites: ['pronouns.iyelik.unser'] },
  { id: 'home.evim.katze', sectionId: 'home.my-home', label: 'Unsere Katze hat auch ein Zimmer.', anchor: 'Unsere Katze hat auch ein Zimmer.', prerequisites: ['vocabulary.hayvanlar.kelime'] },
  { id: 'home.evim.karsilastirma-yok', sectionId: 'home.my-home', label: 'karşılaştırma yerine iki ayrı cümle', anchor: 'karşılaştırma eki' },
  { id: 'home.kalip.wir-haben', sectionId: 'home.patterns', label: 'Wir haben + isim', anchor: 'Wir haben + isim' },
  { id: 'home.kalip.ist-sifat', sectionId: 'home.patterns', label: '... ist + sıfat', anchor: 'ist + sıfat' },
  { id: 'home.kalip.hat-auch', sectionId: 'home.patterns', label: '... hat auch + isim', anchor: 'hat auch + isim' },
  { id: 'home.kalip.es-gibt', sectionId: 'home.patterns', label: 'Es gibt + isim', anchor: 'Es gibt + isim', prerequisites: ['akkusativ.esgibt.temel'] },
  { id: 'home.kalip.sira', sectionId: 'home.patterns', label: 'evi anlatma sırası', anchor: 'kaç oda/tuvalet var' },
  { id: 'home.wort.badewanne', sectionId: 'home.furniture', label: 'die Badewanne = küvet', anchor: 'die Badewanne = küvet' },
  { id: 'home.wort.zimmer-satz', sectionId: 'home.my-home', label: 'Das Zimmer ist zehn Quadratmeter groß.', anchor: 'zehn Quadratmeter groß', prerequisites: ['adjectives.tarif.gross-klein'] },
  { id: 'home.fenster-vorhang', sectionId: 'home.furniture', label: 'das Fenster = pencere, der Vorhang = perde', anchor: 'das Fenster — pencere' },
  { id: 'home.giessen', sectionId: 'home.chores', label: 'gießen = sulamak: Meine Mutter gießt die Blumen.', anchor: 'Meine Mutter gießt die Blumen.' },
  { id: 'home.spuelen', sectionId: 'home.chores', label: 'spülen = (bulaşık) yıkamak: Ich spüle das Geschirr.', anchor: 'Ich spüle das Geschirr.' },
  { id: 'home.reparieren', sectionId: 'home.chores', label: 'reparieren: Mein Vater repariert das Fenster.', anchor: 'Mein Vater repariert das Fenster.', prerequisites: ['vocabulary.reparieren'] },

  /* ---------------------------------------------------------------- */
  /* Sıfatlar                                                         */
  /* ---------------------------------------------------------------- */
  { id: 'adjectives.sifat.yuklem', sectionId: 'adjectives.endings', label: 'sein + sıfat → ek almaz', anchor: 'sein fiilinden sonra sıfat ek almaz' },
  { id: 'adjectives.sifat.ein-notr', sectionId: 'adjectives.endings', label: 'ein + nötr isim + sıfat → -es', anchor: 'ein neues T-Shirt' },
  { id: 'adjectives.sifat.cogul-artikelsiz', sectionId: 'adjectives.endings', label: 'artikelsiz çoğul + sıfat → -e', anchor: 'schwarze Schuhe' },
  { id: 'adjectives.tarif.hell', sectionId: 'adjectives.describe', label: 'hell = açık, ferah', anchor: 'hell = açık' },
  { id: 'adjectives.tarif.dunkel', sectionId: 'adjectives.describe', label: 'dunkel = koyu', anchor: 'dunkel = koyu' },
  { id: 'adjectives.tarif.breit', sectionId: 'adjectives.describe', label: 'breit = geniş', anchor: 'breit = geniş' },
  { id: 'adjectives.tarif.schmal', sectionId: 'adjectives.describe', label: 'schmal = dar', anchor: 'schmal = dar' },
  { id: 'adjectives.tarif.kuehl', sectionId: 'adjectives.describe', label: 'kühl = serin', anchor: 'kühl = serin' },
  { id: 'adjectives.tarif.grau', sectionId: 'adjectives.describe', label: 'grau = gri', anchor: 'grau = gri' },
  { id: 'adjectives.tarif.gross-klein', sectionId: 'adjectives.describe', label: 'karşıt çiftler: hell–dunkel, groß–klein, breit–schmal', anchor: 'groß — klein' },
  { id: 'adjectives.tarif.sein-sifat', sectionId: 'adjectives.describe', label: 'sein + sıfat → ek almaz (tekrar)', anchor: 'hiçbir ek almaz', prerequisites: ['adjectives.sifat.yuklem'] },

  /* ---------------------------------------------------------------- */
  /* Akkusativ                                                        */
  /* ---------------------------------------------------------------- */
  { id: 'akkusativ.esgibt.temel', sectionId: 'akkusativ.es-gibt', label: 'es gibt = var', anchor: 'Es gibt' },
  { id: 'akkusativ.esgibt.akkusativ', sectionId: 'akkusativ.es-gibt', label: 'es gibt + Akkusativ (der → einen)', anchor: 'es gibt her zaman Akkusativ ister', prerequisites: ['akkusativ.esgibt.temel'] },
  { id: 'akkusativ.esgibt.genel-cogul', sectionId: 'akkusativ.es-gibt', label: 'genel ifadede çoğul isim artikelsiz kullanılır', anchor: 'Genel ve sayılamayan durumlarda' },
  { id: 'akkusativ.nedir', sectionId: 'akkusativ.basics', label: 'Akkusativ = nesne hâli (neyi? kimi?)', anchor: 'Akkusativ = nesne hâli' },
  { id: 'akkusativ.der-den', sectionId: 'akkusativ.basics', label: 'der → den (eril nesne)', anchor: 'der → den', prerequisites: ['akkusativ.nedir'] },
  { id: 'akkusativ.ein-einen', sectionId: 'akkusativ.basics', label: 'ein → einen (eril nesne)', anchor: 'ein → einen', prerequisites: ['akkusativ.nedir'] },
  { id: 'akkusativ.die-das', sectionId: 'akkusativ.basics', label: 'die / das / çoğul Akkusativ\'te değişmez', anchor: 'die ve das değişmez', prerequisites: ['akkusativ.nedir'] },
  { id: 'akkusativ.sein-yok', sectionId: 'akkusativ.basics', label: 'sein Akkusativ istemez: Das ist ein Kuchen.', anchor: 'sein Akkusativ istemez', prerequisites: ['akkusativ.nedir'] },
  { id: 'akkusativ.mein-meinen', sectionId: 'akkusativ.possessive', label: 'mein → meinen, dein → deinen', anchor: 'mein → meinen', prerequisites: ['akkusativ.ein-einen', 'articles.artikel.mein-meine'] },
  { id: 'akkusativ.kein-keinen', sectionId: 'akkusativ.possessive', label: 'kein → keinen', anchor: 'kein → keinen', prerequisites: ['akkusativ.ein-einen', 'articles.artikel.kein-keine'] },

  /* ---------------------------------------------------------------- */
  /* Saatler ve Zaman                                                 */
  /* ---------------------------------------------------------------- */
  { id: 'time.zaman.um-uhr', sectionId: 'time.expressions', label: 'um + saat', anchor: 'um 7 Uhr' },
  { id: 'time.zaman.am', sectionId: 'time.expressions', label: 'am Morgen / am Abend / am Wochenende', anchor: 'am Morgen', prerequisites: ['places.kontraksiyon.am'] },
  { id: 'time.zaman.im-mevsim', sectionId: 'time.expressions', label: 'im Winter / im Sommer', anchor: 'im Winter', prerequisites: ['places.kontraksiyon.im'] },
  { id: 'time.zaman.dann', sectionId: 'time.expressions', label: 'dann / danach = sonra', anchor: 'Dann' },
  { id: 'time.zaman.morgen-cift-anlam', sectionId: 'time.expressions', label: 'morgen (yarın, küçük harf) ↔ der Morgen (sabah, isim)', anchor: 'morgen küçük harfle' },
  { id: 'time.soru.wie-spaet', sectionId: 'time.question', label: 'Wie spät ist es? = saat kaç?', anchor: 'Wie spät ist es?' },
  { id: 'time.soru.wie-viel', sectionId: 'time.question', label: 'Wie viel Uhr ist es? = saat kaç?', anchor: 'Wie viel Uhr ist es?', prerequisites: ['time.soru.wie-spaet'] },
  { id: 'time.soru.einheiten', sectionId: 'time.question', label: 'die Uhr / die Stunde / die Minute / die Sekunde', anchor: 'die Stunde = saat' },
  { id: 'time.resmi.kural', sectionId: 'time.official', label: 'resmî saat kalıbı: saat + Uhr + dakika', anchor: 'resmî saat = saat + Uhr + dakika', prerequisites: ['numbers.sayilar.onlu-sayilar'] },
  { id: 'time.resmi.ornek', sectionId: 'time.official', label: 'Es ist acht Uhr zwanzig.', anchor: 'Es ist acht Uhr zwanzig.', prerequisites: ['time.resmi.kural'] },
  { id: 'time.gunluk.nach-vor', sectionId: 'time.everyday', label: 'zwanzig nach fünf / zwanzig vor vier', anchor: 'zwanzig nach fünf', prerequisites: ['time.soru.einheiten'] },
  { id: 'time.gunluk.viertel', sectionId: 'time.everyday', label: 'Viertel nach sechs / Viertel vor neun', anchor: 'Viertel nach sechs', prerequisites: ['time.gunluk.nach-vor'] },
  { id: 'time.halb.anlam', sectionId: 'time.halb', label: 'halb acht = 07.30 (bir sonrakini söyler)', anchor: 'halb acht = 07.30', prerequisites: ['time.soru.einheiten'] },
  { id: 'time.halb.ornek', sectionId: 'time.halb', label: 'Es ist halb acht.', anchor: 'Es ist halb acht.', prerequisites: ['time.halb.anlam'] },
  { id: 'time.um.kural', sectionId: 'time.um', label: 'um sieben Uhr = saat yedide', anchor: 'um sieben Uhr = saat yedide', prerequisites: ['time.zaman.um-uhr'] },
  { id: 'time.um.ornek', sectionId: 'time.um', label: 'Ich stehe um sieben Uhr auf.', anchor: 'Ich stehe um sieben Uhr auf.', prerequisites: ['time.um.kural', 'separable-verbs.verb.aufstehen'] },

  /* ---------------------------------------------------------------- */
  /* Mein Tag                                                         */
  /* ---------------------------------------------------------------- */
  { id: 'daily-routine.gunluk.okul-is', sectionId: 'daily-routine.everyday-sentences', label: 'zur Schule / zur Arbeit gitmek', anchor: 'Okul ve iş', prerequisites: ['sentence-building.verben.gehen-zur'] },
  { id: 'daily-routine.gunluk.kahve-spor', sectionId: 'daily-routine.everyday-sentences', label: 'Kaffee trinken, Sport machen', anchor: 'Kaffee trinken, Sport machen', prerequisites: ['sentence-building.cumle.olumlu-yapi'] },
  { id: 'daily-routine.gunluk.kitap-okuma', sectionId: 'daily-routine.everyday-sentences', label: 'ein Buch lesen', anchor: 'ein Buch lesen', prerequisites: ['sentence-building.cumle.olumlu-yapi'] },
  { id: 'daily-routine.gunluk.mini-dialog', sectionId: 'daily-routine.everyday-sentences', label: 'mini diyalog: soru + Ja/Nein cevap', anchor: 'Mini diyalog', prerequisites: ['questions.sorular.ja-nein-cevap'] },
  { id: 'daily-routine.gunluk-rutin', sectionId: 'daily-routine.routine-verbs', label: 'Günlük rutin fiilleri: frühstücken, putzen, gießen, hören', anchor: 'frühstücken' },
  { id: 'daily-routine.sabah.gesicht', sectionId: 'daily-routine.morning', label: 'Ich wasche mein Gesicht.', anchor: 'Ich wasche mein Gesicht.' },
  { id: 'daily-routine.sabah.zaehne', sectionId: 'daily-routine.morning', label: 'Ich putze meine Zähne.', anchor: 'Ich putze meine Zähne.' },
  { id: 'daily-routine.sabah.duschen', sectionId: 'daily-routine.morning', label: 'Ich dusche. (kısa biçim)', anchor: 'Ich dusche.', prerequisites: ['verbs.sich-duschen'] },
  { id: 'daily-routine.sabah.fruehstueck-fark', sectionId: 'daily-routine.morning', label: 'Frühstück machen (hazırlamak) ↔ frühstücken (etmek)', anchor: 'Frühstück machen = kahvaltı hazırlamak', prerequisites: ['daily-routine.gunluk-rutin'] },
  { id: 'daily-routine.sabah.fruehstuecken', sectionId: 'daily-routine.morning', label: 'Ich frühstücke.', anchor: 'Ich frühstücke.', prerequisites: ['daily-routine.sabah.fruehstueck-fark'] },
  { id: 'daily-routine.gun.schule', sectionId: 'daily-routine.day', label: 'Ich gehe zur Schule.', anchor: 'Ich gehe zur Schule.', prerequisites: ['sentence-building.verben.gehen-zur'] },
  { id: 'daily-routine.gun.lernen', sectionId: 'daily-routine.day', label: 'Ich lerne Deutsch und Mathe in der Schule.', anchor: 'Ich lerne Deutsch und Mathe in der Schule.' },
  { id: 'daily-routine.gun.mittag', sectionId: 'daily-routine.day', label: 'Ich esse zu Mittag.', anchor: 'Ich esse zu Mittag.', prerequisites: ['verbs.verben.essen'] },
  { id: 'daily-routine.gun.hausaufgaben', sectionId: 'daily-routine.day', label: 'Ich mache meine Hausaufgaben.', anchor: 'Ich mache meine Hausaufgaben.', prerequisites: ['sentence-building.verben.machen'] },
  { id: 'daily-routine.gun.freunde', sectionId: 'daily-routine.day', label: 'Ich spiele mit meinen Freunden.', anchor: 'Ich spiele mit meinen Freunden.', prerequisites: ['places.mit-meinen-freunden'] },
  { id: 'daily-routine.aksam.abendessen', sectionId: 'daily-routine.evening', label: 'Ich esse um neun Uhr Abendessen.', anchor: 'Ich esse um neun Uhr Abendessen.', prerequisites: ['time.zaman.um-uhr'] },
  { id: 'daily-routine.aksam.ausziehen', sectionId: 'daily-routine.evening', label: 'Ich ziehe mich aus.', anchor: 'Ich ziehe mich aus.', prerequisites: ['separable-verbs.verb.ausziehen'] },
  { id: 'daily-routine.aksam.buch', sectionId: 'daily-routine.evening', label: 'Ich lese ein Buch.', anchor: 'Ich lese ein Buch.', prerequisites: ['daily-routine.gunluk.kitap-okuma'] },
  { id: 'daily-routine.aksam.bett', sectionId: 'daily-routine.evening', label: 'Danach gehe ich ins Bett.', anchor: 'Danach gehe ich ins Bett.', prerequisites: ['places.kontraksiyon.ins'] },
  { id: 'daily-routine.aksam.spazieren', sectionId: 'daily-routine.evening', label: 'spazieren gehen = yürüyüş yapmak', anchor: 'spazieren gehen = yürüyüş yapmak' },
  { id: 'daily-routine.tam.model', sectionId: 'daily-routine.full', label: 'Mein Tag kanonik A1 modeli (16 cümle)', anchor: 'Ich wache um sieben Uhr auf.', prerequisites: ['daily-routine.sabah.zaehne', 'daily-routine.gun.hausaufgaben', 'daily-routine.aksam.bett'] },
  { id: 'daily-routine.tam.sablon', sectionId: 'daily-routine.full', label: 'Mein Tag kopya iskeleti', anchor: 'Ich stehe um ... Uhr auf.', prerequisites: ['daily-routine.tam.model'] },
  { id: 'daily-routine.tam.uretim', sectionId: 'daily-routine.full', label: 'Erzähle deinen Tag. (serbest üretim)', anchor: 'Erzähle deinen Tag.', prerequisites: ['daily-routine.tam.sablon'] },
  { id: 'daily-routine.plans', sectionId: 'daily-routine.plans', label: 'Yarın planı: Ich will um sieben Uhr aufstehen.', anchor: 'Ich will um sieben Uhr aufstehen.', prerequisites: ['modal-verbs.trennbar', 'time.um.kural'] },

  /* ---------------------------------------------------------------- */
  /* Ayrılabilen Fiiller                                              */
  /* ---------------------------------------------------------------- */
  { id: 'separable-verbs.ayrilabilen.kural', sectionId: 'separable-verbs.rule', label: 'ayrılabilen fiil kuralı: önek cümlenin sonuna gider', anchor: 'önek cümlenin en sonuna gider' },
  { id: 'separable-verbs.aufstehen', sectionId: 'separable-verbs.rule', label: 'aufstehen = kalkmak', anchor: 'aufstehen = kalkmak', prerequisites: ['separable-verbs.ayrilabilen.kural'] },
  { id: 'separable-verbs.aufraeumen', sectionId: 'separable-verbs.rule', label: 'aufräumen = toplamak/düzenlemek', anchor: 'aufräumen = toplamak', prerequisites: ['separable-verbs.ayrilabilen.kural'] },
  { id: 'separable-verbs.zurueckkommen', sectionId: 'separable-verbs.rule', label: 'zurückkommen = geri dönmek', anchor: 'zurückkommen = geri dönmek', prerequisites: ['separable-verbs.ayrilabilen.kural'] },
  { id: 'separable-verbs.fiil.anrufen', sectionId: 'separable-verbs.anrufen', label: 'anrufen = telefonla aramak', anchor: 'anrufen = (telefonla) aramak' },
  { id: 'separable-verbs.fiil.anrufen-ayrilabilen', sectionId: 'separable-verbs.anrufen', label: 'anrufen ayrılabilen: Ich rufe dich an.', anchor: 'Ich rufe dich an.', prerequisites: ['separable-verbs.ayrilabilen.kural', 'separable-verbs.fiil.anrufen'] },
  { id: 'separable-verbs.trennbar.kural', sectionId: 'separable-verbs.what', label: 'ayrılabilen fiil kuralı: kök 2. sırada, önek sonda', anchor: 'kök ikinci sırada, önek en sonda', prerequisites: ['separable-verbs.ayrilabilen.kural'] },
  { id: 'separable-verbs.trennbar.ornek', sectionId: 'separable-verbs.what', label: 'Ich stehe um 7 Uhr auf.', anchor: 'Ich stehe um 7 Uhr auf.', prerequisites: ['separable-verbs.trennbar.kural'] },
  { id: 'separable-verbs.trennbar.saat-basta', sectionId: 'separable-verbs.what', label: 'Um 7 Uhr stehe ich auf.', anchor: 'Um 7 Uhr stehe ich auf.', prerequisites: ['separable-verbs.trennbar.kural', 'sentence-building.dizilisi.zaman-basta'] },
  { id: 'separable-verbs.verb.aufstehen', sectionId: 'separable-verbs.core', label: 'aufstehen = yataktan kalkmak', anchor: 'aufstehen = yataktan kalkmak', prerequisites: ['separable-verbs.aufstehen'] },
  { id: 'separable-verbs.verb.aufwachen', sectionId: 'separable-verbs.core', label: 'aufwachen = uyanmak', anchor: 'aufwachen = uyanmak', prerequisites: ['separable-verbs.trennbar.kural'] },
  { id: 'separable-verbs.verb.uyanma-farki', sectionId: 'separable-verbs.core', label: 'aufwachen (göz açmak) ↔ aufstehen (kalkmak) farkı', anchor: 'gözlerini açmak', prerequisites: ['separable-verbs.verb.aufstehen', 'separable-verbs.verb.aufwachen'] },
  { id: 'separable-verbs.verb.anziehen', sectionId: 'separable-verbs.core', label: 'sich anziehen = giyinmek', anchor: 'sich anziehen = giyinmek', prerequisites: ['separable-verbs.trennbar.kural'] },
  { id: 'separable-verbs.verb.ausziehen', sectionId: 'separable-verbs.core', label: 'sich ausziehen = üstünü çıkarmak', anchor: 'sich ausziehen = üstünü çıkarmak', prerequisites: ['separable-verbs.verb.anziehen'] },
  { id: 'separable-verbs.verb.anziehen-chunk', sectionId: 'separable-verbs.core', label: 'Ich ziehe mich an. (hazır kalıp)', anchor: 'Ich ziehe mich an.', prerequisites: ['separable-verbs.verb.anziehen', 'verbs.refleksif.temel'] },
  { id: 'separable-verbs.verb.einkaufen', sectionId: 'separable-verbs.core', label: 'einkaufen = alışveriş yapmak', anchor: 'einkaufen = alışveriş yapmak', prerequisites: ['separable-verbs.trennbar.kural'] },
  { id: 'separable-verbs.verb.einkaufen-cumle', sectionId: 'separable-verbs.core', label: 'Ich kaufe ein.', anchor: 'Ich kaufe ein.', prerequisites: ['separable-verbs.verb.einkaufen'] },
  { id: 'separable-verbs.verb.aufraeumen', sectionId: 'separable-verbs.core', label: 'aufräumen = odayı toplamak', anchor: 'aufräumen = odayı toplamak', prerequisites: ['separable-verbs.aufraeumen'] },
  { id: 'separable-verbs.verb.aufraeumen-cumle', sectionId: 'separable-verbs.core', label: 'Ich räume auf.', anchor: 'Ich räume auf.', prerequisites: ['separable-verbs.verb.aufraeumen'] },
  { id: 'separable-verbs.verb.anrufen', sectionId: 'separable-verbs.core', label: 'anrufen = telefonla aramak', anchor: 'anrufen = telefonla aramak', prerequisites: ['separable-verbs.fiil.anrufen'] },
  { id: 'separable-verbs.verb.anrufen-cumle', sectionId: 'separable-verbs.core', label: 'Ich rufe dich an.', anchor: 'Ich rufe dich an.', prerequisites: ['separable-verbs.verb.anrufen', 'separable-verbs.fiil.anrufen-ayrilabilen'] },
  { id: 'separable-verbs.verb.fernsehen', sectionId: 'separable-verbs.core', label: 'fernsehen = televizyon izlemek', anchor: 'fernsehen = televizyon izlemek', prerequisites: ['separable-verbs.trennbar.kural'] },
  { id: 'separable-verbs.verb.fernsehen-cumle', sectionId: 'separable-verbs.core', label: 'Ich sehe am Abend fern.', anchor: 'Ich sehe am Abend fern.', prerequisites: ['separable-verbs.verb.fernsehen'] },
  { id: 'separable-verbs.verb.aufhoeren', sectionId: 'separable-verbs.core', label: 'aufhören = bırakmak', anchor: 'aufhören = bırakmak', prerequisites: ['separable-verbs.trennbar.kural'] },
  { id: 'separable-verbs.verb.vorbereiten', sectionId: 'separable-verbs.core', label: 'vorbereiten = hazırlamak', anchor: 'vorbereiten = hazırlamak', prerequisites: ['separable-verbs.trennbar.kural'] },
  { id: 'separable-verbs.verb.einladen', sectionId: 'separable-verbs.core', label: 'einladen = davet etmek', anchor: 'einladen = davet etmek', prerequisites: ['separable-verbs.trennbar.kural'] },
  { id: 'separable-verbs.verb.mitbringen', sectionId: 'separable-verbs.core', label: 'mitbringen = beraberinde getirmek', anchor: 'mitbringen = beraberinde getirmek', prerequisites: ['separable-verbs.trennbar.kural'] },
  { id: 'separable-verbs.verb.aufsetzen', sectionId: 'separable-verbs.core', label: 'aufsetzen = takmak', anchor: 'aufsetzen = takmak', prerequisites: ['separable-verbs.trennbar.kural'] },
  { id: 'separable-verbs.verb.zurueckkommen', sectionId: 'separable-verbs.core', label: 'zurückkommen = geri dönmek', anchor: 'zurückkommen = geri dönmek', prerequisites: ['separable-verbs.zurueckkommen'] },
  { id: 'separable-verbs.verb.achtgeben', sectionId: 'separable-verbs.core', label: 'achtgeben = dikkat etmek', anchor: 'achtgeben = dikkat etmek', prerequisites: ['separable-verbs.trennbar.kural'] },
  { id: 'separable-verbs.verb.gern-sorular', sectionId: 'separable-verbs.core', label: 'Was machst du gern? / Wann stehst du auf?', anchor: 'Was machst du gern?', prerequisites: ['likes.gern.kullanim'] },
  { id: 'separable-verbs.karsi.besuchen', sectionId: 'separable-verbs.compare', label: 'besuchen ayrılmaz: Ich besuche dich.', anchor: 'Ich besuche dich.', prerequisites: ['separable-verbs.verb.anrufen-cumle'] },
  { id: 'separable-verbs.karsi.ipucu', sectionId: 'separable-verbs.compare', label: 'ayrılmayan başlangıçlar: be-, emp-, er-, ver-, zer-', anchor: 'be-, emp-, er-, ver-, zer-', prerequisites: ['separable-verbs.karsi.besuchen'] },
  { id: 'separable-verbs.karsi.liste', sectionId: 'separable-verbs.compare', label: 'empfinden/erklären/vergessen/zerstören/zerreißen tanıma', anchor: 'zerstören = tahrip etmek', prerequisites: ['separable-verbs.karsi.ipucu'] },
  { id: 'separable-verbs.frage', sectionId: 'separable-verbs.question-negation', label: 'Soru: Stehst du früh auf? (önek sonda kalır)', anchor: 'Stehst du früh auf?', prerequisites: ['separable-verbs.trennbar.kural'] },
  { id: 'separable-verbs.nicht', sectionId: 'separable-verbs.question-negation', label: 'Olumsuz: nicht önekten önce gelir', anchor: 'nicht önekten önce gelir', prerequisites: ['separable-verbs.trennbar.kural', 'articles.olumsuzluk.nicht'] },
  { id: 'separable-verbs.mit-modal', sectionId: 'separable-verbs.with-modal', label: 'Modalverb ile tek parça: Ich will früh aufstehen.', anchor: 'Ich will früh aufstehen.', prerequisites: ['separable-verbs.trennbar.kural', 'modal-verbs.kural'] },
  { id: 'separable-verbs.einnehmen', sectionId: 'separable-verbs.with-modal', label: 'einnehmen = (ilaç) almak', anchor: 'einnehmen — (ilaç) almak', prerequisites: ['separable-verbs.trennbar.kural'] },

  /* ---------------------------------------------------------------- */
  /* Modalverben                                                      */
  /* ---------------------------------------------------------------- */
  { id: 'modal-verbs.moechten.cekim', sectionId: 'modal-verbs.moechten', label: 'möchten çekimi: ich möchte, du möchtest ...', anchor: 'ich möchte' },
  { id: 'modal-verbs.moechten-infinitiv', sectionId: 'modal-verbs.rule', label: 'möchte + ... + fiil (mastar) cümle sonunda', anchor: 'mastar halinde cümlenin en sonuna gider', prerequisites: ['modal-verbs.moechten.cekim'] },
  { id: 'modal-verbs.anlamlar', sectionId: 'modal-verbs.what', label: 'Modalverb anlamları: können, möchten, wollen, sollen, dürfen', anchor: 'können = -ebilmek' },
  { id: 'modal-verbs.ich-er-ayni', sectionId: 'modal-verbs.what', label: 'ich ve er/sie/es biçimi aynı: ich kann = er kann', anchor: 'ich ve er/sie/es biçimleri aynıdır', prerequisites: ['modal-verbs.anlamlar'] },
  { id: 'modal-verbs.kural', sectionId: 'modal-verbs.rule', label: 'Özne + Modalverb (2. sıra) + … + mastar (sonda)', anchor: 'Özne + Modalverb + … + Mastar', prerequisites: ['sentence-building.dizilisi.verb-ikinci'] },
  { id: 'modal-verbs.koennen.cekim', sectionId: 'modal-verbs.koennen', label: 'können çekimi: ich kann, du kannst …', anchor: 'du kannst' },
  { id: 'modal-verbs.koennen.kullanim', sectionId: 'modal-verbs.koennen', label: 'können = -ebilmek: Ich kann Deutsch sprechen.', anchor: 'Ich kann Deutsch sprechen.', prerequisites: ['modal-verbs.koennen.cekim', 'modal-verbs.kural'] },
  { id: 'modal-verbs.moechten.kullanim', sectionId: 'modal-verbs.moechten', label: 'möchten + mastar: Ich möchte Deutsch lernen.', anchor: 'Ich möchte Deutsch lernen.', prerequisites: ['modal-verbs.moechten.cekim', 'modal-verbs.kural'] },
  { id: 'modal-verbs.wollen.cekim', sectionId: 'modal-verbs.wollen', label: 'wollen çekimi: ich will, du willst …', anchor: 'du willst' },
  { id: 'modal-verbs.wollen.kullanim', sectionId: 'modal-verbs.wollen', label: 'wollen = niyet / plan: Mein Vater will ein Haus kaufen.', anchor: 'Mein Vater will ein Haus kaufen.', prerequisites: ['modal-verbs.wollen.cekim', 'modal-verbs.kural'] },
  { id: 'modal-verbs.wollen-moechten', sectionId: 'modal-verbs.wollen', label: 'möchten (kibar istek) ↔ wollen (doğrudan niyet)', anchor: 'möchten = kibar istek', prerequisites: ['modal-verbs.wollen.kullanim', 'modal-verbs.moechten.kullanim'] },
  { id: 'modal-verbs.sollen.cekim', sectionId: 'modal-verbs.sollen', label: 'sollen çekimi: ich soll, du sollst …', anchor: 'du sollst' },
  { id: 'modal-verbs.sollen.kullanim', sectionId: 'modal-verbs.sollen', label: 'sollen = -meli / -malı: Ich soll meine Hausaufgaben machen.', anchor: 'Ich soll meine Hausaufgaben machen.', prerequisites: ['modal-verbs.sollen.cekim', 'modal-verbs.kural'] },
  { id: 'modal-verbs.duerfen.cekim', sectionId: 'modal-verbs.duerfen', label: 'dürfen çekimi: ich darf, du darfst …', anchor: 'du darfst' },
  { id: 'modal-verbs.man', sectionId: 'modal-verbs.duerfen', label: 'man = insan / kişi (3. tekil)', anchor: 'man = insan' },
  { id: 'modal-verbs.duerfen.verbot', sectionId: 'modal-verbs.duerfen', label: 'dürfen + nicht = yasak: Hier darf man nicht parken.', anchor: 'Hier darf man nicht parken.', prerequisites: ['modal-verbs.duerfen.cekim', 'modal-verbs.man'] },
  { id: 'modal-verbs.duerfen.frage', sectionId: 'modal-verbs.duerfen', label: 'İzin sorma: Darf ich hier parken?', anchor: 'Darf ich hier parken?', prerequisites: ['modal-verbs.duerfen.cekim'] },
  { id: 'modal-verbs.moegen.anlam', sectionId: 'modal-verbs.moegen-muessen', label: 'mögen = bir şeyi sevmek (Modalverb olarak tanıma)', anchor: 'mögen = bir şeyi sevmek', prerequisites: ['likes.mogen.cekim'] },
  { id: 'modal-verbs.muessen.anlam', sectionId: 'modal-verbs.moegen-muessen', label: 'müssen = zorunluluk (yalnızca anlam)', anchor: 'müssen = zorunluluk' },
  { id: 'modal-verbs.frage', sectionId: 'modal-verbs.questions', label: 'Soru: Modalverb + Özne + … + Mastar?', anchor: 'Modalverb + Özne + … + Mastar ?', prerequisites: ['modal-verbs.kural', 'questions.sorular.evet-hayir-yapi'] },
  { id: 'modal-verbs.ja-nein', sectionId: 'modal-verbs.questions', label: 'Tam cevap: Ja, ich kann kochen. / Nein, ich kann nicht kochen.', anchor: 'Ja, ich kann kochen.', prerequisites: ['modal-verbs.frage'] },
  { id: 'modal-verbs.nicht', sectionId: 'modal-verbs.negation', label: 'Olumsuz: nicht sondaki mastarın önüne gelir', anchor: 'nicht sondaki mastarın önüne gelir', prerequisites: ['modal-verbs.kural', 'articles.olumsuzluk.nicht'] },
  { id: 'modal-verbs.trennbar', sectionId: 'modal-verbs.separable', label: 'Modalverb + ayrılabilen fiil: fiil bölünmez (Ich will früh aufstehen.)', anchor: 'ayrılabilen fiil bölünmez', prerequisites: ['modal-verbs.kural', 'separable-verbs.ayrilabilen.kural'] },
  { id: 'modal-verbs.akkusativ', sectionId: 'modal-verbs.akkusativ', label: 'Modalverb + Akkusativ: Ich möchte einen Kuchen kaufen.', anchor: 'Ich möchte einen Kuchen kaufen.', prerequisites: ['modal-verbs.kural', 'akkusativ.ein-einen'] },

  /* ---------------------------------------------------------------- */
  /* Kelime Haznesi                                                   */
  /* ---------------------------------------------------------------- */
  { id: 'vocabulary.hava.ifadeler', sectionId: 'vocabulary.weather-animals', label: 'Wetter ifadeleri: schön, warm, kalt', anchor: 'Das Wetter ist' },
  { id: 'vocabulary.hayvanlar.kelime', sectionId: 'vocabulary.weather-animals', label: 'Hayvan kelimeleri: die Katze, der Hund, das Tier', anchor: 'die Katze' },
  { id: 'vocabulary.hobiler.kelime', sectionId: 'vocabulary.weather-animals', label: 'Hobi kelimeleri: schwimmen, Fußball, lesen, fotografieren', anchor: 'gern Fußball' },
  { id: 'vocabulary.kelime.leider', sectionId: 'vocabulary.small-words', label: 'leider = maalesef, ne yazık ki', anchor: 'leider' },
  { id: 'vocabulary.kelime.mehr', sectionId: 'vocabulary.small-words', label: 'mehr = daha fazla', anchor: 'mehr' },
  { id: 'vocabulary.kelime.geschwister', sectionId: 'vocabulary.small-words', label: 'die Geschwister = kardeşler', anchor: 'Geschwister' },
  { id: 'vocabulary.kelime.seit', sectionId: 'vocabulary.small-words', label: 'seit = -den beri', anchor: 'seit', prerequisites: ['places.mit-dativ'] },
  { id: 'vocabulary.kelime.flughafen', sectionId: 'vocabulary.small-words', label: 'der Flughafen = havaalanı', anchor: 'Flughafen' },
  { id: 'vocabulary.kelime.moment', sectionId: 'vocabulary.small-words', label: 'der Moment / Moment! = an, bir dakika', anchor: 'Moment' },
  { id: 'vocabulary.kelime.gluecklich', sectionId: 'vocabulary.daily-words', label: 'glücklich = mutlu, der Traum = hayal', anchor: 'glücklich = mutlu' },
  { id: 'vocabulary.kelime.gast-leute', sectionId: 'vocabulary.daily-words', label: 'der Gast / die Gäste, die Leute, in der Mensa', anchor: 'der Gast = misafir' },
  { id: 'vocabulary.kelime.fuer-dafuer', sectionId: 'vocabulary.daily-words', label: 'für = için, dafür = bunun için', anchor: 'für = için' },
  { id: 'vocabulary.kelime.nur-etwas-viele', sectionId: 'vocabulary.daily-words', label: 'nur = sadece, etwas = bir şey, viele = bir çok', anchor: 'nur = sadece' },
  { id: 'vocabulary.kelime.dazu-fertig-schmeckt', sectionId: 'vocabulary.daily-words', label: 'dazu = ayrıca, fertig = hazır, schmeckt = tadı güzel', anchor: 'fertig = hazır' },
  { id: 'vocabulary.kelime.zusammen-dort', sectionId: 'vocabulary.daily-words', label: 'zusammen = birlikte, dort = orada', anchor: 'zusammen = birlikte' },
  { id: 'vocabulary.kelime.auch', sectionId: 'vocabulary.daily-words', label: 'auch = de, da, ayrıca', anchor: 'auch = de / da' },
  { id: 'vocabulary.wort.ruhig', sectionId: 'vocabulary.more-words', label: 'ruhig / nur / beide', anchor: 'ruhig = sessiz' },
  { id: 'vocabulary.wort.beide', sectionId: 'vocabulary.more-words', label: 'beide = ikisi de', anchor: 'beide = ikisi de', prerequisites: ['vocabulary.wort.ruhig'] },
  { id: 'vocabulary.wort.ziemlich', sectionId: 'vocabulary.more-words', label: 'ziemlich = oldukça', anchor: 'ziemlich = oldukça' },
  { id: 'vocabulary.wort.frueh-lange', sectionId: 'vocabulary.more-words', label: 'früh = erken, lange = uzun', anchor: 'früh = erken' },
  { id: 'vocabulary.tasche-zeitung', sectionId: 'vocabulary.things', label: 'die Tasche = çanta, die Zeitung = gazete', anchor: 'die Tasche — çanta' },
  { id: 'vocabulary.brief', sectionId: 'vocabulary.things', label: 'der Brief = mektup', anchor: 'der Brief — mektup' },
  { id: 'vocabulary.ticket', sectionId: 'vocabulary.things', label: 'das Ticket = bilet', anchor: 'das Ticket — bilet' },
  { id: 'vocabulary.schluessel', sectionId: 'vocabulary.things', label: 'der Schlüssel = anahtar', anchor: 'der Schlüssel — anahtar' },
  { id: 'vocabulary.spielzeug-seil', sectionId: 'vocabulary.things', label: 'das Spielzeug = oyuncak, das Seil = ip', anchor: 'das Seil — ip' },
  { id: 'vocabulary.maeppchen', sectionId: 'vocabulary.things', label: 'das Mäppchen = kalem kutusu', anchor: 'das Mäppchen — kalem kutusu' },
  { id: 'vocabulary.lied-kleid', sectionId: 'vocabulary.things', label: 'das Lied = şarkı, das Kleid = elbise', anchor: 'das Lied — şarkı' },
  { id: 'vocabulary.museum', sectionId: 'vocabulary.things', label: 'das Museum = müze', anchor: 'das Museum — müze' },
  { id: 'vocabulary.baby-nachbar', sectionId: 'vocabulary.things', label: 'das Baby = bebek, der Nachbar = komşu', anchor: 'der Nachbar — komşu' },
  { id: 'vocabulary.nehmen', sectionId: 'vocabulary.new-verbs', label: 'nehmen = almak (du nimmst, er nimmt)', anchor: 'nehmen — almak' },
  { id: 'vocabulary.benutzen', sectionId: 'vocabulary.new-verbs', label: 'benutzen = kullanmak', anchor: 'benutzen — kullanmak' },
  { id: 'vocabulary.schicken', sectionId: 'vocabulary.new-verbs', label: 'schicken = göndermek', anchor: 'schicken — göndermek' },
  { id: 'vocabulary.warten', sectionId: 'vocabulary.new-verbs', label: 'warten = beklemek (warten auf: Ich warte auf dich.)', anchor: 'warten — beklemek' },
  { id: 'vocabulary.wissen', sectionId: 'vocabulary.new-verbs', label: 'wissen = bilmek (ich weiß — Ich weiß nicht.)', anchor: 'wissen — bilmek' },
  { id: 'vocabulary.halten-tragen', sectionId: 'vocabulary.new-verbs', label: 'halten = tutmak, tragen = taşımak', anchor: 'tragen — taşımak' },
  { id: 'vocabulary.verlieren', sectionId: 'vocabulary.new-verbs', label: 'verlieren = kaybetmek', anchor: 'verlieren — kaybetmek' },
  { id: 'vocabulary.reparieren', sectionId: 'vocabulary.new-verbs', label: 'reparieren = tamir etmek', anchor: 'reparieren — tamir etmek' },
  { id: 'vocabulary.malen-tanzen', sectionId: 'vocabulary.new-verbs', label: 'malen = resim yapmak, tanzen = dans etmek', anchor: 'malen — resim yapmak' },
  { id: 'vocabulary.kontrollieren-untersuchen', sectionId: 'vocabulary.new-verbs', label: 'kontrollieren = kontrol etmek, untersuchen = muayene etmek', anchor: 'untersuchen — muayene etmek' },
  { id: 'vocabulary.schneiden', sectionId: 'vocabulary.new-verbs', label: 'schneiden = kesmek', anchor: 'schneiden — kesmek' },
  { id: 'vocabulary.wort-satz', sectionId: 'vocabulary.classroom', label: 'das Wort / die Wörter = kelime(ler), der Satz = cümle', anchor: 'das Wort — kelime' },
  { id: 'vocabulary.frage-antwort', sectionId: 'vocabulary.classroom', label: 'die Frage = soru, die Antwort = cevap, antworten', anchor: 'die Frage — soru' },
  { id: 'vocabulary.uebersetzen-wiederholen', sectionId: 'vocabulary.classroom', label: 'übersetzen = çevirmek, wiederholen = tekrar etmek', anchor: 'übersetzen — çevirmek' },
  { id: 'vocabulary.erzaehlen-erklaeren', sectionId: 'vocabulary.classroom', label: 'erzählen (anlatmak) ↔ erklären (açıklamak)', anchor: 'erklären — açıklamak' },
  { id: 'vocabulary.fehler-falsch', sectionId: 'vocabulary.classroom', label: 'der Fehler = hata, falsch = yanlış, korrigieren = düzeltmek', anchor: 'der Fehler — hata' },
]);

export const CONCEPT_INDEX = new Map(CONCEPTS.map((item) => [item.id, item]));

export function conceptsForTopic(topicId: string): Concept[] {
  return CONCEPTS.filter((item) => item.topicId === topicId);
}

export function conceptsForSection(sectionId: string): Concept[] {
  return CONCEPTS.filter((item) => item.sectionId === sectionId);
}

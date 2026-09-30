/**
 * İlerleme durumu — dil başına ayrı, localStorage ile senkron tutulur.
 *
 * Almanca ilerleme mevcut anahtarında (`almanca-alistirma:progress`) aynen
 * kalır; İngilizce ilerleme ayrı anahtarda (`almanca-alistirma:progress-en`)
 * tutulur. İki dilin deneme geçmişi/hataları/istatistikleri ASLA karışmaz.
 *
 * Ekranlar `api.progress` üzerinden SADECE aktif dilin dilimini görür; dil
 * değiştirmek dilimi anında değiştirir (yeniden giriş gerekmez, durum
 * kaybolmaz).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  DE_PROGRESS_KEY,
  EN_PROGRESS_KEY,
  loadLearningLanguage,
  progressKeyFor,
  saveLearningLanguage,
  type LearningLanguage,
} from '../lib/language';
import { loadProgress, saveProgress, type UserProgress } from '../lib/storage';
import { correctKeyboardToleranceHistory } from '../lib/progress';
import { exercisesById, migrationContext } from '../lib/content';
import { enExercisesById, enMigrationContext } from '../lib/content-en';

export interface ProgressApi {
  progress: UserProgress;
  update: (updater: (current: UserProgress) => UserProgress) => void;
  replace: (next: UserProgress) => void;
  /** Aktif hedef dil (`de` varsayılan; geriye uyumlu). */
  language: LearningLanguage;
  setLanguage: (next: LearningLanguage) => void;
}

/** Yükleme sırasında klavye toleransı geriye dönük düzeltmesini uygular. */
function applyCorrections(raw: UserProgress, language: LearningLanguage): UserProgress {
  const lookup = language === 'en' ? enExercisesById.get.bind(enExercisesById) : exercisesById.get.bind(exercisesById);
  return correctKeyboardToleranceHistory(raw, (id) => lookup(id));
}

/**
 * Arayüz tercihleri dile ait değildir (tema, ses efektleri…): aktif dilimde
 * değişen bu ayarlar diğer dilime de aynalanır; ses seçimi dile özeldir.
 */
const SHARED_SETTING_KEYS = [
  'dailyGoalMinutes',
  'showPronunciation',
  'soundEffects',
  'autoPronunciation',
  'speechSpeed',
  'themePreference',
] as const;

function withSharedSettings(from: UserProgress, to: UserProgress): UserProgress {
  let settings = to.settings;
  let changed = false;
  for (const key of SHARED_SETTING_KEYS) {
    if (settings[key] !== from.settings[key]) {
      settings = { ...settings, [key]: from.settings[key] };
      changed = true;
    }
  }
  return changed ? { ...to, settings } : to;
}

interface LangState {
  language: LearningLanguage;
  de: UserProgress;
  en: UserProgress;
}

function loadInitialState(): LangState {
  const language = loadLearningLanguage(localStorage);
  return {
    language,
    de: applyCorrections(loadProgress(localStorage, migrationContext, DE_PROGRESS_KEY), 'de'),
    en: applyCorrections(loadProgress(localStorage, enMigrationContext, EN_PROGRESS_KEY), 'en'),
  };
}

export function useProgressState(): ProgressApi {
  const [state, setState] = useState<LangState>(loadInitialState);

  useEffect(() => {
    saveProgress(state.de, localStorage, DE_PROGRESS_KEY);
  }, [state.de]);

  useEffect(() => {
    saveProgress(state.en, localStorage, EN_PROGRESS_KEY);
  }, [state.en]);

  useEffect(() => {
    saveLearningLanguage(state.language, localStorage);
  }, [state.language]);

  // Başka bir sekmede değişirse senkron kal.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === DE_PROGRESS_KEY && event.newValue) {
        setState((current) => ({
          ...current,
          de: applyCorrections(loadProgress(localStorage, migrationContext, DE_PROGRESS_KEY), 'de'),
        }));
      } else if (event.key === EN_PROGRESS_KEY && event.newValue) {
        setState((current) => ({
          ...current,
          en: applyCorrections(loadProgress(localStorage, enMigrationContext, EN_PROGRESS_KEY), 'en'),
        }));
      } else if (event.key === 'learning-language' && (event.newValue === 'de' || event.newValue === 'en')) {
        setState((current) => ({ ...current, language: event.newValue as LearningLanguage }));
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const update = useCallback((updater: (current: UserProgress) => UserProgress) => {
    setState((current) => {
      const key = current.language;
      const next = updater(current[key]);
      if (next === current[key]) return current;
      if (key === 'de') {
        return { ...current, de: next, en: withSharedSettings(next, current.en) };
      }
      return { ...current, en: next, de: withSharedSettings(next, current.de) };
    });
  }, []);

  const replace = useCallback(
    (next: UserProgress) =>
      setState((current) =>
        current.language === 'de'
          ? { ...current, de: next }
          : { ...current, en: next },
      ),
    [],
  );

  const setLanguage = useCallback((next: LearningLanguage) => {
    setState((current) => (current.language === next ? current : { ...current, language: next }));
    try {
      window.scrollTo({ top: 0 });
    } catch {
      /* test ortamı */
    }
  }, []);

  return useMemo(
    () => ({
      progress: state[state.language],
      update,
      replace,
      language: state.language,
      setLanguage,
    }),
    [state, update, replace, setLanguage],
  );
}

/** `learning-language` anahtarını okuyan hafif yardımcı (testler için). */
export function storageKeyFor(language: LearningLanguage): string {
  return progressKeyFor(language);
}

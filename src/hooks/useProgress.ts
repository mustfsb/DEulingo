/** Ilerleme durumu — localStorage ile senkron tutulur. */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { loadProgress, saveProgress, type UserProgress } from '../lib/storage';
import { correctKeyboardToleranceHistory } from '../lib/progress';
import { exercisesById } from '../lib/content';

/** Yükleme sirasinda klavye toleransi geriye dönük düzeltmesini uygular. */
function applyCorrections(raw: UserProgress): UserProgress {
  return correctKeyboardToleranceHistory(raw, (id) => exercisesById.get(id));
}

export interface ProgressApi {
  progress: UserProgress;
  update: (updater: (current: UserProgress) => UserProgress) => void;
  replace: (next: UserProgress) => void;
}

export function useProgressState(): ProgressApi {
  const [progress, setProgress] = useState<UserProgress>(() => applyCorrections(loadProgress()));

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  // Baska bir sekmede degisirse senkron kal.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === 'almanca-alistirma:progress' && event.newValue) {
        setProgress(applyCorrections(loadProgress()));
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const update = useCallback((updater: (current: UserProgress) => UserProgress) => {
    setProgress((current) => updater(current));
  }, []);

  const replace = useCallback((next: UserProgress) => setProgress(next), []);

  return useMemo(() => ({ progress, update, replace }), [progress, update, replace]);
}

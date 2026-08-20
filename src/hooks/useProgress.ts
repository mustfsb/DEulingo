/** Ilerleme durumu — localStorage ile senkron tutulur. */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { loadProgress, saveProgress, type UserProgress } from '../lib/storage';

export interface ProgressApi {
  progress: UserProgress;
  update: (updater: (current: UserProgress) => UserProgress) => void;
  replace: (next: UserProgress) => void;
}

export function useProgressState(): ProgressApi {
  const [progress, setProgress] = useState<UserProgress>(() => loadProgress());

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  // Baska bir sekmede degisirse senkron kal.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === 'almanca-alistirma:progress' && event.newValue) {
        setProgress(loadProgress());
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

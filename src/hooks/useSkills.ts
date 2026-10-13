/**
 * İngilizce beceri durumu — `skills-en` anahtarında, dile özel.
 * Almanca ilerlemeye dokunmaz.
 */

import { useCallback, useEffect, useState } from 'react';
import { emptySkills, loadSkills, saveSkills, type EnSkillsState } from '../lib/skills-storage';
import { setUserVocabulary } from '../content/en/user-vocab';
import { EN_READING_BY_ID } from '../content/en/skills-reading';

/** Okumadan seçilen kelimeleri İngilizce kelime envanterine yansıtır (eşzamanlı). */
function syncUserVocabulary(state: EnSkillsState): EnSkillsState {
  setUserVocabulary(state.readingVocab, (passageId) => EN_READING_BY_ID.get(passageId)?.topicTags[0]);
  return state;
}

export function useSkillsState(): { skills: EnSkillsState; update: (fn: (s: EnSkillsState) => EnSkillsState) => void } {
  const [skills, setSkills] = useState<EnSkillsState>(() => {
    try { return syncUserVocabulary(loadSkills(localStorage)); } catch { return syncUserVocabulary(emptySkills()); }
  });

  useEffect(() => {
    try { saveSkills(skills, localStorage); } catch { /* ignore */ }
  }, [skills]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'almanca-alistirma:skills-en') {
        try { setSkills(syncUserVocabulary(loadSkills(localStorage))); } catch { /* ignore */ }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const update = useCallback((fn: (s: EnSkillsState) => EnSkillsState) => {
    // Envanter kaydı durumla aynı anda güncellenir: sonraki ekran güncel listeyi görür.
    setSkills((cur) => syncUserVocabulary(fn(cur)));
  }, []);

  return { skills, update };
}

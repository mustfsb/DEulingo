import type { LearningLanguage } from '../lib/language';

const OPTIONS: Array<{ value: LearningLanguage; flag: string; label: string }> = [
  { value: 'de', flag: '🇩🇪', label: 'Deutsch' },
  { value: 'en', flag: '🇬🇧', label: 'English' },
];

/**
 * Sağ üstte kompakt dil düğmesi. Hedef ÖĞRENME dilini seçer (arayüz dili
 * değil — arayüz Türkçe kalır). Seçim `learning-language` anahtarında saklanır.
 *
 * Bilerek açılır liste DEĞİL, iki büyük dokunma hedefli bölmeli düğmedir:
 * tek dokunuşla dil değişir; menü zamanlaması/kapanması sorunu yaşanmaz.
 */
export function LanguageSelector({
  language,
  onChange,
}: {
  language: LearningLanguage;
  onChange: (next: LearningLanguage) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Öğrenme dili"
      className="flex flex-none items-center gap-0.5 rounded-full border-2 border-line p-0.5"
      style={{ background: 'var(--color-sunk)' }}
    >
      {OPTIONS.map((option) => {
        const active = option.value === language;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            aria-label={`Öğrenme dili: ${option.label}`}
            title={option.label}
            onClick={() => {
              if (!active) onChange(option.value);
            }}
            className="grid min-h-[2.75rem] min-w-[2.75rem] place-items-center rounded-full text-xl leading-none"
            style={
              active
                ? { background: 'var(--color-surface)', boxShadow: '0 2px 0 0 var(--color-brand)', outline: '2px solid var(--color-brand)', outlineOffset: '-2px' }
                : { opacity: 0.55 }
            }
          >
            <span aria-hidden="true">{option.flag}</span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Kaynak Markdown'daki `backtick` ve **kalin** isaretlerini korur:
 * Almanca jetonlar mono cipte, vurgulu harfler isaretli gosterilir.
 */

import { Fragment, type ReactNode } from 'react';

const PATTERN = /(`[^`]+`|\*\*[^*]+\*\*)/g;

export function Markup({ text, className }: { text: string; className?: string }): ReactNode {
  if (!text) return null;
  const parts = text.split(PATTERN).filter((part) => part !== '');

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <span key={index} className="de" lang="de">
              {part.slice(1, -1)}
            </span>
          );
        }
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <mark
              key={index}
              className="rounded-[0.3em] bg-signal/60 px-[0.12em] text-ink"
              style={{ background: 'color-mix(in srgb, var(--color-signal) 70%, transparent)' }}
            >
              {part.slice(2, -2)}
            </mark>
          );
        }
        return <Fragment key={index}>{part}</Fragment>;
      })}
    </span>
  );
}

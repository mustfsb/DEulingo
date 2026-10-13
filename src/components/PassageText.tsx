/**
 * Okuma pasajı gövdesi: `[A]` etiketli paragrafları rozetle gösterir ve
 * (kanıt incelemesinde) seçili sorunun kanıtını vurgular.
 */

import { Fragment } from 'react';

const LABEL = /^\[([A-Z])\]\s*/;

function highlighted(text: string, evidence?: string) {
  if (!evidence) return text;
  const at = text.indexOf(evidence);
  if (at < 0) return text;
  return (
    <>
      {text.slice(0, at)}
      <mark data-evidence="true" style={{ background: 'var(--color-brand-soft, #fde68a)', padding: '0 2px', borderRadius: 3 }}>
        {evidence}
      </mark>
      {text.slice(at + evidence.length)}
    </>
  );
}

export function PassageText({ text, evidence }: { text: string; evidence?: string }) {
  return (
    <>
      {text.split(/\n\s*\n/).map((block, index) => {
        const match = LABEL.exec(block);
        const body = match ? block.slice(match[0].length) : block;
        return (
          <p key={index} className={index > 0 ? 'mt-4' : undefined} style={{ whiteSpace: 'pre-line' }}>
            {match && (
              <Fragment>
                <strong className="badge numeral mr-2 align-baseline" aria-label={`Paragraf ${match[1]}`}>{match[1]}</strong>
              </Fragment>
            )}
            {highlighted(body, evidence)}
          </p>
        );
      })}
    </>
  );
}

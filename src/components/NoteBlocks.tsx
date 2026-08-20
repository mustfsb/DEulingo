import { Markup } from './Markup';
import type { NoteBlock } from '../content/types';

/**
 * Ozet gövde bloklarini render eder.
 * Ham HTML KULLANILMAZ — her blok turu acikca ele alinir.
 */
export function NoteBlockView({ block }: { block: NoteBlock }) {
  switch (block.kind) {
    case 'paragraph':
      return (
        <p>
          <Markup text={block.text} />
        </p>
      );
    case 'callout':
      return (
        <p
          className="rounded-xl px-3.5 py-2.5"
          style={{ background: 'var(--color-warn-soft)', color: 'var(--color-ink)' }}
        >
          <Markup text={block.text} />
        </p>
      );
    case 'list':
      return (
        <ul className="ml-4 flex list-disc flex-col gap-1">
          {block.items.map((item, index) => (
            <li key={index}>
              <Markup text={item} />
            </li>
          ))}
        </ul>
      );
    case 'code':
      return (
        <pre
          className="overflow-x-auto rounded-xl bg-sunk p-3.5 font-mono text-[0.9rem] leading-relaxed"
          lang="de"
        >
          {block.lines.join('\n')}
        </pre>
      );
    case 'table':
      return (
        <div className="-mx-1 overflow-x-auto px-1">
          <table className="w-full border-collapse text-[0.92rem]">
            <thead>
              <tr>
                {block.head.map((cell, index) => (
                  <th key={index} className="border-b-2 border-line px-2.5 py-2 text-left">
                    <Markup text={cell} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="border-b border-line px-2.5 py-2 align-top">
                      <Markup text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

import { codeToHtml } from 'shiki';
import { transformerNotationHighlight } from '@shikijs/transformers';
import CopyButton from './CopyButton';
/**
 * PseudocodeBlock — Server Component that uses Shiki for
 * VS Code-quality syntax highlighting at build time.
 */
export default async function PseudocodeBlock({
  code,
  language = 'plaintext',
}: {
  code: string;
  language?: string;
}) {
  const html = await codeToHtml(code, {
    lang: language,
    theme: 'vitesse-dark',
    transformers: [transformerNotationHighlight()],
  });

  return (
    <div className="pseudocode-wrapper group">
      <div className="relative bg-black/60 backdrop-blur-xl">
        <div className="absolute top-0 left-0 px-3 py-1 bg-white/5 rounded-br-lg border-r border-b border-white/5">
          <span className="text-[10px] font-semibold text-white/50 tracking-wider uppercase">Pseudocode</span>
        </div>
        <CopyButton text={code} />
        <div
          className="overflow-x-auto text-sm pt-8 pb-4 px-4 pseudocode-block [&_pre]:!bg-transparent [&_pre]:!m-0 [&_code]:!font-mono"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}

import { codeToHtml } from 'shiki';

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
  });

  return (
    <div
      className="rounded-xl overflow-x-auto text-sm [&_pre]:!bg-black/30 [&_pre]:!p-4 [&_pre]:!rounded-xl [&_pre]:!border [&_pre]:!border-white/5 [&_code]:!font-mono"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

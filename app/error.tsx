'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="flex flex-1 items-center justify-center bg-[#050508] px-6 py-20 text-center">
      <div className="max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-[#00d4ff]">
          Unexpected error
        </p>
        <h1 className="font-outfit text-3xl font-bold text-white">
          Something went wrong
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#aaaacc]">
          The visualizer could not finish loading. Try again to recover this page.
        </p>
        <button
          type="button"
          onClick={unstable_retry}
          className="mt-6 rounded-lg bg-[#00d4ff] px-4 py-2 text-sm font-semibold text-[#050508] transition hover:bg-[#5ee8ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00d4ff]"
        >
          Try again
        </button>
      </div>
    </section>
  );
}

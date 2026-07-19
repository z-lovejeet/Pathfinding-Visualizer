import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="flex flex-1 items-center justify-center bg-[#050508] px-6 py-20 text-center">
      <div className="max-w-md">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-[#00d4ff]">404</p>
        <h1 className="font-outfit text-4xl font-bold text-white">Page not found</h1>
        <p className="mt-3 text-sm leading-6 text-[#aaaacc]">
          The page you requested does not exist or has moved.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-lg bg-[#00d4ff] px-4 py-2 text-sm font-semibold text-[#050508] transition hover:bg-[#5ee8ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00d4ff]"
        >
          Return home
        </Link>
      </div>
    </section>
  );
}

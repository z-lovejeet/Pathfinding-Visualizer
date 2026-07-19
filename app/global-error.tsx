'use client';

import { useEffect } from 'react';

export default function GlobalError({
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
    <html lang="en">
      <head>
        <title>Application error | Pathfinding Visualizer</title>
      </head>
      <body
        style={{
          alignItems: 'center',
          background: '#050508',
          color: '#ffffff',
          display: 'flex',
          fontFamily: 'system-ui, sans-serif',
          justifyContent: 'center',
          margin: 0,
          minHeight: '100vh',
          padding: '1.5rem',
          textAlign: 'center',
        }}
      >
        <main style={{ maxWidth: '32rem' }}>
          <p style={{ color: '#00d4ff', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            Unexpected error
          </p>
          <h1>Something went wrong</h1>
          <p style={{ color: '#aaaacc', lineHeight: 1.6 }}>
            The application could not load. Try again to recover.
          </p>
          <button
            type="button"
            onClick={unstable_retry}
            style={{
              background: '#00d4ff',
              border: 0,
              borderRadius: '0.5rem',
              color: '#050508',
              cursor: 'pointer',
              fontWeight: 700,
              marginTop: '1rem',
              padding: '0.75rem 1rem',
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}

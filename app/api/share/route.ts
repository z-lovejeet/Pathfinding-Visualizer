export const dynamic = 'force-dynamic';

const sharingUnavailable = () =>
  Response.json(
    {
      error: 'Grid sharing is not available because persistence has not been configured.',
    },
    {
      status: 501,
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  );

// Do not parse, log, or retain untrusted grid data until durable storage and
// a validated share contract are available.
export function POST() {
  return sharingUnavailable();
}

export function GET() {
  return sharingUnavailable();
}

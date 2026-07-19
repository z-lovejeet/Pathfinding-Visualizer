import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/client';
import { shares } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { isAlgorithmType, isSharedGridData } from '@/lib/share/validation';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!isUuid(id)) {
      return NextResponse.json({ error: 'Invalid share ID.' }, { status: 400 });
    }

    const database = getDatabase();
    if (!database) {
      return NextResponse.json(
        { error: 'Grid sharing is not configured for this deployment.' },
        { status: 503 }
      );
    }

    const [share] = await database.select().from(shares).where(eq(shares.id, id));

    if (!share) {
      return NextResponse.json({ error: 'Share not found.' }, { status: 404 });
    }

    if (!isSharedGridData(share.gridData) || !isAlgorithmType(share.algorithm)) {
      console.error('Shared grid record has an invalid payload.', { id });
      return NextResponse.json({ error: 'Share is unavailable.' }, { status: 422 });
    }

    return NextResponse.json(
      { gridData: share.gridData, algorithm: share.algorithm },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('Failed to retrieve a shared grid.', error);
    return NextResponse.json({ error: 'Unable to load the shared grid.' }, { status: 500 });
  }
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

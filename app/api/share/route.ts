import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/client';
import { shares } from '@/lib/db/schema';
import {
  isAlgorithmType,
  isSharedGridData,
  isValidShareTitle,
  MAX_SHARE_BODY_BYTES,
} from '@/lib/share/validation';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get('content-length'));
  if (Number.isFinite(contentLength) && contentLength > MAX_SHARE_BODY_BYTES) {
    return NextResponse.json(
      { error: 'Shared grid data is too large.' },
      { status: 413 }
    );
  }

  let rawBody: string;

  try {
    rawBody = await request.text();
  } catch {
    return NextResponse.json({ error: 'Unable to read the request body.' }, { status: 400 });
  }

  if (new TextEncoder().encode(rawBody).byteLength > MAX_SHARE_BODY_BYTES) {
    return NextResponse.json(
      { error: 'Shared grid data is too large.' },
      { status: 413 }
    );
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid share request.' }, { status: 400 });
  }

  const { title, gridData, algorithm } = body as Record<string, unknown>;

  if (!isValidShareTitle(title)) {
    return NextResponse.json(
      { error: 'Title must contain between 1 and 80 characters.' },
      { status: 400 }
    );
  }

  if (!isSharedGridData(gridData) || !isAlgorithmType(algorithm)) {
    return NextResponse.json({ error: 'Invalid shared grid data.' }, { status: 400 });
  }

  const database = getDatabase();
  if (!database) {
    return NextResponse.json(
      { error: 'Grid sharing is not configured for this deployment.' },
      { status: 503 }
    );
  }

  try {
    const [result] = await database.insert(shares).values({
      title: title.trim(),
      gridData,
      algorithm,
    }).returning({ id: shares.id });

    if (!result) {
      throw new Error('Share insert did not return an ID.');
    }

    return NextResponse.json({ id: result.id }, { status: 201 });
  } catch (error) {
    console.error('Failed to persist a shared grid.', error);
    return NextResponse.json({ error: 'Unable to save the shared grid.' }, { status: 500 });
  }
}

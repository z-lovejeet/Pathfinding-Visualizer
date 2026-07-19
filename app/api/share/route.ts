import { NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { shares } from '@/lib/db/schema';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, gridData, algorithm } = body;

    if (!title || !gridData || !algorithm) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const [result] = await db.insert(shares).values({
      title,
      gridData,
      algorithm,
    }).returning({ id: shares.id });

    return NextResponse.json({ id: result.id }, { status: 201 });
  } catch (error) {
    console.error('Error sharing grid:', error);
    let errorMessage = 'Internal Server Error';
    if (error instanceof Error && error.message.includes('missing authentication credentials')) {
      errorMessage = 'Database configuration error: Please check that your DATABASE_URL in .env.local contains the correct password.';
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}


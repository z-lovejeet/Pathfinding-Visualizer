import { NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { shares } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: 'Missing share ID' }, { status: 400 });
    }

    const [share] = await db.select().from(shares).where(eq(shares.id, id));

    if (!share) {
      return NextResponse.json({ error: 'Share not found' }, { status: 404 });
    }

    return NextResponse.json(share);
  } catch (error) {
    console.error('Error fetching share:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

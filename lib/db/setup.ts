import { db } from './client';
import { sql } from 'drizzle-orm';

async function main() {
  console.log('Starting database setup...');
  
  try {
    // In a real app, we'd use drizzle-kit push or migrate here
    // For this simple setup, we'll just test the connection
    const result = await db.execute(sql`SELECT NOW()`);
    console.log('Database connection successful:', result);
  } catch (error) {
    console.error('Database connection failed:', error);
  }
}

main();

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

/**
 * Creates a server-only database client when sharing has been configured.
 *
 * Keeping initialization lazy allows the visualizer to build and run without
 * a database; only the optional sharing routes require DATABASE_URL.
 */
export function getDatabase() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    return null;
  }

  return drizzle(neon(databaseUrl), { schema });
}

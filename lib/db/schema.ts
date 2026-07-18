import { pgTable, text, timestamp, json, uuid } from 'drizzle-orm/pg-core';

export const shares = pgTable('shares', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  gridData: json('grid_data').notNull(),
  algorithm: text('algorithm').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

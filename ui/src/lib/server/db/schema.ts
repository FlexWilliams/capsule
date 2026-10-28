import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const podcasts = sqliteTable('podcasts', {
	id: integer('id').primaryKey().notNull(),
	title: text('title').notNull()
});

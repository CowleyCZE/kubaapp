const { pgTable, serial, text, timestamp, varchar } = require('drizzle-orm/pg-core');

// Tabulka pro témata
const topics = pgTable('topics', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Tabulka pro zpracované texty
const processedTexts = pgTable('processed_texts', {
  id: serial('id').primaryKey(),
  originalText: text('original_text').notNull(),
  processedText: text('processed_text').notNull(),
  topicId: serial('topic_id').references(() => topics.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

module.exports = {
  topics,
  processedTexts
};
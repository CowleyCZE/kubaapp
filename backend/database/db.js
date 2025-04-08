const { drizzle } = require('drizzle-orm/node-postgres');
const { Pool } = require('pg');
const { topics, processedTexts } = require('./schema');

// Vytvoření připojení k databázi
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Inicializace Drizzle ORM
const db = drizzle(pool);

// Export objektů pro práci s databází
module.exports = {
  db,
  topics,
  processedTexts
};
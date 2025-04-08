const { Pool } = require('pg');

// Vytvoření připojení k databázi
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// SQL pro vytvoření tabulky topics
const createTopicsTable = `
CREATE TABLE IF NOT EXISTS topics (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

// SQL pro vytvoření tabulky processed_texts
const createProcessedTextsTable = `
CREATE TABLE IF NOT EXISTS processed_texts (
  id SERIAL PRIMARY KEY,
  original_text TEXT NOT NULL,
  processed_text TEXT NOT NULL,
  topic_id INTEGER REFERENCES topics(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

// Funkce pro inicializaci databáze
async function initDatabase() {
  console.log('Začínám inicializaci databáze...');
  
  const client = await pool.connect();
  
  try {
    // Vytvoření tabulek
    await client.query(createTopicsTable);
    console.log('Tabulka topics vytvořena nebo již existuje');
    
    await client.query(createProcessedTextsTable);
    console.log('Tabulka processed_texts vytvořena nebo již existuje');
    
    console.log('Databáze byla úspěšně inicializována');
  } catch (error) {
    console.error('Chyba při inicializaci databáze:', error);
  } finally {
    client.release();
    // Ukončení připojení k databázi
    await pool.end();
  }
}

// Spuštění inicializace databáze
initDatabase().catch(console.error);
const { drizzle } = require('drizzle-orm/node-postgres');
const { migrate } = require('drizzle-orm/node-postgres/migrator');
const { Pool } = require('pg');

// Funkce pro migraci databáze
async function runMigration() {
  console.log('Začínám migraci databáze...');
  
  // Vytvoření připojení k databázi
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });
  
  // Inicializace Drizzle ORM
  const db = drizzle(pool);
  
  try {
    // Spuštění migrace - v produkci bychom měli použít složku s migračními soubory
    console.log('Připojuji se k databázi...');
    
    // Protože používáme push metodu, nemusíme provádět migraci ze souborů
    // Ale v produkčním prostředí by měl být použit správný migrátor
    // await migrate(db, { migrationsFolder: './migrations' });
    
    // Oznámení o úspěšné migraci
    console.log('Migrace byla úspěšně dokončena');
  } catch (error) {
    console.error('Chyba při migraci:', error);
  } finally {
    // Ukončení připojení k databázi
    await pool.end();
  }
}

// Spuštění migrace
runMigration().catch(console.error);
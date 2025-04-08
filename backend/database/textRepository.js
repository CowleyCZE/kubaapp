const { db, topics, processedTexts } = require('./db');
const { eq, like, desc } = require('drizzle-orm');

// Služba pro manipulaci s texty a tématy v databázi
class TextRepository {
  /**
   * Vytvoří nové téma nebo vrátí existující
   * @param {string} name - Název tématu
   * @param {string} description - Popis tématu (volitelné)
   * @returns {Promise<Object>} - Objekt tématu
   */
  async createOrGetTopic(name, description = '') {
    try {
      // Nejprve se pokusíme najít existující téma
      const existingTopic = await db
        .select()
        .from(topics)
        .where(eq(topics.name, name))
        .limit(1);

      // Pokud téma existuje, vrátíme ho
      if (existingTopic && existingTopic.length > 0) {
        return existingTopic[0];
      }

      // Jinak vytvoříme nové téma
      const newTopic = await db
        .insert(topics)
        .values({
          name,
          description,
          updatedAt: new Date()
        })
        .returning();

      return newTopic[0];
    } catch (error) {
      console.error('Chyba při vytváření tématu:', error);
      throw error;
    }
  }

  /**
   * Uloží zpracovaný text do databáze
   * @param {string} originalText - Původní text
   * @param {string} processedText - Zpracovaný text
   * @param {number} topicId - ID tématu
   * @returns {Promise<Object>} - Uložený text
   */
  async saveProcessedText(originalText, processedText, topicId) {
    try {
      const result = await db
        .insert(processedTexts)
        .values({
          originalText,
          processedText,
          topicId,
          updatedAt: new Date()
        })
        .returning();

      return result[0];
    } catch (error) {
      console.error('Chyba při ukládání zpracovaného textu:', error);
      throw error;
    }
  }

  /**
   * Získá všechna témata
   * @returns {Promise<Array>} - Seznam témat
   */
  async getAllTopics() {
    try {
      return await db.select().from(topics).orderBy(desc(topics.updatedAt));
    } catch (error) {
      console.error('Chyba při získávání témat:', error);
      throw error;
    }
  }

  /**
   * Získá všechny texty pro dané téma
   * @param {number} topicId - ID tématu
   * @returns {Promise<Array>} - Seznam textů
   */
  async getTextsByTopic(topicId) {
    try {
      return await db
        .select()
        .from(processedTexts)
        .where(eq(processedTexts.topicId, topicId))
        .orderBy(desc(processedTexts.createdAt));
    } catch (error) {
      console.error('Chyba při získávání textů:', error);
      throw error;
    }
  }

  /**
   * Vyhledá témata podle názvu
   * @param {string} query - Vyhledávací dotaz
   * @returns {Promise<Array>} - Seznam témat
   */
  async searchTopics(query) {
    try {
      // Debug: vypíše parametry dotazu
      console.log('Vyhledávám témata s dotazem:', query);
      
      // Upravený dotaz pro case-insensitive vyhledávání
      const searchQuery = query.toLowerCase();
      
      // Získat všechna témata a filtrovat je ručně (pro case-insensitive porovnání)
      const allTopics = await db
        .select()
        .from(topics)
        .orderBy(desc(topics.updatedAt));
      
      // Filtrujeme témata, která obsahují hledaný řetězec (bez ohledu na velikost písmen)
      const filteredTopics = allTopics.filter(topic => 
        topic.name.toLowerCase().includes(searchQuery)
      );
      
      console.log('Nalezeno témat:', filteredTopics.length);
      
      return filteredTopics;
    } catch (error) {
      console.error('Chyba při vyhledávání témat:', error);
      throw error;
    }
  }
}

module.exports = new TextRepository();
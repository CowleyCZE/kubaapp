const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the Gemini API with the API key from environment variables
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.warn('Warning: GEMINI_API_KEY not found in environment variables');
}

const genAI = new GoogleGenerativeAI(API_KEY || 'default_key');

// Pomocná funkce pro kontrolu API klíče
const validateApiKey = () => {
  if (!API_KEY || API_KEY === 'default_key') {
    throw new Error('API key for Gemini AI is not configured');
  }
};

/**
 * Analyze and structure text using Gemini AI
 * @param {string} text - The text to analyze
 * @returns {Promise<string>} - HTML formatted text with structure
 */
exports.analyzeAndStructureText = async (text) => {
  try {
    // Check for valid API key
    validateApiKey();

    // Get Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    // Create a prompt that instructs Gemini how to analyze and structure the text
    const prompt = `
    Analyzuj následující text, identifikuj hlavní myšlenky a témata, a poté text organizuj s následujícími pravidly:
    
    1. Přidej nadpisy s dnešním datem pro každou hlavní část nebo téma
    2. Čísluj jednotlivé body
    3. Zachovej všechny důležité informace z původního textu
    4. Vrať text ve formátu HTML s použitím tagů jako <h2>, <ol>, <li>, <p>
    5. Pokud je třeba zvýraznit důležité informace, použij <strong>
    6. Vrať pouze zpracovaný text v HTML bez dalších komentářů
    
    Text k analýze:
    ${text}
    `;

    // Generate structured text from Gemini
    const result = await model.generateContent(prompt);
    let processedText = result.response.text();

    // Odstranit značky Markdown kódu, pokud existují
    if (processedText.startsWith('```html')) {
      processedText = processedText.substring(7);
    } else if (processedText.startsWith('```')) {
      processedText = processedText.substring(3);
    }
    
    if (processedText.endsWith('```')) {
      processedText = processedText.substring(0, processedText.length - 3);
    }
    
    // Odstranit značky ``` kdekoliv v textu (včetně na konci)
    processedText = processedText.replace(/```/g, '');
    
    // Odstranit zbývající značky newline na začátku a konci
    processedText = processedText.trim();

    // Return the processed HTML content
    return processedText;
  } catch (error) {
    console.error('Gemini API error:', error);
    
    // Handle different types of errors
    if (error.message.includes('API key')) {
      throw new Error('Neplatný API klíč pro Gemini AI');
    }
    
    if (error.message.includes('quota')) {
      throw new Error('Překročen limit požadavků na Gemini API');
    }
    
    throw new Error('Chyba při zpracování textu pomocí Gemini AI: ' + error.message);
  }
};

/**
 * Identifikuje téma textu pomocí Gemini AI
 * @param {string} text - Text k analýze
 * @returns {Promise<string>} - Identifikované téma
 */
exports.identifyTopic = async (text) => {
  try {
    // Check for valid API key
    validateApiKey();

    // Get Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    // Limit text length for topic identification
    const truncatedText = text.length > 1000 ? text.substring(0, 1000) + '...' : text;

    // Create prompt for topic identification
    const prompt = `
    Analyzuj následující text a identifikuj jeho hlavní téma.
    
    Vrať POUZE název tématu (1-3 slova, podstatné jméno) bez jakýchkoliv dalších komentářů nebo vysvětlení.
    Název tématu musí být v češtině a musí být stručný a výstižný.
    
    Text k analýze:
    ${truncatedText}
    `;

    // Generate topic
    const result = await model.generateContent(prompt);
    let topic = result.response.text().trim();

    // Očištění od uvozovek a dalších nepotřebných znaků
    topic = topic.replace(/^["']|["']$/g, '').trim();

    // If topic is too long or contains sentences, truncate it
    if (topic.length > 30 || topic.includes('.')) {
      const words = topic.split(/\s+/);
      topic = words.slice(0, 3).join(' ');
    }

    console.log(`Identified topic: "${topic}"`);
    return topic || 'Obecné téma';
  } catch (error) {
    console.error('Error identifying topic:', error);
    // Return a default topic in case of an error
    return 'Obecné téma';
  }
};

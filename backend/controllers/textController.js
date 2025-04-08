const geminiService = require('../services/geminiService');
const textRepository = require('../database/textRepository');

/**
 * Process text using Gemini AI to analyze, organize, and format it
 * with automatic numbering and date headers
 */
exports.processText = async (req, res, next) => {
  try {
    const { text, topic } = req.body;
    
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ message: 'Prosím zadejte platný text k analýze' });
    }
    
    // Identifikace nebo vytvoření tématu
    let topicName = topic;
    
    if (!topicName) {
      // Pokud není téma explicitně uvedeno, můžeme požádat Gemini AI o identifikaci tématu
      topicName = await geminiService.identifyTopic(text);
    }
    
    // Vytvoření nebo získání existujícího tématu z databáze
    const topicObj = await textRepository.createOrGetTopic(topicName);
    
    // Process text using Gemini AI
    const processedText = await geminiService.analyzeAndStructureText(text);
    
    // Uložení zpracovaného textu do databáze
    await textRepository.saveProcessedText(text, processedText, topicObj.id);
    
    // Return the processed text with topic information
    res.status(200).json({ 
      processedText,
      topic: {
        id: topicObj.id,
        name: topicObj.name
      }
    });
  } catch (error) {
    console.error('Error in processText controller:', error);
    
    // Check for specific API errors
    if (error.message.includes('API key')) {
      return res.status(500).json({ message: 'Problém s API klíčem Gemini. Kontaktujte administrátora.' });
    }
    
    if (error.message.includes('timeout') || error.message.includes('network')) {
      return res.status(503).json({ message: 'Nepodařilo se spojit s Gemini API. Zkuste to prosím později.' });
    }
    
    // Database errors
    if (error.message.includes('database') || error.code === '23505') {
      return res.status(500).json({ message: 'Problém s databází. Zkuste to prosím později.' });
    }
    
    // Pass other errors to the error handler
    next(error);
  }
};

/**
 * Získá seznam všech témat
 */
exports.getAllTopics = async (req, res, next) => {
  try {
    const topics = await textRepository.getAllTopics();
    res.status(200).json({ topics });
  } catch (error) {
    console.error('Error getting topics:', error);
    next(error);
  }
};

/**
 * Získá všechny texty pro dané téma
 */
exports.getTextsByTopic = async (req, res, next) => {
  try {
    const { topicId } = req.params;
    
    if (!topicId || isNaN(topicId)) {
      return res.status(400).json({ message: 'Neplatné ID tématu' });
    }
    
    const texts = await textRepository.getTextsByTopic(parseInt(topicId, 10));
    res.status(200).json({ texts });
  } catch (error) {
    console.error('Error getting texts by topic:', error);
    next(error);
  }
};

/**
 * Vyhledá témata podle názvu
 */
exports.searchTopics = async (req, res, next) => {
  try {
    const { query } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ message: 'Zadejte platný vyhledávací dotaz' });
    }
    
    // Dekódovat URL parametry
    const decodedQuery = decodeURIComponent(query);
    console.log('Dekódovaný vyhledávací dotaz:', decodedQuery);
    
    const topics = await textRepository.searchTopics(decodedQuery);
    res.status(200).json({ topics });
  } catch (error) {
    console.error('Error searching topics:', error);
    next(error);
  }
};

// API utility for communicating with the backend

/**
 * Sends text to the backend for processing with Gemini AI
 * @param {string} text - The text to be processed
 * @returns {Promise<string>} The processed text
 */
export const processTextWithAPI = async (text) => {
  try {
    // Použití relativní URL zajistí, že API požadavky budou fungovat i po nasazení
    const response = await fetch('/api/process-text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Chyba při komunikaci se serverem');
    }

    const data = await response.json();
    return data.processedText;
  } catch (error) {
    console.error('API Error:', error);
    throw new Error('Nepodařilo se zpracovat text. Prosím zkuste to znovu později.');
  }
};

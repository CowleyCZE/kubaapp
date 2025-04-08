import React, { createContext, useState } from 'react';
import { processTextWithAPI } from '../utils/api';

export const TextContext = createContext();

export const TextProvider = ({ children }) => {
  const [processedText, setProcessedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const processText = async (text) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await processTextWithAPI(text);
      setProcessedText(result);
    } catch (err) {
      console.error('Error processing text:', err);
      setError(err.message || 'Došlo k chybě při zpracování textu. Zkuste to prosím znovu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TextContext.Provider value={{ 
      processedText, 
      isLoading, 
      error, 
      processText 
    }}>
      {children}
    </TextContext.Provider>
  );
};

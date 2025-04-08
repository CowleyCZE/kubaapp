import React, { useContext } from 'react';
import { TextContext } from '../context/TextContext';
import LoadingSpinner from './LoadingSpinner';

const TextOutput = () => {
  const { processedText, isLoading } = useContext(TextContext);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(processedText)
      .then(() => {
        alert('Text zkopírován do schránky!');
      })
      .catch(err => {
        console.error('Nepodařilo se zkopírovat text: ', err);
      });
  };

  return (
    <div className="card output-card h-100">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Výsledek</h5>
        {processedText && (
          <button 
            className="btn btn-sm btn-outline-secondary" 
            onClick={copyToClipboard}
            title="Kopírovat do schránky"
          >
            <i className="fas fa-copy"></i>
          </button>
        )}
      </div>
      <div className="card-body">
        {isLoading ? (
          <LoadingSpinner />
        ) : processedText ? (
          <div className="processed-text" dangerouslySetInnerHTML={{ __html: processedText }}></div>
        ) : (
          <div className="text-muted text-center empty-state">
            <i className="fas fa-file-alt fa-3x mb-3"></i>
            <p>Zde se zobrazí strukturovaný text po analýze</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TextOutput;

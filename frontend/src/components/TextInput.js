import React, { useState, useContext } from 'react';
import { TextContext } from '../context/TextContext';

const TextInput = () => {
  const [text, setText] = useState('');
  const { processText, isLoading, error } = useContext(TextContext);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      processText(text);
    }
  };

  return (
    <div className="card input-card">
      <div className="card-header">
        <h5 className="mb-0">Zadejte text</h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <textarea
              className="form-control"
              rows="10"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Zadejte text, který chcete analyzovat a strukturovat..."
              disabled={isLoading}
            ></textarea>
          </div>
          
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          
          <button 
            type="submit" 
            className="btn btn-primary w-100"
            disabled={isLoading || !text.trim()}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Zpracování...
              </>
            ) : (
              <>
                <i className="fas fa-magic me-2"></i>
                Analyzovat a strukturovat
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TextInput;

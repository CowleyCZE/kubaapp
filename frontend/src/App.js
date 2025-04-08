import React from 'react';
import Header from './components/Header';
import TextInput from './components/TextInput';
import TextOutput from './components/TextOutput';
import { TextProvider } from './context/TextContext';

function App() {
  return (
    <TextProvider>
      <div className="container app-container">
        <Header />
        <div className="row mt-4">
          <div className="col-md-6 mb-4">
            <TextInput />
          </div>
          <div className="col-md-6">
            <TextOutput />
          </div>
        </div>
      </div>
    </TextProvider>
  );
}

export default App;

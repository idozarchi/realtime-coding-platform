import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Lobby from './components/Lobby';
import CodeBlock from './components/CodeBlock';
import './App.css';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/code-block/:id" element={<CodeBlock />} />
      </Routes>
    </div>
  );
}

export default App;

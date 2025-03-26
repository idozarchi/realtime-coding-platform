import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Lobby from './pages/Lobby/Lobby';
import CodeBlock from './pages/CodeBlock/CodeBlock';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Lobby />} />
          <Route path="/code-block/:id" element={<CodeBlock />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

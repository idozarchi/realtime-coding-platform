import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const codeBlocks = [
  { id: 1, name: "Async Case" },
  { id: 2, name: "Closure Example" },
  { id: 3, name: "Recursion" },
  { id: 4, name: "Event Loop" }
];

function Home() {
  const navigate = useNavigate();

  const handleSelectBlock = (id) => {
    navigate(`/code/${id}`); // Navigate to the code block page
  };

  return (
    <div className="home-container">
      <h1 className="home-title">Choose a Code Block</h1>
      <ul className="code-block-list">
        {codeBlocks.map((block) => (
          <li key={block.id} className="code-block-item" onClick={() => handleSelectBlock(block.id)}>
            {block.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Home;

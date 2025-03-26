import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Lobby.css';

interface CodeBlock {
  id: string;
  title: string;
  description: string;
  language: string;
  difficulty: string;
}

const Lobby: React.FC = () => {
  const navigate = useNavigate();
  const [codeBlocks, setCodeBlocks] = useState<CodeBlock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch code blocks from the server
    const fetchCodeBlocks = async () => {
      try {
        const response = await fetch('/api/code-blocks');
        if (!response.ok) {
          throw new Error('Failed to fetch code blocks');
        }
        const data = await response.json();
        setCodeBlocks(data);
      } catch (error) {
        console.error('Error fetching code blocks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCodeBlocks();
  }, []);

  const handleCodeBlockClick = (codeBlockId: string) => {
    navigate(`/code-block/${codeBlockId}`);
  };

  if (loading) {
    return <div className="lobby-container">Loading...</div>;
  }

  return (
    <div className="lobby-container">
      <h1 className="lobby-title">Code Blocks</h1>
      <div className="lobby-actions">
        <button onClick={() => navigate('/create-code-block')}>
          Create New Code Block
        </button>
      </div>
      <ul className="code-block-list">
        {codeBlocks.map((block) => (
          <li
            key={block.id}
            className="code-block-item"
            onClick={() => handleCodeBlockClick(block.id)}
          >
            <h2>{block.title}</h2>
            <p>{block.description}</p>
            <div>
              <span>{block.language}</span>
              <span> • </span>
              <span>{block.difficulty}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Lobby; 
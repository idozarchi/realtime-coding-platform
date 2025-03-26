import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Lobby.css';

function Lobby() {
  const navigate = useNavigate();
  const [codeBlocks, setCodeBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCodeBlocks = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/codeblocks`);
        if (!response.ok) {
          throw new Error('Failed to fetch code blocks');
        }
        const data = await response.json();
        setCodeBlocks(data);
      } catch (err) {
        console.error('Error fetching code blocks:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCodeBlocks();
  }, []);

  const handleSelectBlock = (id) => {
    navigate(`/code-block/${id}`);
  };

  if (loading) return <div className="lobby-container">Loading...</div>;
  if (error) return <div className="lobby-container">Error: {error}</div>;

  return (
    <div className="lobby-container">
      <h1 className="lobby-title">Choose a Code Block</h1>
      <ul className="code-block-list">
        {codeBlocks.map((block) => (
          <li key={block._id} className="code-block-item" onClick={() => handleSelectBlock(block._id)}>
            {block.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Lobby; 
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const [codeBlocks, setCodeBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCodeBlocks = async () => {
      try {
        console.log('Fetching code blocks from:', `${process.env.REACT_APP_API_URL}/api/codeblocks`);
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/codeblocks`);
        console.log('Response status:', response.status);
        if (!response.ok) {
          throw new Error('Failed to fetch code blocks');
        }
        const data = await response.json();
        console.log('Received code blocks:', data);
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
    navigate(`/code/${id}`);
  };

  if (loading) return <div className="home-container">Loading...</div>;
  if (error) return <div className="home-container">Error: {error}</div>;

  return (
    <div className="home-container">
      <h1 className="home-title">Choose a Code Block</h1>
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

export default Home;

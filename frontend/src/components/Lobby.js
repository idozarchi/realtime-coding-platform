import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Button from './Button';
import CreateBlockForm from './CreateBlockForm';
import './Lobby.css'; // Import the CSS file

const Lobby = () => {
  const [codeBlocks, setCodeBlocks] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newBlock, setNewBlock] = useState({
    name: '',
    initialCode: '',
    solution: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCodeBlocks = async () => {
      try {
        console.log('Fetching code blocks from:', `${process.env.REACT_APP_API_URL}/api/codeblocks`);
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/codeblocks`, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        setCodeBlocks(response.data);
      } catch (error) {
        console.error('Error fetching code blocks:', error);
        setError('Failed to fetch code blocks. Please try again later.');
      }
    };

    fetchCodeBlocks();
  }, []);

  const handleCreateBlock = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/codeblocks`, newBlock);
      setCodeBlocks([...codeBlocks, response.data]);
      setShowCreateForm(false);
      setNewBlock({ name: '', initialCode: '', solution: '' });
    } catch (error) {
      console.error('Error creating code block:', error);
      setError(error.response?.data?.message || 'Failed to create code block. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lobby-container">
      <h1>Choose code block</h1>
      
      <Button onClick={() => setShowCreateForm(true)}>
        Create New Code Block
      </Button>

      {showCreateForm && (
        <CreateBlockForm
          newBlock={newBlock}
          setNewBlock={setNewBlock}
          onSubmit={handleCreateBlock}
          onCancel={() => setShowCreateForm(false)}
          error={error}
          loading={loading}
        />
      )}

      <div className="code-blocks-list">
        {codeBlocks.map((block) => (
          <div
            key={block._id}
            className="code-block-item"
            onClick={() => navigate(`/code-block/${block._id}`)}
          >
            <h2>{block.name}</h2>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Lobby;

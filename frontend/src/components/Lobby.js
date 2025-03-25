import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/codeblocks`);
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
      
      <button 
        className="create-block-btn"
        onClick={() => setShowCreateForm(true)}
      >
        Create New Code Block
      </button>

      {showCreateForm && (
        <div className="create-block-form">
          <h2>Create New Code Block</h2>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleCreateBlock}>
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                value={newBlock.name}
                onChange={(e) => setNewBlock({...newBlock, name: e.target.value})}
                required
                placeholder="Enter code block name"
              />
            </div>
            <div className="form-group">
              <label>Initial Code:</label>
              <textarea
                value={newBlock.initialCode}
                onChange={(e) => setNewBlock({...newBlock, initialCode: e.target.value})}
                required
                placeholder="Enter initial code"
              />
            </div>
            <div className="form-group">
              <label>Solution:</label>
              <textarea
                value={newBlock.solution}
                onChange={(e) => setNewBlock({...newBlock, solution: e.target.value})}
                required
                placeholder="Enter solution code"
              />
            </div>
            <div className="form-buttons">
              <button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create'}
              </button>
              <button type="button" onClick={() => setShowCreateForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
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

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateBlockForm from '../../components/CreateBlockForm';
import Button from '../../ui/Button';
import CodeBlockCard from '../../components/CodeBlockCard/CodeBlockCard';
import './Lobby.css';

function Lobby() {
  const navigate = useNavigate();
  const [codeBlocks, setCodeBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newBlock, setNewBlock] = useState({
    name: '',
    initialCode: '',
    solution: ''
  });
  const [createError, setCreateError] = useState(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchCodeBlocks();
  }, []);

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

  const handleSelectBlock = (id) => {
    navigate(`/api/codeblocks/${id}`);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/codeblocks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newBlock),
      });

      if (!response.ok) {
        throw new Error('Failed to create code block');
      }

      const createdBlock = await response.json();
      setCodeBlocks([...codeBlocks, createdBlock]);
      setShowCreateForm(false);
      setNewBlock({ name: '', initialCode: '', solution: '' });
    } catch (err) {
      console.error('Error creating code block:', err);
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setNewBlock({ name: '', initialCode: '', solution: '' });
    setCreateError(null);
  };

  if (loading) return <div className="lobby-container">Loading...</div>;
  if (error) return <div className="lobby-container">Error: {error}</div>;

  return (
    <div className="lobby-container">
      <h1 className="lobby-title">Choose a Code Block</h1>
      <div className="lobby-actions">
        <Button onClick={() => setShowCreateForm(true)}>Create New Block</Button>
      </div>
      {showCreateForm && (
        <CreateBlockForm
          newBlock={newBlock}
          setNewBlock={setNewBlock}
          onSubmit={handleCreateSubmit}
          onCancel={handleCancel}
          error={createError}
          loading={creating}
        />
      )}
      <ul className="code-block-list">
        {codeBlocks.map((block) => (
          <CodeBlockCard
            key={block.id}
            block={block}
            onClick={handleSelectBlock}
          />
        ))}
      </ul>
    </div>
  );
}

export default Lobby; 
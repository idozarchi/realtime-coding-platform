import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CreateBlockForm from '../../components/CreateBlockForm/CreateBlockForm';
import Button from '../../ui/Button';
import CodeBlockCard from '../../components/CodeBlockCard/CodeBlockCard';
import './Lobby.css';
import CodeBlockList from '../../components/Lobby/CodeBlockList';

const Lobby = () => {
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
    document.title = 'RTCP Lobby';
  }, []);

  useEffect(() => {
    const fetchCodeBlocks = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/codeblocks`);
        setCodeBlocks(response.data);
      } catch (error) {
        setError('Failed to fetch code blocks');
        console.error('Error fetching code blocks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCodeBlocks();
  }, []);

  const handleSelectBlock = (block) => {
    navigate(`/codeblock/${block.id}`);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/codeblocks`, newBlock);
      setCodeBlocks([...codeBlocks, response.data]);
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

  const handleCreateBlock = async (newBlock) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/codeblocks`, newBlock);
      setCodeBlocks([...codeBlocks, response.data]);
      setShowCreateForm(false);
      setCreateError(null);
    } catch (error) {
      setCreateError('Failed to create code block');
      console.error('Error creating code block:', error);
    }
  };

  const handleJoinBlock = (id) => {
    navigate(`/codeblock/${id}`);
  };

  if (loading) return <div className="lobby-container">Loading...</div>;
  if (error) return <div className="lobby-container">Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Code Blocks</h1>
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
      <CodeBlockList codeBlocks={codeBlocks} onJoinBlock={handleJoinBlock} />
    </div>
  );
};

export default Lobby; 
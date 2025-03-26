import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import io from 'socket.io-client';
import './CodeBlock.css';

const socket = io(process.env.REACT_APP_API_URL);

function CodeBlock() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [solution, setSolution] = useState('');
  const [role, setRole] = useState(null);
  const [studentCount, setStudentCount] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [isSolutionCorrect, setIsSolutionCorrect] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCodeBlock = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/codeblocks/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch code block');
        }
        const data = await response.json();
        setCode(data.initialCode);
        setSolution(data.solution);
      } catch (err) {
        console.error('Error fetching code block:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCodeBlock();
  }, [id]);

  useEffect(() => {
    socket.emit('join-room', id);

    socket.on('role-assigned', ({ role }) => {
      console.log('Role assigned:', role);
      setRole(role);
    });

    socket.on('room-state', ({ currentCode, studentCount }) => {
      if (currentCode) {
        setCode(currentCode);
      }
      setStudentCount(studentCount);
    });

    socket.on('code-update', ({ code }) => {
      if (role === 'student') {
        setCode(code);
      }
    });

    socket.on('student-count', (count) => {
      setStudentCount(count);
    });

    socket.on('mentor-left', () => {
      alert('Mentor has left the room. You will be redirected to the lobby.');
      navigate('/');
    });

    socket.on('solution-success', () => {
      setIsSolutionCorrect(true);
    });

    return () => {
      socket.off('role-assigned');
      socket.off('room-state');
      socket.off('code-update');
      socket.off('student-count');
      socket.off('mentor-left');
      socket.off('solution-success');
    };
  }, [id, role, navigate]);

  const handleEditorChange = (value) => {
    if (role === 'mentor') {
      setCode(value);
      socket.emit('code-update', { roomId: id, code: value });
    }
  };

  const handleShowSolution = () => {
    if (!showSolution) {
      setCode(solution);
    } else {
      // When hiding solution, revert to the current code in the room
      socket.emit('code-update', { roomId: id, code });
    }
    setShowSolution(!showSolution);
  };

  const handleCheckSolution = () => {
    if (code.trim() === solution.trim()) {
      setIsSolutionCorrect(true);
      socket.emit('solution-success', { roomId: id });
    }
  };

  if (loading) return <div className="code-block-container">Loading...</div>;
  if (error) return <div className="code-block-container">Error: {error}</div>;

  return (
    <div className="code-block-container">
      <div className="code-block-header">
        <h1>Code Block {id}</h1>
        <div className="role-info">
          Role: {role}
          {role === 'student' && <span> (Students in room: {studentCount})</span>}
        </div>
      </div>
      <div className="editor-container">
        <Editor
          height="70vh"
          defaultLanguage="javascript"
          value={code}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            readOnly: role === 'student',
            automaticLayout: true,
          }}
        />
      </div>
      <div className="code-block-controls">
        {role === 'mentor' && (
          <button className="solution-button" onClick={handleShowSolution}>
            {showSolution ? 'Hide Solution' : 'Show Solution'}
          </button>
        )}
        {role === 'student' && !isSolutionCorrect && (
          <button className="check-solution-button" onClick={handleCheckSolution}>
            Check Solution
          </button>
        )}
        {isSolutionCorrect && (
          <div className="success-message">
            Congratulations! Your solution is correct!
          </div>
        )}
      </div>
    </div>
  );
}

export default CodeBlock; 
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import Button from '../../components/Button/Button';
import './CodeBlock.css';

interface CodeBlock {
  id: string;
  name: string;
  initialCode: string;
  solution: string;
}

const CodeBlock: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [codeBlock, setCodeBlock] = useState<CodeBlock | null>(null);
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCodeBlock = async () => {
      try {
        const response = await fetch(`/api/code-blocks/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch code block');
        }
        const data = await response.json();
        setCodeBlock(data);
        setCode(data.initialCode);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching code block:', error);
        setLoading(false);
      }
    };

    fetchCodeBlock();
  }, [id]);

  const handleCodeChange = (value: string | undefined) => {
    if (value) {
      setCode(value);
    }
  };

  const handleRunCode = async () => {
    try {
      const response = await fetch('/api/run-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error('Failed to run code');
      }

      const data = await response.json();
      setOutput(data.output);
    } catch (error) {
      console.error('Error running code:', error);
      setOutput('Error running code. Please try again.');
    }
  };

  if (loading) {
    return <div className="code-block-container">Loading...</div>;
  }

  if (!codeBlock) {
    return <div className="code-block-container">Code block not found</div>;
  }

  return (
    <div className="code-block-container">
      <header className="code-block-header">
        <h1 className="code-block-title">{codeBlock.name}</h1>
        <Button onClick={() => navigate('/lobby')}>Back to Lobby</Button>
      </header>
      <div className="code-block-content">
        <div className="editor-container">
          <Editor
            height="100%"
            defaultLanguage="javascript"
            value={code}
            onChange={handleCodeChange}
            theme="vs"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              scrollBeyond: false,
            }}
          />
        </div>
        <div className="output-container">
          <h2 className="output-title">Output</h2>
          <pre className="output-content">{output}</pre>
        </div>
      </div>
    </div>
  );
};

export default CodeBlock; 
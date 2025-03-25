import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import Editor from '@monaco-editor/react';
import Button from '../../ui/Button';
import './CodeBlock.css';

const CodeBlock = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [codeBlock, setCodeBlock] = useState(null);
    const [code, setCode] = useState('');
    const [studentCode, setStudentCode] = useState('');
    const [role, setRole] = useState(null);
    const [studentCount, setStudentCount] = useState(0);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showSolution, setShowSolution] = useState(false);
    const [loading, setLoading] = useState(false);
    const socketRef = useRef();
    const hasReceivedRoomState = useRef(false);

    useEffect(() => {
        const fetchCodeBlock = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/codeblocks/${id}`);
                setCodeBlock(response.data);
                // Only set initial code if we haven't received any updates yet
                if (!hasReceivedRoomState.current) {
                    setCode(response.data.initialCode);
                    setStudentCode(response.data.initialCode);
                }
            } catch (error) {
                console.error('Error fetching code block:', error);
                navigate('/');
            }
        };

        fetchCodeBlock();
    }, [id, navigate]);

    useEffect(() => {
        socketRef.current = io(process.env.REACT_APP_API_URL);

        socketRef.current.emit('join-room', { roomId: id });

        socketRef.current.on('role-assigned', (data) => {
            console.log('Role assigned:', data.role);
            setRole(data.role);
            // If user is mentor, they should be in read-only mode
            if (data.role === 'mentor') {
                setShowSolution(true); // Show solution by default for mentor
            }
        });

        socketRef.current.on('room-state', (data) => {
            console.log('Received room state:', data);
            setRole(data.role);
            setStudentCount(data.studentCount);
            if (data.currentCode) {
                setCode(data.currentCode);
                setStudentCode(data.currentCode);
                hasReceivedRoomState.current = true;
            }
        });

        socketRef.current.on('code-update', (data) => {
            console.log('Received code update:', data);
            if (role === 'student') {
                setCode(data.code);
            }
        });

        socketRef.current.on('student-count', (data) => {
            console.log('Student count updated:', data);
            setStudentCount(data.count);
        });

        socketRef.current.on('mentor-left', () => {
            console.log('Mentor left the room');
            alert('The mentor has left the room. You will be redirected to the lobby.');
            setRole(null);
            setCode('');
            setStudentCode('');
            navigate('/');
        });

        socketRef.current.on('solution-success', () => {
            console.log('Solution success received');
            setShowSuccess(true);
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [id, navigate, role]);

    const handleCodeChange = async (value) => {
        // Only allow code changes if not in mentor mode
        if (role === 'mentor') {
            return;
        }

        setCode(value);
        // Only emit updates if not in mentor mode
        socketRef.current.emit('code-update', { roomId: id, code: value });
        // Save current code to database
        try {
            await axios.put(`${process.env.REACT_APP_API_URL}/api/codeblocks/${id}/current-code`, {
                currentCode: value
            }, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            console.error('Error saving current code:', error);
        }
        
        // Only check for solution match if not showing solution and not in mentor mode
        if (!showSolution && role !== 'mentor' && codeBlock && value === codeBlock.solution) {
            setShowSuccess(true);
            // Emit success event to all users in the room
            socketRef.current.emit('solution-success', { roomId: id });
        }
    };

    const handleSolutionToggle = () => {
        setShowSolution(!showSolution);
        if (!showSolution) {
            // When showing solution, store current student code
            setStudentCode(code);
        } else {
            // When hiding solution, restore student code
            setCode(studentCode);
        }
    };

    const handleReset = () => {
        setCode(codeBlock.initialCode);
        setStudentCode(codeBlock.initialCode);
        setShowSuccess(false);
    };

    const handleSubmit = () => {
        if (code === codeBlock.solution) {
            setShowSuccess(true);
            socketRef.current.emit('solution-success', { roomId: id });
        }
    };

    if (!codeBlock) {
        return <div>Loading...</div>;
    }

    return (
        <div className="code-block-container">
            <div className="code-block-header">
                <h1>{codeBlock.name}</h1>
                <div className="role-badge">
                    {role === 'mentor' ? 'Mentor' : 'Student'}
                </div>
                <div className="student-count">
                    Students in room: {studentCount}
                </div>
                {role === 'mentor' && (
                    <Button
                        variant="solution"
                        onClick={handleSolutionToggle}
                    >
                        {showSolution ? 'Hide Solution' : 'Show Solution'}
                    </Button>
                )}
            </div>

            <div className="editor-container">
                <Editor
                    height="70vh"
                    defaultLanguage="javascript"
                    value={showSolution ? codeBlock.solution : code}
                    onChange={handleCodeChange}
                    theme="vs-dark"
                    options={{
                        readOnly: role === 'mentor',
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: 'on',
                        scrollBeyond: false,
                    }}
                />
            </div>

            {role === 'student' && (
                <div className="student-controls">
                    <Button
                        variant="primary"
                        onClick={handleReset}
                        disabled={loading}
                    >
                        Reset Code
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        Submit Solution
                    </Button>
                </div>
            )}

            {showSuccess && role !== 'mentor' && (
                <div className="success-overlay">
                    <div className="success-content">
                        <span className="success-emoji">😊</span>
                        <h2>Congratulations!</h2>
                        <p>You've successfully completed the challenge!</p>
                        <Button
                            variant="primary"
                            onClick={() => navigate('/')}
                        >
                            Back to Lobby
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CodeBlock;

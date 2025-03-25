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
    const socketRef = useRef(null);
    const hasReceivedRoomState = useRef(false);

    // Initialize socket connection
    useEffect(() => {
        const initializeSocket = () => {
            if (!socketRef.current) {
                socketRef.current = io(process.env.REACT_APP_API_URL, {
                    transports: ['websocket'],
                    reconnection: true,
                    reconnectionAttempts: 5
                });

                // Join room
                socketRef.current.emit('join-room', { roomId: id });

                // Handle role assignment
                socketRef.current.on('role-assigned', (data) => {
                    console.log('Role assigned:', data.role);
                    if (data.role) {
                        setRole(data.role);
                        if (data.role === 'mentor') {
                            setShowSolution(true);
                        }
                    }
                });

                // Handle mentor leaving
                socketRef.current.on('mentor-left', () => {
                    console.log('Mentor left the room');
                    alert('The mentor has left the room. You will be redirected to the lobby.');
                    setRole(null);
                    setCode('');
                    setStudentCode('');
                    navigate('/');
                });

                // Handle room state updates
                socketRef.current.on('room-state', (data) => {
                    console.log('Received room state:', data);
                    if (data.role) {
                        setRole(data.role);
                    }
                    setStudentCount(data.studentCount || 0);
                    if (data.currentCode) {
                        setCode(data.currentCode);
                        setStudentCode(data.currentCode);
                        hasReceivedRoomState.current = true;
                    }
                });

                // Handle code updates from other students
                socketRef.current.on('code-update', (data) => {
                    console.log('Received code update:', data);
                    if (role === 'student') {
                        setCode(data.code);
                    }
                });

                // Handle student count updates
                socketRef.current.on('student-count', (data) => {
                    console.log('Student count updated:', data);
                    setStudentCount(data.count || 0);
                });

                // Handle solution success
                socketRef.current.on('solution-success', () => {
                    console.log('Solution success received');
                    setShowSuccess(true);
                });
            }
        };

        initializeSocket();

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [id, navigate, role]);

    // Fetch code block data
    useEffect(() => {
        const fetchCodeBlock = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/codeblocks/${id}`);
                setCodeBlock(response.data);
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

    const handleCodeChange = async (value) => {
        if (role === 'mentor') {
            return;
        }

        setCode(value);
        if (socketRef.current) {
            socketRef.current.emit('code-update', { roomId: id, code: value });
        }
        
        try {
            await axios.put(`${process.env.REACT_APP_API_URL}/api/codeblocks/${id}/current-code`, {
                currentCode: value
            });
        } catch (error) {
            console.error('Error saving current code:', error);
        }
        
        if (!showSolution && role !== 'mentor' && codeBlock && value === codeBlock.solution) {
            setShowSuccess(true);
            if (socketRef.current) {
                socketRef.current.emit('solution-success', { roomId: id });
            }
        }
    };

    const handleSolutionToggle = () => {
        setShowSolution(!showSolution);
        if (!showSolution) {
            setStudentCode(code);
        } else {
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
            if (socketRef.current) {
                socketRef.current.emit('solution-success', { roomId: id });
            }
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

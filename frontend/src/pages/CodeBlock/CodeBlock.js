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
    const hasJoinedRoom = useRef(false);

    // Initialize socket connection and handle role assignment
    useEffect(() => {
        const connectSocket = () => {
            const socket = io(process.env.REACT_APP_API_URL, {
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                timeout: 10000
            });
            socketRef.current = socket;

            socket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
            });

            socket.on('connect', () => {
                console.log('Socket connected successfully');
                if (!hasJoinedRoom.current) {
                    socket.emit('join-room', id);
                    hasJoinedRoom.current = true;
                }
            });

            // Handle role assignment
            socket.on('role-assigned', (data) => {
                console.log('Role assigned:', data.role);
                setRole(data.role);
            });

            // Handle code updates from other students
            socket.on('code-update', (data) => {
                console.log('Received code update:', data);
                if (role === 'student') {
                    setStudentCode(data.code);
                } else if (role === 'mentor' && !showSolution) {
                    setCode(data.code);
                }
            });

            // Handle room state updates
            socket.on('room-state', (data) => {
                console.log('Received room state:', data);
                setStudentCount(data.studentCount || 0);
                if (data.currentCode) {
                    setStudentCode(data.currentCode);
                    setCode(data.currentCode);
                    hasReceivedRoomState.current = true;
                }
            });

            // Handle solution success
            socket.on('solution-success', () => {
                setShowSuccess(true);
            });

            // Handle mentor leaving
            socket.on('mentor-left', () => {
                alert('Mentor has left the room. You will be redirected to the lobby.');
                navigate('/');
            });

            // Handle student count updates
            socket.on('student-count', (count) => {
                setStudentCount(count);
            });
        };

        connectSocket();

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [id, navigate]); // Keep only id and navigate in dependencies

    // Fetch code block data
    useEffect(() => {
        const fetchCodeBlock = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/codeblocks/${id}`);
                setCodeBlock(response.data);
                
                // Only set initial code if we haven't received room state yet
                if (!hasReceivedRoomState.current) {
                    setCode(response.data.initialCode);
                    setStudentCode(response.data.initialCode);
                }
            } catch (error) {
                console.error('Error fetching code block:', error);
                if (error.response?.status === 404) {
                    alert('Code block not found. Redirecting to lobby...');
                } else {
                    alert('Error loading code block. Please try again later.');
                }
                navigate('/');
            } finally {
                setLoading(false);
            }
        };

        fetchCodeBlock();
    }, [id, navigate]);

    const handleCodeChange = async (value) => {
        if (role === 'mentor') {
            return;
        }

        // Update local state first
        setStudentCode(value);
        
        // Emit code update to other users
        if (socketRef.current) {
            socketRef.current.emit('code-update', { roomId: id, code: value });
        }
        
        // Save to database
        try {
            await axios.put(`${process.env.REACT_APP_API_URL}/api/codeblocks/${id}/current-code`, {
                currentCode: value
            });
        } catch (error) {
            console.error('Error saving current code:', error);
        }
        
        // Check for solution success
        if (!showSolution && role !== 'mentor' && codeBlock && value === codeBlock.solution) {
            setShowSuccess(true);
            if (socketRef.current) {
                socketRef.current.emit('solution-success', { roomId: id });
            }
        }
    };

    const handleShowSolution = () => {
        setShowSolution(!showSolution);
        if (!showSolution) {
            setCode(codeBlock.solution);
        } else {
            // When hiding solution, set code to the current code in the room
            setCode(studentCode);
        }
    };

    const handleReset = () => {
        const initialCode = codeBlock.initialCode;
        setCode(initialCode);
        setStudentCode(initialCode);
        setShowSuccess(false);
        if (socketRef.current) {
            socketRef.current.emit('code-update', { roomId: id, code: initialCode });
        }
    };

    const handleSubmit = () => {
        if (studentCode === codeBlock.solution) {
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
                        onClick={handleShowSolution}
                    >
                        {showSolution ? 'Hide Solution' : 'Show Solution'}
                    </Button>
                )}
            </div>

            <div className="editor-container">
                <Editor
                    height="70vh"
                    defaultLanguage="javascript"
                    value={showSolution ? codeBlock.solution : (role === 'student' ? studentCode : code)}
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
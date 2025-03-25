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
    const editorRef = useRef(null);

    useEffect(() => {
        const fetchCodeBlock = async () => {
            try {
                console.log('Fetching code block from:', `${process.env.REACT_APP_API_URL}/api/codeblocks/${id}`);
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/codeblocks/${id}`, {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                setCodeBlock(response.data);
                // Only set initial code if we haven't received room state yet
                if (!hasReceivedRoomState.current) {
                    setCode(response.data.initialCode);
                    setStudentCode(response.data.initialCode);
                }
            } catch (error) {
                console.error('Error fetching code block:', error);
            }
        };

        fetchCodeBlock();

        // Initialize socket connection
        const socketUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
        console.log('Connecting to socket server:', socketUrl);
        socketRef.current = io(socketUrl, {
            withCredentials: true,
            transports: ['websocket']
        });
        socketRef.current.emit('join-room', id);

        socketRef.current.on('role-assigned', (assignedRole) => {
            console.log('Role assigned:', assignedRole);
            setRole(assignedRole);
        });

        socketRef.current.on('room-state', (state) => {
            console.log('Received room state:', state);
            hasReceivedRoomState.current = true;
            setRole(state.role);
            setStudentCount(state.studentCount);
            if (state.currentCode) {
                console.log('Setting current code from room state:', state.currentCode);
                setCode(state.currentCode);
                setStudentCode(state.currentCode);
            } else if (codeBlock) {
                console.log('No current code in room, setting initial code');
                setCode(codeBlock.initialCode);
                setStudentCode(codeBlock.initialCode);
            }
        });

        socketRef.current.on('code-update', (newCode) => {
            console.log('Received code update:', newCode);
            if (newCode) {
                setCode(newCode);
                setStudentCode(newCode);
            }
        });

        socketRef.current.on('student-count', (count) => {
            setStudentCount(count);
        });

        socketRef.current.on('mentor-left', () => {
            console.log('Mentor left the room, disconnecting and redirecting');
            
            // Store initial code before disconnecting
            const initialCode = codeBlock?.initialCode || '';
            
            // Reset all state
            setCode(initialCode);
            setStudentCode(initialCode);
            setRole(null);
            setStudentCount(0);
            setShowSuccess(false);
            setShowSolution(false);
            
            // Show a message
            alert('The mentor has left the room. You will be redirected to the lobby.');
            
            // Disconnect socket after state is reset
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
            
            // Navigate and reload
            navigate('/');
            window.location.href = '/';
        });

        socketRef.current.on('solution-success', () => {
            setShowSuccess(true);
        });

        return () => {
            socketRef.current.disconnect();
        };
    }, [id, navigate]);

    // Hide success message when toggling solution view
    useEffect(() => {
        if (showSolution) {
            setShowSuccess(false);
        }
    }, [showSolution]);

    const handleCodeChange = async (event) => {
        const value = event.target.value;
        setCode(value);
        // Only emit updates if not in mentor mode
        if (role !== 'mentor') {
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
            </div>
            
            <div className="editor-container">
                <div className="editor-wrapper">
                    <div className="editor-header">
                        <div className="editor-title">Code Editor</div>
                        <div className="editor-status">
                            {/* Placeholder for editor status */}
                        </div>
                    </div>
                    <textarea
                        ref={editorRef}
                        value={code}
                        onChange={handleCodeChange}
                        readOnly={role === 'student'}
                        className="code-editor"
                        placeholder="Start coding here..."
                    />
                </div>

                <div className="solution-container">
                    <div className="solution-header">
                        <div className="solution-title">Solution</div>
                        <Button
                            variant="solution"
                            onClick={handleSolutionToggle}
                        >
                            {showSolution ? 'Hide Solution' : 'Show Solution'}
                        </Button>
                    </div>
                    {showSolution && (
                        <pre className="solution-code">
                            {codeBlock.solution}
                        </pre>
                    )}
                </div>
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
                        <button 
                            className="back-to-lobby-btn"
                            onClick={() => navigate('/')}
                        >
                            Back to Lobby
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CodeBlock;

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CodeEditor from '../../components/CodeEditor/CodeEditor';
import CodeBlockHeader from '../../components/CodeBlockHeader/CodeBlockHeader';
import StudentControls from '../../components/StudentControls/StudentControls';
import SuccessOverlay from '../../components/SuccessOverlay/SuccessOverlay';
import useSocketConnection from '../../hooks/useSocketConnection';
import './CodeBlock.css';

const CodeBlock = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [codeBlock, setCodeBlock] = useState(null);
    const [code, setCode] = useState('');
    const [studentCode, setStudentCode] = useState('');
    const [role, setRole] = useState(null);
    const [studentCount, setStudentCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showSolution, setShowSolution] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const hasReceivedRoomState = useRef(false);
    const currentRole = useRef(null);

    // Update the ref whenever role state changes
    useEffect(() => {
        currentRole.current = role;
    }, [role]);

    const socketRef = useSocketConnection(
        id,
        (data) => {
            console.log('Role assigned:', data.role);
            // Set role immediately when received
            setRole(data.role);
            currentRole.current = data.role;
        },
        (data) => {
            console.log('Received code update:', data);
            // Only update code based on current role
            if (currentRole.current === 'student') {
                setStudentCode(data.code);
            } else if (currentRole.current === 'mentor' && !showSolution) {
                setCode(data.code);
            }
        },
        (data) => {
            console.log('Received room state:', data);
            setStudentCount(data.studentCount || 0);
            if (data.currentCode) {
                setStudentCode(data.currentCode);
                setCode(data.currentCode);
                hasReceivedRoomState.current = true;
            }
        },
        () => setShowSuccess(true),
        () => {
            alert('Mentor has left the room. You will be redirected to the lobby.');
            navigate('/');
        },
        (count) => setStudentCount(count)
    );

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
        if (currentRole.current === 'mentor') {
            return;
        }

        setStudentCode(value);
        
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
        
        if (!showSolution && currentRole.current !== 'mentor' && codeBlock && value === codeBlock.solution) {
            setShowSuccess(true);
            if (socketRef.current) {
                socketRef.current.emit('solution-success', { roomId: id });
            }
        }
    };

    const handleReset = () => {
        setStudentCode(codeBlock.initialCode);
        if (socketRef.current) {
            socketRef.current.emit('code-update', { roomId: id, code: codeBlock.initialCode });
        }
    };

    const handleSubmit = async () => {
        if (studentCode === codeBlock.solution) {
            setShowSuccess(true);
            if (socketRef.current) {
                socketRef.current.emit('solution-success', { roomId: id });
            }
        } else {
            alert('Incorrect solution. Please try again!');
        }
    };

    const handleShowSolution = () => {
        setShowSolution(!showSolution);
    };

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (!codeBlock) {
        return null;
    }

    return (
        <div className="code-block-container">
            <CodeBlockHeader 
                title={codeBlock.name}
                role={currentRole.current}
                studentCount={studentCount}
                onShowSolution={handleShowSolution}
                showSolution={showSolution}
            />

            <div className="editor-container">
                <CodeEditor
                    value={showSolution ? codeBlock.solution : (currentRole.current === 'student' ? studentCode : code)}
                    onChange={handleCodeChange}
                    readOnly={currentRole.current === 'mentor'}
                />
            </div>

            {currentRole.current === 'student' && (
                <StudentControls
                    onReset={handleReset}
                    onSubmit={handleSubmit}
                    loading={loading}
                />
            )}

            {showSuccess && currentRole.current !== 'mentor' && (
                <SuccessOverlay onBackToLobby={() => navigate('/')} />
            )}
        </div>
    );
};

export default CodeBlock; 
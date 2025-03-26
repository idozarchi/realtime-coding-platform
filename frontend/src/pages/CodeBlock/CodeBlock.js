import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import useSocketConnection from '../../hooks/useSocketConnection';
import CodeBlockHeader from '../../components/CodeBlockHeader/CodeBlockHeader';
import CodeEditor from '../../components/CodeEditor/CodeEditor';
import StudentControls from '../../components/StudentControls/StudentControls';
import SuccessOverlay from '../../components/SuccessOverlay/SuccessOverlay';
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
    const hasReceivedRoomState = useRef(false);

    // Update title when codeBlock changes
    useEffect(() => {
        if (codeBlock) {
            document.title = `RTCP - ${codeBlock.name}`;
        }
    }, [codeBlock]);

    const socketRef = useSocketConnection(
        id,
        (role) => setRole(role),
        (data) => {
            console.log('Received code update:', data);
            if (role === 'student') {
                setStudentCode(data.code);
            } else if (role === 'mentor' && !showSolution) {
                setCode(data.code);
            }
        },
        (data) => {
            console.log('Received room state:', data);
            setStudentCount(data.studentCount || 0);
            if (data.currentCode) {
                setStudentCode(data.currentCode);
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

    useEffect(() => {
        const fetchCodeBlock = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/codeblocks/${id}`);
                setCodeBlock(response.data);
                if (!hasReceivedRoomState.current) {
                    setCode(response.data.initialCode);
                    setStudentCode(response.data.initialCode);
                }
            } catch (error) {
                console.error('Error fetching code block:', error);
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

        setStudentCode(value);
        
        if (socketRef.current) {
            socketRef.current.emit('code-update', { roomId: id, code: value });
        }

        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/codeblocks/${id}/save`, {
                code: value
            });
        } catch (error) {
            console.error('Error saving code:', error);
        }
        
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
            setCode(codeBlock.currentCode || codeBlock.initialCode);
        }
    };

    const handleReset = () => {
        setCode(codeBlock.initialCode);
        setStudentCode(codeBlock.initialCode);
        setShowSuccess(false);
        if (socketRef.current) {
            socketRef.current.emit('code-update', { roomId: id, code: codeBlock.initialCode });
        }
    };

    const handleSubmit = () => {
        if (studentCode === codeBlock.solution) {
            setShowSuccess(true);
            if (socketRef.current) {
                socketRef.current.emit('solution-success', { roomId: id });
            }
        } else {
            alert('Incorrect solution. Please try again!');
        }
    };

    if (!codeBlock) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="code-block-container">
            <CodeBlockHeader
                title={codeBlock.name}
                role={role}
                studentCount={studentCount}
                onShowSolution={handleShowSolution}
                showSolution={showSolution}
            />

            <div className="editor-container">
                <CodeEditor
                    value={showSolution ? codeBlock.solution : (role === 'student' ? studentCode : code)}
                    onChange={handleCodeChange}
                    readOnly={role === 'mentor'}
                />
            </div>

            {role === 'student' && (
                <StudentControls
                    onReset={handleReset}
                    onSubmit={handleSubmit}
                    loading={loading}
                />
            )}

            {showSuccess && role !== 'mentor' && (
                <SuccessOverlay onBackToLobby={() => navigate('/')} />
            )}
        </div>
    );
};

export default CodeBlock; 
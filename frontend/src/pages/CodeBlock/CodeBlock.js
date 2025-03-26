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
    const [studentCount, setStudentCount] = useState(0);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showSolution, setShowSolution] = useState(false);
    const [loading, setLoading] = useState(false);
    const hasReceivedRoomState = useRef(false);
    const socketRef = useSocketConnection(
        id,
        (data) => {
            console.log('Received code update:', data);
            if (socketRef.current?.role === 'student') {
                setStudentCode(data.code);
            } else if (socketRef.current?.role === 'mentor' && !showSolution) {
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
        if (socketRef.current?.role === 'mentor') {
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
        
        if (!showSolution && socketRef.current?.role !== 'mentor' && codeBlock && value === codeBlock.solution) {
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
                role={socketRef.current?.role}
                studentCount={studentCount}
                onShowSolution={handleShowSolution}
                showSolution={showSolution}
            />

            <div className="editor-container">
                <CodeEditor
                    value={showSolution ? codeBlock.solution : (socketRef.current?.role === 'student' ? studentCode : code)}
                    onChange={handleCodeChange}
                    readOnly={socketRef.current?.role === 'mentor'}
                />
            </div>

            {socketRef.current?.role === 'student' && (
                <StudentControls
                    onReset={handleReset}
                    onSubmit={handleSubmit}
                    loading={loading}
                />
            )}

            {showSuccess && socketRef.current?.role !== 'mentor' && (
                <SuccessOverlay onBackToLobby={() => navigate('/')} />
            )}
        </div>
    );
};

export default CodeBlock; 
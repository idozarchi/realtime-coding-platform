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
    const [showSuccess, setShowSuccess] = useState(false);
    const [showSolution, setShowSolution] = useState(false);
    const [loading, setLoading] = useState(false);
    const hasReceivedRoomState = useRef(false);
    const currentRole = useRef(null);

    // Update title when codeBlock changes
    useEffect(() => {
        if (codeBlock) {
            document.title = `RTCP - ${codeBlock.name}`;
        }
    }, [codeBlock]);

    const socketRef = useSocketConnection(
        id,
        (newRole) => {
            console.log('Role assigned:', newRole);
            currentRole.current = newRole;
            setRole(newRole);
        },
        (data) => {
            console.log('Code update received:', data);
            if (currentRole.current === 'student') {
                setCode(data.code);
            }
        },
        (data) => {
            console.log('Room state received:', data);
            hasReceivedRoomState.current = true;
            if (data.currentCode) {
                setCode(data.currentCode);
                setStudentCode(data.currentCode);
            }
        },
        () => {
            console.log('Solution success!');
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        },
        () => {
            console.log('Mentor left, redirecting to lobby...');
            navigate('/');
        },
        (count) => {
            console.log('Student count updated:', count);
            setStudentCount(count);
        }
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
            } finally {
                setLoading(false);
            }
        };

        fetchCodeBlock();
    }, [id]);

    const handleCodeChange = async (newCode) => {
        if (currentRole.current === 'student') {
            setStudentCode(newCode);
            socketRef.current.emit('code-update', { roomId: id, code: newCode });
        } else {
            setCode(newCode);
            socketRef.current.emit('code-update', { roomId: id, code: newCode });
        }

        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/codeblocks/${id}/save`, {
                code: currentRole.current === 'student' ? studentCode : newCode
            });
        } catch (error) {
            console.error('Error saving code:', error);
        }
    };

    const handleShowSolution = () => {
        if (currentRole.current === 'mentor') {
            setShowSolution(!showSolution);
        }
    };

    const handleSubmit = () => {
        if (currentRole.current === 'student' && studentCode === codeBlock.solution) {
            socketRef.current.emit('solution-success', { roomId: id });
        }
    };

    const handleReset = () => {
        if (currentRole.current === 'student') {
            setStudentCode(codeBlock.initialCode);
            socketRef.current.emit('code-update', { roomId: id, code: codeBlock.initialCode });
        } else {
            setCode(codeBlock.initialCode);
            socketRef.current.emit('code-update', { roomId: id, code: codeBlock.initialCode });
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!codeBlock) {
        return <div>Code block not found</div>;
    }

    return (
        <div className="flex flex-col h-screen">
            <CodeBlockHeader
                title={codeBlock.name}
                role={role}
                studentCount={studentCount}
                onShowSolution={handleShowSolution}
                showSolution={showSolution}
                onSubmit={handleSubmit}
                onReset={handleReset}
            />
            <div className="flex-1 p-4">
                <CodeEditor
                    code={role === 'student' ? studentCode : code}
                    onChange={handleCodeChange}
                    readOnly={role === 'student' && showSolution}
                    solution={showSolution ? codeBlock.solution : null}
                    showSuccess={showSuccess}
                />
            </div>
        </div>
    );
};

export default CodeBlock; 
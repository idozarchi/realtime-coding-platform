import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../ui/Button';
import './CodeBlockHeader.css';

const CodeBlockHeader = ({ 
    title, 
    role, 
    studentCount, 
    onShowSolution, 
    showSolution 
}) => {
    const navigate = useNavigate();

    return (
        <div className="code-block-header">
            <h1>{title}</h1>
            <div className="role-badge">
                {role === 'mentor' ? 'Mentor' : 'Student'}
            </div>
            <div className="student-count">
                Students in room: {studentCount}
            </div>
            <div className="header-actions">
                {role === 'mentor' && (
                    <Button
                        variant="solution"
                        onClick={onShowSolution}
                    >
                        {showSolution ? 'Hide Solution' : 'Show Solution'}
                    </Button>
                )}
                <Button
                    variant="secondary"
                    onClick={() => navigate('/')}
                >
                    Back to Lobby
                </Button>
            </div>
        </div>
    );
};

export default CodeBlockHeader; 
import React from 'react';
import Button from '../../ui/Button';
import './CodeBlockHeader.css';

const CodeBlockHeader = ({ 
    title, 
    role, 
    studentCount, 
    onShowSolution, 
    showSolution 
}) => {
    return (
        <div className="code-block-header">
            <h1>{title}</h1>
            <div className="role-badge">
                {role === 'mentor' ? 'Mentor' : 'Student'}
            </div>
            <div className="student-count">
                Students in room: {studentCount}
            </div>
            {role === 'mentor' && (
                <Button
                    variant="solution"
                    onClick={onShowSolution}
                >
                    {showSolution ? 'Hide Solution' : 'Show Solution'}
                </Button>
            )}
        </div>
    );
};

export default CodeBlockHeader; 
import React from 'react';
import Button from '../components/Button';

const StudentControls = ({ 
    onReset, 
    onSubmit, 
    loading 
}) => {
    return (
        <div className="student-controls">
            <Button
                variant="primary"
                onClick={onReset}
                disabled={loading}
            >
                Reset Code
            </Button>
            <Button
                variant="primary"
                onClick={onSubmit}
                disabled={loading}
            >
                Submit Solution
            </Button>
        </div>
    );
};

export default StudentControls; 
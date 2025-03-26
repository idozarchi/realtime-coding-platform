import React from 'react';
import Button from '../Button';
import './SuccessOverlay.css';

const SuccessOverlay = ({ onBackToLobby }) => {
    return (
        <div className="success-overlay">
            <div className="success-content">
                <span className="success-emoji">😊</span>
                <h2>Congratulations!</h2>
                <p>You've successfully completed the challenge!</p>
                <Button
                    variant="primary"
                    onClick={onBackToLobby}
                >
                    Back to Lobby
                </Button>
            </div>
        </div>
    );
};

export default SuccessOverlay; 
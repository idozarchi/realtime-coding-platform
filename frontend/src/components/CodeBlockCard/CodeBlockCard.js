import React from 'react';
import './CodeBlockCard.css';

const CodeBlockCard = ({ block, onClick }) => {
    return (
        <li
            className="code-block-item"
            onClick={() => onClick(block.id)}
        >
            <h2>{block.name}</h2>
            <p>Click to start coding</p>
        </li>
    );
};

export default CodeBlockCard;
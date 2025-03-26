import React from 'react';
import './CodeBlockCard.css';

const CodeBlockCard = ({ block, onClick }) => {
    return (
        <li
            className="code-block-item"
            onClick={() => onClick(block.id)}
        >
            <h2>{block.title}</h2>
            <p>{block.description}</p>
            <div>
                <span>{block.language}</span>
                <span> • </span>
                <span>{block.difficulty}</span>
            </div>
        </li>
    );
};

export default CodeBlockCard;
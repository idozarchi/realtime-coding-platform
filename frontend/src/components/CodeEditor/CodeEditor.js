import React from 'react';
import Editor from '@monaco-editor/react';
import './CodeEditor.css';

const CodeEditor = ({ 
    value, 
    onChange, 
    readOnly, 
    language = "javascript",
    theme = "vs-dark"
}) => {
    return (
        <Editor
            height="70vh"
            defaultLanguage={language}
            value={value}
            onChange={onChange}
            theme={theme}
            options={{
                readOnly,
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyond: false,
            }}
        />
    );
};

export default CodeEditor; 
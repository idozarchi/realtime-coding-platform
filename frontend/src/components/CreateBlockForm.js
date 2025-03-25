import React from 'react';
import Button from './Button';
import './CreateBlockForm.css';

const CreateBlockForm = ({ 
    newBlock, 
    setNewBlock, 
    onSubmit, 
    onCancel, 
    error, 
    loading 
}) => {
    return (
        <div className="create-block-form">
            <h2>Create New Code Block</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={onSubmit}>
                <div className="form-group">
                    <label>Name:</label>
                    <input
                        type="text"
                        value={newBlock.name}
                        onChange={(e) => setNewBlock({...newBlock, name: e.target.value})}
                        required
                        placeholder="Enter code block name"
                    />
                </div>
                <div className="form-group">
                    <label>Initial Code:</label>
                    <textarea
                        value={newBlock.initialCode}
                        onChange={(e) => setNewBlock({...newBlock, initialCode: e.target.value})}
                        required
                        placeholder="Enter initial code"
                    />
                </div>
                <div className="form-group">
                    <label>Solution:</label>
                    <textarea
                        value={newBlock.solution}
                        onChange={(e) => setNewBlock({...newBlock, solution: e.target.value})}
                        required
                        placeholder="Enter solution code"
                    />
                </div>
                <div className="form-buttons">
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Creating...' : 'Create'}
                    </Button>
                    <Button type="button" variant="secondary" onClick={onCancel}>
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default CreateBlockForm; 
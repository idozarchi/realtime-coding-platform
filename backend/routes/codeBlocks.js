const express = require('express');
const router = express.Router();
const CodeBlock = require('../models/CodeBlock');

// Get all code blocks
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all code blocks...');
    const codeBlocks = await CodeBlock.find();
    console.log('Found code blocks:', codeBlocks);
    res.json(codeBlocks);
  } catch (error) {
    console.error('Error fetching code blocks:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create a new code block
router.post('/', async (req, res) => {
  try {
    console.log('Creating new code block:', req.body);
    const codeBlock = new CodeBlock(req.body);
    const newCodeBlock = await codeBlock.save();
    console.log('Created code block:', newCodeBlock);
    res.status(201).json(newCodeBlock);
  } catch (error) {
    console.error('Error creating code block:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get a specific code block by ID
router.get('/:id', async (req, res) => {
  try {
    console.log('Fetching code block with ID:', req.params.id);
    const codeBlock = await CodeBlock.findById(req.params.id);
    if (!codeBlock) {
      console.log('Code block not found');
      return res.status(404).json({ message: 'Code block not found' });
    }
    console.log('Found code block:', codeBlock);
    res.json(codeBlock);
  } catch (error) {
    console.error('Error fetching code block:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update current code of a code block
router.put('/:id/current-code', async (req, res) => {
  try {
    console.log('Updating current code for code block:', req.params.id);
    const codeBlock = await CodeBlock.findById(req.params.id);
    if (!codeBlock) {
      console.log('Code block not found');
      return res.status(404).json({ message: 'Code block not found' });
    }
    codeBlock.currentCode = req.body.currentCode;
    const updatedCodeBlock = await codeBlock.save();
    console.log('Updated code block:', updatedCodeBlock);
    res.json(updatedCodeBlock);
  } catch (error) {
    console.error('Error updating current code:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

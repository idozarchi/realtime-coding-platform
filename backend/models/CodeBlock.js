const mongoose = require('mongoose');

const codeBlockSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  initialCode: {
    type: String,
    required: true
  },
  solution: {
    type: String,
    required: true
  },
  currentCode: {
    type: String,
    default: null
  }
});

module.exports = mongoose.model('CodeBlock', codeBlockSchema);

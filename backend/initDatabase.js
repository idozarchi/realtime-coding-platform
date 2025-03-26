require('dotenv').config();
const mongoose = require("mongoose");
const CodeBlock = require("./models/CodeBlock");
const connectDB = require('./config/database');

// Connect to MongoDB and initialize database
connectDB().then(async () => {
    console.log("Connected to MongoDB");

    const initialCodeBlocks = [
      { 
        name: "Async Case", 
        initialCode: `// Write a function that fetches data from an API
// The function should return a promise that resolves with the data
// Use async/await syntax

function fetchData() {
  // Your code here
}`,
        solution: `async function fetchData() {
  try {
    const response = await fetch('https://api.example.com/data');
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error('Failed to fetch data: ' + error.message);
  }
}`
      },
      { 
        name: "Array Manipulation", 
        initialCode: `// Write a function that takes an array of numbers
// and returns a new array with:
// 1. All numbers doubled
// 2. Only even numbers
// 3. Sum of all numbers

function processArray(numbers) {
  // Your code here
}`,
        solution: `function processArray(numbers) {
  const doubled = numbers.map(num => num * 2);
  const evenOnly = doubled.filter(num => num % 2 === 0);
  const sum = evenOnly.reduce((acc, curr) => acc + curr, 0);
  
  return {
    doubled,
    evenOnly,
    sum
  };
}`
      },
      { 
        name: "Object Handling", 
        initialCode: `// Write a function that takes an object and:
// 1. Deep clones the object
// 2. Removes all null/undefined values
// 3. Converts all string values to uppercase

function processObject(obj) {
  // Your code here
}`,
        solution: `function processObject(obj) {
  // Deep clone
  const cloned = JSON.parse(JSON.stringify(obj));
  
  // Remove null/undefined values
  const cleaned = Object.fromEntries(
    Object.entries(cloned).filter(([_, value]) => value != null)
  );
  
  // Convert strings to uppercase
  const processed = Object.fromEntries(
    Object.entries(cleaned).map(([key, value]) => [
      key,
      typeof value === 'string' ? value.toUpperCase() : value
    ])
  );
  
  return processed;
}`
      },
      { 
        name: "String Operations", 
        initialCode: `// Write a function that:
// 1. Reverses a string
// 2. Removes all vowels
// 3. Counts the frequency of each character

function processString(str) {
  // Your code here
}`,
        solution: `function processString(str) {
  // Reverse string
  const reversed = str.split('').reverse().join('');
  
  // Remove vowels
  const noVowels = str.replace(/[aeiou]/gi, '');
  
  // Count character frequency
  const frequency = str.split('').reduce((acc, char) => {
    acc[char] = (acc[char] || 0) + 1;
    return acc;
  }, {});
  
  return {
    reversed,
    noVowels,
    frequency
  };
}`
      }
    ];

    try {
        // Clear existing code blocks
        await CodeBlock.deleteMany({});
        console.log("Cleared existing code blocks");

        // Insert new code blocks
        const insertedBlocks = await CodeBlock.insertMany(initialCodeBlocks);
        console.log(`Successfully inserted ${insertedBlocks.length} code blocks`);

        // Close the connection
        await mongoose.connection.close();
        console.log("Database initialization completed");
        process.exit(0);
    } catch (error) {
        console.error("Error initializing database:", error);
        process.exit(1);
    }
});

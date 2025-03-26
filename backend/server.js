require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const codeBlockRoutes = require('./routes/codeBlocks');
const connectDB = require('./config/database');
const { corsOptions, socketCorsOptions } = require('./config/cors');
const setupSocketHandlers = require('./socket/socketHandler');

const app = express();
const server = http.createServer(app);

// Configure CORS
app.use(cors(corsOptions));

// Middleware
app.use(express.json());

// Routes
app.use('/api/codeblocks', codeBlockRoutes);

// Serve static files from the frontend build directory if it exists
const buildPath = path.join(__dirname, '../frontend/build');
if (process.env.NODE_ENV === 'production' && require('fs').existsSync(buildPath)) {
    app.use(express.static(buildPath));
    
    // Serve index.html for all other routes
    app.get("*", (req, res) => {
        res.sendFile(path.join(buildPath, 'index.html'));
    });
} else {
    // In development or if build directory doesn't exist, just serve a simple response
    app.get("*", (req, res) => {
        res.send("Real-time Coding Platform Backend is Running");
    });
}

// Connect to MongoDB
connectDB().then(() => {
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});

// Socket.IO setup
const io = new Server(server, socketCorsOptions);
setupSocketHandlers(io);
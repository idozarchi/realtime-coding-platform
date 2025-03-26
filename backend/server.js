require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const codeBlockRoutes = require('./routes/codeBlocks');
const connectDB = require('./config/database');
const { corsOptions, socketCorsOptions } = require('./config/cors');
const setupStaticFiles = require('./config/staticConfig');
const setupSocketHandlers = require('./socket/socketHandler');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, socketCorsOptions);

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/codeblocks', codeBlockRoutes);

// Socket.IO connection handling
setupSocketHandlers(io);

// Setup static files
setupStaticFiles(app);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const codeBlockRoutes = require('./routes/codeBlocks');
const { connectDB } = require('./config/database');
const { corsOptions, socketCorsOptions } = require('./config/cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/codeblocks', codeBlockRoutes);

// Room management
const rooms = new Map();

// Clear rooms when server starts
rooms.clear();
console.log('Rooms cleared on server start');

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-room', (roomId) => {
        console.log(`User ${socket.id} joining room ${roomId}`);
        
        const existingRoom = rooms.get(roomId);
        
        if (!existingRoom) {
            console.log(`First user in room ${roomId}, assigning mentor role to ${socket.id}`);
            rooms.set(roomId, {
                mentor: socket.id,
                students: new Set(),
                currentCode: null
            });
            socket.join(roomId);
            socket.emit('role-assigned', { role: 'mentor' });
        } else {
            console.log(`Room ${roomId} already exists, assigning student role to ${socket.id}`);
            existingRoom.students.add(socket.id);
            socket.join(roomId);
            
            // Send role assignment first
            socket.emit('role-assigned', { role: 'student' });
            
            // Then send current room state to the new user
            socket.emit('room-state', {
                currentCode: existingRoom.currentCode,
                studentCount: existingRoom.students.size
            });
            
            // Update student count for all users
            io.to(roomId).emit('student-count', existingRoom.students.size);
        }
    });

    socket.on('code-update', ({ roomId, code }) => {
        console.log(`Received code update in room ${roomId}`);
        // Store the current code in the room
        if (rooms.has(roomId)) {
            const room = rooms.get(roomId);
            room.currentCode = code;
            console.log(`Updated current code in room ${roomId}:`, code);
        }
        // Broadcast to ALL users in the room
        io.to(roomId).emit('code-update', { code });
    });

    socket.on('solution-success', ({ roomId }) => {
        console.log(`Solution success in room ${roomId}`);
        // Broadcast success to all users in the room
        io.to(roomId).emit('solution-success');
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        // Find and remove the user from their room
        for (const [roomId, room] of rooms.entries()) {
            if (room.mentor === socket.id) {
                console.log(`Mentor left room ${roomId}`);
                // Notify all users in the room before clearing
                io.to(roomId).emit('mentor-left');
                
                // Force disconnect all students in the room
                room.students.forEach(studentId => {
                    const studentSocket = io.sockets.sockets.get(studentId);
                    if (studentSocket) {
                        studentSocket.disconnect(true); // Force disconnect the student
                    }
                });
                
                // Clear the room state
                rooms.delete(roomId);
                break;
            }
            if (room.students.has(socket.id)) {
                room.students.delete(socket.id);
                io.to(roomId).emit('student-count', room.students.size);
                break;
            }
        }
    });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend/build')));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../frontend/build', 'index.html'));
    });
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
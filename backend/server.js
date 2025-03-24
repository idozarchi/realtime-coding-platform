require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const codeBlockRoutes = require('./routes/codeBlocks');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3002",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use('/api/codeblocks', codeBlockRoutes);

// Serve React frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
  });
}

app.get("/", (req, res) => {
  res.send("Real-time Coding Platform Backend is Running");
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Socket.IO connection handling
const rooms = new Map();

// Clear rooms when server starts
rooms.clear();
console.log('Rooms cleared on server start');

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (roomId) => {
    console.log(`User ${socket.id} joining room ${roomId}`);
    socket.join(roomId);
    
    // If this is the first user in the room, they become the mentor
    if (!rooms.has(roomId)) {
      console.log(`First user in room ${roomId}, assigning mentor role to ${socket.id}`);
      rooms.set(roomId, {
        mentor: socket.id,
        students: new Set(),
        currentCode: null
      });
      socket.emit('role-assigned', 'mentor');
    } else {
      const room = rooms.get(roomId);
      console.log(`Room ${roomId} already exists, assigning student role to ${socket.id}`);
      room.students.add(socket.id);
      socket.emit('role-assigned', 'student');
      
      // Send current code to new student if it exists
      if (room.currentCode) {
        console.log(`Sending current code to new student ${socket.id}:`, room.currentCode);
        socket.emit('code-update', room.currentCode);
      }
      
      io.to(roomId).emit('student-count', room.students.size);
    }
  });

  socket.on('code-update', ({ roomId, code }) => {
    console.log(`Received code update in room ${roomId}`);
    // Store the current code in the room
    if (rooms.has(roomId)) {
      const room = rooms.get(roomId);
      room.currentCode = code;
      console.log(`Updated current code in room ${roomId}`);
    }
    // Broadcast to all other users in the room
    socket.to(roomId).emit('code-update', code);
  });

  socket.on('disconnect', () => {
    // Clean up rooms when users disconnect
    rooms.forEach((room, roomId) => {
      if (room.mentor === socket.id) {
        // If mentor disconnects, notify all students and clear the room
        io.to(roomId).emit('mentor-left');
        rooms.delete(roomId);
      } else if (room.students.has(socket.id)) {
        room.students.delete(socket.id);
        io.to(roomId).emit('student-count', room.students.size);
      }
    });
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
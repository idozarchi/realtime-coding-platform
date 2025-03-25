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
    origin: [process.env.FRONTEND_URL, "http://localhost:3002", "https://realtime-coding-platform-xi.vercel.app"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors({
  origin: [process.env.FRONTEND_URL, "http://localhost:3002", "https://realtime-coding-platform-xi.vercel.app"],
  credentials: true
}));
app.use(express.json());
app.use('/api/codeblocks', codeBlockRoutes);

// Serve React frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/build")));
  app.get("https://realtime-coding-platform-xi.vercel.app/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
  });
}

app.get("/", (req, res) => {
  res.send("Real-time Coding Platform Backend is Running");
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4
})
.then(() => {
  console.log("Connected to MongoDB successfully");
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
})
.catch((err) => {
  console.error("MongoDB connection error:", err);
  process.exit(1);
});

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
      
      // Send current room state to the new user
      socket.emit('room-state', {
        role: 'student',
        currentCode: room.currentCode,
        studentCount: room.students.size
      });
      
      // Update student count for all users
      io.to(roomId).emit('student-count', room.students.size);
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
    // Broadcast to all other users in the room
    socket.to(roomId).emit('code-update', code);
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
        io.to(roomId).emit('mentor-left');
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
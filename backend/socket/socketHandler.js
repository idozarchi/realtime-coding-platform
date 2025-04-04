const rooms = new Map();

// Clear rooms when server starts
rooms.clear();
console.log('Rooms cleared on server start');

const setupSocketHandlers = (io) => {
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
            socket.broadcast.to(roomId).emit('code-update', { code });
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
};

module.exports = setupSocketHandlers; 
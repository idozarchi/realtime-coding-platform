// Room management
const rooms = new Map();

// Clear rooms when server starts
rooms.clear();
console.log('Rooms cleared on server start');

const setupSocketHandlers = (io) => {
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        socket.on('join-room', ({ roomId }) => {
            console.log(`User ${socket.id} joining room ${roomId}`);
            socket.join(roomId);

            // Get current room state
            const room = rooms.get(roomId);
            if (room) {
                // Room exists, user is a student
                socket.emit('role-assigned', { role: 'student' });
                // Send current room state to the new user
                socket.emit('room-state', {
                    currentCode: room.currentCode,
                    studentCount: room.studentCount
                });
            } else {
                // Room doesn't exist, user is the mentor
                rooms.set(roomId, {
                    currentCode: '',
                    studentCount: 0
                });
                socket.emit('role-assigned', { role: 'mentor' });
            }
        });

        socket.on('code-update', ({ roomId, code }) => {
            console.log(`Code update in room ${roomId}`);
            const room = rooms.get(roomId);
            if (room) {
                room.currentCode = code;
                // Broadcast to ALL users in the room
                io.to(roomId).emit('code-update', { code });
            }
        });

        socket.on('solution-success', ({ roomId }) => {
            console.log(`Solution success in room ${roomId}`);
            // Broadcast success to all users in the room
            io.to(roomId).emit('solution-success');
        });

        socket.on('disconnect', async () => {
            console.log('User disconnected:', socket.id);

            // Find and clean up rooms
            for (const [roomId, room] of rooms.entries()) {
                const sockets = await io.in(roomId).fetchSockets();
                const socketIds = sockets.map(s => s.id);
                
                if (socketIds.includes(socket.id)) {
                    // Update student count
                    room.studentCount = Math.max(0, room.studentCount - 1);
                    
                    // If no students left, remove the room
                    if (room.studentCount === 0) {
                        rooms.delete(roomId);
                        console.log(`Room ${roomId} removed - no students left`);
                    } else {
                        // Notify remaining users about the updated student count
                        io.to(roomId).emit('room-state', {
                            currentCode: room.currentCode,
                            studentCount: room.studentCount
                        });
                    }
                    break;
                }
            }
        });
    });
};

module.exports = setupSocketHandlers; 
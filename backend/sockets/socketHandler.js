module.exports = (socket, io) => {
    socket.on('joinRoom', (room) => {
        socket.join(room);
        io.to(room).emit('userCount', io.sockets.adapter.rooms.get(room)?.size || 0);
    });

    socket.on('codeChange', (data) => {
        socket.to(data.room).emit('updateCode', data.code);
    });

    socket.on('disconnecting', () => {
        const rooms = Array.from(socket.rooms).slice(1);
        rooms.forEach((room) => {
            const userCount = io.sockets.adapter.rooms.get(room)?.size - 1 || 0;
            io.to(room).emit('userCount', userCount);

            // Notify students if the mentor disconnects
            if (userCount === 0) {
                io.to(room).emit('mentorLeft');
            }
        });
    });
};

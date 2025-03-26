import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const useSocketConnection = (
    roomId,
    onCodeUpdate,
    onRoomState,
    onSolutionSuccess,
    onMentorLeft,
    onStudentCount
) => {
    const socketRef = useRef(null);

    useEffect(() => {
        const socket = io(process.env.REACT_APP_API_URL);
        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('Connected to socket server');
            // Join room and handle role assignment in one place
            socket.emit('join-room', roomId, (response) => {
                console.log('Joined room, role:', response.role);
                // Role is assigned by server when joining room
                socket.role = response.role;
            });
        });

        socket.on('code-update', onCodeUpdate);
        socket.on('room-state', onRoomState);
        socket.on('solution-success', onSolutionSuccess);
        socket.on('mentor-left', onMentorLeft);
        socket.on('student-count', onStudentCount);

        return () => {
            socket.disconnect();
        };
    }, [roomId, onCodeUpdate, onRoomState, onSolutionSuccess, onMentorLeft, onStudentCount]);

    return socketRef;
};

export default useSocketConnection; 
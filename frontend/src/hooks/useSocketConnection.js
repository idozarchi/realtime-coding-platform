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
            socket.emit('join-room', roomId);
        });

        // Handle role assignment
        socket.on('role-assigned', (data) => {
            console.log('Role assigned:', data.role);
            socket.role = data.role;
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
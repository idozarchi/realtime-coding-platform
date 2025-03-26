import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const useSocketConnection = (
    roomId,
    onRoleAssigned,
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

        // Join room first
        socket.emit('join-room', roomId);

        // Handle role assignment
        socket.on('role-assigned', (data) => {
            console.log('Role assigned:', data.role);
            onRoleAssigned(data.role);
        });

        // Handle code updates from other students
        socket.on('code-update', onCodeUpdate);

        // Handle room state updates
        socket.on('room-state', onRoomState);

        // Handle solution success
        socket.on('solution-success', onSolutionSuccess);

        // Handle mentor leaving
        socket.on('mentor-left', onMentorLeft);

        // Handle student count updates
        socket.on('student-count', onStudentCount);

        return () => {
            socket.disconnect();
        };
    }, [roomId, onRoleAssigned, onCodeUpdate, onRoomState, onSolutionSuccess, onMentorLeft, onStudentCount]);

    return socketRef;
};

export default useSocketConnection; 
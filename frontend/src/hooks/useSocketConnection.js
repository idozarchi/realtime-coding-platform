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

        socket.on('role-assigned', onRoleAssigned);
        socket.on('code-update', onCodeUpdate);
        socket.on('room-state', onRoomState);
        socket.on('solution-success', onSolutionSuccess);
        socket.on('mentor-left', onMentorLeft);
        socket.on('student-count', onStudentCount);

        return () => {
            socket.disconnect();
        };
    }, [roomId, onRoleAssigned, onCodeUpdate, onRoomState, onSolutionSuccess, onMentorLeft, onStudentCount]);

    return socketRef;
};

export default useSocketConnection; 
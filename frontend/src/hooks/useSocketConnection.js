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
    const hasJoinedRoom = useRef(false);

    useEffect(() => {
        const connectSocket = () => {
            const socket = io(process.env.REACT_APP_API_URL, {
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                timeout: 10000
            });
            socketRef.current = socket;

            socket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
            });

            socket.on('connect', () => {
                console.log('Socket connected successfully');
                if (!hasJoinedRoom.current) {
                    socket.emit('join-room', roomId);
                    hasJoinedRoom.current = true;
                }
            });

            socket.on('role-assigned', onRoleAssigned);
            socket.on('code-update', onCodeUpdate);
            socket.on('room-state', onRoomState);
            socket.on('solution-success', onSolutionSuccess);
            socket.on('mentor-left', onMentorLeft);
            socket.on('student-count', onStudentCount);
        };

        connectSocket();

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [roomId, onRoleAssigned, onCodeUpdate, onRoomState, onSolutionSuccess, onMentorLeft, onStudentCount]);

    return socketRef;
};

export default useSocketConnection; 
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
    const callbacksRef = useRef({
        onRoleAssigned,
        onCodeUpdate,
        onRoomState,
        onSolutionSuccess,
        onMentorLeft,
        onStudentCount
    });

    // Update callbacks ref when they change
    useEffect(() => {
        callbacksRef.current = {
            onRoleAssigned,
            onCodeUpdate,
            onRoomState,
            onSolutionSuccess,
            onMentorLeft,
            onStudentCount
        };
    }, [onRoleAssigned, onCodeUpdate, onRoomState, onSolutionSuccess, onMentorLeft, onStudentCount]);

    // Set up socket connection only once when roomId changes
    useEffect(() => {
        const socket = io(process.env.REACT_APP_API_URL);
        socketRef.current = socket;

        // Join room first
        socket.emit('join-room', roomId);

        // Handle role assignment
        socket.on('role-assigned', (data) => {
            console.log('Role assigned:', data.role);
            callbacksRef.current.onRoleAssigned(data.role);
        });

        // Handle code updates from other students
        socket.on('code-update', (data) => {
            callbacksRef.current.onCodeUpdate(data);
        });

        // Handle room state updates
        socket.on('room-state', (data) => {
            callbacksRef.current.onRoomState(data);
        });

        // Handle solution success
        socket.on('solution-success', () => {
            callbacksRef.current.onSolutionSuccess();
        });

        // Handle mentor leaving
        socket.on('mentor-left', () => {
            callbacksRef.current.onMentorLeft();
        });

        // Handle student count updates
        socket.on('student-count', (count) => {
            callbacksRef.current.onStudentCount(count);
        });

        return () => {
            socket.disconnect();
        };
    }, [roomId]); // Only re-run when roomId changes

    return socketRef;
};

export default useSocketConnection; 
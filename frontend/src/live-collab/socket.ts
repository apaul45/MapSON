import { io } from 'socket.io-client';

export const socket = io(import.meta.env.VITE_BACKEND_URL, {
  autoConnect: false, //Only connecting once in project,
});

export const connect = () => socket.connect();
export const disconnect = () => socket.disconnect();

export const joinRoom = (room: string) => socket.emit('joinRoom', room);
export const getClientList = (room: string) => socket.emit('getClientList', room);

import { io } from 'socket.io-client';
import { store } from '../models';
import { Comment, Map } from '../types';

export const socket = io(import.meta.env.VITE_BACKEND_URL, {
  autoConnect: false, //Only connecting once in project,
});

const { mapStore } = store.dispatch;

//Emitters
export const connect = () => socket.connect();
export const disconnect = () => socket.disconnect();

export const joinRoom = (username: string, room: string) => socket.emit('joinRoom', username, room);
export const leaveRoom = (username: string, roomId: string) =>
  socket.emit('leaveRoom', username, roomId);

export const leaveAllRooms = (username: string) => socket.emit('leaveAllRooms', username);

export const addComment = (roomId: string | undefined) => socket.emit('addComment', roomId);

//Event handlers
socket.on('sendClientList', (clients) => {
  console.log(clients);
  mapStore.setRoomList(clients);
});

socket.on('updateComments', (map: Map) => mapStore.setCurrentMap(map));

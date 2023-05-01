import { useState } from 'react';
import { io } from 'socket.io-client';
import { store } from '../models';

export const socket = io(import.meta.env.VITE_BACKEND_URL, {
  autoConnect: false, //Only connecting once in project,
});

export const clients = [];

//Emitters
export const connect = () => socket.connect();
export const disconnect = () => socket.disconnect();

export const joinRoom = (username: string, room: string) => socket.emit('joinRoom', username, room);
export const leaveRoom = (username: string, roomId: string) =>
  socket.emit('leaveRoom', username, roomId);

export const leaveAllRooms = (username: string) => socket.emit('leaveAllRooms', username);

//Event handlers
socket.on('sendClientList', (clients) => {
  console.log(clients);
  store.dispatch.mapStore.setRoomList(clients);
});

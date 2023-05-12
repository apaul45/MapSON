import { io } from 'socket.io-client';
import { store } from '../models';
import { Comment, Map } from '../types';
import * as L from 'leaflet';
import { MutableRefObject } from 'react';

export const socket = io(import.meta.env.VITE_BACKEND_URL, {
  autoConnect: false, //Only connecting once in project,
});

const { mapStore } = store.dispatch;

declare module 'socket.io-client' {
  class Socket {
    map?: MutableRefObject<L.Map>;
  }
}

//Emitters
export const connect = () => socket.connect();
export const disconnect = () => socket.disconnect();

export const joinRoom = (username: string, room: string, map: MutableRefObject<L.Map>) => {
  socket.emit('joinRoom', username, room);
  socket.map = map;
};
export const leaveRoom = (username: string, roomId: string) => {
  socket.emit('leaveRoom', username, roomId);
  delete socket.map;
};

export const leaveAllRooms = (username: string) => socket.emit('leaveAllRooms', username);

export const addComment = (roomId: string | undefined, comment: Comment) =>
  socket.emit('addComment', roomId, comment);

export const emitMousePosition = (
  roomId: string,
  username: string,
  mousePosition: L.LatLngExpression
) => {
  socket.emit('cursorUpdate', roomId, username, mousePosition);
};

socket.on('cursorUpdate', (roomId: string, username: string, position: L.LatLngExpression) => {
  mapStore.updateCursor({ username, position });
});

//Event handlers
socket.on('sendClientList', (clients) => {
  console.log(clients);
  const createMarkerFn = (username: string, bgColor: string): L.CircleMarker => {
    if (!socket.map) {
      throw new Error('SOCKET CANNOT READ LEAFLET MAP.');
    }

    const cursor = L.circleMarker([0, 0], {
      radius: 5,
      fillOpacity: 1,
      color: bgColor,
      fillColor: bgColor,
      weight: 1,
    });
    cursor.bindTooltip(username, { permanent: true, className: 'labels', offset: [0, 0] });
    try {
      cursor.pm.disable();
    } catch {}
    cursor.addTo(socket.map.current);
    return cursor;
  };
  mapStore.updateRoomList({ usernames: clients, createMarkerFn });
});

socket.on('updateComments', (comment: Comment) => mapStore.setComments(comment));

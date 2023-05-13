import { io } from 'socket.io-client';
import { store } from '../models';
import { Comment, Map } from '../types';
import * as L from 'leaflet';
import { MutableRefObject } from 'react';
import { MapComponentCallbacks } from '../transactions/map/common';

export const socket = io(import.meta.env.VITE_BACKEND_URL, {
  autoConnect: false, //Only connecting once in project,
});

const { mapStore } = store.dispatch;

declare module 'socket.io-client' {
  class Socket {
    map?: MutableRefObject<L.Map>;
    callbacks?: MutableRefObject<MapComponentCallbacks>;
    createMarker?: (username: string, bgColor: string) => L.CircleMarker;
  }
}

export interface Member {
  username: string;
  socket_id: string;
  // position: LatLngLiteral
}

export interface Room {
  [key: string]: Member;
}

//Emitters
export const connect = () => socket.connect();
export const disconnect = () => socket.disconnect();

export const joinRoom = (
  username: string,
  room: string,
  map: MutableRefObject<L.Map>,
  callbacks: MutableRefObject<MapComponentCallbacks>
) => {
  socket.map = map;
  socket.callbacks = callbacks;
  socket.emit('joinRoom', username, room);

  socket.createMarker = (username, bgColor, position: L.LatLngExpression = [0, 0]) => {
    if (!map.current) {
      throw new Error('SOCKET CANNOT READ LEAFLET MAP.');
    }

    const cursor = L.circleMarker(position, {
      radius: 5,
      fillOpacity: 1,
      color: bgColor,
      fillColor: bgColor,
      weight: 1,
      // important since we dont to have this affect snapping or any other things with geoman
      pmIgnore: true,
    });

    cursor.bindTooltip(username, {
      permanent: true,
      className: 'labels',
      offset: [0, 0],
      direction: 'bottom',
      opacity: 0.75,
    });
    cursor.addTo(map.current);
    return cursor;
  };
};
export const leaveRoom = (roomId: string) => {
  socket.emit('leaveRoom', roomId);
  delete socket.map;
  socket.createMarker = undefined!;
};

export const leaveAllRooms = (username: string) => socket.emit('leaveAllRooms', username);

export const addComment = (roomId: string | undefined, comment: Comment) =>
  socket.emit('addComment', roomId, comment);

export const emitMousePosition = (roomId: string, mousePosition: L.LatLngExpression) => {
  socket.emit('cursorUpdate', roomId, mousePosition);
};

socket.on('cursorUpdate', (roomId: string, position: L.LatLngExpression, socket_id: string) => {
  mapStore.updateCursor({ socket_id, position });
});

//Event handlers
socket.on('initClientList', (roomId: string, clients: Room) => {
  console.log({ type: 'Init clients', clients });
  mapStore.initRoomList({ clients, createMarkerFn: socket.createMarker! });
});

socket.on('joinRoom', (roomId: string, member: Member) => {
  console.log({ type: 'Member added', member });
  mapStore.addClient({ member, createMarkerFn: socket.createMarker! });
});

socket.on('leaveRoom', (roomId: string, socket_id: string) => {
  console.log({ type: 'Member left', socket_id });

  mapStore.removeClient(socket_id);
});

socket.on('updateComments', (comment: Comment) => mapStore.setComments(comment));

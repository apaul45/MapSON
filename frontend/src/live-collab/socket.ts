import { io } from 'socket.io-client';
import { store } from '../models';
import { Comment, Features, LGeoJsonExt, Map } from '../types';
import * as L from 'leaflet';
import { MutableRefObject } from 'react';
import { MapComponentCallbacks, SerializedTransactionTypes } from '../transactions/map/common';
import { TransactionTypes } from '../transactions/map/MultipleTransactions';

export const socket = io(import.meta.env.VITE_BACKEND_URL, {
  autoConnect: false, //Only connecting once in project,
  transports: ['websocket'],
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

export const emitTransaction = (roomId: string, transaction: TransactionTypes) => {
  const serialized = transaction.serialize();
  console.log({ type: 'EMIT TRANSACTION', serialized });
  socket.emit('newTransaction', roomId, serialized);
};

export const emitUndo = (roomId: string, peerArtifacts: Object | undefined = undefined) => {
  socket.emit('undo', roomId, peerArtifacts);
};

export const emitRedo = (roomId: string, peerArtifacts: Object | undefined = undefined) => {
  socket.emit('redo', roomId, peerArtifacts);
};

export const emitUpdateRegionProperties = (
  roomId: string,
  featureId: string,
  propertyList: Record<string, string>
) => {
  socket.emit('updateRegionProperties', roomId, featureId, propertyList);
};

export const emitUpdateMapProperties = (roomId: string, propertyList: Record<string, string>) => {
  socket.emit('updateMapProperties', roomId, propertyList);
};

export const emitSimplify = (roomId: string, features: Features) => {
  console.log('Emitted simplify');
  socket.emit('simplify', roomId, features);
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

socket.on('newTransaction', (roomId: string, transaction: SerializedTransactionTypes) => {
  console.log({ type: 'RECIEVED TRANSACTION', transaction });
  socket.callbacks?.current.applyPeerTransaction(transaction);
});

socket.on('undo', async (roomId: string, peerArtifacts: Object | undefined = undefined) => {
  await socket.callbacks?.current.undo(true, peerArtifacts);
});

socket.on('redo', async (roomId: string, peerArtifacts: Object | undefined = undefined) => {
  await socket.callbacks?.current.redo(true, peerArtifacts);
});

socket.on(
  'updateRegionProperties',
  async (roomId: string, featureId: string, propertyList: Record<string, string>) => {
    await mapStore.updateFeature({
      id: featureId,
      feature: { properties: { ...propertyList } },
      doNetwork: false,
    });

    const layer = socket.callbacks?.current.getLayerById(featureId) as LGeoJsonExt;

    if (!layer) {
      console.error('Layer not found!');
      return;
    }

    layer.feature!.properties = { ...propertyList };

    layer.unbindPopup();
    layer.bindPopup(propertyList['name']);

    if (layer.selected !== true && propertyList.color) {
      layer.setStyle({ color: propertyList.color, fillColor: propertyList.color });
    }

    if (layer.selected === true) {
      socket.callbacks?.current.setSelectedFeature({ id: featureId, layer });
    }
  }
);

socket.on('updateMapProperties', (roomId: string, propertyList: Record<string, string>) => {
  mapStore.setCurrentMap({
    ...store.getState().mapStore.currentMap!,
    properties: { ...propertyList },
  });
});

socket.on('simplify', (roomId: string, features: Features) => {
  console.log('Recieved simplify');
  socket.callbacks?.current.clearTransactions();
  store.dispatch.mapStore.setCurrentMap({ ...store.getState().mapStore.currentMap!, features });
  socket.callbacks?.current.forceRerender();
});

export const clientRedo = async () => {
  await socket.callbacks?.current.redo(false);
};
export const clientUndo = async () => {
  await socket.callbacks?.current.undo(false);
};

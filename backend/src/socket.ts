import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import { LatLngLiteral } from 'leaflet';

export const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: ['http://127.0.0.1:5173', /https:\/\/mapson(.*)\.vercel\.app/, 'http://localhost:5173'],
  },
});

interface Member {
  username: string;
  socket_id: string;
  // position: LatLngLiteral
}

interface Room {
  [key: string]: Member;
}
interface Rooms {
  [key: string]: Room;
}

let rooms: Rooms = {};

io.on('connection', (socket) => {
  console.log('connected!');

  socket.on('joinRoom', (username: string, roomId: string) => {
    if (!rooms[roomId]) {
      rooms[roomId] = {};
    }

    socket.join(roomId);

    //broadcast current clientList to caller
    socket.emit('initClientList', roomId, rooms[roomId]);

    console.log(`${username}(${socket.id}) joining room ${roomId}!`);

    //Add user to this room, if it's a logged in user
    if (username) {
      console.log(`clientList before adding: ${JSON.stringify(rooms[roomId])}`);

      const member = {
        username,
        socket_id: socket.id,
      };

      rooms[roomId][socket.id] = member;

      console.log(`clientList after adding: ${JSON.stringify(rooms[roomId])}`);

      //Broadcast new member
      socket.broadcast.to(roomId).emit('joinRoom', roomId, member);
    }
  });

  socket.on('leaveRoom', (roomId: string) => {
    let v = rooms[roomId]?.[socket.id];

    if (v) {
      console.log(`${v.username} has left room ${roomId}!`);
      delete rooms[roomId][socket.id];
    }
    socket.leave(roomId);
    console.log(`list of users left in room ${roomId}: ${JSON.stringify(rooms[roomId])}`);

    //Broadcast this list so that everyone can save it
    socket.broadcast.to(roomId).emit('leaveRoom', roomId, socket.id);
  });

  //For when a user logs out
  socket.on('leaveAllRooms', (username: string) => {
    for (const roomId in rooms) {
      rooms[roomId] = Object.fromEntries(
        Object.entries(rooms[roomId]).filter(([k, v]) => {
          if (username === v.username) {
            console.log(`${username}: left room ${roomId}`);
            io.to(roomId).emit('leaveRoom', roomId, v.socket_id);
            return false;
          }

          return true;
        })
      );
    }
  });

  socket.on('addComment', (roomId: string, comment: any) => {
    console.log(`${socket.id}: added comment ${JSON.stringify(comment)} in room ${roomId}`);
    socket.broadcast.to(roomId).emit('updateComments', comment);
  });

  socket.on('cursorUpdate', (roomId: string, mousePosition: LatLngLiteral) => {
    // console.log(`${socket.id}: updated cursor ${JSON.stringify(mousePosition)} in room ${roomId}`);
    socket.broadcast.to(roomId).emit('cursorUpdate', roomId, mousePosition, socket.id);
  });

  socket.on('newTransaction', (roomId: string, transaction: any) => {
    socket.broadcast.to(roomId).emit('newTransaction', roomId, transaction);
  });

  socket.on('undo', (roomId: string, peerArtifacts: Object | undefined) => {
    socket.broadcast.to(roomId).emit('undo', roomId, peerArtifacts);
  });

  socket.on('redo', (roomId: string, peerArtifacts: Object | undefined) => {
    socket.broadcast.to(roomId).emit('redo', roomId, peerArtifacts);
  });

  socket.on(
    'updateRegionProperties',
    (roomId: string, featureId: string, propertyList: Record<string, string>) => {
      socket.broadcast.to(roomId).emit('updateRegionProperties', roomId, featureId, propertyList);
    }
  );

  socket.on('updateMapProperties', (roomId: string, propertyList: Record<string, string>) => {
    socket.broadcast.to(roomId).emit('updateMapProperties', roomId, propertyList);
  });

  socket.on('simplify', (roomId: string, features: any) => {
    socket.broadcast.to(roomId).emit('simplify', roomId, features);
  });

  socket.on('disconnect', () => {
    for (const roomId in rooms) {
      rooms[roomId] = Object.fromEntries(
        Object.entries(rooms[roomId]).filter(([k, v]) => {
          if (socket.id === v.socket_id) {
            socket.broadcast.to(roomId).emit('leaveRoom', roomId, v.socket_id);
            console.log(`${socket.id} left ${roomId}`);
            return false;
          }

          return true;
        })
      );
    }
  });
});

import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import Map from './models/map-model';

export const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: ['http://127.0.0.1:5173', /https:\/\/mapson(.*)\.vercel\.app/, 'http://localhost:5173'],
  },
});

let rooms: Record<string, Array<string>> = {};

io.on('connection', (socket) => {
  console.log('connected!');

  socket.on('joinRoom', (username: string, roomId: string) => {
    socket.join(roomId);
    console.log(`joining room ${roomId}!`);

    //Add user to this room, if it's a logged in user
    if (username) {
      let clientList = rooms[roomId];

      console.log(`clientList before adding: ${clientList}`);

      rooms[roomId] = !clientList ? [username] : [...clientList, username];

      console.log(`clientList after adding: ${rooms[roomId]}`);

      //Broadcast this list so that everyone can save it
      io.to(roomId).emit('sendClientList', rooms[roomId]);
    }
  });

  socket.on('leaveRoom', (username: string, roomId: string) => {
    rooms[roomId] = rooms[roomId].filter((client) => client !== username);
    socket.leave(roomId);
    console.log(`${username} has left room ${roomId}!`);
    console.log(`list of users left in room ${roomId}: ${rooms[roomId]}`);

    //Broadcast this list so that everyone can save it
    io.to(roomId).emit('sendClientList', rooms[roomId]);
  });

  //For when a user logs out
  socket.on('leaveAllRooms', (username: string) => {
    for (const roomId in rooms) {
      rooms[roomId] = rooms[roomId].filter((client) => client !== username);

      //Broadcast this list so that everyone can save it
      io.to(roomId).emit('sendClientList', rooms[roomId]);
    }
  });

  socket.on('addComment', (roomId: string, comment: any) => {
    console.log(comment);
    io.to(roomId).emit('updateComments', comment);
  });

  socket.on('disconnect', () => console.log('disconnected!'));
});

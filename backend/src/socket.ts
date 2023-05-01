import http from 'http';
import { Server } from 'socket.io';
import app from './app';

export const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: ['http://127.0.0.1:5173', /https:\/\/mapson(.*)\.vercel\.app/, 'http://localhost:5173'],
  },
});

io.on('connection', (socket) => {
  socket.on('joinRoom', (roomId: string) => {
    socket.join(roomId);
  });

  socket.on('getClientList', async (roomId: string) => {
    const clientList = await io.in(roomId).fetchSockets();
    socket.emit('sendClientList', clientList.length);
  });
});

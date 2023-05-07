import { createServer } from 'http';
import { Server } from 'socket.io';
import Client from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import Map from '../src/models/map-model';

describe('Socket.io Tests', () => {
  let io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
  let clientSocket: any, serverSocket: any;

  beforeAll((done) => {
    const httpServer = createServer();
    io = new Server(httpServer);
    httpServer.listen(() => {
      //@ts-ignore
      const port = httpServer.address().port;
      //@ts-ignore
      clientSocket = new Client(`http://localhost:${port}`);

      io.on('connection', (socket) => {
        serverSocket = socket;
      });
      clientSocket.on('connect', done);
    });
  });

  afterAll(() => {
    io.close();
    clientSocket.close();
  });

  test('should join room', (done) => {
    serverSocket.on('joinRoom', (username: string, roomId: string) => {
      expect(username).toEqual('testUser');
      expect(roomId).toEqual('1');
      done();
    });

    clientSocket.emit('joinRoom', 'testUser', '1');
  });

  // test('should broadcast comment', async() => {
  //   const map = await Map.find({});

  // })

  // test('should work (with ack)', (done) => {
  //   serverSocket.on('hi', (cb) => {
  //     cb('hola');
  //   });
  //   clientSocket.emit('hi', (arg) => {
  //     expect(arg).toBe('hola');
  //     done();
  //   });
  // });
});

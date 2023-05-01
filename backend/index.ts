import { connect as mongoConnect } from 'mongoose';
import dotenv from 'dotenv';
import { server } from './src/socket';

dotenv.config();

const port = process.env.PORT;
const mongoStr = `${process.env.DB}/mapson`;

mongoConnect(mongoStr)
  .then(() => console.log('mongodb connected'))
  .catch((e) => console.error('Connection error', e.message));

server.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

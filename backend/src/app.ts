import express, { Express, Request, Response } from 'express';
import session from 'express-session';

import { default as user } from './routes/user-routes';
import { default as maps } from './routes/map-routes';
import { default as MongoStore } from 'connect-mongo';

import dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();

const app: Express = express();

const mongoStr = `${process.env.DB}/mapson`;

app.use(
  cors({
    credentials: true,
    origin: [
      'http://127.0.0.1:5173',
      'http://127.0.0.1:4173',
      'https://mapson.vercel.app',
      'https://mapson-apaul45.vercel.app',
      'http://localhost:5173',
      /https:\/\/mapson(.*)\.vercel\.app/,
    ],
  })
);

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: 'secret',
    store: MongoStore.create({
      mongoUrl: mongoStr,
      ttl: 60 * 60, // = 1hr
    }),
    cookie: {
      sameSite: false,
    },
  })
);

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
  console.log('hii!');
});

app.use('/user', user);
app.use('/maps', maps);

export default app;

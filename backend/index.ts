import express, { Express, Request, Response } from 'express'
import session from 'express-session'

import dotenv from 'dotenv'

import { default as user } from './src/routes/user-routes'
import { connect as mongoConnect } from 'mongoose'
import { default as MongoStore } from 'connect-mongo'
import cors from 'cors'

dotenv.config()

const app: Express = express()
const port = process.env.PORT

app.use(cors({ credentials: true, origin: 'http://127.0.0.1:5173' }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const mongoStr = `mongodb+srv://${process.env.DB}/mapson`

mongoConnect(mongoStr)
  .then(() => console.log('mongodb connected'))
  .catch((e) => console.error('Connection error', e.message))

app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: 'secret',
    store: MongoStore.create({
      mongoUrl: mongoStr,
      ttl: 60 * 60, // = 1hr
    }),
  })
)

app.use('/user', user)

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`)
})

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server')
  console.log('hii!')
})

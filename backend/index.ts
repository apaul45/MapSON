import { connect as mongoConnect } from 'mongoose'
import app from './src/app'

import dotenv from 'dotenv'
dotenv.config()

const port = process.env.PORT
const mongoStr = `mongodb+srv://${process.env.DB}/mapson`

mongoConnect(mongoStr)
  .then(() => console.log('mongodb connected'))
  .catch((e) => console.error('Connection error', e.message))

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`)
})
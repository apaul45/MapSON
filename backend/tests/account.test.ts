import request from 'supertest'
import app from '../src/app'
import mongoose from 'mongoose'
import User from '../src/models/user-model'

import dotenv from 'dotenv'
dotenv.config()

const mongoStr = `mongodb+srv://${process.env.DB}/mapson`

beforeAll(async () => {
  await mongoose.connect(mongoStr)
})

afterAll(async () => {
  await User.findOneAndDelete({ email: 'test@gmail.com' })
  await mongoose.disconnect()
})

describe('POST /register', () => {
  it('should register a user', async () => {
    const res = await request(app).post('/user/register').send({
      email: 'test@gmail.com',
      username: 'test',
      password: 'test123',
    })

    expect(res.statusCode).toBe(200)
    expect(res.body.error).toBe(false)
  })

  it('should fail to register a user with invalid fields', async () => {
    let res = await request(app).post('/user/register').send({
      email: null,
      username: '',
      password: 'test123',
    })

    expect(res.statusCode).toBe(400)
    expect(res.body.error).toBe(true)
  })

  it('should fail to register a user with dup email and username', async () => {
    let res = await request(app).post('/user/register').send({
      email: 'test@gmail.com',
      username: 'test1',
      password: 'test123',
    })

    expect(res.statusCode).toBe(400)
    expect(res.body.error).toBe(true)

    res = await request(app).post('/user/register').send({
      email: 'test1@gmail.com',
      username: 'test',
      password: 'test123',
    })

    expect(res.statusCode).toBe(400)
    expect(res.body.error).toBe(true)
  })
})

describe('POST /login', () => {
  it('should login a user', async () => {
    const res = await request(app).post('/user/login').send({
      emailOrUsername: 'test',
      password: 'test123',
    })

    expect(res.statusCode).toBe(200)
    expect(res.body.error).toBe(false)
  })

  it('should fail to login a user with invalid username', async () => {
    const res = await request(app).post('/user/login').send({
      emailOrUsername: 'test1',
      password: 'test123',
    })

    expect(res.statusCode).toBe(400)
    expect(res.body.error).toBe(true)
    expect(res.body.errorMessage).toStrictEqual('user not found')
  })

  it('should fail to login a user with invalid password', async () => {
    const res = await request(app).post('/user/login').send({
      emailOrUsername: 'test',
      password: 'test1234',
    })

    expect(res.statusCode).toBe(401)
    expect(res.body.error).toBe(true)
    expect(res.body.errorMessage).toStrictEqual(
      'invalid username/email or password'
    )
  })
})

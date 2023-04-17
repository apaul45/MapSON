import request from 'supertest'
import mongoose from 'mongoose'
import app from '../src/app'
import User from '../src/models/user-model'
import Map, { IMap } from '../src/models/map-model'

const mongoStr = `mongodb+srv://${process.env.DB}/mapson`

const newName = 'Updated Jest Map'
const description = 'My Jest Map'

let loginCookie: string
let createdMapId: string

beforeAll(async () => {
  await mongoose.connect(mongoStr)
})

afterAll(async () => {
  //Test delete here
  const res = await request(app)
    .delete(`/maps/map/${createdMapId}`)
    .set('Cookie', loginCookie)
    .send()

  expect(res.statusCode).toEqual(200)

  await User.findOneAndDelete({ email: 'test@gmail.com' })
  await mongoose.disconnect()
})

beforeEach(async () => {
  const res = await request(app).post('/user/login').send({
    emailOrUsername: 'cypressUser',
    password: 'password',
  })

  expect(res.statusCode).toBe(200)
  expect(res.body.username).toStrictEqual('cypressUser')
  expect(res.body.maps).toBeTruthy()
  expect(res.header).toHaveProperty('set-cookie')

  loginCookie = res.header['set-cookie']
})

describe('POST /maps/map', () => {
  it('should create a new map', async () => {
    const res = await request(app)
      .post('/maps/map')
      .set('Cookie', loginCookie)
      .send({ mapName: 'Jest Map' })

    expect(res.statusCode).toBe(200)
    expect(res.body.map.name).toBe('Jest Map')

    createdMapId = res.body.map._id
  })

  it('should fail if no authentication', async () => {
    const res = await request(app)
      .post('/maps/map/')
      .send({ mapName: 'Jest Map' })

    expect(res.statusCode).toBe(401)
    expect(res.body.errorMessage).toEqual('invalid session')
  })
})

describe('Get Map Tests', () => {
  it('should retrieve the created map', async () => {
    const res = await request(app).get(`/maps/map/${createdMapId}`)

    expect(res.statusCode).toBe(200)
    expect(res.body.map._id).toEqual(createdMapId)
  })

  it('should retrieve all maps', async () => {
    const res = await request(app).get('/maps/allmaps')
    expect(res.statusCode).toBe(200)
  })
})

describe('Update Map Test', () => {
  it('should update the created map', async () => {
    const res = await request(app)
      .put(`/maps/map/${createdMapId}`)
      .set('Cookie', loginCookie)
      .send({ changes: { name: newName, description: description } })

    expect(res.statusCode).toBe(201)
  })

  it('should fail if no authentication', async () => {
    const res = await request(app)
      .put(`/maps/map/${createdMapId}`)
      .send({ changes: { name: newName, description: description } })

    expect(res.statusCode).toBe(401)
    expect(res.body.error).toBeTruthy()
  })
})

describe('Delete Map Test', () => {
  it('should fail if no authentication', async () => {
    const res = await request(app).delete(`/maps/map/${createdMapId}`)

    expect(res.statusCode).toBe(401)
    expect(res.body.errorMessage).toBe('invalid session')
  })
})

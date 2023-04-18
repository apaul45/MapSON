import request from 'supertest';
import app from '../src/app';
import mongoose from 'mongoose';
import User from '../src/models/user-model';

import dotenv from 'dotenv';
dotenv.config();

const mongoStr = `${process.env.DB}/mapson`;

const email = 'test@gmail.com';
const username = 'test';
const password = 'test123';

let loginCookie: string;
let registerCookie: string;

beforeAll(async () => {
  await mongoose.connect(mongoStr);

  //Register before all tests, so that the cookie can be used in tests
  const res = await request(app).post('/user/register').send({
    email: email,
    username: username,
    password: password,
  });

  expect(res.statusCode).toBe(200);
  expect(res.body.error).toBe(false);
  registerCookie = res.header['set-cookie'];
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

describe('POST /user/register', () => {
  it('should fail to register a user with invalid fields', async () => {
    let res = await request(app).post('/user/register').send({
      email: null,
      username: '',
      password: 'test123',
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe(true);
  });

  it('should fail to register a user with dup email and username', async () => {
    let res = await request(app).post('/user/register').send({
      email: email,
      username: 'test1',
      password: 'test123',
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe(true);

    res = await request(app).post('/user/register').send({
      email: 'test1@gmail.com',
      username: 'test',
      password: 'test123',
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe(true);
  });
});

describe('POST /user/login', () => {
  it('should login a user', async () => {
    const res = await request(app).post('/user/login').send({
      emailOrUsername: username,
      password: password,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.username).toStrictEqual(username);
    expect(res.body.email).toStrictEqual(email);
    expect(res.body.maps).toBeTruthy();
    expect(res.header).toHaveProperty('set-cookie');
    loginCookie = res.header['set-cookie'];
  });

  it('should fail to login a user with invalid username', async () => {
    const res = await request(app).post('/user/login').send({
      emailOrUsername: 'test1',
      password: 'test123',
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe(true);
    expect(res.body.errorMessage).toStrictEqual('user not found');
  });

  it('should fail to login a user with invalid password', async () => {
    const res = await request(app).post('/user/login').send({
      emailOrUsername: 'test',
      password: 'test1234',
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe(true);
    expect(res.body.errorMessage).toStrictEqual('invalid username/email or password');
  });
});

describe('POST /user/update', () => {
  it("should update user's map array", async () => {
    let user = await User.findOne({ email: email });

    const id = new mongoose.Types.ObjectId();

    // @ts-ignore
    user!.maps = [id.toString()];

    const res = await request(app).post('/user/update').send({
      userObj: user,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.error).toBe(false);

    user = await User.findOne({ email: email });
    expect(user!.maps[0]).toStrictEqual(id);
  });

  it('should return error with empty user obj', async () => {
    const res = await request(app).post('/user/update').send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.errorMessage).toStrictEqual('invalid user object');
  });

  it('should return error with invalid user obj', async () => {
    const res = await request(app)
      .post('/user/update')
      .send({
        userObj: {
          email: 'a',
        },
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.errorMessage).toStrictEqual('user not found');
  });
});

describe('POST /user/logout', () => {
  it('should successfully login and logout user', async () => {
    let res = await request(app).post('/user/logout').set('Cookie', loginCookie);

    expect(res.statusCode).toBe(200);

    res = await request(app).post('/user/logout').set('Cookie', registerCookie);

    expect(res.statusCode).toBe(200);
  });

  it('should fail to logout without logging in first', async () => {
    const res = await request(app).post('/user/logout');

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe(true);
  });
});

let key: string;

describe('POST /user/recover', () => {
  it('should return a recover key', async () => {
    const res = await request(app).post('/user/recover').send({
      email: email,
    });

    console.log(res.body);

    expect(res.statusCode).toBe(200);
    expect(res.body.error).toBe(false);
    expect(res.body).toHaveProperty('key');
    key = res.body.key;
  });

  it('should return error with null email', async () => {
    const res = await request(app).post('/user/recover').send({
      email: '',
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe(true);
  });

  it('should return error with invalid email', async () => {
    const res = await request(app).post('/user/recover').send({
      email: 'a@gmail.com',
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe(true);
  });
});

describe('PATH /recover', () => {
  it('should change user password', async () => {
    const res = await request(app).patch('/user/recover').send({
      email: email,
      recoverKey: key,
      password: 'test',
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.error).toBe(false);
  });

  it('should return error with null email/password', async () => {
    const res = await request(app).patch('/user/recover').send({
      email: '',
      recoverKey: key,
      password: '',
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe(true);
  });

  it('should return error with invalid recovery key', async () => {
    const res = await request(app).patch('/user/recover').send({
      email: email,
      recoverKey: 'key',
      password: 'test',
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe(true);
  });
});

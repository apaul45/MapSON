import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app';
import User from '../src/models/user-model';
import Map from '../src/models/map-model';

const mongoStr = `${process.env.DB}/mapson`;

const email = 'test@gmail.com';
const username = 'test';
const password = 'test123';

const newName = 'Updated Jest Map';
const description = 'My Jest Map';

let loginCookie: string;
let createdMapId: string;

//Register a user before all tests, then delete on teardown
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
  loginCookie = res.header['set-cookie'];
});

afterAll(async () => {
  //Test delete here
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

describe('POST /maps/map', () => {
  it('should create a new map', async () => {
    const res = await request(app)
      .post('/maps/map')
      .set('Cookie', loginCookie)
      .send({ mapName: 'Jest Map' });

    expect(res.statusCode).toBe(200);
    expect(res.body.map.name).toBe('Jest Map');

    createdMapId = res.body.map._id;
  });

  it('should fail if no authentication', async () => {
    const res = await request(app).post('/maps/map/').send({ mapName: 'Jest Map' });

    expect(res.statusCode).toBe(401);
    expect(res.body.errorMessage).toEqual('invalid session');
  });

  it('should create a new map from existing data', async () => {
    const res = await request(app)
      .post('/maps/map')
      .set('Cookie', loginCookie)
      .send({
        mapName: 'Jest Map',
        geojson: {
          type: 'FeatureCollection',
          features: [EXAMPLE_FEATURE],
        },
      });

    expect(res.statusCode).toBe(200);

    createdMapId = res.body.map._id;

    console.log(res.body.map.features);

    expect(stripFeature(res.body.map.features.features[0])).toMatchObject(EXAMPLE_FEATURE);
  });
});

describe('Get Map Tests', () => {
  it('should retrieve the created map', async () => {
    const res = await request(app).get(`/maps/map/${createdMapId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.map._id).toEqual(createdMapId);
  });

  it('should retrieve all maps', async () => {
    const res = await request(app).get('/maps/allmaps');
    expect(res.statusCode).toBe(200);
  });
});

describe('Update Map Test', () => {
  it('should update the created map', async () => {
    const res = await request(app)
      .put(`/maps/map/${createdMapId}`)
      .set('Cookie', loginCookie)
      .send({ changes: { name: newName, description: description } });

    expect(res.statusCode).toBe(201);
  });

  it('should fail if no authentication', async () => {
    const res = await request(app)
      .put(`/maps/map/${createdMapId}`)
      .send({ changes: { name: newName, description: description } });

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBeTruthy();
  });
});

const EXAMPLE_FEATURE = {
  type: 'Feature',
  properties: {
    key: 'value',
  },
  geometry: {
    type: 'LineString',
    coordinates: [
      [47.13026404380798, 9.53280758153806],
      [47.13080048561096, 9.528776318322342],
      [47.13080048561096, 9.528776318322342],
    ],
  },
};

const EXAMPLE_FEATURE_2 = {
  type: 'Feature',
  properties: {
    key: 'value',
  },
  geometry: {
    type: 'LineString',
    coordinates: [
      [47.13026404380798, 9.53280758153806],
      [47.13080048561096, 9.528776318322342],
      [47.13080048561096, 9.528776318322342],
      [47.13080048561096, 9.528776318322342],
    ],
  },
};

describe('Create Feature Test', () => {
  beforeEach(async () => {
    const mapRes = await request(app)
      .post('/maps/map')
      .set('Cookie', loginCookie)
      .send({ mapName: 'Jest Map' });

    expect(mapRes.statusCode).toBe(200);
    expect(mapRes.body.map.name).toBe('Jest Map');

    createdMapId = mapRes.body.map._id;
  });

  it('should fail if no authentication', async () => {
    const res = await request(app).post(`/maps/map/${createdMapId}/feature`).send(EXAMPLE_FEATURE);

    expect(res.statusCode).toBe(401);
    expect(res.body.errorMessage).toBe('invalid session');
  });

  it('should fail if invalid body', async () => {
    const res = await request(app)
      .post(`/maps/map/${createdMapId}/feature`)
      .set('Cookie', loginCookie)
      .send();

    expect(res.statusCode).toBe(400);
    expect(res.body.errorMessage).toBe('Bad request');
  });

  it('should create a feature', async () => {
    const res = await request(app)
      .post(`/maps/map/${createdMapId}/feature`)
      .set('Cookie', loginCookie)
      .send(EXAMPLE_FEATURE);

    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBeTruthy();
  });
});

describe('Get Feature Test', () => {
  let featureId: string;

  beforeEach(async () => {
    const mapRes = await request(app)
      .post('/maps/map')
      .set('Cookie', loginCookie)
      .send({ mapName: 'Jest Map' });

    expect(mapRes.statusCode).toBe(200);
    expect(mapRes.body.map.name).toBe('Jest Map');

    createdMapId = mapRes.body.map._id;

    const res = await request(app)
      .post(`/maps/map/${createdMapId}/feature`)
      .set('Cookie', loginCookie)
      .send(EXAMPLE_FEATURE);

    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBeTruthy();

    featureId = res.body._id;
  });

  it('should return the right geojson', async () => {
    const res = await request(app)
      .get(`/maps/map/${createdMapId}/feature/${featureId}`)
      .set('Cookie', loginCookie);

    expect(res.statusCode).toBe(200);
    expect(res.body.feature._id).toEqual(featureId);

    expect(stripFeature(res.body.feature)).toMatchObject(EXAMPLE_FEATURE);
  });

  it('should return the right geojson without auth', async () => {
    const res = await request(app).get(`/maps/map/${createdMapId}/feature/${featureId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.feature._id).toEqual(featureId);

    expect(stripFeature(res.body.feature)).toMatchObject(EXAMPLE_FEATURE);
  });
});

describe('Delete Feature Test', () => {
  let featureId: string;

  beforeEach(async () => {
    const mapRes = await request(app)
      .post('/maps/map')
      .set('Cookie', loginCookie)
      .send({ mapName: 'Jest Map' });

    expect(mapRes.statusCode).toBe(200);
    expect(mapRes.body.map.name).toBe('Jest Map');

    createdMapId = mapRes.body.map._id;

    const res = await request(app)
      .post(`/maps/map/${createdMapId}/feature`)
      .set('Cookie', loginCookie)
      .send(EXAMPLE_FEATURE);

    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBeTruthy();

    featureId = res.body._id;
  });

  it('should fail if no authentication', async () => {
    const res = await request(app).delete(`/maps/map/${createdMapId}/feature/${featureId}`);

    expect(res.statusCode).toBe(401);
    expect(res.body.errorMessage).toBe('invalid session');
  });

  it('should delete feature', async () => {
    const res = await request(app)
      .delete(`/maps/map/${createdMapId}/feature/${featureId}`)
      .set('Cookie', loginCookie);

    expect(res.statusCode).toBe(200);

    const mapRes = await request(app).get(`/maps/map/${createdMapId}`).set('Cookie', loginCookie);

    expect(res.statusCode).toBe(200);
    expect(mapRes.body.map.features.features.length).toBe(0);
  });
});

describe('Update Feature Test', () => {
  let featureId: string;

  beforeEach(async () => {
    const mapRes = await request(app)
      .post('/maps/map')
      .set('Cookie', loginCookie)
      .send({ mapName: 'Jest Map' });

    expect(mapRes.statusCode).toBe(200);
    expect(mapRes.body.map.name).toBe('Jest Map');

    createdMapId = mapRes.body.map._id;

    const res = await request(app)
      .post(`/maps/map/${createdMapId}/feature`)
      .set('Cookie', loginCookie)
      .send(EXAMPLE_FEATURE);

    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBeTruthy();

    featureId = res.body._id;
  });

  it('should fail if no authentication', async () => {
    const res = await request(app)
      .put(`/maps/map/${createdMapId}/feature/${featureId}`)
      .send(EXAMPLE_FEATURE_2);

    expect(res.statusCode).toBe(401);
    expect(res.body.errorMessage).toBe('invalid session');
  });

  it('should update feature', async () => {
    const res = await request(app)
      .put(`/maps/map/${createdMapId}/feature/${featureId}`)
      .set('Cookie', loginCookie)
      .send(EXAMPLE_FEATURE_2);

    expect(res.statusCode).toBe(200);

    const featureRes = await request(app)
      .get(`/maps/map/${createdMapId}/feature/${featureId}`)
      .set('Cookie', loginCookie);

    expect(stripFeature(featureRes.body.feature)).toMatchObject(EXAMPLE_FEATURE_2);
  });
});

const stripFeature = (f: object) => {
  return Object.fromEntries(
    Object.entries(f).filter(
      ([k, _]) => !['_id', '__v', 'bbox', 'createdAt', 'updatedAt'].includes(k)
    )
  );
};

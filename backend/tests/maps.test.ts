import request from 'supertest';
import mongoose, { Types } from 'mongoose';
import app from '../src/app';
import User from '../src/models/user-model';
import Map, { IMap } from '../src/models/map-model';

const mongoStr = `${process.env.DB}/mapson`;

const email = 'test@gmail.com';
const username = 'test';
const password = 'test123';
let user_id: Types.ObjectId;

const newName = 'Updated Jest Map';
const description = 'My Jest Map';

let loginCookie: string;
let createdMapId: string;

let map: IMap = {
  name: 'Test All Maps Map',
  owner: new Types.ObjectId(),
  downloads: 20,
  forks: 20,
  userAccess: [],
  upvotes: [],
  downvotes: [],
  description: '',
  comments: [],
  // @ts-ignore
  properties: {},
  published: { isPublished: true, publishedDate: new Date() },
  features: { type: 'FeatureCollection', features: [] },
};

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
  user_id = res.body._id;
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
});

describe('Get All Maps Test', () => {
  beforeAll(async () => {
    map.owner = new Types.ObjectId(user_id);
    await Map.insertMany([map]);
  });

  it('should get all published maps', async () => {
    const mapRes = await request(app).post('/maps/allmaps').send({ limit: 2 });

    expect(mapRes.statusCode).toEqual(200);
    expect(mapRes.body.maps).toHaveLength(1);

    mapRes.body.maps.forEach((map: any) => expect(map.published.isPublished).toBeTruthy());
  });

  it('should get all non user published maps', async () => {
    const mapRes = await request(app)
      .post('/maps/allmaps')
      .set('Cookie', loginCookie)
      .send({ limit: 2 });

    expect(mapRes.statusCode).toEqual(200);
    //Need to filter because owner being set null in populate stage (WIP)
    expect(mapRes.body.maps.filter((map: any) => map.owner)).toHaveLength(0);
  });

  it('should filter all maps', async () => {
    const allMaps = await Map.find({});

    const mapRes = await request(app)
      .post('/maps/allmaps')
      .set('Cookie', loginCookie)
      .send({ limit: 2, filterBy: { name: 'Test All Maps Map' } });

    expect(mapRes.statusCode).toEqual(200);
    expect(mapRes.body.maps.length).toBeLessThan(allMaps.length);
    expect(mapRes.body.maps).toHaveLength(1);
    expect(mapRes.body.maps[0].name).toEqual('Test All Maps Map');
  });

  it('should sort all maps', async () => {
    const mapRes = await request(app)
      .post('/maps/allmaps')
      .set('Cookie', loginCookie)
      .send({ limit: 2, sortBy: { forks: -1 } });

    expect(mapRes.statusCode).toEqual(200);
    expect(mapRes.body.maps[0].forks).toEqual(20);
  });

  it('should filter and sort all maps', async () => {
    let newMap = map;
    newMap.forks = 19;
    await Map.insertMany([newMap]);

    const mapRes = await request(app)
      .post('/maps/allmaps')
      .set('Cookie', loginCookie)
      .send({ limit: 2, filterBy: { name: 'Test All Maps Map' }, sortBy: { forks: -1 } });

    expect(mapRes.statusCode).toEqual(200);
    expect(mapRes.body.maps).toHaveLength(2);
    expect(mapRes.body.maps[0].forks).toEqual(20);
    expect(mapRes.body.maps[1].forks).toEqual(19);
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

describe('Fork Map Tests', () => {
  it('should fork a new map', async () => {
    const res = await request(app).post(`/maps/fork/${createdMapId}`).set('Cookie', loginCookie);

    expect(res.statusCode).toBe(200);

    const forkedMap = await Map.findOne({ _id: createdMapId });
    const newMap = res.body.map;

    expect(newMap.name).toEqual(forkedMap?.name);
    expect(newMap._id !== createdMapId);
    expect(forkedMap?.forks).toBeGreaterThan(0);
  });

  it('should fail if no map to be forked', async () => {
    const newId = new Types.ObjectId();
    const res = await request(app).post(`/maps/fork/${newId}`).set('Cookie', loginCookie);
    expect(res.statusCode).toBe(400);
    expect(res.body.errorMessage).toEqual('Invalid map');
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
    expect(res.body.feature).toBeTruthy();
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
    expect(res.body.feature._id).toBeTruthy();

    featureId = res.body.feature._id;
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
    expect(res.body.feature._id).toBeTruthy();

    featureId = res.body.feature._id;
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
    expect(res.body.feature._id).toBeTruthy();

    featureId = res.body.feature._id;
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

describe('Publish Map Test', () => {
  it('should publish the created map', async () => {
    const res = await request(app)
      .put(`/maps/map/${createdMapId}`)
      .set('Cookie', loginCookie)
      .send({ changes: { published: { isPublished: true, publishedDate: new Date() } } });

    expect(res.statusCode).toBe(201);
  });

  it('should unpublish the created map', async () => {
    const res = await request(app)
      .put(`/maps/map/${createdMapId}`)
      .set('Cookie', loginCookie)
      .send({ changes: { published: { isPublished: false, publishedDate: new Date(0) } } });

    expect(res.statusCode).toBe(201);
  });

  it('should fail if no authentication', async () => {
    const res = await request(app)
      .put(`/maps/map/${createdMapId}`)
      .send({ changes: { published: { isPublished: true, publishedDate: new Date() } } });

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBeTruthy();
  });
});

describe('Delete Map Test', () => {
  beforeEach(async () => {
    const mapRes = await request(app)
      .post('/maps/map')
      .set('Cookie', loginCookie)
      .send({ mapName: 'Jest Map' });

    expect(mapRes.statusCode).toBe(200);
    expect(mapRes.body.map.name).toBe('Jest Map');

    createdMapId = mapRes.body.map._id;
  });

  it('should delete the map', async () => {
    const res = await request(app).delete(`/maps/map/${createdMapId}`).set('Cookie', loginCookie);

    expect(res.statusCode).toBe(200);
  });

  it('should fail if no authentication', async () => {
    const res = await request(app).delete(`/maps/map/${createdMapId}`);

    expect(res.statusCode).toBe(401);
    expect(res.body.errorMessage).toBe('invalid session');
  });
});

describe('Edit Description Test', () => {
  it('should edit the description of the created map', async () => {
    const res = await request(app)
      .put(`/maps/map/${createdMapId}`)
      .set('Cookie', loginCookie)
      .send({ changes: { description: "Jest Map" } });

    expect(res.statusCode).toBe(201);
  });

  it('should fail if no authentication', async () => {
    const res = await request(app)
      .put(`/maps/map/${createdMapId}`)
      .send({ changes: { description: "Jest Map" } });

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBeTruthy();
  });
});

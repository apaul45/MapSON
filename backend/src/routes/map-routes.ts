import { Request, Response, Router } from 'express';
import { auth } from '../routes/user-routes';
import dotenv from 'dotenv';
import User from '../models/user-model';
import Map, { IMap } from '../models/map-model';
import Feature from '../models/feature-model';
import { FeatureCollection, Feature as FeatureType } from 'geojson';
import Pbf from 'pbf';
import * as gb from 'geobuf';

import mongoose, { PipelineStage, Types, isValidObjectId } from 'mongoose';

// const populatedFields = [
//     'owner',
//     'userAccess',
//     'upvotes',
//     'downvotes',
//     'comments',
//     'features'
// ];

dotenv.config();

const mapRouter = Router();

// Handles create a new map in the database request
mapRouter.post('/map', auth, async (req: Request, res: Response) => {
  const user = await User.findOne({
    email: req.session.email,
  });

  if (!req.body?.mapName) {
    return res.status(400).json({ error: true, errorMesage: 'Invalid body' });
  }

  let fg: FeatureCollection | null = null;

  // let geojson = req.body.geojson;
  // if (geojson instanceof Uint8Array) {
  //   geojson = gb.decode(geojson, new Pbf());
  // }

  if (req.body.geojson?.features instanceof Array) {
    fg = req.body.geojson as FeatureCollection;

    fg.features = await Promise.all(
      req.body.geojson?.features.map(async (v: FeatureType) => await Feature.create(v))
    );
  }

  const newMap: IMap = {
    name: req.body.mapName,
    //@ts-ignore
    owner: user!._id,
    userAccess: [user!.username],
    upvotes: [],
    downvotes: [],
    forks: 0,
    downloads: 0,
    published: { isPublished: false, publishedDate: new Date('0') },
    description: 'My New Map',
    comments: [],
    // @ts-ignore
    properties: {},
    features: fg ?? { type: 'FeatureCollection', features: [] },
  };

  const map = await Map.create(newMap);
  map.populate({ path: 'owner', select: 'username' });

  //Also need to modify user's array of maps
  user?.maps.push(map._id);
  await User.findOneAndUpdate({ _id: user?._id }, { maps: user?.maps });

  res.status(200).json({ map: map.toJSON() });
});

// Handles a delete a map request
mapRouter.delete('/map/:id', auth, async (req: Request, res: Response) => {
  const email = req.session.email;
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      error: true,
      errorMessage: 'Invalid map id',
    });
  }

  //if user doesnt exist
  const user = await User.findOne({
    email: email,
  });

  if (!user) {
    return res.status(400).json({
      error: true,
      errorMessage: 'User does not exist',
    });
  }

  //if map doesn't exist
  const map = await Map.findOne({ _id: id });
  if (!map) {
    return res.status(400).json({
      error: true,
      errorMessage: 'Map does not exist',
    });
  }

  //if the user is not the owner and doesnt have permission to delete the map
  //@ts-ignore
  // prettier-ignore
  if (!user._id.equals(map.owner) && !map.userAccess.includes(emailOrUsername)) {
    return res.status(401).json({
      error: true,
      errorMessage: 'Unauthorized',
    })
  }

  //Also need to modify user's array of maps
  await user.updateOne({
    $pull: {
      maps: map._id,
    },
  });

  // delete features in map
  await Feature.deleteMany({ _id: { $in: map.features.features } });

  // delete map
  await map.deleteOne();

  res.status(200).json({ error: false });
});

// Handles a get a map request, no auth for guest
mapRouter.get('/map/:id', async (req: Request, res: Response) => {
  let { id } = req.params;

  //if id doesnt exist
  if (!id || !isValidObjectId(id)) {
    return res.status(400).json({
      error: true,
      errorMessage: 'Invalid map ID',
    });
  }

  const map = await Map.find({ _id: id }).populate('owner').populate('features.features');

  //if map doesnt exist
  if (!map) {
    return res.status(400).json({
      error: true,
      errorMessage: 'Map doesnt exist',
    });
  }

  res.status(200).json({ map: map[0] });
});

// Route for getting all maps to show in discover screen
mapRouter.post('/allmaps', async (req: Request, res: Response) => {
  const { limit, filterBy, sortBy } = req.body;

  let matchBy: any = [{ 'published.isPublished': true }];

  //Discover screen only contains published maps other than the logged in users
  matchBy = req.session._id
    ? [...matchBy, { owner: { $ne: new Types.ObjectId(req.session._id) } }]
    : matchBy;

  matchBy = filterBy ? [...matchBy, filterBy] : matchBy;
  matchBy = { $and: matchBy };

  // Need to unwind published to check for nested isPublished field
  let stages: PipelineStage[] = [
    { $unwind: '$published' },
    { $unwind: '$published.isPublished' },
    { $match: matchBy },
  ];
  stages = sortBy ? [...stages, { $sort: sortBy }] : stages; // Include sort stage if it exists
  stages.push({ $limit: limit });

  console.log(stages);

  let maps = await Map.aggregate(stages);
  maps = await Map.populate(maps, { path: 'owner', select: 'username' });

  // if (req.session.username) {
  //   maps = maps.filter((map) => map.owner.username !== req.session.username);
  // }

  res.status(200).json({ maps: maps });
});

mapRouter.post('/fork/:id', auth, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { _id, username } = req.session;
  const userId = _id;

  const mapToFork = await Map.findOne({ _id: id });

  if (!mapToFork) {
    return res.status(400).json({ errorMessage: 'Invalid map' });
  }

  const newMap: IMap = {
    name: mapToFork.name,
    //@ts-ignore
    owner: userId,
    //@ts-ignore
    userAccess: [username],
    upvotes: [],
    downvotes: [],
    forks: 0,
    downloads: 0,
    published: { isPublished: false, publishedDate: new Date('0') },
    description: '',
    comments: [],
    // @ts-ignore
    properties: {},
    features: mapToFork.features,
  };

  //Update the fork count of the map being forked
  await Map.findOneAndUpdate({ _id: id }, { forks: mapToFork?.forks + 1 });

  //Then save this new map and return it
  let map = await Map.create(newMap);
  map = await map.populate(['features.features', { path: 'owner', select: 'username' }]);

  //Also need to modify user's array of maps
  await User.findOneAndUpdate({ _id: userId }, { $push: { maps: map._id } });

  res.status(200).json({ map: map.toJSON() });
});

//Handles get all of a user's maps request
//Not needed as of now because login returns the user's maps
// mapRouter.get('/usermaps', auth, async (req: Request, res: Response) => {
//     const  emailOrUsername = req.session.alias

//     const user = await User.findOne({
//         $or: [
//             {email: emailOrUsername},
//             {username: emailOrUsername}
//         ]
//     }).populate('maps');

//     if (!user) {
//         return res.status(400).json({
//             error: true,
//             errorMessage: 'User does not exist'
//         })
//     }
//     return res.status(201).json({ maps: user.maps })
// })

interface FeatureChanges {
  create: FeatureType[];
  delete: string[];
  edit: {
    [key: string]: FeatureType;
  };
}

// Handles update a map in the database request
mapRouter.put('/map/:id', auth, async (req: Request, res: Response) => {
  const { id } = req.params;
  const changes: FeatureChanges = req.body.changes;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      error: true,
      errorMessage: 'Invalid map id',
    });
  }

  if (!changes) {
    return res.status(400).json({
      error: true,
      errorMessage: 'Bad request',
    });
  }

  const map = await Map.findByIdAndUpdate({ _id: id }, changes);

  if (!map) {
    return res.status(400).json({
      error: true,
      errorMessage: 'Map not found',
    });
  }

  res.status(201).json(); //Need to send json to prevent stalling
});

mapRouter.post('/map/:id/feature', auth, async (req, res) => {
  const { id } = req.params;
  let index: number | undefined = undefined;

  try {
    const res = parseInt(req.query.index as string);

    if (res !== undefined && res >= 0) {
      index = res;
    }
  } catch {
    index = undefined;
  }

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      error: true,
      errorMessage: 'Invalid map id',
    });
  }

  if (!req.body) {
    return res.status(400).json({
      error: true,
      errorMessage: 'Bad request',
    });
  }

  const body: FeatureType = req.body;

  const map = await Map.findById({ _id: id });

  if (!map) {
    return res.status(400).json({
      error: true,
      errorMessage: 'Map not found',
    });
  }

  let feature;
  try {
    feature = await Feature.create(body);
  } catch {
    return res.status(400).json({
      error: true,
      errorMessage: 'Bad request',
    });
  }

  if (index === undefined || index > map.features.features.length) {
    index = map.features.features.length;
  }

  await map.updateOne({
    $push: {
      'features.features': {
        $each: [feature],
        $position: index,
      },
    },
  });

  return res.status(200).json({ error: false, feature: feature, featureIndex: index });
});

//no auth
mapRouter.get('/map/:mapid/feature/:featureid', async (req, res) => {
  const { mapid, featureid } = req.params;

  if (!isValidObjectId(mapid)) {
    return res.status(400).json({
      error: true,
      errorMessage: 'Invalid map id',
    });
  }

  if (!isValidObjectId(featureid)) {
    return res.status(400).json({
      error: true,
      errorMessage: 'Invalid feature id',
    });
  }
  const feature = await Feature.findById(featureid);

  if (!feature) {
    return res.status(400).json({
      error: true,
      errorMessage: 'Feature not found',
    });
  } else {
    res.status(200).json({ error: false, feature });
  }
});

mapRouter.put('/map/:mapid/feature/:featureid', auth, async (req, res) => {
  const { mapid, featureid } = req.params;

  if (!isValidObjectId(mapid)) {
    return res.status(400).json({
      error: true,
      errorMessage: 'Invalid map id',
    });
  }

  if (!isValidObjectId(featureid)) {
    return res.status(400).json({
      error: true,
      errorMessage: 'Invalid feature id',
    });
  }

  const body: FeatureType = req.body;

  let feature;
  try {
    feature = await Feature.findByIdAndUpdate(featureid, body);
  } catch (e) {
    console.log(e);
    console.log('Failed to update');
    return res.status(400).json({
      error: true,
      errorMessage: 'Bad request',
    });
  }

  if (!feature) {
    return res.status(400).json({
      error: true,
      errorMessage: 'Feature not found',
    });
  } else {
    res.status(200).json({ error: false, feature: body });
  }
});

mapRouter.delete('/map/:mapid/feature/:featureid', auth, async (req, res) => {
  const { mapid, featureid } = req.params;

  if (!isValidObjectId(mapid)) {
    return res.status(400).json({
      error: true,
      errorMessage: 'Invalid map id',
    });
  }

  if (!isValidObjectId(featureid)) {
    return res.status(400).json({
      error: true,
      errorMessage: 'Invalid feature id',
    });
  }

  const map = await Map.findById({ _id: mapid });

  if (!map) {
    return res.status(400).json({
      error: true,
      errorMessage: 'Map not found',
    });
  }

  const feature = await Feature.findByIdAndDelete(featureid);

  if (!feature) {
    return res.status(400).json({
      error: true,
      errorMessage: 'Feature not found',
    });
  }

  await map.updateOne({
    $pull: {
      'features.features': featureid,
    },
  });

  res.status(200).json({ error: false });
});

// mapRouter.put('/updatePublished', async (req: Request, res: Response) => {
//   const published = { isPublished: false, publishedDate: new Date() };
//   await Map.updateMany({ published: null }, { published });

//   res.status(200).json();
// });

// Handles search maps request
//mapRouter.get('/search', auth, async (req: Request, res: Response) => {})

// Handles fork map request
//mapRouter.post('/fork/:id', auth, async (req: Request, res: Response) => {})

// Handles request access request
//mapRouter.post('/access/:id', auth, async (req: Request, res: Response) => {})

export default mapRouter;

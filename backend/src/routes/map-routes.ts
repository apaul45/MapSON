import { Request, Response, Router } from 'express'
import { auth } from '../routes/user-routes'
import dotenv from 'dotenv'
import User from '../models/user-model'
import Map, { IMap } from '../models/map-model'
import { Types } from 'mongoose'

// const populatedFields = [
//     'owner',
//     'userAccess',
//     'upvotes',
//     'downvotes',
//     'comments',
//     'features'
// ];

dotenv.config()

const mapRouter = Router()

// Handles create a new map in the database request
mapRouter.post('/map', auth, async (req: Request, res: Response) => {
  const user = await User.findOne({
    $or: [{ email: req.session.alias }, { username: req.session.alias }],
  })

  const newMap: IMap = {
    name: 'My New Map',
    //@ts-ignore
    owner: user?._id,
    userAccess: [],
    upvotes: [],
    downvotes: [],
    forks: 0,
    downloads: 0,
    published: null,
    description: '',
    comments: [],
    features: {},
  }

  const map = await Map.create(newMap)

  //Also need to modify user's array of maps
  user?.maps.push(map._id)
  await User.findOneAndUpdate({ _id: user?._id }, { maps: user?.maps })

  res.status(200).json({ map: map.toJSON() })
})

// Handles a delete a map request
mapRouter.delete('/map/:id', auth, async (req: Request, res: Response) => {
  const emailOrUsername = req.session.alias
  const { id } = req.params

  //if user doesnt exist
  const user = await User.findOne({
    $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
  })

  if (!user) {
    return res.status(400).json({
      error: true,
      errorMessage: 'User does not exist',
    })
  }
  console.log(user)

  //if map doesn't exist
  const map = await Map.findOne({ _id: id })
  if (!map) {
    return res.status(400).json({
      error: true,
      errorMessage: 'Map does not exist',
    })
  }
  console.log(map)

  //if the user is not the owner and doesnt have permission to delete the map
  //@ts-ignore
  // prettier-ignore
  if (!user._id.equals(map.owner) &&!map.userAccess.includes(emailOrUsername)) {
    return res.status(401).json({
      error: true,
      errorMessage: 'Unauthorized',
    })
  }

  //delete map
  await Map.findOneAndDelete({ _id: map._id })

  //Also need to modify user's array of maps
  user.maps = user?.maps.filter((userMap) => !userMap._id.equals(map._id))
  await User.findOneAndUpdate({ _id: user?._id }, { maps: user?.maps })

  res.status(200).json({ error: false })
})

// Handles a get a map request, no auth for guest
mapRouter.get('/map/:id', async (req: Request, res: Response) => {
  let { id } = req.params

  //if id doesnt exist
  if (!id) {
    return res.status(400).json({
      error: true,
      errorMessage: 'Invalid map ID',
    })
  }

  // TODO: Need to add geojson schema later so feature field also has to be populated
  const map = await Map.find({ _id: id }).populate('owner')

  //if map doesnt exist
  if (!map) {
    return res.status(400).json({
      error: true,
      errorMessage: 'Map doesnt exist',
    })
  }

  res.status(200).json({ map: map[0] })
})

// Handles get all the published maps request, no auth for guest
mapRouter.get('/allmaps', async (req: Request, res: Response) => {
  const maps = await Map.find({ published: { isPublished: true } }).populate(
    'owner'
  )

  if (!maps.length) {
    return res.status(400).json({
      error: true,
      errorMessage: 'Maps not found',
    })
  }

  res.status(200).json({ maps: maps })
})

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

// Handles update a map in the database request
mapRouter.put('/map/:id', auth, async (req: Request, res: Response) => {
  const { id } = req.params
  const { changes } = req.body
  console.log(changes)

  if (!changes) {
    return res.status(400).json({
      error: true,
      errorMessage: 'Bad request',
    })
  }

  const map = await Map.findByIdAndUpdate({ _id: id }, { $set: changes })

  if (!map) {
    return res.status(400).json({
      error: true,
      errorMessage: 'Map not found',
    })
  }

  res.status(201).json({ map: map })
})

// Handles search maps request
//mapRouter.get('/search', auth, async (req: Request, res: Response) => {})

// Handles fork map request
//mapRouter.post('/fork/:id', auth, async (req: Request, res: Response) => {})

// Handles request access request
//mapRouter.post('/access/:id', auth, async (req: Request, res: Response) => {})

export default mapRouter

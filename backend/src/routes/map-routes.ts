import { Request, Response, NextFunction, Router } from 'express'
import { auth } from '../routes/user-routes'
import { v4 as uuidv4 } from 'uuid'
import dotenv from 'dotenv'
import User from '../models/user-model'
import Map from '../models/map-model'

dotenv.config();

const mapRouter = Router()

// Handles create a new map in the database request
mapRouter.post('/map', auth, async (req: Request, res: Response) => {
    const { username } = req.body

    await Map.create({
        name: 'My New Map',
        owner: username,
        userAccess: [],
        upvotes: [],
        downvotes: [],
        forks: 0,
        downloads: 0,
        published: false,
        description: '',
        comments: [],
        features: [],
    });

    res.status(201).json({ error: false });
})

// Handles a delete a map request
mapRouter.delete('/map/:id', auth, async (req: Request, res: Response) => {
    const { id, username, userAccess } = req.body

    //if credentials not provided correctly 
    if (!id || !username || !userAccess) {
        return res.status(400).json({
            error: true,
            errorMessage: 'Invalid map ID'
        })
    }

    //if user doesnt exist
    const user = await User.findOne({ username: username })
    if (!user) {
        return res.status(400).json({
            error: true,
            errorMessage: 'User does not exist'
        })
    }

    //if map doesn't exist
    const map = await Map.findOne({ _id: id })
    if (!map) {
        return res.status(400).json({
            error: true,
            errorMessage: 'Map does not exist'
        })
    }

    //if the user is not the owner and doesnt have permission to delete the map
    if (username != map.owner && map.userAccess.includes(username) === false) {
        return res.status(401).json({
            error: true,
            errorMessage: 'Unauthorized'
        })
    }

    //delete map
    await Map.findOneAndDelete({ _id: map._id })

    res.status(200).json({ error: false })
})

// Handles a get a map request, no auth for guest
mapRouter.get('/map/:id', async (req: Request, res: Response) => {
    const { id } = req.body

    //if id doesnt exist
    if (!id) {
        return res.status(400).json({
            error: true,
            errorMessage: 'Invalid map ID'
        })
    }

    const map = await Map.find({ _id: id })
    
    //if map doesnt exist
    if (!map) { 
        return res.status(400).json({ 
            error: true, 
            errorMessage: 'Map doesnt exist'
        })
    }

    res.status(201).json({ error: false, map: map })
})

// Handles get all the published maps request, no auth for guest
mapRouter.get('/allmaps', async (req: Request, res: Response) => {
    const maps = await Map.find( { published: { isPublished: true }})

    if (!maps.length) {
        return res.status(400).json({
            error: true,
            errorMessage: 'Maps not found'
        })
    }

    return res.status(201).json({ error: false, maps: maps })
})

//Handles get all of a user's maps request
mapRouter.get('/maps', auth, async (req: Request, res: Response) => {
    const  { username } = req.body

    if (!username) {
        return res.status(400).json({
            error: true,
            errorMessage: 'Invalid map ID'
        })
    }

    //if user doesnt exist
    const user = await User.findOne({ username: username})
    if (!user) {
        return res.status(400).json({
            error: true,
            errorMessage: 'User does not exist'
        })
    }

    const maps = await Map.find({ owner: username })

    if (!maps.length) {
        return res.status(400).json({
            error: true,
            errorMessage: 'Maps not found'
        })
    }

    return res.status(201).json({ error: false, maps: maps })
})

// Handles update a map in the database request
mapRouter.put('/map/:id', auth, async (req: Request, res: Response) => {
    const body = req.body
    
    if (!body) {
        return res.status(400).json({
            error: true,
            errorMessage: 'Bad request'
        })
    }

    const map = await Map.findOne({ _id: req.params.id })

    if (!map) {
        return res.status(400).json({
            error: true,
                errorMessage: 'Map not found'
        }) 
    }

    map.name = body.name;
    map.userAccess = body.userAccess;
    map.upvotes = body.upvotes;
    map.downvotes = body.downvotes;  
    map.forks = body.forks;
    map.downloads = body.downloads;
    map.published = body.published;
    map.description = body.description;
    map.comments = body.comments;
    map.features = body.features;

    return res.status(201).json({ error: false, map: map }) 
})

// Handles search maps request
//mapRouter.get('/search', auth, async (req: Request, res: Response) => {})

// Handles fork map request
//mapRouter.post('/fork/:id', auth, async (req: Request, res: Response) => {})

// Handles request access request
//mapRouter.post('/access/:id', auth, async (req: Request, res: Response) => {})

export default mapRouter
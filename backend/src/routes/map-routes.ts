import { Request, Response, NextFunction, Router } from 'express'
import router from 'user-routes.ts'
import { v4 as uuidv4 } from 'uuid'
import dotenv from 'dotenv'

dotenv.config()

// A function that checks for cookie to verify if a user is logged in. Calls the intended function if verified 
const auth = router.auth

const router = Router()

const Map = require('../models/map-model');

// Handles create a new map in the database request
router.post('/map', auth, async (req: Request, res: Response) => {
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
    })

    res.status(201).json({ error: false })
}

// Handles a delete a map request
router.delete('/map/:id', auth, async (req: Request, res: Response) => {
    const { id, username, userAccess } = req.body

    //if credentials not provided correctly 
    if (!id || !username || !userAccess) {
        return res.status(400).json({
            error: true,
            errorMessage: 'Invalid map ID'
        })
    }

    //if user doesnt exist
    user = await User.findOne({ username: username})
    if (!user) {
        return res.status(400).json({
            error: true,
            errorMessage: 'User does not exist'
        })
    }

    //if map doesn't exist
    map = await Map.findOne({ _id: id })
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
    await Map.Delete({ _id: map._id })

    res.status(200).json({ error: false })
}

// Handles a get a map request, no auth for guest
router.get('/map/:id', async (req: Request, res: Response) => {
    const { id } = req.body

    //if id doesnt exist
    if (!id) {
        return res.status(400).json({
            error: true,
            errorMessage: 'Invalid map ID'
        })
    }

    await Map.find({ _id: req.params.id }, (err, map) => {
        if (err) {
            return res.status(400).json({ error: true, errorMessage: 'Map doesn't exist' });
        }
        return res.status(201).json({ error: false, map: map })
    }).catch(err => console.log(err))
}

// Handles get all the published maps request, no auth for guest
router.get('/allmaps', async (req: Request, res: Response) => {
    maps = await Map.find({})

    if (!maps.length) {
        return res.status(400).json({
            error: true,
            errorMessage: 'Maps not found'
        })
    }

    allMaps = maps.filter(published => published === true)

    return res.status(201).json({ error: false, allMaps: allMaps })
}

//Handles get all of a user's maps request
router.get('/maps', auth, async (req: Request, res: Response) => {
    const  { username } = req.body

    if (!username) {
        return res.status(400).json({
            error: true,
            errorMessage: 'Invalid map ID'
        })
    }

    //if user doesnt exist
    user = await User.findOne({ username: username})
    if (!user) {
        return res.status(400).json({
            error: true,
            errorMessage: 'User does not exist'
        })
    }

    maps = await Map.find({})

    if (!maps.length) {
        return res.status(400).json({
            error: true,
            errorMessage: 'Maps not found'
        })
    }

    allMaps = maps.filter(owner => owner === username)

    return res.status(201).json({ error: false, maps: maps })
}

// Handles update a map in the database request
router.put('/map/:id', auth, async (req: Request, res: Response) => {
    const body = req.body
    
    if (!body) {
        return res.status(400).json({
            error: true,
            errorMessage: 'Bad request'
        })
    }

    await Map.findOne({ _id: req.params.id }, (err, map) => {
        if (err) {
            return res.status(400).json({
                error: true,
                errorMessage: 'Map not found'
            }) 
        }

        map.name = req.name;
        map.userAccess = req.userAccess;
        map.upvotes = req.upvotes;
        map.downvotes = req.downvotes;
        map.forks = req.forks;
        map.downloads = req.downloads;
        map.published = req.published;
        map.description = req.description;
        map.comments = req.comments;
        map.features = req.features;
    })

    return res.status(201).json({ error: false, map: map }) 
}

// Handles search maps request
//router.get('/search', auth, async (req: Request, res: Response) => {
    // const { id } = req.body 

    // await Map.find({ _id: req.params.id }, (err, map) => {
    //     if (err) {
    //         return res.status(400).json({ error: true, errorMessage: 'Map doesn't exist });
    //     }
    //     return res.status(201).json({ error: false, map: map })
    // }).catch(err => console.log(err))
//s}

// Handles fork map request
//router.post('/fork/:id', auth, async (req: Request, res: Response) => {}

// Handles request access request
//router.post('/access/:id', auth, async (req: Request, res: Response) => {}
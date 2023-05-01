import { Request, Response, NextFunction, Router } from 'express';
import User from '../models/user-model';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import axios from 'axios';
import Map from '../models/map-model';
import { Types } from 'mongoose';

dotenv.config();

const router = Router();

declare module 'express-session' {
  interface SessionData {
    _id: Types.ObjectId;
    username: string; // suppose to be email/username
    email: string;
  }
}

export const auth = (req: Request, res: Response, next: NextFunction) => {
  const { email, username } = req.session as any;

  if (!email || !username) {
    return res.status(401).json({
      error: true,
      errorMessage: 'invalid session',
    });
  }

  next();
};

router.post('/register', async (req: Request, res: Response) => {
  const { email, username, password } = req.body;

  if (!email || !username || !password) {
    return res.status(400).json({
      error: true,
      errorMessage: 'invalid email, username, or password',
    });
  }

  const dups = await User.find({
    $or: [{ email: email }, { username: username }],
  });

  if (dups && dups.length > 0) {
    return res.status(400).json({
      error: true,
      errorMessage: 'User already exists',
    });
  }

  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = await User.create({
    username: username,
    email: email,
    passwordHash: passwordHash,
    recoveryKey: '',
    maps: [],
  });

  req.session.username = username;
  req.session.email = email;
  req.session._id = user._id;
  res.status(200).json({ error: false, user: user.toJSON() });
});

router.post('/login', async (req: Request, res: Response) => {
  const { emailOrUsername, password } = req.body;

  if (!emailOrUsername || !password) {
    return res.status(400).json({
      error: true,
      errorMessage: 'empty email/username or password',
    });
  }
  const user = await User.findOne({
    $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
  }).populate({
    path: 'maps',
    populate: {
      path: 'owner',
      select: 'username',
    },
  });

  if (!user) {
    return res.status(400).json({
      error: true,
      errorMessage: 'user not found',
    });
  }

  if (!(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({
      error: true,
      errorMessage: 'invalid username/email or password',
    });
  }

  req.session.email = user.email;
  req.session.username = user.username;
  req.session._id = user._id;

  res.status(200).json(user.toJSON());
});

router.post('/logout', auth, (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(400).json({
        error: true,
        errorMessage: 'failed to log out',
      });
      throw err;
    } else res.status(200).json({ error: false });
  });
});

router.post('/recover', async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      error: true,
      errorMessage: 'invalid email input',
    });
  }

  const user = await User.findOne({ email: email });

  if (!user) {
    return res.status(400).json({
      error: true,
      errorMessage: 'user not found',
    });
  }

  const recoverKey = uuidv4();
  const recoverLink = `https://mapson.vercel.app/reset-password?email=${encodeURIComponent(
    email
  )}&key=${encodeURIComponent(recoverKey)}`;

  user.recoveryKey = recoverKey;
  await user.save();

  if (process.env.DEV) {
    return res.status(200).json({
      error: false,
      key: recoverKey,
    });
  }

  sendEmail(email, recoverLink, 'Mapson Password Recovery Link');

  res.status(200).json({ error: false });
});

router.patch('/recover', async (req: Request, res: Response) => {
  const { email, recoverKey, password } = req.body;

  if (!recoverKey || !email || !password) {
    return res.status(400).json({
      error: true,
      errorMessage: 'invalid recovery key or email',
    });
  }

  const user = await User.findOne({ email: email });

  if (!user || user.recoveryKey !== recoverKey) {
    return res.status(401).json({
      error: true,
      errorMessage: 'invalid recovery key',
    });
  }

  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  const passwordHash = await bcrypt.hash(password, salt);

  user.passwordHash = passwordHash;
  user.recoveryKey = '';

  await user.save();

  res.status(200).json({ error: false });
});

router.post('/update', async (req: Request, res: Response) => {
  const { userObj } = req.body;

  if (!userObj) {
    return res.status(400).json({
      error: true,
      errorMessage: 'invalid user object',
    });
  }

  let newUser = await User.findOne({
    $or: [{ username: userObj.username }, { email: userObj.email }],
  });

  if (!newUser) {
    return res.status(400).json({
      error: true,
      errorMessage: 'user not found',
    });
  }

  if (userObj.mapToAdd) {
    newUser.maps.push(userObj.mapToAdd);
    userObj.maps = newUser.maps;
    sendEmail(
      newUser.email,
      `https://mapson.vercel.app/project/${encodeURIComponent(userObj.mapToAdd)}`,
      'Mapson Project Inivation link'
    );
  } else if (userObj.mapToRemove) {
    const index = newUser.maps.indexOf(userObj.mapToRemove);
    if (index >= 0) {
      newUser.maps.splice(index, 1);
    }
    userObj.maps = newUser.maps;
  }

  newUser = await User.findOneAndUpdate({ email: newUser.email }, userObj, { new: true });

  res.status(200).json({
    error: false,
  });
});

//
router.get('/check', async (req: Request, res: Response) => {
  const user = await User.findById(req.session._id).populate('maps');

  if (!user) {
    return res.status(400).json({
      error: true,
      errorMessage: 'user not found',
    });
  }

  res.status(200).json(user.toJSON());
});

// router.delete('/scrubmaps', async (req, res) => {
//   const user = await User.findOne({ username: 'cypressUser' });

//   await Map.deleteMany({ owner: user?._id });

//   //@ts-ignore
//   user?.maps = [];
//   await user?.save();
//   res.status(201).json();
// });

const sendEmail = (email: string, link: string, subject: string) => {
  if (process.env.DEV) return;

  const url = 'https://api.sendinblue.com/v3/smtp/email';

  const headers = {
    'Content-Type': 'application/json',
    'api-key': process.env.API_KEY,
  };

  const data = {
    sender: { email: 'mapson2023@gmail.com' },
    to: [{ email: email }],
    subject: subject,
    htmlContent: link,
  };
  axios
    .post(url, data, { headers: headers })
    .then((response) => console.log('send email response', response.data))
    .catch((error) => console.log(error));
};

export default router;

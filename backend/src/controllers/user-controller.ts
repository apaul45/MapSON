import { Request, Response, NextFunction, Router } from 'express';
import User from '../models/user-model';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { createTransport } from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

declare module 'express-session' {
    interface SessionData {
        alias: string; // suppose to be email/username
    }
}

const transport = createTransport({
    service: 'smtp-relay.sendinblue.com',
    port: 587,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.SMTP_PASS,
    }
})

const register = async (req: Request, res: Response) => {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
        return res
            .status(400)
            .json({
                error: true,
                errorMessage: 'invalid email, username, or password'
            });
    }

    const dups = await User.find({ $or: [{ email: email }, { username: username }] })

    if (dups && dups.length > 0) {
        return res
            .status(400)
            .json({
                error: true,
                errorMessage: 'User already exist'
            });
    }

    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const passwordHash = await bcrypt.hash(password, salt);


    await User.create({
        username: username,
        email: email,
        passwordHash: passwordHash,
        recoveryKey: '',
        maps: []
    })

    res
        .status(200)
        .json({
            error: false
        })
}

const login = async (req: Request, res: Response) => {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
        return res
            .status(400)
            .json({
                error: true,
                errorMessage: "empty email/username or password"
            })
    }

    const user = await User.findOne({ $or: [{ email: emailOrUsername }, { username: emailOrUsername }] })

    console.log(user)

    if (!user) {
        return res
            .status(400)
            .json({
                error: true,
                errorMessage: "user not found"
            });
    }

    if (!bcrypt.compare(password, user.passwordHash)) {
        return res
            .status(401)
            .json({
                error: true,
                errorMessage: "invalid username/email or password"
            })
    }

    req.session.alias = emailOrUsername;

    res
        .status(200)
        .json({
            error: false
        })
}

const logout = (req: Request, res: Response) => {
    console.log(req.session)
    req.session.destroy((err) => {
        if (err) {
            res
                .status(400)
                .json({
                    error: true,
                    errorMessage: 'failed to log out'
                })
            throw err
        } else {
            res
                .status(200)
                .json({
                    error: false
                })

        }
    })
}

const recover = async (req: Request, res: Response) => {
    const { email } = req.body

    if (!email) {
        return res
                .status(400)
                .json({
                    error: true,
                    errorMessage: 'invalid email input'
                })
    }

    const user = await User.findOne({email: email})

    if(!user){
        return res
                .status(400)
                .json({
                    error: true,
                    errorMessage: "user not found"
                })
    }

    const recoverKey = uuidv4();
    const recoverLink = `https://mapson.vercel.app/recover-account?email=${encodeURIComponent(email)}&key=${encodeURIComponent(recoverKey)}`

    user.recoveryKey = recoverKey;
    await user.save()

    await transport.sendMail({
        from: process.env.SENDER_EMAIL,
        to: email,
        subject: "Password Recovery for MapSON",
        text: recoverLink
    })

    res
        .status(200)
        .json({
            error: false
        })
}   

const reset = async  (req: Request, res: Response) => {
    const {email, recoverKey, password} = req.body;

    if (!recoverKey || !email || !password) {
        return res
                .status(400)
                .json({
                    error: true,
                    errorMessage: "invalid recovery key or email"
                })
    }

    const user = await User.findOne({email: email})

    if(!user || user.recoveryKey !== recoverKey) {
        return res      
                .status(401)
                .json({
                    error: true,
                    errorMessage: 'invalid recovery key'
                })
    }

    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const passwordHash = await bcrypt.hash(password, salt);

    user.passwordHash = passwordHash;
    user.recoveryKey = '';

    await user.save();

    res
        .status(200)
        .json({
            error: false
        })
}


export const auth = (req: Request, res: Response, next: NextFunction) => {
    const {alias} = req.session as any;

    if(!alias) {
        return res
                .status(401)
                .json({
                    error: true,
                    errorMessage: "invalid session"
                })
    }

    next()
}

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout)
router.post('/recover', recover);
router.patch('/recover', reset);

export default router;
import mongoose, { Schema, Types } from 'mongoose'

export interface IUser {
  firstName: string
  lastName: string
  username: string
  email: string
  passwordHash: string
  recoveryKey: string
  maps: [{ type: Types.ObjectId; ref: 'Map' }]
}

const userSchema: Schema = new Schema<IUser>(
  {
    username: { type: String, required: true },
    email: { type: String, required: true },
    passwordHash: { type: String, required: true },
    recoveryKey: { type: String },
    maps: [{ type: Types.ObjectId, ref: 'Map' }],
  },
  { timestamps: true }
)

const User = mongoose.model<IUser>('User', userSchema)

export default User

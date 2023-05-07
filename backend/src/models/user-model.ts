import mongoose, { Schema, Types } from 'mongoose';

export interface IUser {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  passwordHash: string;
  recoveryKey: { key: string; expire: Date };
  maps: Types.ObjectId[];
}

const recoverKeySchema = new Schema<IUser['recoveryKey']>({
  key: { type: String },
  expire: { type: Date },
});

const userSchema: Schema = new Schema<IUser>(
  {
    username: { type: String, required: true },
    email: { type: String, required: true },
    passwordHash: { type: String, required: true },
    recoveryKey: { type: recoverKeySchema },
    maps: [{ type: Schema.Types.ObjectId, ref: 'Map' }],
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>('User', userSchema);

export default User;

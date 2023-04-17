import mongoose, { Schema, Types } from 'mongoose'
import Feature from '../models/feature-model'

interface Comment {
  username: string
  comment: string
}

export interface IMap {
  name: string
  owner: Types.ObjectId
  userAccess: string[]
  upvotes: string[]
  downvotes: string[]
  forks: number
  downloads: number
  published: { isPublished: Boolean; publishedDate: Date } | null
  description: string
  comments: Comment[]
  features: Object
}

const mapSchema = new Schema<IMap>(
  {
    name: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userAccess: [{ type: String, required: true }],
    upvotes: [{ type: String, required: true }],
    downvotes: [{ type: String, required: true }],
    forks: { type: Number, required: true },
    downloads: { type: Number, required: true },
    published: {
      type: { isPublished: Boolean, publishedDate: Date },
    },
    description: { type: String },
    comments: [{ user: { type: String }, comment: { type: String } }],
    features: { type: Object },
  },
  { timestamps: true }
)

const Map = mongoose.model<IMap>('Map', mapSchema)

export default Map

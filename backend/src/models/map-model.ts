import mongoose, { Schema, Types } from 'mongoose'
import { FeatureCollection } from "geojson"

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
  published: { isPublished: boolean; publishedDate: Date } | null
  description: string
  comments: Comment[]
  features: FeatureCollection
}

const commentSchema = new Schema<Comment>(
  { username: { type: String, required: true }, comment: { type: String, required: true } }
)

const publishedSchema = new Schema<IMap['published']>({
  isPublished: { type: Boolean, required: true },
  publishedDate: { type: Date, required: true }
})

export const featureCollectionSchema = new Schema<FeatureCollection>({
  type: { type: String, required: true, enum: ["FeatureCollection"], default: "FeatureCollection" },
  features: [{ type: Schema.Types.ObjectId, ref: 'Feature' }]
})

const mapSchema = new Schema<IMap>(
  {
    name: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userAccess: [{ type: String, required: true }],
    upvotes: [{ type: String, required: true }],
    downvotes: [{ type: String, required: true }],
    forks: { type: Number, required: true },
    downloads: { type: Number, required: true },
    published: { type: publishedSchema },
    description: { type: String, default: "" },
    comments: [commentSchema],
    features: { type: featureCollectionSchema, required: true },
  },
  { timestamps: true }
)

const Map = mongoose.model<IMap>('Map', mapSchema)

export default Map

import mongoose, { Schema, Types } from "mongoose";
import Feature from "feature-model.ts"

export interface IMap {
    name: string
    owner: { type: Types.ObjectId; ref: 'User' }
    userAccess: [{ type: Types.ObjectId, ref: 'User' }]
    upvotes: [{ type: Types.ObjectId; ref: 'User' }]
    downvotes: [{ type: Types.ObjectId; ref: 'User' }]
    forks: number
    downloads: number
    published: { isPublished: Boolean; publishedDate: Date }
    description: string
    comments: [{ user: { type: Types.ObjectId; ref: 'User' }; comment: String }]
    features: { type: [{ type: Types.ObjectId; ref: 'Feature' }] }
}


const mapSchema: Schema = new Schema<IMap>(
  {
    name: { type: String, required: true },
    owner: { type: Types.ObjectId, ref: 'User', required: true },
    userAccess: [{ type: Types.ObjectId, ref: 'User '}]
    upvotes: [{ type: Types.ObjectId, ref: 'User' }],
    downvotes: [{ type: Types.ObjectId, ref: 'User' }],
    forks: { type: Number, required: true },
    downloads: { type: Number, required: true },
    published: {
      type: { isPublished: Boolean, publishedDate: Date },
      required: true,
    },
    description: { type: String },
    comments: [
      { user: { type: Types.ObjectId, ref: 'User' }, comment: String },
    ],
    features: { type: [{ type: Types.ObjectId, ref: 'Feature' }] },
  },
  { timestamps: true }
)
  
const Map = mongoose.model<IMap>('Map', mapSchema)

export default Map;
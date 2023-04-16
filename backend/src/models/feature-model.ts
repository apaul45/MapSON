import mongoose, { Schema, Types } from "mongoose";
import Geometry from "../models/geometry-model"

export interface IFeature {
    name: string
    id: Schema.Types.Mixed
    properties: Object
    geometry: typeof Geometry
    bbox: number
}

const featureSchema: Schema = new Schema<IFeature>(
    {
        name: { type: String, required: true },
        id: { type: Schema.Types.Mixed, required: true},
        properties: { type: Object, required: true},
        geometry: { type: Geometry, required: true },
        bbox: { type: Number, required: true },
    }
)

const Feature = mongoose.model<IFeature>('Feature', featureSchema)

export default Feature;
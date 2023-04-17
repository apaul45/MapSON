import mongoose, { Schema } from "mongoose";
import { Feature } from 'geojson'

const featureSchema = new Schema<Feature>(
    {
        type: { $type: String, enum: ["Feature"], default: "Feature", required: true },
        id: { $type: Schema.Types.Mixed, required: false },
        geometry: { $type: Schema.Types.Mixed, required: true },
        bbox: { $type: [Number], required: false },
        properties: { $type: Schema.Types.Mixed, required: false }
    },
    { timestamps: true, typeKey: "$type" }
)

const Feature = mongoose.model<Feature>('Feature', featureSchema)


export default Feature;
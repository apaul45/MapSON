import mongoose, { Schema, Types } from "mongoose";

export interface IGeometry {
    name: string
    coordinates: Types.Mixed
    geometries: [Geometry]
    bbox: number
}

const geometrySchema: Schema = new Schema<IGeometry>(
    {
        name: { type: String, required: true },
        coordinates: { type: Types.Mixed, required: true },
        geometries: [{ type: Geometry, required: true }],
        bbox: {type: Number, required: true},
    }
)

const Geometry = mongoose.model<IGeometry>('Geometry', geometrySchema)

export default Geometry;
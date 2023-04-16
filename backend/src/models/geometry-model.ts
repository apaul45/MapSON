import mongoose, { Schema, Types } from "mongoose";

export interface IGeometry {
    name: string
    coordinates: Schema.Types.Mixed
    geometries: [IGeometry]
    bbox: number
}

const geometrySchema: Schema = new Schema<IGeometry>(
    {
        name: { type: String, required: true },
        coordinates: { type: Schema.Types.Mixed, required: true },
        geometries: [{ type: new Schema<IGeometry>, required: true }],
        bbox: {type: Number, required: true},
    }
)

const Geometry = mongoose.model<IGeometry>('Geometry', geometrySchema)

export default Geometry;
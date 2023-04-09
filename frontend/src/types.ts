import { Feature, FeatureCollection, Geometry } from "geojson";

export interface User {
    username: string;
    maps?: Map[];
}

export interface Published {
    isPublished: boolean;
    publishedDate?: Date;
}

export interface Comment {
    username: string
    comment: string
}


// add mongodb _id type to geometries and features from `geojson` types
export interface CommonGeoJSONData {
    _id: string
}
export type GeometryExt = CommonGeoJSONData & Geometry;
export type FeatureExt = CommonGeoJSONData & Feature<GeometryExt>;
export type Features = Array<FeatureExt>

export type LGeoJsonExt = L.GeoJSON & CommonGeoJSONData;

export interface Map {
    _id: string;
    name: string;
    username: string;
    upvotes: User[];
    downvotes: User[];
    forks: number;
    downloads: number;
    published: Published;
    comments: Comment[];
    features: Features
}

export interface Store {
    currentMap: Map | null;
    maps: Map[];
    userMaps: Map[];
    deleteDialog: boolean;
    addDialog: boolean;
}

export interface UserModel {
    currentUser: User | null
}
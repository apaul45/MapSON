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
export type GeometryExtension = CommonGeoJSONData & Geometry;
export type FeatureExtension = CommonGeoJSONData & Feature<GeometryExtension>;
export type Features = Array<FeatureExtension>

export interface Map {
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
}

export interface UserModel {
    currentUser: User | null
}
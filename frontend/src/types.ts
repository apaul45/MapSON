import { FeatureCollection } from "geojson";

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

export interface Map {
    name: string;
    username: string;
    upvotes: User[];
    downvotes: User[];
    forks: number;
    downloads: number;
    published: Published;
    comments: Comment[];
    features: FeatureCollection
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
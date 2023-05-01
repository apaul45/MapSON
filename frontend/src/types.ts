import { Feature, FeatureCollection, Geometry } from 'geojson';

export interface User {
  email?: string;
  username: string;
  password: string;
  maps: Map[];
}

export interface Published {
  isPublished: boolean;
  publishedDate?: Date;
}

export interface Comment {
  username: string;
  comment: string;
}

export interface MongoData {
  _id: string;
  __v: string;
  updatedAt: string;
  createdAt: string;
}

export interface MongoData {
  _id: string;
  __v: string;
  updatedAt: string;
  createdAt: string;
}

// add mongodb _id type to geometries and features from `geojson` types
export interface CommonGeoJSONData {
  _id: string;
}

export type GeometryExt = CommonGeoJSONData & Geometry & MongoData;
export type FeatureExt = CommonGeoJSONData & Feature<GeometryExt> & MongoData;
export type Features = {
  type: 'FeatureCollection';
  features: Array<FeatureExt>;
};

export type LGeoJsonExt = L.GeoJSON & CommonGeoJSONData & LayerExt;

export interface LayerExt {
  _isConfigured: boolean;
  feature: FeatureExt;
}

export interface Owner {
  _id: string;
  username: string;
}

export interface Owner {
  _id: string;
  username: string;
}

export interface Map {
  _id: string;
  name: string;
  owner: string | Owner;
  upvotes: User[];
  downvotes: User[];
  forks: number;
  downloads: number;
  published: Published;
  comments: Comment[];
  features: Features;
  description?: string;
  properties: Record<string, any>;
  updatedAt?: string;
  userAccess: Array<string>;
}

export interface Store {
  currentMap: Map | null;
  maps: Map[];
  mapFilter: string;
  deleteDialog: boolean;
  shareDialog: boolean;
  addDialog: boolean;

  //For live collab
  // TODO: Make this a dictionary, so that user can join and track multiple rooms
  roomList: string[];
}

export interface UserModel {
  currentUser: User | null;
}

export interface ErrorModel {
  errorMessage: string | null;
}

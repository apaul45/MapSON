import { FeatureCollection } from 'geojson';
import { FeatureExt, Map, User } from '../types';

//GENERAL
interface Response {
  error: boolean;
  errorMessage?: string;
}

// AUTH
export interface RegisterResponse extends Response, User {}

export interface LoginResponse extends Response, User {}

export interface LogoutResponse extends Response {}

// MAP
export interface CreateMapResponse extends Response {
  map: Map;
}

export interface GetMapResponse extends Response {
  map: Map;
}

export interface GetAllMapsResponse extends Response {
  maps: Map[];
}

export interface DeleteMapResponse extends Response {}

export interface UpdateMapResponse extends Response {}

// FEATURE

export interface CreateFeatureResponse extends Response {
  _id: string;
}

export interface GetFeatureResponse extends Response {
  feature: FeatureExt;
}

export interface UpdateFeatureResponse extends Response {}

export interface DeleteFeatureResponse extends Response {}

export interface CreateMapRequest {
  geojson?: FeatureCollection;
  mapName: string;
}

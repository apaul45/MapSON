import { Feature } from 'geojson';
import { api } from './axios';
import { Map } from '../types';
import {
  CreateFeatureResponse,
  CreateMapResponse,
  DeleteFeatureResponse,
  DeleteMapResponse,
  GetAllMapsResponse,
  GetFeatureResponse,
  GetMapResponse,
  UpdateFeatureResponse,
  UpdateMapResponse,
} from './types';

export const createMap = (payload: Partial<Map>) =>
  api.post<CreateMapResponse>('/maps/map', payload);
export const deleteMap = (id: string) => api.delete<DeleteMapResponse>(`/maps/map/${id}`);
export const getMap = (id: string) => api.get<GetMapResponse>(`/maps/map/${id}`);
export const updateMap = (id: string, payload: Map) =>
  api.put<UpdateMapResponse>(`/maps/map/${id}`, payload);

export const createFeature = (id: string, payload: Feature) =>
  api.post<CreateFeatureResponse>(`/maps/map/${id}/feature`, payload);
export const getFeature = (id: string, featureid: string) =>
  api.get<GetFeatureResponse>(`/maps/map/${id}/feature/${featureid}`);
export const updateFeature = (id: string, featureid: string, payload: Partial<Feature>) =>
  api.put<UpdateFeatureResponse>(`/maps/map/${id}/feature/${featureid}`, payload);
export const deleteFeature = (id: string, featureid: string) =>
  api.delete<DeleteFeatureResponse>(`/maps/map/${id}/feature/${featureid}`);

export const getAllMaps = () => api.get<GetAllMapsResponse>('/maps/allmaps');

export default { createMap };
import { api } from './api'

export const createMap = (payload: any) => api.post('/maps/map', payload);
export const deleteMap = (id: string) => api.delete(`/maps/map/${id}`);
export const getMap = (id: string) => api.get(`/maps/map/${id}`);
export const updateMap = (id: string, payload: any) => api.put(`/maps/map/${id}`, payload);

export const createFeature = (id: string, payload: any) => api.post(`/maps/map/${id}/feature`, payload);
export const getFeature = (id: string, featureid: string) => api.get(`/maps/map/${id}/feature/${featureid}`);
export const updateFeature = (id: string, featureid: string, payload: any) => api.put(`/maps/map/${id}/feature/${featureid}`, payload);
export const deleteFeature = (id: string, featureid: string) => api.delete(`/maps/map/${id}/feature/${featureid}`);

export const getAllMaps = () => api.get('/maps/allmaps');
// export const getUserMaps = () => api.get('/maps/usermaps');


export default {
    createMap,
    deleteMap,
    getMap,
    updateMap,

    createFeature,
    getFeature,
    updateFeature,
    deleteFeature,

    getAllMaps
}


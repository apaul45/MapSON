import { api } from './axios';

export const createMap = (payload: any) => api.post('/maps/map', payload);

export default { createMap };

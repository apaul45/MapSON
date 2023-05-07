import { api } from './axios';
import { User } from '../types';
import { LoginResponse, LogoutResponse, RegisterResponse, UpdateResponse } from './types';

export const register = (payload: any) => api.post<RegisterResponse>('/user/register', payload);
export const login = (payload: User) => api.post<LoginResponse>('/user/login', payload);
export const logout = () => api.post<LogoutResponse>('/user/logout');
export const update = (payload: any) => api.post<UpdateResponse>('/user/update', payload);
export const recover = (payload: any) => api.post('/user/recover', payload);
export const reset = (payload: any) => api.patch('/user/recover', payload);

export const check = () => api.get<LoginResponse>('/user/check');

export default { register, login, logout, check, update, recover, reset };

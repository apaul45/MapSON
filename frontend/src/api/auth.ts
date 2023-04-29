import { api } from './axios';
import { User } from '../types';
import { LoginResponse, LogoutResponse, RegisterResponse } from './types';

export const register = (payload: any) => api.post<RegisterResponse>('/user/register', payload);
export const login = (payload: User) => api.post<LoginResponse>('/user/login', payload);
export const logout = () => api.post<LogoutResponse>('/user/logout');

export const check = () => api.get<LoginResponse>('/user/check');

export default { register, login, logout, check };

import { User } from './types'

import axios from 'axios'

axios.defaults.withCredentials = true

export const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': import.meta.env.VITE_BACKEND_URL,
  },
  withCredentials: true,
  validateStatus: function (status) {
    return status >= 200 && status < 300; // default
  },
})

export const register = (payload: any) => api.post('/user/register', payload)
export const login = (payload: User) => api.post<User>('/user/login', payload)
export const logout = () => api.post('/user/logout')
export const createMap = (payload: any) => api.post('/maps/map', payload)

export default {
  register,
  login,
  logout,
  createMap,
}

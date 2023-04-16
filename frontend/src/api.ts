import axios from 'axios'
import { User } from './types'

axios.defaults.withCredentials = true

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

export const register = (payload: any) => api.post('/user/register', payload)
export const login = (payload: User) => api.post<User>('/user/login', payload)
export const logout = () => api.post('/user/logout')

export default {
  register,
  login,
  logout,
}

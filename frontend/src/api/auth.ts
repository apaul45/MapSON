import { api } from './index'
import { User } from '../types'


export const register = (payload: any) => api.post('/user/register', payload)
export const login = (payload: User) => api.post<User>('/user/login', payload)
export const logout = () => api.post('/user/logout')

export default {
  register,
  login,
  logout,
}

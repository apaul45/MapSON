import { createModel } from '@rematch/core'
import { User, UserModel } from '../types'
import { RootModel } from '.'
import api from '../api/auth'
import { AxiosError } from 'axios'

export const user = createModel<RootModel>()({
  state: { currentUser: null } as UserModel,

  //Pure reducer functions
  reducers: {
    setCurrentUser: (state, payload: User | null) => {
      return { ...state, currentUser: payload }
    },
  },

  //Effects are (possibly async) functions that take in the store's state    and payload, and return anything

  effects: (dispatch) => ({
    async register(payload: User, state) {
      try {
        await api.register(payload)
        dispatch.user.setCurrentUser(payload)
      } catch (error: unknown) {
        const err = error as AxiosError
        // @ts-ignore
        dispatch.error.setError(err.response?.data.errorMessage)
      }
    },
    async login(payload, state) {
      try {
        const response = await api.login(payload)
        dispatch.user.setCurrentUser(response.data)
      } catch (error: unknown) {
        const err = error as AxiosError
        // @ts-ignore
        dispatch.error.setError(err.response?.data.errorMessage)
      }
    },
    async recoverPassword(payload: User, state) {
      return
    },
    async logout() {
      try {
        await api.logout()
        dispatch.user.setCurrentUser(null)
      } catch (error: unknown) {
        const err = error as AxiosError
        // @ts-ignore
        dispatch.error.setError(err.response?.data.errorMessage)
      }
    },
    async updateUser(payload: User, state) {
      return
    },
  }),
})

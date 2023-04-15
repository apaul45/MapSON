import { createModel } from '@rematch/core'
import { User, UserModel } from '../types'
import { RootModel } from '.'

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
      return
    },
    async login(payload: User, state) {
      return
    },
    async recoverPassword(payload: User, state) {
      return
    },
    async logout(payload: User, state) {
      return
    },
    async updateUser(payload: User, state) {
      return
    },
  }),
})

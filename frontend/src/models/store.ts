import { createModel } from '@rematch/core'
import { RootModel } from '.'
import { Store, Map } from '../types'
import api from '../api'
import { AxiosError } from 'axios'

const initialState: Store = {
  currentMap: null,
  maps: [],
  userMaps: [],
  deleteDialog: false,
  shareDialog: false,
  addDialog: false,
}

export const mapStore = createModel<RootModel>()({
  state: initialState as Store,

  //Pure reducer functions
  reducers: {
    setCurrentMap: (state, payload: Map) => {
      return { ...state, currentMap: payload }
    },
    setMaps: (state, payload: Map[]) => {
      return
    },
    setUserMaps: (state, payload: Map[]) => {
      return
    },
    setShareDialog: (state, payload: boolean) => {
      return { ...state, shareDialog: payload }
    },
    setDeleteDialog: (state, payload: boolean) => {
      return { ...state, deleteDialog: payload }
    },
    setAddDialog: (state, payload: boolean) => {
      return { ...state, addDialog: payload }
    },
  },

  //Effects are (possibly async) functions that take in the store's state and payload, and return anything

  effects: (dispatch) => ({
    async loadUserMaps(payload, state) {
      return
    },
    async loadAllMaps(payload, state) {
      return
    },
    async updateCurrentMap(payload, state) {
      return
    },
    async createNewMap(payload, state) {
      try {
        const res = await api.createMap(payload)
        dispatch.mapStore.setCurrentMap(res.data.map)
        return res.data.map._id
      } catch (error: unknown) {
        const err = error as AxiosError
        // @ts-ignore
        dispatch.error.setError(err.response?.data.errorMessage)
      }
    },
    async deleteMap(payload, state) {
      return
    },

    sortMaps(payload, state) {
      return
    },
    filterMaps(payload, state) {
      return
    },
  }),
})

import { createModel } from '@rematch/core'
import { RootModel } from '.'
import { Store, Map } from '../types'
import map from '../map'
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
      return { ...state, maps: payload }
    },
    setUserMaps: (state, payload: Map[]) => {
      return { ...state, userMaps: payload }
    },
    updateUserMaps: (state, payload: Map) => {
      const newList = [payload, ...state.userMaps]
      console.log(newList)
      return { ...state, userMaps: newList }
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
    async loadMap(payload, state): Promise<string | undefined> {
      try {
        const loaded = await map.getMap(payload)
        this.setCurrentMap(loaded.data.map)
        return loaded.data.map._id;
      } catch (e: any) {
        dispatch.error.setError(e)
      }
    },
    async loadUserMaps(payload, state) {
      return
    },
    async loadAllMaps(payload, state) {

      try {
        const maps = await map.getAllMaps()
        this.setMaps(maps.data);
      } catch (e: any) {
        dispatch.error.setError(e)
      }
    },
    async updateCurrentMap(payload, state) {
      try {
        const id = state.mapStore.currentMap?._id;
        if (!id) {
          console.error("No map selected")
          dispatch.error.setError("No map selected")
          return
        }

        const update = await map.updateMap(id, payload)

        this.setCurrentMap(update.data)
      } catch (e: any) {
        dispatch.error.setError(e)
      }

    },
    async createNewMap(payload, state): Promise<string | undefined> {
      try {
        const res = await map.createMap(payload)
        dispatch.mapStore.setCurrentMap(res.data.map)
        dispatch.mapStore.updateUserMaps(res.data.map)
        return res.data.map._id
      } catch (error: unknown) {
        const err = error as AxiosError
        // @ts-ignore
        dispatch.error.setError(err.response?.data.errorMessage)
      }
    },
    async deleteMap(payload, state) {
      try {
        map.deleteMap(payload);

        this.setMaps(state.mapStore.maps.filter((m: Map) => m._id !== payload))
        this.setUserMaps(state.mapStore.userMaps.filter((m: Map) => m._id !== payload))

        if (state.mapStore.currentMap?._id === payload) {
          this.setCurrentMap(null)
        }
      } catch (e: any) {
        dispatch.error.setError(e)
      }
    },

    sortMaps(payload, state) {
      return
    },
    filterMaps(payload, state) {
      return
    },
    async createFeature(payload, state): Promise<string | undefined> {
      const id = state.mapStore.currentMap?._id;
      console.log(state.mapStore.currentMap)

      if (!id) {
        console.error("No map selected")
        dispatch.error.setError("No map selected")
        return
      }

      try {
        const feature = await map.createFeature(id, payload);
        return feature.data._id
      } catch (e: any) {
        dispatch.error.setError(e)
      }
    },
    async updateFeature(payload, state) {
      const id = state.mapStore.currentMap?._id;

      let { id: featureid, feature } = payload

      if (!id) {
        console.error("No map selected")
        dispatch.error.setError("No map selected")
        return
      }

      if (!featureid || !feature) {
        console.error("Invalid feature")
        dispatch.error.setError("Invalid feature")
        return
      }


      try {
        await map.updateFeature(id, featureid, feature)
      } catch (e: any) {
        dispatch.error.setError(e)
      }
    },
    async deleteFeature(payload, state) {
      const id = state.mapStore.currentMap?._id;
      if (!id) {
        console.error("No map selected")
        dispatch.error.setError("No map selected")
        return
      }

      if (!payload) {
        console.error("No feature selected")
        dispatch.error.setError("No feature selected")
        return
      }

      try {
        await map.deleteFeature(id, payload)
      } catch (e: any) {
        dispatch.error.setError(e)
      }

    }
  }),
})

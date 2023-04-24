import { createModel } from '@rematch/core';
import { RootModel } from '.';
import { Store, Map, FeatureExt } from '../types';
import { map } from '../api';
import { AxiosError } from 'axios';
import { Feature } from '@turf/turf';
import { Geometry } from 'geojson';
import { AllMapsRequest, CreateMapRequest } from '../api/types';

const initialState: Store = {
  currentMap: null,
  maps: [],
  mapFilter: '',
  deleteDialog: false,
  shareDialog: false,
  addDialog: false,
};

export const mapStore = createModel<RootModel>()({
  state: initialState as Store,

  //Pure reducer functions
  reducers: {
    setCurrentMap: (state, payload: Map) => {
      return { ...state, currentMap: payload };
    },
    setShareDialog: (state, payload: boolean) => {
      return { ...state, shareDialog: payload };
    },
    setDeleteDialog: (state, payload: boolean) => {
      return { ...state, deleteDialog: payload };
    },
    setAddDialog: (state, payload: boolean) => {
      return { ...state, addDialog: payload };
    },
    setMaps: (state, payload: Map[]) => {
      return { ...state, maps: payload };
    },
    setMapFilter: (state, payload: string) => {
      return { ...state, mapFilter: payload };
    },
  },

  //Effects are (possibly async) functions that take in the store's state and payload, and return anything

  effects: (dispatch) => ({
    async loadAllMaps(payload: AllMapsRequest, state) {
      try {
        const maps = await map.getAllMaps(payload);
        this.setMaps(maps.data.maps);
      } catch (e: any) {
        dispatch.error.setError(e.errorMessage ?? 'Unexpected error');
      }
    },
    async updateCurrentMap(payload: Partial<Map>, state) {
      try {
        const id = state.mapStore.currentMap?._id;
        if (!id) {
          console.error('No map selected');
          dispatch.error.setError('No map selected');
          return;
        }

        await map.updateMap(id, payload);

        this.setCurrentMap({ ...state.mapStore.currentMap, ...payload });
      } catch (e: any) {
        dispatch.error.setError(e.errorMessage ?? 'Unexpected error');
      }
    },
    async createNewMap(payload: CreateMapRequest, state): Promise<any> {
      try {
        const res = await map.createMap(payload);
        dispatch.mapStore.setCurrentMap(res.data.map);
        dispatch.user.setUserMaps(res.data.map);
        return res.data.map._id;
      } catch (error: unknown) {
        const err = error as AxiosError;
        // @ts-ignore
        dispatch.error.setError(err.response?.data.errorMessage);
      }
    },
    async deleteMap(payload: string, state) {
      try {
        map.deleteMap(payload);

        this.setMaps(state.mapStore.maps.filter((m: Map) => m._id !== payload));
        dispatch.user.removeUserMap(payload);

        if (state.mapStore.currentMap?._id === payload) {
          this.setCurrentMap(null);
        }
      } catch (e: any) {
        dispatch.error.setError(e.errorMessage ?? 'Unexpected error');
      }
    },

    sortMaps(payload, state) {
      return;
    },
    filterMaps(payload, state) {
      return;
    },
    async loadMap(payload: string, state): Promise<string | undefined> {
      try {
        const loaded = await map.getMap(payload);
        this.setCurrentMap(loaded.data.map);
        return loaded.data.map._id;
      } catch (e: any) {
        dispatch.error.setError(e.errorMessage ?? 'Unexpected error');
      }
    },
    async createFeature(payload: Feature<Geometry>, state): Promise<string | undefined> {
      const id = state.mapStore.currentMap?._id;

      if (!id) {
        console.error('No map selected');
        dispatch.error.setError('No map selected');
        return;
      }

      try {
        const feature = await map.createFeature(id, payload);

        let oldMap = state.mapStore.currentMap;
        oldMap?.features.features.push(feature.data.feature);
        this.setCurrentMap(oldMap);

        return feature.data.feature._id;
      } catch (e: any) {
        dispatch.error.setError(e.errorMessage ?? 'Unexpected error');
      }
    },
    async updateFeature(payload: { id: string; feature: Partial<FeatureExt> }, state) {
      const id = state.mapStore.currentMap?._id;

      let { id: featureid, feature } = payload;

      if (!id) {
        console.error('No map selected');
        dispatch.error.setError('No map selected');
        return;
      }

      if (!featureid || !feature) {
        console.error('Invalid feature');
        dispatch.error.setError('Invalid feature');
        return;
      }

      let oldMap = state.mapStore.currentMap;
      if (oldMap !== null) {
        let featureIndex = oldMap?.features.features.findIndex(
          (feature) => feature._id === featureid
        );
        oldMap.features.features[featureIndex] = {
          ...oldMap.features.features[featureIndex],
          ...feature,
        };
      }
      this.setCurrentMap(oldMap);

      try {
        await map.updateFeature(id, featureid, feature);
      } catch (e: any) {
        dispatch.error.setError(e.errorMessage ?? 'Unexpected error');
      }
    },
    async deleteFeature(payload, state) {
      const id = state.mapStore.currentMap?._id;
      if (!id) {
        console.error('No map selected');
        dispatch.error.setError('No map selected');
        return;
      }

      if (!payload) {
        console.error('No feature selected');
        dispatch.error.setError('No feature selected');
        return;
      }

      try {
        await map.deleteFeature(id, payload);
      } catch (e: any) {
        dispatch.error.setError(e.errorMessage ?? 'Unexpected error');
      }
    },
    clearMap(payload, state) {
      dispatch.mapStore.setCurrentMap(null!);
    },
    updateFeatureCollection(
      transform: (map: Map['features']['features']) => Map['features']['features'],
      state
    ) {
      if (!state.mapStore.currentMap?.features) {
        return;
      }

      dispatch.mapStore.setCurrentMap({
        ...state.mapStore.currentMap,
        features: {
          ...state.mapStore.currentMap.features,
          features: transform(state.mapStore.currentMap.features.features),
        },
      });
    },
  }),
});

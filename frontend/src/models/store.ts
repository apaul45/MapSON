import { createModel } from '@rematch/core';
import { RootModel } from '.';
import { Store, Map, FeatureExt } from '../types';
import { map } from '../api';
import { AxiosError } from 'axios';
import { Feature } from '@turf/turf';
import { Geometry } from 'geojson';
import { AllMapsRequest, CreateMapRequest } from '../api/types';
import { cloneDeep } from 'lodash';

const initialState: Store = {
  currentMap: null,
  maps: [],
  mapFilter: '',
  deleteDialog: false,
  shareDialog: false,
  addDialog: false,
  mapMarkedForDeletion: null,
  // TODO: Make this a dictionary, so that user can join and track multiple rooms
  roomList: [],
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
    setMarkedMap: (state, payload: string) => {
      return { ...state, mapMarkedForDeletion: payload };
    },
    setMaps: (state, payload: Map[]) => {
      return { ...state, maps: payload };
    },
    setMapFilter: (state, payload: string) => {
      return { ...state, mapFilter: payload };
    },
    setRoomList: (state, payload: string[]) => {
      return { ...state, roomList: payload };
    },
  },

  //Effects are (possibly async) functions that take in the store's state and payload, and return anything

  effects: (dispatch) => ({
    async loadAllMaps(payload: AllMapsRequest, state) {
      try {
        const maps = await map.getAllMaps(payload);
        this.setMaps(maps.data.maps);
      } catch (e: any) {
        dispatch.error.setError(e.response?.data.errorMessage ?? 'Unexpected error');
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
        dispatch.error.setError(e.response?.data.errorMessage ?? 'Unexpected error');
      }
    },
    async createNewMap(payload: CreateMapRequest, state): Promise<string | undefined> {
      try {
        const res = await map.createMap(payload);
        this.setCurrentMap(res.data.map);
        dispatch.user.addUserMap(res.data.map);
        return res.data.map._id;
      } catch (error: unknown) {
        const err = error as AxiosError;
        // @ts-ignore
        dispatch.error.setError(err.response?.data.errorMessage);
      }
    },
    async deleteMap(payload: string, state) {
      try {
        await map.deleteMap(payload);

        this.setMaps(state.mapStore.maps.filter((m: Map) => m._id !== payload));
        dispatch.user.removeUserMap(payload);

        if (state.mapStore.currentMap?._id === payload) {
          this.setCurrentMap(null);
        }
      } catch (e: any) {
        dispatch.error.setError(e.response?.data.errorMessage ?? 'Unexpected error');
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
        dispatch.error.setError(e.response?.data.errorMessage ?? 'Unexpected error');
      }
    },
    async createFeature(
      payload: { feature: Feature<Geometry>; featureIndex?: number },
      state
    ): Promise<{ id: string; featureIndex: number } | undefined> {
      const id = state.mapStore.currentMap?._id;

      if (!id) {
        console.error('No map selected');
        dispatch.error.setError('No map selected');
        return;
      }

      try {
        //unset mongoose immutable fields
        const f = { ...payload.feature, _id: undefined, __v: undefined };
        const feature = await map.createFeature(id, f, payload.featureIndex);

        let oldMap = state.mapStore.currentMap;

        oldMap?.features.features.splice(feature.data.featureIndex, 0, feature.data.feature);
        this.setCurrentMap(oldMap);

        return { id: feature.data.feature._id, featureIndex: feature.data.featureIndex };
      } catch (e: any) {
        dispatch.error.setError(e.response?.data.errorMessage ?? 'Unexpected error');
      }
    },
    async updateFeature(
      payload: { id: string; feature: Partial<FeatureExt> },
      state
    ): Promise<FeatureExt | void> {
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

      // make a deep clone so we dont have weird ref stuff
      feature = cloneDeep(feature);

      //unset mongoose immutable fields
      delete feature._id;
      delete feature.__v;
      delete feature.updatedAt;
      delete feature.createdAt;

      try {
        await map.updateFeature(id, featureid, feature);

        let oldMap = state.mapStore.currentMap;

        let featureIndex = oldMap!.features.features.findIndex(
          (feature) => feature._id === featureid
        );

        const oldFeature = oldMap!.features.features[featureIndex];

        oldMap!.features.features[featureIndex] = {
          ...oldMap!.features.features[featureIndex],
          ...feature,
        };

        this.setCurrentMap(oldMap);

        return oldFeature;
      } catch (e: any) {
        dispatch.error.setError(e.response?.data.errorMessage ?? 'Unexpected error');
      }
    },
    async deleteFeature(payload: string, state) {
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

        let oldMap = state.mapStore.currentMap;

        oldMap!.features.features = oldMap!.features.features.filter(
          (feature) => feature._id !== payload
        );

        this.setCurrentMap(oldMap);
      } catch (e: any) {
        dispatch.error.setError(e.response?.data.errorMessage ?? 'Unexpected error');
      }
    },
    clearMap(payload, state) {
      dispatch.mapStore.setCurrentMap(null!);
    },
    getFeatureByIndex(payload: number, state): FeatureExt | undefined {
      return state.mapStore.currentMap?.features.features[payload];
    },
  }),
});

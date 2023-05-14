import { createModel } from '@rematch/core';
import { RootModel } from '.';
import { Store, Map, FeatureExt, Comment, Cursor, RoomList, RoomMember } from '../types';
import { map } from '../api';
import { AxiosError } from 'axios';
import { Feature } from '@turf/turf';
import { Geometry } from 'geojson';
import { AllMapsRequest, CreateFeatureResponse, CreateMapRequest } from '../api/types';
import { cloneDeep } from 'lodash';
import L from 'leaflet';
import tinycolor from 'tinycolor2';
import { Member, Room } from '../live-collab/socket';

const initialState: Store = {
  currentMap: null,
  maps: [],
  mapFilter: '',
  deleteDialog: false,
  shareDialog: false,
  addDialog: false,
  mapMarkedForDeletion: null,
  // TODO: Make this a dictionary, so that user can join and track multiple rooms
  roomList: {},
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
    setRoomList: (state, payload: RoomList) => {
      return { ...state, roomList: payload };
    },
    setComments: (state, payload: Comment) => {
      if (state.currentMap) {
        return {
          ...state,
          currentMap: { ...state.currentMap, comments: [...state.currentMap?.comments, payload] },
        };
      }
      return state;
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
    async updateMap(payload: Partial<Map>, state) {
      try {
        const id = payload._id;
        if (!id) {
          console.error('Invalid map');
          dispatch.error.setError('Invalid map');
          return;
        }
        await map.updateMap(id, payload);
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

    async forkMap(payload: string, state): Promise<string | undefined> {
      try {
        const res = await map.forkMap(payload);
        this.setCurrentMap(res.data.map);
        dispatch.user.addUserMap(res.data.map);
        return res.data.map._id;
      } catch (error: unknown) {
        const err = error as AxiosError;
        // @ts-ignore
        dispatch.error.setError(err.response?.data.errorMessage);
      }
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
      payload:
        | { feature: FeatureExt; featureIndex?: number; doNetwork: true }
        | { feature: FeatureExt; featureIndex: number; doNetwork: false },
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

        let feature: Omit<CreateFeatureResponse, 'error'>;

        let oldMap = state.mapStore.currentMap;

        if (payload.doNetwork === false) {
          feature = {
            feature: payload.feature,
            featureIndex: payload.featureIndex ?? oldMap?.features.features.length,
          };
        } else {
          feature = (await map.createFeature(id, f, payload.featureIndex)).data;
        }

        oldMap?.features.features.splice(feature!.featureIndex, 0, feature!.feature);
        this.setCurrentMap(oldMap);
        console.log({
          type: 'Created feature',
          feature,
          features: state.mapStore.currentMap?.features.features,
        });
        return { id: feature!.feature._id, featureIndex: feature!.featureIndex };
      } catch (e: any) {
        dispatch.error.setError(e.response?.data.errorMessage ?? 'Unexpected error');
      }
    },
    async updateFeature(
      payload: { id: string; feature: Partial<FeatureExt>; doNetwork?: boolean },
      state
    ): Promise<FeatureExt | void> {
      const id = state.mapStore.currentMap?._id;

      let { id: featureid, feature, doNetwork } = payload;

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
        if (doNetwork !== false) {
          await map.updateFeature(id, featureid, feature);
        }

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
    async deleteFeature(payload: { featureid: string; doNetwork?: boolean }, state) {
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
      const { featureid, doNetwork } = payload;

      try {
        if (doNetwork !== false) {
          await map.deleteFeature(id, featureid);
        }
        let oldMap = state.mapStore.currentMap;

        oldMap!.features.features = oldMap!.features.features.filter(
          (feature) => feature._id !== featureid
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
    async addComment(payload: Comment, state) {
      try {
        const currentMap = state.mapStore.currentMap;
        if (!currentMap) return;

        await map.updateMap(currentMap._id, {
          comments: [...currentMap.comments, payload],
        });

        dispatch.mapStore.setComments(payload);
      } catch (e: any) {
        dispatch.error.setError(e.response?.data.errorMessage ?? 'Unexpected error');
      }
    },
    updateCursor(payload: { socket_id: string; position: L.LatLngExpression }, state) {
      state.mapStore.roomList[payload.socket_id]?.cursor.marker.setLatLng(payload.position);
    },
    initRoomList(
      payload: {
        clients: Room;
        createMarkerFn: (username: string, bgColor: string) => L.CircleMarker;
      },
      state
    ) {
      //remove old cursors
      Object.values(state.mapStore.roomList).forEach((v) => v.cursor.marker.remove());

      //new cursors
      const newRoomList: RoomList = Object.fromEntries(
        Object.entries(payload.clients).map(([k, v]) => {
          const bgColor = tinycolor.random().darken(30).toHexString();
          const marker = payload.createMarkerFn(v.username, bgColor);

          return [k, { ...v, bgColor, cursor: { marker } }];
        })
      );

      dispatch.mapStore.setRoomList(newRoomList);
    },
    addClient(
      payload: {
        member: Member;
        createMarkerFn: (username: string, bgColor: string) => L.CircleMarker;
      },
      state
    ) {
      if (payload.member.socket_id in state.mapStore.roomList) {
        //clear previous marker
        state.mapStore.roomList[payload.member.socket_id].cursor.marker.remove();
      }

      const bgColor = tinycolor.random().darken(30).toHexString();
      const marker = payload.createMarkerFn(payload.member.username, bgColor);
      const client = { ...payload.member, bgColor, cursor: { marker } };

      dispatch.mapStore.setRoomList({
        ...state.mapStore.roomList,
        [payload.member.socket_id]: client,
      });
    },
    removeClient(payload: string, state) {
      const { [payload]: removedClient, ...rest } = state.mapStore.roomList;
      removedClient?.cursor.marker.remove();
      dispatch.mapStore.setRoomList(rest);
    },
  }),
});

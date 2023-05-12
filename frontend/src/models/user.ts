import { createModel } from '@rematch/core';
import { Map, User, UserModel } from '../types';
import { RootModel } from '.';
import { auth } from '../api';
import { AxiosError } from 'axios';
import tinycolor from 'tinycolor2';

export const user = createModel<RootModel>()({
  state: { currentUser: null } as UserModel,

  //Pure reducer functions
  reducers: {
    setCurrentUser: (state, payload: User | null) => {
      const pl = { ...payload, bgColor: tinycolor.random().darken(30).toHexString() } as User;
      return { ...state, currentUser: pl };
    },
    addUserMap: (state, payload: Map) => {
      const user = state.currentUser;
      if (!user) {
        return state;
      }
      user.maps = [payload, ...(user.maps ?? [])];

      return { ...state, currentUser: user };
    },
    setUserMaps: (state, payload: Map[]) => {
      const user: User = state.currentUser as unknown as User;
      user.maps = payload;
      console.log(user);
      return { ...state, currentUser: user };
    },
  },

  //Effects are (possibly async) functions that take in the store's state    and payload, and return anything

  effects: (dispatch) => ({
    async register(payload: User, state) {
      try {
        const response = await auth.register(payload);
        // @ts-ignore
        dispatch.user.setCurrentUser(response.data.user);
      } catch (error: unknown) {
        const err = error as AxiosError;
        // @ts-ignore
        dispatch.error.setError(err.response?.data.errorMessage);
      }
    },
    async login(payload, state) {
      try {
        const response = await auth.login(payload);
        dispatch.user.setCurrentUser(response.data);
        return true;
      } catch (error: unknown) {
        const err = error as AxiosError;
        // @ts-ignore
        dispatch.error.setError(err.response?.data.errorMessage);
        return false;
      }
    },
    async recoverPassword(payload, state) {
      try {
        const response = await auth.recover(payload);
        return true;
      } catch (error: unknown) {
        const err = error as AxiosError;
        // @ts-ignore
        dispatch.error.setError(err.response?.data.errorMessage);
        return false;
      }
    },
    async resetPassword(payload, state) {
      try {
        const response = await auth.reset(payload);
        return true;
      } catch (error: unknown) {
        const err = error as AxiosError;
        // @ts-ignore
        dispatch.error.setError(err.response?.data.errorMessage);
        return false;
      }
    },
    async logout() {
      try {
        await auth.logout();
        dispatch.user.setCurrentUser(null);
      } catch (error: unknown) {
        const err = error as AxiosError;
        // @ts-ignore
        dispatch.error.setError(err.response?.data.errorMessage);
      }
    },
    async check(): Promise<string> {
      try {
        const res = await auth.check();
        dispatch.user.setCurrentUser(res.data);
        return res.data.username;
      } catch {
        return '';
      }
    },
    async updateUser(payload, state) {
      try {
        await auth.update(payload);
        return true;
      } catch (error: unknown) {
        const err = error as AxiosError;
        // @ts-ignore
        dispatch.error.setError(err.response?.data.errorMessage);
        return false;
      }
    },
    removeUserMap(payload: string, state) {
      this.setUserMaps(state.user.currentUser?.maps?.filter((m: Map) => m._id !== payload));
    },
  }),
});

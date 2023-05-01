import { createModel } from '@rematch/core';
import { Map, User, UserModel } from '../types';
import { RootModel } from '.';
import { auth } from '../api';
import { AxiosError } from 'axios';

export const user = createModel<RootModel>()({
  state: { currentUser: null } as UserModel,

  //Pure reducer functions
  reducers: {
    setCurrentUser: (state, payload: User | null) => {
      return { ...state, currentUser: payload };
    },
    setUserMaps: (state, payload: Map) => {
      const user: User = state.currentUser as unknown as User;
      user.maps = [payload, ...(state.currentUser?.maps as unknown as Map[])];
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
    async recoverPassword(payload: User, state) {
      return;
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
    async check() {
      try {
        const res = await auth.check();
        dispatch.user.setCurrentUser(res.data);
      } catch {
        return;
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

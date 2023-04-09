import { Models, RematchDispatch, RematchRootState, init } from "@rematch/core";
import { user } from "./user";
import { mapStore } from "./store";

export interface RootModel extends Models<RootModel> {
    user: typeof user;
    mapStore: typeof mapStore;
}

const models: RootModel = { user, mapStore };

export const store = init({models});

export type Store = typeof store;
export type Dispatch = RematchDispatch<RootModel>;
export type RootState = RematchRootState<RootModel>;
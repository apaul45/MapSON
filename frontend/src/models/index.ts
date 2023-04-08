import { Models, init } from "@rematch/core";
import { user } from "./user";
import { mapStore } from "./store";

export interface RootModel extends Models<RootModel> {
    user: typeof user;
    mapStore: typeof mapStore;
}

const models: RootModel = { user, mapStore };

export const store = init({models});
import { createModel } from "@rematch/core";
import { RootModel } from ".";
import { Store, Map } from "../types";

const initialState: Store = {
    currentMap: null,
    maps: [],
    userMaps: [],
    deleteDialog: false, 
}  

export const mapStore = createModel<RootModel>()({
    state: initialState as Store, 
   
    //Pure reducer functions
    reducers: {
      setCurrentMap: (state, payload: Map[]) => {return;},
      setMaps: (state, payload: Map[]) => {return;},
      setUserMaps: (state, payload: Map[]) => {return;},
      setDeleteDialog: (state, payload: boolean) => {
        return {...state, deleteDialog: payload}
      }
    },
  
    //Effects are (possibly async) functions that take in the store's state    and payload, and return anything
  
    effects: (dispatch) => ({
      async loadUserMaps(payload, state) {return;},
      async loadAllMaps(payload, state) {return;},
      async updateCurrentMap(payload, state) {return;},
      async createNewMap(payload, state) {return;},
      async deleteMap(payload, state) {return;},
      
      sortMaps(payload, state) {return;},
      filterMaps(payload, state) {return;},
    }),
});
import { createModel } from "@rematch/core";
import { RootModel } from ".";
import { ErrorModel } from "../types";

export const error = createModel<RootModel>()({
    state: { errorMessage: null } as ErrorModel,

    //Pure reducer functions
    reducers: {
        setError: (state, payload: string | null) => {
            return {...state, errorMessage: payload}
        }
    }, 
})
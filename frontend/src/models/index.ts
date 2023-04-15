import { Models, RematchDispatch, RematchRootState, init } from '@rematch/core'
import { user } from './user'
import { mapStore } from './store'
import { error } from './error'

export interface RootModel extends Models<RootModel> {
  user: typeof user
  mapStore: typeof mapStore
  error: typeof error
}

const models: RootModel = { user, mapStore, error }

export const store = init({ models })

export type Store = typeof store
export type Dispatch = RematchDispatch<RootModel>
export type RootState = RematchRootState<RootModel>

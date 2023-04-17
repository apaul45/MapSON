import { Feature, FeatureCollection, Geometry } from 'geojson'

export interface User {
  email?: string
  username: string
  password: string
  maps: Map[]
}

export interface Published {
  isPublished: boolean
  publishedDate?: Date
}

export interface Comment {
  username: string
  comment: string
}

// add mongodb _id type to geometries and features from `geojson` types
export interface CommonGeoJSONData {
  _id: string
}
export type GeometryExt = CommonGeoJSONData & Geometry
export type FeatureExt = CommonGeoJSONData & Feature<GeometryExt>
export type Features = Array<FeatureExt>

export type LGeoJsonExt = L.GeoJSON & CommonGeoJSONData & LayerExt

export interface LayerExt {
  clearCustomEventHandlers: Function | undefined
}

export interface Map {
  _id: string
  name: string
  username: string
  upvotes: User[]
  downvotes: User[]
  forks: number
  downloads: number
  published: Published
  comments: Comment[]
  features: Features
  description?: string
  updatedAt?: string
}

export interface Store {
  currentMap: Map | null
  maps: Map[]
  userMaps: Map[]
  deleteDialog: boolean
  shareDialog: boolean
  addDialog: boolean
}

export interface UserModel {
  currentUser: User | null
}

export interface ErrorModel {
  errorMessage: string | null
}

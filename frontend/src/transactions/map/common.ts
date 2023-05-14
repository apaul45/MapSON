import { SelectedFeature } from '../../components/map/MapComponent';
import { FeatureExt, LGeoJsonExt } from '../../types';

import { PM } from 'leaflet';
import jsTPS from '../../utils/jsTPS';
import {
  CreateAndRemoveMultipleFeature,
  CreateAndRemoveMultipleFeaturesSerialized,
} from './CreateAndRemoveMultipleFeatures';
import { CreateFeature, CreateFeatureSerialized } from './CreateFeature';
import { EditFeature, EditFeatureSerialized } from './EditFeature';
import {
  MultipleTransactions,
  MultipleTransactionsSerialized,
  TransactionTypes,
} from './MultipleTransactions';
import { RemoveFeature, RemoveFeatureSerialized } from './RemoveFeature';
import { SplitFeature, SplitFeaturesSerialized } from './SplitFeature';
import { MergeFeatures, MergeFeaturesSerialized } from './MergeFeatures';
import { MutableRefObject } from 'react';

export interface MapComponentCallbacks {
  isSelected: (id: any) => boolean;
  selectFeature: (id: any, layer: LGeoJsonExt) => SelectedFeature | undefined;
  unselectFeature: (id: any) => void;
  getLayerID: (layer: LGeoJsonExt) => string;
  getSelectedFeatures: () => SelectedFeature[];
  resetSelectedFeature: () => void;
  onEachFeature: (feature: FeatureExt, layer: LGeoJsonExt) => void;
  getLayerById: (id: string) => L.Polygon | LGeoJsonExt | undefined;
  getFeatureById: (id: string) => { featureIndex: number; feature: FeatureExt } | undefined;
  getFeatureByIndex: (idx: number) => FeatureExt | undefined;
  getGeoJSONLayer: () => L.GeoJSON;
  getTransactions: () => jsTPS;
  applyPeerTransaction: (t: SerializedTransactionTypes) => void;
  undo: (fromSocket?: boolean, peerArtifacts?: Object) => Promise<void>;
  redo: (fromSocket?: boolean, peerArtifacts?: Object) => Promise<void>;
  setSelectedFeature: (i: { id: any; layer: LGeoJsonExt } | null) => void;
  clearTransactions: () => void;
  forceRerender: () => void;
  onCreate: PM.CreateEventHandler;
  onEdit: PM.EditEventHandler;
  onRemove: PM.RemoveEventHandler;
}

export const extractFeature = (layer: LGeoJsonExt | L.Polygon) => {
  let geojson = layer.toGeoJSON(15);

  if (geojson.type === 'FeatureCollection') {
    return geojson.features[0] as FeatureExt;
  }

  return geojson as FeatureExt;
};

export type SerializedTransactionTypes =
  | CreateAndRemoveMultipleFeaturesSerialized
  | CreateFeatureSerialized
  | EditFeatureSerialized
  | MultipleTransactionsSerialized
  | RemoveFeatureSerialized
  | SplitFeaturesSerialized
  | MergeFeaturesSerialized;

export function deserializer(
  transaction: SerializedTransactionTypes,
  callbacks: MapComponentCallbacks
): TransactionTypes {
  switch (transaction.type) {
    case 'CreateFeature':
      return CreateFeature.deserialize(transaction, callbacks);
    case 'EditFeature':
      return EditFeature.deserialize(transaction, callbacks);
    case 'RemoveFeature':
      return RemoveFeature.deserialize(transaction, callbacks);
    case 'CreateAndRemoveMultipleFeature':
      return CreateAndRemoveMultipleFeature.deserialize(transaction, callbacks);
    case 'Multiple':
      return MultipleTransactions.deserialize(transaction, callbacks);
    case 'Split':
      return SplitFeature.deserialize(transaction, callbacks);
    case 'Merge':
      return MergeFeatures.deserialize(transaction, callbacks);
  }

  throw new Error('TRANSACTION TYPE NOT RECOGNIZED');
}

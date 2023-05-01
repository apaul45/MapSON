import { SelectedFeature } from '../../components/map/MapComponent';
import { FeatureExt, LGeoJsonExt, MongoData } from '../../types';
import { TransactionType } from '../../utils/jsTPS';
import { CreateFeature } from './CreateFeature';
import { MultipleTransactions, MultipleTransactionsSerialized } from './MultipleTransactions';
import { RemoveFeature } from './RemoveFeature';
import { MapComponentCallbacks } from './common';

interface MergeRegionSerialized {}

type MergeTransaction = CreateFeature | RemoveFeature;

export class MergeFeatures extends MultipleTransactions<MergeRegionSerialized, MergeTransaction> {
  readonly type: TransactionType = 'Merge';

  constructor(
    oldLayers: SelectedFeature[],
    newLayer: LGeoJsonExt,
    newFeature: FeatureExt,
    callbacks: MapComponentCallbacks,
    isPeer = false
  ) {
    const removeTransactions = oldLayers.map((v) => {
      const { layer } = v;
      const { feature, featureIndex } = callbacks.getFeatureById((layer as any & MongoData)._id)!;
      return new RemoveFeature(layer, feature, featureIndex, isPeer);
    }, isPeer);
    const createTransaction = new CreateFeature(newLayer, newFeature, isPeer);
    super([...removeTransactions, createTransaction], isPeer);
  }

  serialize(): MultipleTransactionsSerialized<MergeRegionSerialized> {
    throw new Error('Method not implemented.');
  }
  deserialize(i: MultipleTransactionsSerialized<MergeRegionSerialized>): this {
    throw new Error('Method not implemented.');
  }
}

import { SelectedFeature } from '../../components/map/MapComponent';
import { FeatureExt, LGeoJsonExt } from '../../types';
import { TransactionType } from '../../utils/jsTPS';
import { CreateFeature } from './CreateFeature';
import { MultipleTransactions, MultipleTransactionsSerialized } from './MultipleTransactions';
import { RemoveFeature } from './RemoveFeature';

interface MergeRegionSerialized {}

type MergeTransaction = CreateFeature | RemoveFeature;

export class MergeFeatures extends MultipleTransactions<MergeRegionSerialized, MergeTransaction> {
  readonly type: TransactionType = 'Merge';

  constructor(
    oldLayers: SelectedFeature[],
    newLayer: LGeoJsonExt,
    newFeature: FeatureExt,
    isPeer = false
  ) {
    const removeTransactions = oldLayers.map((v) => new RemoveFeature(v.layer), isPeer);
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

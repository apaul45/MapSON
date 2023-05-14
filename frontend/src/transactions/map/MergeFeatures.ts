import { FeatureExt, LGeoJsonExt, MongoData } from '../../types';
import { TransactionType } from '../../utils/jsTPS';
import {
  CreateAndRemoveMultipleFeature,
  CreateAndRemoveMultipleFeaturesSerialized,
} from './CreateAndRemoveMultipleFeatures';
import { MapComponentCallbacks } from './common';

export interface MergeFeaturesSerialized
  extends Omit<CreateAndRemoveMultipleFeaturesSerialized, 'type'> {
  type: 'Merge';
}

export class MergeFeatures extends CreateAndRemoveMultipleFeature<'Merge'> {
  readonly type = 'Merge';

  constructor(
    addedLayer: { layer: LGeoJsonExt; feature?: FeatureExt },
    removedLayers: { layer: LGeoJsonExt; feature?: FeatureExt; featureIndex: number }[],
    callbacks: MapComponentCallbacks,
    isPeer = false
  ) {
    super([addedLayer], removedLayers, callbacks, isPeer);
  }

  serialize(): MergeFeaturesSerialized {
    return super.serialize();
  }

  static deserialize(i: MergeFeaturesSerialized, callbacks: MapComponentCallbacks): MergeFeatures {
    return super.deserialize(i, callbacks) as MergeFeatures;
  }
}

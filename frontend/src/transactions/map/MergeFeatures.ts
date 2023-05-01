import { FeatureExt, LGeoJsonExt, MongoData } from '../../types';
import { TransactionType } from '../../utils/jsTPS';
import { CreateAndRemoveMultipleFeature } from './CreateAndRemoveMultipleFeatures';
import { MapComponentCallbacks } from './common';

export class MergeFeatures extends CreateAndRemoveMultipleFeature {
  readonly type: TransactionType = 'Merge';

  constructor(
    addedLayer: { layer: LGeoJsonExt; feature?: FeatureExt },
    removedLayers: { layer: LGeoJsonExt; feature?: FeatureExt; featureIndex: number }[],
    callbacks: MapComponentCallbacks,
    isPeer = false
  ) {
    super([addedLayer], removedLayers, callbacks, isPeer);
  }
}

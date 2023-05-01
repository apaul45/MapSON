import { FeatureExt, LGeoJsonExt, MongoData } from '../../types';
import { TransactionType } from '../../utils/jsTPS';
import { CreateAndRemoveMultipleFeature } from './CreateAndRemoveMultipleFeatures';
import { MapComponentCallbacks } from './common';

export class SplitFeature extends CreateAndRemoveMultipleFeature {
  readonly type: TransactionType = 'Split';

  constructor(
    addedLayers: { layer: LGeoJsonExt; feature?: FeatureExt }[],
    removedLayer: { layer: LGeoJsonExt; feature?: FeatureExt; featureIndex: number },
    callbacks: MapComponentCallbacks,
    isPeer = false
  ) {
    super(addedLayers, [removedLayer], callbacks, isPeer);
  }
}

import { FeatureExt, LGeoJsonExt, MongoData } from '../../types';
import { TransactionType } from '../../utils/jsTPS';
import {
  CreateAndRemoveMultipleFeature,
  CreateAndRemoveMultipleFeaturesSerialized,
} from './CreateAndRemoveMultipleFeatures';
import { MapComponentCallbacks } from './common';

export interface SplitFeaturesSerialized
  extends Omit<CreateAndRemoveMultipleFeaturesSerialized, 'type'> {
  type: 'Split';
}

export class SplitFeature extends CreateAndRemoveMultipleFeature<'Split'> {
  readonly type = 'Split';

  constructor(
    addedLayers: { layer: LGeoJsonExt; feature?: FeatureExt }[],
    removedLayer: { layer: LGeoJsonExt; feature?: FeatureExt; featureIndex: number },
    callbacks: MapComponentCallbacks,
    isPeer = false
  ) {
    super(addedLayers, [removedLayer], callbacks, isPeer);
  }

  serialize(): SplitFeaturesSerialized {
    return super.serialize();
  }

  static deserialize(i: SplitFeaturesSerialized, callbacks: MapComponentCallbacks): SplitFeature {
    return super.deserialize(i, callbacks) as SplitFeature;
  }
}

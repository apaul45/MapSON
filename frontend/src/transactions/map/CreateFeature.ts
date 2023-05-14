import {
  BaseTransaction,
  CommonSerialization,
  MapTransaction,
  TransactionType,
} from '../../utils/jsTPS';
import { FeatureExt, LGeoJsonExt, LayerExt } from '../../types';
import { store } from '../../models';
import { MapComponentCallbacks, extractFeature } from './common';
import L from 'leaflet';

export interface CreateFeatureSerialized extends CommonSerialization {
  type: 'CreateFeature';
  feature: FeatureExt;
  featureIndex?: number;
}

export class CreateFeature extends MapTransaction<CreateFeatureSerialized> {
  readonly type = 'CreateFeature';
  layer?: LGeoJsonExt;
  feature: FeatureExt;
  featureIndex?: number;

  constructor(
    layer: LGeoJsonExt | undefined,
    feature: FeatureExt | undefined = undefined,
    isPeer = false
  ) {
    super(isPeer);
    this.layer = layer;
    this.feature = feature ?? extractFeature(layer!);
  }

  async doTransaction(map: L.Map, callbacks: MapComponentCallbacks, fromSocket: boolean) {
    // dont repeat network connection on peer for first run
    const { id, featureIndex } = (await store.dispatch.mapStore.createFeature({
      feature: this.feature,
      featureIndex: this.featureIndex!,
      doNetwork: this.shouldDoNetwork(fromSocket),
    }))!;

    if (!this.featureIndex) {
      this.featureIndex = featureIndex;
    }
    this.feature._id = id;

    if (this.shouldPerformFrontendEdit()) {
      this.layer = CreateFeature.createFeatureFrontend(callbacks, this.feature);
    }

    callbacks.onEachFeature(this.feature, this.layer as unknown as LGeoJsonExt);

    this.firstRun = false;
  }

  async undoTransaction(map: L.Map, callbacks: MapComponentCallbacks, fromSocket: boolean) {
    const id = callbacks.getFeatureByIndex(this.featureIndex!)?._id!;

    await store.dispatch.mapStore.deleteFeature({
      featureid: id,
      doNetwork: this.shouldDoNetwork(fromSocket),
    });

    CreateFeature.deleteFeatureFrontend(callbacks, id, this.layer);

    this.layer = undefined;
  }

  serialize(): CreateFeatureSerialized {
    return {
      feature: this.feature,
      featureIndex: this.featureIndex,
      type: this.type,
    };
  }

  static deserialize(i: CreateFeatureSerialized, callbacks: MapComponentCallbacks): CreateFeature {
    // assume that we are a peer if we are deserializing
    return new CreateFeature(undefined, i.feature, true);
  }
}

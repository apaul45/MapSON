import { MapTransaction, TransactionType } from '../../utils/jsTPS';
import { FeatureExt, LGeoJsonExt, LayerExt } from '../../types';
import { store } from '../../models';
import { MapComponentCallbacks, extractFeature } from './common';
import L from 'leaflet';
import { Feature } from 'geojson';
import { layerEvents } from 'react-leaflet-geoman-v2';

interface CreateFeatureSerialized {}

export class CreateFeature extends MapTransaction<CreateFeatureSerialized> {
  readonly type: TransactionType = 'CreateFeature';
  layer?: LGeoJsonExt;
  feature: FeatureExt;
  featureIndex?: number;

  constructor(layer: LGeoJsonExt, feature: FeatureExt | undefined = undefined, isPeer = false) {
    super(isPeer);
    this.layer = layer;
    this.feature = feature ?? extractFeature(layer);
  }

  async doTransaction(map: L.Map, callbacks: MapComponentCallbacks) {
    // dont repeat network connection on peer for first run
    const { id, featureIndex } = (await store.dispatch.mapStore.createFeature({
      feature: this.feature,
      featureIndex: this.featureIndex!,
      doNetwork: this.shouldDoNetwork(),
    }))!;

    if (!this.featureIndex) {
      this.featureIndex = featureIndex;
    }
    this.feature._id = id;

    if (this.shouldPerformFrontendEdit()) {
      this.layer = CreateFeature.createFeatureFrontend(callbacks, this.feature);
    }

    callbacks.onEachFeature(this.feature, this.layer!);

    this.firstRun = false;
  }

  async undoTransaction(map: L.Map, callbacks: MapComponentCallbacks) {
    const id = callbacks.getFeatureByIndex(this.featureIndex!)?._id!;
    await store.dispatch.mapStore.deleteFeature({ featureid: id });
    CreateFeature.deleteFeatureFrontend(callbacks, id, this.layer);
  }

  serialize(): CreateFeatureSerialized {
    throw new Error('Method not implemented.');
  }
  deserialize(i: CreateFeatureSerialized): this {
    throw new Error('Method not implemented.');
  }
}

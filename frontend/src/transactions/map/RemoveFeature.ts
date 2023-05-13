import { MapTransaction, TransactionType } from '../../utils/jsTPS';
import { FeatureExt, LGeoJsonExt, LayerExt } from '../../types';
import { store } from '../../models';
import { MapComponentCallbacks } from './common';
import L from 'leaflet';
import { Feature } from 'geojson';
import { layerEvents } from 'react-leaflet-geoman-v2';

interface RemoveFeatureSerialized {}

export class RemoveFeature extends MapTransaction<RemoveFeatureSerialized> {
  readonly type: TransactionType = 'RemoveFeature';
  feature: FeatureExt;
  layer?: LGeoJsonExt;
  featureIndex?: number;

  constructor(layer: LGeoJsonExt, feature: FeatureExt, featureIndex: number, isPeer = false) {
    super(isPeer);
    this.layer = layer;
    this.feature = feature;
    this.featureIndex = featureIndex;
  }

  async doTransaction(map: L.Map, callbacks: MapComponentCallbacks) {
    // dont repeat network connection on peer for first run
    const id = callbacks.getFeatureByIndex(this.featureIndex!)?._id!;

    await store.dispatch.mapStore.deleteFeature({
      featureid: id,
      doNetwork: this.shouldDoNetwork(),
    });

    RemoveFeature.deleteFeatureFrontend(callbacks, id, this.layer);

    this.layer = undefined;

    this.firstRun = false;
  }

  async undoTransaction(map: L.Map, callbacks: MapComponentCallbacks) {
    const { id } = (await store.dispatch.mapStore.createFeature({
      feature: this.feature,
      featureIndex: this.featureIndex,
      doNetwork: true,
    }))!;
    this.feature._id = id;
    this.layer = RemoveFeature.createFeatureFrontend(callbacks, this.feature);
  }

  serialize(): RemoveFeatureSerialized {
    throw new Error('Method not implemented.');
  }
  deserialize(i: RemoveFeatureSerialized): this {
    throw new Error('Method not implemented.');
  }
}

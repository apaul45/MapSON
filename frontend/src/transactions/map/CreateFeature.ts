import { MapTransaction, TransactionType } from '../../utils/jsTPS';
import { FeatureExt, LGeoJsonExt, LayerExt } from '../../types';
import { store } from '../../models';
import { MapComponentCallbacks, extractFeature } from './common';
import L from 'leaflet';

interface CreateFeatureSerialized {}

export class CreateFeature extends MapTransaction<CreateFeatureSerialized> {
  readonly type: TransactionType = 'CreateFeature';
  feature: FeatureExt;
  layer?: LGeoJsonExt;
  id?: string;

  constructor(layer: LGeoJsonExt, feature: FeatureExt | undefined = undefined, isPeer = false) {
    super(isPeer);
    this.layer = layer;
    this.feature = feature ?? extractFeature(layer);
  }

  async doTransaction(map: L.Map, callbacks: MapComponentCallbacks) {
    // dont repeat network connection on peer for first run
    if (!(this.firstRun && this.isPeer)) {
      this.id = await store.dispatch.mapStore.createFeature(this.feature);
    }

    this.feature._id = this.id!;

    if (!this.firstRun) {
      this.layer = L.geoJSON(this.feature).addTo(map) as LGeoJsonExt;
    }

    callbacks.onEachFeature(this.feature, this.layer!);

    this.firstRun = false;
  }

  async undoTransaction(map: L.Map, callbacks: MapComponentCallbacks) {
    await store.dispatch.mapStore.deleteFeature(this.id!);

    this.id = undefined;

    console.log({ removed: this.layer });

    this.layer?.remove();
    this.layer = undefined;

    callbacks.unselectFeature(this.id);
  }

  serialize(): CreateFeatureSerialized {
    throw new Error('Method not implemented.');
  }
  deserialize(i: CreateFeatureSerialized): this {
    throw new Error('Method not implemented.');
  }
}

import { MapTransaction, TransactionType } from '../../utils/jsTPS';
import { FeatureExt, LGeoJsonExt, LayerExt } from '../../types';
import { store } from '../../models';
import { MapComponentCallbacks } from './common';
import L from 'leaflet';

interface CreateFeatureSerialized {}

export class CreateFeature extends MapTransaction<CreateFeatureSerialized> {
  readonly type: TransactionType = 'CreateFeature';
  feature: FeatureExt;
  layer?: LGeoJsonExt;
  id?: string;

  constructor(layer: LGeoJsonExt, isPeer = false) {
    super(isPeer);
    this.layer = layer;
    this.feature = layer.toGeoJSON(15) as FeatureExt;
  }

  async doTransaction(map: L.Map, callbacks: MapComponentCallbacks) {
    // dont repeat network connection on peer for first run
    if (!(this.firstRun && this.isPeer)) {
      this.id = await store.dispatch.mapStore.createFeature(this.feature);
    }

    // if there's no layer
    if (!this.layer) {
      this.layer = L.geoJSON(this.feature).addTo(map) as LGeoJsonExt;
    }

    // then actions for all clients
    this.feature._id = this.id!;
    callbacks.onEachFeature(this.feature, this.layer!);

    this.firstRun = false;
  }

  async undoTransaction(map: L.Map, callbacks: MapComponentCallbacks) {
    await store.dispatch.mapStore.deleteFeature(this.id!);
    callbacks.unselectFeature(this.id);
    this.layer?.remove();
    this.layer = undefined;
    this.id = undefined;
  }

  serialize(): CreateFeatureSerialized {
    throw new Error('Method not implemented.');
  }
  deserialize(i: CreateFeatureSerialized): this {
    throw new Error('Method not implemented.');
  }
}

import { MapTransaction, TransactionType } from '../../utils/jsTPS';
import { FeatureExt, LGeoJsonExt, LayerExt } from '../../types';
import { store } from '../../models';
import { MapComponentCallbacks, extractFeature } from './common';
import L from 'leaflet';
import { FeatureCollection } from '@turf/turf';

interface RemoveFeatureSerialized {}

export class RemoveFeature extends MapTransaction<RemoveFeatureSerialized> {
  readonly type: TransactionType = 'RemoveFeature';
  feature: FeatureExt;
  layer?: LGeoJsonExt;
  id?: string;

  constructor(layer: LGeoJsonExt, isPeer = false) {
    super(isPeer);
    this.feature = extractFeature(layer);
    this.id = layer._id;
  }

  async doTransaction(map: L.Map, callbacks: MapComponentCallbacks) {
    // dont repeat network connection on peer for first run
    if (!(this.firstRun && this.isPeer)) {
      await store.dispatch.mapStore.deleteFeature(this.id!);
    }

    this.id = undefined;

    // remove layer
    this.layer?.remove();
    this.layer = undefined;

    callbacks.unselectFeature(this.id);

    this.firstRun = false;
  }

  async undoTransaction(map: L.Map, callbacks: MapComponentCallbacks) {
    this.id = await store.dispatch.mapStore.createFeature(this.feature);
    this.feature._id = this.id!;
    this.layer = L.geoJSON(this.feature).addTo(map) as LGeoJsonExt;
    callbacks.onEachFeature(this.feature, this.layer!);
  }

  serialize(): RemoveFeatureSerialized {
    throw new Error('Method not implemented.');
  }
  deserialize(i: RemoveFeatureSerialized): this {
    throw new Error('Method not implemented.');
  }
}

import { MapTransaction, TransactionType } from '../../utils/jsTPS';
import { FeatureExt, LGeoJsonExt, LayerExt } from '../../types';
import { store } from '../../models';
import { MapComponentCallbacks, extractFeature } from './common';
import L from 'leaflet';
import { Feature } from 'geojson';

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
    if (!(this.firstRun && this.isPeer)) {
      const { id, featureIndex } = (await store.dispatch.mapStore.createFeature({
        feature: this.feature,
        featureIndex: this.featureIndex,
      }))!;
      this.featureIndex = featureIndex;
      this.feature._id = id;
    }

    if (!this.firstRun) {
      const geoJSONLayer = callbacks.getGeoJSONLayer();
      const layer = L.GeoJSON.geometryToLayer(this.feature, geoJSONLayer.options) as L.Layer & {
        feature: Feature;
        defaultOptions: L.LayerOptions;
      };
      layer.feature = L.GeoJSON.asFeature(this.feature);
      layer.defaultOptions = layer.options;
      geoJSONLayer.resetStyle(layer);
      geoJSONLayer.addLayer(layer);
      this.layer = layer as unknown as LGeoJsonExt;
    }

    callbacks.onEachFeature(this.feature, this.layer!);

    this.firstRun = false;
  }

  async undoTransaction(map: L.Map, callbacks: MapComponentCallbacks) {
    const id = callbacks.getFeatureByIndex(this.featureIndex!)?._id!;

    if (this.layer?._id !== id) {
      this.layer = callbacks.getLayerById(id) as LGeoJsonExt;
    }

    await store.dispatch.mapStore.deleteFeature(id);

    this.layer?.remove();
    this.layer = undefined;

    callbacks.unselectFeature(id);
  }

  serialize(): CreateFeatureSerialized {
    throw new Error('Method not implemented.');
  }
  deserialize(i: CreateFeatureSerialized): this {
    throw new Error('Method not implemented.');
  }
}

import { MapTransaction, TransactionType } from '../../utils/jsTPS';
import { FeatureExt, LGeoJsonExt, LayerExt } from '../../types';
import { store } from '../../models';
import { MapComponentCallbacks } from './common';
import L from 'leaflet';
import { Feature } from 'geojson';

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
    if (!(this.firstRun && this.isPeer)) {
      await store.dispatch.mapStore.deleteFeature(id);
    }

    if (this.layer?._id !== id) {
      this.layer = callbacks.getLayerById(id) as LGeoJsonExt;
    }

    // remove layer
    this.layer?.remove();
    this.layer = undefined;

    callbacks.unselectFeature(id);

    this.firstRun = false;
  }

  async undoTransaction(map: L.Map, callbacks: MapComponentCallbacks) {
    const { id, featureIndex } = (await store.dispatch.mapStore.createFeature({
      feature: this.feature,
      featureIndex: this.featureIndex,
    }))!;
    this.featureIndex = featureIndex;
    this.feature._id = id;

    const geoJSONLayer = callbacks.getGeoJSONLayer();
    const layer = L.GeoJSON.geometryToLayer(this.feature, geoJSONLayer.options) as L.Layer & {
      feature: Feature;
      defaultOptions: L.LayerOptions;
    };
    layer.feature = L.GeoJSON.asFeature(this.feature);
    layer.defaultOptions = layer.options;
    geoJSONLayer.resetStyle(layer);
    callbacks.onEachFeature(this.feature, layer as unknown as LGeoJsonExt);
    geoJSONLayer.addLayer(layer);

    this.layer = layer as unknown as LGeoJsonExt;
  }

  serialize(): RemoveFeatureSerialized {
    throw new Error('Method not implemented.');
  }
  deserialize(i: RemoveFeatureSerialized): this {
    throw new Error('Method not implemented.');
  }
}

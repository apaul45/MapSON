import { MapTransaction, TransactionType } from '../../utils/jsTPS';
import { FeatureExt, LGeoJsonExt, MongoData } from '../../types';
import { store } from '../../models';
import { MapComponentCallbacks } from './common';
import L from 'leaflet';
import { cloneDeep } from 'lodash';

interface EditFeatureSerialized {}

export class EditFeature extends MapTransaction<EditFeatureSerialized> {
  readonly type: TransactionType = 'EditFeature';
  oldFeature?: FeatureExt;
  feature: FeatureExt;
  featureIndex?: number;

  constructor(
    layer: L.Polygon & MongoData,
    feature: FeatureExt,
    featureIndex: number,
    isPeer = false
  ) {
    super(isPeer);
    this.oldFeature = feature;
    this.feature = layer.toGeoJSON(15) as FeatureExt;
    this.featureIndex = featureIndex;
  }

  async doTransaction(map: L.Map, callbacks: MapComponentCallbacks) {
    let id = undefined;

    // dont repeat network connection on peer for first run
    if (!(this.firstRun && this.isPeer)) {
      id = callbacks.getFeatureByIndex(this.featureIndex!)?._id!;
      const res = await store.dispatch.mapStore.updateFeature({
        id,
        feature: this.feature,
      });

      if (this.oldFeature === undefined) {
        this.oldFeature = cloneDeep(res)!;
      }
    }

    if (!this.firstRun && !this.isPeer) {
      this._updateFeature(this.feature, id, callbacks, map);
    }

    this.firstRun = false;
  }

  async undoTransaction(map: L.Map, callbacks: MapComponentCallbacks) {
    const id = callbacks.getFeatureByIndex(this.featureIndex!)?._id!;
    await store.dispatch.mapStore.updateFeature({ id, feature: this.oldFeature! });
    this._updateFeature(this.oldFeature!, id, callbacks, map);
  }

  _updateFeature(
    feature: FeatureExt,
    id: string | undefined,
    callbacks: MapComponentCallbacks,
    map: L.Map
  ) {
    if (feature.geometry.type !== 'Polygon' && feature.geometry.type !== 'MultiPolygon') {
      throw new Error('Cannot undo/redo edits features that is not a (multi)polygon');
    }

    const coords = feature.geometry.coordinates;

    const latLngs = L.GeoJSON.coordsToLatLngs(coords, feature.geometry.type === 'Polygon' ? 1 : 2);

    let layer = callbacks.getLayerById(id ?? callbacks.getFeatureByIndex(this.featureIndex!)?._id!);

    if (!layer) {
      console.error('Layer not found');
    }

    //@ts-ignore
    layer?.setLatLngs ? layer?.setLatLngs(latLngs) : layer?._setLatLngs(latLngs);
    if (layer?.pm.enabled()) {
      //@ts-ignore
      layer?.pm._initMarkers();
    }
  }

  serialize(): EditFeatureSerialized {
    throw new Error('Method not implemented.');
  }
  deserialize(i: EditFeatureSerialized): this {
    throw new Error('Method not implemented.');
  }
}

import { MapTransaction, TransactionType } from '../../utils/jsTPS';
import { FeatureExt, LGeoJsonExt, LayerExt, MongoData } from '../../types';
import { store } from '../../models';
import { MapComponentCallbacks } from './common';
import L from 'leaflet';

interface EditFeatureSerialized {}

export class EditFeature extends MapTransaction<EditFeatureSerialized> {
  readonly type: TransactionType = 'EditFeature';
  oldFeature?: FeatureExt;
  feature: FeatureExt;
  layer: L.Polygon;
  id: string;

  constructor(layer: L.Polygon & MongoData, isPeer = false) {
    super(isPeer);
    this.layer = layer;
    this.id = layer._id;
    this.feature = layer.toGeoJSON(15) as FeatureExt;
  }

  async doTransaction(map: L.Map, callbacks: MapComponentCallbacks) {
    // dont repeat network connection on peer for first run
    if (!(this.firstRun && this.isPeer)) {
      const res = await store.dispatch.mapStore.updateFeature({
        id: this.id!,
        feature: this.feature,
      });

      if (!this.oldFeature) {
        this.oldFeature = res!;
      }
    }

    if (!this.firstRun && !this.isPeer) {
      this._updateFeature(this.feature);
    }

    this.firstRun = false;
  }

  async undoTransaction(map: L.Map, callbacks: MapComponentCallbacks) {
    await store.dispatch.mapStore.updateFeature({ id: this.id!, feature: this.oldFeature! });
    this._updateFeature(this.oldFeature!);
  }

  _updateFeature(feature: FeatureExt) {
    if (feature.geometry.type !== 'Polygon' && feature.geometry.type !== 'MultiPolygon') {
      throw new Error('Cannot undo/redo edits features that is not a (multi)polygon');
    }

    const coords = feature.geometry.coordinates;

    const latLngs = L.GeoJSON.coordsToLatLngs(coords, feature.geometry.type === 'Polygon' ? 1 : 2);

    this.layer.setLatLngs(latLngs);
    //@ts-ignore
    this.layer.pm._initMarkers();
  }

  serialize(): EditFeatureSerialized {
    throw new Error('Method not implemented.');
  }
  deserialize(i: EditFeatureSerialized): this {
    throw new Error('Method not implemented.');
  }
}

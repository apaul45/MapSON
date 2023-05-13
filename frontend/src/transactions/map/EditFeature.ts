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
      EditFeature.editFeatureFrontend(this.feature, id, callbacks, this.featureIndex);
    }

    this.firstRun = false;
  }

  async undoTransaction(map: L.Map, callbacks: MapComponentCallbacks) {
    const id = callbacks.getFeatureByIndex(this.featureIndex!)?._id!;
    await store.dispatch.mapStore.updateFeature({ id, feature: this.oldFeature! });
    EditFeature.editFeatureFrontend(this.oldFeature!, id, callbacks, this.featureIndex);
  }

  serialize(): EditFeatureSerialized {
    throw new Error('Method not implemented.');
  }
  deserialize(i: EditFeatureSerialized): this {
    throw new Error('Method not implemented.');
  }
}

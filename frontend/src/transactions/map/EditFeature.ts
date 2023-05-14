import { CommonSerialization, MapTransaction, TransactionType } from '../../utils/jsTPS';
import { FeatureExt, LGeoJsonExt, MongoData } from '../../types';
import { store } from '../../models';
import { MapComponentCallbacks } from './common';
import L from 'leaflet';
import { cloneDeep } from 'lodash';

export interface EditFeatureSerialized extends CommonSerialization {
  type: 'EditFeature';
  featureIndex: number;
  feature: FeatureExt;
  oldFeature: FeatureExt;
}

export class EditFeature extends MapTransaction<EditFeatureSerialized> {
  readonly type = 'EditFeature';
  oldFeature: FeatureExt;
  feature: FeatureExt;
  featureIndex: number;

  constructor(oldFeature: FeatureExt, feature: FeatureExt, featureIndex: number, isPeer = false) {
    super(isPeer);
    this.oldFeature = oldFeature;
    this.feature = feature;
    this.featureIndex = featureIndex;
  }

  async doTransaction(map: L.Map, callbacks: MapComponentCallbacks, fromSocket: boolean) {
    let id = undefined;

    // dont repeat network connection on peer for first run
    id = callbacks.getFeatureByIndex(this.featureIndex!)?._id!;
    const res = await store.dispatch.mapStore.updateFeature({
      id,
      feature: this.feature,
      doNetwork: this.shouldDoNetwork(fromSocket),
    });

    if (this.oldFeature === undefined) {
      this.oldFeature = cloneDeep(res)!;
    }

    if (this.shouldPerformFrontendEdit()) {
      EditFeature.editFeatureFrontend(this.feature, id, callbacks, this.featureIndex);
    }

    this.firstRun = false;
  }

  async undoTransaction(map: L.Map, callbacks: MapComponentCallbacks, fromSocket: boolean) {
    const id = callbacks.getFeatureByIndex(this.featureIndex!)?._id!;
    await store.dispatch.mapStore.updateFeature({
      id,
      feature: this.oldFeature!,
      doNetwork: this.shouldDoNetwork(fromSocket),
    });
    EditFeature.editFeatureFrontend(this.oldFeature!, id, callbacks, this.featureIndex);
  }

  serialize(): EditFeatureSerialized {
    return {
      type: this.type,
      featureIndex: this.featureIndex,
      feature: this.feature,
      oldFeature: this.oldFeature,
    };
  }

  static deserialize(i: EditFeatureSerialized, callbacks: MapComponentCallbacks): EditFeature {
    return new EditFeature(i.oldFeature, i.feature, i.featureIndex, true);
  }
}

import { CommonSerialization, MapTransaction, TransactionType } from '../../utils/jsTPS';
import { FeatureExt, LGeoJsonExt, MongoData } from '../../types';
import { store } from '../../models';
import { MapComponentCallbacks } from './common';
import L from 'leaflet';
import { cloneDeep } from 'lodash';
import * as jsondiffpatch from 'jsondiffpatch';

export interface EditFeatureSerialized extends CommonSerialization {
  type: 'EditFeature';
  featureIndex: number;
  diff?: jsondiffpatch.Delta;
}

type InputType =
  | {
      oldFeature: FeatureExt;
      feature: FeatureExt;
    }
  | {
      diff: jsondiffpatch.Delta;
    };

export class EditFeature extends MapTransaction<EditFeatureSerialized> {
  readonly type = 'EditFeature';
  diff: jsondiffpatch.Delta | undefined;
  featureIndex: number;

  constructor(input: InputType, featureIndex: number, isPeer: boolean | undefined = false) {
    super(isPeer);

    if ('diff' in input) {
      this.diff = input.diff;
    } else {
      this.diff = jsondiffpatch.diff(
        {
          ...input.oldFeature,
          _id: undefined,
          __v: undefined,
          createdAt: undefined,
          updatedAt: undefined,
        },
        {
          ...input.feature,
          _id: undefined,
          __v: undefined,
          createdAt: undefined,
          updatedAt: undefined,
        }
      );
    }

    this.diff = jsondiffpatch.reverse(this.diff!);

    this.featureIndex = featureIndex;
  }

  async doTransaction(map: L.Map, callbacks: MapComponentCallbacks, fromSocket: boolean) {
    this.diff = jsondiffpatch.reverse(this.diff!);

    // dont repeat network connection on peer for first run
    let oldFeature = callbacks.getFeatureByIndex(this.featureIndex!)!;
    const id = oldFeature._id!;

    oldFeature = jsondiffpatch.patch(
      { ...oldFeature, _id: undefined, __v: undefined, createdAt: undefined, updatedAt: undefined },
      this.diff!
    );

    await store.dispatch.mapStore.updateFeature({
      id,
      feature: oldFeature,
      doNetwork: this.shouldDoNetwork(fromSocket),
    });

    if (this.shouldPerformFrontendEdit()) {
      EditFeature.editFeatureFrontend(oldFeature, id, callbacks, this.featureIndex);
    }

    this.firstRun = false;
  }

  async undoTransaction(map: L.Map, callbacks: MapComponentCallbacks, fromSocket: boolean) {
    this.diff = jsondiffpatch.reverse(this.diff!);

    let feature = callbacks.getFeatureByIndex(this.featureIndex!)!;
    const id = feature._id!;

    feature = jsondiffpatch.patch(
      { ...feature, _id: undefined, __v: undefined, createdAt: undefined, updatedAt: undefined },
      this.diff!
    );

    await store.dispatch.mapStore.updateFeature({
      id,
      feature: feature,
      doNetwork: this.shouldDoNetwork(fromSocket),
    });
    EditFeature.editFeatureFrontend(feature, id, callbacks, this.featureIndex);
  }

  serialize(): EditFeatureSerialized {
    return {
      type: this.type,
      featureIndex: this.featureIndex,
      diff: this.diff,
    };
  }

  static deserialize(i: EditFeatureSerialized, callbacks: MapComponentCallbacks): EditFeature {
    return new EditFeature({ diff: i.diff! }, i.featureIndex, true);
  }
}

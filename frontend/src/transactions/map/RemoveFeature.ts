import { CommonSerialization, MapTransaction, TransactionType } from '../../utils/jsTPS';
import { FeatureExt, LGeoJsonExt, LayerExt } from '../../types';
import { store } from '../../models';
import { MapComponentCallbacks } from './common';
import L from 'leaflet';
import { Feature } from 'geojson';
import { layerEvents } from 'react-leaflet-geoman-v2';

export interface RemoveFeatureSerialized extends CommonSerialization {
  type: 'RemoveFeature';
  feature: FeatureExt;
  featureIndex: number;
}

export class RemoveFeature extends MapTransaction<RemoveFeatureSerialized> {
  readonly type = 'RemoveFeature';
  feature: FeatureExt;
  layer?: LGeoJsonExt;
  featureIndex: number;

  constructor(
    layer: LGeoJsonExt | undefined,
    feature: FeatureExt,
    featureIndex: number,
    isPeer = false
  ) {
    super(isPeer);
    this.layer = layer;
    this.feature = feature;
    this.featureIndex = featureIndex;
  }

  async doTransaction(map: L.Map, callbacks: MapComponentCallbacks, fromSocket: boolean) {
    const id = callbacks.getFeatureByIndex(this.featureIndex!)?._id!;

    await store.dispatch.mapStore.deleteFeature({
      featureid: id,
      doNetwork: this.shouldDoNetwork(fromSocket),
    });

    RemoveFeature.deleteFeatureFrontend(callbacks, id, this.layer);

    this.layer = undefined;

    this.firstRun = false;
  }

  async undoTransaction(
    map: L.Map,
    callbacks: MapComponentCallbacks,
    fromSocket: boolean,
    peerArtifacts?: { id: string }
  ) {
    this.feature._id = peerArtifacts?.id ?? this.feature._id;

    const { id } = (await store.dispatch.mapStore.createFeature({
      feature: this.feature,
      featureIndex: this.featureIndex,
      doNetwork: this.shouldDoNetwork(fromSocket),
    }))!;
    this.feature._id = id;
    this.layer = RemoveFeature.createFeatureFrontend(callbacks, this.feature);

    callbacks.onEachFeature(this.feature, this.layer as unknown as LGeoJsonExt);

    return { id };
  }

  serialize(): RemoveFeatureSerialized {
    return {
      type: this.type,
      feature: this.feature,
      featureIndex: this.featureIndex,
    };
  }
  static deserialize(i: RemoveFeatureSerialized, callbacks: MapComponentCallbacks): RemoveFeature {
    const layer = callbacks.getLayerById(i.feature!._id) as LGeoJsonExt | undefined;
    return new RemoveFeature(layer, i.feature, i.featureIndex, true);
  }
}

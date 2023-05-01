import { TransactionType } from '../../utils/jsTPS';
import { FeatureExt, LGeoJsonExt, LayerExt } from '../../types';
import { MapComponentCallbacks, extractFeature } from './common';
import { CreateFeature } from './CreateFeature';
import { RemoveFeature } from './RemoveFeature';
import { MultipleTransactions } from './MultipleTransactions';

interface CreateAndRemoveMultipleFeaturesSerialized {}

interface CreateLayer {
  feature?: FeatureExt;
  layer: LGeoJsonExt;
  featureIndex: number;
  action: 'Create';
}

type CreateRemoveLayer = CreateLayer | RemoveLayer;

interface RemoveLayer {
  feature: FeatureExt;
  layer: LGeoJsonExt;
  featureIndex: number;
  action: 'Remove';
}

type CreateAndRemoveTransaction = CreateFeature | RemoveFeature;

export interface InputAddedLayer {
  layer: LGeoJsonExt;
  feature?: FeatureExt;
}

export interface InputRemoveLayer {
  layer: LGeoJsonExt;
  feature?: FeatureExt;
  featureIndex: number;
}

export class CreateAndRemoveMultipleFeature extends MultipleTransactions<
  CreateAndRemoveMultipleFeaturesSerialized,
  CreateAndRemoveTransaction
> {
  readonly type: TransactionType = 'CreateAndRemoveMultipleFeature';

  static toCreateRemoveLayer(
    layer: LGeoJsonExt,
    feature: FeatureExt | undefined,
    featureIndex: number | undefined,
    action: 'Create' | 'Remove',
    callbacks: MapComponentCallbacks
  ): CreateRemoveLayer {
    let f = feature;
    let fidx = featureIndex;
    if (!featureIndex && action === 'Remove') {
      const res = callbacks.getFeatureById(layer._id)!;
      f = res.feature;
      fidx = res.featureIndex;
    }

    return {
      layer,
      feature: f ?? extractFeature(layer),
      action,
      featureIndex: fidx!,
    };
  }

  static toTransaction(arl: CreateRemoveLayer): CreateFeature | RemoveFeature {
    if (arl.action === 'Create') {
      return new CreateFeature(arl.layer, arl.feature);
    } else if (arl.action === 'Remove') {
      return new RemoveFeature(arl.layer, arl.feature, arl.featureIndex);
    }

    throw new Error('Action not supported');
  }

  /* 
      create idx 5  +1
  
      remove id 4 -> 5 
  
  
    */

  constructor(
    addedLayers: InputAddedLayer[],
    removedLayers: InputRemoveLayer[],
    callbacks: MapComponentCallbacks,
    isPeer = false
  ) {
    const add = addedLayers.map((a) =>
      CreateAndRemoveMultipleFeature.toCreateRemoveLayer(
        a.layer,
        a.feature,
        undefined,
        'Create',
        callbacks
      )
    ) as CreateLayer[];
    const remove = removedLayers
      .map((a) =>
        CreateAndRemoveMultipleFeature.toCreateRemoveLayer(
          a.layer,
          a.feature,
          a.featureIndex,
          'Remove',
          callbacks
        )
      )
      .sort((a, b) => a.featureIndex - b.featureIndex) as RemoveLayer[];

    let offset = 0;

    // adjust indices so creates and removes are
    for (const e of remove) {
      e.featureIndex += offset;
      offset -= 1;
    }

    // do adds first so it doesnt mess up the removes
    const res = [...add, ...remove];

    super(
      res.map((arl) => CreateAndRemoveMultipleFeature.toTransaction(arl)),
      isPeer
    );
  }

  serialize(): CreateAndRemoveMultipleFeaturesSerialized {
    throw new Error('Method not implemented.');
  }
  deserialize(i: CreateAndRemoveMultipleFeaturesSerialized): this {
    throw new Error('Method not implemented.');
  }
}

import { CommonSerialization, MapTransaction, TransactionType } from '../../utils/jsTPS';
import { CreateAndRemoveMultipleFeature } from './CreateAndRemoveMultipleFeatures';
import { CreateFeature } from './CreateFeature';
import { EditFeature } from './EditFeature';
import { MergeFeatures } from './MergeFeatures';
import { RemoveFeature } from './RemoveFeature';
import { SplitFeature } from './SplitFeature';
import { MapComponentCallbacks, SerializedTransactionTypes, deserializer } from './common';
import L from 'leaflet';

export interface MultipleTransactionsSerialized extends CommonSerialization {
  type: 'Multiple';
  transactions: SerializedTransactionTypes[];
}

export type TransactionTypes =
  | CreateAndRemoveMultipleFeature
  | CreateFeature
  | EditFeature
  | MergeFeatures
  | MultipleTransactions<TransactionType>
  | RemoveFeature
  | SplitFeature;

export class MultipleTransactions<
  T extends TransactionType = 'Multiple'
> extends MapTransaction<MultipleTransactionsSerialized> {
  readonly type: T | 'Multiple' = 'Multiple';
  transactions: TransactionTypes[];

  constructor(transactions: TransactionTypes[], isPeer = false) {
    super(isPeer);
    this.transactions = transactions.reverse();
  }

  async doTransaction(map: L.Map, callbacks: MapComponentCallbacks, fromSocket: boolean) {
    for (const t of this.transactions.reverse()) {
      await t.doTransaction(map, callbacks, fromSocket);
    }
  }

  async undoTransaction(map: L.Map, callbacks: MapComponentCallbacks, fromSocket: boolean) {
    for (const t of this.transactions.reverse()) {
      await t.undoTransaction(map, callbacks, fromSocket);
    }
  }

  serialize(): any;
  serialize(): MultipleTransactionsSerialized {
    return {
      type: this.type as 'Multiple',
      transactions: this.transactions.map((t) => t.serialize()),
    };
  }

  static deserialize(i: any, callbacks: MapComponentCallbacks): any;
  static deserialize(
    i: MultipleTransactionsSerialized,
    callbacks: MapComponentCallbacks
  ): MultipleTransactions<TransactionType> {
    const transactions = i.transactions.map((t) => deserializer(t, callbacks));
    return new MultipleTransactions(transactions, true);
  }
}

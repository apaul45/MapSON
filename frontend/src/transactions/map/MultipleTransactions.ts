import { MapTransaction, TransactionType } from '../../utils/jsTPS';
import { MapComponentCallbacks } from './common';
import L from 'leaflet';

export interface MultipleTransactionsSerialized<R> {}

export class MultipleTransactions<R, T extends MapTransaction<any>> extends MapTransaction<
  MultipleTransactionsSerialized<R>
> {
  readonly type: TransactionType = 'Multiple';
  transactions: T[];

  constructor(transactions: T[], isPeer = false) {
    super(isPeer);
    this.transactions = transactions.reverse();
  }

  async doTransaction(map: L.Map, callbacks: MapComponentCallbacks) {
    for (const t of this.transactions.reverse()) {
      await t.doTransaction(map, callbacks);
    }
  }

  async undoTransaction(map: L.Map, callbacks: MapComponentCallbacks) {
    for (const t of this.transactions.reverse()) {
      await t.undoTransaction(map, callbacks);
    }
  }

  serialize(): MultipleTransactionsSerialized<R> {
    throw new Error('Method not implemented.');
  }
  deserialize(i: MultipleTransactionsSerialized<R>): this {
    throw new Error('Method not implemented.');
  }
}

import { MapComponentCallbacks } from '../transactions/map/common';

/**
 * jsTPS_Transaction
 *
 * This provides the basic structure for a transaction class. Note to use
 * jsTPS one should create objects that define these two methods, doTransaction
 * and undoTransaction, which will update the application state accordingly.
 *
 * @author THE McKilla Gorilla (accept no imposters)
 * @version 1.0
 */
export type TransactionType = 'CreateFeature' | 'EditFeature' | 'DeleteFeature';

export abstract class BaseTransaction<T> {
  abstract readonly type: TransactionType;
  firstRun: boolean;
  isPeer: boolean;

  constructor(isPeer: boolean) {
    this.firstRun = true;
    this.isPeer = isPeer;
  }

  /**
   * Serialize transaction
   */
  abstract serialize(): T;

  /**
   * Deserialize transaction
   */
  abstract deserialize(i: T): this;
}

export abstract class MapTransaction<T> extends BaseTransaction<T> {
  /**
   * This method is called by jTPS when a transaction is executed.
   */
  abstract doTransaction(map: L.Map, callbacks: MapComponentCallbacks): void | Promise<void>;
  /**
   * This method is called by jTPS when a transaction is undone.
   */
  abstract undoTransaction(map: L.Map, callbacks: MapComponentCallbacks): void | Promise<void>;
}

export abstract class RegularTransaction<T> extends BaseTransaction<T> {
  /**
   * This method is called by jTPS when a transaction is executed.
   */
  abstract doTransaction(): void | Promise<void>;
  /**
   * This method is called by jTPS when a transaction is undone.
   */
  abstract undoTransaction(): void | Promise<void>;
}

export type Transaction = MapTransaction<any> | RegularTransaction<any>;

/**
 * jsTPS
 *
 * This class serves as the Transaction Processing System. Note that it manages
 * a stack of jsTPS_Transaction objects, each of which know how to do or undo
 * state changes for the given application. Note that this TPS is not platform
 * specific as it is programmed in raw JavaScript.
 */
export default class jsTPS {
  transactions: Transaction[];
  numTransactions: number;
  mostRecentTransaction: number;
  performingDo: boolean;
  performingUndo: boolean;

  constructor() {
    // THE TRANSACTION STACK
    this.transactions = [];

    // THE TOTAL NUMBER OF TRANSACTIONS ON THE STACK,
    // INCLUDING THOSE THAT MAY HAVE ALREADY BEEN UNDONE
    this.numTransactions = 0;

    // THE INDEX OF THE MOST RECENT TRANSACTION, NOTE THAT
    // THIS MAY BE IN THE MIDDLE OF THE TRANSACTION STACK
    // IF SOME TRANSACTIONS ON THE STACK HAVE BEEN UNDONE
    // AND STILL COULD BE REDONE.
    this.mostRecentTransaction = -1;

    // THESE STATE VARIABLES ARE TURNED ON AND OFF WHILE
    // TRANSACTIONS ARE DOING THEIR WORK SO AS TO HELP
    // MANAGE CONCURRENT UPDATES
    this.performingDo = false;
    this.performingUndo = false;
  }

  /**
   * isPerformingDo
   *
   * Accessor method for getting a boolean representing whether or not
   * a transaction is currently in the midst of a do/redo operation.
   */
  isPerformingDo() {
    return this.performingDo;
  }

  /**
   * isPerformingUndo
   *
   * Accessor method for getting a boolean representing whether or not
   * a transaction is currently in the midst of an undo operation.
   */
  isPerformingUndo() {
    return this.performingUndo;
  }

  /**
   * getSize
   *
   * Accessor method for getting the number of transactions on the stack.
   */
  getSize() {
    return this.transactions.length;
  }

  /**
   * getRedoSize
   *
   * Method for getting the total number of transactions on the stack
   * that can possibly be redone.
   */
  getRedoSize() {
    return this.getSize() - this.mostRecentTransaction - 1;
  }

  /**
   * getUndoSize
   *
   * Method for getting the total number of transactions on the stack
   * that can possible be undone.
   */
  getUndoSize() {
    return this.mostRecentTransaction + 1;
  }

  /**
   * hasTransactionToRedo
   *
   * Method for getting a boolean representing whether or not
   * there are transactions on the stack that can be redone.
   */
  hasTransactionToRedo() {
    return this.mostRecentTransaction + 1 < this.numTransactions;
  }

  /**
   * hasTransactionToUndo
   *
   * Method for getting a boolean representing whehter or not
   * there are transactions on the stack that can be undone.
   */
  hasTransactionToUndo() {
    return this.mostRecentTransaction >= 0;
  }

  /**
   * addTransaction
   *
   * Method for adding a transaction to the TPS stack, note it
   * also then does the transaction.
   *
   * @param {jsTPS_Transaction} transaction Transaction to add to the stack and do.
   */
  async addTransaction(transaction: Transaction, map: L.Map, callbacks: MapComponentCallbacks) {
    // ARE WE BRANCHING?
    if (
      this.mostRecentTransaction < 0 ||
      this.mostRecentTransaction < this.transactions.length - 1
    ) {
      for (let i = this.transactions.length - 1; i > this.mostRecentTransaction; i--) {
        this.transactions.splice(i, 1);
      }
      this.numTransactions = this.mostRecentTransaction + 2;
    } else {
      this.numTransactions++;
    }

    // ADD THE TRANSACTION
    this.transactions[this.mostRecentTransaction + 1] = transaction;

    // AND EXECUTE IT
    await this.doTransaction(map, callbacks);
  }

  /**
   * doTransaction
   *
   * Does the current transaction on the stack and advances the transaction
   * counter. Note this function may be invoked as a result of either adding
   * a transaction (which also does it), or redoing a transaction.
   */
  async doTransaction(map: L.Map, callbacks: MapComponentCallbacks) {
    if (this.hasTransactionToRedo()) {
      this.performingDo = true;
      let transaction = this.transactions[this.mostRecentTransaction + 1];
      if (transaction instanceof MapTransaction) {
        await transaction.doTransaction(map, callbacks);
      } else if (transaction instanceof RegularTransaction) {
        await transaction.doTransaction();
      }
      this.mostRecentTransaction++;
      this.performingDo = false;
    }
  }

  /**
   * This function gets the most recently executed transaction on the
   * TPS stack and undoes it, moving the TPS counter accordingly.
   */
  async undoTransaction(map: L.Map, callbacks: MapComponentCallbacks) {
    if (this.hasTransactionToUndo()) {
      this.performingUndo = true;
      let transaction = this.transactions[this.mostRecentTransaction];
      if (transaction instanceof MapTransaction) {
        await transaction.undoTransaction(map, callbacks);
      } else {
        await transaction.undoTransaction();
      }
      this.mostRecentTransaction--;
      this.performingUndo = false;
    }
  }

  /**
   * clearAllTransactions
   *
   * Removes all the transactions from the TPS, leaving it with none.
   */
  clearAllTransactions() {
    // REMOVE ALL THE TRANSACTIONS
    this.transactions = [];

    // MAKE SURE TO RESET THE LOCATION OF THE
    // TOP OF THE TPS STACK TOO
    this.mostRecentTransaction = -1;
    this.numTransactions = 0;
  }

  /**
   * toString
   *
   * Builds and returns a textual represention of the full TPS and its stack.
   */
  toString() {
    let text = '--Number of Transactions: ' + this.numTransactions + '\n';
    text += '--Current Index on Stack: ' + this.mostRecentTransaction + '\n';
    text += '--Current Transaction Stack:\n';
    for (let i = 0; i <= this.mostRecentTransaction; i++) {
      let jT = this.transactions[i];
      text += '----' + jT.toString() + '\n';
    }
    return text;
  }
}

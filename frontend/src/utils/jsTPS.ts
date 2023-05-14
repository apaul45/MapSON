import { MutableRefObject } from 'react';
import { MapComponentCallbacks } from '../transactions/map/common';
import L from 'leaflet';
import { Feature } from 'geojson';
import { layerEvents } from 'react-leaflet-geoman-v2';
import { FeatureExt, LGeoJsonExt } from '../types';

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
export type TransactionType =
  | 'CreateFeature'
  | 'EditFeature'
  | 'RemoveFeature'
  | 'Multiple'
  | 'Merge'
  | 'Split'
  | 'CreateAndRemoveMultipleFeature';

export interface CommonSerialization {
  type: TransactionType;
}

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
  static deserialize(i: any, callbacks: MapComponentCallbacks): any {
    throw new Error('NOT IMPLEMENTED');
  }

  shouldPerformFrontendEdit() {
    const res = this.isPeer || !this.firstRun;

    if (res) {
      console.log('Should perform');
    } else {
      console.log('Should NOT perform');
    }

    return res;
  }

  shouldDoNetwork(fromSocket: boolean) {
    const peerInit = this.firstRun && this.isPeer;
    return !peerInit || !fromSocket;
  }

  static createFeatureFrontend(callbacks: MapComponentCallbacks, feature: FeatureExt) {
    const geoJSONLayer = callbacks.getGeoJSONLayer();
    const options: L.LayerOptions = { ...geoJSONLayer.options, pmIgnore: false };
    const layer = L.GeoJSON.geometryToLayer(feature, options) as L.Layer & {
      feature: Feature;
      defaultOptions: L.LayerOptions;
    };
    layer.feature = L.GeoJSON.asFeature(feature);
    layer.defaultOptions = layer.options;
    geoJSONLayer.resetStyle(layer);
    geoJSONLayer.addLayer(layer);

    layerEvents(
      layer,
      {
        onEdit: callbacks.onEdit,
        onLayerRemove: callbacks.onRemove,
        onCreate: callbacks.onCreate,
      },
      'on'
    );

    return layer as unknown as LGeoJsonExt;
  }

  static deleteFeatureFrontend(
    callbacks: MapComponentCallbacks,
    id: string,
    iLayer: LGeoJsonExt | undefined
  ) {
    let layer = iLayer;

    if (layer?._id !== id) {
      layer?.remove();
      layer = callbacks.getLayerById(id) as LGeoJsonExt;
    }

    // remove layer
    layer?.remove();

    callbacks.unselectFeature(id);
  }

  static editFeatureFrontend(
    feature: FeatureExt,
    id: string | undefined,
    callbacks: MapComponentCallbacks,
    featureIndex: number | undefined
  ) {
    if (feature.geometry.type !== 'Polygon' && feature.geometry.type !== 'MultiPolygon') {
      throw new Error('Cannot undo/redo edits features that is not a (multi)polygon');
    }

    const coords = feature.geometry.coordinates;

    const latLngs = L.GeoJSON.coordsToLatLngs(coords, feature.geometry.type === 'Polygon' ? 1 : 2);

    let layer = callbacks.getLayerById(id ?? callbacks.getFeatureByIndex(featureIndex!)?._id!);

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
}

export abstract class MapTransaction<T> extends BaseTransaction<T> {
  /**
   * This method is called by jTPS when a transaction is executed.
   */
  abstract doTransaction(
    map: L.Map,
    callbacks: MapComponentCallbacks,
    fromSocket: boolean
  ): void | Promise<void>;
  /**
   * This method is called by jTPS when a transaction is undone.
   */
  abstract undoTransaction(
    map: L.Map,
    callbacks: MapComponentCallbacks,
    fromSocket: boolean
  ): void | Promise<void>;
}

export type Transaction = MapTransaction<any>;

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
  map: MutableRefObject<L.Map>;
  callbacks?: MapComponentCallbacks;

  constructor(map: MutableRefObject<L.Map>) {
    this.map = map;

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
    await this.doTransaction();
  }

  /**
   * doTransaction
   *
   * Does the current transaction on the stack and advances the transaction
   * counter. Note this function may be invoked as a result of either adding
   * a transaction (which also does it), or redoing a transaction.
   */
  async doTransaction(fromSocket: boolean = false) {
    if (this.hasTransactionToRedo()) {
      this.performingDo = true;
      let transaction = this.transactions[this.mostRecentTransaction + 1];
      console.log(`Do Transaction: ${transaction.type}`);
      await transaction.doTransaction(this.map.current!, this.callbacks!, fromSocket);

      this.mostRecentTransaction++;
      this.performingDo = false;
    }
  }

  /**
   * This function gets the most recently executed transaction on the
   * TPS stack and undoes it, moving the TPS counter accordingly.
   */
  async undoTransaction(fromSocket: boolean = false) {
    if (this.hasTransactionToUndo()) {
      this.performingUndo = true;
      let transaction = this.transactions[this.mostRecentTransaction];
      console.log(`Undo Transaction: ${transaction.type}`);
      await transaction.undoTransaction(this.map.current!, this.callbacks!, fromSocket);

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

//@ts-nocheck

import L, { LatLng } from 'leaflet';
import '@geoman-io/leaflet-geoman-free';
import set from 'lodash/set';

const { Utils } = L.PM;

declare module 'leaflet' {
  interface Layer {
    pm: PM.PMLayerGroup;
    getLatLngs: Function;
    setLatLngs: Function;
    _leaflet_id: number;
  }

  interface Marker {
    _snappedMarkersInOtherLayers: Array<[L.Layer, LatLng]>;
    _middleMarkerNext: L.Marker;
    _middleMarkerPrev: L.Marker;
  }

  namespace PM {
    namespace Utils {
      function findDeepMarkerIndex(...args: any): any;
    }

    interface PMLayerGroup {
      _findAndSetSnappedMarkersInOtherLayers: (marker: L.Marker) => any;
      updatePolygonCoordsFromMarkerDrag: (marker: LatLng, referenceMarker: L.Marker | null) => any;
      _onMarkerDragStart: (e: { target: L.Marker }) => any;
      _onMarkerDrag: (e: { target: L.Marker }) => any;
      _oldOnMarkerDragStart: (e: { target: L.Marker }) => any;
      _oldOnMarkerDrag: (e: { target: L.Marker }) => any;
      _onMarkerDragEnd: (e: { target: L.Marker }) => any;
      _map: L.Map;
      _layer: L.Layer;
      _calculatedLatLngs: LatLng[] | LatLng[][];
    }
  }
}

const TOLERANCE = 10;

const isLatLngEqual = (l: LatLng, r: LatLng): bool => l.distanceTo(r) < TOLERANCE;

const findDeepLLIndex = (arr: Array<LatLng> | Array<Array<LatLng>>, latLng: LatLng) => {
  // thanks for the function, Felix Heck
  let result: number[] | undefined;

  const run = (path: number[]) => (v: LatLng | Array<LatLng>, i: number) => {
    const iRes = path.concat(i);

    if (Array.isArray(v)) {
      return v.some(run(iRes));
    }

    if (isLatLngEqual(v, latLng)) {
      result = iRes;
      return true;
    }

    return false;
  };
  arr.some(run([]));

  let returnVal: {
    indexPath?: typeof result;
    index?: number;
    parentPath?: typeof result;
  } = {};

  if (result) {
    returnVal = {
      indexPath: result,
      index: result[result.length - 1],
      parentPath: result.slice(0, result.length - 1),
    };
  }

  return returnVal;
};

export const extendGeomanLayer = (pm: L.PM.PMLayerGroup) => {
  pm._findAndSetSnappedMarkersInOtherLayers = function (marker: L.Marker) {
    let layersAndMarkers = [] as Array<[L.Layer, LatLng]>; // pairs of [layer, marker]'s

    const findSnappedMarkersInLayer = (
      layer: L.Layer,
      markers: Array<LatLng | Array<LatLng>> | null = null,
      child = false
    ) => {
      let latLngs: LatLng[] | LatLng[][] = markers || layer.getLatLngs();
      if (!child) {
        layer.pm._calculatedLatLngs = latLngs;
      }

      if (Array.isArray(latLngs) && Array.isArray(latLngs[0])) {
        latLngs = latLngs as Array<Array<LatLng>>;
        latLngs.forEach((ms) => findSnappedMarkersInLayer(layer, ms, true));
      } else {
        latLngs = latLngs as Array<LatLng>;

        const mltln = marker.getLatLng();
        const snappedMarker = latLngs.find((m) => isLatLngEqual(m, mltln));
        if (snappedMarker) {
          layersAndMarkers.push([layer, snappedMarker]);
        }
      }
    };

    const layers = Utils.findLayers(this._map);

    layers.forEach((layer) => {
      if (this._layer._leaflet_id != layer._leaflet_id) {
        findSnappedMarkersInLayer(layer);
      }
    });

    marker._snappedMarkersInOtherLayers = layersAndMarkers;
  };

  pm._oldOnMarkerDrag = pm._onMarkerDrag;

  pm._onMarkerDrag = function (e: { target: L.Marker }) {
    pm._oldOnMarkerDrag(e);
    const { target: marker } = e;

    if (marker._snappedMarkersInOtherLayers) {
      const otherLL = marker.getLatLng();

      marker._snappedMarkersInOtherLayers = marker._snappedMarkersInOtherLayers.map(
        ([layer, ll]) => {
          const { indexPath } = findDeepLLIndex(layer.pm._calculatedLatLngs, ll);
          console.log({ coords: layer.pm._calculatedLatLngs, indexPath, otherLL, ll, layer });
          set(layer.pm._calculatedLatLngs, indexPath!, otherLL);
          layer.setLatLngs(layer.pm._calculatedLatLngs);
          return [layer, otherLL];
        }
      );
    }
  };

  pm._oldOnMarkerDragStart = pm._onMarkerDragStart;

  pm._onMarkerDragStart = function (e: { target: L.Marker }) {
    this._findAndSetSnappedMarkersInOtherLayers(e.target);
    pm._oldOnMarkerDragStart(e);
  };

  // add
  pm._onMarkerDragEnd = function (e: { target: L.Marker }) {
    const marker = e.target;

    if (!this._vertexValidationDragEnd(marker)) {
      return;
    }

    const { indexPath } = L.PM.Utils.findDeepMarkerIndex(this._markers, marker);

    // if self intersection is not allowed but this edit caused a self intersection,
    // reset and cancel; do not fire events
    let intersection = this.hasSelfIntersection();
    if (intersection && this.options.allowSelfIntersectionEdit && this._markerAllowedToDrag) {
      intersection = false;
    }

    const intersectionReset = !this.options.allowSelfIntersection && intersection;

    this._fireMarkerDragEnd(e, indexPath, intersectionReset);

    if (intersectionReset) {
      // reset coordinates
      this._layer.setLatLngs(this._coordsBeforeEdit);
      this._coordsBeforeEdit = null;

      // re-enable markers for the new coords
      this._initMarkers();

      if (this.options.snappable) {
        this._initSnappableMarkers();
      }

      // check for selfintersection again (mainly to reset the style)
      this._handleLayerStyle();

      this._fireLayerReset(e, indexPath);
      return;
    }
    if (!this.options.allowSelfIntersection && this.options.allowSelfIntersectionEdit) {
      this._handleLayerStyle();
    }
    // fire edit event
    this._fireEdit(this._layer, 'Edit', { affectedLayers: marker._snappedMarkersInOtherLayers });
    this._layerEdited = true;
    this._fireChange(this._layer.getLatLngs(), 'Edit');
  };
};

import { LatLng, PM } from 'leaflet';
import { GeomanControls } from 'react-leaflet-geoman-v2';
import './MapControls.css';
import { useMap } from 'react-leaflet';
import { SelectedFeature } from './MapComponent';
import {
  Feature,
  FeatureCollection,
  LineString,
  MultiLineString,
  MultiPolygon,
  Polygon,
} from 'geojson';
import * as turf from '@turf/turf';
import { useEffect } from 'react';
import { FeatureExt, LGeoJsonExt } from '../../types';
import L from 'leaflet';
import 'leaflet-geometryutil';
import polygonSlice from '../../utils/polygon-slice';

declare module 'leaflet' {
  namespace PM {
    interface MergeEvent {
      newLayer: L.GeoJSON;
      newFeature: FeatureExt;
      oldLayers: SelectedFeature[];
    }

    export type MergeEventHandler = (e: MergeEvent) => void;

    interface NewFeature {
      layer: L.GeoJSON;
      feature: FeatureExt;
    }

    interface SplitEvent {
      oldLayer: LGeoJsonExt;
      newFeatures: NewFeature[];
      polyline: LineString;
    }

    export type SplitEventHandler = (e: SplitEvent) => void;
  }
  interface Evented {
    // Merge handler
    on(type: 'pm:merge', fn?: PM.MergeEventHandler): this;
    once(type: 'pm:merge', fn?: PM.MergeEventHandler): this;
    off(type: 'pm:merge', fn?: PM.MergeEventHandler): this;

    //Split handler
    on(type: 'pm:split', fn?: PM.SplitEventHandler): this;
    off(type: 'pm:split', fn?: PM.SplitEventHandler): this;
    once(type: 'pm:split', fn?: PM.SplitEventHandler): this;
  }
}

interface IMapControls {
  onCreate: PM.CreateEventHandler;
  onEdit: PM.EditEventHandler;
  onRemove: PM.RemoveEventHandler;
  onMerge: PM.MergeEventHandler;
  onSplit: PM.SplitEventHandler;
  canEdit: boolean;
  getSelectedFeatures: () => SelectedFeature[];
}

type Flatten<T> = T extends Array<infer U> ? U : T;

const moveLatLng = (
  position: LatLng[] | LatLng[][] | LatLng[][][],
  ll: LatLng,
  newll: LatLng
): typeof position => {
  return position.map((pos: Flatten<typeof position>) => {
    if (Array.isArray(pos)) {
      return moveLatLng(pos, ll, newll);
    }

    const res = pos.equals(ll) ? newll : pos;

    return res;
  }) as typeof position;
};

const MapControls = ({
  onCreate,
  onEdit,
  onRemove,
  canEdit,
  getSelectedFeatures,
  onMerge,
  onSplit,
}: IMapControls) => {
  const map = useMap();

  const handleMerge = () => {
    const features = getSelectedFeatures();

    if (features.length < 2) {
      alert('Please select two regions to merge');
      return;
    }

    const shouldMerge = confirm('Merge the two selected regions?');

    if (!shouldMerge) {
      console.log('User declined merge');
      return;
    }

    const canMerge = features.every(
      //@ts-ignore
      ({ layer }) => !layer._pmTempLayer && (!layer.pm || !layer.pm.dragging())
    );

    if (!canMerge) {
      console.error('CANT MERGE REGIONS');
      return;
    }

    //convert to geojson

    const geojsonFeatures = features.map((v) => {
      let f = v.layer.toGeoJSON(15) as FeatureExt | FeatureCollection;

      console.log({ f });

      //flatten feature collection with single value
      if (f.type === 'FeatureCollection' && f.features.length === 1) {
        f = f.features[0] as FeatureExt;
      }

      return f;
    });

    let sourceIsMultiPolygon = false;
    const validFeatures = geojsonFeatures.filter((f) => {
      const valid =
        f.type === 'Feature' &&
        (f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon');

      if (valid && f.geometry.type === 'MultiPolygon') {
        sourceIsMultiPolygon = true;
      }

      return valid;
    }) as Feature<Polygon | MultiPolygon>[];

    if (validFeatures.length !== geojsonFeatures.length) {
      console.debug(geojsonFeatures);
      console.error('Only polygons and multipolygons are valid candidates for merging');
      return;
    }

    const union_res = validFeatures.reduce((prev, curr) => union(prev, curr)!);

    if (!sourceIsMultiPolygon && union_res.geometry.type === 'MultiPolygon') {
      const allowNonContiguous = confirm(
        'This merge results in a non-contiguous polygon. Do you still want to continue?'
      );
      if (!allowNonContiguous) {
        return;
      }
    }

    features.forEach(({ layer }) => layer.remove());

    const newLayer = L.geoJSON(union_res).addTo(map);

    map.fire('pm:merge', { newLayer, newFeature: union_res, oldLayers: features });
  };

  const union = (
    prev: Feature<Polygon | MultiPolygon>,
    curr: Feature<Polygon | MultiPolygon>
  ): Feature<Polygon | MultiPolygon> => {
    return turf.union(prev, curr)!;
  };

  const handleSplit = (polyline: Feature<LineString | MultiLineString>) => {
    const features = getSelectedFeatures();

    if (features.length === 0) {
      alert('No features selected');
      return;
    }

    const validFeatures = features.filter((l) => {
      const f = l.layer.toGeoJSON(15) as FeatureCollection | Feature;

      const isValidFeature =
        f.type === 'Feature' &&
        (f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon');

      const isValidFeatureCollection =
        f.type === 'FeatureCollection' &&
        f.features.length === 1 &&
        (f.features[0].geometry.type === 'Polygon' ||
          f.features[0].geometry.type === 'MultiPolygon');

      return isValidFeature || isValidFeatureCollection;
    });

    if (validFeatures.length === 0) {
      console.error('Only (multi)polygons are valid candidates for splitting');
      return;
    }

    const res = validFeatures
      .map((f) => handleSplitLayer(polyline, f))
      .filter((f): f is { oldLayer: LGeoJsonExt; newFeatures: PM.NewFeature[] } => !!f);

    if (res.length === 0) {
      alert('No selected feature was able to be split by the drawn line');
    }

    res.forEach((v) => map.fire('pm:split', { ...v, polyline }));
  };

  const handleSplitLayer = (
    polyline: Feature<LineString | MultiLineString>,
    feature: SelectedFeature
  ) => {
    const { id, layer } = feature;

    let geojson = layer.toGeoJSON(15) as Feature | FeatureCollection;

    //flatten collection
    if (geojson.type === 'FeatureCollection' && geojson.features.length === 1) {
      geojson = geojson.features[0];
    } else if (geojson.type === 'FeatureCollection' && geojson.features.length !== 1) {
      console.error("Can't split featurecollection");
      return;
    }

    console.log({ polyline, geojson });

    if (
      geojson.type !== 'Feature' ||
      (geojson.geometry.type !== 'Polygon' && geojson.geometry.type !== 'MultiPolygon')
    ) {
      console.error('Invalid geometry type. Only allow (multi)polygons.');
      return;
    }

    if (polyline.geometry.type !== 'LineString') {
      console.error('Invalid line type. Only allow LineString.');
      return;
    }

    const split = polygonSlice(geojson as Feature<Polygon>, polyline as Feature<LineString>);

    console.log({ split });

    if (split.length === 1) {
      return;
    }

    const newFeatures: L.PM.NewFeature[] = split.map((f) => {
      const l = L.geoJSON(f);

      l.addTo(map);

      return { feature: f as FeatureExt, layer: l };
    });

    layer.remove();

    console.log(newFeatures);

    return { oldLayer: layer, newFeatures };
  };

  const customControls: PM.CustomControlOptions[] = [
    {
      name: 'Merge',
      block: 'edit',
      title: 'Merge regions',
      disabled: false,
      className: 'leaflet-pm-icon-merge',
      actions: [
        {
          text: 'Merge selected regions',
          onClick: handleMerge,
        },
      ],
    },
    {
      name: 'Split',
      block: 'edit',
      title: 'Split region',
      disabled: false,
      className: 'leaflet-pm-icon-split',
    },
    {
      name: 'Simplify',
      block: 'custom',
      title: 'Simplify map',
      disabled: false,
      className: 'leaflet-pm-icon-simplify',
    },
  ];

  useEffect(() => {
    map.on('pm:merge', onMerge);
    map.on('pm:split', onSplit);

    return () => {
      map.off('pm:merge', onMerge);
      map.off('pm:split', onSplit);
    };
  }, [onMerge, onSplit]);

  return (
    <GeomanControls
      onMount={() => {
        const controls = map.pm.Toolbar.getControlOrder();

        customControls.forEach((c) => {
          if (!controls.includes(c.name)) {
            if (c.name === 'Split') {
              const res = map.pm.Toolbar.copyDrawControl('Line', c);
              //@ts-ignore
              const { drawInstance } = res;

              //copied from geoman src
              drawInstance._finishShape = function () {
                // if self intersection is not allowed, do not finish the shape!
                if (!this.options.allowSelfIntersection) {
                  this._handleSelfIntersection(false);

                  if (this._doesSelfIntersect) {
                    return;
                  }
                }

                // get coordinates
                const coords = this._layer.getLatLngs();

                // if there is only one coords, don't finish the shape!
                if (coords.length <= 1) {
                  return;
                }

                const polyline = L.polyline(coords, this.options.pathOptions).toGeoJSON(15);
                handleSplit(polyline);

                if (this.options.snappable) {
                  this._cleanupSnapping();
                }

                // disable drawing
                this.disable();
              };
            } else {
              map.pm.Toolbar.createCustomControl(c);
            }
          }
        });

        //editing PM.Edit.Line to allow for snapping
      }}
      options={{
        position: 'topright',
        drawRectangle: false,
        drawText: false,
        cutPolygon: false,
        editMode: false,
        rotateMode: false,
        dragMode: false,
        drawCircle: false,
        drawCircleMarker: false,
        drawMarker: false,
        drawControls: canEdit,
        editControls: canEdit,
        customControls: canEdit,
      }}
      onCreate={onCreate}
      onEdit={onEdit}
      onLayerRemove={onRemove}
      globalOptions={{
        continueDrawing: true,
        editable: false,
        allowEditing: canEdit,
      }}
      pathOptions={{
        color: 'red',
        weight: 1,
        fillColor: 'green',
      }}
      // eventDebugFn={(e) => console.log(e)}
    />
  );
};

export default MapControls;

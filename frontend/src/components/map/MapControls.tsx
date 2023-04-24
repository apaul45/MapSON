import { PM } from 'leaflet';
import { GeomanControls } from 'react-leaflet-geoman-v2';
import './MapControls.css';
import { useMap } from 'react-leaflet';
import { SelectedFeature } from './MapComponent';
import { Feature, FeatureCollection, MultiPolygon, Polygon } from 'geojson';
import * as turf from '@turf/turf';
import { useEffect } from 'react';
import { FeatureExt } from '../../types';
import L from 'leaflet';

declare module 'leaflet' {
  namespace PM {
    export type MergeEventHandler = (e: {
      newLayer: L.GeoJSON;
      newFeature: Feature;
      oldLayers: SelectedFeature[];
    }) => void;

    export type SplitEventHandler = (e: any) => void;
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
          onClick: () => {
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
              let f = v.layer.toGeoJSON() as FeatureExt | FeatureCollection;

              console.log({ f });

              //flatten feature collection with single value
              if (f.type === 'FeatureCollection' && f.features.length === 1) {
                f = f.features[0] as FeatureExt;
              }

              return f;
            });

            const validFeatures = geojsonFeatures.filter(
              (f) =>
                f.type === 'Feature' &&
                (f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon')
            ) as Feature<Polygon | MultiPolygon>[];

            if (validFeatures.length !== geojsonFeatures.length) {
              console.debug(geojsonFeatures);
              console.error('INVALID FEATURE SELECTED');
              return;
            }

            const union = validFeatures.reduce((prev, curr) => turf.union(prev, curr)!);

            if (union.geometry.type === 'MultiPolygon') {
              const allowNonContiguous = confirm(
                'This merge results in a non-contiguous polygon. Do you still want to continue?'
              );
              if (!allowNonContiguous) {
                return;
              }
            }

            features.forEach(({ layer }) => layer.remove());

            const newLayer = L.geoJSON(union).addTo(map);

            map.fire('pm:merge', { newLayer, newFeature: union, oldLayers: features });
          },
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
            map.pm.Toolbar.createCustomControl(c);
          }
        });
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

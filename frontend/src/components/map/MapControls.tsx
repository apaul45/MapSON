import { PM } from 'leaflet';
import { GeomanControls } from 'react-leaflet-geoman-v2';
import './MapControls.css';
import { useMap } from 'react-leaflet';
import { SelectedFeature } from './MapComponent';
import { Feature, MultiPolygon, Polygon } from 'geojson';
import * as turf from '@turf/turf';
import { useEffect } from 'react';

interface IMapControls {
  onCreate: PM.CreateEventHandler;
  onEdit: PM.EditEventHandler;
  onRemove: PM.RemoveEventHandler;
  onMerge: (e: { newLayer: L.GeoJSON; newFeature: Feature; oldLayers: SelectedFeature[] }) => void;
  canEdit: boolean;
  getSelectedFeatures: () => SelectedFeature[];
  addGeoJSONLayer: (feature: Feature) => L.GeoJSON;
}

const MapControls = ({
  onCreate,
  onEdit,
  onRemove,
  canEdit,
  getSelectedFeatures,
  addGeoJSONLayer,
  onMerge,
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
              ({ layer }) => !layer._pmTempLayer && (!layer.pm || !layer.pm.dragging())
            );

            if (!canMerge) {
              console.error('CANT MERGE REGIONS');
              return;
            }

            //convert to geojson

            const geojsonFeatures = features.map(
              (v) => v.layer.toGeoJSON(15) as unknown as Feature<Polygon | MultiPolygon>
            );

            const validFeatures = geojsonFeatures.every(
              (f) =>
                f.type === 'Feature' &&
                (f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon')
            );

            if (!validFeatures) {
              console.debug(geojsonFeatures);
              console.error('INVALID FEATURE SELECTED');
              return;
            }

            const union = geojsonFeatures.reduce((prev, curr) => turf.union(prev, curr)!);

            features.forEach(({ layer }) => layer.remove());

            const newLayer = addGeoJSONLayer(union);

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

    return () => {
      map.off('pm:merge', onMerge);
    };
  }, [onMerge]);

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
      eventDebugFn={(e) => console.log(e)}
    />
  );
};

export default MapControls;

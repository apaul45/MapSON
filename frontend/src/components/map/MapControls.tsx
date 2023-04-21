import { PM } from 'leaflet';
import { GeomanControls } from 'react-leaflet-geoman-v2';
import './MapControls.css';
import { useMap } from 'react-leaflet';
import { useEffect } from 'react';

interface IMapControls {
  onCreate?: PM.CreateEventHandler;
  onEdit?: PM.EditEventHandler;
  onRemove?: PM.RemoveEventHandler;
  canEdit: boolean;
}

const MapControls = ({ onCreate, onEdit, onRemove, canEdit }: IMapControls) => {
  const map = useMap();

  const defaultHandler = (e: any) => console.log(e);

  const customControls: PM.CustomControlOptions[] = [
    {
      name: 'Merge',
      block: 'edit',
      title: 'Merge regions',
      disabled: false,
      className: 'leaflet-pm-icon-merge',
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
      onCreate={onCreate ?? defaultHandler}
      onEdit={onEdit ?? defaultHandler}
      onLayerRemove={onRemove ?? defaultHandler}
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
      {...customControls}
    />
  );
};

export default MapControls;

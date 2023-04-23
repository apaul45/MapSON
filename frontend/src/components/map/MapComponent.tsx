import { useRef } from 'react';

import { GeoJSON, MapContainer, FeatureGroup, TileLayer } from 'react-leaflet';

import * as L from 'leaflet';
// @ts-ignore
import bbox from 'geojson-bbox';

import MapControls from './MapControls';
import { FeatureExt, LGeoJsonExt, Map } from '../../types';

import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

import { store } from '../../models';

export type SelectedFeature = { layer: LGeoJsonExt; id: any } | null;

const HOVERED = {
  fillColor: 'green',
  fillOpacity: 0.2,
  color: 'blue',
};

const IDLE = {
  fillColor: 'blue',
  fillOpacity: 0.2,
  color: 'blue',
};

const SELECTED = {
  fillColor: 'red',
  fillOpacity: 0.5,
  color: 'black',
};

const SELECTED_AND_HOVERED = {
  fillColor: 'teal',
  fillOpacity: 0.5,
  color: 'black',
};

const position: L.LatLngTuple = [37.335556, -122.009167];

interface IMapComponent extends Map {
  canEdit: boolean;
  setSelectedFeature: Function;
}

const MapComponent = ({ features: geoJSON, canEdit, setSelectedFeature }: IMapComponent) => {
  const { mapStore } = store.dispatch;

  const fg = useRef<LGeoJsonExt>(null);

  //second one is the most recently selected
  const selectedFeatures = useRef<SelectedFeature[]>([]);

  const editLayer = useRef<SelectedFeature>(null);

  const isSelected = (id: any) => {
    return selectedFeatures.current[0]?.id === id || selectedFeatures.current[1]?.id === id;
  };

  const selectFeature = (id: any, layer: LGeoJsonExt): SelectedFeature => {
    let res = null;

    if (selectedFeatures.current.length >= 2) {
      //pop front
      const popped = selectedFeatures.current.shift();

      if (popped && popped.id !== id) {
        res = popped;
      }
    }

    let featureIndex = mapRef.current?.features.features.findIndex((feature) => feature._id === id);
    if (featureIndex !== undefined && featureIndex >= 0) {
      if (!('feature' in layer)) {
        // @ts-ignore
        layer.feature = mapRef.current?.features.features[featureIndex];
      } else {
        // @ts-ignore
        layer.feature.properties = mapRef.current?.features.features[featureIndex].properties;
      }
    }

    selectedFeatures.current.push({ layer, id });
    setSelectedFeature({ layer, id });

    return res;
  };

  const unselectFeature = (id: any) => {
    if (selectedFeatures.current[0]?.id === id) {
      selectedFeatures.current.shift();
    } else if (selectedFeatures.current[1]?.id === id) {
      selectedFeatures.current = [selectedFeatures.current[0]];
    }

    setSelectedFeature(selectedFeatures.current.at(-1) ?? null);
  };

  // NOTE: only call this function in leaflet event handlers,
  // OR when it is guaranteed that the `FeatureGroup` ref will be set
  const getLayerID = (layer: LGeoJsonExt) => {
    return layer._id;
  };

  const onEachFeature = (feature: FeatureExt, layer: LGeoJsonExt) => {
    if (layer._isConfigured) {
      return;
    }

    layer._id = feature._id;

    if (feature?.properties?.name) {
      layer.bindPopup(feature.properties.name);
    } else {
      layer.bindPopup(feature._id);
    }

    layer.pm.disable();

    const mouseover: L.LeafletMouseEventHandlerFn = (e) => {
      const id = getLayerID(layer)!;

      if (isSelected(id)) {
        e.target.setStyle(SELECTED_AND_HOVERED);
      } else {
        e.target.setStyle(HOVERED);
      }

      layer.openPopup();
    };

    const mouseout: L.LeafletMouseEventHandlerFn = (e) => {
      const id = getLayerID(layer)!;

      if (isSelected(id)) {
        e.target.setStyle(SELECTED);
      } else {
        e.target.setStyle(IDLE);
      }

      layer.closePopup();
    };

    const click: L.LeafletMouseEventHandlerFn = (e) => {
      const id = getLayerID(layer)!;

      if (isSelected(id)) {
        unselectFeature(id);
        e.target.setStyle(IDLE);
      } else {
        selectFeature(id, e.target)?.layer.setStyle(IDLE);
        e.target.setStyle(SELECTED);
      }
    };

    const dblclick: L.LeafletMouseEventHandlerFn = (e) => {
      const id = getLayerID(layer)!;

      const eq = editLayer.current?.id === id;

      editLayer.current?.layer.pm.disable();
      editLayer.current = null;

      if (!eq) {
        editLayer.current = { layer, id };
        layer.pm.enable();
      }
    };

    layer.on('mouseover', mouseover);

    layer.on('mouseout', mouseout);

    layer.on('click', click);

    if (canEdit) {
      layer.on('dblclick', dblclick);
    }

    layer._isConfigured = true;
  };

  return (
    <div className="w-screen h-[calc(100vh-64px)]">
      <MapContainer
        style={{ width: '100%', minHeight: '100%', height: '100%', zIndex: 0 }}
        center={position}
        zoom={4}
        markerZoomAnimation={false}
        doubleClickZoom={false}
        ref={(ref) =>
          window.addEventListener('resize', () => {
            ref?.invalidateSize();
          })
        }
        id="map-container"
        //TODO: dynamically check if we need to use L.SVG vs L.Canvas depending on browser
        renderer={new L.Canvas({ tolerance: 3 })}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <FeatureGroup ref={fg}>
          <MapControls
            onCreate={async (e) => {
              const layer = e.layer as L.GeoJSON;

              const feature = layer.toGeoJSON() as FeatureExt;
              const id = await mapStore.createFeature(feature);

              if (!id) {
                console.error('Failed to create feature');
                layer.remove();
                return;
              }

              feature._id = id;

              onEachFeature(feature, layer as LGeoJsonExt);
            }}
            onEdit={async (e) => {
              const layer = e.layer as L.GeoJSON;

              const feature = layer.toGeoJSON();
              //@ts-ignore
              await mapStore.updateFeature({ id: layer._id, feature });
            }}
            onRemove={async (e) => {
              const layer = e.layer as LGeoJsonExt;

              await mapStore.deleteFeature(layer._id);
            }}
            canEdit={canEdit}
          />
          <GeoJSON
            data={geoJSON}
            style={(f) => {
              const feat = f as FeatureExt;
              let base;

              if (isSelected(feat?._id)) {
                base = SELECTED;
              } else {
                base = IDLE;
              }

              return { ...base, weight: 2 };
            }}
            /* @ts-ignore */
            // Fine to ignore since we are guaranteeing the extensions to L.GeoJSON
            onEachFeature={onEachFeature}
            ref={fg}
          />
        </FeatureGroup>
      </MapContainer>
    </div>
  );
};

export default MapComponent;

import { useEffect, useCallback, useRef } from 'react';

import { GeoJSON, MapContainer, TileLayer } from 'react-leaflet';

import * as L from 'leaflet';
// @ts-ignore
import bbox from 'geojson-bbox';

import MapControls from './MapControls';
import { FeatureExt, LGeoJsonExt, Map } from '../../types';

import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

import { RootState, store } from '../../models';
import { useSelector } from 'react-redux';

import * as turf from '@turf/turf';

export type SelectedFeature = { layer: LGeoJsonExt; id: any };

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
  const map = useSelector((state: RootState) => state.mapStore.currentMap);
  const mapRef = useRef(map);

  useEffect(() => {
    mapRef.current = map;
  }, [map]);

  //second one is the most recently selected
  const selectedFeatures = useRef<SelectedFeature[]>([]);

  const editLayer = useRef<SelectedFeature | null>(null);

  const isSelected = (id: any) => {
    return selectedFeatures.current.some((f) => f.id === id);
  };

  const selectFeature = (id: any, layer: LGeoJsonExt): SelectedFeature | undefined => {
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

    if (selectedFeatures.current.length > 2) {
      //pop front
      const res = selectedFeatures.current.shift();
      if (res && res.id) {
        return res;
      }
    }
  };

  const unselectFeature = (id: any) => {
    selectedFeatures.current = selectedFeatures.current.filter((v) => v.id !== id);
    setSelectedFeature(selectedFeatures.current.at(-1) ?? null);
  };

  // NOTE: only call this function in leaflet event handlers,
  // OR when it is guaranteed that the `FeatureGroup` ref will be set
  const getLayerID = (layer: LGeoJsonExt) => {
    return layer._id;
  };

  const getSelectedFeatures = () => {
    return selectedFeatures.current;
  };

  const resetSelectedFeature = () => {
    for (const f of selectedFeatures.current) {
      const { id, layer } = f;
      unselectFeature(id);
      layer.setStyle(IDLE);
    }
  };

  const onEachFeature = useCallback(
    (feature: FeatureExt, layer: LGeoJsonExt) => {
      if (layer._isConfigured) {
        return;
      }

      layer._id = feature._id;

      feature.properties?.name && layer.bindPopup(feature.properties?.name);

      layer.pm.disable();

      const mouseover: L.LeafletMouseEventHandlerFn = (e) => {
        const id = getLayerID(layer)!;

        if (isSelected(id)) {
          layer.setStyle(SELECTED_AND_HOVERED);
        } else {
          layer.setStyle(HOVERED);
        }

        layer.openPopup();
      };

      const mouseout: L.LeafletMouseEventHandlerFn = (e) => {
        const id = getLayerID(layer)!;

        if (isSelected(id)) {
          layer.setStyle(SELECTED);
        } else {
          layer.setStyle(IDLE);
        }

        layer.closePopup();
      };

      const click: L.LeafletMouseEventHandlerFn = (e) => {
        const id = getLayerID(layer)!;

        if (isSelected(id)) {
          unselectFeature(id);
          layer.setStyle(IDLE);
        } else {
          selectFeature(id, layer)?.layer.setStyle(IDLE);
          layer.setStyle(SELECTED);
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

      layer.getPopup()?.on('mouseover', mouseover);
      layer.getPopup()?.on('click', click);
      layer.getPopup()?.on('dblclick', dblclick);

      layer.on('mouseover', mouseover);

      layer.on('mouseout', mouseout);

      layer.on('click', click);

      if (canEdit) {
        layer.on('dblclick', dblclick);
      }

      layer._isConfigured = true;
    },
    [canEdit]
  );

  useEffect(() => {
    return () => {
      editLayer.current?.layer.pm.disable();
    };
  }, []);
  let bounds = undefined;
  if (geoJSON.features.length > 0) {
    const extent = bbox(geoJSON);
    bounds = [
      [extent[1], extent[0]],
      [extent[3], extent[2]],
    ];
  }

  return (
    <div className="w-screen h-[calc(100vh-64px)]">
      <MapContainer
        style={{ width: '100%', minHeight: '100%', height: '100%', zIndex: 0 }}
        zoom={4}
        markerZoomAnimation={false}
        center={bounds === undefined ? position : undefined}
        doubleClickZoom={false}
        id="map-container"
        //TODO: dynamically check if we need to use L.SVG vs L.Canvas depending on browser
        renderer={new L.Canvas({ tolerance: 3 })}
        //@ts-ignore
        bounds={bounds}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

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
        >
          <MapControls
            onCreate={async (e) => {
              console.log('CREATED');
              const layer = e.layer as LGeoJsonExt;

              const feature = layer.toGeoJSON() as FeatureExt;
              const id = await mapStore.createFeature(feature);

              if (!id) {
                console.error('Failed to create feature');
                return;
              }

              feature._id = id;

              onEachFeature(feature, layer as LGeoJsonExt);
            }}
            onEdit={async (e) => {
              console.log('EDITED');

              const layer = e.layer as L.GeoJSON;

              const feature = layer.toGeoJSON();
              //@ts-ignore
              await mapStore.updateFeature({ id: layer._id, feature });
            }}
            onRemove={async (e) => {
              console.log('REMOVED');

              const layer = e.layer as LGeoJsonExt;

              await mapStore.deleteFeature(layer._id);
            }}
            getSelectedFeatures={getSelectedFeatures}
            onMerge={async (e) => {
              console.log('MERGED');
              const { oldLayers, newLayer, newFeature } = e;

              await Promise.all(
                oldLayers.map(async (l) => {
                  await mapStore.deleteFeature(l.layer._id);
                })
              );

              const layer = newLayer as LGeoJsonExt;
              const feature = newFeature as FeatureExt;

              const id = await mapStore.createFeature(feature);

              if (!id) {
                console.error('Failed to create feature');
                return;
              }

              feature._id = id;

              onEachFeature(feature, layer as LGeoJsonExt);
              resetSelectedFeature();
            }}
            onSplit={() => {}}
            canEdit={canEdit}
          />
        </GeoJSON>
      </MapContainer>
    </div>
  );
};

export default MapComponent;

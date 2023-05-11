import { useEffect, useCallback, useRef } from 'react';

import { GeoJSON, MapContainer, TileLayer } from 'react-leaflet';

import * as L from 'leaflet';
// @ts-ignore
import bbox from 'geojson-bbox';

import MapControls from './MapControls';
import { FeatureExt, LGeoJsonExt, Map, MongoData } from '../../types';

import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

import { RootState, store } from '../../models';

import { connect, joinRoom, leaveRoom } from '../../live-collab/socket';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { MapComponentCallbacks } from '../../transactions/map/common';
import jsTPS, { Transaction } from '../../utils/jsTPS';
import { CreateFeature } from '../../transactions/map/CreateFeature';
import { RemoveFeature } from '../../transactions/map/RemoveFeature';
import { EditFeature } from '../../transactions/map/EditFeature';
import { extendGeomanLayer } from '../../utils/geomanExtend';
import { MultipleTransactions } from '../../transactions/map/MultipleTransactions';
import { MergeFeatures } from '../../transactions/map/MergeFeatures';
import { cloneDeep } from 'lodash';
import { SplitFeature } from '../../transactions/map/SplitFeature';
import { InputAddedLayer } from '../../transactions/map/CreateAndRemoveMultipleFeatures';

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

const getCurrentColor = (feature: FeatureExt) =>
  feature.properties?.color
    ? {
        fillColor: feature.properties.color as string,
        fillOpacity: 0.2,
        color: feature.properties.color as string,
      }
    : IDLE;

const position: L.LatLngTuple = [37.335556, -122.009167];

interface IMapComponent extends Map {
  canEdit: boolean;
  setSelectedFeature: Function;
}

const MapComponent = ({ features: geoJSON, canEdit, setSelectedFeature }: IMapComponent) => {
  const username = useSelector((state: RootState) => state.user.currentUser?.username);
  const { mapStore } = store.dispatch;
  const map = useSelector((state: RootState) => state.mapStore.currentMap);
  const leafletMap = useRef<L.Map>(null!);
  const geojsonLayer = useRef<L.GeoJSON>(null!);
  const transactions = useRef(new jsTPS(leafletMap));
  const mapRef = useRef(geoJSON);

  const { id } = useParams();

  // TODO: If unpublished, prevent user from accessing unless they were granted access
  useEffect(() => {
    if (username) {
      connect();
      joinRoom(username, id as unknown as string);
    }

    //Return function fires on unmount: disconnect when leaving project
    return () => {
      if (username) {
        leaveRoom(username, id as unknown as string);
      }
    };
  }, []);

  useEffect(() => {
    mapRef.current = geoJSON;
  }, [geoJSON]);

  //second one is the most recently selected
  const selectedFeatures = useRef<SelectedFeature[]>([]);

  const editLayer = useRef<SelectedFeature | null>(null);

  const isSelected = (id: any) => {
    return selectedFeatures.current.some((f) => f.id === id);
  };

  const selectFeature = (id: any, layer: LGeoJsonExt): SelectedFeature | undefined => {
    const featureIndex = mapRef.current?.features.findIndex((feature) => feature._id === id);
    if (featureIndex !== undefined && featureIndex >= 0) {
      if (!('feature' in layer)) {
        // @ts-ignore
        layer.feature = mapRef.current?.features[featureIndex];
      } else {
        // @ts-ignore
        layer.feature.properties = mapRef.current?.features[featureIndex].properties;
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
      layer.setStyle(getCurrentColor(f.layer.feature));
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
          layer.setStyle(getCurrentColor(layer.feature));
        }

        layer.closePopup();
      };

      const click: L.LeafletMouseEventHandlerFn = (e) => {
        //ignore if meta is pressed with it
        if (e.originalEvent.metaKey) {
          return;
        }

        const id = getLayerID(layer)!;

        if (isSelected(id)) {
          unselectFeature(id);
          layer.setStyle(getCurrentColor(layer.feature));
        } else {
          selectFeature(id, layer)?.layer.setStyle(getCurrentColor(layer.feature));
          layer.setStyle(SELECTED);
        }
      };

      const dblclick: L.LeafletMouseEventHandlerFn = (e) => {
        //ignore if meta is pressed with it
        if (e.originalEvent.metaKey) {
          return;
        }

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

      extendGeomanLayer(layer.pm);
    },
    [canEdit]
  );

  let bounds = undefined;
  if (geoJSON.features.length > 0) {
    const extent = bbox(geoJSON);
    bounds = [
      [extent[1], extent[0]],
      [extent[3], extent[2]],
    ];
  }

  const getLayerById = (id: string) => {
    //@ts-ignore
    const layers = Object.values(leafletMap.current._layers) as LGeoJsonExt[];
    console.log(layers);

    return layers.find((ly) => ly._id === id);
  };

  const getFeatureById = (id: string) => {
    console.log({ type: 'getFeaturebyId', map, id });

    if (!map) {
      return;
    }

    const featureIndex = map.features.features.findIndex((v) => (v as FeatureExt)._id === id);
    if (featureIndex === -1) {
      return undefined;
    }

    const feature = map.features.features[featureIndex] as FeatureExt;

    return { featureIndex, feature: cloneDeep(feature) };
  };

  const getFeatureByIndex = (idx: number | undefined) => {
    if (idx === undefined) {
      return;
    }

    const feature = mapStore.getFeatureByIndex(idx);

    console.log({
      type: 'getFeatureByIndex',
      feature,
      idx,
      features: JSON.stringify(map?.features.features.map((v) => v._id)),
    });

    return feature;
  };

  const getGeoJSONLayer = () => {
    return geojsonLayer.current;
  };

  const callbacks: MapComponentCallbacks = {
    isSelected,
    selectFeature,
    unselectFeature,
    getLayerID,
    getSelectedFeatures,
    resetSelectedFeature,
    onEachFeature,
    getLayerById,
    getFeatureById,
    getFeatureByIndex,
    getGeoJSONLayer,
    onCreate: async (e) =>
      await transactions.current.addTransaction(
        new CreateFeature(e.layer as LGeoJsonExt),
        leafletMap.current!,
        callbacks
      ),
    onEdit: async (e) => {
      const { layer, affectedLayers } = e as typeof e & { affectedLayers: [L.Layer, L.LatLng][] };
      // case for vertex pinning

      const { feature, featureIndex } = getFeatureById((layer as any & MongoData)._id)!;
      let layerTransaction: Transaction = new EditFeature(
        layer as unknown as L.Polygon & MongoData,
        feature,
        featureIndex
      );
      if (affectedLayers?.length > 0) {
        layerTransaction = new MultipleTransactions([
          layerTransaction,
          ...affectedLayers.map(([aLayer, _]) => {
            const { feature: iFeature, featureIndex: iFeatureIndex } = getFeatureById(
              (aLayer as any & MongoData)._id
            )!;

            return new EditFeature(
              aLayer as unknown as L.Polygon & MongoData,
              iFeature,
              iFeatureIndex
            );
          }),
        ]);
      }
      await transactions.current.addTransaction(layerTransaction, leafletMap.current!, callbacks);
    },

    onRemove: async (e) => {
      const { layer } = e;
      const { feature, featureIndex } = getFeatureById((layer as LGeoJsonExt)._id)!;

      await transactions.current.addTransaction(
        new RemoveFeature(layer as LGeoJsonExt, feature, featureIndex),
        leafletMap.current!,
        callbacks
      );
    },
  };

  // did it this way so handlers can be passed to transactions

  const onCreate = callbacks.onCreate;
  const onEdit = callbacks.onEdit;
  const onRemove = callbacks.onRemove;

  transactions.current.callbacks = callbacks;

  const onMerge: L.PM.MergeEventHandler = async (e) =>
    await transactions.current.addTransaction(
      new MergeFeatures(
        { layer: e.newLayer as LGeoJsonExt },
        e.oldLayers.map((ol) => {
          const { feature, featureIndex } = getFeatureById(ol.layer._id)!;
          return { feature, featureIndex, layer: ol.layer };
        }),
        callbacks
      ),
      leafletMap.current!,
      callbacks
    );

  const onSplit: L.PM.SplitEventHandler = async (e) => {
    const { feature, featureIndex } = getFeatureById(e.oldLayer._id)!;

    await transactions.current.addTransaction(
      new SplitFeature(
        e.newFeatures as InputAddedLayer[],
        { feature, featureIndex, layer: e.oldLayer },
        callbacks
      ),
      leafletMap.current!,
      callbacks
    );
  };

  const undo = () => {
    transactions.current.undoTransaction();
  };

  const redo = () => {
    transactions.current.doTransaction();
  };

  useEffect(() => {
    transactions.current.clearAllTransactions();
  }, [map]);

  useEffect(() => {
    return () => {
      editLayer.current?.layer.pm.disable();
    };
  }, []);

  useEffect(() => {
    const keydownHandler = (ev: KeyboardEvent) => {
      if (ev.key.toLowerCase() === 'z' && ev.ctrlKey === true) {
        if (ev.shiftKey === true) {
          redo();
        } else {
          undo();
        }
      }
    };
    document.addEventListener('keydown', keydownHandler);

    return () => {
      document.removeEventListener('keydown', keydownHandler);
    };
  });

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
        renderer={new L.SVG({ tolerance: 3 })}
        //@ts-ignore
        bounds={bounds}
        ref={leafletMap}
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
              base = getCurrentColor(feat);
            }

            return { ...base, weight: 2 };
          }}
          /* @ts-ignore */
          // Fine to ignore since we are guaranteeing the extensions to L.GeoJSON
          onEachFeature={onEachFeature}
          ref={geojsonLayer}
        >
          <MapControls
            onCreate={onCreate}
            onEdit={onEdit}
            onRemove={onRemove}
            getSelectedFeatures={getSelectedFeatures}
            onMerge={onMerge}
            onSplit={onSplit}
            canEdit={canEdit}
          />
        </GeoJSON>
      </MapContainer>
    </div>
  );
};

export default MapComponent;

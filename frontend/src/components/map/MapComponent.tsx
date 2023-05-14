import { useEffect, useCallback, useRef, useLayoutEffect } from 'react';

import { GeoJSON, MapContainer, TileLayer, useMap } from 'react-leaflet';

import * as L from 'leaflet';
// @ts-ignore
import bbox from 'geojson-bbox';

import MapControls from './MapControls';
import { FeatureExt, LGeoJsonExt, Map, MongoData } from '../../types';

import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

import { RootState, store } from '../../models';

import {
  connect,
  disconnect,
  emitMousePosition,
  emitRedo,
  emitTransaction,
  emitUndo,
  joinRoom,
  leaveRoom,
  socket,
} from '../../live-collab/socket';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  MapComponentCallbacks,
  SerializedTransactionTypes,
  deserializer,
} from '../../transactions/map/common';
import jsTPS, { Transaction } from '../../utils/jsTPS';
import { CreateFeature } from '../../transactions/map/CreateFeature';
import { RemoveFeature } from '../../transactions/map/RemoveFeature';
import { EditFeature } from '../../transactions/map/EditFeature';
import { extendGeomanLayer } from '../../utils/geomanExtend';
import {
  MultipleTransactions,
  TransactionTypes,
} from '../../transactions/map/MultipleTransactions';
import { MergeFeatures } from '../../transactions/map/MergeFeatures';
import { cloneDeep } from 'lodash';
import { SplitFeature } from '../../transactions/map/SplitFeature';
import { InputAddedLayer } from '../../transactions/map/CreateAndRemoveMultipleFeatures';
import FileSaver from 'file-saver';
import domtoimage from 'dom-to-image';

export type SelectedFeature = { layer: LGeoJsonExt; id: any };

const HOVERED = {
  fillColor: 'green',
  fillOpacity: 0.2,
  color: 'blue',
  weight: 2,
};

const IDLE = {
  fillColor: 'blue',
  fillOpacity: 0.2,
  color: 'blue',
  weight: 2,
};

export const SELECTED = {
  fillColor: 'red',
  fillOpacity: 0.5,
  color: 'black',
  weight: 2,
};

const SELECTED_AND_HOVERED = {
  fillColor: 'teal',
  fillOpacity: 0.5,
  color: 'black',
  weight: 2,
};

const getCurrentColor = (feature: FeatureExt) =>
  feature?.properties?.color
    ? {
        fillColor: feature.properties.color as string,
        fillOpacity: 0.2,
        color: feature.properties.color as string,
        weight: 2,
      }
    : IDLE;

const position: L.LatLngTuple = [37.335556, -122.009167];

interface Props extends Map {
  canEdit: boolean;
  setSelectedFeature: Function;
  setLeafletMap: Function;
}

const MapComponent = ({ features: geoJSON, canEdit, setSelectedFeature, setLeafletMap }: Props) => {
  const username = useSelector((state: RootState) => state.user.currentUser?.username);
  const map = useSelector((state: RootState) => state.mapStore.currentMap);

  const { mapStore } = store.dispatch;

  const leafletMap = useRef<L.Map>(null!);
  const geojsonLayer = useRef<L.GeoJSON>(null!);
  const transactions = useRef(new jsTPS(leafletMap));
  const mapRef = useRef(geoJSON);
  const callbacks = useRef<MapComponentCallbacks>(null!);

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoggedIn = async () => {
      const username = await store.dispatch.user.check();

      //If guest or uninvited user tries to access unpublished list, redirect them
      //@ts-ignore
      if (!map?.published.isPublished && !map?.userAccess.includes(username)) {
        console.log(map);
        console.log(username);
        //@ts-ignore
        if (map?.owner.username !== username) {
          navigate('/');
          return;
        }
      }

      console.log('reached connection');
      connect();
      joinRoom(username, id!, leafletMap, callbacks); //joinRoom will send empty username for guest
    };

    checkLoggedIn();

    //Return function fires on unmount: disconnect or leave room when leaving project
    return () => {
      //Disconnect guest for now, may make it only leave room in the future
      if (socket.connected) {
        if (!username) {
          disconnect();
          return;
        }

        leaveRoom(id!);
      }
    };
  }, [username]);

  useEffect(() => {
    mapRef.current = geoJSON;
  }, [geoJSON]);

  useLayoutEffect(() => {
    setLeafletMap(leafletMap.current);
  }, [leafletMap.current]);

  useEffect(() => {
    if (leafletMap.current) {
      leafletMap.current.canEdit = canEdit;
    }
  }, [canEdit]);

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

  const onEachFeature = (feature: FeatureExt, layer: LGeoJsonExt) => {
    if (layer._isConfigured) {
      return;
    }

    layer._id = feature._id;

    feature.properties?.name && layer.bindPopup(feature.properties?.name, { keepInView: false });

    layer.pm.disable();

    layer.setStyle(getCurrentColor(layer.feature));

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
      //ignore if meta is pressed with it or if we cant edit
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
  };

  let bounds: any = undefined;
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

  const getTransactions = () => {
    return transactions.current;
  };

  const applyPeerTransaction = (t: SerializedTransactionTypes) => {
    transactions.current.addTransaction(
      deserializer(t, callbacks.current),
      leafletMap.current,
      callbacks.current,
      true
    );
  };

  const undo = async (
    fromSocket: boolean = false,
    peerArtifacts: Object | undefined = undefined
  ) => {
    const res = await transactions.current.undoTransaction(fromSocket, peerArtifacts);
    if (fromSocket !== true) {
      emitUndo(id!, res ?? undefined);
    }
  };

  const redo = async (
    fromSocket: boolean = false,
    peerArtifacts: Object | undefined = undefined
  ) => {
    const res = await transactions.current.doTransaction(fromSocket);

    if (fromSocket !== true) {
      emitRedo(id!, res ?? undefined);
    }
  };

  callbacks.current = {
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
    getTransactions,
    applyPeerTransaction,
    undo,
    redo,
    onCreate: async (e) => {
      const transaction = new CreateFeature(e.layer as LGeoJsonExt);

      await transactions.current.addTransaction(
        transaction,
        leafletMap.current!,
        callbacks.current!
      );

      emitTransaction(id!, transaction);

      //saveScreenshot();
    },
    onEdit: async (e) => {
      const { layer, affectedLayers } = e as typeof e & { affectedLayers: [L.Layer, L.LatLng][] };
      // case for vertex pinning

      const { feature, featureIndex } = getFeatureById((layer as any & MongoData)._id)!;
      let layerTransaction: TransactionTypes = new EditFeature(
        feature,
        (layer as LGeoJsonExt).toGeoJSON(15) as FeatureExt,
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
              iFeature,
              (aLayer as LGeoJsonExt).toGeoJSON(15) as FeatureExt,
              iFeatureIndex
            );
          }),
        ]);
      }
      await transactions.current.addTransaction(
        layerTransaction,
        leafletMap.current!,
        callbacks.current!
      );

      emitTransaction(id!, layerTransaction);
    },

    onRemove: async (e) => {
      const { layer } = e;
      const { feature, featureIndex } = getFeatureById((layer as LGeoJsonExt)._id)!;

      const transaction = new RemoveFeature(layer as LGeoJsonExt, feature, featureIndex);
      await transactions.current.addTransaction(
        transaction,
        leafletMap.current!,
        callbacks.current!
      );
      emitTransaction(id!, transaction);
    },
  };

  // did it this way so handlers can be passed to transactions

  const onCreate = callbacks.current.onCreate;
  const onEdit = callbacks.current.onEdit;
  const onRemove = callbacks.current.onRemove;

  transactions.current.callbacks = callbacks.current;

  const onMerge: L.PM.MergeEventHandler = async (e) => {
    const transaction = new MergeFeatures(
      { layer: e.newLayer as LGeoJsonExt },
      e.oldLayers.map((ol) => {
        const { feature, featureIndex } = getFeatureById(ol.layer._id)!;
        return { feature, featureIndex, layer: ol.layer };
      }),
      callbacks.current!
    );
    await transactions.current.addTransaction(transaction, leafletMap.current!, callbacks.current!);
    emitTransaction(id!, transaction);
  };

  const onSplit: L.PM.SplitEventHandler = async (e) => {
    const { feature, featureIndex } = getFeatureById(e.oldLayer._id)!;
    const transaction = new SplitFeature(
      e.newFeatures as InputAddedLayer[],
      { feature, featureIndex, layer: e.oldLayer },
      callbacks.current!
    );

    await transactions.current.addTransaction(transaction, leafletMap.current!, callbacks.current!);
    emitTransaction(id!, transaction);
  };

  const onMouseMove: L.LeafletMouseEventHandlerFn = (e) => {
    if (id && username) {
      emitMousePosition(id, { lat: e.latlng.lat, lng: e.latlng.lng });
    }
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
    const keydownHandler = async (ev: KeyboardEvent) => {
      if (ev.key.toLowerCase() === 'z' && ev.ctrlKey === true) {
        if (ev.shiftKey === true) {
          await redo(false);
        } else {
          await undo(false);
        }
      }
    };
    document.addEventListener('keydown', keydownHandler);

    return () => {
      document.removeEventListener('keydown', keydownHandler);
    };
  });

  return (
    <>
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
          <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png" />

          <GeoJSON
            data={geoJSON}
            style={(f) => {
              const feat = f as FeatureExt;
              if (isSelected(feat?._id)) {
                return SELECTED;
              } else {
                return getCurrentColor(feat);
              }
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
              onMouseMove={onMouseMove}
            />
          </GeoJSON>
        </MapContainer>
      </div>
      <div id="screenshot-map"></div>
    </>
  );
};

export default MapComponent;

import { useEffect, useRef, useState } from "react";

import { Feature, type FeatureCollection } from "geojson";
import { GeoJSON, MapContainer, FeatureGroup, TileLayer } from "react-leaflet";

import * as L from "leaflet";

import MapControls from "./MapControls";

import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

import { v4 as uuidv4 } from "uuid";
import { Map } from "../types";

type SelectedFeature = { layer: L.GeoJSON; id: number } | null;

const HOVERED = {
  fillColor: "green",
  fillOpacity: 0.2,
};

const IDLE = {
  fillColor: "red",
  fillOpacity: 0.2,
};

const SELECTED = {
  fillColor: "blue",
  fillOpacity: 0.2,
};

const position: L.LatLngTuple = [37.335556, -122.009167];

const MapComponent = ({ features }: Map) => {
  const [key, setKey] = useState(uuidv4());
  const fg = useRef<L.GeoJSON>(null);
  const geoJSON: FeatureCollection = {
    type: "FeatureCollection",
    features: features ?? [],
  };
  const selectedFeatures = useRef<[SelectedFeature, SelectedFeature]>([
    null,
    null,
  ]);

  const editLayer = useRef<SelectedFeature>(null);

  useEffect(() => {
    setKey(uuidv4());
  }, []);

  const isSelected = (id: number) => {
    return (
      selectedFeatures.current[0]?.id === id ||
      selectedFeatures.current[1]?.id === id
    );
  };

  const selectFeature = (id: number, layer: L.GeoJSON): SelectedFeature => {
    if (isSelected(id)) {
      return null;
    }

    const res = selectedFeatures.current[0];
    selectedFeatures.current[0] = selectedFeatures.current[1];
    selectedFeatures.current[1] = { layer, id };

    return res;
  };

  const unselectFeature = (id: number) => {
    if (selectedFeatures.current[0]?.id === id) {
      selectedFeatures.current[0] = selectedFeatures.current[1];
      selectedFeatures.current[1] = null;
    } else if (selectedFeatures.current[1]?.id === id) {
      selectedFeatures.current[1] = null;
    }
  };

  // NOTE: only call this function in leaflet event handlers,
  // OR when it is guaranteed that the `FeatureGroup` ref will be set
  const getLayerID = (layer: L.GeoJSON) => {
    return fg.current?.getLayerId(layer);
  };

  const onEachFeature = (country: Feature | null, layer: L.GeoJSON) => {
    if (country) {
      layer.bindPopup(country.properties?.name);
    }

    layer.pm.disable();

    const mouseover: L.LeafletMouseEventHandlerFn = (e) => {
      e.target.setStyle(HOVERED);

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

    layer.on("mouseover", mouseover);

    layer.on("mouseout", mouseout);

    layer.on("click", click);
    layer.on("dblclick", dblclick);
  };

  return (
    <div className="map">
      <div>
        <MapContainer
          style={{ width: "100%", height: "75vh" }}
          center={position}
          zoom={4}
          markerZoomAnimation={false}
          doubleClickZoom={false}
          key={key}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FeatureGroup ref={fg}>
            <MapControls
              onCreate={(e) => {
                console.log(e);
                onEachFeature(null, e.layer as L.GeoJSON);
              }}
            />

            <GeoJSON
              data={geoJSON}
              style={{
                fillColor: "red",
                fillOpacity: 0.15,
                color: "blue",
                weight: 1,
              }}
              onEachFeature={onEachFeature}
              ref={fg}
            />
          </FeatureGroup>
        </MapContainer>
      </div>
    </div>
  );
};

export default MapComponent;

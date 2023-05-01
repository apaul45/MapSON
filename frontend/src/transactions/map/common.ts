import { SelectedFeature } from '../../components/map/MapComponent';
import { FeatureExt, LGeoJsonExt } from '../../types';

import { PM } from 'leaflet';

export interface MapComponentCallbacks {
  isSelected: (id: any) => boolean;
  selectFeature: (id: any, layer: LGeoJsonExt) => SelectedFeature | undefined;
  unselectFeature: (id: any) => void;
  getLayerID: (layer: LGeoJsonExt) => string;
  getSelectedFeatures: () => SelectedFeature[];
  resetSelectedFeature: () => void;
  onEachFeature: (feature: FeatureExt, layer: LGeoJsonExt) => void;
  getLayerById: (id: string) => L.Polygon | LGeoJsonExt | undefined;
  getFeatureById: (id: string) => { featureIndex: number; feature: FeatureExt } | undefined;
  getFeatureByIndex: (idx: number) => FeatureExt | undefined;
  getGeoJSONLayer: () => L.GeoJSON;
  onCreate: PM.CreateEventHandler;
  onEdit: PM.EditEventHandler;
  onRemove: PM.RemoveEventHandler;
}

export const extractFeature = (layer: LGeoJsonExt | L.Polygon) => {
  let geojson = layer.toGeoJSON(15);

  if (geojson.type === 'FeatureCollection') {
    return geojson.features[0] as FeatureExt;
  }

  return geojson as FeatureExt;
};

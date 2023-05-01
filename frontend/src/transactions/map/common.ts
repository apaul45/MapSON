import { SelectedFeature } from '../../components/map/MapComponent';
import { FeatureExt, LGeoJsonExt } from '../../types';

export interface MapComponentCallbacks {
  isSelected: (id: any) => boolean;
  selectFeature: (id: any, layer: LGeoJsonExt) => SelectedFeature | undefined;
  unselectFeature: (id: any) => void;
  getLayerID: (layer: LGeoJsonExt) => string;
  getSelectedFeatures: () => SelectedFeature[];
  resetSelectedFeature: () => void;
  onEachFeature: (feature: FeatureExt, layer: LGeoJsonExt) => void;
}

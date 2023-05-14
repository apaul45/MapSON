import React, { useEffect, useState } from 'react';
import MapComponent, { HOVERED, IDLE } from '../map/MapComponent';
import { useSelector } from 'react-redux';
import { RootState, store } from '../../models';
import { PulseLoader } from 'react-spinners';
import { FeatureExt, LGeoJsonExt, Map } from '../../types';
import {
  Dialog,
  DialogHeader,
  DialogBody,
  Slider,
  Button,
  ButtonGroup,
} from '@material-tailwind/react';

import { FeatureCollection } from 'geojson';
import L from 'leaflet';
import { simplifyGeojson } from '../../utils/simplify';

interface MapPreviewProps {
  map?: Map | null;
  loading: boolean;
  setLeafletMap: Function;
}

const MapPreview = ({ map, loading, setLeafletMap }: MapPreviewProps) => {
  if (!map) {
    return <div>No map selected?</div>;
  }

  if (loading) {
    return (
      <div className="bg-navbar w-screen h-screen">
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
          }}
        >
          <div>
            <PulseLoader color={'#fff'} size={65} />
            <span className="text-white text-3xl">Loading Map...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <MapComponent
        {...map}
        canEdit={false}
        setSelectedFeature={(_: any) => {}}
        setLeafletMap={setLeafletMap}
        classes="w-full h-[50vh]"
        forceRerender={() => {}}
      />
    </div>
  );
};

const MAX_TOLERANCE = 10;

const getCurrentColor = (feature: FeatureExt) =>
  feature?.properties?.color
    ? {
        fillColor: feature.properties.color as string,
        fillOpacity: 0.2,
        color: feature.properties.color as string,
        weight: 2,
      }
    : IDLE;

const onEachFeature = (feature: FeatureExt, layer: LGeoJsonExt) => {
  if (layer._isConfigured) {
    return;
  }

  layer.bindPopup(feature.properties?.name ?? '', { keepInView: false, autoPan: false });

  layer.pm.disable();

  layer.setStyle(getCurrentColor(feature));

  const mouseover: L.LeafletMouseEventHandlerFn = (e) => {
    layer.setStyle(HOVERED);
    layer.openPopup();
  };

  const mouseout: L.LeafletMouseEventHandlerFn = (e) => {
    layer.setStyle(getCurrentColor(feature));
    layer.closePopup();
  };

  layer.getPopup()?.on('mouseover', mouseover);

  layer.on('mouseover', mouseover);
  layer.on('mouseout', mouseout);

  layer._isConfigured = true;
};

interface SimplifyMapDialogProps {
  map: Map;
  projectLeafletMap: L.Map | null;
}

const SimplifyMapDialog = ({ map, projectLeafletMap }: SimplifyMapDialogProps) => {
  const isOpen = useSelector((state: RootState) => state.mapStore.simplifyDialog);
  const [leafletMap, setLeafletMap] = useState<L.Map | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [weight, setWeight] = useState<number>(0);

  const closeDialog = () => {
    store.dispatch.mapStore.setSimplifyDialog(false);
  };

  const applySimplification = () => {
    projectLeafletMap?.fire('pm:initSimplify', {
      weight: calculateTolerance(weight),
      f: map.features,
    });
  };

  const calculateTolerance = (percent: number) => {
    return (weight / 100) * MAX_TOLERANCE;
  };

  const updateLeaflet = (f: () => FeatureCollection) => {
    if (!leafletMap) return;

    const res = f();

    if (!res) {
      return;
    }

    leafletMap.eachLayer((l) => {
      if (!(l instanceof L.TileLayer)) {
        //@ts-ignore
        leafletMap.removeLayer(l);
      }
    });
    const layer = L.geoJSON(res).addTo(leafletMap);
    layer.eachLayer((e) => {
      //@ts-ignore
      onEachFeature(e.feature, e);
    });
  };

  useEffect(() => {
    if (isOpen === true) {
      setWeight(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!leafletMap) return;

    setLoading(true);

    updateLeaflet(() => {
      if (!weight || Math.round(weight) === 0) {
        return map.features as FeatureCollection;
      }

      const tol = calculateTolerance(weight);

      return simplifyGeojson(map.features, tol);
    });

    setLoading(false);
  }, [weight]);

  return (
    <Dialog open={isOpen} handler={closeDialog} className="bg-gray h-11/12 w-full">
      <DialogHeader className="text-white flex-col">Simplify Map</DialogHeader>
      <DialogBody className="flex flex-col h-full w-full p-5 space-y-5">
        <MapPreview map={map} loading={loading} setLeafletMap={setLeafletMap} />
        <div className="flex flex-row space-x-4">
          <Slider
            min={0}
            max={100}
            onChange={(e) => setWeight(parseFloat(e.target.value))}
            className="w-11/12"
            value={`${weight}`}
          />
          <b className="w-1/12">{weight?.toFixed(2) ?? 0}%</b>
        </div>

        <div className="text-white">
          <b>
            <u>NOTE:</u>
          </b>{' '}
          Simplifying will delete existing undo/redo history for all users and <b>CANNOT</b> be
          undone
        </div>
        <ButtonGroup fullWidth={true} ripple={true}>
          <Button onClick={closeDialog}>Close</Button>
          <Button
            onClick={() => {
              applySimplification();
              closeDialog();
            }}
            disabled={!weight || Math.round(weight) === 0}
          >
            Apply
          </Button>
        </ButtonGroup>
      </DialogBody>
    </Dialog>
  );
};

export default SimplifyMapDialog;

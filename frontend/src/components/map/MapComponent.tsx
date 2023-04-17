import { useRef } from 'react'

import { type FeatureCollection } from 'geojson'
import { GeoJSON, MapContainer, FeatureGroup, TileLayer } from 'react-leaflet'

import * as L from 'leaflet'

import MapControls from './MapControls'
import { FeatureExt, LGeoJsonExt, Map } from '../../types'

import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css'

import {store} from '../../models'

export type SelectedFeature = { layer: LGeoJsonExt; id: number } | null

const HOVERED = {
  fillColor: 'green',
  fillOpacity: 0.2,
}

const IDLE = {
  fillColor: 'red',
  fillOpacity: 0.2,
}

const SELECTED = {
  fillColor: 'blue',
  fillOpacity: 0.2,
}

const position: L.LatLngTuple = [37.335556, -122.009167]

interface IMapComponent extends Map {
  canEdit: boolean
  setSelectedFeature: Function
}

const MapComponent = ({
  features,
  canEdit,
  setSelectedFeature,
}: IMapComponent) => {
  const {mapStore} = store.dispatch;

  const fg = useRef<LGeoJsonExt>(null)
  const geoJSON: FeatureCollection = features

  //second one is the most recently selected
  const selectedFeatures = useRef<[SelectedFeature, SelectedFeature]>([
    null,
    null,
  ])

  const editLayer = useRef<SelectedFeature>(null)

  const isSelected = (id: number) => {
    return (
      selectedFeatures.current[0]?.id === id ||
      selectedFeatures.current[1]?.id === id
    )
  }

  const selectFeature = (id: number, layer: LGeoJsonExt): SelectedFeature => {
    if (isSelected(id)) {
      return null
    }

    const res = selectedFeatures.current[0]
    selectedFeatures.current[0] = selectedFeatures.current[1]
    selectedFeatures.current[1] = { layer, id }

    setSelectedFeature({ layer, id })

    return res
  }

  const unselectFeature = (id: number) => {
    if (selectedFeatures.current[0]?.id === id) {
      selectedFeatures.current[0] = selectedFeatures.current[1]
      selectedFeatures.current[1] = null
      setSelectedFeature(selectedFeatures.current[0])
    } else if (selectedFeatures.current[1]?.id === id) {
      selectedFeatures.current[1] = null
      setSelectedFeature(null)
    }
  }

  // NOTE: only call this function in leaflet event handlers,
  // OR when it is guaranteed that the `FeatureGroup` ref will be set
  const getLayerID = (layer: LGeoJsonExt) => {
    return fg.current?.getLayerId(layer)
  }

  const onEachFeature = (feature: FeatureExt, layer: LGeoJsonExt) => {
    if(layer._isConfigured) {
      return
    }

    layer._id = feature._id

    if (feature?.properties?.name) {
      layer.bindPopup(feature.properties.name)
    }

    layer.pm.disable()

    const mouseover: L.LeafletMouseEventHandlerFn = (e) => {
      e.target.setStyle(HOVERED)

      layer.openPopup()
    }

    const mouseout: L.LeafletMouseEventHandlerFn = (e) => {
      const id = getLayerID(layer)!

      if (isSelected(id)) {
        e.target.setStyle(SELECTED)
      } else {
        e.target.setStyle(IDLE)
      }

      layer.closePopup()
    }

    const click: L.LeafletMouseEventHandlerFn = (e) => {
      const id = getLayerID(layer)!

      if (isSelected(id)) {
        unselectFeature(id)
        e.target.setStyle(IDLE)
      } else {
        selectFeature(id, e.target)?.layer.setStyle(IDLE)
        e.target.setStyle(SELECTED)
      }
    }

    const dblclick: L.LeafletMouseEventHandlerFn = (e) => {
      const id = getLayerID(layer)!

      const eq = editLayer.current?.id === id

      editLayer.current?.layer.pm.disable()
      editLayer.current = null

      if (!eq) {
        editLayer.current = { layer, id }
        layer.pm.enable()
      }
    }

    // layer.clearCustomEventHandlers?.()

    layer.on('mouseover', mouseover)

    layer.on('mouseout', mouseout)

    layer.on('click', click)

    if (canEdit) {
      layer.on('dblclick', dblclick)
    }

    layer._isConfigured = true;
  }

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
            ref?.invalidateSize()
          })
        }
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <FeatureGroup ref={fg}>
          
            <MapControls
              onCreate={async (e) => {
                const feature = e.layer.toGeoJSON();
                const id = await mapStore.createFeature(feature);

                feature._id = id;

                // @ts-ignore
                onEachFeature(feature, e.layer as LGeoJsonExt)
              }}
              onEdit={async (e) => {
                console.log(e)
                const feature = e.layer.toGeoJSON();
                await mapStore.updateFeature({id: e.layer._id, feature});
              }}
              onRemove={async (e) => {
                console.log(e)
                await mapStore.deleteFeature(e.layer._id);
              }}
              canEdit={canEdit}
            />
          

          <GeoJSON
            data={geoJSON}
            style={{
              fillColor: 'red',
              fillOpacity: 0.15,
              color: 'blue',
              weight: 1,
            }}
            /* @ts-ignore */
            // Fine to ignore since we are guaranteeing the extensions to L.GeoJSON
            onEachFeature={onEachFeature}
            ref={fg}
          />
        </FeatureGroup>
      </MapContainer>
    </div>
  )
}

export default MapComponent

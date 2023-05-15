import PropertyEditor from './PropertyEditor';
import { Tabs, Tab, TabsBody, TabsHeader, TabPanel } from '@material-tailwind/react';
import { SelectedFeature } from './map/MapComponent';
import { RootState, store } from '../models';
import { useSelector } from 'react-redux';
import { emitUpdateMapProperties, emitUpdateRegionProperties } from '../live-collab/socket';

interface IProjectSidePanel {
  selectedFeature: SelectedFeature | null;
  canEdit: boolean;
}

const ProjectSidePanel = ({ selectedFeature, canEdit }: IProjectSidePanel) => {
  // @ts-ignore
  const properties: Record<string, any> = selectedFeature?.layer.feature?.properties
    ? { ...selectedFeature?.layer.feature?.properties }
    : {};

  const { mapStore } = store.dispatch;
  const mapProps = useSelector((state: RootState) => state.mapStore.currentMap?.properties);
  const mapId = useSelector((state: RootState) => state.mapStore.currentMap?._id);

  const customMapProps = mapProps ?? {};

  let customFeatureProps = properties
    ? Object.fromEntries(
        Object.entries(properties)
          .filter(([k, v]) => k.startsWith('mapson_'))
          .map(([k, v]) => [k.substring(7), v])
      )
    : {};

  customFeatureProps['name'] = (properties && properties.name) ?? '';
  customFeatureProps['color'] = (properties && properties.color) ?? '';

  const saveRegionProperties = async (props: Record<string, any>) => {
    if (!selectedFeature) {
      return;
    }

    let newProperties: Record<string, any> = Object.fromEntries(
      Object.entries(props)
        .filter(([k, v]) => k.length > 0)
        .filter(([k, v]) => k !== 'name' && k !== 'color')
        .map(([k, v]) => ['mapson_' + k, v])
    );

    newProperties['name'] = props['name'];
    newProperties['color'] = props['color'];

    let ogProps = {};
    if (properties) {
      ogProps = Object.fromEntries(
        Object.entries(properties)
          .filter(([k, v]) => !k.startsWith('mapson_'))
          .filter(([k, v]) => k !== 'name' && k !== 'color')
      );
    }

    const propertyList = { ...ogProps, ...newProperties };

    await mapStore.updateFeature({
      id: selectedFeature!.id,
      feature: { properties: { ...propertyList } },
    });
    emitUpdateRegionProperties(mapId!, selectedFeature!.id, propertyList);

    selectedFeature.layer.feature.properties = { ...ogProps, ...newProperties };
    newProperties['name'] === ''
      ? selectedFeature.layer.unbindPopup()
      : selectedFeature.layer.bindPopup(newProperties['name']);
    alert('Region properties successfully saved');
  };

  const saveMapProperties = async (props: Record<string, any>) => {
    let prop = {
      properties: Object.fromEntries(Object.entries(props).filter(([k, v]) => k.length > 0)),
    };
    await mapStore.updateCurrentMap({ map: prop });
    emitUpdateMapProperties(mapId!, prop.properties);
    alert('Map properties successfully saved');
  };

  return (
    <div
      className="bg-gray z-0 text-white h-[calc(100vh-64px)]"
      style={{ minWidth: '20vw' }}
      key={selectedFeature?.id}
    >
      <Tabs value="Feature">
        <TabsHeader
          className="bg-gray"
          indicatorProps={{
            className: 'bg-white/10',
          }}
        >
          <Tab value="Feature" className="text-white">
            Feature
          </Tab>
          <Tab value="Map" className="text-white">
            Map
          </Tab>
        </TabsHeader>
        <TabsBody>
          <TabPanel value="Feature">
            {selectedFeature ? (
              <div>
                <b>Feature Properties: </b>
                <PropertyEditor
                  // @ts-ignore
                  properties={customFeatureProps}
                  onSave={(props) => {
                    saveRegionProperties(props);
                  }}
                  viewOnly={!canEdit}
                  type="feature"
                  selectedFeature={selectedFeature}
                  key={JSON.stringify(customFeatureProps)}
                />
              </div>
            ) : (
              <div>Select feature to view properties</div>
            )}
          </TabPanel>
          <TabPanel value="Map">
            <b>Map Properties: </b>
            <PropertyEditor
              properties={customMapProps!}
              onSave={(props) => {
                saveMapProperties(props);
              }}
              viewOnly={!canEdit}
              type="map"
              selectedFeature={null}
              key={JSON.stringify(customMapProps)}
            />
          </TabPanel>
        </TabsBody>
      </Tabs>
    </div>
  );
};

export default ProjectSidePanel;

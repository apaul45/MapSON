import PropertyEditor from './PropertyEditor';
import { Tabs, Tab, TabsBody, TabsHeader, TabPanel } from '@material-tailwind/react';
import { SelectedFeature } from './map/MapComponent';
import { RootState, store } from '../models';
import { useRef } from 'react';
import { useSelector } from 'react-redux';

const EXAMPLE_PROPERTIES = Object.fromEntries(
  Array.from(Array(10).keys()).map((v) => [`Key${v}`, `Value${v}`])
);

interface IProjectSidePanel {
  selectedFeature: SelectedFeature;
  canEdit: boolean;
}

const ProjectSidePanel = ({ selectedFeature, canEdit }: IProjectSidePanel) => {
  const customRegionPropRef = useRef({});
  // @ts-ignore
  const properties: Record<string, any> = selectedFeature?.layer.feature?.properties;
  const { mapStore } = store.dispatch;
  const map = useSelector((state: RootState) => state.mapStore.currentMap);

  const customMapProps = map?.properties;

  if (selectedFeature) {
    customRegionPropRef.current = Object.fromEntries(
      Object.entries(properties)
        .filter(([k, v]) => k.startsWith('mapson_'))
        .map(([k, v]) => [k.substring(7), v])
    );
  }

  const saveRegionProperties = async (props: Record<string, any>) => {
    let newProperties: Record<string, any> = Object.fromEntries(
      Object.entries(props)
        .filter(([k, v]) => k.length > 0)
        .map(([k, v]) => ['mapson_' + k, v])
    );

    let ogProps = Object.fromEntries(
      Object.entries(properties).filter(([k, v]) => !k.startsWith('mapson_'))
    );

    let feature = selectedFeature?.layer.toGeoJSON();
    // @ts-ignore
    feature!.properties = { ...ogProps, ...newProperties };
    await mapStore.updateFeature({ id: selectedFeature!.id, feature });
  };

  const saveMapProperties = async (props: Record<string, any>) => {
    let prop = {
      properties: Object.fromEntries(Object.entries(props).filter(([k, v]) => k.length > 0)),
    };
    await mapStore.updateCurrentMap(prop);
  };

  return (
    <div className="bg-gray z-0 text-white h-[calc(100vh-64px)]" style={{ minWidth: '20vw' }}>
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
                  properties={customRegionPropRef.current}
                  onSave={(props) => {
                    saveRegionProperties(props);
                  }}
                  viewOnly={!canEdit}
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
            />
          </TabPanel>
        </TabsBody>
      </Tabs>
    </div>
  );
};

export default ProjectSidePanel;

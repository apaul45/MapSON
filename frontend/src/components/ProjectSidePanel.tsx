import PropertyEditor from './PropertyEditor';
import { Tabs, Tab, TabsBody, TabsHeader, TabPanel } from '@material-tailwind/react';
import { SelectedFeature } from './map/MapComponent';
import { useSelector } from 'react-redux';
import { RootState, store } from '../models';

const EXAMPLE_PROPERTIES = Object.fromEntries(
  Array.from(Array(10).keys()).map((v) => [`Key${v}`, `Value${v}`])
);

interface IProjectSidePanel {
  selectedFeature: SelectedFeature;
  canEdit: boolean;
}

const ProjectSidePanel = ({ selectedFeature, canEdit }: IProjectSidePanel) => {
  let customProperties: Record<string, any> = {};
  // @ts-ignore
  const properties: Record<string, any> = selectedFeature?.layer.feature?.properties;
  const { mapStore } = store.dispatch;

  if (properties) {
    Object.keys(properties).forEach((prop) => {
      if (prop.startsWith('mapson_')) {
        customProperties![prop.substring(7)] = properties[prop];
        delete properties[prop];
      }
    });
  }

  const saveProperties = async (props: Record<string, any>) => {
    let newProperties: Record<string, any> = {};
    Object.keys(props).forEach((prop) => {
      newProperties['mapson_' + prop] = props[prop];
    });
    console.log(selectedFeature);
    let feature = selectedFeature?.layer.toGeoJSON();
    // @ts-ignore
    feature.properties = { ...feature.properties, ...newProperties };
    console.log(selectedFeature!.id);
    await mapStore.updateFeature({ id: selectedFeature!.id, feature });
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
                  properties={customProperties}
                  onSave={(props) => {
                    saveProperties(props);
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
              properties={EXAMPLE_PROPERTIES}
              onSave={(props) => {
                //TODO
                console.log(props);
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

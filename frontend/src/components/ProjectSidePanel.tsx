import PropertyEditor from "./PropertyEditor";
import {
  Tabs,
  Tab,
  TabsBody,
  TabsHeader,
  TabPanel,
} from "@material-tailwind/react";
import { SelectedFeature } from "./MapComponent";

const EXAMPLE_PROPERTIES = Object.fromEntries(
  Array.from(Array(10).keys()).map((v) => [`Key${v}`, `Value${v}`])
);

interface IProjectSidePanel {
  selectedFeature: SelectedFeature;
}

const ProjectSidePanel = ({ selectedFeature }: IProjectSidePanel) => {
  return (
    <div className="bg-gray z-0 text-white" style={{ minWidth: "20vw" }}>
      <Tabs value="Feature">
        <TabsHeader
          className="bg-gray"
          indicatorProps={{
            className: "bg-white/10",
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
                  properties={EXAMPLE_PROPERTIES}
                  onSave={(props) => {
                    //TODO
                    console.log(props);
                  }}
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
            />
          </TabPanel>
        </TabsBody>
      </Tabs>
    </div>
  );
};

export default ProjectSidePanel;
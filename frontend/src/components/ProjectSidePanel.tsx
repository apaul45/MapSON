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
    <div className="bg-gray" style={{ minWidth: "20vw" }}>
      <Tabs value="Feature">
        <TabsHeader
          className="bg-transparent"
          indicatorProps={{
            className: "bg-blue",
          }}
        >
          <Tab value="Feature">Feature</Tab>
          <Tab value="Map">Map</Tab>
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

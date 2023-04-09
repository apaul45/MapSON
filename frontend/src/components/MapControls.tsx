import { PM } from "leaflet";
import { GeomanControls } from "react-leaflet-geoman-v2";
import "./MapControls.css";

interface IMapControls {
  onCreate: PM.CreateEventHandler;
}

const MapControls = ({ onCreate }: IMapControls) => {
  const onEdited = (e: any) => {
    console.log(e);
  };

  return (
    <GeomanControls
      options={{
        position: "topright",
        drawRectangle: false,
        drawText: false,
        cutPolygon: false,
        editMode: false,
        rotateMode: false,
        dragMode: false,
      }}
      onCreate={onCreate}
      onEdit={onEdited}
      globalOptions={{
        continueDrawing: true,
        editable: false,
      }}
      pathOptions={{
        color: "red",
        weight: 1,
        fillColor: "green",
      }}
    />
  );
};

export default MapControls;

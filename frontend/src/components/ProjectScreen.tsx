import React, { useEffect, useState } from "react";
import { ProjectNavbar } from "./ProjectNavbar";
import { Map } from "../types";
import { FeatureCollection } from "geojson";
import { useParams } from "react-router-dom";
import MapComponent from "./MapComponent";

const defaultMap: Map = {
  name: "My Map",
  username: "",
  upvotes: [],
  downvotes: [],
  forks: 0,
  downloads: 0,
  published: { isPublished: false },
  comments: [],
  features: [],
};

export const ProjectScreen = () => {
  const { id } = useParams();

  useEffect(() => {
    //load data from db
    setMap(defaultMap);
  }, [id]);

  const [map, setMap] = useState<Map>(defaultMap);
  const [commentsOpen, setCommentsOpen] = useState(false);

  return (
    <div>
      <ProjectNavbar
        commentsOpen={commentsOpen}
        setCommentsOpen={setCommentsOpen}
        mapName={map.name}
        setMapName={(name: string) => setMap({ ...map, name: name })}
      />
      <MapComponent key={"MAP"} {...map} />
    </div>
  );
};

import React, { useEffect, useState } from "react";
import { ProjectNavbar } from "./ProjectNavbar";
import { Map } from "../types";
import { useParams } from "react-router-dom";
import { store } from "../models";
import MapComponent from "./MapComponent";

const defaultMap: Map = {
  _id: "DEFAULT_MAP",
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

  const user = store.getState().user.currentUser;

  useEffect(() => {
    //load data from db
    setMap(defaultMap);
  }, [id]);

  const [map, setMap] = useState<Map>(defaultMap);
  const [commentsOpen, setCommentsOpen] = useState(false);

  const canEdit = (user && user.maps?.some((v) => v._id === map._id)) ?? false;

  return (
    <div className="h-screen w-screen">
      <ProjectNavbar
        commentsOpen={commentsOpen}
        setCommentsOpen={setCommentsOpen}
        mapName={map.name}
        setMapName={(name: string) => setMap({ ...map, name: name })}
      />
      <MapComponent canEdit={canEdit} key={"MAP"} {...map} />
    </div>
  );
};

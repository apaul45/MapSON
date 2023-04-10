import { ProjectNavbar } from "./ProjectNavbar";
import { Map } from "../types";
import { FeatureCollection } from "geojson";
import { useNavigate } from "react-router-dom";
import { store } from "../models";
import DeletedMapDialog from "./DeletedMapDialog";
import ShareMapDialog from "./ShareMapDialog";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import MapComponent from "./MapComponent";
import { RootState } from "../models";
import { useSelector } from "react-redux";

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
  const navigate = useNavigate();

  const user = useSelector((state: RootState) => state.user.currentUser);

  const { id } = useParams();

  useEffect(() => {
    //load data from db
    setMap(defaultMap);
  }, [id]);

  const [map, setMap] = useState<Map>(defaultMap);
  const [isMapDeleted, setMapDeleted] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const closeDeletedDialog = () => {
    setMapDeleted(false);
    //navigate(user ? '/home' : '/discover');
  };

  const closeShareDialog = () => {
    setShareOpen(false);
  };

  // const canEdit = (user && user.maps?.some((v) => v._id === map._id)) ?? false;
  const canEdit = true; // allow editing for build 2

  return (
    <div className="bg-black w-screen h-[calc(100vh-64px)]">
      <ProjectNavbar
        commentsOpen={commentsOpen}
        setCommentsOpen={setCommentsOpen}
        shareOpen={shareOpen}
        setShareOpen={setShareOpen}
        mapName={map.name}
        setMapName={(name: string) => setMap({ ...map, name: name })}
      />
      <MapComponent canEdit={canEdit} key={"MAP"} {...map} />
      <DeletedMapDialog
        isOpen={isMapDeleted}
        closeDialog={closeDeletedDialog}
      />
      <ShareMapDialog isOpen={shareOpen} closeDialog={closeShareDialog} />
    </div>
  );
};

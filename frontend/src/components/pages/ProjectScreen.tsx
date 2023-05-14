import { ProjectNavbar } from '../ProjectNavbar';
import DeletedMapDialog from '../dialogs/DeletedMapDialog';
import ShareMapDialog from '../dialogs/ShareMapDialog';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { RootState } from '../../models';
import { useSelector } from 'react-redux';
import CommentsSidePanel from '../CommentsSidePanel';
import ProjectSidePanel from '../ProjectSidePanel';
import { MapComponent } from '../map';
import { SelectedFeature } from '../map/MapComponent';
import { store } from '../../models';
import PulseLoader from 'react-spinners/PulseLoader';

export const ProjectScreen = () => {
  const user = useSelector((state: RootState) => state.user.currentUser);
  const map = useSelector((state: RootState) => state.mapStore.currentMap);

  const { mapStore } = store.dispatch;

  const { id } = useParams();
  //For use in taking a screenshot of the map before leaving
  const [leafletMap, setLeafletMap] = useState<L.Map | null>(null);

  useEffect(() => {
    setError(false);
    if (!id) {
      setError(true);
      return;
    }

    mapStore.loadMap(id);

    return () => {
      mapStore.clearMap(undefined);
    };
  }, [id]);

  const [isMapDeleted, setMapDeleted] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<SelectedFeature | null>(null);
  // true for comments, false for property editor
  const [sidePanelToggle, setSidePanelToggle] = useState(false);

  const [error, setError] = useState(false);

  const closeDeletedDialog = () => {
    setMapDeleted(false);
    //navigate(user ? '/home' : '/discover');
  };

  const closeShareDialog = () => {
    setShareOpen(false);
  };

  const setMapName = async (name: string) => await mapStore.updateCurrentMap({ name });

  const canEdit =
    map !== null &&
    !map.published.isPublished &&
    user !== null &&
    user.maps.some((v) => v._id === map._id);

  if (error) {
    return (
      <div className="bg-navbar w-screen h-screen">
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
          }}
        >
          <span className="text-white text-3xl">Error loading map</span>
        </div>
      </div>
    );
  }

  if (!map) {
    return (
      <div className="bg-navbar w-screen h-screen">
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
          }}
        >
          <div>
            <PulseLoader color={'#fff'} size={65} />
            <span className="text-white text-3xl">Loading Map...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black w-screen h-screen">
      <ProjectNavbar
        shareOpen={shareOpen}
        setShareOpen={setShareOpen}
        canEditName={canEdit}
        mapName={map.name}
        setMapName={setMapName}
        setSidePanelToggle={setSidePanelToggle}
        sidePanelToggle={sidePanelToggle}
        leafletMap={leafletMap}
      />

      <div className="flex flex-row">
        <MapComponent
          canEdit={canEdit}
          setSelectedFeature={setSelectedFeature}
          key={'MAP'}
          {...map}
          setLeafletMap={(map: L.Map) => setLeafletMap(map)}
        />
        {!sidePanelToggle && (
          <ProjectSidePanel selectedFeature={selectedFeature} canEdit={canEdit} />
        )}
        {sidePanelToggle && <CommentsSidePanel />}
      </div>

      <DeletedMapDialog isOpen={isMapDeleted} closeDialog={closeDeletedDialog} />
      <ShareMapDialog isOpen={shareOpen} closeDialog={closeShareDialog} />
    </div>
  );
};

import { ProjectNavbar } from '../ProjectNavbar';
import { Map } from '../../types';
import { useNavigate } from 'react-router-dom';
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
import { ErrorBoundary } from 'react-error-boundary';

export const ProjectScreen = () => {
  const navigate = useNavigate();

  const user = useSelector((state: RootState) => state.user.currentUser);
  const map = useSelector((state: RootState) => state.mapStore.currentMap);

  const { mapStore } = store.dispatch;

  const { id } = useParams();

  useEffect(() => {
    setError(false);
    if (!id) {
      setError(true);
      return;
    }

    mapStore.loadMap(id);

    return () => {
      console.log('unmounted');
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

  const setMapName = (name: string) => mapStore.updateCurrentMap({ name });

  const canEdit = (map && user && user.maps?.some((v) => v._id === map._id)) ?? false;

  if (error) {
    return <div>Error loading map</div>;
  }

  if (!map) {
    return <div>Loading map...</div>;
  }

  return (
    <div className="bg-black w-screen h-[calc(100vh-64px)]">
      <ProjectNavbar
        shareOpen={shareOpen}
        setShareOpen={setShareOpen}
        mapName={map.name}
        setMapName={setMapName}
        setSidePanelToggle={setSidePanelToggle}
        sidePanelToggle={sidePanelToggle}
      />

      <div className="flex flex-row">
        <ErrorBoundary fallback={<div>Unexpected error...</div>}>
          <MapComponent
            canEdit={canEdit}
            setSelectedFeature={setSelectedFeature}
            key={'MAP'}
            {...map}
          />
        </ErrorBoundary>
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

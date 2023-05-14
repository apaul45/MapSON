import { MenuList, MenuItem, Menu, MenuHandler } from '@material-tailwind/react';
import { useSelector } from 'react-redux';
import { RootState, store } from '../models';
import { useNavigate } from 'react-router-dom';
import { saveAs } from 'file-saver';
import axios from 'axios';
import { handlePublish, handleUnpublish } from './dialogs/ShareMapDialog';
import domtoimage from 'dom-to-image';
import L from 'leaflet';
import { Fragment, useState } from 'react';
import TutorialDialog from './dialogs/TutorialDialog';
import { clientRedo, clientUndo } from '../live-collab/socket';

interface IProjectMenu {
  leafletMap: L.Map | null;
  shareOpen: boolean;
  setShareOpen: Function;
}

const ProjectMenu = ({ leafletMap, shareOpen, setShareOpen }: IProjectMenu) => {
  const user = useSelector((state: RootState) => state.user.currentUser);
  const map = useSelector((state: RootState) => state.mapStore.currentMap);
  const { mapStore, error } = store.dispatch;

  const navigate = useNavigate();

  const open =
    import.meta.env.MODE === 'development' || localStorage.getItem('opened') === 'true'
      ? false
      : user && user?.maps.length === 1
      ? true
      : false;
  const [tutoOpen, setTutoOpen] = useState(open);
  const closeTutoDialog = () => {
    setTutoOpen(false);
    localStorage.setItem('opened', 'true');
  };

  const exportGeojson = () => {
    if (!map?.features) {
      error.setError('Please fill the map with polygons');
      return;
    }
    const blob = new Blob([JSON.stringify(map?.features)]);
    saveAs(blob, map?.name + '.geo.json');
    updateDownload();
  };

  const exportShapefile = async () => {
    if (!map?.features) {
      error.setError('Please fill the map with polygons');
      return;
    }

    const params = new URLSearchParams();
    params.append('json', JSON.stringify(map?.features));

    const res = await axios.post('https://ogre.adc4gis.com/convertJson', params, {
      withCredentials: false,
      responseType: 'blob',
    });
    const blob = new Blob([res.data]);
    saveAs(blob, map?.name + '.zip');
    updateDownload();
  };

  const updateDownload = async () => {
    await mapStore.updateCurrentMap({ downloads: map?.downloads! + 1 });
  };

  const openDeleteDialog = () => {
    if (!map) {
      return;
    }
    store.dispatch.mapStore.setMarkedMap(map._id);
    store.dispatch.mapStore.setDeleteDialog(true);
  };

  const handleForkMap = async () => {
    const id = await mapStore.forkMap(map?._id as unknown as string);

    if (id) navigate(`/project/${id}`);
  };

  const handleExitProject = () => {
    //Take and save the screenshot of the map right before leaving
    if (!leafletMap || !user) {
      navigate(user ? '/home' : '/discover');
      return;
    }

    const mapId = map?._id;

    leafletMap.setView(leafletMap.getCenter(), 4);
    leafletMap.pm.removeControls();
    leafletMap.removeControl(leafletMap.zoomControl);
    leafletMap.removeControl(leafletMap.attributionControl);

    console.log(leafletMap);

    // Need timeout to ensure map is reset w/controls removed first
    setTimeout(() => {
      const container = leafletMap.getContainer();
      const dimensions = leafletMap.getSize();

      domtoimage
        .toBlob(container, { height: dimensions.y, width: dimensions.x })
        .then(async (blob) => {
          //Storing preview as base 64 string in backend
          const blobToDataUrl = () => {
            return new Promise((r) => {
              let a = new FileReader();
              a.onload = r;
              a.readAsDataURL(blob);
            }).then((e: any) => e.target.result);
          };

          const img = await blobToDataUrl();
          await mapStore.updateMap({ _id: mapId, preview: img });
          navigate(user ? '/home' : '/discover');
        })
        .catch((err) => {
          console.log(err);
          navigate(user ? '/home' : '/discover');
        });
    }, 1000);
  };

  return (
    <Fragment>
      <MenuList id="project-menu" className="bg-gray text-white p-0 font-sans text-base">
        <MenuItem className="text-sort-by mb-0.5 text-lg pointer-events-none"> File </MenuItem>

        <Menu placement="right-start">
          <MenuHandler>
            <MenuItem>Download as</MenuItem>
          </MenuHandler>

          <MenuList className="bg-gray text-white p-0 font-sans text-base">
            <MenuItem
              className="hover:bg-sort-hover"
              onClick={() => {
                exportShapefile();
              }}
            >
              Shapefile
            </MenuItem>
            <MenuItem
              className="hover:bg-sort-hover"
              onClick={() => {
                exportGeojson();
              }}
            >
              GeoJSON
            </MenuItem>
          </MenuList>
        </Menu>

        {user?.email && (
          <MenuItem onClick={handleForkMap} className="hover:bg-sort-hover">
            Make a copy
          </MenuItem>
        )}

        <hr className="my-2 border-blue-gray-50 outline-none" />

        {user && !map?.published.isPublished ? (
          <MenuItem className="text-sort-by text-lg pt-0 pointer-events-none"> Edit </MenuItem>
        ) : null}
        {user && !map?.published.isPublished ? (
          <MenuItem className="hover:bg-sort-hover" onClick={() => clientUndo()}>
            Undo
          </MenuItem>
        ) : null}
        {user && !map?.published.isPublished ? (
          <MenuItem className="hover:bg-sort-hover" onClick={() => clientRedo()}>
            Redo
          </MenuItem>
        ) : null}
        {user && !map?.published.isPublished ? (
          <hr className="my-2 border-blue-gray-50 outline-none" />
        ) : null}

        {user ? (
          <MenuItem className="hover:bg-sort-hover" onClick={() => setTutoOpen(true)}>
            Tutorial
          </MenuItem>
        ) : null}

        {
          // @ts-ignore
          map?.published.isPublished && map?.owner._id === user?._id ? (
            <MenuItem className="hover:bg-sort-hover" onClick={() => handleUnpublish()}>
              Unpublish
            </MenuItem>
          ) : //@ts-ignore
          map?.owner._id === user?._id ? (
            <MenuItem className="hover:bg-sort-hover" onClick={() => handlePublish()}>
              Publish
            </MenuItem>
          ) : null
        }
        <MenuItem className="hover:bg-sort-hover" onClick={() => setShareOpen(!shareOpen)}>
          Share
        </MenuItem>

        <MenuItem
          className="hover:bg-sort-hover"
          id="menu-option-exit"
          onClick={() => handleExitProject()}
        >
          Exit project
        </MenuItem>

        {
          // @ts-ignore
          user && map?.owner.username === user.username ? (
            <MenuItem
              className="hover:bg-sort-hover text-red-400"
              onClick={() => openDeleteDialog()}
            >
              Delete map
            </MenuItem>
          ) : null
        }
      </MenuList>
      <TutorialDialog isOpen={tutoOpen} closeDialog={closeTutoDialog} />
    </Fragment>
  );
};

export default ProjectMenu;

import { MenuList, MenuItem, Menu, MenuHandler } from '@material-tailwind/react';
import { useSelector } from 'react-redux';
import { RootState, store } from '../models';
import { useNavigate } from 'react-router-dom';
import { saveAs } from 'file-saver';
import axios from 'axios';
import { handlePublish, handleUnpublish } from './dialogs/ShareMapDialog';
import domtoimage from 'dom-to-image';
import FileSaver from 'file-saver';
import L from 'leaflet';

const ProjectMenu = ({ leafletMap }: { leafletMap: L.Map | null }) => {
  const user = useSelector((state: RootState) => state.user.currentUser);
  const map = useSelector((state: RootState) => state.mapStore.currentMap);
  const { mapStore, error } = store.dispatch;

  const navigate = useNavigate();

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
    const saveScreenshot = () => {
      if (!leafletMap) return;

      //WIP: Need to make this occur way before everything after this line
      //WIP: Need to set the location and zoom back to where it was beforehand
      leafletMap.setView(leafletMap.getCenter(), 4);
      leafletMap.pm.removeControls();
      leafletMap.removeControl(leafletMap.zoomControl);
      leafletMap.removeControl(leafletMap.attributionControl);

      console.log(leafletMap);

      setTimeout(() => {
        const container = leafletMap.getContainer();
        const dimensions = leafletMap.getSize();
        domtoimage
          .toBlob(container, { height: dimensions.y, width: dimensions.x })
          .then((dataUrl) => FileSaver.saveAs(dataUrl, 'ss.png'))
          .catch((err) => console.log(err));
      }, 1000);
    };

    saveScreenshot();
    setTimeout(() => navigate(user ? '/home' : '/discover'), 1000);
  };

  return (
    <MenuList id="project-menu" className="bg-gray text-white p-0 font-sans text-base">
      <MenuItem className="text-sort-by mb-0.5 text-lg pointer-events-none"> File </MenuItem>

      <MenuItem className="hover:bg-sort-hover">Save</MenuItem>
      <MenuItem className="hover:bg-sort-hover">Import</MenuItem>

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

      {user?.email && <MenuItem onClick={handleForkMap}>Make a copy</MenuItem>}

      <hr className="my-2 border-blue-gray-50 outline-none" />

      <MenuItem className="text-sort-by text-lg pt-0 pointer-events-none"> Edit </MenuItem>
      <MenuItem className="hover:bg-sort-hover">Undo</MenuItem>
      <MenuItem className="hover:bg-sort-hover">Redo</MenuItem>

      <hr className="my-2 border-blue-gray-50 outline-none" />

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
      <MenuItem className="hover:bg-sort-hover">Share</MenuItem>

      <MenuItem id="hover:bg-sort-hover menu-option-exit" onClick={() => handleExitProject()}>
        Exit project
      </MenuItem>

      <MenuItem className="hover:bg-sort-hover text-red-400" onClick={() => openDeleteDialog()}>
        Delete map
      </MenuItem>
    </MenuList>
  );
};

export default ProjectMenu;

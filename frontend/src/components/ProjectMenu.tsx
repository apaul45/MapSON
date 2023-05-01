import { MenuList, MenuItem, Menu, MenuHandler } from '@material-tailwind/react';
import { useSelector } from 'react-redux';
import { RootState, store } from '../models';
import { Link } from 'react-router-dom';
import { saveAs } from 'file-saver';
import axios from 'axios';
import { handlePublish } from './dialogs/ShareMapDialog';

const ProjectMenu = () => {
  const user = useSelector((state: RootState) => state.user.currentUser);
  const map = useSelector((state: RootState) => state.mapStore.currentMap);
  const openDeleteDialog = () => store.dispatch.mapStore.setDeleteDialog(true);
  const { error } = store.dispatch;

  const exportGeojson = () => {
    if (!map?.features) {
      error.setError('Please fill the map with polygons');
      return;
    }
    const blob = new Blob([JSON.stringify(map?.features)]);
    saveAs(blob, map?.name + '.geo.json');
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

      <MenuItem>Make a copy</MenuItem>

      <hr className="my-2 border-blue-gray-50 outline-none" />

      <MenuItem className="text-sort-by text-lg pt-0 pointer-events-none"> Edit </MenuItem>
      <MenuItem className="hover:bg-sort-hover">Undo</MenuItem>
      <MenuItem className="hover:bg-sort-hover">Redo</MenuItem>

      <hr className="my-2 border-blue-gray-50 outline-none" />
      <MenuItem className="hover:bg-sort-hover" onClick={() => handlePublish()}>
        Publish
      </MenuItem>
      <MenuItem className="hover:bg-sort-hover">Share</MenuItem>

      <Link to={user ? '/home' : '/discover'} className="hover:bg-sort-hover hover:outline-none">
        <MenuItem id="menu-option-exit">Exit project</MenuItem>
      </Link>

      <MenuItem className="hover:bg-sort-hover text-red-400" onClick={() => openDeleteDialog()}>
        Delete map
      </MenuItem>
    </MenuList>
  );
};

export default ProjectMenu;

import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { AddMapDialog } from '../dialogs/AddMapDialog';
import { RootState } from '../../models';
import { Menu, MenuHandler, MenuItem, MenuList } from '@material-tailwind/react';
import { MapCard } from '../map';
import { store } from '../../models';

export const HomeDiscoverScreen = () => {
  const location = useLocation();

  const sortOptions = ['Upvotes', 'Downloads', 'Oldest-Newest', 'Newest-Oldest'];
  const [sortBy, setSortBy] = useState<string>('upvote');

  const userMaps = useSelector((state: RootState) => state.user.currentUser?.maps);
  const username = useSelector((state: RootState) => state.user.currentUser?.username);
  const allMaps = useSelector((state: RootState) => state.mapStore.maps);

  useEffect(() => {
    if (location.pathname.includes('discover')) {
      store.dispatch.mapStore.loadAllMaps(undefined);
    }
  }, []);

  return (
    <>
      <div className="h-max bg-gray px-3 py-3 relative min-h-screen">
        <div className="text-right relative pb-3 ">
          <Menu>
            <MenuHandler>
              <button className="text-base bg-sort rounded px-1">
                Sort by: {sortBy}
                <svg
                  className="w-4 h-4 inline pb-1"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="current"
                  viewBox="0 0 320 512"
                >
                  <path d="M41 288h238c21.4 0 32.1 25.9 17 41L177 448c-9.4 9.4-24.6 9.4-33.9 0L24 329c-15.1-15.1-4.4-41 17-41z" />
                </svg>
              </button>
            </MenuHandler>
            <MenuList className="bg-gray text-white p-0 font-sans text-base">
              <MenuItem className="text-lg text-sort-by pointer-events-none">Sort By...</MenuItem>
              {sortOptions.map((option) => (
                <MenuItem
                  key={`menu-${option}`}
                  id={`menu-${option}`}
                  onClick={() => setSortBy(option)}
                >
                  {option}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        </div>
        <div className="grid grid-cols-5 gap-3 relative ">
          {
            //Render user's maps in home page
            location.pathname.includes('home') &&
              userMaps?.map((map) => (
                <div key={`UserMapcard:${map._id}`} id={`UserMapcard:${map._id}`}>
                  <MapCard
                    map={map}
                    name={map.name}
                    username={username}
                    upvoteCount={map.upvotes.length}
                    downvoteCount={map.downvotes.length}
                    downloadCount={map.downloads}
                    description={map.description}
                    date={map.updatedAt}
                  />
                </div>
              ))
          }
          {
            //Render non user, published maps in discover
            location.pathname.includes('discover') &&
              allMaps.map((map) => (
                <div key={`Mapcard:${map._id}`}>
                  <MapCard
                    map={map}
                    name={map.name}
                    username={username}
                    upvoteCount={map.upvotes.length}
                    downvoteCount={map.downvotes.length}
                    downloadCount={map.downloads}
                    description={map.description}
                    date={map.updatedAt}
                  />
                </div>
              ))
          }
        </div>
      </div>
      <AddMapDialog />
    </>
  );
};

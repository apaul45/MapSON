import { Menu, MenuHandler, MenuList, MenuItem } from '@material-tailwind/react';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { store, RootState } from '../../models';
import { AddMapDialog } from '../dialogs';
import { MapCard } from '../map';

export const DiscoverScreen = () => {
  useEffect(() => {
    store.dispatch.mapStore.loadAllMaps(5);
    window.addEventListener('scroll', handleScroll, true);
  }, []);

  const sortOptions = ['Upvotes', 'Downloads', 'Oldest-Newest', 'Newest-Oldest'];
  const [sortBy, setSortBy] = useState<string>('upvote');

  const allMaps = useSelector((state: RootState) => state.mapStore.maps);

  const [limit, setLimit] = useState<number>(5);
  const [bottom, setBottom] = useState<boolean>(false);

  const height = useRef<number>(0);

  useEffect(() => {
    if (bottom) {
      loadMoreMaps();
    }
  }, [bottom]);

  const handleScroll = (e: any) => {
    console.log('in scroll');

    const scrollElement = e.target.scrollingElement;
    const isBottom =
      scrollElement.scrollHeight - scrollElement.scrollTop === scrollElement.clientHeight;

    height.current = isBottom ? scrollElement.clientHeight : height.current;
    setBottom(isBottom);
  };

  const loadMoreMaps = () => {
    store.dispatch.mapStore.loadAllMaps(limit + 5);
    setLimit(limit + 5);

    console.log(height.current);
    window.scrollTo(0, 0);
  };

  return (
    <div
      className="h-fit bg-gray px-3 py-3 relative overflow-auto min-h-screen"
      onScroll={(e) => handleScroll(e)}
    >
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
        {allMaps.map((map) => (
          <div key={`Mapcard:${map._id}`}>
            <MapCard
              map={map}
              name={map.name}
              //@ts-ignore
              username={map.owner.username}
              upvoteCount={map.upvotes.length}
              downvoteCount={map.downvotes.length}
              downloadCount={map.downloads}
              description={map.description}
              date={map.updatedAt}
            />
          </div>
        ))}
      </div>
      {bottom && (
        <div
          className="inline-block mt-2 text-white h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
          role="status"
        >
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
            Loading...
          </span>
        </div>
      )}
      <AddMapDialog />
    </div>
  );
};

import { Menu, MenuHandler, MenuList, MenuItem } from '@material-tailwind/react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { store, RootState } from '../../models';
import { AddMapDialog } from '../dialogs';
import { MapCard } from '../map';
import { AllMapsRequest } from '../../api/types';

const sortOptions = ['Upvotes', 'Downvotes', 'Downloads', 'Oldest-Newest', 'Newest-Oldest'];

export const DiscoverScreen = () => {
  useEffect(() => {
    store.dispatch.mapStore.loadAllMaps({ limit: 5 });
    window.addEventListener('scroll', handleScroll, true);
  }, []);

  const [sortBy, setSortBy] = useState<string>('upvote');
  const [limit, setLimit] = useState<number>(5);
  const [bottom, setBottom] = useState<boolean>(false);

  const allMaps = useSelector((state: RootState) =>
    state.mapStore.mapFilter
      ? //@ts-ignore
        state.mapStore.maps.filter((map) => map.owner.username === state.mapStore.mapFilter)
      : state.mapStore.maps
  );

  const handleScroll = (e: any) => {
    console.log('in scroll');

    const scrollElement = e.target.scrollingElement;
    setBottom(scrollElement.scrollHeight - scrollElement.scrollTop === scrollElement.clientHeight);
  };

  // Needed to load in more maps once end of scroll reached
  useEffect(() => {
    if (bottom) {
      setTimeout(() => loadMoreMaps(sortBy.toLowerCase()), 200);
    }
  }, [bottom]);

  const loadMoreMaps = (sortOption: string, lim = limit) => {
    //Make oldest-newest and newest-oldest options ready to send
    const option = sortOption.includes('oldest') ? 'published.publishedDate' : sortOption;

    // All options sort by descending, except oldest to newest
    let sortBy = sortOption === 'oldest-newest' ? { [option]: 1 } : { [option]: -1 };

    let request: AllMapsRequest = {
      limit: lim + 5,
      sortBy: sortBy,
    };

    store.dispatch.mapStore.loadAllMaps(request);
    setLimit(lim === limit ? limit + 5 : limit);
  };

  const handleSort = (option: string) => {
    //Sort limit # of maps
    loadMoreMaps(option.toLowerCase(), limit - 5);
    setSortBy(option);
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
                onClick={() => handleSort(option)}
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
              id={map._id}
              name={map.name}
              //@ts-ignore
              username={map.owner.username}
              upvotes={map.upvotes}
              downvotes={map.downvotes}
              downloadCount={map.downloads}
              description={map.description!}
              date={map.published.publishedDate?.toString()!}
              preview={map.preview ? (map.preview as string) : ''}
              published={map.published.isPublished} //this is only here to avoid type errors
            />
          </div>
        ))}
      </div>
      {bottom ? (
        <div
          className="inline-block mt-5 text-white h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
          role="status"
        >
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
            Loading...
          </span>
        </div>
      ) : (
        <div className="text-center text-white mt-5">
          Scroll for more
          <div className="flex justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              style={{ color: 'white' }}
              className="w-7 h-7 animate-bounce"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 5.25l-7.5 7.5-7.5-7.5m15 6l-7.5 7.5-7.5-7.5"
              />
            </svg>
          </div>
        </div>
      )}
      <AddMapDialog />
    </div>
  );
};

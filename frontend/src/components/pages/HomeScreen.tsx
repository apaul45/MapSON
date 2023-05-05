import { useSelector } from 'react-redux';
import { AddMapDialog } from '../dialogs/AddMapDialog';
import { RootState } from '../../models';
import { MapCard } from '../map';

export const HomeScreen = () => {
  const userMaps = useSelector((state: RootState) => state.user.currentUser?.maps);
  const username = useSelector((state: RootState) => state.user.currentUser?.username);

  return (
    <>
      <div className="h-max bg-gray px-3 py-3 relative min-h-screen">
        <div className="grid grid-cols-5 gap-3 relative ">
          {
            //Render user's maps in home page
            userMaps?.map((map) => (
              <div key={`UserMapcard:${map._id}`} id={`UserMapcard:${map._id}`}>
                <MapCard
                  map={map}
                  name={map.name}
                  // @ts-ignore
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

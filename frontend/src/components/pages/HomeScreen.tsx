import { useSelector } from 'react-redux';
import { AddMapDialog } from '../dialogs/AddMapDialog';
import { RootState, store } from '../../models';
import { MapCard } from '../map';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const HomeScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoggedIn = async () => {
      const username = await store.dispatch.user.check();

      if (!username) {
        navigate('/');
      }
    };

    checkLoggedIn();
  }, []);

  const userMaps = useSelector((state: RootState) =>
    state.mapStore.mapFilter
      ? state.user.currentUser?.maps.filter(
          //@ts-ignore
          (map) => map.owner.username === state.mapStore.mapFilter
        )
      : state.user.currentUser?.maps
  );

  return (
    <>
      <div className="h-max bg-gray px-3 py-3 relative min-h-screen">
        <div className="grid grid-cols-5 gap-3 relative ">
          {
            //Render user's maps in home page
            userMaps?.map((map) => (
              <div key={`UserMapcard:${map._id}`} id={`UserMapcard:${map._id}`}>
                <MapCard
                  id={map._id}
                  name={map.name}
                  // @ts-ignore
                  username={map.owner.username}
                  upvotes={map.upvotes}
                  downvotes={map.downvotes}
                  downloadCount={map.downloads}
                  description={map.description!}
                  date={map.updatedAt!}
                  preview={map.preview ? (map.preview as string) : ''}
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

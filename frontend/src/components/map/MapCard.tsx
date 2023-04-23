import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { store } from '../../models';

export default function MapCard(props: any) {
  const [expand, setExpand] = useState<boolean>(false);
  const [upvoteClass, setUpvoteClass] = useState<string>('');
  const [downvoteClass, setdownvoteClass] = useState<string>('');
  // const [upvoteCount, setUpvoteCount] = useState<number>(10)
  // const [downvoteCount, setDownvoteCount] = useState<number>(10)
  // const [downloadCount, setDownloadCount] = useState<number>(10)
  const { mapid, name, username, upvoteCount, downvoteCount, downloadCount, description, date } =
    props;

  const dateFormat = new Date(date).toLocaleDateString('en-us', {
    year: 'numeric',
    day: 'numeric',
    month: 'long',
  });

  //const description: string = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam odio nulla, tincidunt sit amet ultricies placerat, mollis a sem. Phasellus eget dui in ante porta vehicula ac in ante. Praesent bibendum volutpat risus, id efficitur turpis porta vel. Praesent tempus posuere tortor non faucibus. Sed imperdiet ex cursus felis condimentum bibendum. Sed scelerisque, velit eget bibendum ultrices, tortor quam aliquet risus, id hendrerit arcu metus et ante. '

  const location = useLocation();
  console.log(location.pathname);

  const navigate = useNavigate();

  const deleteCard = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    console.log('delete card');
    e.stopPropagation();
    store.dispatch.mapStore.setDeleteDialog(true);
    store.dispatch.mapStore.setMarkedMap(mapid);
  };

  const upvoteMap = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    console.log('upvote map');
    e.stopPropagation();
    if (downvoteClass === 'text-downvote') {
      setdownvoteClass('');
      //setDownvoteCount(downvoteCount - 1)
    }
    if (upvoteClass.length === 0) {
      setUpvoteClass('text-upvote');
      //setUpvoteCount(upvoteCount + 1)
    } else {
      setUpvoteClass('');
      //setUpvoteCount(upvoteCount - 1)
    }
  };

  const downvoteMap = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    console.log('downvote map');
    e.stopPropagation();
    if (upvoteClass === 'text-upvote') {
      setUpvoteClass('');
      //setUpvoteCount(upvoteCount - 1)
    }
    if (downvoteClass.length === 0) {
      setdownvoteClass('text-downvote');
      //setDownvoteCount(downvoteCount + 1)
    } else {
      setdownvoteClass('');
      //setDownvoteCount(downvoteCount - 1)
    }
  };

  const downloadMap = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    console.log('download map');
    e.stopPropagation();
    //setDownloadCount(downloadCount + 1)
  };

  const goToProject = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    navigate(`/project/${map._id}`);
  };

  return (
    <div className="max-w-sm rounded overflow-hidden shadow-lg relative bg-white">
      <div
        className="relative hover:cursor-pointer mapcard"
        onClick={(e) => {
          goToProject(e);
        }}
      >
        {location.pathname.includes('home') ? (
          <button
            onClick={(e) => {
              deleteCard(e);
              //handleSetCurrentMap();
            }}
            className="absolute top-0 right-0 "
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-8 h-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
              />
            </svg>
          </button>
        ) : (
          ''
        )}
        <img className="w-full" src="/img/afgan.png" />
      </div>

      <div className="py-3 px-3">
        <div className="font-bold text-xl text-left">{name}</div>
        {expand ? <p className="text-gray-700 text-base text-left">{description}</p> : ''}
      </div>

      <div className="px-3 text-left">
        <div className="text-gray-700 text-base">
          <span className="">By</span> <span className="underline text-blue">{username}</span>
        </div>
        <div className="text-gray-700 text-base">{dateFormat}</div>
      </div>
      <div className="px-1 pt-4 pb-3 flex relative">
        <span className="pr-3 space-x-2 flex ">
          <button
            id="upvote-button"
            className={upvoteClass}
            onClick={(e) => {
              upvoteMap(e);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18"
              />
            </svg>
          </button>
          <span id="upvote-count" className="text-lg">
            {upvoteCount}
          </span>
        </span>

        <span className="pr-3 space-x-2 flex">
          <button
            id="downvote-button"
            className={downvoteClass}
            onClick={(e) => {
              downvoteMap(e);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3"
              />
            </svg>
          </button>
          <span id="downvote-count" className="text-lg">
            {downvoteCount}
          </span>
        </span>

        <span className="px-3 space-x-2 flex">
          <button
            id="download-button"
            className=""
            onClick={(e) => {
              downloadMap(e);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
              />
            </svg>
          </button>
          <span id="download-count" className="text-lg">
            {downloadCount}
          </span>
        </span>

        <button
          id="expand-collapse-button"
          className="ml-auto px-2"
          onClick={(e) => {
            e.stopPropagation();
            setExpand(!expand);
          }}
        >
          {!expand ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

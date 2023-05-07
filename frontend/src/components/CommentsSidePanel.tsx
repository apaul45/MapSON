import { useRef, useState } from 'react';
import CommentCard from './CommentCard';

import { RootState, store } from '../models';
import { useSelector } from 'react-redux';
import { addComment } from '../live-collab/socket';
import tinycolor from 'tinycolor2';
import { bgColor } from './AccountCircle';

const CommentsSidePanel = () => {
  const canComment: boolean = useSelector((state: RootState) => !!state.user.currentUser);
  const currentMap = useSelector((state: RootState) => state.mapStore.currentMap);
  const username = useSelector((state: RootState) => state.user.currentUser?.username);

  const [comment, setComment] = useState<string>('');
  const colors = useRef<Record<string, string>>({});

  //Ensure comment circle colors stay the same
  const generateColors = () => {
    currentMap?.comments.map((comment) => {
      if (!colors.current[comment.username]) {
        const color = tinycolor.random().darken(10).toHexString();
        colors.current[comment.username] = comment.username === username ? bgColor : color;
      }
    });
    return colors.current;
  };

  const handleComment = async () => {
    if (username) {
      await store.dispatch.mapStore.addComment({ username, comment });
      addComment(currentMap?._id);
      setComment('');
    }
  };

  return (
    <div
      id="comment-panel"
      className="bg-gray z-0 text-white h-[calc(100vh-64px)]"
      style={{ minWidth: '20vw' }}
    >
      <div className="overflow-y-scroll h-[92%]">
        {currentMap?.comments?.map((comment) => (
          <>
            <CommentCard comment={comment} color={generateColors()[comment.username]} />
          </>
        ))}
      </div>

      <div className="w-full h-[calc(8%-64px)]">
        <div className="flex flex-row mx-4 my-4">
          <input
            id="comment-input"
            className="peer w-[75%] rounded-[5px] border border-blue-gray-200 border-t-transparent bg-white px-3 py-2 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 focus:border-2 focus:border-pink-500 focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-blue-gray-50 disabled:opacity-75"
            placeholder={canComment ? 'Leave a comment...' : 'Please log in to comment'}
            disabled={!canComment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' ?? handleComment()}
            value={comment}
          />
          <button
            id="comment-submit-button"
            className="w-[30%] rounded-md ml-1 px-1 py-1 bg-blue disabled:opacity-75"
            disabled={!canComment}
            onClick={handleComment}
          >
            Comment
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentsSidePanel;

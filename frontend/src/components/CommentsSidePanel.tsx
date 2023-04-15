import React from 'react'
import CommentCard from './CommentCard'

import { RootState } from '../models'
import { useSelector } from 'react-redux'

const CommentsSidePanel = () => {
  const user = useSelector((state: RootState) => state.user.currentUser)

  const canComment = !!user

  return (
    <div
      className="bg-gray z-0 text-white h-[calc(100vh-64px)]"
      style={{ minWidth: '20vw' }}
    >
      <div className="overflow-y-scroll h-[92%]">
        <CommentCard />
        <CommentCard />
        <CommentCard />
        <CommentCard />
        <CommentCard />
        <CommentCard />
        <CommentCard />
        <CommentCard />
      </div>

      <div className="w-full h-[calc(8%-64px)]">
        <div className="flex flex-row mx-4 my-4">
          <input
            className="peer w-[75%] rounded-[5px] border border-blue-gray-200 border-t-transparent bg-white px-3 py-2 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 focus:border-2 focus:border-pink-500 focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-blue-gray-50 disabled:opacity-75"
            placeholder={
              canComment ? 'Leave a comment...' : 'Please log in to comment'
            }
            disabled={!canComment}
          />
          <button
            className="w-[25%] rounded-md ml-1 px-1 py-1 bg-blue disabled:opacity-75"
            disabled={!canComment}
          >
            Comment
          </button>
        </div>
      </div>
    </div>
  )
}

export default CommentsSidePanel

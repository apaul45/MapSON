import React from "react";
import CommentCard from "./CommentCard";

const CommentsSidePanel = () => {
  return (
    <div
      className="relative bg-gray z-0 text-white h-[calc(100vh-64px)]"
      style={{ minWidth: "20vw" }}
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

      <div className="flex w-full h-[8%]">
        <div className="m-auto">
          <input
            className="peer w-[50%] rounded-[5px] border border-blue-gray-200 border-t-transparent bg-white px-3 py-2 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 focus:border-2 focus:border-pink-500 focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-blue-gray-50"
            placeholder="Leave a comment..."
          />
          <button className="rounded-md ml-1 pr-5 pl-5 pt-0.5 pb-0.5 h-8 bg-blue">
            Comment
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentsSidePanel;

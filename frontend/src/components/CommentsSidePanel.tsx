import React from "react";
import CommentCard from "./CommentCard";

const CommentsSidePanel = () => {
  return (
    <div
      className="relative bg-gray z-0 text-white"
      style={{ minWidth: "20vw" }}
    >
      <div className="overflow-y-scroll h-[calc(100vh-9rem)]">
        <CommentCard></CommentCard>
        <CommentCard></CommentCard>
        <CommentCard></CommentCard>
        <CommentCard></CommentCard>
        <CommentCard></CommentCard>
        <CommentCard></CommentCard>
        <CommentCard></CommentCard>
        <CommentCard></CommentCard>
        <CommentCard></CommentCard>
        <CommentCard></CommentCard>
        <CommentCard></CommentCard>
        <CommentCard></CommentCard>
      </div>
      <div className="absolute bottom-0 w-full">
        <input
          className="m-4 w-[90%] text-black peer h-full rounded-[7px] border border-blue-gray-200 border-t-transparent bg-white px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 focus:border-2 focus:border-pink-500 focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-blue-gray-50"
          placeholder="Leave a comment..."
        />
      </div>
    </div>
  );
};

export default CommentsSidePanel;

import React from "react";
import CommentCard from "./CommentCard";

const CommentsSidePanel = () => {
  return (
    <div className="bg-gray p-2 z-0 text-white" style={{ minWidth: "20vw" }}>
      <div className='grid grid-cols-1 gap-3 relative p-2'>
        <div> 
          <CommentCard />
        </div>  
        <div> 
          <CommentCard />
        </div>
        <div> 
          <CommentCard />
        </div>
        <div> 
          <CommentCard />
        </div>
      </div>
      <div className="mt-40">
        <input 
          className="peer h-full w-55 rounded-[5px] border border-blue-gray-200 border-t-transparent bg-white px-3 py-2 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 focus:border-2 focus:border-pink-500 focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-blue-gray-50" 
          placeholder="Leave a comment..." 
        />
        <button className="rounded-md ml-1 pr-5 pl-5 pt-0.5 pb-0.5 h-8 bg-blue">
          Comment
        </button>
      </div>
    </div>
  );
};

export default CommentsSidePanel;

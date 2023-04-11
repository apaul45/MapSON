import { useRef, useState } from "react";
import { RootState, store } from "../models";
import { useSelector } from "react-redux";
import tinycolor from "tinycolor2";
import { useNavigate } from "react-router-dom";

const AccountCircle = () => {
  const [isCircleOpen, setCircleOpen] = useState(false);

  //Generate and darken random color
  const backgroundColor = useRef(tinycolor.random().darken(30).toHexString());

  const user = useSelector((state: RootState) => state.user.currentUser?.username);
  
  const navigate = useNavigate();
  const logout = () => {
    store.dispatch.user.setCurrentUser(null);
    navigate('/');
  }

  return (
    <div className="relative ml-3">
      <button
        type="button"
        className={`text-white flex w-10 h-10 justify-center place-items-center rounded-full focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800`}
        style={{backgroundColor: backgroundColor.current}}
        id="user-menu-button"
        onClick={() => setCircleOpen(!isCircleOpen)}
      >
        {user?.charAt(0)}
      </button>

      {isCircleOpen && (
        <button
          className=" text-white bg-gray absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="user-menu-button"
          onClick={() => logout()}
        >
          Logout
        </button>
      )}
    </div>
  );
};

export default AccountCircle;

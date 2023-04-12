import { useRef } from "react";
import { RootState, store } from "../models";
import { useSelector } from "react-redux";
import tinycolor from "tinycolor2";
import { useNavigate } from "react-router-dom";
import { Menu, MenuHandler, MenuItem, MenuList } from "@material-tailwind/react";

const AccountCircle = () => {
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
      <Menu>
        <MenuHandler>
          <button
          className={`text-white flex w-10 h-10 justify-center place-items-center rounded-full focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800`}
          style={{backgroundColor: backgroundColor.current}}
          id="user-menu-button"
          >
            {user?.charAt(0)}
          </button>
        </MenuHandler>
        <MenuList className="bg-gray text-white p-0 font-sans text-base">
          <MenuItem onClick={logout}>Logout</MenuItem>
        </MenuList>
      </Menu>
    </div>
  );
};

export default AccountCircle;

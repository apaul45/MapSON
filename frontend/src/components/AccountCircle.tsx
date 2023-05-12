import { useRef } from 'react';
import { RootState, store } from '../models';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Menu, MenuHandler, MenuItem, MenuList } from '@material-tailwind/react';
import { leaveAllRooms } from '../live-collab/socket';

const AccountCircle = ({ username, bgColor }: { username: string; bgColor: string }) => {
  //If this is the circle being rendered for the logged in user, render logout button
  const isLoggedIn = useSelector(
    (state: RootState) => state.user.currentUser?.username === username
  );

  //If logged in user's circle, redirect when logging out
  const navigate = useNavigate();
  const logout = () => {
    leaveAllRooms(username);
    store.dispatch.user.logout();
    navigate('/');
  };

  return (
    <div className="relative ml-3">
      <Menu>
        <MenuHandler id="user-menu-button">
          {
            //If logged in user, require clicking on circle to then logout
            isLoggedIn ? (
              <button
                className={`text-white flex w-10 h-10 justify-center place-items-center rounded-full focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800`}
                style={{ backgroundColor: bgColor }}
              >
                {username?.charAt(0)}
              </button>
            ) : (
              <div
                className={`text-white flex w-10 h-10 justify-center place-items-center rounded-full focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800`}
                style={{ backgroundColor: bgColor }}
              >
                {username?.charAt(0)}
              </div>
            )
          }
        </MenuHandler>
        <MenuList className="bg-gray text-white p-0 font-sans text-base">
          {isLoggedIn && <MenuItem onClick={logout}>Logout</MenuItem>}
          {!isLoggedIn && <MenuItem>{username}</MenuItem>}
        </MenuList>
      </Menu>
    </div>
  );
};

export default AccountCircle;

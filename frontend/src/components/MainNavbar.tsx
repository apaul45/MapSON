import { useState } from 'react';
import mapsonLogo from '/img/MapSON-logo-outlined copy.png';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { RootState, store } from '../models';
import AccountCircle from './AccountCircle';
import { useSelector } from 'react-redux';
import { Menu, MenuHandler, MenuItem, MenuList } from '@material-tailwind/react';

export const MainNavbar = () => {
  const location = useLocation();
  const isSelected = (path: string) =>
    location.pathname === path ? 'selected-nav-btn' : 'nav-btn';

  const user = useSelector((state: RootState) => state.user.currentUser);
  const { mapStore } = store.dispatch;

  const navigate = useNavigate();

  const openAddDialog = () => mapStore.setAddDialog(true);

  const handleCreateMap = async () => {
    const id = await mapStore.createNewMap({
      mapName: 'My Map',
    });

    if (id) navigate(`/project/${id}`);
  };

  //Render the main navbar everywhere except any project related screens
  return (
    <>
      {' '}
      {!location.pathname.includes('project') && (
        <nav id="main-nav" className="bg-navbar text-white">
          <div className="w-full px-5">
            <div className="relative flex h-16 items-center justify-between">
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                <div className="flex flex-shrink-0 items-center">
                  <Link to="/">
                    <img className="hidden h-8 w-auto lg:block" src={mapsonLogo}></img>
                  </Link>
                </div>

                <div className="hidden sm:ml-6 sm:block">
                  <div className="flex space-x-4">
                    {
                      //Only render user page if user logged in
                      user && (
                        <Link to="/home" className={isSelected('/home')}>
                          Home
                        </Link>
                      )
                    }
                    <Link to="/discover" className={isSelected('/discover')}>
                      Discover{' '}
                    </Link>

                    {
                      // Render search textfield for discover page only
                      location.pathname === '/discover' && (
                        <div id="search-field" className="w-72">
                          <div className="relative h-10 w-full min-w-[200px]">
                            <input
                              className="text-black peer h-full w-full rounded-[7px] border border-blue-gray-200 border-t-transparent bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 focus:border-2 focus:border-pink-500 focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-blue-gray-50"
                              placeholder="Search..."
                            />
                          </div>
                        </div>
                      )
                    }
                  </div>
                </div>
              </div>

              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                {
                  /* <!-- Profile dropdown --> */
                  user ? (
                    <>
                      {/* Add Map Button & Menu */}
                      <Menu placement="bottom-start">
                        <MenuHandler>
                          <button className="mr-2">
                            <svg
                              className="w-6 h-6 inline"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 4.5v15m7.5-7.5h-15"
                              />
                            </svg>
                            <svg
                              className="w-4 h-4 inline"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="#FFFFFF"
                              viewBox="0 0 320 512"
                            >
                              <path d="M41 288h238c21.4 0 32.1 25.9 17 41L177 448c-9.4 9.4-24.6 9.4-33.9 0L24 329c-15.1-15.1-4.4-41 17-41z" />
                            </svg>
                          </button>
                        </MenuHandler>
                        <MenuList className="bg-gray text-white p-0 font-sans text-base">
                          <MenuItem onClick={() => openAddDialog()}>
                            Import from Shapefile/GeoJSON
                          </MenuItem>
                          <hr className="align-middle" />
                          <MenuItem onClick={() => handleCreateMap()}>Create new Map</MenuItem>
                        </MenuList>
                      </Menu>
                      <AccountCircle />
                    </>
                  ) : (
                    <>
                      {location.pathname !== '/login' && (
                        <Link to="/login" id="login-button" className="acct-btn mr-2">
                          {' '}
                          Login{' '}
                        </Link>
                      )}
                      {location.pathname !== '/register' && (
                        <Link to="/register" id="register-button" className="acct-btn">
                          {' '}
                          Register{' '}
                        </Link>
                      )}
                    </>
                  )
                }
              </div>
            </div>
          </div>
        </nav>
      )}
    </>
  );
};

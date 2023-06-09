import { useEffect, useState } from 'react';
import mapsonLogo from '/img/MapSON-logo-outlined copy.png';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { RootState, store } from '../models';
import AccountCircle from './AccountCircle';
import { useSelector } from 'react-redux';
import { Input, Menu, MenuHandler, MenuItem, MenuList } from '@material-tailwind/react';

export const MainNavbar = () => {
  const location = useLocation();
  const isSelected = (path: string) =>
    location.pathname === path ? 'selected-nav-btn' : 'nav-btn';

  const user = useSelector((state: RootState) => state.user.currentUser);
  const filter = useSelector((state: RootState) => state.mapStore.mapFilter);
  const { mapStore } = store.dispatch;

  const navigate = useNavigate();

  const openAddDialog = () => mapStore.setAddDialog(true);

  const showSearchBar = () => ['/home', '/discover'].includes(location.pathname);

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
                      showSearchBar() && (
                        <div id="search-field" className="w-72">
                          <div className="relative flex w-full max-w-[24rem] text-white">
                            <Input
                              id="discover-input"
                              label="Search"
                              className="text-white"
                              size="lg"
                              value={filter}
                              onChange={(e) => mapStore.setMapFilter(e.target.value)}
                            />
                            {/* <Button size="sm" className="!absolute right-1 top-1 rounded">
                              Submit
                            </Button> */}
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
                              id="plus-sign"
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
                      <AccountCircle username={user.username} bgColor={user.bgColor} />
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

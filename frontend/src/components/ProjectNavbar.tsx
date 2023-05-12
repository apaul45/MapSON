import { useState } from 'react';
import { RootState } from '../models';
import AccountCircle from './AccountCircle';
import { useSelector } from 'react-redux';
import { Menu, MenuHandler, IconButton } from '@material-tailwind/react';
import ProjectMenu from './ProjectMenu';

interface Props {
  shareOpen: boolean;
  setShareOpen: Function;

  canEditName: boolean;
  mapName: string;
  setMapName: Function;

  sidePanelToggle: boolean;
  setSidePanelToggle: Function;
}

export const ProjectNavbar = ({
  shareOpen,
  setShareOpen,
  canEditName,
  mapName,
  setMapName,
  sidePanelToggle,
  setSidePanelToggle,
}: Props) => {
  const [isEditNameActive, setEditNameActive] = useState(false);

  const loggedInUser = useSelector((state: RootState) => state.user.currentUser?.username);
  const clientList = useSelector((state: RootState) => state.mapStore.roomList);

  //TODO: Make this update the actual current map name (probably through a callback to project screen)
  const handleNameChange = (e: any) => {
    if (e.code === 'Enter') {
      setMapName(e.target.value);
    }

    setEditNameActive(e.code !== 'Enter');
  };

  return (
    <nav className="bg-navbar w-screen text-white">
      <div className="w-full px-5">
        <div className="relative flex h-16 items-center justify-between">
          <Menu placement="bottom-start">
            <MenuHandler id="menu-button">
              <button className="mr-24">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-10 h-10"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 12a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </MenuHandler>
            <ProjectMenu />
          </Menu>

          <div className="text-center">
            {!isEditNameActive ? (
              <u
                id="project-name"
                className="text-xl font-medium"
                onDoubleClick={() => setEditNameActive(canEditName)}
              >
                {' '}
                {mapName}{' '}
              </u>
            ) : (
              <input
                id="project-namefield"
                className="text-white h-full w-full rounded-[7px] border-t-transparent bg-navbar px-3 py-2.5 font-sans text-sm font-normal transition-all outline outline-1 outline-white"
                defaultValue={mapName}
                onKeyUp={(e) => handleNameChange(e)}
              />
            )}
          </div>

          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            {
              //Render other users to the left of the two panel buttons
              // TODO: Make this so that clientList is dictionary, and circles for users in currentMap room are rendered
              clientList
                .filter((user) => user !== loggedInUser)
                .map((user) => (
                  <div className="mr-2">
                    <AccountCircle username={user} />
                  </div>
                ))
            }

            <IconButton
              variant={!sidePanelToggle ? 'filled' : 'text'}
              onClick={() => setSidePanelToggle(false)}
              className={`transition-all ml-1 mr-2 ${!sidePanelToggle ? 'bg-gray/80' : ''}`}
            >
              <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAADxUlEQVR4nO3dSYsVVxyG8VITETRgou0MSUgQHBoCjuBGxI0EXYTs8gXyBSTLdLoblaRtNU4IguKAiJhhI0IEBT+AIYsMbZNxkckJNcG+wTxSWmBz+9TtqlPn3P7fuu+zbG6dU1U/aug7JkkWsAgYBkaBBqpsjWzf7QUWJlUCNgJ/l14FlddfwAZfjPTIEEYclAU+IOkhpuL0iQ9Iet5TcRrxAdEFPF4NHxAVMYEYSyDGEoixBGIsgRhLIMYSSKeDKKWUUr5N9UWv7iUCsZVAjCUQYwnEWAIxlkCMJRBjCcRYAjGWQIwlkG4F8R036dAQiK0EYiyBGMs8iCqWQIwlEGMJxFgCMZZAjGXmdi7YChpJIMYSiLEEYizzIKpYAjGWQIwlEGMJxFgCMda4m6d5QC+wHJjV9ts53+Ws5i0CHwDfNv1tDLgCvBNsIt8NSDo04nUZeKXyRL4bkHRoxO0b4KVKE/luQNKhEb9z7ZpIFet/YL1AbHVMIHG7VvLxowKJV192SegrscyYQCJijLshKIoikAh9lHOX1hf1lOV7m5gYjTDtmWSO9L/2Vh0VSFYAjP6kQC2OlPS2d51AstqBMW6uq44xzlZakQKTei03VfnuB2Cg5Dz9UZ46UV4Yg7h/ReH57404HqCK9XGAI+Pu0+tG0wNVfIwBxxh3gLWuB6u4GIM5GGvyFlCRfqAF2JVzzehttZCKg7HbMcafLTEEEh4DmAbsz8FYXWQAFRbjgDeGQCZtqCTGp44x/gBWFR1HR0g4jIM5GCsLYwgkGMYhxxi/l8YQSBCMwzkYK0pjCGRCewNg/Aa86YUhkEoYR5jYr5UwBOKFMR04gRvjjUoYAimNMQM4ycR+CYKRTZKe87q1oZIYpxxj/AS8FgQjm2hbdrh1W0MlMc44xvgReDUYRt0D3gJuOXbkcEmM044xfgZej7sFNYq4GGFPU3UPWAHcrojxAnDeMcZNYFncLahZwFcVMV4ELjjGGAGWxl37mgXMBf5r2pH7SmJcdGD8IAyPgHebduTj3NevJy47E/jMgfEdsNhnfbo+4Lhjh94DNhbA+Nyx7PfAkq7fsb61+J/qAbC5BcYXwggczz6Y36qHwBYHxpc6TUUI2Mnk/QNsFUYb4tm3IxTpX2AHcCnnjc897VjfWgfMBh5Rra+B+VO9LbUI2F4R44YwwoIcqogxL+T6dH3AqAfE/ezJw5e7fgeGDFhSEKABXAc+BDalTyAKIkJAT/YdVK4PUqZ3TfuAt4E5AmhTwPvZU+7pC0fpmxDeAxZ1GsATkmbtBSDeBSYAAAAASUVORK5CYII="></img>
            </IconButton>

            <IconButton
              variant={sidePanelToggle ? 'filled' : 'text'}
              id="comment-button"
              onClick={() => setSidePanelToggle(true)}
              className={`transition-all ml-1 mr-2 ${sidePanelToggle ? 'bg-gray/80' : ''}`}
            >
              {sidePanelToggle ? (
                <svg
                  id="filled-comment"
                  width="28"
                  height="28"
                  viewBox="0 0 135 120"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clipPath="url(#clip0_93_108)">
                    <path
                      d="M45 90H102.583L112.5 96.925V45H118.125C119.617 45 121.048 45.5268 122.102 46.4645C123.157 47.4021 123.75 48.6739 123.75 50V117.5L98.6906 100H50.625C49.1332 100 47.7024 99.4732 46.6475 98.5355C45.5926 97.5979 45 96.3261 45 95V90ZM30.6844 80L5.625 97.5V20C5.625 18.6739 6.21763 17.4021 7.27252 16.4645C8.32742 15.5268 9.75816 15 11.25 15H95.625C97.1168 15 98.5476 15.5268 99.6025 16.4645C100.657 17.4021 101.25 18.6739 101.25 20V80H30.6844Z"
                      fill="white"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_93_108">
                      <rect width="135" height="120" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              ) : (
                <svg
                  id="unfilled-comment"
                  width="28"
                  height="28"
                  viewBox="0 0 137 147"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clipPath="url(#clip0_82_648)">
                    <path
                      d="M31.1386 91.875L5.70801 113.312V18.375C5.70801 16.7505 6.30942 15.1926 7.37994 14.044C8.45046 12.8953 9.9024 12.25 11.4163 12.25H97.0413C98.5553 12.25 100.007 12.8953 101.078 14.044C102.148 15.1926 102.75 16.7505 102.75 18.375V91.875H31.1386ZM27.1885 79.625H91.333V24.5H17.1247V88.1081L27.1885 79.625ZM45.6663 104.125H104.103L114.166 112.608V49H119.875C121.389 49 122.841 49.6453 123.911 50.794C124.982 51.9426 125.583 53.5005 125.583 55.125V137.812L100.152 116.375H51.3747C49.8607 116.375 48.4088 115.73 47.3383 114.581C46.2678 113.432 45.6663 111.874 45.6663 110.25V104.125Z"
                      fill="white"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_82_648">
                      <rect width="137" height="147" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              )}
            </IconButton>

            <button
              id="share-button"
              className="rounded-md pr-5 pl-5 pt-0.5 pb-0.5 mr-2 bg-blue"
              onClick={() => setShareOpen(!shareOpen)}
            >
              Share
            </button>
            {loggedInUser && <AccountCircle username={loggedInUser} />}
          </div>
        </div>
      </div>
    </nav>
  );
};

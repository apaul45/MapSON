import { Fragment } from 'react';
import { Dialog, DialogBody, DialogFooter, DialogHeader, Input } from '@material-tailwind/react';
import { RootState, store } from '../../models';
import { useSelector } from 'react-redux';
import { bgColor } from '../AccountCircle';
import tinycolor from 'tinycolor2';

interface Props {
  isOpen: boolean;
  closeDialog: Function;
}

export const publish = () => {};

const ShareMapDialog = ({ isOpen, closeDialog }: Props) => {
  const map = useSelector((state: RootState) => state.mapStore.currentMap);
  const user = useSelector((state: RootState) => state.user.currentUser);

  const unpublish = () => {};
  const invite = () => {};
  const copyLink = () => {};
  const removeAccess = () => {};
  return (
    <Fragment>
      <Dialog open={isOpen} handler={() => closeDialog()} size="xs" className="bg-gray block">
        <DialogHeader className="text-white">Share this map</DialogHeader>

        {map?.published.isPublished ? (
          <DialogBody className="text-white justify-center text-center">
            Unpublish this list to make edits and <br></br>invite others to edit
          </DialogBody>
        ) : //@ts-ignore
        map?.owner._id === user?._id ? (
          <DialogBody>
            <div className="flex space-x-5">
              <Input label="Username" className=""></Input>
              <button
                onClick={() => invite()}
                className="rounded-md text-left bg-blue hover:bg-blue-700 outline outline-1 text-white font-medium p-1 m-auto"
              >
                Invite
              </button>
            </div>
            <div className="my-3 w-full">
              <p className="text-white">people with access:</p>
              {map?.userAccess.map((username) => {
                return (
                  <div className="flex my-1">
                    <div
                      className="rounded-full w-7 h-7 text-center text-white"
                      style={{
                        backgroundColor:
                          username === user?.username
                            ? bgColor
                            : tinycolor.random().darken(30).toHexString(),
                      }}
                    >
                      {username.charAt(0)}
                    </div>
                    <p className="text-white mx-1">
                      {username}
                      {username === user?.username ? '(you)' : null}
                    </p>
                    {username === user?.username ? null : (
                      <button
                        className="flex text-red-900 ml-auto"
                        onClick={() => {
                          removeAccess();
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="red"
                          className=" w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                          />
                        </svg>
                        Remove Access
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </DialogBody>
        ) : null}

        <DialogFooter className="">
          <button
            onClick={() => copyLink()}
            className="rounded-md text-left mr-1 bg-gray outline outline-1 text-white font-medium p-2"
          >
            Copy Link
          </button>

          {map?.published.isPublished ? (
            <button
              onClick={() => unpublish()}
              className="rounded-md text-left mr-1 bg-blue hover:bg-blue-700 outline outline-1 text-white font-medium p-2 m-auto"
            >
              Unpublish
            </button>
          ) : //@ts-ignore
          map?.owner._id === user?._id ? (
            <button
              onClick={() => publish()}
              className="rounded-md text-left mr-1 bg-blue hover:bg-blue-700 outline outline-1 text-white font-medium p-2 m-auto"
            >
              Publish
            </button>
          ) : null}
        </DialogFooter>
      </Dialog>
    </Fragment>
  );
};
export default ShareMapDialog;

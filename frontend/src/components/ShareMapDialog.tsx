import { Fragment } from "react";
import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
} from "@material-tailwind/react";
import { RootState, store } from "../models";
import { useSelector } from "react-redux";

interface Props {
    isOpen: boolean;
    closeDialog: Function;
}

const ShareMapDialog = ({isOpen, closeDialog}: Props) => {
  return (
    <Fragment>
      <Dialog open={isOpen} handler={() => {return}} size="xs" className="bg-gray block place-items-center">
        <DialogHeader className="text-white justify-center">
            Share this map

            <button onClick={() => closeDialog()} className="text-right">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </DialogHeader>
        <DialogFooter className="justify-center">
          <button
            onClick={() => closeDialog()}
            className="rounded-md justify-center mr-1 bg-gray outline outline-1 text-white font-medium p-2"
          >
            Copy Link
          </button>
        </DialogFooter>
      </Dialog>
    </Fragment>
  );
}
export default ShareMapDialog;
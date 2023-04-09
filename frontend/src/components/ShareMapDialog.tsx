import { Fragment } from "react";
import {
  Dialog,
  DialogFooter,
  DialogHeader,
} from "@material-tailwind/react";
import { RootState, store } from "../models";
import { useSelector } from "react-redux";

const ShareMapDialog = () => {
  const isOpen = useSelector((state: RootState) => state.mapStore.shareDialog);
  const closeDialog = () => store.dispatch.mapStore.setShareDialog(false);

  return (
    <Fragment>
      <Dialog open={isOpen} handler={() => closeDialog()} size="sm">
        <DialogHeader className="flex justify-center">
          Share this map
        </DialogHeader>
        <button
            onClick={() => closeDialog()}
            className="rounded-md justify-center mr-1 bg-white text-black font-medium p-2"
          >
            X
        </button>
        <div>
            <input placeholder="Add people..." />
            People with access:
        </div>
        <div>
            <ul>ausername</ul>
            <ul>ausername</ul>
            <ul>ausername</ul>
        </div>
        <button
            
            className="rounded-md justify-center mr-1 bg-white text-black font-medium p-2"
        >
            Copy Link
        </button><button
            onClick={() => closeDialog()}
            className="rounded-md justify-center mr-1 bg-white text-black font-medium p-2"
          >
            Publish
        </button>
      </Dialog>
    </Fragment>
  );
}
export default ShareMapDialog;
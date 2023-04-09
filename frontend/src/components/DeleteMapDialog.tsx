import { Fragment } from "react";
import {
  Dialog,
  DialogFooter,
  DialogHeader,
} from "@material-tailwind/react";
import { RootState, store } from "../models";
import { useSelector } from "react-redux";

const DeleteMapDialog = () => {
  const isOpen = useSelector((state: RootState) => state.mapStore.deleteDialog);
  const closeDialog = () => store.dispatch.mapStore.setDeleteDialog(false);

  return (
    <Fragment>
      <Dialog open={isOpen} handler={() => closeDialog()} size="sm" className="bg-gray text-white">
        <DialogHeader className="flex justify-center text-white">
          Are you sure you want to delete this map?
        </DialogHeader>
        <DialogFooter className="flex justify-center">
          <button
            onClick={() => closeDialog()}
            className="rounded-md justify-center mr-1 text-white font-medium p-2"
          >
            Cancel
          </button>
          <button
            onClick={() => closeDialog()}
            className="rounded-md justify-center mr-1 bg-blue text-white font-medium p-2"
          >
            Confirm
          </button>
        </DialogFooter>
      </Dialog>
    </Fragment>
  );
}
export default DeleteMapDialog;
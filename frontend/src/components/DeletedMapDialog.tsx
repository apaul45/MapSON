import { Fragment } from "react";
import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
} from "@material-tailwind/react";
 
interface Props {
    isOpen: boolean;
    closeDialog: Function;
}

const DeletedMapDialog = ({isOpen, closeDialog}: Props) => {

  return (
    <Fragment>
      <Dialog open={isOpen} handler={() => closeDialog()} size="xs" className="block place-items-center">
        <DialogBody className="flex justify-center place-items-center">
            <i className="mt-4 fa-solid fa-circle-exclamation fa-2xl" style={{color: "#ff0000"}}></i>
        </DialogBody>
        <DialogHeader className="justify-center">
            This map was deleted
        </DialogHeader>
        <DialogFooter className="justify-center">
          <button
            onClick={() => closeDialog()}
            className="rounded-md p-1 justify-center mr-1 bg-blue text-white"
          >
            Exit project
          </button>
        </DialogFooter>
      </Dialog>
    </Fragment>
  );
}

export default DeletedMapDialog;
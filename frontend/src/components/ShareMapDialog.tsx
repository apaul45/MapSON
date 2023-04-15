import { Fragment } from 'react'
import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
} from '@material-tailwind/react'
import { RootState, store } from '../models'
import { useSelector } from 'react-redux'

interface Props {
  isOpen: boolean
  closeDialog: Function
}

const ShareMapDialog = ({ isOpen, closeDialog }: Props) => {
  return (
    <Fragment>
      <Dialog
        open={isOpen}
        handler={() => closeDialog()}
        size="xs"
        className="bg-gray block place-items-center"
      >
        <DialogHeader className="text-white justify-center">
          Share this map
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
  )
}
export default ShareMapDialog

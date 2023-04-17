import { Fragment } from 'react'
import { useSelector } from 'react-redux'
import { RootState, store } from '../../models'
import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
} from '@material-tailwind/react'

export const ErrorDialog = () => {
  const errorMessage = useSelector(
    (state: RootState) => state.error.errorMessage
  )
  const closeDialog = () => store.dispatch.error.setError(null)

  return (
    <Fragment>
      <Dialog
        id="error-dialog"
        open={errorMessage !== null}
        handler={() => closeDialog()}
        size="xs"
        className="bg-gray block place-items-center"
      >
        <DialogBody className="flex justify-center place-items-center">
          <i
            className="fa-solid fa-triangle-exclamation fa-2xl mt-2"
            style={{ color: '#ff004c' }}
          ></i>
        </DialogBody>

        <DialogHeader className="text-white justify-center">
          {errorMessage}
        </DialogHeader>

        <DialogFooter className="justify-center">
          <button
            onClick={() => closeDialog()}
            className="rounded-md justify-center mr-1 bg-gray outline outline-1 text-white font-medium p-2"
          >
            Close
          </button>
        </DialogFooter>
      </Dialog>
    </Fragment>
  )
}

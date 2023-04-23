import { Fragment } from 'react'
import { Dialog, DialogFooter, DialogHeader } from '@material-tailwind/react'
import { RootState, store } from '../../models'
import { useSelector } from 'react-redux'

const DeleteMapDialog = () => {
  const isOpen = useSelector((state: RootState) => state.mapStore.deleteDialog)
  const closeDialog = () => store.dispatch.mapStore.setDeleteDialog(false)
  const mapMarkedForDeletion = useSelector((state: RootState) => state.mapStore.mapMarkedForDeletion)

  const handleDelete = async () => {
    console.log("Deleteing " + mapMarkedForDeletion)
    store.dispatch.mapStore.deleteMap(mapMarkedForDeletion);
    closeDialog();
  }

  return (
    <Fragment>
      <Dialog
        open={isOpen}
        handler={() => closeDialog()}
        size="sm"
        className="bg-gray text-white"
      >
        <DialogHeader className="flex justify-center text-white">
          Are you sure you want to delete this map?
        </DialogHeader>
        <DialogFooter className="flex justify-center">
          <button onClick={() => closeDialog()} className="delete-dialog">
            Cancel
          </button>
          <button
            onClick={() => handleDelete()}
            className="bg-blue delete-dialog"
          >
            Confirm
          </button>
        </DialogFooter>
      </Dialog>
    </Fragment>
  )
}
export default DeleteMapDialog

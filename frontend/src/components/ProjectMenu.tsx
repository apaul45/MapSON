import { MenuList, MenuItem, Menu, MenuHandler } from "@material-tailwind/react"
import { useSelector } from "react-redux"
import { RootState, store } from "../models"
import { Link } from "react-router-dom";

const ProjectMenu = () => {
  const user = useSelector((state: RootState) => state.user.currentUser);
  const openDeleteDialog = () => store.dispatch.mapStore.setDeleteDialog(true);
    
  return (
    <MenuList className="bg-gray text-white p-0 font-sans text-base">
        <MenuItem className='text-sort-by mb-0.5 text-lg pointer-events-none'> File </MenuItem>

        <MenuItem className='hover:bg-sort-hover'>Save</MenuItem>
        <MenuItem className='hover:bg-sort-hover'>Import</MenuItem>

        <Menu placement='right-start'>
            <MenuHandler>
                <MenuItem>Download as</MenuItem>
            </MenuHandler>

            <MenuList className="bg-gray text-white p-0 font-sans text-base">
                <MenuItem className='hover:bg-sort-hover'>Shapefile</MenuItem>
                <MenuItem className='hover:bg-sort-hover'>GeoJSON</MenuItem>
            </MenuList>
        </Menu>

        <MenuItem>Make a copy</MenuItem>

        <hr className="my-2 border-blue-gray-50 outline-none" />

        <MenuItem className='text-sort-by text-lg pt-0 pointer-events-none'> Edit </MenuItem>
        <MenuItem className='hover:bg-sort-hover'>Undo</MenuItem>
        <MenuItem className='hover:bg-sort-hover'>Redo</MenuItem>

        <hr className="my-2 border-blue-gray-50 outline-none" />

        <MenuItem className='hover:bg-sort-hover'>Share</MenuItem>

        <Link to={user ? '/home' : '/discover'} className='hover:bg-sort-hover hover:outline-none'>
            <MenuItem>Exit project</MenuItem>
        </Link>

        <MenuItem 
         className='hover:bg-sort-hover text-red-400' 
         onClick={() => openDeleteDialog()}>
            Delete map
        </MenuItem>
    </MenuList>
  )
}

export default ProjectMenu
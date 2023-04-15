import { useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { AddMapDialog } from '../dialogs/AddMapDialog'
import { store } from '../../models'
import { Menu, MenuHandler, MenuItem, MenuList } from '@material-tailwind/react'
import { MapCard } from '../map'

export const HomeDiscoverScreen = () => {
  const mapStore = store.dispatch.mapStore
  const location = useLocation()
  const navigate = useNavigate()

  const sortOptions = ['Upvotes', 'Downloads', 'Oldest-Newest', 'Newest-Oldest']
  const [sortBy, setSortBy] = useState<string>('upvote')

  const openAddDialog = () => mapStore.setAddDialog(true)

  return (
    <>
      <div className="h-max bg-gray px-3 py-3 relative min-h-screen">
        <div className="text-right relative pb-3 ">
          <Menu>
            <MenuHandler>
              <button className="text-base bg-sort rounded px-1">
                Sort by: {sortBy}
                <svg
                  className="w-4 h-4 inline pb-1"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="current"
                  viewBox="0 0 320 512"
                >
                  <path d="M41 288h238c21.4 0 32.1 25.9 17 41L177 448c-9.4 9.4-24.6 9.4-33.9 0L24 329c-15.1-15.1-4.4-41 17-41z" />
                </svg>
              </button>
            </MenuHandler>
            <MenuList className="bg-gray text-white p-0 font-sans text-base">
              <MenuItem className="text-lg text-sort-by pointer-events-none">
                Sort By...
              </MenuItem>
              {sortOptions.map((option) => (
                <MenuItem
                  id={`menu-${option}`}
                  onClick={() => setSortBy(option)}
                >
                  {option}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        </div>
        <div className="grid grid-cols-5 gap-3 relative ">
          {location.pathname.includes('home') && (
            <>
              <div
                id="add-project"
                className="max-w-sm rounded overflow-hidden border-white border-2 grid place-content-center hover:cursor-pointer"
                onClick={openAddDialog}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="current"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-20 h-20 text-white mx-auto"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
                <div className="text-3xl text-white">Import a Map</div>
                <div className="text-white text-sm">
                  From ESRI shapefile or GeoJSON
                </div>
              </div>

              <div
                id="new-project"
                className="max-w-sm rounded overflow-hidden border-white border-2 grid place-content-center border-dashed hover:cursor-pointer"
                onClick={() => {
                  navigate('/project/default')
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="current"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-20 h-20 text-white mx-auto"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
                <div className="text-3xl text-white">
                  Create New Map from Scratch
                </div>
              </div>
            </>
          )}

          {[...Array(5).keys()].map(() => (
            <div>
              <MapCard />
            </div>
          ))}
        </div>
      </div>
      <AddMapDialog />
    </>
  )
}

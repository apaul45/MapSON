import { useLocation } from 'react-router-dom'
import MapCard from './MapCard'
import { useState } from 'react'
import { AddMapDialog } from './AddMapDialog'
import { store } from '../models'

export const HomeDiscoverScreen = () => {
    const mapStore = store.dispatch.mapStore;
    const location = useLocation();

    const [isMenuOpen, setMenuOpen] = useState<boolean>(false)
    const [sortBy, setSortBy] = useState<string>('upvote')

    const sortMaps = (type: string) => {
        setSortBy(type)
        setMenuOpen(false)
    }

    const openAddDialog = () => mapStore.setAddDialog(true);

    return (
        <>
            <div className='h-max bg-gray px-3 py-3 relative'>
                <div className='text-right relative pb-3 '>
                    <button onClick={() => setMenuOpen(!isMenuOpen)} className='text-base bg-sort rounded px-1'>
                        Sort by: {sortBy}
                        <svg className="w-4 h-4 inline pb-1" xmlns="http://www.w3.org/2000/svg" fill="current" viewBox="0 0 320 512">
                            <path d="M41 288h238c21.4 0 32.1 25.9 17 41L177 448c-9.4 9.4-24.6 9.4-33.9 0L24 329c-15.1-15.1-4.4-41 17-41z" />
                        </svg>
                    </button>
                    {
                        isMenuOpen &&
                        <div id="sort-menu" className="bg-gray text-white absolute right-0 z-10 w-48 origin-top-right py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none text-left space-y-2 p-2 rounded" role="menu" aria-orientation="vertical" aria-labelledby="user-menu-button">
                            <p className='text-lg text-sort-by'>Sort By...</p>
                            <button onClick={() => { sortMaps('Upvotes') }} className='sort-btn'>Upvotes</button> <br />
                            <button onClick={() => { sortMaps('Downloads') }} className='sort-btn'>Downloads</button> <br />
                            <button onClick={() => { sortMaps('Oldest-Newest') }} className='sort-btn'>Oldest-Newest</button> <br />
                            <button onClick={() => { sortMaps('Newest-Oldest') }} className='sort-btn'>Newest-Oldest</button>
                        </div>
                    }
                </div>
                <div className='grid grid-cols-5 gap-3 relative '>
                    {
                        location.pathname.includes('home') &&
                            <>
                                <div id="add-project" className="max-w-sm rounded overflow-hidden border-white border-2 grid place-content-center col-end-0 hover:cursor-pointer" onClick={openAddDialog}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="current" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-20 h-20 text-white mx-auto">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg>
                                    <div className='text-3xl text-white' >Import a Map</div>
                                    <div className='text-white text-sm'>From ESRI shapefile or GeoJSON</div>
                                </div>
                                

                                <div id="new-project" className="max-w-sm rounded overflow-hidden border-white border-2 grid place-content-center border-dashed col-end-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="current" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-20 h-20 text-white mx-auto">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg>
                                    <div className='text-3xl text-white' >Create New Map from Scratch</div>
                                </div>
                            </>
                    }

                    <div>
                        <MapCard />
                    </div>
                    <div>
                        <MapCard />
                    </div>
                    <div >
                        <MapCard />
                    </div>
                    <div>
                        <MapCard />
                    </div>
                    <div>
                        <MapCard />
                    </div>
                    <div>
                        <MapCard />
                    </div>
                </div>
            </div>
            <AddMapDialog />
        </>
    )
}

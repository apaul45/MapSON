import { useSelector } from "react-redux"
import { RootState, store } from "../models"
import { useNavigate } from "react-router-dom";

export const AddMapDialog = () => {
    const isOpen = useSelector((state: RootState) => state.mapStore.addDialog);
    const closeDialog = () => store.dispatch.mapStore.setAddDialog(false);
    const navigate = useNavigate()

    return (
        <>
            {isOpen &&
                <div className="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="fixed inset-0 z-10 overflow-y-auto">
                        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center">

                            <div id="add-dialog" className="relative overflow-hidden rounded-lg bg-gray shadow-xl sm:my-8 sm:w-full sm:max-w-sm border-white border-2 m-auto flex flex-col justify-center items-center">
                                <button  id='close-dialog' className='absolute top-0 right-0' onClick={() => closeDialog()}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="current" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>

                                <span className='text-xl text-white pt-10 pb-5'>
                                    Map Name
                                </span>

                                <input
                                    className="peer w-3/4 h-10 rounded-[7px] border border-blue-gray-200 border-t-transparent bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 "
                                    placeholder="Enter a name"
                                />

                                <span className='text-xl text-white pt-10 pb-5'>
                                    Format
                                </span>

                                <div className="flex items-center mb-4 space-x-5">
                                    <div>
                                        <input id="Shapefile" type="radio" value="shapefile" name="import" className="text-blue" />
                                        <label htmlFor="Shapefile" className="text-white">ESRI Shapefile</label>
                                    </div>
                                    <div>
                                        <input id="geojson" type="radio" value="geojson" name="import" className="text-blue" />
                                        <label htmlFor="geojson" className="text-white">GeoJSON</label>
                                    </div>
                                </div>


                                <div className='border border-white border-dashed h-100 w-3/4 rounded-lg my-5 text-white p-20'>
                                    Drag files into box or click to browse
                                </div>


                                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded my-5" onClick={() => {navigate('/project/default')}}>
                                    Submit
                                </button>

                            </div>
                        </div>
                    </div>
                </div>}
        </>
    )
}

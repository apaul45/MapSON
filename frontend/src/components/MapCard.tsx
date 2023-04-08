import { useState } from 'react'


export default function MapCard() {
    const [expand, setExpand] = useState<boolean>(false)

    const description: string = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam odio nulla, tincidunt sit amet ultricies placerat, mollis a sem. Phasellus eget dui in ante porta vehicula ac in ante. Praesent bibendum volutpat risus, id efficitur turpis porta vel. Praesent tempus posuere tortor non faucibus. Sed imperdiet ex cursus felis condimentum bibendum. Sed scelerisque, velit eget bibendum ultrices, tortor quam aliquet risus, id hendrerit arcu metus et ante. '

    const deleteCard = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        console.log('delete card')
    }

    const upvoteMap = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        console.log('upvote map')
    }

    const downvoteMap = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        console.log('downvote map')
    }

    const downloadMap = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        console.log('download map')
    }

    return (
        <>
            <div className="max-w-sm rounded overflow-hidden shadow-lg relative">
                <div className='relative'>
                    <button onClick={(e) => { deleteCard(e) }} className='absolute top-0 right-0 '>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                    </button>
                    <img className="w-full" src="/img/afgan.png" />
                </div>

                <div className="py-4 px-3">
                    <div className="font-bold text-xl mb-2 text-left">afghanistan</div>
                    <p className="text-gray-700 text-base text-left">
                        {expand ? description : description.substring(0, 90) + "..."}
                    </p>
                </div>
                <div className="py-4 px-3 text-left">
                    <div className="text-gray-700 text-base">
                        <span className=''>By</span> <span className='underline text-blue'>Imtiyaz</span>
                    </div>
                    <div className="text-gray-700 text-base">April 7, 2023</div>
                </div>
                <div className="px-1 pt-4 pb-3 flex">

                    <span className='pr-3 space-x-2 flex '>
                        <button className='text-upvote' onClick={(e) => { upvoteMap(e) }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                            </svg>

                        </button>
                        <span className='text-lg'>10</span>
                    </span>

                    <span className='pr-3 space-x-2 flex'>
                        <button className='text-downvote' onClick={(e) => { downvoteMap(e) }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                            </svg>

                        </button>
                        <span className='text-lg'>10</span>
                    </span>

                    <span className='px-3 space-x-2 flex'>
                        <button className='' onClick={(e) => { downloadMap(e) }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                            </svg>
                        </button>
                        <span className='text-lg'>10</span>
                    </span>

                    <button className="absolute bottom-0 right-0 px-3 py-3" onClick={() => { setExpand(!expand) }}>
                        {
                            !expand ?
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                </svg>
                                :
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                                </svg>
                        }
                    </button>

                </div>
            </div>
        </>
    )
}

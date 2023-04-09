import { useState } from 'react';
import mapsonLogo from '../assets/MapSON-logo-outlined copy.png';
import { Link, useLocation } from 'react-router-dom';
import { store } from '../models';
import AccountCircle from './AccountCircle';

export const MainNavbar = () => {
    const location = useLocation();
    const user = store.getState().user.currentUser;

    const [isMenuOpen, setMenuOpen] = useState(false); //For openign and closing user's add menu

    const navBtn = "bg-gray-900 text-white hover:bg-navbar-hover rounded-md px-3 py-2 text-lg font-medium";
    const selectedNavBtn = "text-white bg-navbar-hover rounded-md px-3 py-2 text-lg font-medium";
    
    //Render the main navbar everywhere except any project related screens
    return (<> { !location.pathname.includes('project') &&
        <nav id="main-nav" className="bg-navbar text-white">
            <div className="w-full px-5">
                <div className="relative flex h-16 items-center justify-between">
                    <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                        <div className="flex flex-shrink-0 items-center">
                            <img className="hidden h-8 w-auto lg:block" src={mapsonLogo}></img>
                        </div>
                        
                        <div className="hidden sm:ml-6 sm:block">
                            <div className="flex space-x-4">
                                {
                                    //Only render user page if user logged in
                                    user &&
                                    <Link to='/home' className={location.pathname === '/home' ? selectedNavBtn : navBtn}>Home</Link>
                                }
                                <Link to='/discover' className={location.pathname === '/discover' ? selectedNavBtn : navBtn}>Discover </Link>
                                
                                {
                                    // Render search textfield for discover page only
                                    location.pathname === '/discover' && 
                                
                                    <div id="search-field" className="w-72">
                                        <div className="relative h-10 w-full min-w-[200px]">
                                            <input
                                            className="text-black peer h-full w-full rounded-[7px] border border-blue-gray-200 border-t-transparent bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 focus:border-2 focus:border-pink-500 focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-blue-gray-50"
                                            placeholder="Search..."
                                            />
                                        </div>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>

                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            
                    {/* <!-- Profile dropdown --> */
                        user ? 
                        
                        <>
                            <div className='relative'>
                                <button onClick={() => setMenuOpen(!isMenuOpen)} className="mr-2">
                                    <svg className="w-6 h-6 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                                    <svg className="w-4 h-4 inline" xmlns="http://www.w3.org/2000/svg" fill="#FFFFFF" viewBox="0 0 320 512"><path d="M41 288h238c21.4 0 32.1 25.9 17 41L177 448c-9.4 9.4-24.6 9.4-33.9 0L24 329c-15.1-15.1-4.4-41 17-41z"/></svg>
                                </button>

                                {
                                    isMenuOpen &&
                                    <div className="bg-gray text-white outline outline-1 outline-white absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="user-menu-button">
                                        <button>Import from Shapefile</button>
                                        <hr/>
                                        <button>Create new Map</button>
                                    </div>
                                }
                            </div>
                            <AccountCircle />                        
                        </>
                
                        : 
                        
                        <>
                            { location.pathname !== '/login' &&
                              <Link to="/login" id="login-button" className="rounded-md p-1 mr-2 bg-blue"> Login </Link>
                            }
                            { location.pathname !== '/register' &&
                              <Link to="/register" id="register-button" className="rounded-md p-1 bg-blue"> Register </Link>
                            }
                        </>
                    }
                    </div>
                </div>
            </div>
      </nav> 
    }</>)
}

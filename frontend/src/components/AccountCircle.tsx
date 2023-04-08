import React, { useState } from 'react'

const AccountCircle = () => {
    const [isCircleOpen, setCircleOpen] = useState(false);


  return (
    <div className="relative ml-3">
        <button 
        type="button" className="flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800" 
        id="user-menu-button"
        onClick={() => setCircleOpen(!isCircleOpen)}>
            <img className="h-8 w-8 rounded-full" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" />
        </button>

        {
            isCircleOpen &&
            <div className=" text-white bg-gray absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="user-menu-button">
                <button>Logout</button>
            </div>
        }
    </div>
  )
}

export default AccountCircle
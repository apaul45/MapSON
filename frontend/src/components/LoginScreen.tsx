import React from 'react'
import { Link } from 'react-router-dom';

const login = "bg-black hover:bg-blue-700 text-white font-bold py-2 px-4 rounded";

export const LoginScreen = () => {
  return (
    <div className="relative flex flex-col justify-center min-h-screen overflow-hidden" 
      style={{backgroundImage: `url("/img/loginbg.png")`,
      backgroundRepeat: "no-repeat",
      backgroundSize: "cover"
    }}>
      <div className="w-full p-6 m-auto lg:max-w-xl">
        <form>
          <div>
            <input
              type="email"
              className="block w-full px-4 py-2 mt-2 text-purple-700 bg-white border rounded-md focus:border-purple-400 focus:ring-purple-300 focus:outline-none focus:ring focus:ring-opacity-40"
              placeholder="Email/Username"
            />
            <a href="#" className="text-xs text-purple-600 hover:underline">Don't have an account? Click here to register</a>
          </div>
          <div>
            <input
              type="password"
              className="block w-full px-4 py-2 mt-2 text-purple-700 bg-white border rounded-md focus:border-purple-400 focus:ring-purple-300 focus:outline-none focus:ring focus:ring-opacity-40"
              placeholder="Password"
            />
          </div>
          <a href="#" className="text-xs text-purple-600 hover:underline">Forgot Password?</a>
          <div className="mt-6">
            <Link to="/home">
              <button className="bg-black hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Login</button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

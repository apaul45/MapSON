import { Link } from 'react-router-dom'
import mapsonLogo from '/img/MapSON-logo-outlined copy.png'

export const FrontPageScreen = () => {
  return (
    <div className="bg-[url('/img/welcome2.png')] bg-center bg-cover relative flex flex-col justify-center h-[calc(100vh-64px)] overflow-hidden">
      <div className="w-1/2 p-10 h-screen">
        <img className="ml-16 mt-10 mb-10" src={mapsonLogo}></img>
        <span className="text-white text-4xl">
          Your go-to tool for map interactivity
        </span>

        <div className="mt-16 text-3xl">
          <Link to="/login">
            <input
              type="submit"
              value="Login"
              className="bg-blue hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
            />
          </Link>
          <Link to="/register">
            <input
              type="submit"
              value="Register"
              className="bg-blue ml-2 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
            />
          </Link>
        </div>
        <div className="mt-6 text-3xl">
          <Link to="/discover">
            <input
              type="submit"
              value="Continue as Guest"
              className="bg-blue hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
            />
          </Link>
        </div>
      </div>
    </div>
  )
}

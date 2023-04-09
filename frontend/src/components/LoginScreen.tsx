import { Link } from 'react-router-dom';

export const LoginScreen = () => {
  return (
    <div className="bg-[url('/img/loginbg.png')] bg-center bg-cover relative flex flex-col justify-center min-h-screen" >
      <div className="w-full p-6 m-auto lg:max-w-xl">

        <form className="mt-16">
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

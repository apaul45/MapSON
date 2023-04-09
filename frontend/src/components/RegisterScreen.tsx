import { Link } from "react-router-dom"

export const RegisterScreen = () => {
  return (
    <div className="bg-[url('/img/loginbg.png')] bg-center bg-cover relative flex flex-col justify-center min-h-screen overflow-hidden">
      <div className="w-full p-6 m-auto lg:max-w-xl">
        <form>
          <div>
            <input
              name="username"
              className="block w-full px-4 py-2 mt-2 text-purple-700 bg-white border rounded-md focus:border-purple-400 focus:ring-purple-300 focus:outline-none focus:ring focus:ring-opacity-40"
              placeholder="Username"
            />
            <Link to="/login" className="text-xs text-purple-600 hover:underline">Already have an account? Login</Link>
          </div>
          <div>
            <input
              name="email"
              className="block w-full px-4 py-2 mt-2 text-purple-700 bg-white border rounded-md focus:border-purple-400 focus:ring-purple-300 focus:outline-none focus:ring focus:ring-opacity-40"
              placeholder="Email"
            />
          </div>
          <div>
            <input
              name="password"
              className="block w-full px-4 py-2 mt-2 text-purple-700 bg-white border rounded-md focus:border-purple-400 focus:ring-purple-300 focus:outline-none focus:ring focus:ring-opacity-40"
              placeholder="Password"
            />
          </div>
          <div className="mt-6">
              <input type="submit" value="Register" className="bg-black hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"/>
          </div>
        </form>
      </div>
    </div>
  )
}

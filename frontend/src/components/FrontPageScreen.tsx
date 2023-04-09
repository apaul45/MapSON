import { Link } from "react-router-dom"

export const FrontPageScreen = () => {
    return(
        <div className="bg-[url('/img/welcome.png')] bg-center bg-cover relative flex flex-col justify-center min-h-screen overflow-hidden">
            <div className="w-full p- lg:max-w-xl">
                <div className="absolute w-screen right-80 top-80">
                    <div className="mt-6">
                        <Link to="/login">
                            <input type="submit" value="Login" className="bg-blue hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"/>
                        </Link>
                        <Link to="/register">
                            <input type="submit" value="Register" className="bg-blue ml-2 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"/>
                        </Link>
                    </div>
                    <div className="mt-6">
                        <Link to="/discover">
                            <input type="submit" value="Continue as Guest" className="bg-blue hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"/>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
import { Link } from "react-router-dom"

export const LoginScreen = () => {
  return (
    <div className="lr-bg" >
      <div className="w-full p-6 m-auto lg:max-w-xl">
        <form className="mt-24">
          <div>
            <input
              name="email"
              className="form-inputs"
              placeholder="Email/Username"
            />
            <Link to="/register" className="lr-text">Don't have an account? Click here to register</Link>
          </div>
          <div>
            <input
              name="password"
              className="form-inputs"
              placeholder="Password"
            />
          </div>
          <Link to="/recover-account" className="lr-text">Forgot Password?</Link>
          <div className="mt-6">
              <input type="submit" value="Login" className="lr-btn"/>
          </div>
        </form>
      </div>
    </div>
  )
}

import { Link } from "react-router-dom"

export const RegisterScreen = () => {
  return (
    <div className="lr-bg overflow-hidden">
      <div className="w-full p-6 m-auto lg:max-w-xl">
        <form>
          <div>
            <input
              name="username"
              className="form-inputs"
              placeholder="Username"
            />
            <Link to="/login" className="lr-text">Already have an account? Login</Link>
          </div>
          <div>
            <input
              name="email"
              className="form-inputs"
              placeholder="Email"
            />
          </div>
          <div>
            <input
              name="password"
              className="form-inputs"
              placeholder="Password"
            />
          </div>
          <div className="mt-6">
              <input type="submit" value="Register" className="lr-btn"/>
          </div>
        </form>
      </div>
    </div>
  )
}

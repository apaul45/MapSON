import { Link, useNavigate } from 'react-router-dom'
import { User } from '../../types'
import { store } from '../../models'
import { useState } from 'react'

export const LoginScreen = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (event: any) => {
    if (!username || !password) {
      store.dispatch.error.setError('Please enter your username and password.')
      return
    }

    const user: User = {
      username: username,
      password: password,
    }

    store.dispatch.user.setCurrentUser(user)
    navigate('/home')
  }

  return (
    <div className="lr-bg">
      <div className="w-full p-6 m-auto lg:max-w-xl">
        <div>
          <input
            id="username"
            name="username"
            type="text"
            className="form-inputs"
            placeholder="Email/Username"
            onChange={(e) => setUsername(e.target.value)}
          />
          <Link to="/register" className="lr-text">
            Don't have an account? Click here to register
          </Link>
        </div>
        <div>
          <input
            id="password"
            name="password"
            type="text"
            className="form-inputs"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Link to="/recover-account" className="lr-text">
          Forgot Password?
        </Link>
        <br />
        <button onClick={(e) => handleSubmit(e)} className="mt-6 lr-btn">
          Login
        </button>
      </div>
    </div>
  )
}
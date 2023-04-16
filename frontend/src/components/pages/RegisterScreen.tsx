import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { store } from '../../models'
import { User } from '../../types'

export const RegisterScreen = () => {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const navigate = useNavigate()

  const { error, user } = store.dispatch

  const handleSubmit = async () => {
    if (!username || !password || !email) {
      error.setError('Please enter your username and password.')
      return
    }

    const payload: User = {
      email: email,
      username: username,
      password: password,
    }

    await user.register(payload)
    navigate('/home')
  }

  return (
    <div className="lr-bg overflow-hidden">
      <div className="w-full p-6 m-auto lg:max-w-xl">
        <div>
          <input
            id="email"
            name="email"
            type="text"
            className="form-inputs"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <Link to="/login" className="lr-text">
            Already have an account? Login
          </Link>
        </div>
        <div>
          <input
            id="username"
            name="username"
            type="text"
            className="form-inputs"
            placeholder="Username"
            onChange={(e) => setUsername(e.target.value)}
          />
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
        <div className="mt-6">
          <button onClick={handleSubmit} className="mt-6 lr-btn">
            Register
          </button>
        </div>
      </div>
    </div>
  )
}

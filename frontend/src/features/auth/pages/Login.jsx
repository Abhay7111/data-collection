import { useState } from 'react'
import '../style/form.scss'
import { Link, useNavigate } from 'react-router'
import '../../shared/style/button.scss'
import { useAuth } from '../hooks/useAuth'
import { useNotification } from '../../shared/components/notification.context'

function Login() {
    const { loading, handleLogin } = useAuth()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const navigate = useNavigate()
    const notify = useNotification()

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!username.trim() || !password) {
            notify('Please enter both your username and password.', 'error')
            return
        }

        try {
            const response = await handleLogin(username, password)
            notify(response?.message || 'You are now logged in.', 'success')
            navigate('/dashboard')
        } catch (error) {
            notify(
                error?.response?.data?.message || 'Unable to log in. Please check your details and try again.',
                'error',
            )
        }
    }

    if (loading) {
        return <main><h1>Loading</h1></main>
    }

    return (
        <main className='main'>
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
                <div className="input-wrap">
                    <label htmlFor="username">Username</label>
                    <input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        type="text"
                        id='username'
                        name='username'
                        autoComplete='username'
                        required
                        placeholder='Enter username'
                    />
                </div>
                <div className="input-wrap">
                    <label htmlFor="password">Password</label>
                    <input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type="password"
                        id='password'
                        name='password'
                        autoComplete='current-password'
                        required
                        placeholder='Enter password'
                    />
                </div>
                <div className="buttons">
                    <button type="submit" className='button primary-button' disabled={loading}>Login</button>
                    <p>Don't have an account? <Link to={'/register'} className='primary-text'>Create One.</Link></p>
                </div>
            </form>
        </main>
    )
}

export default Login

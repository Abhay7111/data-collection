import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import '../style/form.scss'
import '../../shared/style/button.scss'
import { useAuth } from '../hooks/useAuth'
import { useNotification } from '../../shared/components/notification.context'

function Register() {
    const { loading, handleRegister } = useAuth()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const navigate = useNavigate()
    const notify = useNotification()

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!username.trim() || !password) {
            notify('Please enter both a username and password.', 'error')
            return
        }

        try {
            const response = await handleRegister(username, password)
            notify(response?.message || 'Your account has been created.', 'success')
            navigate('/dashboard')
        } catch (error) {
            notify(
                error?.response?.data?.message || 'Unable to create your account. Please try again.',
                'error',
            )
        }
    }

    if (loading) {
        return <main><h1>Loading</h1></main>
    }

    return (
        <main className='main'>
            <h1>Register</h1>
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
                        autoComplete='new-password'
                        required
                        placeholder='Enter password'
                    />
                </div>
                <div className="buttons">
                    <button type="submit" className='button primary-button' disabled={loading}>Create account</button>
                    <p>You already have an account <Link to={'/login'} className='primary-text'>login</Link></p>
                </div>
            </form>
        </main>
    )
}

export default Register

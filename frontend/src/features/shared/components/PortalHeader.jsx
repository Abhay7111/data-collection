import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useNotification } from './notification.context'
import { useAuth } from '../../auth/hooks/useAuth'

function PortalHeader() {
    const { user, isOnline, onlineDevices, settings, settingsError, loading, handleLogout } = useAuth()
    const navigate = useNavigate()
    const notify = useNotification()
    const [menuOpen, setMenuOpen] = useState(false)

    const onLogout = async () => {
        try {
            await handleLogout()
            setMenuOpen(false)
            notify('You have been logged out.', 'success')
            navigate('/login')
        } catch (error) {
            notify(
                error?.response?.data?.message || 'Unable to log out. Please try again.',
                'error',
            )
        }
    }

    return (
        <header className="portal-header" style={user ? {
            '--role-primary': settings.roleColors[user.role]?.primary,
            '--role-secondary': settings.roleColors[user.role]?.secondary,
        } : undefined}>
            <Link to="/" className="portal-brand" aria-label="IFMS Operations Portal home">
                <span className="portal-brand__mark" aria-hidden="true">IF</span>
                <span>
                    <strong>IFMS Operations Portal</strong>
                    <small>APOS physical verification</small>
                </span>
            </Link>
            <button
                type="button"
                className="portal-header__menu-toggle"
                onClick={() => setMenuOpen((isOpen) => !isOpen)}
                aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={menuOpen}
                aria-controls="portal-navigation"
            >
                <span />
                <span />
                <span />
            </button>
            <nav
                className={`portal-header__actions${menuOpen ? ' portal-header__actions--open' : ''}`}
                id="portal-navigation"
                aria-label="Main navigation"
            >
                <span className="online-status"><i aria-hidden="true" /> System Online</span>
                {user ? (
                    <>
                        <span className={`role-badge role-badge--${user.role}`}>
                            <span aria-hidden="true">{user.role === 'admin' ? '✦' : user.role === 'manager' ? '◆' : '●'}</span>
                            {user.role}
                        </span>
                        <span className={`user-presence-badge ${isOnline ? 'user-presence-badge--online' : ''}`}>
                            <i aria-hidden="true" />
                            You are {isOnline ? 'online' : 'offline'}
                            {isOnline && onlineDevices > 1 ? ` · ${onlineDevices} devices` : ''}
                        </span>
                        <Link to="/dashboard" className="portal-link" onClick={() => setMenuOpen(false)}>My profile</Link>
                        {['admin', 'manager'].includes(user.role) && <Link to="/admin" className="portal-link" onClick={() => setMenuOpen(false)}>Management</Link>}
                        <button className="portal-link portal-link--button" type="button" onClick={onLogout} disabled={loading}>
                            Log out
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="portal-link" onClick={() => setMenuOpen(false)}>Log in</Link>
                        <Link to="/register" className="portal-link portal-link--highlight" onClick={() => setMenuOpen(false)}>Register</Link>
                    </>
                )}
            </nav>
            {settingsError && <span className="portal-settings-error" role="status">{settingsError}</span>}
        </header>
    )
}

export default PortalHeader

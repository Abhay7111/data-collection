import { Link, useNavigate } from 'react-router'
import { useNotification } from './notification.context'
import { useAuth } from '../../auth/hooks/useAuth'

function PortalHeader() {
    const { user, isOnline, onlineDevices, settings, settingsError, loading, handleLogout } = useAuth()
    const navigate = useNavigate()
    const notify = useNotification()

    const onLogout = async () => {
        try {
            await handleLogout()
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
            <div className="portal-header__actions">
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
                        <Link to="/dashboard" className="portal-link">My profile</Link>
                        {['admin', 'manager'].includes(user.role) && <Link to="/admin" className="portal-link">Management</Link>}
                        <button className="portal-link portal-link--button" type="button" onClick={onLogout} disabled={loading}>
                            Log out
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="portal-link">Log in</Link>
                        <Link to="/register" className="portal-link portal-link--highlight">Register</Link>
                    </>
                )}
            </div>
            {settingsError && <span className="portal-settings-error" role="status">{settingsError}</span>}
        </header>
    )
}

export default PortalHeader

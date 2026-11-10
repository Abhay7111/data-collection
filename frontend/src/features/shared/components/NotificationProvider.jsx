import { useCallback, useEffect, useRef, useState } from 'react'
import { NotificationContext } from './notification.context'
import './notification.scss'

function NotificationToast({ notification, onDismiss }) {
    const { id, message, type } = notification

    useEffect(() => {
        const timeoutId = window.setTimeout(() => onDismiss(id), 5000)
        return () => window.clearTimeout(timeoutId)
    }, [id, onDismiss])

    return (
        <div
            className={`notification notification--${type}`}
            role={type === 'error' ? 'alert' : 'status'}
        >
            <span>{message}</span>
            <button
                type="button"
                className="notification__close"
                onClick={() => onDismiss(id)}
                aria-label="Dismiss notification"
            >
                ×
            </button>
        </div>
    )
}

export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([])
    const nextId = useRef(0)

    const notify = useCallback((message, type = 'info') => {
        const id = nextId.current++
        setNotifications((current) => [...current, { id, message, type }])
    }, [])

    const dismiss = useCallback((id) => {
        setNotifications((current) => current.filter((notification) => notification.id !== id))
    }, [])

    return (
        <NotificationContext.Provider value={notify}>
            {children}
            <div className="notification-container" aria-live="polite" aria-relevant="additions">
                {notifications.map((notification) => (
                    <NotificationToast
                        key={notification.id}
                        notification={notification}
                        onDismiss={dismiss}
                    />
                ))}
            </div>
        </NotificationContext.Provider>
    )
}

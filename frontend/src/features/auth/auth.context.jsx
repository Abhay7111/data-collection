import { useEffect, useMemo, useState } from 'react'
import { AuthContext } from './auth-context'
import { getCurrentUser, sendHeartbeat } from './services/auth.api'
import { defaultSettings, getSettings } from '../shared/services/settings.api'

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(false)
    const [authReady, setAuthReady] = useState(false)
    const [authError, setAuthError] = useState('')
    const [isOnline, setIsOnline] = useState(false)
    const [onlineDevices, setOnlineDevices] = useState(0)
    const [settings, setSettings] = useState(defaultSettings)
    const [settingsError, setSettingsError] = useState('')

    useEffect(() => {
        let isMounted = true

        getSettings()
            .then((response) => {
                if (isMounted) {
                    setSettings(response)
                    setSettingsError('')
                }
            })
            .catch(() => {
                if (isMounted) setSettingsError('Unable to load saved portal settings; default colors and options are shown.')
            })

        getCurrentUser()
            .then((response) => {
                if (isMounted) {
                    setUser(response.user)
                    setIsOnline(response.isOnline)
                    setOnlineDevices(response.onlineDevices || 0)
                }
            })
            .catch((error) => {
                if (isMounted && error?.response?.status !== 401) {
                    setAuthError('Unable to verify your session. Refresh the page to try again.')
                }
            })
            .finally(() => {
                if (isMounted) setAuthReady(true)
            })

        return () => {
            isMounted = false
        }
    }, [])

    useEffect(() => {
        if (!authReady || !user) return undefined

        let isMounted = true
        const updatePresence = () => {
            sendHeartbeat()
                .then((response) => {
                    if (isMounted) {
                        setIsOnline(response.isOnline)
                        setOnlineDevices(response.onlineDevices || 0)
                        setUser((currentUser) => (
                            currentUser?.role === response.user.role
                                && currentUser?.username === response.user.username
                                ? currentUser
                                : response.user
                        ))
                    }
                })
                .catch((error) => {
                    if (!isMounted) return
                    setIsOnline(false)
                    setOnlineDevices(0)
                    if (error?.response?.status === 401) {
                        setUser(null)
                    }
                })
        }

        updatePresence()
        const intervalId = window.setInterval(updatePresence, 30_000)

        return () => {
            isMounted = false
            window.clearInterval(intervalId)
        }
    }, [authReady, user])

    const value = useMemo(() => ({
        user,
        setUser,
        isOnline,
        setIsOnline,
        onlineDevices,
        settings,
        setSettings,
        settingsError,
        loading,
        setLoading,
        authReady,
        authError,
        setAuthError,
    }), [user, isOnline, onlineDevices, settings, settingsError, loading, authReady, authError])

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

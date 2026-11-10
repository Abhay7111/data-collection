import { useAuthContext } from '../auth-context'
import { login, logout, register } from '../services/auth.api'

export const useAuth = () => {
    const {
        user,
        setUser,
        isOnline,
        setIsOnline,
        onlineDevices,
        setOnlineDevices,
        settings,
        setSettings,
        settingsError,
        loading,
        setLoading,
        authReady,
        authError,
        setAuthError,
    } = useAuthContext()

    const handleLogin = async (username, password) => {
        setLoading(true)
        try {
            const response = await login(username, password)
            setUser(response?.user ?? null)
            setIsOnline(true)
            setOnlineDevices(1)
            setAuthError('')
            return response
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async (username, password) => {
        setLoading(true)
        try {
            const response = await register(username, password)
            setUser(response?.user ?? null)
            setIsOnline(true)
            setOnlineDevices(1)
            setAuthError('')
            return response
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        setLoading(true)
        try {
            await logout()
            setUser(null)
            setIsOnline(false)
            setOnlineDevices(0)
            setAuthError('')
        } finally {
            setLoading(false)
        }
    }

    return {
        user,
        isOnline,
        onlineDevices,
        settings,
        setSettings,
        settingsError,
        loading,
        authReady,
        authError,
        handleLogin,
        handleRegister,
        handleLogout,
    }
}
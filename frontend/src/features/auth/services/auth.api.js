import axios from 'axios'
import { API_BASE_URL } from '../../shared/services/apiBaseUrl'
import { getDeviceId } from '../../shared/services/deviceId'

const api = axios.create({
    baseURL: `${API_BASE_URL}/auth`,
    withCredentials: true,
})

api.interceptors.request.use((config) => {
    config.headers.set('X-Device-Id', getDeviceId())
    return config
})

export async function login(username, password) {
    const response = await api.post('/login', {
        username,
        password,
    })

    return response.data
}

export async function register(username, password) {
    const response = await api.post('/register', {
        username,
        password,
    })

    return response.data
}

export async function getCurrentUser() {
    const response = await api.get('/me')
    return response.data
}

export async function sendHeartbeat() {
    const response = await api.post('/heartbeat')
    return response.data
}

export async function getUserPresence() {
    const response = await api.get('/presence')
    return response.data
}

export async function updateUserRole(userId, role) {
    const response = await api.patch(`/users/${userId}/role`, { role })
    return response.data
}

export async function logout() {
    const response = await api.post('/logout')
    return response.data
}
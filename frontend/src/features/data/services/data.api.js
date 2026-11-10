import axios from 'axios'
import { API_BASE_URL } from '../../shared/services/apiBaseUrl'
import { getDeviceId } from '../../shared/services/deviceId'

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
})

api.interceptors.request.use((config) => {
    config.headers.set('X-Device-Id', getDeviceId())
    return config
})

export async function uploadAPOSData(data) {
    const response = await api.post('/data/APOS', data)
    return response.data
}

export async function getAPOSData(params = {}) {
    const response = await api.get('/data/APOS', { params })
    return response.data
}

export async function updateAPOSData(id, data) {
    const response = await api.patch(`/data/APOS/${id}`, data)
    return response.data
}

export async function deleteAPOSData(id) {
    const response = await api.delete(`/data/APOS/${id}`)
    return response.data
}

export async function assignAPOSData(id, userId) {
    const response = await api.patch(`/data/APOS/${id}/assignment`, { userId })
    return response.data
}

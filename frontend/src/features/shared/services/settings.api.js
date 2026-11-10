import axios from 'axios'
import { API_BASE_URL } from './apiBaseUrl'

const api = axios.create({ baseURL: `${API_BASE_URL}/settings` })

export const defaultSettings = {
    posVendors: ['Verifone', 'Ingenico', 'pax'],
    workflowStatuses: ['verified & operational'],
    roleColors: {
        admin: { primary: '#CBF1F5', secondary: '#CBF1F5' },
        manager: { primary: '#F9F7F7', secondary: '#DBE2EF' },
        user: { primary: '#FFF5E4', secondary: '#FFE3E1' },
    },
}

export async function getSettings() {
    const response = await api.get('/')
    return response.data.settings
}

export async function saveSettings(settings) {
    const response = await api.put('/', settings, { withCredentials: true })
    return response.data
}

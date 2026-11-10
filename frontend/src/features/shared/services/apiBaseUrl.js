const defaultApiUrl = import.meta.env.DEV
    ? 'http://localhost:3000'
    : 'https://data-collection-as75.onrender.com'
const configuredApiUrl = import.meta.env.VITE_API_URL || defaultApiUrl
const apiRoot = configuredApiUrl.replace(/\/+$/, '').replace(/\/api$/, '')

export const API_BASE_URL = `${apiRoot}/api`

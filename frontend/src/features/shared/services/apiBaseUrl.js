const configuredApiUrl = import.meta.env.VITE_API_URL || 'https://data-collection-as75.onrender.com/'
const apiRoot = configuredApiUrl.replace(/\/+$/, '').replace(/\/api$/, '')

export const API_BASE_URL = `${apiRoot}/api`

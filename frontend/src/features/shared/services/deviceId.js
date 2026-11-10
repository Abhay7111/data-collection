const STORAGE_KEY = 'data-collection-device-id'

export function getDeviceId() {
    let deviceId = window.localStorage.getItem(STORAGE_KEY)
    if (!deviceId) {
        deviceId = window.crypto.randomUUID()
        window.localStorage.setItem(STORAGE_KEY, deviceId)
    }

    return deviceId
}

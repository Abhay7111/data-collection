export function getRoleThemeStyle(settings, role) {
    const colors = settings?.roleColors?.[role]
    if (!colors) return undefined

    return {
        '--role-primary': colors.primary,
        '--role-secondary': colors.secondary,
    }
}

function UserPresencePanel({ users, loading, error, isAdmin, currentUserId, updatingUserId, onRoleChange }) {
    const onlineCount = users.filter((user) => user.isOnline).length

    return (
        <section className="records-card presence-card">
            <div className="records-card__heading">
                <div>
                    <h2>User presence <span className="presence-count">{onlineCount} online</span></h2>
                    <p>
                        Presence refreshes every 30 seconds; inactive sessions go offline automatically.
                        {isAdmin && ' Use each role menu to update account access.'}
                    </p>
                </div>
            </div>
            {loading ? (
                <p className="records-state">Loading user presence…</p>
            ) : error ? (
                <p className="records-state records-state--error" role="alert">{error}</p>
            ) : users.length === 0 ? (
                <p className="records-state">No users found.</p>
            ) : (
                <div className="presence-list">
                    {users.map((user) => (
                        <div className="presence-user" key={user.id}>
                            <span className={`presence-dot ${user.isOnline ? 'presence-dot--online' : ''}`} aria-hidden="true" />
                            <strong>{user.username}</strong>
                            {isAdmin ? (
                                <select
                                    className="presence-role-select"
                                    aria-label={`Change ${user.username}'s role`}
                                    value={user.role}
                                    disabled={user.id === updatingUserId || user.id === currentUserId}
                                    onChange={(event) => onRoleChange(user, event.target.value)}
                                >
                                    <option value="user">User</option>
                                    <option value="manager">Manager</option>
                                    <option value="admin">Admin</option>
                                </select>
                            ) : (
                                <span className="presence-role">{user.role}</span>
                            )}
                            <span className={`presence-state ${user.isOnline ? 'presence-state--online' : ''}`}>
                                {user.isOnline ? `Online · ${user.onlineDevices || 1} ${user.onlineDevices === 1 ? 'device' : 'devices'}` : 'Offline'}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </section>
    )
}

export default UserPresencePanel

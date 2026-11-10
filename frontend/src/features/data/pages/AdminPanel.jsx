import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router'
import PortalHeader from '../../shared/components/PortalHeader'
import { useAuth } from '../../auth/hooks/useAuth'
import { getUserPresence, updateUserRole } from '../../auth/services/auth.api'
import {
    assignAPOSData,
    deleteAPOSData,
    getAPOSData,
    updateAPOSData,
} from '../services/data.api'
import { exportAPOSData } from '../utils/exportAPOSData'
import { saveSettings } from '../../shared/services/settings.api'
import { getRoleThemeStyle } from '../../shared/utils/roleTheme'
import ManagementRecordsTable from '../components/ManagementRecordsTable'
import EditRecordDialog from '../components/EditRecordDialog'
import UserPresencePanel from '../components/UserPresencePanel'
import { useNotification } from '../../shared/components/notification.context'
import './workspace-pages.scss'

function AdminPanel() {
    const { user, authReady, authError, settings, setSettings, settingsError } = useAuth()
    const [records, setRecords] = useState([])
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [presenceLoading, setPresenceLoading] = useState(true)
    const [exporting, setExporting] = useState(false)
    const [saving, setSaving] = useState(false)
    const [editingRecord, setEditingRecord] = useState(null)
    const [adminSettingsOpen, setAdminSettingsOpen] = useState(false)
    const [assigningRecord, setAssigningRecord] = useState('')
    const [updatingUserId, setUpdatingUserId] = useState('')
    const [error, setError] = useState('')
    const [presenceError, setPresenceError] = useState('')
    const notify = useNotification()
    const canManage = ['admin', 'manager'].includes(user?.role)
    const isAdmin = user?.role === 'admin'

    useEffect(() => {
        if (!authReady || !canManage) return undefined

        let isMounted = true
        getAPOSData()
            .then((response) => {
                if (isMounted) setRecords(response.data)
            })
            .catch((requestError) => {
                if (isMounted) {
                    setError(requestError?.response?.data?.message || 'Unable to load all submissions.')
                }
            })
            .finally(() => {
                if (isMounted) setLoading(false)
            })

        return () => {
            isMounted = false
        }
    }, [authReady, canManage])

    const refreshPresence = useCallback(async () => {
        try {
            const response = await getUserPresence()
            setUsers(response.users)
            setPresenceError('')
        } catch (requestError) {
            setUsers([])
            setPresenceError(requestError?.response?.data?.message || 'Unable to load user presence.')
        } finally {
            setPresenceLoading(false)
        }
    }, [])

    useEffect(() => {
        if (!authReady || !canManage) return undefined

        const timeoutId = window.setTimeout(refreshPresence, 0)
        const intervalId = window.setInterval(refreshPresence, 30_000)
        return () => {
            window.clearTimeout(timeoutId)
            window.clearInterval(intervalId)
        }
    }, [authReady, canManage, refreshPresence])

    const handleExport = async () => {
        setExporting(true)
        try {
            await exportAPOSData(records, 'all-apos-records.xlsx')
        } catch {
            notify('Unable to export all records. Please try again.', 'error')
        } finally {
            setExporting(false)
        }
    }

    const handleSave = async (data) => {
        setSaving(true)
        try {
            const response = await updateAPOSData(editingRecord._id, data)
            setRecords((current) => current.map((record) => (
                record._id === editingRecord._id ? response.data : record
            )))
            setEditingRecord(null)
            notify(response.message || 'Record updated successfully.', 'success')
        } catch (requestError) {
            notify(
                requestError?.response?.data?.message || 'Unable to update this record.',
                'error',
            )
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (record) => {
        const confirmed = window.confirm(`Delete the record for ${record.Ro_ID || 'this location'}? This cannot be undone.`)
        if (!confirmed) return

        try {
            await deleteAPOSData(record._id)
            setRecords((current) => current.filter((item) => item._id !== record._id))
            notify('Record deleted successfully.', 'success')
        } catch (requestError) {
            notify(
                requestError?.response?.data?.message || 'Unable to delete this record.',
                'error',
            )
        }
    }

    const handleAssign = async (recordId, userId) => {
        setAssigningRecord(recordId)
        try {
            const response = await assignAPOSData(recordId, userId)
            setRecords((current) => current.map((record) => (
                record._id === recordId ? response.data : record
            )))
            notify(response.message || 'Record assignment updated.', 'success')
        } catch (requestError) {
            notify(
                requestError?.response?.data?.message || 'Unable to assign this record.',
                'error',
            )
        } finally {
            setAssigningRecord('')
        }
    }

    const handleRoleChange = async (targetUser, role) => {
        const confirmed = window.confirm(`Change ${targetUser.username}'s role from ${targetUser.role} to ${role}?`)
        if (!confirmed) {
            await refreshPresence()
            return
        }

        setUpdatingUserId(targetUser.id)
        try {
            const response = await updateUserRole(targetUser.id, role)
            setUsers((current) => current.map((item) => (
                item.id === targetUser.id ? { ...item, ...response.user } : item
            )))
            notify(response.message || 'User role updated.', 'success')
        } catch (requestError) {
            await refreshPresence()
            notify(
                requestError?.response?.data?.message || 'Unable to update this user role.',
                'error',
            )
        } finally {
            setUpdatingUserId('')
        }
    }

    const handleSettingsSave = async (settingsDraft) => {
        const response = await saveSettings(settingsDraft)
        setSettings(response.settings)
        notify(response.message || 'Portal settings saved.', 'success')
    }

    const onlineCount = users.filter((item) => item.isOnline).length
    const submitters = new Set(records.map((record) => record.submittedBy).filter(Boolean))

    return (
        <div className="portal-page workspace-page" data-role={user?.role || 'guest'} style={getRoleThemeStyle(settings, user?.role)}>
            <PortalHeader onAdminSettingsClick={() => setAdminSettingsOpen(true)} />
            <main className="workspace-content">
                {!authReady ? (
                    <p className="workspace-state">Checking your account…</p>
                ) : authError ? (
                    <p className="workspace-error" role="alert">{authError}</p>
                ) : !user ? (
                    <section className="access-card">
                        <h1>Sign-in required</h1>
                        <p>Log in with a manager or administrator account to open management.</p>
                        <Link to="/login" className="workspace-button">Log in</Link>
                    </section>
                ) : !canManage ? (
                    <section className="access-card">
                        <h1>Access denied</h1>
                        <p>This page is only available to managers and administrators.</p>
                        <Link to="/dashboard" className="workspace-button">Go to my profile</Link>
                    </section>
                ) : (
                    <>
                        <section className="workspace-welcome">
                            <div>
                                <p className="workspace-eyebrow">{isAdmin ? 'ADMINISTRATION' : 'MANAGEMENT'}</p>
                                <h1>{isAdmin ? 'Admin panel' : 'Manager panel'}</h1>
                                <p>
                                    Review all APOS records and user presence.
                                    {isAdmin ? ' Assign records to users and manage every submission.' : ' Edit or remove records across accounts.'}
                                </p>
                            </div>
                            <button
                                className="workspace-button"
                                type="button"
                                disabled={loading || exporting || records.length === 0}
                                onClick={handleExport}
                            >
                                {exporting ? 'Preparing Excel…' : 'Export all to Excel'}
                            </button>
                        </section>

                        <section className="admin-stats" aria-label="Submission summary">
                            <article className="admin-stat">
                                <span>Total submissions</span>
                                <strong>{records.length}</strong>
                            </article>
                            <article className="admin-stat">
                                <span>Contributors</span>
                                <strong>{submitters.size}</strong>
                            </article>
                            <article className="admin-stat">
                                <span>Users online</span>
                                <strong>{onlineCount}</strong>
                            </article>
                            <article className="admin-stat">
                                <span>Needs attention</span>
                                <strong>{records.filter((record) => record.Currently_Working === 'No').length}</strong>
                            </article>
                        </section>

                        <UserPresencePanel
                            users={users}
                            loading={presenceLoading}
                            error={presenceError}
                            isAdmin={isAdmin}
                            currentUserId={user.id}
                            updatingUserId={updatingUserId}
                            onRoleChange={handleRoleChange}
                        />

                        <section className="records-card management-records-card">
                            <div className="records-card__heading">
                                <div>
                                    <h2>All APOS submissions</h2>
                                    <p>
                                        {isAdmin
                                            ? 'Edit or remove any record, or assign it to a user.'
                                            : 'You can edit or remove records. Assignment is restricted to administrators.'}
                                    </p>
                                </div>
                                <Link to="/dashboard" className="workspace-link">My profile</Link>
                            </div>
                            <ManagementRecordsTable
                                records={records}
                                loading={!authReady || loading}
                                error={error}
                                users={users}
                                isAdmin={isAdmin}
                                assigningRecord={assigningRecord}
                                onEdit={setEditingRecord}
                                onDelete={handleDelete}
                                onAssign={handleAssign}
                            />
                            {assigningRecord && <p className="table-status" role="status">Saving assignment…</p>}
                        </section>
                    </>
                )}
            </main>
            {editingRecord && (
                <EditRecordDialog
                    key={editingRecord._id}
                    record={editingRecord}
                    settings={settings}
                    onClose={() => setEditingRecord(null)}
                    onSave={handleSave}
                    saving={saving}
                />
            )}
            {isAdmin && adminSettingsOpen && (
                <AdminSettingsDialog
                    settings={settings}
                    settingsError={settingsError}
                    onSave={handleSettingsSave}
                    onClose={() => setAdminSettingsOpen(false)}
                />
            )}
        </div>
    )
}

export default AdminPanel

function PortalSettingsEditor({ settings, settingsError, onSave }) {
    const [settingsDraft, setSettingsDraft] = useState(settings)
    const [settingsSaving, setSettingsSaving] = useState(false)
    const [settingsSaveError, setSettingsSaveError] = useState('')

    const updateOption = (key, index, value) => {
        setSettingsDraft((current) => ({
            ...current,
            [key]: current[key].map((option, optionIndex) => optionIndex === index ? value : option),
        }))
    }

    const addOption = (key) => {
        setSettingsDraft((current) => ({ ...current, [key]: [...current[key], ''] }))
    }

    const removeOption = (key, index) => {
        setSettingsDraft((current) => ({
            ...current,
            [key]: current[key].filter((_, optionIndex) => optionIndex !== index),
        }))
    }

    const updateRoleColor = (role, color, value) => {
        setSettingsDraft((current) => ({
            ...current,
            roleColors: {
                ...current.roleColors,
                [role]: { ...current.roleColors[role], [color]: value },
            },
        }))
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setSettingsSaving(true)
        setSettingsSaveError('')
        try {
            await onSave(settingsDraft)
        } catch (requestError) {
            setSettingsSaveError(requestError?.response?.data?.message || 'Unable to save portal settings.')
        } finally {
            setSettingsSaving(false)
        }
    }

    return (
        <>
            {settingsError && <p className="settings-notice" role="status">{settingsError}</p>}
            <form className="portal-settings-form" onSubmit={handleSubmit}>
                {[
                    { key: 'workflowStatuses', title: 'Workflow statuses' },
                    { key: 'posVendors', title: 'POS vendors' },
                ].map(({ key, title }) => (
                    <fieldset className="settings-option-group" key={key}>
                        <legend>{title}</legend>
                        {settingsDraft[key].map((option, index) => (
                            <div className="settings-option-row" key={`${key}-${index}`}>
                                <input
                                    aria-label={`${title} option ${index + 1}`}
                                    maxLength={80}
                                    value={option}
                                    onChange={(event) => updateOption(key, index, event.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="workspace-button workspace-button--secondary"
                                    onClick={() => removeOption(key, index)}
                                    disabled={settingsDraft[key].length <= 1}
                                    aria-label={`Remove ${title} option ${index + 1}`}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            className="workspace-button workspace-button--secondary"
                            onClick={() => addOption(key)}
                            disabled={settingsDraft[key].length >= 50}
                        >
                            Add option
                        </button>
                    </fieldset>
                ))}
                <fieldset className="settings-colors">
                    <legend>Role colors</legend>
                    {['admin', 'manager', 'user'].map((role) => (
                        <div className="settings-color-row" key={role}>
                            <strong>{role}</strong>
                            {['primary', 'secondary'].map((color) => (
                                <label key={color}>
                                    <span>{color === 'primary' ? 'Primary' : 'Secondary'}</span>
                                    <input
                                        type="color"
                                        value={settingsDraft.roleColors[role][color]}
                                        onChange={(event) => updateRoleColor(role, color, event.target.value)}
                                    />
                                </label>
                            ))}
                        </div>
                    ))}
                </fieldset>
                {settingsSaveError && <p className="records-state--error" role="alert">{settingsSaveError}</p>}
                <button className="workspace-button" type="submit" disabled={settingsSaving}>
                    {settingsSaving ? 'Saving settings…' : 'Save portal settings'}
                </button>
            </form>
        </>
    )
}

function AdminSettingsDialog({ settings, settingsError, onSave, onClose }) {
    useEffect(() => {
        const closeOnEscape = (event) => {
            if (event.key === 'Escape') onClose()
        }

        window.addEventListener('keydown', closeOnEscape)
        return () => window.removeEventListener('keydown', closeOnEscape)
    }, [onClose])

    return (
        <div
            className="dialog-backdrop admin-settings-backdrop"
            role="presentation"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose()
            }}
        >
            <section
                className="edit-record-dialog admin-settings-dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="admin-settings-title"
            >
                <header className="edit-record-dialog__heading">
                    <div>
                        <h2 id="admin-settings-title">Admin settings</h2>
                        <p>Update form options and customize role colors.</p>
                    </div>
                    <button
                        type="button"
                        className="dialog-close"
                        onClick={onClose}
                        aria-label="Close admin settings"
                    >
                        ×
                    </button>
                </header>
                <PortalSettingsEditor
                    key={JSON.stringify(settings)}
                    settings={settings}
                    settingsError={settingsError}
                    onSave={onSave}
                />
            </section>
        </div>
    )
}

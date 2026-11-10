import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import PortalHeader from '../../shared/components/PortalHeader'
import { useAuth } from '../../auth/hooks/useAuth'
import { getAPOSData } from '../services/data.api'
import { exportAPOSData } from '../utils/exportAPOSData'
import { getRoleThemeStyle } from '../../shared/utils/roleTheme'
import RecordsTable from '../components/RecordsTable'
import { useNotification } from '../../shared/components/notification.context'
import './workspace-pages.scss'

function Dashboard() {
    const { user, authReady, authError, settings } = useAuth()
    const [records, setRecords] = useState([])
    const [loading, setLoading] = useState(true)
    const [exporting, setExporting] = useState(false)
    const [error, setError] = useState('')
    const notify = useNotification()

    const handleExport = async () => {
        setExporting(true)
        try {
            await exportAPOSData(records, 'my-apos-records.xlsx')
        } catch {
            notify('Unable to export your records. Please try again.', 'error')
        } finally {
            setExporting(false)
        }
    }

    useEffect(() => {
        if (!user) return

        let isMounted = true
        getAPOSData({ scope: 'mine' })
            .then((response) => {
                if (isMounted) setRecords(response.data)
            })
            .catch((requestError) => {
                if (isMounted) {
                    setError(requestError?.response?.data?.message || 'Unable to load your submissions.')
                }
            })
            .finally(() => {
                if (isMounted) setLoading(false)
            })

        return () => {
            isMounted = false
        }
    }, [user, authReady])

    return (
        <div className="portal-page workspace-page" data-role={user?.role || 'guest'} style={getRoleThemeStyle(settings, user?.role)}>
            <PortalHeader />
            <main className="workspace-content">
                <section className="workspace-welcome">
                    <div>
                        <p className="workspace-eyebrow">MY ACCOUNT</p>
                        <h1>{user ? `Welcome, ${user.username}` : 'Your profile'}</h1>
                        <p>
                            {user
                                ? 'View your account details and POS verification submissions.'
                                : 'Log in to view your profile and saved submissions.'}
                        </p>
                    </div>
                    {user ? (
                        <Link to="/" className="workspace-button">Create APOS record</Link>
                    ) : (
                        <Link to="/login" className="workspace-button">Log in</Link>
                    )}
                </section>

                {authError && <p className="workspace-error" role="alert">{authError}</p>}

                {user && (
                    <>
                        <section className="profile-card" aria-label="Profile details">
                            <div className="profile-avatar" aria-hidden="true">
                                {user.username.slice(0, 1).toUpperCase()}
                            </div>
                            <div>
                                <span className="profile-card__label">Username</span>
                                <strong>{user.username}</strong>
                            </div>
                            <div>
                                <span className="profile-card__label">Account type</span>
                                <strong>{user.role}</strong>
                            </div>
                            <div>
                                <span className="profile-card__label">Your records</span>
                                <strong>{records.length}</strong>
                            </div>
                        </section>

                        <section className="records-card">
                            <div className="records-card__heading">
                                <div>
                                    <h2>My APOS submissions</h2>
                                    <p>Only records submitted from your account are shown here.</p>
                                </div>
                                <button
                                    className="workspace-button workspace-button--secondary"
                                    type="button"
                                    disabled={loading || exporting || records.length === 0}
                                    onClick={handleExport}
                                >
                                    {exporting ? 'Preparing Excel…' : 'Export to Excel'}
                                </button>
                            </div>
                            <RecordsTable records={records} loading={!authReady || loading} error={error} />
                        </section>
                    </>
                )}
            </main>
        </div>
    )
}

export default Dashboard

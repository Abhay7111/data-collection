import { Link } from 'react-router'

const dateFormatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
})

function RecordsTable({ records, loading, error }) {
    return (
        <div className="records-table-wrap">
            {loading ? (
                <p className="records-state">Loading records…</p>
            ) : error ? (
                <p className="records-state records-state--error" role="alert">{error}</p>
            ) : records.length === 0 ? (
                <div className="records-state">
                    <p>No submissions yet.</p>
                    <Link to="/" className="workspace-link">Create your first record</Link>
                </div>
            ) : (
                <table className="records-table">
                    <thead>
                        <tr>
                            <th>RO ID</th>
                            <th>RO Name</th>
                            <th>POS ID</th>
                            <th>Vendor</th>
                            <th>Working</th>
                            <th>HW Available</th>
                            <th>Complaint No</th>
                            <th>Submitted By</th>
                            <th>Submitted At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.map((record) => (
                            <tr key={record._id}>
                                <td>{record.Ro_ID || '—'}</td>
                                <td>{record.Ro_Name || '—'}</td>
                                <td>{record.POS_ID || '—'}</td>
                                <td>{record.POS_Vender || '—'}</td>
                                <td>{record.Currently_Working || '—'}</td>
                                <td>{record.HW_Physically_Available || '—'}</td>
                                <td>{record.complaint_No || '—'}</td>
                                <td>{record.submittedBy || '—'}</td>
                                <td>{record.createdAt ? dateFormatter.format(new Date(record.createdAt)) : '—'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    )
}

export default RecordsTable

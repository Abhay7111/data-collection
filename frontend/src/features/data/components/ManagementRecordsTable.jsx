function ManagementRecordsTable({ records, loading, error, users, isAdmin, assigningRecord, onEdit, onDelete, onAssign }) {
    return (
        <div className="records-table-wrap">
            {loading ? (
                <p className="records-state">Loading records…</p>
            ) : error ? (
                <p className="records-state records-state--error" role="alert">{error}</p>
            ) : records.length === 0 ? (
                <p className="records-state">No submissions yet.</p>
            ) : (
                <table className="records-table management-records-table">
                    <thead>
                        <tr>
                            <th>RO ID</th>
                            <th>RO Name</th>
                            <th>POS ID</th>
                            <th>Vendor</th>
                            <th>Working</th>
                            <th>Submitted By</th>
                            <th>Assigned To</th>
                            <th>Actions</th>
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
                                <td>{record.submittedBy || '—'}</td>
                                <td>
                                    {isAdmin ? (
                                        <select
                                            className="assignment-select"
                                            aria-label={`Assign ${record.Ro_ID || 'record'} to a user`}
                                            value={record.assignedTo?.id || record.assignedTo?._id || ''}
                                            disabled={Boolean(assigningRecord)}
                                            onChange={(event) => onAssign(record._id, event.target.value || null)}
                                        >
                                            <option value="">Unassigned</option>
                                            {users.map((user) => (
                                                <option key={user.id} value={user.id}>
                                                    {user.username} ({user.role})
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        record.assignedTo?.username || 'Unassigned'
                                    )}
                                </td>
                                <td>
                                    <div className="record-actions">
                                        <button type="button" className="table-action" onClick={() => onEdit(record)}>
                                            Edit
                                        </button>
                                        <button type="button" className="table-action table-action--danger" onClick={() => onDelete(record)}>
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    )
}

export default ManagementRecordsTable

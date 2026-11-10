import { useState } from 'react'

const fields = [
    { name: 'Ro_ID', label: 'RO ID', required: true },
    { name: 'Ro_Name', label: 'RO Name', required: true },
    { name: 'Mapped_MST', label: 'Mapped MST', required: true },
    { name: 'Hos_Pos_ID', label: 'HOS POS ID' },
    { name: 'BPCL_TID', label: 'BPCL TID' },
    { name: 'POS_ID', label: 'POS ID', required: true },
    { name: 'POS_Vender', label: 'POS Vendor', type: 'vendor' },
    { name: 'HW_Seral_No', label: 'HW Serial No', required: true },
    { name: 'HW_Physically_Available', label: 'HW Physically Available', type: 'yes-no' },
    { name: 'Currently_Working', label: 'Currently Working', type: 'yes-no' },
    { name: 'workflow_Status', label: 'Workflow Status', type: 'workflow' },
    { name: 'complaint_No', label: 'Complaint No' },
    { name: 'Removal_Requist_Raised_and_No', label: 'Removal Request Raised & No' },
    { name: 'observed_ALP_Activated', label: 'Observed ALP Activated', type: 'yes-no' },
    { name: 'observed_UFHI_Activated', label: 'Observed UFill Activated', type: 'yes-no' },
    { name: 'General_Remarks', label: 'General Remarks' },
]

function EditRecordDialog({ record, settings, onClose, onSave, saving }) {
    const [values, setValues] = useState(() => {
        const initialValues = Object.fromEntries(
            fields.map(({ name }) => [name, record[name] || '']),
        )
        return record.HW_Physically_Available === 'No'
            ? {
                ...initialValues,
                Currently_Working: '',
                complaint_No: '',
                Removal_Requist_Raised_and_No: '',
            }
            : initialValues
    })
    const hardwareUnavailable = values.HW_Physically_Available === 'No'

    const handleChange = (event) => {
        const { name, value } = event.target
        setValues((current) => ({
            ...current,
            [name]: value,
            ...(name === 'HW_Physically_Available' && value === 'No' ? {
                Currently_Working: '',
                complaint_No: '',
                Removal_Requist_Raised_and_No: '',
            } : {}),
        }))
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        onSave(values)
    }

    return (
        <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) onClose()
        }}>
            <section className="edit-record-dialog" role="dialog" aria-modal="true" aria-labelledby="edit-record-title">
                <header className="edit-record-dialog__heading">
                    <div>
                        <h2 id="edit-record-title">Edit APOS record</h2>
                        <p>Update record details. Assignment is managed separately.</p>
                    </div>
                    <button type="button" className="dialog-close" onClick={onClose} disabled={saving} aria-label="Close dialog">
                        ×
                    </button>
                </header>
                <form onSubmit={handleSubmit}>
                    <div className="edit-record-grid">
                        {fields.map(({ name, label, type, required }) => (
                            <label className="edit-record-field" key={name}>
                                <span>{label}{required && <b> *</b>}</span>
                                {type === 'vendor' ? (
                                    <select name={name} value={values[name]} onChange={handleChange}>
                                        {!settings.posVendors.includes(values[name]) && values[name] && (
                                            <option value={values[name]}>{values[name]}</option>
                                        )}
                                        {settings.posVendors.map((vendor) => <option key={vendor} value={vendor}>{vendor}</option>)}
                                    </select>
                                ) : type === 'yes-no' ? (
                                    <select
                                        name={name}
                                        value={values[name]}
                                        onChange={handleChange}
                                        disabled={name === 'Currently_Working' && hardwareUnavailable}
                                    >
                                        <option value="">Not set</option>
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                    </select>
                                ) : type === 'workflow' ? (
                                    <select name={name} value={values[name]} onChange={handleChange}>
                                        {!settings.workflowStatuses.includes(values[name]) && values[name] && (
                                            <option value={values[name]}>{values[name]}</option>
                                        )}
                                        {settings.workflowStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                                    </select>
                                ) : (
                                    <input
                                        name={name}
                                        value={values[name]}
                                        onChange={handleChange}
                                        required={required}
                                        disabled={hardwareUnavailable && ['complaint_No', 'Removal_Requist_Raised_and_No'].includes(name)}
                                    />
                                )}
                            </label>
                        ))}
                    </div>
                    <div className="dialog-actions">
                        <button className="workspace-button workspace-button--secondary" type="button" onClick={onClose} disabled={saving}>
                            Cancel
                        </button>
                        <button className="workspace-button" type="submit" disabled={saving}>
                            {saving ? 'Saving…' : 'Save changes'}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    )
}

export default EditRecordDialog

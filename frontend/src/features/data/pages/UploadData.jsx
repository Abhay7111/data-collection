import { useState } from 'react'
import { useNotification } from '../../shared/components/notification.context'
import PortalHeader from '../../shared/components/PortalHeader'
import { useAuth } from '../../auth/hooks/useAuth'
import { getRoleThemeStyle } from '../../shared/utils/roleTheme'
import { uploadAPOSData } from '../services/data.api'
import './upload-data.scss'

const equipmentFields = [
    { name: 'Ro_ID', label: 'RO ID', placeholder: 'e.g. RO10294', required: true },
    { name: 'Ro_Name', label: 'RO Name', placeholder: 'e.g. Highway Fuel Care', required: true },
    { name: 'Mapped_MST', label: 'Mapped MST', placeholder: 'e.g. Rajesh Sharma', required: true },
    { name: 'Hos_Pos_ID', label: 'HOS POS ID', placeholder: 'e.g. HOS-8823' },
    { name: 'BPCL_TID', label: 'BPCL TID', placeholder: 'e.g. TID-99401' },
    { name: 'POS_ID', label: 'POS ID', placeholder: 'e.g. POS-5542', required: true },
    { name: 'HW_Seral_No', label: 'HW Serial No', placeholder: 'e.g. SN-88392019', required: true },
]

const initialForm = {
    Ro_ID: '',
    Ro_Name: '',
    Mapped_MST: '',
    Hos_Pos_ID: '',
    BPCL_TID: '',
    POS_ID: '',
    POS_Vender: 'Verifone',
    HW_Seral_No: '',
    HW_Physically_Available: 'Yes',
    Currently_Working: 'Yes',
    workflow_Status: 'verified & operational',
    complaint_No: '',
    Removal_Requist_Raised_and_No: '',
    observed_ALP_Activated: false,
    observed_UFHI_Activated: false,
    General_Remarks: '',
}

function UploadData() {
    const [formData, setFormData] = useState(initialForm)
    const [loading, setLoading] = useState(false)
    const notify = useNotification()
    const { user, settings } = useAuth()
    const hardwareUnavailable = formData.HW_Physically_Available === 'No'
    const selectedVendor = settings.posVendors.includes(formData.POS_Vender)
        ? formData.POS_Vender
        : settings.posVendors[0]
    const selectedWorkflow = settings.workflowStatuses.includes(formData.workflow_Status)
        ? formData.workflow_Status
        : settings.workflowStatuses[0]

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target
        setFormData((current) => ({
            ...current,
            [name]: type === 'checkbox' ? checked : value,
            ...(name === 'HW_Physically_Available' && value === 'No' ? {
                Currently_Working: '',
                complaint_No: '',
                Removal_Requist_Raised_and_No: '',
            } : {}),
        }))
    }

    const handleClear = () => setFormData({
        ...initialForm,
        POS_Vender: settings.posVendors[0],
        workflow_Status: settings.workflowStatuses[0],
    })

    const handleSubmit = async (event) => {
        event.preventDefault()

        if (formData.Currently_Working === 'No' && !formData.complaint_No.trim()) {
            notify('Enter a complaint number when the POS is not working.', 'error')
            return
        }

        setLoading(true)
        try {
            const response = await uploadAPOSData({
                ...formData,
                POS_Vender: selectedVendor,
                workflow_Status: selectedWorkflow,
                observed_ALP_Activated: formData.observed_ALP_Activated ? 'Yes' : 'No',
                observed_UFHI_Activated: formData.observed_UFHI_Activated ? 'Yes' : 'No',
            })
            notify(response?.message || 'Data uploaded successfully.', 'success')
            handleClear()
        } catch (error) {
            notify(
                error?.response?.data?.message || 'Unable to upload data. Please log in and try again.',
                'error',
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="portal-page" data-role={user?.role || 'guest'} style={getRoleThemeStyle(settings, user?.role)}>
            <PortalHeader />
            <main className="upload-content">
                <nav className="verification-steps" aria-label="Verification workflow">
                    <span className="verification-step verification-step--active" aria-current="step">
                        <span aria-hidden="true">▣</span> 1. APOS Verification
                    </span>
                    <span className="verification-step verification-step--upcoming" aria-disabled="true">
                        <span aria-hidden="true">◷</span> 2. Shift Closure
                    </span>
                    <span className="verification-step verification-step--upcoming" aria-disabled="true">
                        <span aria-hidden="true">♙</span> 3. Sangam Certification
                    </span>
                </nav>

                <section className="verification-card" aria-labelledby="verification-title">
                    <div className="verification-card__heading">
                        <div>
                            <h1 id="verification-title">1. APOS Physical Verification Entry</h1>
                            <p>Capture hardware availability, functional status, UFill/ALP activation, and ticketing info.</p>
                        </div>
                        <button className="clear-fields" type="button" onClick={handleClear}>
                            <span aria-hidden="true">↻</span> Clear Fields
                        </button>
                    </div>

                    <form className="verification-form" onSubmit={handleSubmit}>
                        <div className="equipment-grid">
                            {equipmentFields.map(({ name, label, placeholder, required }) => (
                                <div className="form-field" key={name}>
                                    <label htmlFor={name}>
                                        {label}{required && <span className="required-mark"> *</span>}
                                    </label>
                                    <input
                                        id={name}
                                        name={name}
                                        placeholder={placeholder}
                                        value={formData[name]}
                                        onChange={handleChange}
                                        required={required}
                                    />
                                </div>
                            ))}
                            <div className="form-field">
                                <label htmlFor="POS_Vender">POS Vendor</label>
                                <select id="POS_Vender" name="POS_Vender" value={selectedVendor} onChange={handleChange}>
                                    {settings.posVendors.map((vendor) => <option key={vendor} value={vendor}>{vendor}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="status-grid">
                            <div className="form-field">
                                <label htmlFor="HW_Physically_Available">HW Physically Available?</label>
                                <select
                                    id="HW_Physically_Available"
                                    name="HW_Physically_Available"
                                    value={formData.HW_Physically_Available}
                                    onChange={handleChange}
                                >
                                    <option>Yes</option>
                                    <option>No</option>
                                </select>
                            </div>
                            <div className="form-field">
                                <label htmlFor="Currently_Working">Currently Working?<span className="required-mark"> *</span></label>
                                <select
                                    id="Currently_Working"
                                    name="Currently_Working"
                                    value={formData.Currently_Working}
                                    onChange={handleChange}
                                    required={!hardwareUnavailable}
                                    disabled={hardwareUnavailable}
                                >
                                    <option value="">Not applicable</option>
                                    <option>Yes</option>
                                    <option>No</option>
                                </select>
                            </div>
                            <div className="form-field">
                                <label htmlFor="workflow_Status">Workflow Status</label>
                                <select id="workflow_Status" name="workflow_Status" value={selectedWorkflow} onChange={handleChange}>
                                    {settings.workflowStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="ticket-fields">
                            <div className="form-field">
                                <label htmlFor="complaint_No">Complaint No</label>
                                <input
                                    id="complaint_No"
                                    name="complaint_No"
                                    placeholder="Required if NOT working"
                                    value={formData.complaint_No}
                                    onChange={handleChange}
                                    required={formData.Currently_Working === 'No'}
                                    disabled={hardwareUnavailable}
                                    aria-describedby="complaint-help"
                                />
                                <small id="complaint-help">Mandatory when hardware status is &quot;No&quot;.</small>
                            </div>
                            <div className="form-field">
                                <label htmlFor="Removal_Requist_Raised_and_No">Removal Request Raised &amp; No</label>
                                <input
                                    id="Removal_Requist_Raised_and_No"
                                    name="Removal_Requist_Raised_and_No"
                                    placeholder="e.g. REM-2026-99"
                                    value={formData.Removal_Requist_Raised_and_No}
                                    onChange={handleChange}
                                    disabled={hardwareUnavailable}
                                />
                            </div>
                        </div>

                        <div className="activation-fields">
                            <label className="checkbox-field" htmlFor="observed_ALP_Activated">
                                <input
                                    id="observed_ALP_Activated"
                                    name="observed_ALP_Activated"
                                    type="checkbox"
                                    checked={formData.observed_ALP_Activated}
                                    onChange={handleChange}
                                />
                                <span>Observed ALP Activated</span>
                            </label>
                            <label className="checkbox-field" htmlFor="observed_UFHI_Activated">
                                <input
                                    id="observed_UFHI_Activated"
                                    name="observed_UFHI_Activated"
                                    type="checkbox"
                                    checked={formData.observed_UFHI_Activated}
                                    onChange={handleChange}
                                />
                                <span>Observed UFill Activated</span>
                            </label>
                            <div className="form-field">
                                <label className="visually-hidden" htmlFor="General_Remarks">General Remarks</label>
                                <input
                                    id="General_Remarks"
                                    name="General_Remarks"
                                    placeholder="General Remarks..."
                                    value={formData.General_Remarks}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="save-record" disabled={loading}>
                                <span aria-hidden="true">▣</span>
                                {loading ? 'Saving Record…' : 'Save APOS Verification Record'}
                            </button>
                        </div>
                    </form>
                </section>
            </main>
        </div>
    )
}

export default UploadData

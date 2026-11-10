const columns = [
    { key: 'Ro_ID', header: 'RO ID' },
    { key: 'Ro_Name', header: 'RO Name' },
    { key: 'Mapped_MST', header: 'Mapped MST' },
    { key: 'Hos_Pos_ID', header: 'HOS POS ID' },
    { key: 'BPCL_TID', header: 'BPCL TID' },
    { key: 'POS_ID', header: 'POS ID' },
    { key: 'POS_Vender', header: 'POS Vendor' },
    { key: 'HW_Seral_No', header: 'HW Serial No' },
    { key: 'HW_Physically_Available', header: 'HW Physically Available' },
    { key: 'Currently_Working', header: 'Currently Working' },
    { key: 'workflow_Status', header: 'Workflow Status' },
    { key: 'complaint_No', header: 'Complaint No' },
    { key: 'Removal_Requist_Raised_and_No', header: 'Removal Request Raised & No' },
    { key: 'observed_ALP_Activated', header: 'Observed ALP Activated' },
    { key: 'observed_UFHI_Activated', header: 'Observed UFill Activated' },
    { key: 'General_Remarks', header: 'General Remarks' },
    { key: 'submittedBy', header: 'Submitted By' },
    { key: 'assignedTo', header: 'Assigned To' },
    { key: 'createdAt', header: 'Submitted At' },
]

export async function exportAPOSData(records, filename) {
    const { default: ExcelJS } = await import('exceljs')
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('APOS Records')

    worksheet.columns = columns.map((column) => ({
        ...column,
        width: Math.max(column.header.length + 2, 16),
    }))
    worksheet.addRows(records.map((record) => (
        Object.fromEntries(columns.map(({ key }) => [
            key,
            key === 'assignedTo' ? record.assignedTo?.username ?? '' : record[key] ?? '',
        ]))
    )))
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
    worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF07568D' },
    }
    worksheet.views = [{ state: 'frozen', ySplit: 1 }]

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.append(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 0)
}

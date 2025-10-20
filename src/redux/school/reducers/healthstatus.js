export default function healthstatus(state = {
    records: {}
}, action) {
    switch (action.type) {
        case 'RECORD_HEALTH_STATUS':
            const { student_id, health_status, teacher_id } = action
            const record_id = `${student_id}_health_${Date.now()}`
            return {
                ...state,
                records: {
                    ...state.records,
                    [record_id]: {
                        student_id,
                        health_status,
                        teacher_id,
                        timestamp: new Date().toISOString()
                    }
                }
            }
        case 'INITIALIZE_STUDENT_WELLNESS':
            const { students } = action
            const wellness_records = {}
            students.forEach(student => {
                wellness_records[student.id] = {
                    student_id: student.id,
                    wellness_status: 'good',
                    last_updated: new Date().toISOString()
                }
            })
            return {
                ...state,
                records: {
                    ...state.records,
                    ...wellness_records
                }
            }
        default:
            return state
    }
}

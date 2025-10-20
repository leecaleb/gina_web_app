export default function diaper(state = {
    records: {}
}, action) {
    switch (action.type) {
        case 'RECORD_DIAPER':
            const { student_id, diaper_type, teacher_id } = action
            const record_id = `${student_id}_diaper_${Date.now()}`
            return {
                ...state,
                records: {
                    ...state.records,
                    [record_id]: {
                        student_id,
                        diaper_type,
                        teacher_id,
                        timestamp: new Date().toISOString()
                    }
                }
            }
        default:
            return state
    }
}

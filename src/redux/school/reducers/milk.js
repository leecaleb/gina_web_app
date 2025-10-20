export default function milk(state = {
    records: {}
}, action) {
    switch (action.type) {
        case 'RECORD_MILK':
            const { student_id, milk_amount, teacher_id } = action
            const record_id = `${student_id}_milk_${Date.now()}`
            return {
                ...state,
                records: {
                    ...state.records,
                    [record_id]: {
                        student_id,
                        milk_amount,
                        teacher_id,
                        timestamp: new Date().toISOString()
                    }
                }
            }
        default:
            return state
    }
}

export default function water(state = {
    records: {}
}, action) {
    switch (action.type) {
        case 'MARK_WATER_DRANK':
            const { student_id, meal_type, teacher_id } = action
            const record_id = `${student_id}_water_${Date.now()}`
            return {
                ...state,
                records: {
                    ...state.records,
                    [record_id]: {
                        student_id,
                        meal_type,
                        teacher_id,
                        timestamp: new Date().toISOString()
                    }
                }
            }
        default:
            return state
    }
}

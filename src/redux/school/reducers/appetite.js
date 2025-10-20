export default function appetite(state = {
    records: {},
    error_message: '',
    student_ids_for_update: []
}, action) {
    switch (action.type) {
        case 'RECORD_APPETITE':
            const { student_id, meal_type, appetite_level, teacher_id } = action
            const record_id = `${student_id}_${meal_type}_${Date.now()}`
            return {
                ...state,
                records: {
                    ...state.records,
                    [record_id]: {
                        student_id,
                        meal_type,
                        appetite_level,
                        teacher_id,
                        timestamp: new Date().toISOString()
                    }
                }
            }
        case 'ALERT_ERR_MESSAGE':
            return {
                ...state,
                error_message: action.err_message
            }
        case 'CLEAR_ERR_MESSAGE':
            return {
                ...state,
                error_message: ''
            }
        case 'ADD_STUDENT_ID_FOR_UPDATE':
            return {
                ...state,
                student_ids_for_update: action.student_id_array
            }
        default:
            return state
    }
}

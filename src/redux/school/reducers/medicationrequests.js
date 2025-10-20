export default function medicationrequests(state = {
    requests: {},
    error_message: ''
}, action) {
    switch (action.type) {
        case 'GET_MEDICATION_REQUESTS_SUCCESS':
            return {
                ...state,
                requests: action.medication_requests,
                error_message: ''
            }
        case 'GET_MEDICATION_REQUESTS_FAIL':
            return {
                ...state,
                error_message: action.errMessage
            }
        case 'RECORD_MEDICINE':
            const { student_id, medicine_name, medicine_time, teacher_id } = action
            return {
                ...state,
                requests: {
                    ...state.requests,
                    [student_id]: {
                        ...state.requests[student_id],
                        administered: true,
                        administered_by: teacher_id,
                        administered_at: medicine_time
                    }
                }
            }
        default:
            return state
    }
}

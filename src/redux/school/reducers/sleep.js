export default function sleep(state = {
    records: {},
    error_message: ''
}, action) {
    switch (action.type) {
        case 'RECORD_SLEEP':
            const { student_id, sleep_start_time, sleep_end_time, teacher_id } = action
            const record_id = `${student_id}_sleep_${Date.now()}`
            return {
                ...state,
                records: {
                    ...state.records,
                    [record_id]: {
                        student_id,
                        sleep_start_time,
                        sleep_end_time,
                        teacher_id,
                        timestamp: new Date().toISOString()
                    }
                }
            }
        case 'ALERT_SLEEPLOG_ERROR_MESSAGE':
            return {
                ...state,
                error_message: action.err_message
            }
        case 'CLEAR_SLEEPLOG_ERROR_MESSAGE':
            return {
                ...state,
                error_message: ''
            }
        default:
            return state
    }
}

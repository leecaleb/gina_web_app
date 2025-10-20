export default function message(state = {
    class_message_data: {},
    parent_messages: {},
    send_success: false
}, action) {
    switch (action.type) {
        case 'WRITE_TO_ALL':
            return {
                ...state,
                class_message_data: {
                    ...state.class_message_data,
                    text: action.text,
                    teacher_id: action.teacher_id,
                    timestamp: new Date().toISOString(),
                    type: 'all'
                }
            }
        case 'WRITE_TO_ONE':
            return {
                ...state,
                class_message_data: {
                    ...state.class_message_data,
                    text: action.text,
                    student_id: action.student_id,
                    teacher_id: action.teacher_id,
                    timestamp: new Date().toISOString(),
                    type: 'individual'
                }
            }
        case 'FETCH_CLASS_MESSAGE_DATA':
            return {
                ...state,
                class_message_data: action.message_data
            }
        case 'SEND_MESSAGE_ON_SUCCESS':
            return {
                ...state,
                send_success: true
            }
        case 'GET_PARENT_MESSAGE_SUCCESS':
            return {
                ...state,
                parent_messages: action.messages
            }
        default:
            return state
    }
}

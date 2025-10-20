export default function inbox(state = {
    conversations: {},
    unread_conversation_list: [],
    current_conversation_id: ''
}, action) {
    switch (action.type) {
        case 'GET_CONVERSATIONS':
            return {
                ...state,
                conversations: action.conversations,
                unread_conversation_list: action.unread_conversation_list
            }
        case 'SET_MESSAGE_DATA':
            const { messages, most_recently_read_message_id, conversation_id, student_id } = action
            return {
                ...state,
                conversations: {
                    ...state.conversations,
                    [conversation_id]: {
                        messages,
                        most_recently_read_message_id,
                        student_id
                    }
                },
                current_conversation_id: conversation_id
            }
        case 'SET_CURRENT_CONVERSATION_ID':
            return {
                ...state,
                current_conversation_id: action.conversation_id
            }
        case 'CLEAR_CURRENT_CONVERSATION_ID':
            return {
                ...state,
                current_conversation_id: ''
            }
        default:
            return state
    }
}

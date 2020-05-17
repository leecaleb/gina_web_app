
export const initializeChildren = (data) => {
    return {
        type: 'INITIALIZE_CHILDREN',
        data
    }
}

export const setReadReceipt = (most_recently_read_message_id) => {
    return {
        type: 'SET_READ_RECEIPT',
        most_recently_read_message_id

    }
}

export const setMessageDataParent = (messages, most_recently_read_message_id, conversation_id) => {
    return {
        type: 'SET_MESSAGE_DATA',
        messages,
        most_recently_read_message_id,
        conversation_id
    }
}

export const clearCurrentConversationIdParent = () => {
    return {
        type: 'CLEAR_CURRENT_CONVERSATION_ID'
    }
}

export const clearState = () => {
    return {
        type: 'CLEAR_STATE'
    }
}

export const getMedRequestSuccess = (med_requests) => {
    return {
        type: 'GET_MED_REQUEST_SUCCESS',
        med_requests
    }
}

export const markPresent = (student_id) => {
    return {
        type: 'MARK_PRESENT',
        student_id
    }
}
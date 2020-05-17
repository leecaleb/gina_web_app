export default function inbox(state = {
  conversations: [],
  current_conversation_id: '',
  unread_conversation_list: [],
  conversations_by_id: {
    // { conversation_id }: {
    //   most_recently_read_message_id: 'MESSAGE_ID',
    //   student_id: '',
    //   messages: [
    //     {
    //       message_id,
    //       message_text,
    //       created_at,
    //       read_at,
    //       sender_id
    //     }, {...}
    //   ]
    // }
  }
}, action) {
  switch (action.type) {
    case 'GET_CONVERSATIONS':
      const { conversations, unread_conversation_list } = action
      return {
        ...state,
        conversations,
        unread_conversation_list
      }
    case 'SET_MESSAGE_DATA':
      const newState = { ...state }
      const { messages, most_recently_read_message_id, conversation_id, student_id } = action
      newState.conversations_by_id[conversation_id] = {
        student_id,
        messages,
        most_recently_read_message_id
      }
      newState.current_conversation_id = conversation_id
      newState.unread_conversation_list = newState.unread_conversation_list.filter(id => id !== conversation_id)
      return newState
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
export default function inbox(state = {
  current_conversation_id: '',
  conversations_by_id: {
    // { conversation_id }: {
    //   most_recently_read_message_id: 'MESSAGE_ID'
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
    // case 'SET_READ_RECEIPT':
    //   const {most_recently_read_message_id} = action
    //   return {
    //     ...state,
    //     most_recently_read_message_id
    //   }
    case 'SET_MESSAGE_DATA':
      const newState = { ...state }
      const { messages, most_recently_read_message_id, conversation_id } = action
      newState.conversations_by_id[conversation_id] = {
        messages, 
        most_recently_read_message_id
      }
      newState.current_conversation_id = conversation_id
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

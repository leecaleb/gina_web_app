const initial_state = {
  // TODO: parents can only write one response per message
  // TODO: how do we incorporate reminders for things to bring
  message_by_student_id: {
    // { student_id }: {
    //   text: '',
    //   things_to_bring: [0,0,1,1,0,0,0],
    //   other_item: ''
    //   activities: [1,1,0,0,0,0,1],
    //   other_activity: '',
    //   teacher_id: ''
    // }
  },
  student_id_for_update: new Set()
}

export default function message(state = initial_state, action) {
  switch (action.type) {
    case 'INITIALIZE_CLASS': {
      const message_by_student_id = {}
      action.students.forEach(student => {
        const { id } = student
        message_by_student_id[id] = {
          text: '',
          things_to_bring: [0, 0, 0, 0, 0],
          other_item: '其它',
          activities: [0, 0, 0, 0, 0, 0, 0, 0, 0],
          other_activity: '其它',
          teacher_id: ''
        }
      })
      return {
        ...state,
        message_by_student_id
      }
    }
      
    case 'FETCH_CLASS_MESSAGE_DATA': {
      const { message_data } = action
      return {
        ...state,
        message_by_student_id: {
          ...state.message_by_student_id,
          ...message_data
        }
      }
    }

    case 'WRITE_TO_ALL': {
      const { text, teacher_id } = action
      const message_by_student_id = { ...state.message_by_student_id }
      Object.keys(message_by_student_id).forEach(student_id => {
        message_by_student_id[student_id].text = text
        message_by_student_id[student_id].teacher_id = teacher_id
      })

      return {
        ...state,
        ...message_by_student_id,
        student_id_for_update: new Set(Object.keys(message_by_student_id))
      }
    }

    case 'WRITE_TO_ONE': {
      const { text, student_id, teacher_id } = action
      const student_id_for_update = new Set([...state.student_id_for_update, student_id])
      return {
        ...state,
        message_by_student_id: {
          ...state.message_by_student_id,
          [student_id]: {
            ...state.message_by_student_id[student_id],
            text,
            teacher_id
          }
        },
        student_id_for_update
      }
    }

    case 'REMIND_ITEMS_TO_BRING_TO_ALL': {
      const { items_to_bring_bool, teacher_id } = action
      const message_by_student_id = { ...state.message_by_student_id }
      Object.keys(message_by_student_id).forEach(student_id => {
        message_by_student_id[student_id].things_to_bring = items_to_bring_bool
        message_by_student_id[student_id].teacher_id = teacher_id
      })
      return {
        ...state,
        message_by_student_id,
        student_id_for_update: new Set(Object.keys(message_by_student_id))
      }
    }

    case 'REMIND_ITEMS_TO_BRING_TO_ONE': {
      const { student_id, things_to_bring, teacher_id } = action
      const message_by_student_id = { ...state.message_by_student_id }
      message_by_student_id[student_id].things_to_bring = things_to_bring
      message_by_student_id[student_id].teacher_id = teacher_id
      return {
        ...state,
        message_by_student_id,
        student_id_for_update: new Set([...state.student_id_for_update, student_id])
      }
    }
      
    case 'WRITE_ITEM_TO_BRING_TO_ALL': {
      const { item_to_bring, teacher_id } = action
      const message_by_student_id = { ...state.message_by_student_id }
      Object.keys(message_by_student_id).forEach(student_id => {
        message_by_student_id[student_id].other_item = item_to_bring === '' ? '其它' : item_to_bring
        message_by_student_id[student_id].teacher_id = teacher_id
      })
      return {
        ...state,
        message_by_student_id,
        student_id_for_update: new Set(Object.keys(message_by_student_id))
      }
    }
      
    case 'WRITE_ITEM_TO_BRING_TO_ONE': {
      const { student_id, item_to_bring, teacher_id } = action
      return {
        ...state,
        message_by_student_id: {
          ...state.message_by_student_id,
          [student_id]: {
            ...state.message_by_student_id[student_id],
            other_item: item_to_bring,
            teacher_id
          }
        },
        student_id_for_update: new Set([...state.student_id_for_update, student_id])
      }
    }

    case 'RECORD_ACTIVITIES_FOR_ALL': {
      const { new_acitivities_bool, teacher_id } = action
      const message_by_student_id = { ...state.message_by_student_id }
      Object.keys(message_by_student_id).forEach(student_id => {
        message_by_student_id[student_id].activities = new_acitivities_bool
        message_by_student_id[student_id].teacher_id = teacher_id
      })
      return {
        ...state,
        message_by_student_id,
        student_id_for_update: new Set(Object.keys(message_by_student_id))
      }
    }

    case 'RECORD_ACTIVITIES_FOR_ONE': {
      const { student_id, activities, teacher_id } = action
      const message_by_student_id = { ...state.message_by_student_id }
      message_by_student_id[student_id].activities = activities
      message_by_student_id[student_id].teacher_id = teacher_id
      return {
        ...state,
        message_by_student_id,
        student_id_for_update: new Set([...state.student_id_for_update, student_id])
      }
    }

    case 'WRITE_ACTIVITY_FOR_ALL': {
      const { activity, teacher_id } = action
      const message_by_student_id = { ...state.message_by_student_id }
      Object.keys(message_by_student_id).forEach(student_id => {
        message_by_student_id[student_id].other_activity = activity === '' ? '其它' : activity
        message_by_student_id[student_id].teacher_id = teacher_id
      })
      return {
        ...state,
        message_by_student_id,
        student_id_for_update: new Set(Object.keys(message_by_student_id))
      }
    }

    case 'WRITE_ACTIVITY_FOR_ONE': {
      const { student_id, activity, teacher_id } = action
      return {
        ...state,
        message_by_student_id: {
          ...state.message_by_student_id,
          [student_id]: {
            ...state.message_by_student_id[student_id],
            other_activity: activity,
            teacher_id
          }
        },
        student_id_for_update: new Set([...state.student_id_for_update, student_id])
      }
    }

    case 'SEND_MESSAGE_ON_SUCCESS': {
      return {
        ...state,
        student_id_for_update: new Set()
      }
    }

    case 'CLEAR_STATE': {
      return {
        message_by_student_id: {},
        student_id_for_update: new Set()
      }
    }

    default:
      return state
  }
}
var initial_state = {
  by_student_id: {
    /*
    {student_id}: {
      amount: 16,
      records: [{record_id}, {...}]
    }
    */
  },
  records: {
    by_id: {
      /*
      {record_id}: {
        student_id,
        time: {Datetime},
        cloth_diaper: true/false,
        pee_or_poo: {小便/大便},
        poo_condition: {varchar(4)}
        teacher_id
      }
      */
    },
    all_id: []
  },
  all_dispatched: true,
  students_pending_amount_update: new Set(),
  data_to_update: [],
  new_data_for_create: new Set(),
  old_data_for_edit: new Set(),
  err_message: ''
}

export default function diaper(state = initial_state, action) {
  switch (action.type) {
    case 'INITIALIZE_CLASS': {
      by_student_id = {}
      action.students.forEach(student => {
        const { id } = student
        by_student_id[id] = {
          amount: '',
          records: []
        }
      })
      // initial_state = {
      //   ...state,
      //   by_student_id
      // }
      return {
        ...state,
        by_student_id
      }
    }
    case 'FETCH_CLASS_DIAPER_DATA': { // TODO: fix bug
      return {
        ...state,
        ...action.diaperData
      }
    }
    case 'ADD_DIAPER_RECORD': {
      const { student_id, time, cloth_diaper, teacher_id } = action
      const newState = { ...state }
      const id = newState.records.all_id.length
      newState.by_student_id[student_id].records.push(id)
      if (!cloth_diaper) {
        newState.by_student_id[student_id].amount -= 1
        newState.students_pending_amount_update.add(student_id)
      }

      newState.records.by_id[id] = {
        student_id,
        time,
        cloth_diaper,
        pee_or_poo: '小便',
        poo_condition: '正常',
        teacher_id
      }
      newState.records.all_id.push(id)
      newState.all_dispatched = false
      newState.new_data_for_create.add(id)
      return newState
    }
      
    case 'EDIT_DIAPER_TIME': {
      const { record_id, time, teacher_id } = action
      const { new_data_for_create } = state
      const newState = { ...state }
      newState.records.by_id[record_id].time = time
      newState.records.by_id[record_id].teacher_id = teacher_id
      if (!new_data_for_create.has(record_id)) {
        newState.old_data_for_edit.add(record_id)
      }
      return newState
    }
    
    case 'SWITCH_PEE_OR_POO': {
      const { record_id, teacher_id } = action
      const { new_data_for_create } = state
      const newState = { ...state }
      const current_pee_or_poo = newState.records.by_id[record_id].pee_or_poo
      newState.records.by_id[record_id].pee_or_poo = current_pee_or_poo === '小便' ? '大便' : '小便'
      newState.records.by_id[record_id].teacher_id = teacher_id
      if (current_pee_or_poo === '小便') {
        newState.records.by_id[record_id].poo_condition = '正常'
      }
      if (!new_data_for_create.has(record_id)) {
        newState.old_data_for_edit.add(record_id)
      }
      return newState
    }

    case 'EDIT_POO_CONDITION': {
      const { record_id, condition, teacher_id } = action
      const { new_data_for_create } = state
      const newState = { ...state }

      console.log('EDIT_POO_CONDITION: ', record_id, condition, teacher_id)
      newState.records.by_id[record_id].poo_condition = condition
      newState.records.by_id[record_id].teacher_id = teacher_id
      if (!new_data_for_create.has(record_id)) {
        newState.old_data_for_edit.add(record_id)
      }
      return newState
    }
      
    case 'REMOVE_DIAPER_RECORD_SUCCESS': {
      const { student_id, record_id } = action
      const newState = { ...state }
      const new_records = []
      
      const records = state.by_student_id[student_id].records
      if(!state.records.by_id[record_id].cloth_diaper) {
        newState.by_student_id[student_id].amount += 1
      }

      for (var i = 0; i < records.length; i++){
        if (records[i] !== record_id) {
          new_records.push(records[i])
        }
      }
      newState.by_student_id[student_id].records = new_records

      const new_data_for_create = new Set([...state.new_data_for_create])
      new_data_for_create.delete(record_id)
      newState.new_data_for_create = new_data_for_create

      const old_data_for_edit = new Set([...state.old_data_for_edit])
      old_data_for_edit.delete(record_id)
      newState.old_data_for_edit = old_data_for_edit

      return newState
    }
    
    case 'REMOVE_DIAPER_RECORD_FAIL': {
      const { err_message } = action
      return {
        ...state,
        err_message
      }
    }

    case 'UPDATE_DIAPER_AMOUNT': {
      const { student_id, amount } = action
      const students_pending_amount_update = new Set([...state.students_pending_amount_update, student_id])
      return {
        ...state,
        by_student_id: {
          ...state.by_student_id,
          [student_id]: {
            ...state.by_student_id[student_id],
            amount
          }
        },
        students_pending_amount_update
      }
    }
    
    case 'CREATE_DIAPER_RECORD_SUCCESS': {
      return {
        ...state,
        new_data_for_create: new Set(),
        old_data_for_edit: new Set()
      }
    }
      
    case 'CREATE_DIAPER_RECORD_FAIL': {
      const { err_message } = action
      return {
        ...state,
        err_message
      }
    }

    case 'EDIT_DIAPER_RECORD_SUCCESS': {
      return {
        ...state,
        old_data_for_edit: new Set()
      }
    }

    case 'EDIT_DIAPER_RECORD_FAIL': {
      const { err_message } = action
      return {
        ...state,
        err_message
      }
    }

    case 'EDIT_DIAPER_AMOUNT_SUCCESS': {
      return {
        ...state,
        students_pending_amount_update: new Set()
      }
    }
      
    case 'EDIT_DIAPER_AMOUNT_FAIL': {
      const { err_message } = action
      return {
        ...state,
        err_message
      }
    }
      
    case 'CLEAR_ERR_MESSAGE': {
      return {
        ...state,
        err_message: ''
      }
    }
      
    case 'CLEAR_STATE': {
      return {
        by_student_id: {},
        records: {
          by_id: {},
          all_id: []
        },
        all_dispatched: true,
        students_pending_amount_update: new Set(),
        data_to_update: [],
        new_data_for_create: new Set(),
        old_data_for_edit: new Set(),
        err_message: ''
      }
    }

    default:
      return state
  }
}
var initial_state = {
    by_student_id: {
        /*
        {student_id}: [{record_id}, {...}]
        */
    },
    records: {
        by_id: {
            // { record_id }: {
            //     student_id: '',
            //     sleep_time: '',
            //     wake_time: '',
            //     teacher_id: ''
            // }
        },
        all_id: new Set()
    },
    errorMessage: '',
    newDataForCreate: new Set(),
    oldDataForEdit: new Set(),
    records_with_error: new Set(),
    data_dispatched: true
}

export default function sleep(state = initial_state, action) {
    switch (action.type) {
        case 'INITIALIZE_CLASS':
            let by_student_id = {}
            action.students.forEach(student => {
                const { id } = student
                by_student_id[id] = []
            })
            return {
                ...state,
                by_student_id
            }

        case 'FETCH_CLASS_SLEEP_DATA': { // TODO
            const { by_student_id, records } = action.sleepData
            return {
                ...state,
                by_student_id: {
                    // ...state.by_student_id,
                    ...by_student_id
                },
                records: {
                    by_id: {
                        // ...state.records.by_id,
                        ...records.by_id
                    },
                    all_id: new Set([
                        // ...state.records.all_id,
                        ...records.all_id
                    ])
                }
            }
        }

        case 'SET_SLEEP_TIME': {
            const newState = { ...state }
            const { student_id, index, sleep_time, teacher_id } = action
            const record_id_array = newState.by_student_id[student_id]
            const record_id = record_id_array[index]
            const records = newState.records.by_id
            sleep_time.setSeconds(0, 0)
            if (index !== null) { // if index is specified, we change data
                if (index > 0 && sleep_time <= records[record_id_array[index - 1]].sleep_time) {
                    const record_id_array = newState.by_student_id[student_id]
                    const removed = record_id_array.splice(index, 1)
                    let found = 0
                    for(var i = 0; i < record_id_array.length-1; i++) {
                        if (records[record_id_array[i]].sleep_time > sleep_time) {
                            found = i // index of record
                            break
                        }
                    }
                    record_id_array.splice(found, 0, removed[0])
                    newState.by_student_id[student_id] = record_id_array
                }

                newState.records.by_id[record_id].sleep_time = sleep_time
                newState.records.by_id[record_id].teacher_id = teacher_id
                
                if (!newState.newDataForCreate.has(record_id)) {
                    newState.oldDataForEdit.add(record_id)
                }
            } else { // if index not specified, we push new data
                // const record_length = record_id_array.length
                const new_record_id = newState.records.all_id.size

                // if (record_length > 0 && sleep_time <= records[record_id_array[record_length - 1]].wake_time) {
                //     //if sleep_time <= wake time of last record
                //     // WARNING!!!!
                //     newState.records_with_error = new Set([...state.records_with_error, new_record_id, record_length - 1])
                // } 
                    newState.by_student_id[student_id].push(new_record_id)
                    newState.records.by_id[new_record_id] = {
                        student_id,
                        sleep_time,
                        wake_time: null,
                        teacher_id
                    }
                    newState.records.all_id.add(new_record_id)
                    newState.errorMessage = ''
                    newState.newDataForCreate.add(new_record_id)
                // }

            }

            newState.data_dispatched = false
            return newState
        }

        case 'SET_WAKE_TIME': {
            const newState = { ...state }
            const { student_id, index, wake_time, teacher_id } = action
            const record_id = newState.by_student_id[student_id][index]
            // const next_record_id = index + 1 < newState.by_student_id[student_id].length ?
            //     newState.by_student_id[student_id][index + 1]
            //     : -1
            // const records = newState.records.by_id
            wake_time.setSeconds(0,0)

            newState.records.by_id[record_id].wake_time = wake_time
            newState.records.by_id[record_id].teacher_id = teacher_id
            newState.errorMessage = ''
            if (!newState.newDataForCreate.has(record_id)) {
                newState.oldDataForEdit.add(record_id)
            }

            newState.data_dispatched = false
            return newState
        }
            
        case 'REMOVE_WAKE_TIME': {
            const { record_id, teacher_id } = action
            const newState = { ...state }
            const records_with_error = new Set([...state.records_with_error])
            records_with_error.delete(record_id)
            newState.records_with_error = records_with_error
            newState.records.by_id[record_id].wake_time = null
            newState.records.by_id[record_id].teacher_id = teacher_id
            if (!newState.newDataForCreate.has(record_id)) {
                newState.oldDataForEdit.add(record_id)
            }

            newState.data_dispatched = false
            return newState
        }
        
        case 'CREATE_SLEEP_RECORD_SUCCESS': {
            return {
                ...state,
                newDataForCreate: new Set(),
                data_dispatched: true
            }
        }

        case 'CREATE_SLEEP_RECORD_FAIL': {
            return {
                ...state,
                errorMessage: action.errMessage
            }
        }

        case 'EDIT_SLEEP_RECORD_SUCCESS': {
            return {
                ...state,
                oldDataForEdit: new Set(),
                data_dispatched: true
            }
        }

        case 'EDIT_SLEEP_RECORD_FAIL': {
            return {
                ...state,
                errorMessage: action.errMessage
            }
        }

        case 'REMOVE_RECORD_SUCCESS': {
            const { record_id, student_id } = action
            const student_record_ids = state.by_student_id[student_id]
            const removing_index = student_record_ids.findIndex(element => element === record_id)

            const newDataForCreate = new Set([...state.newDataForCreate])
            newDataForCreate.delete(record_id)

            const oldDataForEdit = new Set([...state.oldDataForEdit])
            oldDataForEdit.delete(record_id)
            return {
                ...state,
                by_student_id: {
                    ...state.by_student_id,
                    [student_id]: [
                        ...student_record_ids.slice(0, removing_index),
                        ...student_record_ids.slice(removing_index+1)
                    ]
                },
                newDataForCreate,
                oldDataForEdit,
                data_dispatched: (newDataForCreate.size + oldDataForEdit.size) === 0
            }
        }

        case 'REMOVE_RECORD_FAIL': {
            return {
                ...state,
                errorMessage: action.errorMessage
            }
        }

        case 'MARK_RECORD_ERROR': {
            const { record_id_array } = action
            return {
                ...state,
                records_with_error: new Set([...state.records_with_error, ...record_id_array])

            }
        }

        case 'MARK_RECORD_CORRECT': {
            const { record_id } = action
            let records_with_error = new Set([...state.records_with_error])
            records_with_error.delete(record_id)
            return {
                ...state,
                records_with_error
            }
        }
            
        case 'ALERT_SLEEPLOG_ERROR_MESSAGE': {
            const {err_message} = action
            return {
                ...state,
                errorMessage: err_message
            }
        }
            
        case 'CLEAR_SLEEPLOG_ERROR_MESSAGE': {
            return {
                ...state,
                errorMessage: ''
            }
        }

        case 'CLEAR_STATE':
            return {
                by_student_id: {},
                records: {
                    by_id: {},
                    all_id: new Set()
                },
                errorMessage: '',
                newDataForCreate: new Set(),
                oldDataForEdit: new Set(),
                records_with_error: new Set(),
                data_dispatched: true
            }
        
        default:
            return state 
    }
}
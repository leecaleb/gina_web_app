var initial_state = {
    // loaded: false,
    by_student_id: {
        /*
        {student_id}: [{record_id}, {record_id}...]
        */
    },
    records: {
        // { record_id }: {
        //     student_id
        //     temperature: {INT_TYPE},
        //     status: '',
        //     time: '',
        //     teacher_id: ''
        // }, {...}
    },
    record_id_for_update: new Set(),
    // record_id_for_edit: new Set()
    errMessage: '',
    records_with_error: new Set(),
    data_dispatched: true
}

export default function healthstatus(state = initial_state, action) {
    // console.log('state: ', state)
    switch (action.type) {
        case 'INITIALIZE_STUDENT_WELLNESS': {
            var by_student_id = {}
            var records = {}
            var len = 0
            action.students.forEach(student_id => {
                // const { id } = student
                by_student_id[student_id] = [len, len+1]

                records[len] = {
                    temperature: '',
                    status: '健康寶寶',
                    time: null,
                    teacher_id: ''
                }

                records[len+1] = {
                    temperature: '',
                    status: '健康寶寶',
                    time: null,
                    teacher_id: ''
                }

                len+=2
            })

            // console.log('initial_state: ', initial_state)

            return {
                ...state,
                by_student_id,
                records
            }
        }

        case 'FETCH_CLASS_WELLNESS_DATA': {
            const { by_student_id, records } = action.wellnessData
            const student_id_list = Object.keys(by_student_id)
            for (var i = 0; i < student_id_list.length; i++){
                const student_id = student_id_list[i]
                let record_id_list = by_student_id[student_id]
                if (record_id_list.length === 1) {
                    record_id_list.push(state.by_student_id[student_id][1])
                    by_student_id[student_id] = record_id_list
                }
            }
            return {
                ...state,
                by_student_id: {
                    ...state.by_student_id,
                    ...by_student_id
                },
                records: {
                    ...state.records,
                    ...records
                }
            }
        }

        case 'ADD_RECORD': {
            const {by_student_id, records} = state
            const { student_id } = action
            const new_id = Object.keys(state.records).length
            return {
                ...state,
                by_student_id: {
                    ...by_student_id,
                    [student_id]: [...by_student_id[student_id], new_id]
                },
                records: {
                    ...records,
                    [new_id]: {
                        temperature: '',
                        status: '健康寶寶',
                        time: null,
                        teacher_id: ''
                    }
                }
            }
        }

        case 'ADD_HEALTH_STATUS': {
            const { student_id, record_id, status, teacher_id } = action
            const record_id_for_update = new Set([...state.record_id_for_update, record_id])
            const records = {
                ...state.records,
                [record_id]: {
                    ...state.records[record_id],
                    student_id,
                    status,
                    time: new Date(),
                    teacher_id
                }
            }
            return {
                ...state,
                records,
                record_id_for_update,
                data_dispatched: false
            }
        }
        case 'ADD_TEMPERATURE': {
            const { student_id, record_id, temperature, teacher_id } = action
            const record_id_for_update = new Set([...state.record_id_for_update, record_id])
            const records = {
                ...state.records,
                [record_id]: {
                    ...state.records[record_id],
                    student_id,
                    temperature,
                    time: new Date(),
                    teacher_id
                }
            }
            return {
                ...state,
                records,
                record_id_for_update,
                data_dispatched: false
            }
        }
            
        case 'INVALIDATE_WELLNESS_DATA': {
            const { record_id, errMessage } = action
            return {
                ...state,
                //TODO how do we efficiently match each errmessage to the wellness_form that contains the error
                records_with_error: new Set([...state.records_with_error, record_id])
            }
        }
            
        case 'SEND_WELLNESS_DATA_SUCCESS': {
            return {
                ...state,
                record_id_for_update: new Set(),
                data_dispatched: true
            }
        }
            
        case 'SEND_DATA_FAIL': {
            return {
                ...state,
                errMessage: action.errMessage
            }
        }

        // case 'CLEAR_STATE': {
        //     return {
        //         by_student_id: {},
        //         records: {},
        //         record_id_for_update: new Set(),
        //         errMessage: '',
        //         records_with_error: new Set()
        //     }
        // }
        
        default:
            return state
    }
}
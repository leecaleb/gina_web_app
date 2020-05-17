var initial_state = {
    /* TODO: flatten the structure like sleep record for better separation of post and put (?)
            -why separate post and put instead of upsert in lambda?
            -possible conflict: if using student_id/date/time as uniqueness delimeter,
                                edited records with a new time set gets INSERTed into database
            -solution: fetched data doesn't get added into newDataForCreate set
            -problem#2: how do we treat initial rendering of page; will each student gets a placeholding, empty record
    */
    loaded: false,
    by_student_id: {
        // {student_id}: [{record_id}, {...}]
    },
    records: {
        by_id: {
            /*{ record_id }: {
                student_id,
                time,
                amount,
                teacher_id
            }*/
        },
        all_id: new Set()
    },
    // pendingUpdates: new Set(),
    newDataForCreate: new Set(),
    oldDataForEdit: new Set(),
    dataForRemoval: new Set(),
    errMessage: ''
}

export default function milk(state = initial_state, action) {
    switch (action.type) {
        case 'INITIALIZE_CLASS': {
            var by_student_id = {}
            action.students.forEach(student => {
                const { id } = student
                by_student_id[id] = []
            })
            // initial_state = {
            //     ...state,
            //     by_student_id
            // }
            return {
                ...state,
                by_student_id
            }
        }
        
        case 'FETCH_CLASS_MILK_DATA': {
            const { by_student_id, records } = action.milkData
            
            return {
                ...state,
                by_student_id: {
                    ...state.by_student_id,
                    ...by_student_id
                },
                records: {
                    by_id: {
                        ...state.records.by_id,
                        ...records.by_id
                    },
                    all_id: new Set([
                        ...state.records.all_id,
                        ...records.all_id
                    ])
                }
            }
        }

        case 'FETCH_CLASS_MILK_DATA_SUCCESS': {

        } 

        case 'ADD_MILK_RECORD': {
            const newState = { ...state }
            const { student_id } = action
            const record_id = state.newDataForCreate.size
            newState.records.by_id[record_id] = {
                student_id,
                time: new Date,
                amount: '',
                teacher_id: ''
            }
            newState.by_student_id[student_id].push(record_id)
            newState.newDataForCreate.add(record_id)
            return newState
        }

        case 'EDIT_MILK_AMOUNT': {
            const newState = { ...state }
            const { record_id, milk_amount, teacher_id } = action
            newState.records.by_id[record_id].amount = milk_amount
            newState.records.by_id[record_id].teacher_id = teacher_id
            if (!newState.newDataForCreate.has(record_id)) {
                newState.oldDataForEdit.add(record_id)
            }
            return newState
        }

        case 'EDIT_MILK_TIME': {
            const newState = { ...state }
            const { record_id, date_time, teacher_id } = action
            newState.records.by_id[record_id].time = date_time
            newState.records.by_id[record_id].teacher_id = teacher_id
            if (!newState.newDataForCreate.has(record_id)) {
                newState.oldDataForEdit.add(record_id)
            }
            return newState
        }
            
        case 'CREATE_DATA_SUCCESS': {
            return {
                ...state,
                newDataForCreate: new Set()
            }
        }
            
        case 'CREATE_DATA_FAIL': {
            return {
                ...state,
                errMessage: action.errMessage
            }
        }
            
        case 'EDIT_DATA_SUCCESS': {
            return {
                ...state,
                oldDataForEdit: new Set()
            }
        }
            
        case 'EDIT_DATA_FAIL': {
            return {
                ...state,
                errMessage: action.errMessage
            }
        }

        case 'REMOVE_RECORD': {
            const { student_id, record_id } = action
            const newState = { ...state }
            let record_id_index = state.by_student_id[student_id].indexOf(record_id)
            if (record_id_index > -1) {
                newState.by_student_id[student_id].splice(record_id_index, 1)
            }

            if (newState.oldDataForEdit.has(record_id)) {
                newState.oldDataForEdit.delete(record_id)
            }

            if (newState.newDataForCreate.has(record_id)) {
                newState.newDataForCreate.delete(record_id)
            } else {
                newState.dataForRemoval.add(record_id)
            }

            return newState
        }
            
        case 'REMOVE_MILK_RECORD_SUCCESS':
            return {
                ...state,
                dataForRemoval: new Set()
            }
        
        case 'REMOVE_MILK_RECORD_FAIL':
            return {
                ...state,
                errMessage: 'Error occured while removing milk record, please try again'
            }
        
        case 'CLEAR_STATE':
            return {
                loaded: false,
                by_student_id: {},
                records: {
                    by_id: {},
                    all_id: new Set()
                },
                newDataForCreate: new Set(),
                oldDataForEdit: new Set(),
                dataForRemoval: new Set(),
                errMessage: ''
            }

        default:
            return state
    }
}
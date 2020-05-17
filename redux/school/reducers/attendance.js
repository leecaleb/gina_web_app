var initial_state = {
    initialized: false,
    present: new Set(),// student_A_id
    absent: new Set(), // student_B_id
    unmarked: new Set(),
    attendance: {
        /*
        {student_A_id}: {
            present: true,
            in_time: [Date],
            out_time: [Date]
        },
        {student_B_id}: {
            present: false,
            excuse_type: "fever"
        }
        */
    }
}

export default function attendance(state = initial_state, action) {
    switch (action.type) {
        // case 'INITIALIZE_CLASS':
        //     var attendance = {}
        //     var unmarked = new Set()
        //     action.students.forEach(student => {
        //         const { id } = student
        //         unmarked.add(id)
        //         attendance[id] = {
        //             present: false
        //         }
        //     })
        //     return {
        //         ...state,
        //         initialized: true,
        //         unmarked: unmarked,
        //         attendance: attendance
        //     }

        // case 'MARK_PRESENT':
        //     // student_id, in_time
        //     state.unmarked.delete(action.student_id)
        //     return {
        //         ...state,
        //         present: new Set([...state.present, action.student_id]),
        //         unmarked: state.unmarked,
        //         attendance: {
        //             ...state.attendance,
        //             [action.student_id]: {
        //                 present: true,
        //                 in_time: action.in_time
        //             }
        //         }
        //     }
        
        case 'MAKR_DISMISS':
            return {
                ...state,
                attendance: {
                    ...state.attendance,
                    [action.student_id]: {
                        ...state.attendance[action.student_id],
                        present: false,
                        out_time: action.out_time
                    }
                }
            }
        
        case 'MARK_ABSENT':
            // student_id, excuse_type
            state.unmarked.delete(action.student_id)
            return {
                ...state,
                absent: new Set([...state.absent, action.student_id]),
                unmarked: state.unmarked,
                attendance: {
                    ...state.attendance,
                    [action.student_id]: {
                        ...state.attendance[action.student_id],
                        excuse_type: action.excuse_type
                    }
                }
            }
    
        case 'CLEAR_STATE':
            return {
                initialized: false,
                present: new Set(),
                absent: new Set(),
                unmarked: new Set(),
                attendance: {}
            }
        default:
            return state
    }
}
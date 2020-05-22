export default function parent(state = {
    // first_name: '',
    // last_name: '',
    // id: '',
    isConnected: true,
    child_of_id: {
        /*
        {child_A_id}: {
            first_name: "",
            last_name: "",
            class_id: SOME_ID,
            profile_pic: "",
            // teacher_ids: []
        },
        {child_B_id}: {
            first_name: "",
            last_name: "",
            class_id: SOME_ID,
            profile_pic: ""
        }
        */
    },
    med_requests: []
    // teachers: {

    // }
}, action) {
    switch (action.type) {
        case 'SET_CONNECT_STATE': {
            const { isConnected } = action
            return {
                ...state,
                isConnected
            }
        }
        case 'INITIALIZE_CHILDREN':
            const { data } = action
            data.forEach((child) => {
                const { id, name, class_id, profile_picture, school_id } = child
                state.child_of_id[id] = {
                    name,
                    class_id,
                    profile_picture,
                    school_id
                }
            })
            return {
                ...state
            }

        case 'MARK_PRESENT':
            const { student_id } = action
            state.child_of_id[student_id].present = true
            return {
                ...state
            }

        case 'GET_MED_REQUEST_SUCCESS': 
            const { med_requests } = action
            return {
                ...state,
                med_requests
            }
    
        case 'CLEAR_STATE': {
            return {
                isConnected: true,
                child_of_id: {},
                med_requests: []
            }
        }

        default:
            return state
    }
}
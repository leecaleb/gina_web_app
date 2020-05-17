export default function attendance(state = {
    days: {
        1: [ // index representing day of week
            // ex. id_4, ...
        ],
        2: [],
        3: [],
        4: [],
        5: []
    },
    attendance: {
        /*
        {id_4}: {
            student_id
            in_time: '',
            out_time: '',
            excuse_type: ''
        }, {...}
        */
    }
}, action) {
    switch (action.type) {
        case 'INITIALIZE_ATTENDANCE':
        // initialize attendance status every morning to get any absence excuse(s) of the day
            return {
                ...state,
                days: {
                    ...state.days,
                    [action.day]: [...state.days[action.day], action.attendance_id]
                },
                attendance: {
                    ...state.attendance,
                    [action.attendance_id]: action.attendance_obj
                }
            }
        default:
            return state
    }
}
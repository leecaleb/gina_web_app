export default function medicationrequests(state = {
    requests: {
        // [request_id]: {
        //     'student_id': student_id,
        //     'timestamp': timestamp.strftime('%B %d, %Y %H:%M:%S'),
        //     'medication': {
        //         '藥粉': None if 藥粉 == 'None' else 藥粉,
        //         'need_refrigeration': need_refrigeration == 'True',
        //         '藥水': None if 藥水 == 'None' else 藥水,
        //         '藥膏': None if 藥膏 == 'None' else 藥膏
        //     },
        //     'note': note,
        //     'administered': administered,
        //     'teacher_id': teacher_id
        // }, {...}
    },
    unfinished: [],
    finished: []
}, action) {
    switch (action.type) {
        case 'INITIALIZE_REQUESTS':{
            const { requests, finished, unfinished} = action
            return {
                ...state,
                requests,
                finished,
                unfinished
            }
        }
        
        case 'FILL_MED_REQUEST':{
            const newState = { ...state }
            const { unfinished } = state
            var new_unfinished = []
            newState.requests[action.request_id].administered = true
            newState.finished = [...state.finished, action.request_id]

            for (var i = 0; i < unfinished.length; i++) {
                if (unfinished[i] !== action.request_id) {
                    new_unfinished.push(unfinished[i])
                }
            }
            newState.unfinished = new_unfinished
            return newState
        }
        
        case 'CLEAR_STATE': {
            return {
                requests: {},
                unfinished: [],
                finished: []
            }
        }

        default:
            return state
    }
}
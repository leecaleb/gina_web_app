const initial_state = {
    class_id: '',
    passcodeTeacherId: {},
    teachers: {
        /*
        {teacher_id}: {
            name: "teacher_name",
            passcode: 33,
            logged_in: false,
            attendance_id: '',
            in_time: '',
            out_time: ''
        }, {...}
        */
    },
    students: {
        /*
        {student_id}: {
            name: "",
            profile_picture: "",
            conversation_id; "",
            blood_type: "",
            address: "",
            home_phone: "",
            father_phone: "",
            mother_phone: ""
        }, {...}
        */
    },
    isConnected: false,
    errMessage: ''
}

export default function classInfo(state = initial_state, action) {
    const newState = { ...state }
    switch (action.type) {
        case 'SET_CONNECT_STATE': {
            const { isConnected } = action
            return {
                ...state,
                isConnected
            }
        }
        case 'INITIALIZE_CLASS':
            var teachers = {}, students = {}
            action.teacher_objs.forEach(teacher => {
                teachers[teacher[0]] = {
                    name: teacher[1],
                    passcode: teacher[2],
                    logged_in: false,
                    in_time: '',
                    out_time: ''
                }
                state.passcodeTeacherId[teacher[2]] = teacher[0]
            })
            action.students.forEach(student => {
                const { 
                    id,
                    name,
                    profile_picture,
                    blood_type,
                    address,
                    home_phone,
                    father_phone, 
                    mother_phone, 
                    conversation_id } = student
                students[id] = {
                    name,
                    profile_picture,
                    blood_type,
                    address,
                    home_phone,
                    father_phone,
                    mother_phone,
                    conversation_id
                }
            })
            
            return {
                ...state,
                passcodeTeacherId: state.passcodeTeacherId,
                teachers: teachers,
                students: students
            }
        
        case 'SET_CLASS_ID':
            return {
                ...state,
                class_id: action.class_id
            }
    
        case 'FETCH_ATTENDANCE_SUCCESS': {
            const { data } = action
            data.forEach(attendance_obj => {
                const { attendance_id, teacher_id, in_time } = attendance_obj
                newState.teachers[teacher_id] = {
                    ...state.teachers[teacher_id],
                    logged_in: true,
                    attendance_id,
                    in_time
                }
            })

            return newState
        }
        
        case 'MARK_TEACHER_LOGGED_IN':{
            const { teacher_id, time, attendance_id } = action
            newState.teachers[teacher_id] = {
                ...state.teachers[teacher_id],
                logged_in: true,
                in_time: time,
                attendance_id
            }
            return newState
        }
        
        case 'MARK_TEACHER_LOGGED_OUT':{
            const { teacher_id, time } = action
            newState.teachers[teacher_id] = {
                ...state.teachers[teacher_id],
                logged_in: false,
                out_time: time,
                attendance_id: ''
            }
            return newState
        }

        case 'MARK_STAFF_ATTENDANCE_FAIL':
            const {errMessage} = action
            return {
                errMessage
            }
        
        case 'CLEAR_STATE':
            return {
                class_id: '',
                passcodeTeacherId: {},
                teachers: {},
                students: {},
                isConnected: false,
                errMessage: ''
            }
        
        default:
            return state
    }

}
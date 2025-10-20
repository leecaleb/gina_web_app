export default function classInfo(state = {
    class_id: '',
    class_name: '',
    school_id: '',
    school_name: '',
    students: {},
    teachers: {}
}, action) {
    switch (action.type) {
        case 'INITIALIZE_CLASS':
            const { students, teachers, class_id, class_name, school_id, school_name } = action
            return {
                ...state,
                class_id,
                class_name,
                school_id,
                school_name,
                students,
                teachers
            }
        case 'SET_CLASS_ID':
            return {
                ...state,
                class_id: action.class_id
            }
        default:
            return state
    }
}

export default function attendance(state = {
    student_attendance: {},
    teacher_attendance: {}
}, action) {
    switch (action.type) {
        case 'MARK_PRESENT':
            const { student_id, teacher_id } = action
            return {
                ...state,
                student_attendance: {
                    ...state.student_attendance,
                    [student_id]: {
                        ...state.student_attendance[student_id],
                        present: true,
                        marked_by: teacher_id,
                        timestamp: new Date().toISOString()
                    }
                }
            }
        case 'MARK_ABSENT':
            return {
                ...state,
                student_attendance: {
                    ...state.student_attendance,
                    [action.student_id]: {
                        ...state.student_attendance[action.student_id],
                        present: false,
                        marked_by: action.teacher_id,
                        timestamp: new Date().toISOString()
                    }
                }
            }
        case 'MARK_STAFF_ATTENDANCE':
            return {
                ...state,
                teacher_attendance: {
                    ...state.teacher_attendance,
                    [action.teacher_id]: {
                        status: action.status,
                        timestamp: new Date().toISOString()
                    }
                }
            }
        default:
            return state
    }
}

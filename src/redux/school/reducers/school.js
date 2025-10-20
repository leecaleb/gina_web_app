const initial_state = {
  isConnected: false,
  classes: {
    /*
    [id]: {
      teachers: [],
      students: [],
      name: ''
    }
    */
  },
  pick_up_request: [],
  admin_passcode: '',
  viewing_status: '',
  passcodeAdminId: {},
  passcodeTeacherId: {},
  teacherOnDuty: '',
  teachers: {
      /*
      [id]: {
          name: '',
          profile_picture: '',
          passcode: 33,
          present: false,
          attendance: [attendance_id, ...]
      }, {...}
      */
  },
  students: {
      /*
      [id]: {
          name: '',
          profile_picture: '',
          present: true,
          wellness_id: '',
          address: '',
          father_phone: '',
          mother_phone: '',
          attendance_id: ''
      }, {...}
      */
  },
  attendance: {
    /*
    [id]: {
      in_time: '',
      out_time: '',
      excuse_type: ''
    }
    */
  },
  student_present: new Set(),
  student_absent: new Set(),
  student_unmarked: new Set(),
  teacher_present: new Set(),
  teacher_absent: new Set(),
  teacher_unmarked: new Set()
}

export default function school(state = initial_state, action) {
  switch (action.type) {
    case 'SET_CONNECT_STATE': {
      const { isConnected } = action
      return {
          ...state,
          isConnected
      }
    }
    case 'FETCH_CLASSES_SUCCESS':
      const { classes, admin_passcode } = action
      return {
        ...state,
        classes,
        admin_passcode
      }
    
    case 'FETCH_TEACHERS_SUCCESS': {
      const { admins, teachers, classes } = action
      const updated_classes = {...state.classes}
      const {passcodeAdminId, passcodeTeacherId} = state
      
      Object.keys(classes).forEach(class_id => {
        updated_classes[class_id].teachers = classes[class_id].teachers
      })

      Object.keys(admins).forEach(admin_id => {
        passcodeAdminId[admins[admin_id].passcode] = admin_id
      })

      Object.keys(teachers).forEach(teacher_id => {
        passcodeTeacherId[teachers[teacher_id].passcode] = teacher_id
      })

      return {
        ...state,
        passcodeAdminId,
        passcodeTeacherId,
        teachers: {
          ...teachers,
          ...admins
        },
        classes: updated_classes,
        teacher_unmarked: new Set(Object.keys(teachers))
      }
    }

    case 'FETCH_STUDENTS_SUCCESS': {
      const { students, classes } = action
      const updated_classes = {...state.classes}

      Object.keys(classes).forEach(class_id => {
        updated_classes[class_id].students = classes[class_id].students
      })
      
      return {
        ...state,
        students,
        classes: updated_classes,
        student_unmarked: new Set(Object.keys(students))
      }
    }

    case 'UPDATE_PROFILE_PICTURE': {
      const { student_id, uri } = action
      const students = {...state.students}
      students[student_id].profile_picture = uri
      return {
        ...state,
        students
      }
    }

    case 'CLEAR_STATE': {
      return {
        ...state,
        viewing_status: ''
      }
    }
  
    case 'CLEAR_SCHOOL_STATE': {
      return {
        isConnected: false,
        classes: {},
        pick_up_request: [],
        passcodeAdminId: {},
        passcodeTeacherId: {},
        teacherOnDuty: '',
        teachers: {},
        students: {},
        attendance: {},
        student_present: new Set(),
        student_absent: new Set(),
        student_unmarked: new Set(),
        teacher_present: new Set(),
        teacher_absent: new Set(),
        teacher_unmarked: new Set()
      }
    }
    
    default:
        return state
  }
}

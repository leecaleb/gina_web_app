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
        // admins,
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

    case 'FETCH_TEACHER_ATTENDANCE_SUCCESS': {
      const { attendance, teachers } = action
      const updated_teachers = {...state.teachers}
      const teacher_unmarked = new Set(Object.keys(state.teachers))
      const teacher_present = new Set()
      const teacher_absent = new Set()
      Object.keys(teachers).forEach(teacher_id => {
        updated_teachers[teacher_id].attendance = teachers[teacher_id].attendance_array
        updated_teachers[teacher_id].present = teachers[teacher_id].present
        updated_teachers[teacher_id].total_minutes = teachers[teacher_id].total_minutes
        if (teachers[teacher_id].present) {
          teacher_present.add(teacher_id)
        } else {
          teacher_absent.add(teacher_id)
        }
        teacher_unmarked.delete(teacher_id)
      })
      return {
        ...state,
        teachers: updated_teachers,
        attendance: {
          ...state.attendance,
          ...attendance
        },
        teacher_present,
        teacher_absent,
        teacher_unmarked
      }
    }

    case 'FETCH_STUDENT_ATTENDANCE_SUCCESS': {
      const { attendance, students, present, absent } = action
      const updated_students = {...state.students}
      const student_unmarked = new Set(Object.keys(state.students))
      Object.keys(students).forEach(student_id => {
        updated_students[student_id].attendance_id = students[student_id]

        if (present.includes(student_id) || absent.includes(student_id)) {
          student_unmarked.delete(student_id)
        }
      })
      return {
        ...state,
        students: updated_students,
        attendance: {
          ...state.attendance,
          ...attendance
        },
        student_present: new Set([...present]),
        student_absent: new Set([...absent]),
        student_unmarked
      }
    }

    case 'EDIT_TEACHER_ON_DUTY': {
      const {teacher_id} = action
      return {
        ...state,
        teacherOnDuty: teacher_id
      }
    }
    
    case 'ADD_PICKUP_REQUEST': {
      const { requests } = action
      return {
        ...state,
        pick_up_request: requests
      }
    }

    case 'UPDATE_VIEWING_STATUS': {
      const { status } = action
      return {
        ...state,
        viewing_status: status
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

    case 'EDIT_STUDENT_SUCCESS': {
      const { student_id, name, old_class_id, new_class_id } = action
      const students = {...state.students}
      const classes = {...state.classes}
      students[student_id].name = name
      students[student_id].class_id = new_class_id

      // remove student id from old class[id].students
      let student_id_array = classes[old_class_id].students
      let new_student_id_array = []
      for(var i = 0; i < student_id_array.length; i++) {
        if (student_id_array[i] !== student_id) {
          new_student_id_array.push(student_id)
        }
      }
      classes[old_class_id].students = new_student_id_array

      // add student id to new class[id].students
      student_id_array = classes[new_class_id].students
      student_id_array.push(student_id)
      classes[new_class_id].students = student_id_array

      return {
        ...state,
        students,
        classes
      }
    }

    case 'UPDATE_TEACHER_PROFILE_PICTURE': {
      const { teacher_id, image_url } = action
      const teachers = {...state.teachers}
      teachers[teacher_id].profile_picture = image_url
      return {
        ...state,
        teachers
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
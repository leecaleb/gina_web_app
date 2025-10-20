export const initializeClass = (students, teachers, class_id, class_name, school_id, school_name) => {
    return {
        type: 'INITIALIZE_CLASS',
        students,
        teachers,
        class_id,
        class_name,
        school_id,
        school_name
    }
}

export const markPresent = (student_id, teacher_id) => {
    return {
        type: 'MARK_PRESENT',
        student_id,
        teacher_id
    }
}

export const markAbsent = (student_id, teacher_id) => {
    return {
        type: 'MARK_ABSENT',
        student_id,
        teacher_id
    }
}

export const markStaffAttendance = (teacher_id, status) => {
    return {
        type: 'MARK_STAFF_ATTENDANCE',
        teacher_id,
        status
    }
}

export const recordAppetite = (student_id, meal_type, appetite_level, teacher_id) => {
    return {
        type: 'RECORD_APPETITE',
        student_id,
        meal_type,
        appetite_level,
        teacher_id
    }
}

export const recordSleep = (student_id, sleep_start_time, sleep_end_time, teacher_id) => {
    return {
        type: 'RECORD_SLEEP',
        student_id,
        sleep_start_time,
        sleep_end_time,
        teacher_id
    }
}

export const recordDiaper = (student_id, diaper_type, teacher_id) => {
    return {
        type: 'RECORD_DIAPER',
        student_id,
        diaper_type,
        teacher_id
    }
}

export const recordMilk = (student_id, milk_amount, teacher_id) => {
    return {
        type: 'RECORD_MILK',
        student_id,
        milk_amount,
        teacher_id
    }
}

export const recordHealthStatus = (student_id, health_status, teacher_id) => {
    return {
        type: 'RECORD_HEALTH_STATUS',
        student_id,
        health_status,
        teacher_id
    }
}

export const recordMedicine = (student_id, medicine_name, medicine_time, teacher_id) => {
    return {
        type: 'RECORD_MEDICINE',
        student_id,
        medicine_name,
        medicine_time,
        teacher_id
    }
}

export const getMedicationRequestsSuccess = (medication_requests) => {
    return {
        type: 'GET_MEDICATION_REQUESTS_SUCCESS',
        medication_requests
    }
}

export const getMedicationRequestsFail = (errMessage) => {
    return {
        type: 'GET_MEDICATION_REQUESTS_FAIL',
        errMessage
    }
}

export const removeRecord = (student_id, record_id, index) => {
    return {
        type: 'REMOVE_RECORD',
        student_id,
        record_id,
        index
    }
}

export const clearState = () => {
    return {
        type: 'CLEAR_STATE'
    }
}

export const getConversations = (conversations, unread_conversation_list) => {
    return {
        type: 'GET_CONVERSATIONS',
        conversations,
        unread_conversation_list
    }
}

export const setMessageDataSchool = (messages, most_recently_read_message_id, conversation_id, student_id) => {
    return {
        type: 'SET_MESSAGE_DATA',
        messages,
        most_recently_read_message_id,
        conversation_id,
        student_id
    }
}

export const setCurrentConversationId = (conversation_id) => {
    return {
        type: 'SET_CURRENT_CONVERSATION_ID',
        conversation_id
    }
}

export const clearCurrentConversationIdSchool = () => {
    return {
        type: 'CLEAR_CURRENT_CONVERSATION_ID'
    }
}

export const setClassId = (class_id) => {
    return {
        type: 'SET_CLASS_ID',
        class_id
    }
}

export const onSendAppetiteSuccess = () => {
    return {
        type: 'ON_SEND_APPETITE_SUCCESS'
    }
}

export const alertErrMessage = (err_message) => {
    return {
        type: 'ALERT_ERR_MESSAGE',
        err_message
    }
}

export const clearAppetiteErrorMessage = () => {
    return {
        type: 'CLEAR_ERR_MESSAGE'
    }
}

export const addStudentIdForUpdate = (student_id_array) => {
    return {
        type: 'ADD_STUDENT_ID_FOR_UPDATE',
        student_id_array
    }
}

export const markWaterDrank = (student_id, meal_type, teacher_id) => {
    return {
        type: 'MARK_WATER_DRANK',
        student_id,
        meal_type,
        teacher_id
    }
}

export const markStaffAttendanceFail = (errMessage) => {
    return {
        type: 'MARK_STAFF_ATTENDANCE_FAIL',
        errMessage
    }
}

export const writeToAll = (text, teacher_id) => {
    return {
        type: 'WRITE_TO_ALL',
        text,
        teacher_id
    }
}

export const writeToOne = (text, student_id, teacher_id) => {
    return {
        type: 'WRITE_TO_ONE',
        text,
        student_id,
        teacher_id
    }
}

export const remindItemsToBringToAll = (items_to_bring_bool, teacher_id) => {
    return {
        type: 'REMIND_ITEMS_TO_BRING_TO_ALL',
        items_to_bring_bool,
        teacher_id
    }
}

export const remindItemsToBringToOne = (student_id, things_to_bring, teacher_id) => {
    return {
        type: 'REMIND_ITEMS_TO_BRING_TO_ONE',
        student_id,
        things_to_bring,
        teacher_id
    }
}

export const recordActivitiesForAll = (new_acitivities_bool, teacher_id) => {
    return {
        type: 'RECORD_ACTIVITIES_FOR_ALL',
        new_acitivities_bool,
        teacher_id
    }
}

export const recordActivitiesForOne = (student_id, activities, teacher_id) => {
    return {
        type: 'RECORD_ACTIVITIES_FOR_ONE',
        student_id,
        activities,
        teacher_id
    }
}

export const writeItemToBringToAll = (item_to_bring, teacher_id) => {
    return {
        type: 'WRITE_ITEM_TO_BRING_TO_ALL',
        item_to_bring,
        teacher_id
    }
}

export const writeItemToBringToOne = (student_id, item_to_bring, teacher_id) => {
    return {
        type: 'WRITE_ITEM_TO_BRING_TO_ONE',
        student_id,
        item_to_bring,
        teacher_id
    }
}

export const writeActivityForAll = (activity, teacher_id) => {
    return {
        type: 'WRITE_ACTIVITY_FOR_ALL',
        activity,
        teacher_id
    }
}

export const writeActivityForOne = (student_id, activity, teacher_id) => {
    return {
        type: 'WRITE_ACTIVITY_FOR_ONE',
        student_id,
        activity,
        teacher_id
    }
}

export const fetchClassMessageData = (message_data) => {
    return {
        type: 'FETCH_CLASS_MESSAGE_DATA',
        message_data
    }
}

export const alertSleeplogErrorMessage = (err_message) => {
    return {
        type: 'ALERT_SLEEPLOG_ERROR_MESSAGE',
        err_message
    }
}

export const clearSleeplogErrorMessage = () => {
    return {
        type: 'CLEAR_SLEEPLOG_ERROR_MESSAGE'
    }
}

export const editFruitName = (fruit_name) => {
    return {
        type: 'EDIT_FRUIT_NAME',
        fruit_name
    }
}

export const fetchClassesSuccess = (classes, admin_passcode, email) => {
    return {
        type: 'FETCH_CLASSES_SUCCESS',
        classes,
        admin_passcode,
        email
    }
}

export const fetchTeachersSuccess = (admins, teachers, classes) => {
    return {
        type: 'FETCH_TEACHERS_SUCCESS',
        admins,
        teachers, 
        classes
    }
}

export const fetchStudentsSuccess = (students, classes) => {
    return {
        type: 'FETCH_STUDENTS_SUCCESS',
        students,
        classes
    }
}

export const initializeStudentWellness = (students) => {
    return {
        type: 'INITIALIZE_STUDENT_WELLNESS',
        students
    }
}

export const sendMessageOnSuccess = () => {
    return {
        type: 'SEND_MESSAGE_ON_SUCCESS'
    }
}

export const setConnectState = (isConnected) => {
    return {
        type: 'SET_CONNECT_STATE',
        isConnected
    }
}

export const clearSchoolState = () => {
    return {
        type: 'CLEAR_SCHOOL_STATE'
    }
}

export const fetchTeacherAttendanceSuccess = (attendance, teachers) => {
    return {
        type: 'FETCH_TEACHER_ATTENDANCE_SUCCESS',
        attendance,
        teachers
    }
}

export const fetchStudentAttendanceSuccess = (attendance, students, present, absent) => {
    return {
        type: 'FETCH_STUDENT_ATTENDANCE_SUCCESS',
        attendance,
        students,
        present,
        absent
    }
}

export const editTeacherOnDuty = (teacher_id) => {
    return {
        type: 'EDIT_TEACHER_ON_DUTY',
        teacher_id
    }
}

export const addPickupRequest = (requests) => {
    return {
        type: 'ADD_PICKUP_REQUEST',
        requests
    }
}

export const updateViewingStatus = (status) => {
    return {
        type: 'UPDATE_VIEWING_STATUS',
        status
    }
}

export const updateProfilePicture = (student_id, uri) => {
    return {
        type: 'UPDATE_PROFILE_PICTURE',
        student_id,
        uri
    }
}

export const editStudentSuccess = (student_id, name, old_class_id, new_class_id) => {
    return {
        type: 'EDIT_STUDENT_SUCCESS',
        student_id,
        name,
        old_class_id,
        new_class_id
    }
}

export const updateTeacherProfilePicture = (teacher_id, image_url) => {
    return {
        type: 'UPDATE_TEACHER_PROFILE_PICTURE',
        teacher_id,
        image_url
    }
}

export const markRecordError = (record_id_array) => {
    return {
        type: 'MARK_RECORD_ERROR',
        record_id_array
    }
}

export const markRecordCorrect = (record_id) => {
    return {
        type: 'MARK_RECORD_CORRECT',
        record_id
    }
}

export const getParentMessageSuccess = (messages) => {
    return {
        type: 'GET_PARENT_MESSAGE_SUCCESS',
        messages
    }
}


export const initializeClass = (teacher_objs, students) => {
    return {
        type: 'INITIALIZE_CLASS',
        teacher_objs,
        students
    }
}

export const rateAppetite = (student_id, mealType, rating, teacher_id) => {
    return {
        type: 'RATE_APPETITE',
        student_id,
        mealType,
        rating,
        teacher_id
    }
}

export const markPresent = (student_id, in_time) => {
    return {
        type: 'MARK_PRESENT',
        student_id,
        in_time
    }
}

export const markDismiss = (student_id, out_time) => {
    return {
        type: 'MARK_DISMISS',
        student_id,
        out_time
    }
}

export const markAbsent = (student_id, excuse_type) => {
    return {
        type: 'MARK_ABSENT',
        student_id,
        excuse_type
    }
}

export const initializeRequests = (requests, finished, unfinished) => {
    return {
        type: 'INITIALIZE_REQUESTS',
        requests,
        finished,
        unfinished
    }
}

export const fillMedRequest = (request_id) => {
    return {
        type: 'FILL_MED_REQUEST',
        request_id
    }
}

export const fetchAttendanceSuccess = (data) => {
    return {
        type: 'FETCH_ATTENDANCE_SUCCESS',
        data
    }
}

export const markTeacherLoggedIn = (teacher_id, time, attendance_id) => {
    return {
        type: 'MARK_TEACHER_LOGGED_IN',
        teacher_id,
        time,
        attendance_id
    }
}

export const markTeacherLoggedOut = (teacher_id, time) => {
    return {
        type: 'MARK_TEACHER_LOGGED_OUT',
        teacher_id,
        time
    }
}

export const clearRatings = (meal_type) => {
    return {
        type: 'CLEAR_RATINGS',
        meal_type
    }
}

export const setAllRatingsToGreat = (mealType, teacher_id) => {
    return {
        type: 'SET_ALL_RATINGS_TO_GREAT',
        mealType,
        teacher_id
    }
}

export const addWaterRecord = (time, student_id) => {
    return {
        type: 'ADD_WATER_RECORD',
        time,
        student_id
    }
}

export const addWellnessRecord = (student_id) => {
    return {
        type: 'ADD_RECORD',
        student_id
    }
}

export const addHealthStatus = (student_id, record_id, status, teacher_id) => {
    return {
        type: 'ADD_HEALTH_STATUS',
        student_id,
        record_id,
        status,
        teacher_id
    }
}

export const addTemperature = (student_id,record_id, temperature, teacher_id) => {
    return {
        type: 'ADD_TEMPERATURE',
        student_id,
        record_id,
        temperature,
        teacher_id
    }
}

export const sendWellnessDataSuccess = () => {
    return {
        type: 'SEND_WELLNESS_DATA_SUCCESS'
    }
}

export const sendWellnessDataFail = (errMessage) => {
    return {
        type: 'SEND_DATA_FAIL',
        errMessage
    }
}

export const invalidateWellnessData = (record_id, errMessage) => {
    return {
        type: 'INVALIDATE_WELLNESS_DATA',
        record_id,
        errMessage
    }
}

export const setSleepTime = (student_id, index, sleep_time, teacher_id) => {
    return {
        type: 'SET_SLEEP_TIME',
        student_id,
        index,
        sleep_time,
        teacher_id
    }
}

export const removeSleepRecord = (record_id, student_id) => {
    return {
        type: 'REMOVE_RECORD',
        record_id,
        student_id
    }
}

export const removeSleepRecordSuccess = (record_id, student_id) => {
    return {
        type: 'REMOVE_RECORD_SUCCESS',
        record_id,
        student_id
    }
}

export const removeSleepRecordFail = (errorMessage) => {
    return {
        type: 'REMOVE_RECORD_FAIL',
        errorMessage
    }
}

export const setWakeTime = (student_id, index, wake_time, teacher_id) => {
    return {
        type: 'SET_WAKE_TIME',
        student_id,
        index,
        wake_time,
        teacher_id
    }
}

export const removeWakeTime = (record_id, teacher_id) => {
    return {
        type: 'REMOVE_WAKE_TIME',
        record_id,
        teacher_id
    }
}

export const editMilkAmount = (record_id, milk_amount, teacher_id) => {
    return {
        type: 'EDIT_MILK_AMOUNT',
        record_id,
        milk_amount,
        teacher_id
    }
}

export const editMilkTime = (record_id, date_time, teacher_id) => {
    return {
        type: 'EDIT_MILK_TIME',
        record_id, 
        date_time,
        teacher_id
    }
}

export const updateDiaperAmount = (student_id, amount) => {
    return {
        type: 'UPDATE_DIAPER_AMOUNT',
        student_id,
        amount
    }
}

export const addDiaperRecord = (student_id, time, cloth_diaper, teacher_id) => {
    return {
        type: 'ADD_DIAPER_RECORD',
        student_id,
        time,
        cloth_diaper,
        teacher_id
    }
}

export const editDiaperTime = (record_id, time, teacher_id) => {
    return {
        type: 'EDIT_DIAPER_TIME',
        record_id, 
        time,
        teacher_id
    }
}

export const switchPeeOrPoo = (record_id, teacher_id) => {
    return {
        type: 'SWITCH_PEE_OR_POO',
        record_id,
        teacher_id
    }
}

export const editPooCondition = (record_id, condition, teacher_id) => {
    return {
        type: 'EDIT_POO_CONDITION',
        record_id,
        condition,
        teacher_id
    }
}

export const removeDiaperRecordSuccess = (student_id, record_id) => {
    return {
        type: 'REMOVE_DIAPER_RECORD_SUCCESS',
        student_id,
        record_id
    }
}

export const removeDiaperRecordFail = (err_message) => {
    return {
        type: 'REMOVE_DIAPER_RECORD_FAIL',
        err_message
    }
}

export const clearDiaperlogErrorMessage = () => {
    return {
        type: 'CLEAR_ERR_MESSAGE'
    }
}

export const addMilkRecord = (student_id) => {
    return {
        type: 'ADD_MILK_RECORD',
        student_id
    }
}

export const clearUpdatedStudents = () => {
    return {
        type: 'CLEAR_UPDATED_STUDENTS'
    }
}

export const fetchClassAppetiteData = (fruit_name, ratings) => {
    return {
        type: 'FETCH_CLASS_APPETITE_DATA',
        fruit_name,
        ratings
    }
}

export const fetchClassWellnessData = (wellnessData) => {
    return {
        type: 'FETCH_CLASS_WELLNESS_DATA',
        wellnessData
    }
}

export const fetchClassSleepData = (sleepData) => {
    return {
        type: 'FETCH_CLASS_SLEEP_DATA',
        sleepData
    }
}

export const clearPendingSleepUpdate = () => {
    return {
        type: 'CLEAR_PENDNING_SLEEP_UPDATE'
    }
}

export const fetchClassMilkData = (milkData) => {
    return {
        type: 'FETCH_CLASS_MILK_DATA',
        milkData
    }
}

// TODO: specify create and edit for milk data
export const createDataSuccess = () => {
    return {
        type: 'CREATE_DATA_SUCCESS'
    }
}

export const createDataFail = (errMessage) => {
    return {
        type: 'CREATE_DATA_FAIL',
        errMessage
    }
}

export const editDataSuccess = () => {
    return {
        type: 'EDIT_DATA_SUCCESS'
    }
}

export const editDataFail = (errMessage) => {
    return {
        type: 'EDIT_DATA_FAIL',
        errMessage
    }
}

export const removeMilkRecordSuccess = () => {
    return {
        type: 'REMOVE_MILK_RECORD_SUCCESS'
    }
}

export const removeMilkRecordFail = () => {
    return {
        type: 'REMOVE_MILK_RECORD_FAIL'
    }
}

export const createSleepRecordSuccess = () => {
    return {
        type: 'CREATE_SLEEP_RECORD_SUCCESS'
    }
}

export const createSleepRecordFail = (errMessage) => {
    return {
        type: 'CREATE_SLEEP_RECORD_FAIL',
        errMessage
    }
}

export const editSleepRecordSuccess = () => {
    return {
        type: 'EDIT_SLEEP_RECORD_SUCCESS'
    }
}

export const editSleepRecordFail = (errMessage) => {
    return {
        type: 'EDIT_SLEEP_RECORD_FAIL',
        errMessage
    }
}

export const fetchClassDiaperData = (diaperData) => {
    return {
        type: 'FETCH_CLASS_DIAPER_DATA',
        diaperData
    }
}

export const createDiaperRecordSuccess = () => {
    return {
        type: 'CREATE_DIAPER_RECORD_SUCCESS'
    }
}

export const createDiaperRecordFail = (errMessage) => {
    return {
        type: 'CREATE_DIAPER_RECORD_FAIL',
        errMessage
    }
}

export const editDiaperRecordSuccess = () => {
    return {
        type: 'EDIT_DIAPER_RECORD_SUCCESS'
    }
}

export const editDiaperRecordFail = (errMessage) => {
    return {
        type: 'EDIT_DIAPER_RECORD_FAIL',
        errMessage
    }
}

export const editDiaperAmountSuccess = () => {
    return {
        type: 'EDIT_DIAPER_AMOUNT_SUCCESS'
    }
}

export const editDiaperAmountFail = (errMessage) => {
    return {
        type: 'EDIT_DIAPER_AMOUNT_FAIL',
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

export const fetchClassesSuccess = (classes, admin_passcode) => {
    return {
        type: 'FETCH_CLASSES_SUCCESS',
        classes,
        admin_passcode
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

export const updateProfilePicture = (student_id , uri) => {
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
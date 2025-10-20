import { combineReducers } from 'redux'
import classInfo from './classInfo'
import attendance from './attendance'
import medicationrequests from './medicationrequests'
import appetite from './appetite'
import water from './water'
import sleep from './sleep'
import healthstatus from './healthstatus'
import milk from './milk'
import diaper from './diaper'
import inbox from './inbox'
import message from './message'
import school from './school'

export default combineReducers({
    classInfo,
    attendance,
    medicationrequests,
    appetite,
    water,
    sleep,
    healthstatus,
    milk,
    diaper,
    message,
    school
})

import { combineReducers } from 'redux'
import parent from './parent'
import attendance from './attendance'
import inbox from './inbox'

export default combineReducers({
    parent,
    attendance,
    inbox
})

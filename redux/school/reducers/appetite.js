var initialState = {
    loaded: false,
    fruit_name: '水果',
    ratings: {
        /*
        {student_id}: { 
            Breakfast: 'Awesome0'
            Fruit: '0'
            Lunch: 'Good1',
            Snack: 'Ok1',
            teacher_id: ''
        }, {...}
        */
    },
    updatedStudents: new Set(),
    err_message: ''
}

export default function appetite(state = initialState, action) {
    switch (action.type) {
        case 'INITIALIZE_CLASS': {
            var ratings = {}
            action.students.forEach(student => {
                const { id } = student
                ratings[id] = {
                    Breakfast: '0',
                    Fruit: '0',
                    Lunch: '0',
                    Snack: '0',
                    teacher_id: ''
                }
            })

            return {
                ...state,
                ratings
            }
        }
        case 'FETCH_CLASS_APPETITE_DATA': {
            const { fruit_name, ratings } = action
            return {
                ...state,
                fruit_name,
                ratings: {
                    ...state.ratings,
                    ...ratings
                }
            }
        }

        case 'EDIT_FRUIT_NAME': {
            const { fruit_name } = action
            return {
                ...state,
                fruit_name,
                // loaded: false
            }
        }

        case 'RATE_APPETITE':{
            const { student_id, mealType, rating, teacher_id } = action
            var { updatedStudents } = state
            const water_drank = state.ratings[student_id][mealType].slice(-1)
            if (rating !== '') {
                updatedStudents = new Set([...state.updatedStudents, student_id])
            }
            return {
                ...state,
                ratings: {
                    ...state.ratings,
                    [student_id]: {
                        ...state.ratings[student_id],
                        [mealType]: rating + water_drank,
                        teacher_id
                    }
                },
                updatedStudents
            }
        }
        
        case 'CLEAR_RATINGS': {
            const { meal_type } = action
            const newState = { ...state }
            const student_id_array = Object.keys(state.ratings)
            const updatedStudents = new Set()
            for (var i = 0; i < student_id_array.length; i++) {
                const student_id = student_id_array[i]
                if (state.ratings[student_id][meal_type] !== '0') {
                    updatedStudents.add(student_id)
                }
                newState.ratings[student_id] = {
                    ...state.ratings[student_id],
                    [meal_type]: '0'
                }
            }
            newState.updatedStudents = updatedStudents

            return newState
        }
        case 'SET_ALL_RATINGS_TO_GREAT':{
            var newRatingObj = {}
            var student_id_array = []
            Object.keys(state.ratings).map((student_id) => {
                student_id_array.push(student_id)
                const water_drank = state.ratings[student_id][action.mealType].slice(-1) === '1'
                newRatingObj[student_id] = {
                    ...state.ratings[student_id],
                    [action.mealType]: water_drank ? 'Awesome1' : 'Awesome0',
                    teacher_id: action.teacher_id
                }
            })
            return {
                ...state,
                ratings: newRatingObj,
                updatedStudents: new Set(student_id_array)
            }
        }
        
        case 'MARK_WATER_DRANK': {
            const { student_id, meal_type, teacher_id } = action
            const updatedStudents = new Set([...state.updatedStudents, student_id])
            const rating = state.ratings[student_id][meal_type]
            const water_drank = rating.slice(-1) === '1'
            return {
                ...state,
                ratings: {
                    ...state.ratings,
                    [student_id]: {
                        ...state.ratings[student_id],
                        [meal_type]: water_drank ? rating.slice(0, -1) + '0' : rating.slice(0, -1) + '1',
                        teacher_id
                    }
                },
                updatedStudents
            }
        }
        case 'CLEAR_UPDATED_STUDENTS':{
            return {
                ...state,
                updatedStudents: new Set()
            }
        }
        case 'ON_SEND_APPETITE_SUCCESS':{
            return {
                ...state,
                updatedStudents: new Set()
            }
        }    
        case 'ALERT_ERR_MESSAGE': {
            const { err_message } = action
            return {
                ...state,
                err_message
            }
        }
            
        case 'CLEAR_ERR_MESSAGE': {
            return {
                ...state,
                err_message: ''
            }
        }
            
        case 'ADD_STUDENT_ID_FOR_UPDATE': {
            const { student_id_array } = action
            return {
                ...state,
                updatedStudents: new Set([...state.updatedStudents, ...student_id_array])
            }
        }
        
        case 'CLEAR_STATE': {
            return {
                loaded: false,
                fruit_name: '水果',
                ratings: {},
                updatedStudents: new Set(),
                err_message: ''
            }
        }
        default:
            return state
    }
}
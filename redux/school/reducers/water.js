export default function water(state = {
    byId: {

    }
}, action) {
    switch (action.type) {
        case 'INITIALIZE_CLASS':
            var students = {}
            action.students.forEach(student => {
                students[student[0]] = []
            })
            return {
                byId: students
            }
        
        case 'ADD_WATER_RECORD':
            // const d = action.date
            // time = d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds()
            // action.student_id_list.forEach(id => {
            //     state.byId[id].push(time)
            // })
            if (!state.byId[action.student_id].includes(action.time)) {
                state.byId[action.student_id].push(action.time)
            }
            return {
                ...state
            }
        default:
            return state
    }
}
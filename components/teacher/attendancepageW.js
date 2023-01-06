import React, { useState } from 'react'
import { View, ScrollView, Text, TouchableHighlight, Alert, Image } from 'react-native'
import { connect } from 'react-redux'
import { get, formatDate } from '../util'
import { bindActionCreators } from 'redux'
import { fetchTeacherAttendanceSuccess, fetchStudentAttendanceSuccess } from '../../redux/school/actions/index'
import LoginNumberPad from './loginnumberpad'
import Modal from './modal'

const AttendanceScreen = (props) => {
    const [ state, setState ] = useState({
        isLoading: true,
        display_list: [],
        students_or_teachers: 'students',
        selected_class_id: 'all',
        showLoginNumberPad: false,
        showModal: false,
        modalStudentId: '',
        teacherClicked: '',
        teacher_id: '',
        pageClicked: ''
    })

    const selectPersonType = (type) => {
        const { classes } = props.school
        // console.log('props: ', props)
        // console.log('classes ', classes)
        const { selected_class_id } = state
        if (selected_class_id === 'all') {
            setState({
                ...state,
                display_list: Object.keys(props.school[type]),
                students_or_teachers: type
            })
            return
        }

        setState({
            ...state,
            display_list: classes[selected_class_id][type],
            students_or_teachers: type
        })
    }

    const selectClass = (class_id) => {
        const { classes } = props.school
        const {students_or_teachers} = state
        // console.log('classes[class_id][students_or_teachers]: ', classes[class_id][students_or_teachers])
        setState({
            ...state,
            display_list: classes[class_id][students_or_teachers],
            selected_class_id: class_id
        })
    }

    const selectAttendanceType = (attendanceType) => {
        const { classes } = props.school
        const { students_or_teachers, selected_class_id } = state
        var display_list = []
        var all_id_list = []
        if (selected_class_id === 'all') {
            all_id_list = Object.keys(props.school[students_or_teachers])
        } else {
            all_id_list = classes[selected_class_id][students_or_teachers]
        }
        for (var i = 0; i < all_id_list.length; i++) {
            if (props.school[`student_${attendanceType}`].has(all_id_list[i])
                || props.school[`teacher_${attendanceType}`].has(all_id_list[i])) {
                display_list.push(all_id_list[i])
            }
        }
        setState({
            ...state,
            display_list
        })
    }

    const handleOnClick = (person_id) => {
        const { teacherOnDuty } = props
        const { students_or_teachers } = state
        // console.log('students_or_teachers: ', students_or_teachers)
        if (students_or_teachers === 'students') {
            if (teacherOnDuty === '') {
                setState({ 
                    ...state,
                    showLoginNumberPad: true,
                    pageClicked: 'student_modal',
                    modalStudentId: person_id,
                    // showModal: true
                })
                return
            }
            showModal(person_id)
        } else {
            setState({
                ...state,
                showLoginNumberPad: true,
                teacherClicked: person_id
            })
        }
    }

    const showModal = (student_id) => {
        setState({
            // showLoginNumberPad: true,
            ...state,
            modalStudentId: student_id,
            showModal: true
        })
    }

    const handleEnterPasscode = (passcode) => {
        const { passcodeTeacherId } = props.school
        const { passcodeAdminId, teachers } = props
        const { pageClicked, teacherClicked } = state
        const teacher_id = passcodeTeacherId[passcode]
        const admin_id = passcodeAdminId[passcode]
        if (admin_id !== undefined) {
            setState({
                ...state,
                teacher_id: admin_id,
                pageClicked: '',
                showModal: true,
                showLoginNumberPad: false
            })
        } else if (pageClicked === 'student_modal' && teacher_id !== undefined) {
            setState({
                ...state,
                teacher_id,
                pageClicked: '',
                showModal: true,
                showLoginNumberPad: false
            })
        } else if (teacher_id === undefined || teacher_id !== teacherClicked) {
            alert('密碼錯誤!')
        } else {
            setState({
                ...state,
                showModal: true,
                showLoginNumberPad: false,
                // modalTeacherId: teacher_id
            })
        }
    }

    const hideLoginPad = () => {
        setState({
            ...state,
            showLoginNumberPad: false,
            modalStudentId: ''
        })
    }

    const hideModal = () => {
        setState({
            ...state,
            showModal: false,
            modalStudentId: '',
            teacher_id: ''
        })
    }
    const { 
        display_list,
        students_or_teachers,
        selected_class_id,
        modalStudentId,
        teacherClicked,
        teacher_id,
        showLoginNumberPad
    } = state

    const { school_id, school, teacherOnDuty } = props
    const { 
        student_present,
        student_unmarked,
        student_absent,
        teacher_present,
        teacher_unmarked,
        teacher_absent
    } = school

    // console.log('display_list ', display_list)
    return (
        <div>
            {showLoginNumberPad ? 
                <LoginNumberPad
                    handleEnterPasscode={(passcode) => handleEnterPasscode(passcode)}
                    hideLoginPad={() => hideLoginPad()}
                /> : null
            }

            <Modal
                show={state.showModal}
                student_id={modalStudentId}
                teacher_id={teacherClicked}
                teacherOnDuty={teacherOnDuty || teacher_id}
                class_id={selected_class_id}
                school_id={school_id}
                navigation={props.navigation}
                // unmarked={unmarked}
                // absent={absent}
                fetchStudentAttendance={() => fetchStudentAttendance()}
                fetchTeacherAttendance={() => fetchTeacherAttendance()}
                hideModal={() => hideModal()}
            />

            {/*////////
            STUDENT/TEACHER 
            ////////*/}
            <View style={{ flex: 1, flexDirection: 'row', backgroundColor: 'white' }}>
                <View style={{ flex: 1, padding: 10 }}>
                    <TouchableHighlight
                        style={{ 
                            flex: 1, 
                            backgroundColor: students_or_teachers === 'students' ? 'lightgrey' : 'white', 
                            justifyContent: 'center' 
                        }}
                        onPress={() => selectPersonType('students')}
                    >
                        <Text style={{ fontSize: 40, textAlign: 'center' }}>學生</Text>
                    </TouchableHighlight>
                </View>
                <View style={{ flex: 1, padding: 10 }}>
                    <TouchableHighlight
                        style={{ 
                            flex:1,
                            backgroundColor: students_or_teachers === 'teachers' ? 'lightgrey' : 'white', 
                            justifyContent: 'center' 
                        }}
                        onPress={() => selectPersonType('teachers')}
                    >
                        <Text style={{ fontSize: 40, textAlign: 'center' }}>教師</Text>
                    </TouchableHighlight>
                </View>
            </View>

            {/*////////
            CLASSES
            ////////*/}
            <View style={{ flex: 1, flexDirection: 'row', backgroundColor: 'white' }}>
                {Object.keys(school.classes).map(class_id => {
                    if (class_id === 'all') {
                        return null
                    }
                    return (
                        <View key={class_id} style={{ flex: 1, padding: 10 }}>
                            <TouchableHighlight
                                style={{ 
                                    flex: 1, 
                                    backgroundColor: selected_class_id === class_id ? 'lightgrey' : 'white', 
                                    justifyContent: 'center' 
                                }}
                                onPress={() => selectClass(class_id)}
                            >
                                <Text style={{ fontSize: 40, textAlign: 'center' }}>{school.classes[class_id].name}</Text>
                            </TouchableHighlight>
                        </View>
                    )
                })}
            </View>

            {/*////////
            ATTENDANCE STATUS
            ////////*/}
            <View style={{ flex: 1, flexDirection: 'row', backgroundColor: 'white' }}>
                <View style={{ flex: 1, padding: 10 }}>
                    <TouchableHighlight
                        style={{ flex: 1, backgroundColor: '#ffe1d0', justifyContent: 'center' }}
                        onPress={() => selectAttendanceType('absent')}
                    >
                        <Text style={{ fontSize: 40, textAlign: 'center' }}>缺席</Text>
                    </TouchableHighlight>
                </View>
                <View style={{ flex: 1, padding: 10 }}>
                    <TouchableHighlight
                        style={{ flex:1, backgroundColor: '#fff1b5', justifyContent: 'center' }}
                        onPress={() => selectAttendanceType('unmarked')}
                    >
                        <Text style={{ fontSize: 40, textAlign: 'center' }}>未知</Text>
                    </TouchableHighlight>
                </View>
                <View style={{ flex: 1, padding: 10 }}>
                    <TouchableHighlight
                        style={{ flex:1, backgroundColor: '#dcf3d0', justifyContent: 'center' }}
                        onPress={() => selectAttendanceType('present')}
                    >
                        <Text style={{ fontSize: 40, textAlign: 'center' }}>出席</Text>
                    </TouchableHighlight>
                </View>
            </View>

            {/*////////
            DISPLAY
            ////////*/}
            <View style={{ flex: 9, backgroundColor: 'lightgrey' }}>
                <ScrollView contentContainerStyle={{ flexDirection:'row', flexWrap: 'wrap', backgroundColor: 'transparent' }}>
                    {display_list.map(person_id => {
                        const person = school[students_or_teachers][person_id]
                        return (
                            <TouchableHighlight 
                                key={person_id}
                                style={{ 
                                    height: 200, 
                                    width: '25%', 
                                    padding: 5,
                                    // backgroundColor: this.props.attendance.unmarked.has(person_id) ? 'black' : 'white'
                                }}
                                onPress={() => handleOnClick(person_id)}
                            >
                                {/* <View style={{ flex: 1, padding: 10, backgroundColor: 'white' }}> */}
                                    <View style={{ flex: 1, padding: 10, backgroundColor: 'white' }}>
                                        <View style={{ justifyContent: 'center' }}>
                                                <Image
                                                    source={
                                                        person.profile_picture === '' && students_or_teachers === 'students' ?
                                                            require('../../assets/icon-thumbnail.png')
                                                            : person.profile_picture === '' && students_or_teachers === 'teachers' ?
                                                                require('../../assets/icon-teacher-thumbnail.png')
                                                                : {uri: person.profile_picture}
                                                    }
                                                    style={{
                                                        height: 150,
                                                        width: 150,
                                                        borderRadius: 75,
                                                        borderWidth: 10,
                                                        borderColor: 
                                                            student_present.has(person_id) || teacher_present.has(person_id) ? '#dcf3d0'
                                                                : student_unmarked.has(person_id) || teacher_unmarked.has(person_id) ? '#fff1b5'
                                                                    : '#ffe1d0'
                                                    }}
                                                />
                                        </View>
                                        <View
                                            footer
                                            style={{ justifyContent: 'center', marginTop: -5 }}
                                        >
                                            <Text style={{ marginTop: -10 }}>{person.name}</Text>
                                        </View>
                                    </View>
                                {/* </View> */}
                            </TouchableHighlight>
                        )
                    })}
                </ScrollView>
            </View>
        </div>
    )
}

const mapStateToProps = (state) => {
    return {
        school: state.school,
        teacherOnDuty: state.school.teacherOnDuty,
        teachers: state.school.teachers,
        passcodeAdminId: state.school.passcodeAdminId,
        attendance: state.attendance
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators({
            fetchTeacherAttendanceSuccess,
            fetchStudentAttendanceSuccess
        }, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps) (AttendanceScreen)
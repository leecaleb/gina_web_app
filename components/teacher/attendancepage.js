import React from 'react'
import { View, ScrollView, Text, TouchableHighlight, Alert, Image } from 'react-native'
import { Card, CardItem, Toast } from 'native-base'
import { connect } from 'react-redux'
import { get, formatDate } from '../util'
import { bindActionCreators } from 'redux'
import { fetchTeacherAttendanceSuccess, fetchStudentAttendanceSuccess } from '../../redux/school/actions/index'
import LoginNumberPad from './loginnumberpad'
import Modal from './modal'

class AttendancePage extends React.Component {
    constructor(props) {
        super(props)
        this.state={
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
        }
    }

    componentDidMount() {
        const { students, teacherOnDuty, teachers } = this.props.school
        const display_list = Object.keys(students)
        this.setState({ display_list })
        this.fetchTeacherAttendance()
        this.fetchStudentAttendance()
        // this.fetchTeacherWellness()
        // this.fetchStudentWellness()
        
        if (teacherOnDuty !== '') {
            const { name }= teachers[teacherOnDuty]
            this.props.navigation.setOptions({ 
                headerRight: () => (
                    <View style={{ paddingRight: 20 }}>
                        <Text style={{ fontSize: 30 }}>{`值班老師：${name}`}</Text>
                    </View>
                )
            })
        }
    }

    selectPersonType(type) {
        const { classes } = this.props.school
        const { selected_class_id } = this.state
        if (selected_class_id === 'all') {
            this.setState({
                display_list: Object.keys(this.props.school[type]),
                students_or_teachers: type
            })
            return
        }

        this.setState({
            display_list: classes[selected_class_id][type],
            students_or_teachers: type
        })
    }

    selectClass(class_id) {
        const { classes } = this.props.school
        const {students_or_teachers} = this.state
        // console.log('classes[class_id][students_or_teachers]: ', classes[class_id][students_or_teachers])
        this.setState({
            display_list: classes[class_id][students_or_teachers],
            selected_class_id: class_id
        })
    }

    selectAttendanceType(attendanceType) {
        const { classes } = this.props.school
        const { students_or_teachers, selected_class_id } = this.state
        var display_list = []
        var all_id_list = []
        if (selected_class_id === 'all') {
            all_id_list = Object.keys(this.props.school[students_or_teachers])
        } else {
            all_id_list = classes[selected_class_id][students_or_teachers]
        }
        for (var i = 0; i < all_id_list.length; i++) {
            if (this.props.school[`student_${attendanceType}`].has(all_id_list[i])
                || this.props.school[`teacher_${attendanceType}`].has(all_id_list[i])) {
                display_list.push(all_id_list[i])
            }
        }
        this.setState({
            display_list
        })
    }

    async fetchTeacherAttendance() {
        const { school_id } = this.props.route.params
        const date = formatDate(new Date())
        const response = await get(`/staff-attendance?school_id=${school_id}&date=${date}`)
        const { success, statusCode, message, data } = response
        if (!success) {
            alert('Sorry 取得教師出席資料時電腦出狀況了！請截圖和與工程師聯繫\n\n' + message)
            return 
        }

        // console.log('data: ', data)
        const { attendance, teachers } = data
        this.props.fetchTeacherAttendanceSuccess(attendance, teachers)
    }

    async fetchStudentAttendance() {
        const { school_id } = this.props.route.params
        const date = formatDate(new Date())
        const response = await get(`/attendance?school_id=${school_id}&date=${date}`)
        const { success, statusCode, message, data } = response
        if (!success) {
            alert('Sorry 取得學生出席資料時電腦出狀況了！請截圖和與工程師聯繫\n\n' + message)
            return 
        }

        const { attendance, students, present, absent } = data
        // console.log('data: ', data)
        this.props.fetchStudentAttendanceSuccess(attendance, students, present, absent)
    }

    handleOnClick(person_id) {
        const { teacherOnDuty } = this.props
        const { students_or_teachers } = this.state
        // console.log('students_or_teachers: ', students_or_teachers)
        if (students_or_teachers === 'students') {
            if (teacherOnDuty === '') {
                this.setState({ 
                    showLoginNumberPad: true,
                    pageClicked: 'student_modal',
                    modalStudentId: person_id,
                    // showModal: true
                })
                return
            }
            this.showModal(person_id)
        } else {
            this.setState({ showLoginNumberPad: true, teacherClicked: person_id })
        }
    }

    showModal(student_id) {
        this.setState({
            // showLoginNumberPad: true,
            modalStudentId: student_id,
            showModal: true
        })
    }

    handleEnterPasscode(passcode) {
        const { passcodeTeacherId } = this.props.school
        const { passcodeAdminId, teachers } = this.props
        const { pageClicked, teacherClicked } = this.state
        const teacher_id = passcodeTeacherId[passcode]
        const admin_id = passcodeAdminId[passcode]
        if (admin_id !== undefined) {
            this.setState({
                teacher_id: admin_id,
                pageClicked: '',
                showModal: true,
                showLoginNumberPad: false
            })
        } else if (pageClicked === 'student_modal' && teacher_id !== undefined) {
            this.setState({
                teacher_id,
                pageClicked: '',
                showModal: true,
                showLoginNumberPad: false
            })
        } else if (teacher_id === undefined || teacher_id !== teacherClicked) {
            Toast.show({
                text: 'Wrong password!',
                buttonText: 'Okay',
                position: "top",
                type: "warning",
                duration: 3000
            })
        } else {
            this.setState({
                showModal: true,
                showLoginNumberPad: false,
                // modalTeacherId: teacher_id
            })
        }
    }

    hideLoginPad() {
        this.setState({ 
            showLoginNumberPad: false,
            modalStudentId: ''
        })
    }

    hideModal() {
        this.setState({
            showModal: false,
            modalStudentId: '',
            teacher_id: ''
        })
    }

    render() {
        const { school_id } = this.props.route.params
        const { school, teacherOnDuty } = this.props
        const { 
            student_present,
            student_unmarked,
            student_absent,
            teacher_present,
            teacher_unmarked,
            teacher_absent
        } = school
        const { 
            display_list,
            students_or_teachers,
            selected_class_id,
            modalStudentId,
            teacherClicked,
            teacher_id,
            showLoginNumberPad
        } = this.state

        return (
            <View style={{ flex: 1 }}>
                {showLoginNumberPad ? 
                    <LoginNumberPad
                        handleEnterPasscode={(passcode) => this.handleEnterPasscode(passcode)}
                        hideLoginPad={() => this.hideLoginPad()}
                    /> : null
                }

                <Modal
                    show={this.state.showModal}
                    student_id={modalStudentId}
                    teacher_id={teacherClicked}
                    teacherOnDuty={teacherOnDuty || teacher_id}
                    class_id={selected_class_id}
                    school_id={school_id}
                    navigation={this.props.navigation}
                    // unmarked={unmarked}
                    // absent={absent}
                    fetchStudentAttendance={() => this.fetchStudentAttendance()}
                    fetchTeacherAttendance={() => this.fetchTeacherAttendance()}
                    hideModal={() => this.hideModal()}
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
                            onPress={() => this.selectPersonType('students')}
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
                            onPress={() => this.selectPersonType('teachers')}
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
                                    onPress={() => this.selectClass(class_id)}
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
                            onPress={() => this.selectAttendanceType('absent')}
                        >
                            <Text style={{ fontSize: 40, textAlign: 'center' }}>缺席</Text>
                        </TouchableHighlight>
                    </View>
                    <View style={{ flex: 1, padding: 10 }}>
                        <TouchableHighlight
                            style={{ flex:1, backgroundColor: '#fff1b5', justifyContent: 'center' }}
                            onPress={() => this.selectAttendanceType('unmarked')}
                        >
                            <Text style={{ fontSize: 40, textAlign: 'center' }}>未知</Text>
                        </TouchableHighlight>
                    </View>
                    <View style={{ flex: 1, padding: 10 }}>
                        <TouchableHighlight
                            style={{ flex:1, backgroundColor: '#dcf3d0', justifyContent: 'center' }}
                            onPress={() => this.selectAttendanceType('present')}
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
                                        height: 300, 
                                        width: '33.3%', 
                                        padding: 5,
                                        // backgroundColor: this.props.attendance.unmarked.has(person_id) ? 'black' : 'white'
                                    }}
                                    onPress={() => this.handleOnClick(person_id)}
                                >
                                    {/* <View style={{ flex: 1, padding: 10, backgroundColor: 'white' }}> */}
                                        <Card style={{ flex: 1, padding: 10, backgroundColor: 'white' }}>
                                            <CardItem style={{ justifyContent: 'center' }}>
                                                    <Image
                                                        source={
                                                            person.profile_picture === '' && students_or_teachers === 'students' ?
                                                                require('../../assets/icon-thumbnail.png')
                                                                : person.profile_picture === '' && students_or_teachers === 'teachers' ?
                                                                    require('../../assets/icon-teacher-thumbnail.png')
                                                                    : {uri: person.profile_picture}
                                                        }
                                                        style={{
                                                            height: 200,
                                                            width: 200,
                                                            borderRadius: 100,
                                                            borderWidth: 10,
                                                            borderColor: 
                                                                student_present.has(person_id) || teacher_present.has(person_id) ? '#dcf3d0'
                                                                    : student_unmarked.has(person_id) || teacher_unmarked.has(person_id) ? '#fff1b5'
                                                                        : '#ffe1d0'
                                                        }}
                                                    />
                                            </CardItem>
                                            <CardItem
                                                footer
                                                style={{ justifyContent: 'center', marginTop: -5 }}
                                            >
                                                <Text style={{ marginTop: -10 }}>{person.name}</Text>
                                            </CardItem>
                                        </Card>
                                    {/* </View> */}
                                </TouchableHighlight>
                            )
                        })}
                    </ScrollView>
                </View>
            </View>
        )
    }
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

export default connect(mapStateToProps, mapDispatchToProps) (AttendancePage)
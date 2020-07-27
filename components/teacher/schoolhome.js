import React from 'react'
import { View, Text, TouchableHighlight, Alert } from 'react-native'
import { Toast } from 'native-base'
import Auth from '@aws-amplify/auth'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { 
    setConnectState, 
    fetchClassesSuccess, 
    fetchTeachersSuccess, 
    fetchStudentsSuccess,
    initializeStudentWellness,
    clearSchoolState,
    addPickupRequest,
    updateViewingStatus,
    fetchStudentAttendanceSuccess } from '../../redux/school/actions/index'
import { get, formatDate } from '../util'
import NetInfo from '@react-native-community/netinfo'
import LoginNumberPad from './loginnumberpad'
// import PickupAlert from './pickupalert'
import ENV from '../../variables'

class SchoolHome extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            classes: [],
            err_message: '',
            showLoginNumberPad: false,
            pageClicked: '',
            class_id: '',
            admin_id: ''
        }
        this.handleSignOut = this.handleSignOut.bind(this)
    }

    async componentDidMount() {
        // this.unsubscribe = NetInfo.addEventListener(state => {
        //     const {isConnected} = state
        //     this.props.setConnectState(isConnected)
        // });
        window.addEventListener('offline', (e) => {
            this.props.setConnectState(false) 
        });
        window.addEventListener('online', () => {
            this.props.setConnectState(true)
        });
        const { school_id } = this.props.route.params
        await this.fetchClassIdAndName()
        this.fetchTeacherData(school_id)
        this.fetchStudentData(school_id)
        // this.timeoutId = this.timer(school_id)
    }

    // timer = (school_id) => setTimeout(() => {
    //     this.poll(school_id)
    // }, 10000)

    // async poll(school_id) {
    //     const { viewing_status } = this.props
    //     if (viewing_status === '') {
    //         const query = `https://iejnoswtqj.execute-api.us-east-1.amazonaws.com/dev/class/${school_id}/updates`
    //         await fetch(query, {
    //             method: 'GET',
    //             headers: {
    //                 Accept: 'application/json',
    //                 'Content-Type': 'application/json'
    //             }
    //         })
    //             .then(res => res.json())
    //             .then(resJson => {
    //                 console.log('schoolhome: ', resJson)
    //                 const update_types = resJson.data
    //                 update_types.forEach(type => {
    //                     if (type === 'pickup_request') {
    //                         this.fetchPickupRequest(school_id)
    //                     } else if(type === 'attendance') {
    //                         this.fetchStudentAttendance()
    //                     } else {
    //                         this.refs[type].fetchData()
    //                     }
    //                 })
    //             })
    //             .catch(err => {
    //                 Toast.show({
    //                     text: '系統出差錯，請重新開ＡＰＰ',
    //                     buttonText: 'Okay',
    //                     position: "top",
    //                     type: "warning",
    //                     duration: 3000
    //                 })
    //             })
    //     }
    //     this.timeoutId = this.timer(school_id)
    // }

    async fetchClassIdAndName() {
        const { school_id } = this.props.route.params
        await fetch(`https://iejnoswtqj.execute-api.us-east-1.amazonaws.com/${ENV}/school/${school_id}`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        })
            .then(res => res.json())
            .then(resJson => {
                const { statusCode, message, data } = resJson
                if (statusCode > 200 || message === 'Internal server error') {
                    alert('Sorry 取得教室資料時電腦出狀況了！請截圖和與工程師聯繫 ' + message)
                    return
                }
                this.setState({
                    classes: data.classes
                })
                const classes = {}
                data.classes.forEach(class_data => {
                    const {id, name } = class_data
                    classes[id] = {
                        teachers: [],
                        students: [],
                        name
                    }
                })
                this.props.fetchClassesSuccess(classes, data.admin_passcode)
            }).catch(err => {
                alert('Sorry 取得教室資料時電腦出狀況了！請截圖和與工程師聯繫')
            })
    }
    async fetchTeacherData(school_id) {
        const response = await get(`/school/${school_id}/teacher`)
        const { success, statusCode, message, data } = response
        if (!success) {
            alert('Sorry 取得教師資料時電腦出狀況了！請截圖和與工程師聯繫\n\n' + message)
            return 
        }
        const {admins, teachers, classes} = data
        this.props.fetchTeachersSuccess(admins, teachers, classes)
        this.getAdminId(teachers)
    }

    getAdminId(teachers) {
        const teacher_id_array = Object.keys(teachers)
        for(var i = 0; i < teacher_id_array.length; i++) {
            if (teachers[teacher_id_array[i]].name === '管理員') {
                this.setState({
                    admin_id: teacher_id_array[i]
                })
                return
            }
        }
    }

    async fetchStudentData(school_id) {
        const response = await get(`/school/${school_id}/student`)
        const { success, statusCode, message, data } = response
        if (!success) {
            alert('Sorry 取得學生資料時電腦出狀況了！請截圖和與工程師聯繫\n\n' + message)
            return 
        }

        const {students, classes} = data
        this.props.fetchStudentsSuccess(students, classes)
        this.props.initializeStudentWellness(Object.keys(students))
    }

    fetchPickupRequest(school_id) {
        const query = `https://iejnoswtqj.execute-api.us-east-1.amazonaws.com/dev/attendance/pickup-request?school_id=${school_id}`
        fetch(query, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        })
            .then(res => res.json())
            .then(resJson => {
                if (resJson.data.length > 0) {
                    this.props.addPickupRequest(resJson.data)
                    this.props.navigation.navigate('PickupAlert', {
                    })
                }
            })
            .catch(err => {
                alert('Sorry 取得接回告知時電腦出狀況了！請截圖和與工程師聯繫')
            })
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
        this.props.fetchStudentAttendanceSuccess(attendance, students, present, absent)
    }

    handleEnterPasscode(passcode) {
        console.log(passcode)
        const { school_name, school_id } = this.props.route.params
        const { passcodeAdminId, passcodeTeacherId, classes, teachers } = this.props
        const { pageClicked, class_id } = this.state
        const teacher_id = passcodeTeacherId[passcode]
        const admin_id = passcodeAdminId[passcode]
        console.log(admin_id)


        if (teacher_id === undefined && admin_id === undefined) {
            alert('密碼不正確！請截圖和與工程師聯繫')
        } else if (admin_id !== undefined) {
            this.setState({ showLoginNumberPad: false })
            this.props.navigation.navigate(pageClicked, {
                school_name, 
                school_id,
                class_id,
                class_name: '管理員：' + teachers[admin_id].name,
                isAdmin: true,
                admin_id
            })
        } else if (class_id !== '' && !classes[class_id].teachers.includes(teacher_id) || pageClicked === 'AdminHome') {
            alert('Sorry 權限不合！請截圖和與工程師聯繫')
        } else { //pageClicked === 'TeacherHome'
            this.setState({ showLoginNumberPad: false })
            this.props.updateViewingStatus('teacher')
            this.props.navigation.navigate('TeacherHome', {
                class_id,
                class_name: classes[class_id].name,
                isAdmin: false
            })
        }
    }

    hideLoginPad() {
        this.setState({ showLoginNumberPad: false })
    }

    handleSignOut() {
        const {loadAuth} = this.props.route.params
        Auth.signOut()
            .then(() => {
                loadAuth()
            })
            .catch(err => console.log(err))
    }

    componentWillUnmount() {
        // clearTimeout(this.timeoutId)
        window.removeEventListener('offline', (e) => {
            this.props.setConnectState(false) 
        });
        window.removeEventListener('online', (e) => {
            this.props.setConnectState(false) 
        });
        this.props.clearSchoolState()
    }

    render() {
        const { classes, showLoginNumberPad } = this.state
        const { school_id } = this.props.route.params
        return (
            <View style={{ flex: 1, flexDirection: 'column' }}>
                {showLoginNumberPad ? 
                    <LoginNumberPad
                        handleEnterPasscode={(passcode) => this.handleEnterPasscode(passcode)}
                        hideLoginPad={() => this.hideLoginPad()}
                    /> : null
                }

                <View style={{ flex: 1, flexDirection: 'row' }}>
                    <TouchableHighlight
                        key='admin'
                        style={{ flex: 1, backgroundColor: '#74b987', margin: 10, justifyContent: 'center' }}
                        onPress={() => this.setState({ showLoginNumberPad: true, pageClicked: 'AdminHome' })}
                    >
                        <Text style={{ fontSize: 50, textAlign: 'center' }}>行政管理</Text>
                    </TouchableHighlight>
                    {/* <TouchableHighlight
                        key='child_dismissal'
                        style={{ flex: 1, backgroundColor: '#74b987', margin: 10, justifyContent: 'center' }}
                        onPress={() => {
                            this.props.navigation.push('DismissChildQRScan', {})
                        }}
                    >
                        <Text style={{ fontSize: 50, textAlign: 'center' }}>放學</Text>
                    </TouchableHighlight> */}
                </View>
                <TouchableHighlight
                    key='attendance_page'
                    style={{ flex: 1, backgroundColor: '#74b987', margin: 10, justifyContent: 'center' }}
                    onPress={() => {
                        this.props.navigation.push('AttendancePage', {
                            school_id
                        })
                    }}
                >
                    <Text style={{ fontSize: 80, textAlign: 'center' }}>出席/打卡</Text>
                </TouchableHighlight>
                <View style={{ flex: 3 }}>
                    {classes.map((class_data) => {
                        if (class_data.name === '管理員') return null
                        return(
                            <TouchableHighlight
                                key={class_data.id}
                                style={{ 
                                    flex: 1,
                                    backgroundColor: '#74b987', 
                                    margin: 10,
                                    justifyContent: 'center'
                                }}
                                onPress={() => this.setState({
                                    showLoginNumberPad: true,
                                    pageClicked: 'TeacherHome',
                                    class_id: class_data.id
                                })}
                            >
                                <Text style={{ fontSize: 80, textAlign: 'center' }}>{class_data.name}</Text>
                            </TouchableHighlight>
                        )
                    })}
                </View>
            </View>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        pick_up_request: state.school.pick_up_request,
        passcodeAdminId: state.school.passcodeAdminId,
        passcodeTeacherId: state.school.passcodeTeacherId,
        classes: state.school.classes,
        teachers: state.school.teachers,
        viewing_status: state.school.viewing_status,
        isConnected: state.school.isConnected
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators({
            setConnectState,
            fetchClassesSuccess, 
            fetchTeachersSuccess, 
            fetchStudentsSuccess,
            initializeStudentWellness,
            addPickupRequest,
            clearSchoolState,
            updateViewingStatus,
            fetchStudentAttendanceSuccess
        }, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps) (SchoolHome)
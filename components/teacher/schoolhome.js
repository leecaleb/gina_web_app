import React, { useState, useEffect } from 'react'
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
import { useNavigate } from "react-router-dom";

const SchoolHome = (props) => {
    let navigate = useNavigate();
    const [state, setState] = useState({
        classes: [],
        err_message: '',
        showLoginNumberPad: false,
        pageClicked: '',
        class_id: '',
        admin_id: ''
    })

    useEffect(() => {
        console.log('useEffect')
        window.addEventListener('offline', (e) => {
            props.setConnectState(false) 
        });
        window.addEventListener('online', () => {
            props.setConnectState(true)
        });
        const { school_id } = props
        async function fetchClass() {
            await fetchClassIdAndName()
            fetchTeacherData(school_id)
            fetchStudentData(school_id)
        }
        fetchClass()

        return () => {
            console.log('school home / useEffect return ')
            window.removeEventListener('offline', (e) => {
                props.setConnectState(false) 
            });
            window.removeEventListener('online', (e) => {
                props.setConnectState(false) 
            });
            // TODO: props.clearSchoolState()
        }
    },[])

    const fetchClassIdAndName = async() => {
        const { school_id } = props
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
                setState({
                    ...state,
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
                props.fetchClassesSuccess(classes, data.admin_passcode)
            }).catch(err => {
                alert('Sorry 取得教室資料時電腦出狀況了！請截圖和與工程師聯繫')
            })
    }

    const fetchTeacherData = async(school_id) => {
        const response = await get(`/school/${school_id}/teacher`)
        const { success, statusCode, message, data } = response
        if (!success) {
            alert('Sorry 取得教師資料時電腦出狀況了！請截圖和與工程師聯繫\n\n' + message)
            return 
        }
        const {admins, teachers, classes} = data
        // console.log('fetchTeacherData / data: ', data)
        props.fetchTeachersSuccess(admins, teachers, classes)
        getAdminId(teachers)
    }

    const getAdminId = (teachers) => {
        const teacher_id_array = Object.keys(teachers)
        for(var i = 0; i < teacher_id_array.length; i++) {
            if (teachers[teacher_id_array[i]].name === '管理員') {
                setState({
                    ...state,
                    admin_id: teacher_id_array[i]
                })
                return
            }
        }
    }

    const fetchStudentData = async(school_id) => {
        const response = await get(`/school/${school_id}/student`)
        const { success, statusCode, message, data } = response
        if (!success) {
            alert('Sorry 取得學生資料時電腦出狀況了！請截圖和與工程師聯繫\n\n' + message)
            return 
        }

        const {students, classes} = data
        props.fetchStudentsSuccess(students, classes)
        props.initializeStudentWellness(Object.keys(students))
    }

    const fetchPickupRequest = (school_id) => {
        const query = `https://iejnoswtqj.execute-api.us-east-1.amazonaws.com/${ENV}/attendance/pickup-request?school_id=${school_id}`
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
                    props.addPickupRequest(resJson.data)
                    props.navigation.navigate('PickupAlert', {
                    })
                }
            })
            .catch(err => {
                alert('Sorry 取得接回告知時電腦出狀況了！請截圖和與工程師聯繫')
            })
    }

    const fetchStudentAttendance = async() => {
        const { school_id } = props
        const date = formatDate(new Date())
        const response = await get(`/attendance?school_id=${school_id}&date=${date}`)
        const { success, statusCode, message, data } = response
        if (!success) {
            alert('Sorry 取得學生出席資料時電腦出狀況了！請截圖和與工程師聯繫\n\n' + message)
            return 
        }

        const { attendance, students, present, absent } = data
        props.fetchStudentAttendanceSuccess(attendance, students, present, absent)
    }

    const handleEnterPasscode = (passcode) => {
        // console.log(passcode)
        const { school_name, school_id } = props
        const { passcodeAdminId, passcodeTeacherId, classes, teachers } = props
        const { pageClicked, class_id } = state
        const teacher_id = passcodeTeacherId[passcode]
        const admin_id = passcodeAdminId[passcode]
        // console.log(admin_id)


        if (teacher_id === undefined && admin_id === undefined) {
            alert('密碼不正確！請截圖和與工程師聯繫')
        } else if (admin_id !== undefined) {
            console.log('school home / class_id: ', class_id)
            setState({ ...state, showLoginNumberPad: false })
            navigate(`/${pageClicked}`, { state: {
                school_name, 
                school_id,
                class_id,
                class_name: '管理員：' + teachers[admin_id].name,
                isAdmin: true,
                admin_id
            }})
        } else if (class_id !== '' && !classes[class_id].teachers.includes(teacher_id) || pageClicked === 'admin') {
            alert('Sorry 權限不合！請截圖和與工程師聯繫')
        } else { //pageClicked === 'TeacherHome'
            setState({ ...state, showLoginNumberPad: false })
            props.updateViewingStatus('teacher')
            console.log('school home / class_id: ', class_id)
            navigate('/class', {
                class_id,
                class_name: classes[class_id].name,
                isAdmin: false
            })
        }
    }

    const hideLoginPad = () => {
        setState({ ...state, showLoginNumberPad: false })
    }

    const handleSignOut = () => {
        const {loadAuth} = props
        Auth.signOut()
            .then(() => {
                loadAuth()
            })
            .catch(err => console.log(err))
    }

    const { classes, showLoginNumberPad } = state
    const { school_id } = props
    // console.log('props.classes: ', props.classes)

    const test = {
        me: new Set()
    }

    // console.log('test: ', test)
    // console.log('everybody: ', {...test})
    return (
        <View style={{ flex: 1, flexDirection: 'column' }}>
            {showLoginNumberPad ? 
                <LoginNumberPad
                    handleEnterPasscode={(passcode) => handleEnterPasscode(passcode)}
                    hideLoginPad={() => hideLoginPad()}
                /> : null
            }

            <View style={{ flex: 1, flexDirection: 'row' }}>
                <TouchableHighlight
                    key='admin'
                    style={{ flex: 1, backgroundColor: '#74b987', margin: 10, justifyContent: 'center' }}
                    onPress={() => setState({ ...state, showLoginNumberPad: true, pageClicked: 'admin' })}
                >
                    <Text style={{ fontSize: 50, textAlign: 'center' }}>行政管理</Text>
                </TouchableHighlight>
                <TouchableHighlight
                    key='child_dismissal'
                    style={{ flex: 1, backgroundColor: '#74b987', margin: 10, justifyContent: 'center' }}
                    onPress={() => {
                        props.updateViewingStatus('dismissal')
                        props.navigation.push('DismissChildQRScan', {})
                    }}
                >
                    <Text style={{ fontSize: 50, textAlign: 'center' }}>放學</Text>
                </TouchableHighlight>
            </View>
            <TouchableHighlight
                key='attendance_page'
                style={{ flex: 1, backgroundColor: '#74b987', margin: 10, justifyContent: 'center' }}
                onPress={() => {
                    navigate('/attendance', { school_id })
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
                            onPress={() => setState({
                                ...state,
                                showLoginNumberPad: true,
                                pageClicked: 'class',
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
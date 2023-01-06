import React, { useEffect, useState, useRef } from 'react'
import { Text, Button, Container, Content, Toast} from 'native-base'
import { StyleSheet, View, AppState, Alert, TouchableHighlight, Image } from 'react-native'
import { setConnectState, initializeClass, setClassId, fetchStudentAttendanceSuccess, clearState } from '../../redux/school/actions/index'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import LoginNumberPad from './loginnumberpad'
import AttendanceCard from './attendancecard'
import MedicationReqeustCard from './medicationrequestcard'
import Reloading from '../reloading'
import PickupAlert from './pickupalert'
import Modal from './modal'
import NetInfo from '@react-native-community/netinfo'
import InboxCard from './inboxcard'
import { beautifyDate, formatDate, get } from '../util'
import AbsenceCard from './absencecard'
import TimeModal from '../parent/timemodal'
import ENV from '../../variables'
import { useNavigate, useLocation } from 'react-router-dom'



// -api ping tai ying yung cheng shi jie mien

const TeacherHome = (props) => {
    let navigate = useNavigate()
    const location = useLocation();
    const refs = {
        messages: useRef(null),
        med_request: useRef(null)
    }
    const [state, setState] = useState({
        date: new Date(),
        isLoading: true,
        showLoginNumberPad: false,
        pageClicked: '',
        alertForPickup: false,
        pickupQueue: [],
        showModal: false,
        modalStudentId: '',
        modalTeacherId: '',
        isAdmin: false,
        admin_id: '',
        appState: '',
        showDateTimeModal: false
    })

    useEffect(() => {
        console.log('teacher home / useEffect')
        initializeConnectionStatus()
        const { class_name, isAdmin, admin_id } = props
        const { class_id } = location?.state || {}
        setState({ ...state, isAdmin, admin_id })
        props.setClassId(class_id)
        initializeClass(class_id)
        const timeoutId = timer(class_id)
        // props.navigation.setOptions({ 
        //     title: class_name
        // })
        fetchStudentAttendance()
        // TODO: AppState.addEventListener("change", _handleAppStateChange);

        return () => {
            console.log('unmounting')
            clearTimeout(timeoutId)
            // TODO: AppState.removeEventListener("change", _handleAppStateChange);
            window.removeEventListener('online', console.log('removing online listener'))
            window.removeEventListener('offline', console.log('removing offline listener'))
            // props.clearState()
        }
    }, [])

    const initializeConnectionStatus = () => {
        if (window.navigator.onLine) {
            setOnline()
            window.addEventListener('online', (e) => { 
                console.log('online');
                setOnline()
            });
            window.addEventListener('offline', (e) => {
                console.log('offline'); 
                setOffline()
            });
        } else {
            setOffline()
        }
    }

    const setOnline = () => {
        props.setConnectState(true)
        // props.navigation.setOptions({ 
        //     headerRight: () => (
        //         <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: '#00c07f', marginRight: 20 }} />
        //     )
        // })
    }

    const setOffline = () => {
        props.setConnectState(false)
        // props.navigation.setOptions({ 
        //     headerRight: () => (
        //         <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: '#fa625f', marginRight: 20 }} />
        //     )
        // })
    }

    const timer = (class_id) => setTimeout(() => {
        poll(class_id)
    }, 10000)

    const poll = async(class_id) => {
        const query = `https://iejnoswtqj.execute-api.us-east-1.amazonaws.com/${ENV}/class/${class_id}/updates`
        await fetch(query, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        })
            .then(res => res.json())
            .then(resJson => { // TODO: make sure to disable this polling for admin log in
                // console.log('teacherhome/poll/resJson: ', resJson)
                const update_types = resJson.data
                update_types.forEach(type => {
                    // console.log('type: ', type)
                    if (type === 'attendance') {
                        fetchStudentAttendance()
                    } else {
                        refs[type].fetchData(state.date)
                    }
                })
            })
            .catch(err => {
                console.log('teacherhome poll err: ', err)
            })
        const timeoutId = timer(class_id)
    }

    const initializeClass = (class_id) => {
        console.log('initializeClass')
        fetch(`https://iejnoswtqj.execute-api.us-east-1.amazonaws.com/${ENV}/class/${class_id}`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        }).then((res) => res.json())
            .then((resJson) => {
                // console.log('teacherHome/resJson: ', resJson)
                props.initializeClass(resJson.teachers, resJson.students)
                setState({
                    ...state,
                    isLoading: false
                })
        }).catch(err => {
            console.log('initializeClass err: ', err)
        })
    }

    const _handleAppStateChange = nextAppState => {
        if (
            state.appState.match(/inactive|background/) &&
            nextAppState === "active"
        ) {
            if (state.date.toDateString() !== (new Date).toDateString()) {
                setState({ ...state, isLoading: true })
                // console.log('state.date.toDateString() !== (new Date).toDateString()')
                const { class_id } = location?.state || {}
                props.clearState()
                props.setClassId(class_id)
                initializeClass(class_id)
                unsubscribe = NetInfo.addEventListener(state => {
                    const {isConnected} = state
                    props.setConnectState(isConnected)
                    // if (isConnected) {
                    //     props.navigation.setOptions({ 
                    //         headerRight: () => (
                    //             <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: '#00c07f', marginRight: 20 }} />
                    //         )
                    //     })
                    // } else {
                    //     props.navigation.setOptions({ 
                    //         headerRight: () => (
                    //             <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: '#fa625f', marginRight: 20 }} />
                    //         )
                    //     })
                    // }
                });
            }
        }
        setState({ ...state, appState: nextAppState, date: new Date() });
    };

    const handleEnterPasscode = (passcode) => {
        const { date } = state
        const { passcodeAdminId, passcodeTeacherId, teachers } = props
        const teacher_id = passcodeTeacherId[passcode] || passcodeAdminId[passcode]
        const isAdmin = passcodeAdminId[passcode] !== undefined

        if (teacher_id === undefined) {
            Toast.show({
                text: '密碼不正確!',
                buttonText: 'Okay',
                position: "top",
                type: "danger",
                duration: 3000
            })
        } else if (state.pageClicked === 'attendance_modal') {
            setState({
                ...state, 
                showModal: true,
                showLoginNumberPad: false,
                modalTeacherId: teacher_id
            })
        } else {
            navigate(`${state.pageClicked}`, { state: {
                teacher_id: teacher_id,
                class: props.class,
                date,
                isAdmin,
                teacher_name: teachers[teacher_id].name
            }})
            setState({ ...state, showLoginNumberPad: false })
        }
    }

    const pageClicked = (pageClicked) => {
        const { isAdmin, admin_id, date } = state
        if (isAdmin) {
            navigate(`/${pageClicked}`, { state: {
                class: props.class,
                teacher_id: admin_id,
                date,
                isAdmin,
                teacher_name: props.teachers[admin_id].name
            }})
        } else {
            setState({ ...state, showLoginNumberPad: true, pageClicked})
        }
    }

    const hideLoginPad = () => {
        setState({ ...state, showLoginNumberPad: false })
    }

    const onConfirmPickup = () => {
        var newPickupQueue = state.pickupQueue.slice(1, state.pickupQueue.length)
        setState({
            ...state, 
            alertForPickup: newPickupQueue.length === 0 ? false : true,
            pickupQueue: newPickupQueue
        })
    }

    const handleShowModal = (student_id) => {
        setState({
            ...state, 
            showLoginNumberPad: true,
            pageClicked: 'attendance_modal',
            modalStudentId: student_id
        })
    }

    const fetchStudentAttendance = async() => {
        const { class_id } = location?.state || {}
        const date = formatDate(state.date)
        const response = await get(`/attendance/class?class_id=${class_id}&date=${date}`)
        const { success, statusCode, message, data } = response
        if (!success) {
            Alert.alert(
                'Sorry 取得學生出席資料時電腦出狀況了！',
                '請截圖和與工程師聯繫\n\n' + message,
                [{ text: 'Ok' }]
            )
            return 
        }
        console.log('data: ', data)
        const { attendance, students, present, absent } = data
        props.fetchStudentAttendanceSuccess(attendance, students, present, absent)
    }

    const hideModal = () => {
        setState({
            ...state, 
            showModal: false
        })
    }

    const selectDatetimeConfirm = (date) => {
        const { isAdmin } = state
        if (!isAdmin || hasUnsentRecords()) return
        setState({
            ...state, 
            date,
            showDateTimeModal: false
        })
    }

    const goBackADay = () => {
        const date = new Date(state.date.getTime())
        if (date.getDay() === 1) {
            date.setDate(date.getDate() - 3)
        } else {
            date.setDate(date.getDate() - 1)
        }
        selectDatetimeConfirm(date)
    }

    const goForwardADay = () => {
        const date = new Date(state.date.getTime())
        if (date.getDay() === 5) {
            date.setDate(date.getDate() + 3)
        } else {
            date.setDate(date.getDate() + 1)
        }
        selectDatetimeConfirm(date)
    }

    const hasUnsentRecords = () => {
        const { wellness_dispatched, message_dispatched, appetite_dispatched, sleep_dispatched, milk_dispatched, diaper_dispatched } = props
        const all_data_dispatched = wellness_dispatched && message_dispatched && appetite_dispatched && sleep_dispatched && milk_dispatched && diaper_dispatched
        if (all_data_dispatched) {
            return false
        }
        return true
    }

    const { school_id } = props
    const { class_id } = location?.state || {}
    const { isLoading, date, showModal, modalStudentId, modalTeacherId, showDateTimeModal, isAdmin } = state
    const { wellness_dispatched, message_dispatched, appetite_dispatched, sleep_dispatched, milk_dispatched, diaper_dispatched } = props
    console.log('isLoading: ', isLoading)
    if (isLoading) {
        return (
            <Reloading />
        )
    }
    return (
        <Container style={{ flex: 1 }}>
            {state.showLoginNumberPad ? 
                <LoginNumberPad
                    handleEnterPasscode={(passcode) => handleEnterPasscode(passcode)}
                    hideLoginPad={hideLoginPad}
                /> : null
            }
            
            {showDateTimeModal && <TimeModal
                start_date={date}
                datetime_type={'date'}
                hideModal={() => setState({ ...state, showDateTimeModal: false })}
                selectDatetimeConfirm={(datetime) => selectDatetimeConfirm(datetime)}
                minDatetime={null}
                maxDatetime={new Date()}
            />}

            <Modal
                show={showModal}
                student_id={modalStudentId}
                teacher_id={null}
                teacherOnDuty={modalTeacherId}
                class_id={class_id}
                school_id={school_id}
                navigation={navigate}
                // unmarked={unmarked}
                // absent={absent}
                fetchStudentAttendance={() => fetchStudentAttendance()}
                fetchTeacherAttendance={() => {return null}}
                hideModal={() => hideModal()}
            />

            <Content contentContainerStyle={{
                marginTop: 30,
                paddingBottom: 50,
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {/* <Button
                    style={styles.button}
                    onPress={() => {props.navigation.push('TeacherClockInOut')}}>
                    <Text style={styles.button_text}>打卡</Text>
                </Button> */}

                {/* <View style={styles.card}>
                    {props.attendance.initialized ? 
                        <AttendanceCard
                            ref="attendance"
                            navigator={props.navigation}
                            showModal={(student_id) => showModal(student_id)}
                        />
                    : <Reloading />
                    }
                </View> */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between'}}>
                    <View style={{ width: '15%'}}>
                        <TouchableHighlight
                            style={{ flex: 1, justifyContent: 'center', alignItems: 'center'}}
                            onPress={() => goBackADay()}
                        >
                            <Image
                                source={require('../../assets/icon-back.png')}
                                style={{ width: 40, height: 40 }}
                            />
                        </TouchableHighlight>
                    </View>

                    <TouchableHighlight
                        onPress={() => {
                            if (!isAdmin || hasUnsentRecords()) return
                            setState({ ...state, showDateTimeModal: true })
                        }}
                    >
                        <Text style={{ fontSize: 50 }}>{beautifyDate(date)}</Text>
                    </TouchableHighlight>

                    <View style={{ width: '15%'}}>
                        {date.toDateString() !== (new Date).toDateString() &&
                            <TouchableHighlight
                                style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
                                onPress={() => goForwardADay()}
                            >
                                <Image
                                    source={require('../../assets/icon-forward.png')}
                                    style={{ width: 40, height: 40 }}
                                />
                            </TouchableHighlight>
                        }
                    </View>
                </View>

                <InboxCard
                    // ref={refs["messages"]}
                    class_id={class_id}
                    students={props.class.students}
                    navigation={navigate}
                    date={date}
                />

                <MedicationReqeustCard //TODO: are we getting med requests real time? or was it slow internet?
                    // ref={refs["med_request"]}
                    class_id={class_id}
                    students={props.class.students}
                    medication_requests={props.medication_requests}
                    navigation={navigate}
                    date={date}
                />

                <View style={styles.button_row}>
                    <TouchableHighlight
                        style={styles.record_button}
                        onPress={() => pageClicked('wellness')}
                    >
                        <View style={{ flex: 1, justifyContent: 'center' }}>
                            <View style={{ zIndex: 2, position: 'absolute', width: '100%', height: '100%' }}>
                                {!wellness_dispatched ? 
                                    <Image
                                        source={require('../../assets/icon-bookmark.png')}
                                        style={{
                                            width: 25,
                                            height: 25,
                                            marginTop: 3,
                                            alignSelf: 'flex-end'
                                        }}
                                    /> 
                                : null}
                            </View>
                            <Text style={styles.button_text}>健康</Text>
                        </View>
                    </TouchableHighlight>

                    <TouchableHighlight
                        style={styles.record_button}
                        onPress={() => pageClicked('message')}
                    >
                        <View style={{ flex: 1, justifyContent: 'center' }}>
                            <View style={{ zIndex: 2, position: 'absolute', width: '100%', height: '100%' }}>
                                {!message_dispatched ? 
                                    <Image
                                        source={require('../../assets/icon-bookmark.png')}
                                        style={{
                                            width: 25,
                                            height: 25,
                                            marginTop: 3,
                                            alignSelf: 'flex-end'
                                        }}
                                    /> 
                                : null}
                            </View>
                            <Text style={styles.button_text}>老師{"\n"}留⾔</Text>
                        </View>
                    </TouchableHighlight>

                    <TouchableHighlight
                        style={styles.record_button}
                        onPress={() => pageClicked('appetite')}
                    >
                        <View style={{ flex: 1, justifyContent: 'center' }}>
                            <View style={{ zIndex: 2, position: 'absolute', width: '100%', height: '100%' }}>
                                {!appetite_dispatched ? 
                                    <Image
                                        source={require('../../assets/icon-bookmark.png')}
                                        style={{
                                            width: 25,
                                            height: 25,
                                            marginTop: 3,
                                            alignSelf: 'flex-end'
                                        }}
                                    /> 
                                : null}
                            </View>
                            <Text style={styles.button_text}>飲食</Text>
                        </View>
                    </TouchableHighlight>
                </View>
                <View style={styles.button_row}>
                    <TouchableHighlight
                        style={styles.record_button}
                        onPress={() => pageClicked('sleep')}
                    >
                        <View style={{ flex: 1, justifyContent: 'center' }}>
                            <View style={{ zIndex: 2, position: 'absolute', width: '100%', height: '100%' }}>
                                {!sleep_dispatched ? 
                                    <Image
                                        source={require('../../assets/icon-bookmark.png')}
                                        style={{
                                            width: 25,
                                            height: 25,
                                            marginTop: 3,
                                            alignSelf: 'flex-end'
                                        }}
                                    /> 
                                : null}
                            </View>
                            <Text style={styles.button_text}>睡眠</Text>
                        </View>
                    </TouchableHighlight>

                    <TouchableHighlight
                        style={styles.record_button}
                        onPress={() => pageClicked('TeacherMilkLog')}
                    >
                        <View style={{ flex: 1, justifyContent: 'center' }}>
                            <View style={{ zIndex: 2, position: 'absolute', width: '100%', height: '100%' }}>
                                {!milk_dispatched ? 
                                    <Image
                                        source={require('../../assets/icon-bookmark.png')}
                                        style={{
                                            width: 25,
                                            height: 25,
                                            marginTop: 3,
                                            alignSelf: 'flex-end'
                                        }}
                                    /> 
                                : null}
                            </View>
                            <Text style={styles.button_text}>餵奶</Text>
                        </View>
                    </TouchableHighlight>

                    <TouchableHighlight
                        style={styles.record_button}
                        onPress={() => pageClicked('DiaperLog')}
                    >
                        <View style={{ flex: 1, justifyContent: 'center' }}>
                            <View style={{ zIndex: 2, position: 'absolute', width: '100%', height: '100%' }}>
                                {!diaper_dispatched ? 
                                    <Image
                                        source={require('../../assets/icon-bookmark.png')}
                                        style={{
                                            width: 25,
                                            height: 25,
                                            marginTop: 3,
                                            alignSelf: 'flex-end'
                                        }}
                                    /> 
                                : null}
                            </View>
                            <Text style={styles.button_text}>換尿布</Text>
                        </View>
                    </TouchableHighlight>
                </View>

                <AbsenceCard
                    class_students={props.class.students}
                    showLoginNumberPad={(student_id) => setState({
                        ...state,
                        showLoginNumberPad: true,
                        modalStudentId: student_id,
                        pageClicked: 'attendance_modal'
                    })}
                />
                <TouchableHighlight
                    style={styles.button}
                    onPress={() => navigate(-1)}>
                    <Text style={styles.button_text}>返回</Text>
                </TouchableHighlight>
            </Content>
        </Container>
    )
}

const styles = StyleSheet.create({
    card: {
        width: '90%'
    },
    button_row: {
        width: '90%',
        height: 100,
        justifyContent: 'space-between',
        flexDirection: 'row',
        marginVertical: 7,
        paddingHorizontal: 3
    },
    button_text: {
        width: '100%',
        textAlign: 'center',
        color: 'gray',
        fontSize: 40
    },
    record_button: {
        width: '30%',
        height: '100%',
        backgroundColor:"#b5e9e9"
    },
    button: {
        width: '30%',
        backgroundColor:"#b5e9e9"
    }
})

const mapStateToProps = (state) => {
    return {
        class: state.classInfo,
        medication_requests: state.medicationrequests,
        attendance: state.attendance,
        teachers: state.school.teachers,
        passcodeAdminId: state.school.passcodeAdminId,
        passcodeTeacherId: state.school.passcodeTeacherId,
        wellness_dispatched: state.healthstatus.data_dispatched,
        message_dispatched: state.message.data_dispatched,
        appetite_dispatched: state.appetite.data_dispatched,
        sleep_dispatched: state.sleep.data_dispatched,
        milk_dispatched: state.milk.data_dispatched,
        diaper_dispatched: state.diaper.data_dispatched
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators({setConnectState, initializeClass, setClassId, fetchStudentAttendanceSuccess, clearState}, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps) (TeacherHome)
import React from 'react'
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

// -api ping tai ying yung cheng shi jie mien

class TeacherHome extends React.Component {
    constructor (props) {
        super(props)
        this.state = {
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
        }
        this.initializeClass = this.initializeClass.bind(this)
        this.handleEnterPasscode = this.handleEnterPasscode.bind(this)
        this.hideLoginPad = this.hideLoginPad.bind(this)
        this.onConfirmPickup = this.onConfirmPickup.bind(this)
        this.showModal = this.showModal.bind(this)
        this.hideModal = this.hideModal.bind(this)
    }

    componentDidMount() {
        this.initializeConnectionStatus()
        const { class_id, class_name, isAdmin, admin_id } = this.props.route.params
        this.setState({ isAdmin, admin_id })
        this.props.setClassId(class_id)
        this.initializeClass(class_id)
        this.timeoutId = this.timer(class_id)
        this.props.navigation.setOptions({ 
            title: class_name
        })
        this.fetchStudentAttendance()
        AppState.addEventListener("change", this._handleAppStateChange);
    }

    initializeConnectionStatus() {
        if (window.navigator.onLine) {
            this.setOnline()
            window.addEventListener('online', (e) => { 
                console.log('online');
                this.setOnline()
            });
            window.addEventListener('offline', (e) => {
                console.log('offline'); 
                this.setOffline()
            });
        } else {
            this.setOffline()
        }
    }

    setOnline() {
        this.props.setConnectState(true)
        this.props.navigation.setOptions({ 
            headerRight: () => (
                <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: '#00c07f', marginRight: 20 }} />
            )
        })
    }

    setOffline() {
        this.props.setConnectState(false)
        this.props.navigation.setOptions({ 
            headerRight: () => (
                <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: '#fa625f', marginRight: 20 }} />
            )
        })
    }

    timer = (class_id) => setTimeout(() => {
        this.poll(class_id)
    }, 10000)

    async poll(class_id) {
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
                        this.fetchStudentAttendance()
                    } else {
                        this.refs[type].fetchData(this.state.date)
                    }
                })
            })
            .catch(err => {
                console.log('teacherhome poll err: ', err)
            })
        this.timeoutId = this.timer(class_id)
    }

    initializeClass(class_id) {
        fetch(`https://iejnoswtqj.execute-api.us-east-1.amazonaws.com/${ENV}/class/${class_id}`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        }).then((res) => res.json())
            .then((resJson) => {
                // console.log('teacherHome/resJson: ', resJson)
                this.props.initializeClass(resJson.teachers, resJson.students)
                this.setState({
                    isLoading: false
                })
        }).catch(err => {
            console.log('initializeClass err: ', err)
        })
    }

    _handleAppStateChange = nextAppState => {
        if (
            this.state.appState.match(/inactive|background/) &&
            nextAppState === "active"
        ) {
            if (this.state.date.toDateString() !== (new Date).toDateString()) {
                this.setState({ isLoading: true })
                // console.log('this.state.date.toDateString() !== (new Date).toDateString()')
                const { class_id } = this.props.route.params
                this.props.clearState()
                this.props.setClassId(class_id)
                this.initializeClass(class_id)
                this.unsubscribe = NetInfo.addEventListener(state => {
                    const {isConnected} = state
                    this.props.setConnectState(isConnected)
                    if (isConnected) {
                        this.props.navigation.setOptions({ 
                            headerRight: () => (
                                <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: '#00c07f', marginRight: 20 }} />
                            )
                        })
                    } else {
                        this.props.navigation.setOptions({ 
                            headerRight: () => (
                                <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: '#fa625f', marginRight: 20 }} />
                            )
                        })
                    }
                });
            }
        }
        this.setState({ appState: nextAppState, date: new Date() });
    };

    handleEnterPasscode(passcode) {
        const { date } = this.state
        const { passcodeAdminId, passcodeTeacherId, teachers } = this.props
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
        } else if (this.state.pageClicked === 'attendance_modal') {
            this.setState({
                showModal: true,
                showLoginNumberPad: false,
                modalTeacherId: teacher_id
            })
        } else {
            this.props.navigation.navigate(this.state.pageClicked, {
                teacher_id: teacher_id,
                class: this.props.class,
                date,
                isAdmin,
                teacher_name: teachers[teacher_id].name
            })
            this.setState({ showLoginNumberPad: false })
        }
    }

    pageClicked(pageClicked) {
        const { isAdmin, admin_id, date } = this.state
        if (isAdmin) {
            this.props.navigation.push(pageClicked, {
                class: this.props.class,
                teacher_id: admin_id,
                date,
                isAdmin,
                teacher_name: this.props.teachers[admin_id].name
            })
        } else {
            this.setState({ showLoginNumberPad: true, pageClicked})
        }
    }

    hideLoginPad() {
        this.setState({ showLoginNumberPad: false })
    }

    onConfirmPickup() {
        var newPickupQueue = this.state.pickupQueue.slice(1, this.state.pickupQueue.length)
        this.setState({
            alertForPickup: newPickupQueue.length === 0 ? false : true,
            pickupQueue: newPickupQueue
        })
    }

    showModal(student_id) {
        this.setState({
            showLoginNumberPad: true,
            pageClicked: 'attendance_modal',
            modalStudentId: student_id
        })
    }

    async fetchStudentAttendance() {
        const { class_id } = this.props.route.params
        const date = formatDate(this.state.date)
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

        const { attendance, students, present, absent } = data
        this.props.fetchStudentAttendanceSuccess(attendance, students, present, absent)
    }

    hideModal() {
        this.setState({
            showModal: false
        })
    }

    selectDatetimeConfirm(date) {
        const { isAdmin } = this.state
        if (!isAdmin || this.hasUnsentRecords()) return
        this.setState({
            date,
            showDateTimeModal: false
        })
    }

    goBackADay() {
        const date = new Date(this.state.date.getTime())
        if (date.getDay() === 1) {
            date.setDate(date.getDate() - 3)
        } else {
            date.setDate(date.getDate() - 1)
        }
        this.selectDatetimeConfirm(date)
    }

    goForwardADay() {
        const date = new Date(this.state.date.getTime())
        if (date.getDay() === 5) {
            date.setDate(date.getDate() + 3)
        } else {
            date.setDate(date.getDate() + 1)
        }
        this.selectDatetimeConfirm(date)
    }

    hasUnsentRecords() {
        const { wellness_dispatched, message_dispatched, appetite_dispatched, sleep_dispatched, milk_dispatched, diaper_dispatched } = this.props
        const all_data_dispatched = wellness_dispatched && message_dispatched && appetite_dispatched && sleep_dispatched && milk_dispatched && diaper_dispatched
        if (all_data_dispatched) {
            return false
        }
        return true
    }

    componentWillUnmount() {
        clearTimeout(this.timeoutId)
        AppState.removeEventListener("change", this._handleAppStateChange);
        window.removeEventListener('online', console.log('removing online listener'))
        window.removeEventListener('offline', console.log('removing offline listener'))
        this.props.clearState()
        // this.unsubscribe()
    }

    render() {
        const { school_id, class_id } = this.props.route.params
        const { isLoading, date, showModal, modalStudentId, modalTeacherId, showDateTimeModal, isAdmin } = this.state
        const { wellness_dispatched, message_dispatched, appetite_dispatched, sleep_dispatched, milk_dispatched, diaper_dispatched } = this.props
        
        if (isLoading) {
            return (
                <Reloading />
            )
        }
        return (
            <Container style={{ flex: 1 }}>
                {this.state.showLoginNumberPad ? 
                    <LoginNumberPad
                        handleEnterPasscode={(passcode) => this.handleEnterPasscode(passcode)}
                        hideLoginPad={this.hideLoginPad}
                    /> : null
                }
                
                {showDateTimeModal && <TimeModal
                    start_date={date}
                    datetime_type={'date'}
                    hideModal={() => this.setState({ showDateTimeModal: false })}
                    selectDatetimeConfirm={(datetime) => this.selectDatetimeConfirm(datetime)}
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
                    navigation={this.props.navigation}
                    // unmarked={unmarked}
                    // absent={absent}
                    fetchStudentAttendance={() => this.fetchStudentAttendance()}
                    fetchTeacherAttendance={() => {return null}}
                    hideModal={() => this.hideModal()}
                />

                <Content contentContainerStyle={{
                    marginTop: 30,
                    paddingBottom: 50,
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {/* <Button
                        style={styles.button}
                        onPress={() => {this.props.navigation.push('TeacherClockInOut')}}>
                        <Text style={styles.button_text}>打卡</Text>
                    </Button> */}

                    {/* <View style={styles.card}>
                        {this.props.attendance.initialized ? 
                            <AttendanceCard
                                ref="attendance"
                                navigator={this.props.navigation}
                                showModal={(student_id) => this.showModal(student_id)}
                            />
                        : <Reloading />
                        }
                    </View> */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between'}}>
                        <View style={{ width: '15%'}}>
                            <TouchableHighlight
                                style={{ flex: 1, justifyContent: 'center', alignItems: 'center'}}
                                onPress={() => this.goBackADay()}
                            >
                                <Image
                                    source={require('../../assets/icon-back.png')}
                                    style={{ width: 40, height: 40 }}
                                />
                            </TouchableHighlight>
                        </View>

                        <TouchableHighlight
                            onPress={() => {
                                if (!isAdmin || this.hasUnsentRecords()) return
                                this.setState({ showDateTimeModal: true })
                            }}
                        >
                            <Text style={{ fontSize: 50 }}>{beautifyDate(date)}</Text>
                        </TouchableHighlight>

                        <View style={{ width: '15%'}}>
                            {date.toDateString() !== (new Date).toDateString() &&
                                <TouchableHighlight
                                    style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
                                    onPress={() => this.goForwardADay()}
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
                        ref="messages"
                        class_id={class_id}
                        students={this.props.class.students}
                        navigation={this.props.navigation}
                        date={date}
                    />

                    <MedicationReqeustCard //TODO: are we getting med requests real time? or was it slow internet?
                        ref="med_request"
                        class_id={class_id}
                        students={this.props.class.students}
                        medication_requests={this.props.medication_requests}
                        navigation={this.props.navigation}
                        date={date}
                    />

                    <View style={styles.button_row}>
                        <TouchableHighlight
                            style={styles.record_button}
                            onPress={() => this.pageClicked('WellnessLog')}
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
                            onPress={() => this.pageClicked('MessageForParents')}
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
                            onPress={() => this.pageClicked('TeacherAppetiteLog')}
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
                            onPress={() => this.pageClicked('TeacherSleepLog')}
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
                            onPress={() => this.pageClicked('TeacherMilkLog')}
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
                            onPress={() => this.pageClicked('DiaperLog')}
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
                        class_students={this.props.class.students}
                        showLoginNumberPad={(student_id) => this.setState({
                            showLoginNumberPad: true,
                            modalStudentId: student_id,
                            pageClicked: 'attendance_modal'
                        })}
                    />
                    <TouchableHighlight
                        style={styles.button}
                        onPress={() => this.props.navigation.goBack()}>
                        <Text style={styles.button_text}>返回</Text>
                    </TouchableHighlight>
                </Content>
            </Container>
        )
    }
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
import React from 'react'
import { Text, Button, Container, Content, Toast} from 'native-base'
import { StyleSheet, View } from 'react-native'
import { setConnectState, initializeClass, setClassId, clearState } from '../../redux/school/actions/index'
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


class TeacherHome extends React.Component {
    constructor (props) {
        super(props)
        this.state = {
            isLoading: true,
            showLoginNumberPad: false,
            pageClicked: '',
            alertForPickup: false,
            pickupQueue: [],
            showModal: false,
            modalStudentId: '',
            modalTeacherId: '',
            isAdmin: false,
            admin_id: ''
        }
        this.initializeClass = this.initializeClass.bind(this)
        this.handleEnterPasscode = this.handleEnterPasscode.bind(this)
        this.hideLoginPad = this.hideLoginPad.bind(this)
        this.onConfirmPickup = this.onConfirmPickup.bind(this)
        this.showModal = this.showModal.bind(this)
        this.hideModal = this.hideModal.bind(this)
    }

    componentDidMount() {
        this.unsubscribe = NetInfo.addEventListener(state => {
            const {isConnected} = state
            this.props.setConnectState(isConnected)
        });
        const { class_id, class_name, isAdmin, admin_id } = this.props.route.params
        this.setState({ isAdmin, admin_id })
        this.props.setClassId(class_id)
        this.initializeClass(class_id)
        this.timeoutId = this.timer(class_id)
        this.props.navigation.setOptions({ 
            title: class_name
        })
    }

    timer = (class_id) => setTimeout(() => {
        this.poll(class_id)
    }, 10000)

    async poll(class_id) {
        const query = `https://iejnoswtqj.execute-api.us-east-1.amazonaws.com/dev/class/${class_id}/updates`
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
                    this.refs[type].fetchData()
                })
            })
            .catch(err => {console.log('err: ', err)})
        this.timeoutId = this.timer(class_id)
    }

    initializeClass(class_id) {
        fetch(`https://iejnoswtqj.execute-api.us-east-1.amazonaws.com/dev/class/${class_id}`, {
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
            console.log('err: ', err)
        })
    }

    handleEnterPasscode(passcode) {
        const teacher_id = this.props.class.passcodeTeacherId[passcode]
        if (teacher_id === undefined) {
            Toast.show({
                text: 'Wrong password!',
                buttonText: 'Okay',
                position: "top",
                type: "warning",
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
            })
            this.setState({ showLoginNumberPad: false })
        }
    }

    pageClicked(pageClicked) {
        const { isAdmin, admin_id } = this.state
        if (isAdmin) {
            this.props.navigation.push(pageClicked, {
                class: this.props.class,
                teacher_id: admin_id
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

    hideModal() {
        this.setState({
            showModal: false
        })
    }

    componentWillUnmount() {
        clearTimeout(this.timeoutId)
        this.props.clearState()
        this.unsubscribe()
    }

    render() {
        const { class_id } = this.props.route.params
        if (this.state.isLoading) {
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
                {/* <PickupAlert
                    ref="pickup_request"
                    class_id={class_id}
                    students={this.props.class.students}
                /> */}

                <Modal
                    show={this.state.showModal}
                    student_id={this.state.modalStudentId}
                    teacher_id={this.state.modalTeacherId}
                    class_id={class_id}
                    hideModal={this.hideModal}
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
                    <InboxCard
                        ref="messages"
                        class_id={class_id}
                        students={this.props.class.students}
                        navigation={this.props.navigation}
                    />

                    <MedicationReqeustCard
                        ref="med_request"
                        class_id={class_id}
                        students={this.props.class.students}
                        medication_requests={this.props.medication_requests}
                        navigation={this.props.navigation}
                    />

                    <View style={styles.button_row}>
                        <Button
                            style={styles.record_button}
                            onPress={() => this.pageClicked('WellnessLog')}>
                            <Text style={styles.button_text}>健康</Text>
                        </Button>
                        <Button
                            style={styles.record_button}
                            onPress={() => this.pageClicked('MessageForParents')}>
                            <Text style={styles.button_text}>老師{"\n"}留⾔</Text>
                            </Button>
                        <Button
                            style={styles.record_button}
                            onPress={() => this.pageClicked('TeacherAppetiteLog')}>
                            <Text style={styles.button_text}>飲食</Text>
                        </Button>
                    </View>
                    <View style={styles.button_row}>
                        <Button
                            style={styles.record_button}
                            onPress={() => this.pageClicked('TeacherSleepLog')}>
                            <Text style={styles.button_text}>睡眠</Text>
                        </Button>
                        <Button
                            style={styles.record_button}
                            onPress={() => this.pageClicked('TeacherMilkLog')}>
                            <Text style={styles.button_text}>餵奶</Text>
                        </Button>
                        <Button
                            style={styles.record_button}
                            onPress={() => this.pageClicked('DiaperLog')}>
                            <Text style={styles.button_text}>換尿布</Text>
                        </Button>
                    </View>
                    <Button
                        style={styles.button}
                        onPress={() => this.props.navigation.goBack()}>
                        <Text style={styles.button_text}>返回</Text>
                    </Button>
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
        teachers: state.school.teachers
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators({setConnectState, initializeClass, setClassId, clearState}, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps) (TeacherHome)
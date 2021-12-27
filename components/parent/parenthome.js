import React from 'react'
import { StyleSheet, ScrollView, View, Text, RefreshControl, TouchableOpacity,
    Alert, Dimensions, AppState, Image, KeyboardAvoidingView, Platform, } from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { setConnectState, initializeChildren, markPresent, clearState } from '../../redux/parent/actions/index'
import Reloading from '../reloading'
import WellnessCard from './wellnesscard';
import AppetiteCard from './appetitecard';
import MilkCard from './milkcard';
import SleepCard from './sleepcard';
import RestroomCard from './restroomcard';
import MessageCard from './messagecard'
import ParentHomeTitle from './parenthometitle'
import ProfileSelector from './profileselector'
import QRPage from './qrpage'
import { formatDate, beautifyDate, beautifyTime, get } from '../util'
import MedicationRequestCard from './medicinerequestcard'
import TimeModal from './timemodal'
import MorningReminderCard from './morningremindercard'
import AnnouncementCard from './announcementcard'
import AttendanceCard from './attendancecard'
import ENV from '../../variables'
import MainMenu from './mainmenu/mainmenu'
const { width } = Dimensions.get('window')

class ParentHome extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            date: new Date(),
            child_id: '',
            student_id_array: [],
            message: '',
            refreshing: false,
            showQR: false,
            temperature: '',
            appState: '',
            showDateTimeModal: false,
            present: false,
            showTimeModal: false,
            showMainMenu: false
        }
        this.initializeChildren = this.initializeChildren.bind(this)
    }

    timer = () => setTimeout(() => {
        this.poll(this.state.child_id)
    }, 10000)

    async poll(student_id) {
        const query = `https://iejnoswtqj.execute-api.us-east-1.amazonaws.com/${ENV}/family/updates?student_id=${student_id}`
        await fetch(query, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        })
            .then(res => res.json())
            .then(resJson => {
                // console.log('parenthome/poll: ')
                const update_types = resJson.data
                update_types.forEach(update_type => {
                    // console.log(update_type)
                    this.refs[update_type].fetchData(student_id, new Date(this.state.date))
                })  
            })
            .catch(err => {
                console.log('polling error: ', err)
            })
        this.timeoutId = this.timer()
    }

    componentDidMount() {
        // this.setDate()
        window.addEventListener('offline', (e) => {
            // console.log('offline ', e)
            this.props.setConnectState(false) 
        });
        window.addEventListener('online', (e) => {
            // console.log('online ', e)
            this.props.setConnectState(true)
        });
        this.initializeChildren()
        this.timeoutId = this.timer()
        AppState.addEventListener("change", this._handleAppStateChange);
        this.props.navigation.setOptions({
            headerLeft: () => (
                <TouchableOpacity
                    style={{ padding: 15 }}
                    onClick={() => this.setState({ showMainMenu: !this.state.showMainMenu })}
                >
                    <Image
                        source={require('../../assets/icon-menu.png')}
                        style={{ width: 20, height: 20 }}
                    />
                </TouchableOpacity>
            )
        })
    }

    // // SPECIAL DAY QUICK TEMP FIX
    // isSpecialDate(date) {
    //     const special_date = new Date()
    //     special_date.setMonth(5,20)
    //     return date.toDateString() === special_date.toDateString()
    // }
    
    // goBackADay() {
    //     const date = new Date(this.state.date.getTime())
    //     const special_date = new Date()
    //     special_date.setMonth(5,22)
    //     if (date.getDay() === 1 && (date.toDateString() !== special_date.toDateString())) {
    //         date.setDate(date.getDate() - 3)
    //     } else if (date.toDateString() === special_date.toDateString()) {
    //         date.setDate(date.getDate() - 2)
    //     } else {
    //         date.setDate(date.getDate() - 1)
    //     }
    //     this.selectDatetimeConfirm(date)
    // }

    // goForwardADay() {
    //     const date = new Date(this.state.date.getTime())
    //     if (date.getDay() === 5 && !this.tomorrowHasClass()) {
    //         date.setDate(date.getDate() + 3)
    //     } else if (date.getDay() === 6 && this.isSpecialDate(date)) {
    //         date.setDate(date.getDate() + 2)
    //     } else {
    //         date.setDate(date.getDate() + 1)
    //     }
    //     this.selectDatetimeConfirm(date)
    // }

    // tomorrowHasClass() {
    //     const date = new Date(this.state.date)
    //     date.setDate(date.getDate() + 1)
    //     const special_date = new Date()
    //     special_date.setMonth(5, 20)
    //     if (date.toDateString() === special_date.toDateString()) {
    //         return true
    //     }
    //     return false
    // }

    
    setDate() {
        const date = new Date()
        if (date.getDay() === 6) {  
            // date.setDate(date.getDate() - 1)
        } else if (date.getDay() === 0) {
            date.setDate(date.getDate() - 2)
        }
        this.selectDatetimeConfirm(date)
    }

    // // SPECIAL DAY QUICK TEMP FIX
    // setDate() {
    //     let date = new Date()
    //     if (date.getDay() === 0) {
    //         date.setDate(date.getDate() - 1)
    //     }
    //     this.selectDatetimeConfirm(date)
    // }


    isIOS() {
        return Platform.OS === 'ios'
    }

    initializeChildren() {
        const { parent_id } = this.props.route.params

        // this.setState({ child_id: '', date: new Date })
        // this.setDate()
        fetch(`https://iejnoswtqj.execute-api.us-east-1.amazonaws.com/${ENV}/family/${parent_id}`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        })
            .then((res) => res.json())
            .then((resJson) => {
                const { statusCode, message, data } = resJson
                if (statusCode > 200 || message === 'Internal server error') {
                    alert('Sorry 電腦出狀況了！請截圖和與工程師聯繫' + message)
                    return
                }
                this.props.initializeChildren(data)
                const student_id_array = Object.keys(this.props.parent.child_of_id)
                this.setState({
                    child_id: student_id_array[0],
                    student_id_array
                })
                this.checkStudentAttendance(student_id_array[0])
                this.setDate()
            })
            .catch((err) => {
                alert('Sorry 電腦出狀況了！請截圖和與工程師聯繫: error occurred when initializing student profiles')
        })
    }

    _handleAppStateChange = nextAppState => {
        if (
            this.state.appState.match(/inactive|background/) &&
            nextAppState === "active"
        ) {
            this.checkStudentAttendance(this.state.child_id)

            if (this.state.date.toDateString() !== (new Date).toDateString() && (new Date).getHours() > 3) {
                this.initializeChildren()
            }
        }
        this.setState({ appState: nextAppState });
    };

    async checkStudentAttendance(student_id) {
        console.log('this.state.date.toDateString(): ', this.state.date.toDateString())
        console.log('(new Date).toDateString(): ', (new Date).toDateString())
        if (this.state.date.toDateString() !== (new Date).toDateString()) {
            return
        }
        const date = new Date()
        const response = await get(`/attendance/${student_id}?date=${formatDate(date)}`)
        const { success, statusCode, message, data } = response
        console.log('response: ', response)
        if (success) {
            console.log('data: ', data)
            const { in_time, out_time, excuse_type, absence_time } = data
            if (this.studentIsPickedUp(in_time, out_time, excuse_type) || this.studentIsAbsentAllDay(absence_time)) {
                // if student has checked in and out or if s/he has submit an absence excuse for the day,
                // then we set time to 18:00 so parents can edit messages for next day
                let date = new Date()
                date.setHours(18,0,0,0)
                this.setState({
                    date
                })
            }
        }
    }

    studentIsPickedUp = (in_time, out_time, excuse_type) => {
        return in_time !== null && out_time !== null;
    }

    studentIsAbsentAllDay = (absence_time) => {
        return absence_time !== null && absence_time === 'all_day'
    }

    studentIsAbsentMorning = (absence_time) => {
        return absence_time === 'morning';
    }

    studentIsAbsentEvening = (absence_time) => {
        return absence_time === 'evening';
    }

    onSelectStudent(child_id) {
        this.setState({ child_id })
    }

    markPresent(temperature) {
        const { date } = this.state
        this.setState({
            temperature,
            present: temperature !== ''
        })
    }

    selectDatetimeConfirm(date) {
        const threshold = new Date()
        threshold.setHours(0,0,0,0)
        if (date.getTime() < threshold.getTime()) { // if selected date is before today
            date.setHours(18)
        } else if (date.toDateString() === (new Date()).toDateString()) { // if selected date is today
            date.setTime(new Date())
        } else { // if selected date is tomorrow
            date.setHours(16, 0, 0)
        }
        this.setState({ date, showDateTimeModal: false }, () => this.checkStudentAttendance(this.state.child_id))
    }

    getDayDifference(startDate, endDate) {
        let start = new Date(startDate)
        let end = new Date(endDate)
        start.setHours(0)
        end.setHours(0)
        const oneDay = 24 * 60 * 60 * 1000;
        return Math.round((end - start) / (oneDay))
    }

    // SPECIAL DAY QUICK TEMP FIX
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

    onMenuItemClick(item) {
        const { child_id } = this.state
        this.setState({ showMainMenu: false })
        this.props.navigation.navigate(item, {
            student_id: child_id,
            students: this.props.parent.child_of_id
        })
    }

    componentWillUnmount() {
        clearTimeout(this.timeoutId)
        AppState.removeEventListener("change", this._handleAppStateChange);
        this.props.clearState()
    }

    render() {
        const { parent_id } = this.props.route.params
        const { isConnected } = this.props
        // console.log('isConnected: ', isConnected)
        const { date, child_id, showQR, temperature, showDateTimeModal, present, showTimeModal, showMainMenu } = this.state
        console.log('parenthome: ', date)
        if (child_id === '') {
            return (
                <Reloading />
            )
        }
        const selected_student = this.props.parent.child_of_id[child_id]
        const day_difference = this.getDayDifference(date, new Date())
        return (
            <KeyboardAvoidingView
                enabled
                behavior={"padding"}
                keyboardVerticalOffset={100}
                style={{ flex: 1, zIndex: 1 }}
            >
                <ProfileSelector
                    ref='profile_selector'
                    student_of_id={this.props.parent.child_of_id}
                    onSelectStudent={(student_id) => this.onSelectStudent(student_id)}
                />
                {showQR ? 
                    <QRPage
                        hideQRCode={() => {
                            this.setState({
                                showQR: false
                            })
                            this.checkStudentAttendance(this.state.child_id)
                        }}
                        parent_id={parent_id}
                    />
                    : null
                }

                {showDateTimeModal ?
                    <TimeModal
                        start_date={date}
                        datetime_type={'date'}
                        hideModal={() => this.setState({ showDateTimeModal: false })}
                        selectDatetimeConfirm={(datetime) => this.selectDatetimeConfirm(datetime)}
                        minDatetime={(new Date()).setDate((new Date()).getDate() - 30)}
                        maxDatetime={(new Date()).setDate((new Date()).getDate() + 1)}
                        paddingVertical={100}
                    />
                    : null
                }

                {showTimeModal &&
                    <TimeModal
                        start_date={new Date()}
                        datetime_type={'time'}
                        hideModal={() => this.setState({ showTimeModal: false })}
                        selectDatetimeConfirm={(time) => this.refs['morningreminder'].selectDatetimeConfirm(time)}
                        minDatetime={null}
                        maxDatetime={null}
                        minTime={null}
                        maxTime={null}
                        paddingVertical={400}
                    />
                }

                {showMainMenu && 
                    <MainMenu
                        onItemClick={(item) => this.onMenuItemClick(item)}
                        onHide={() => this.setState({ showMainMenu: false})}
                    />
                }

                {<ScrollView
                    contentContainerStyle={{ alignItems: 'center', justifyContent: 'center', paddingBottom: 30 }}
                    refreshControl={
                        <RefreshControl
                            style={{backgroundColor: 'transparent' }}
                            refreshing={this.state.refreshing}
                            onRefresh={this.initializeChildren}
                            tintColor="#ff8944"
                            title="Loading..."
                            titleColor="#368cbf"
                            colors={['#ff8944', '#368cbf', '#0000ff']}
                            progressBackgroundColor="#ffff00"
                        />
                    }
                >
                    <View style={{ width: '100%', flexDirection: 'row', backgroundColor: 'white' }}> 
                        <View style={{ width: '15%'}}>
                            {day_difference < 30 ?
                                <TouchableOpacity
                                    style={{ flex: 1, justifyContent: 'center', alignItems: 'center'}}
                                    onClick={() => this.goBackADay()}
                                >
                                    <Image
                                        source={require('../../assets/icon-back.png')}
                                        style={{ width: 40, height: 40 }}
                                    />
                                </TouchableOpacity>
                                : null
                            }
                        </View>
                        <TouchableOpacity
                            style={{ width: '70%', justifyContent: 'center'}}
                            onClick={() => this.setState({ showDateTimeModal: true })}
                        >

                            <Text style={{ fontSize: width * 0.12, textAlign: 'center' }}>
                                {beautifyDate(date)}
                            </Text>
                        </TouchableOpacity>
                        <View style={{ width: '15%'}}>
                            {day_difference >= 0 ?
                                <TouchableOpacity
                                    style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
                                    onClick={() => this.goForwardADay()}
                                >
                                    <Image
                                        source={require('../../assets/icon-forward.png')}
                                        style={{ width: 40, height: 40 }}
                                    />
                                </TouchableOpacity>
                                : null
                            }
                        </View>
                    </View>
                    <ParentHomeTitle
                        student_id={child_id}
                        student={selected_student}
                        students={this.props.parent.child_of_id}
                        student_name={this.props.parent.child_of_id[child_id].name}
                        selectOtherChildProfile={() => this.refs['profile_selector'].slideIn()}
                        viewQRCode={() => this.setState({
                            showQR: true
                        })}
                        temperature={temperature}
                    />

                    <View style={{ flex: 1, width: '93%', flexDirection: 'row', justifyContent: 'space-between', marginVertical: 5 }}>
                        <TouchableOpacity
                            style={{width: '30%', padding: 10, backgroundColor: '#ffe1d0'}}
                            onClick={() => this.props.navigation.navigate('PickupRequest', {
                                child_id,
                                school_id: selected_student.school_id
                            })}>
                            <Text style={{ fontSize: width * 0.05, textAlign: 'center'}}>接回告知</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{width: '30%', padding: 10, backgroundColor: '#fff1b5'}}
                            onClick={() => this.props.navigation.push('MedicationRequestPage', {
                                onGoBack: () => this.refs['med_request'].fetchData(child_id, new Date()),
                                student_id: child_id,
                                class_id: selected_student.class_id
                            })}>
                            <Text style={{ fontSize: width * 0.05, textAlign: 'center' }}>托藥單</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{width: '30%', padding: 10, backgroundColor: '#b5e9e9'}}
                            onClick={() => this.props.navigation.navigate('AbsenceExcusePage', {
                                student_id: child_id,
                                class_id: selected_student.class_id === null ? "" : selected_student.class_id,
                                school_id: selected_student.school_id
                            })}>
                            <Text style={{ fontSize: width * 0.05, textAlign: 'center' }}>請假單</Text>
                        </TouchableOpacity>
                    </View>

                    <AnnouncementCard 
                        child_id={child_id}
                        date={date}
                        parent_id={parent_id}
                        ref="announcement"
                        viewAnnouncement={(index, data) => this.props.navigation.push('AnnouncementPage', {
                            onGoBack: () => this.refs['announcement'].fetchAnnouncement(),
                            index,
                            data,
                            parent_id
                        })}
                        viewMore={(announcements) => this.props.navigation.push('AnnouncementListPage', {
                            announcements,
                            parent_id,
                            viewAnnouncement: (index, data) => this.props.navigation.push('AnnouncementPage', {
                                onGoBack: () => this.refs['announcement'].fetchAnnouncement(),
                                index,
                                data,
                                parent_id
                            })
                        })}
                    />

                    <MorningReminderCard
                        child_id={child_id}
                        date={date}
                        class_id={selected_student.class_id}
                        ref="morningreminder"
                        present={present}
                        isConnected={isConnected}
                        parent_id={parent_id}
                        showTimeModal={() => this.setState({ showTimeModal: true })}
                    />

                    <AttendanceCard
                        student_id={child_id}
                        date={date}
                        ref="attendance"
                    />

                    <MedicationRequestCard
                        child_id={child_id}
                        date={date}
                        ref="med_request"
                        viewMedRequest={(index, data) => this.props.navigation.push('AddMedicationRequestPage', {
                            onGoBack: () => this.refs['med_request'].fetchData(child_id, new Date()),
                            student_id: child_id, 
                            class_id: selected_student.class_id === null ? "" : selected_student.class_id,
                            index,
                            data
                        })}
                    />

                    <WellnessCard
                        child_id={child_id}
                        date={date}
                        ref="wellness"
                        updateTitleTemp={(temperature) => this.markPresent(temperature)}
                    />

                    <MessageCard
                        child_id={child_id}
                        date={date}
                        class_id={selected_student.class_id}
                        ref="messages"
                        parent_id={parent_id}
                    />

                    <AppetiteCard
                        child_id={child_id}
                        date={date}
                        ref="appetite"
                    />

                    <MilkCard
                        child_id={child_id}
                        date={date}
                        ref="milkintake"
                    />

                    <SleepCard
                        child_id={child_id}
                        date={date}
                        ref="sleep"
                    />

                    <RestroomCard
                        child_id={child_id}
                        date={date}
                        ref="diaper"
                    />

                </ScrollView>}
            </KeyboardAvoidingView>
        );
    }
}

const styles = StyleSheet.create({
    button_text: {
        fontSize: 18,
        textAlign: 'center'
    },
    button: {
        width: '30%',
        padding: 20,
        justifyContent: 'center',
        // shadowColor: "#000",
        // shadowOffset: {
        //     width: 0,
        //     height: 1,
        // },
        // shadowOpacity: 0.22,
        // shadowRadius: 2.22,
        // elevation: 3,
    }
})

const mapStateToProps = (state) => {
    return {
        parent: state.parent,
        isConnected: state.parent.isConnected
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators({
            setConnectState,
            initializeChildren,
            markPresent,
            clearState
        }, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ParentHome)

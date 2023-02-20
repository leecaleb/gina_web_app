import React, { useState, useEffect, useRef } from 'react'
import { StyleSheet, ScrollView, View, Text, RefreshControl, TouchableOpacity,
    Alert, Dimensions, AppState, Image, KeyboardAvoidingView, Platform, TouchableHighlight} from 'react-native'
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
import { useNavigate } from "react-router-dom";

const { width } = Dimensions.get('window')

const ParentHome = (props) => {
    let navigate = useNavigate();
    const [state, setState] = useState({
        date: null,
        child_id: '',
        student_id_array: [],
        message: '',
        refreshing: false,
        showQR: false,
        temperature: '',
        present: false,
        showMainMenu: false,
    })

    const [checkAttendance, setCheckAttendance] = useState(false)
    const [showTimeModal, setShowTimeModal] = useState(false)
    const [showDateTimeModal, setShowDateTimeModal] = useState(false)

    const appState = useRef(AppState.currentState);

    const morningReminderRef = useRef();
    const profileSelector = useRef()
    
    const timer = () => setTimeout(() => {
        poll(state.child_id)
    }, 10000)

    const poll = async(student_id) => {
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
                // TODO
                // update_types.forEach(update_type => {
                //     // console.log(update_type)
                //     this.refs[update_type].fetchData(student_id, new Date(state.date))
                // })  
            })
            .catch(err => {
                console.log('polling error: ', err)
            })
        // this.timeoutId = timer()
    }

    useEffect(() => {
        // this.setDate()
        window.addEventListener('offline', (e) => {
            // console.log('offline ', e)
            props.setConnectState(false) 
        });
        window.addEventListener('online', (e) => {
            // console.log('online ', e)
            props.setConnectState(true)
        });
        async function fetchChildren() {
            initializeChildren()
        }
        fetchChildren()
        // this.timeoutId = timer()
        AppState.addEventListener("change", _handleAppStateChange);
        // props.navigation.setOptions({
        //     headerLeft: () => (
        //         <TouchableOpacity
        //             style={{ padding: 15 }}
        //             onClick={() => setState({ showMainMenu: ! state.showMainMenu })}
        //         >
        //             <Image
        //                 source={require('../../assets/icon-menu.png')}
        //                 style={{ width: 20, height: 20 }}
        //             />
        //         </TouchableOpacity>
        //     )
        // })

        return () => {
            // clearTimeout(this.timeoutId)
            AppState.removeEventListener("change", _handleAppStateChange);
            props.clearState()
        }
    }, [])

    useEffect(() => {
        if (checkAttendance) {
            checkStudentAttendance(state.child_id)
        }
    }, [checkAttendance])

    // SPECIAL DAY QUICK TEMP FIX
    const isSpecialDate = (date) => {
        const special_date = new Date()
        special_date.setMonth(1,18)
        return date.toDateString() === special_date.toDateString()
    }
    
    const goBackADay = () => {
        const date = new Date(state.date.getTime())
        const special_date = new Date()
        special_date.setMonth(1,20)
        
        if (date.getDay() === 1 && (date.toDateString() !== special_date.toDateString())) {
            date.setDate(date.getDate() - 3)
        } else if (date.toDateString() === special_date.toDateString()) {
            date.setDate(date.getDate() - 2)
        } else {
            date.setDate(date.getDate() - 1)
        }
        selectDatetimeConfirm(date)
    }

    const goForwardADay = () => {
        const date = new Date(state.date.getTime())
        console.log('date: ', date)
        if (date.getDay() === 5 && !tomorrowHasClass()) {
            date.setDate(date.getDate() + 3)
        } else if (date.getDay() === 6 && isSpecialDate(date)) {
            date.setDate(date.getDate() + 2)
        } else {
            date.setDate(date.getDate() + 1)
        }
        selectDatetimeConfirm(date)
    }

    const tomorrowHasClass = () => {
        const date = new Date(state.date)
        date.setDate(date.getDate() + 1)
        const special_date = new Date()
        special_date.setMonth(1, 18)

        if (date.toDateString() === special_date.toDateString()) {
            return true
        }
        return false
    }
    // SPECIAL DAY QUICK TEMP FIX

    // const setDatetime = () => {
    //     const date = new Date()
    //     if (date.getDay() === 6) {  
    //         date.setDate(date.getDate() - 1)
    //     } else if (date.getDay() === 0) {
    //         date.setDate(date.getDate() - 2)
    //     }

    //     const threshold = new Date()
    //     threshold.setHours(0,0,0,0)
    //     if (date.getTime() < threshold.getTime()) { // if selected date is before today
    //         date.setHours(18)
    //     } else if (date.toDateString() === (new Date()).toDateString()) { // if selected date is today
    //         date.setTime(new Date())
    //     } else { // if selected date is tomorrow
    //         date.setHours(16, 0, 0)
    //     }
    //     return date
    //     // selectDatetimeConfirm(date)
    // }

    // SPECIAL DAY QUICK TEMP FIX
    const setDatetime = () => {
        let date = new Date()
        date.setMonth(1,21)
        if (date.getDay() === 0) {
            date.setDate(date.getDate() - 1)
        }

        const threshold = new Date()
        threshold.setHours(0,0,0,0)
        if (date.getTime() < threshold.getTime()) { // if selected date is before today
            date.setHours(18)
        } else if (date.toDateString() === (new Date()).toDateString()) { // if selected date is today
            date.setTime(new Date())
        } else { // if selected date is tomorrow
            date.setHours(16, 0, 0)
        }
        return date
    }
    // SPECIAL DAY QUICK TEMP FIX

    const isIOS = () => {
        return Platform.OS === 'ios'
    }

    const initializeChildren = () => {
        // console.log('initializeChildren')
        const { parent_id } = props
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
                props.initializeChildren(data)
                const student_id_array = Object.keys(props.parent.child_of_id)
                // console.log('student_id_array: ', student_id_array)
                setState({
                    ...state,
                    child_id: student_id_array[0],
                    student_id_array,
                    date: setDatetime()
                })
                setCheckAttendance(true)
                // setDate()
            })
            .catch((err) => {
                alert('Sorry 電腦出狀況了！請截圖和與工程師聯繫: error occurred when initializing student profiles')
        })
    }

    const _handleAppStateChange = (nextAppState) => {
        if (
            appState.current.match(/inactive|background/) &&
            nextAppState === "active"
        ) {
            setCheckAttendance(true)
            // TODO: if (state.date.toDateString() !== (new Date).toDateString() && (new Date).getHours() > 3) {
            //     initializeChildren()
            // }
        }
        appState.current = nextAppState
    };

    const checkStudentAttendance = async(student_id) => {
        // console.log('checkStudentAttendance')
        // console.log('state.date.toDateString(): ', state.date.toDateString())
        // console.log('(new Date).toDateString(): ', (new Date).toDateString())
        const date = state.date || new Date()
        // console.log(`state: `, state)
        const current_student = student_id || state.child_id
        // console.log(`current_student: ${current_student}`)
        if (current_student === "") return
        if (date.toDateString() !== (new Date).toDateString()) {
            return
        }
           
        const response = await get(`/attendance/${current_student}?date=${formatDate(date)}`)
        const { success, statusCode, message, data } = response
        // console.log('response: ', response)
        if (success) {
            // console.log('data: ', data)
            const { in_time, out_time, excuse_type, absence_time } = data
            if (studentIsPickedUp(in_time, out_time, excuse_type) || studentIsAbsentAllDay(absence_time)) {
                // if student has checked in and out or if s/he has submit an absence excuse for the day,
                // then we set time to 18:00 so parents can edit messages for next day
                let date = new Date()
                date.setHours(18,0,0,0)
                setState({
                    ...state, 
                    date
                })
            }
        }
        setCheckAttendance(false)
    }

    const studentIsPickedUp = (in_time, out_time, excuse_type) => {
        return in_time !== null && out_time !== null;
    }

    const studentIsAbsentAllDay = (absence_time) => {
        return absence_time !== null && absence_time === 'all_day'
    }

    const studentIsAbsentMorning = (absence_time) => {
        return absence_time === 'morning';
    }

    const studentIsAbsentEvening = (absence_time) => {
        return absence_time === 'evening';
    }

    const onSelectStudent = (child_id) => {
        // console.log('onSelectStudent')
        setState({ ...state, child_id })
    }

    const markPresent = (temperature) => {
        const { date } = state
        setState({
            ...state,
            temperature,
            present: temperature !== ''
        })
    }

    const selectDatetimeConfirm = (date) => {
        // console.log('selectDatetimeConfirm: ', date)
        const threshold = new Date()
        threshold.setHours(0,0,0,0)
        if (date.getTime() < threshold.getTime()) { // if selected date is before today
            date.setHours(18)
        } else if (date.toDateString() === (new Date()).toDateString()) { // if selected date is today
            date.setTime(new Date())
        } else { // if selected date is tomorrow
            date.setHours(16, 0, 0)
        }
        setState({
            ...state,
            date,
        })
        setShowDateTimeModal(false)
        setCheckAttendance(true)
    }

    const getDayDifference = (startDate, endDate) => {
        let start = new Date(startDate)
        let end = new Date(endDate)
        start.setHours(0)
        end.setHours(0)
        const oneDay = 24 * 60 * 60 * 1000;
        return Math.round((end - start) / (oneDay))
    }

    // // SPECIAL DAY QUICK TEMP FIX
    // const goBackADay = () => {
    //     const date = new Date(state.date.getTime())
    //     if (date.getDay() === 1) {
    //         date.setDate(date.getDate() - 3)
    //     } else {
    //         date.setDate(date.getDate() - 1)
    //     }
    //     selectDatetimeConfirm(date)
    // }

    // const goForwardADay = () => {
    //     // console.log('goForwardADay')
    //     const date = new Date(state.date.getTime())
    //     if (date.getDay() === 5) {
    //         date.setDate(date.getDate() + 3)
    //     } else {
    //         date.setDate(date.getDate() + 1)
    //     }
    //     selectDatetimeConfirm(date)
    // }

    const onMenuItemClick = (item) => {
        const { child_id } = state
        setState({ ...state, showMainMenu: false })
        navigate(item, {
            student_id: child_id,
            students: props.parent.child_of_id
        })
    }

    const { parent_id } = props
    const { isConnected } = props
    // console.log('isConnected: ', isConnected)
    const { date, child_id, showQR, temperature, present, showMainMenu } = state
    // console.log(`parenthome / child_id ${child_id} / date ${date}`)
    // console.log(`appState.current: ${appState.current}`)
    if (child_id === '' || date === null) {
        return (
            <Reloading />
        )
    }
    const selected_student = props.parent.child_of_id[child_id]
    const day_difference = getDayDifference(date, new Date())
    return (
        <KeyboardAvoidingView
            enabled
            behavior={"padding"}
            keyboardVerticalOffset={100}
            style={{ flex: 1, zIndex: 1 }}
        >
            <ProfileSelector
                ref={profileSelector}
                student_of_id={props.parent.child_of_id}
                onSelectStudent={(student_id) => onSelectStudent(student_id)}
            />
            {showQR ? 
                <QRPage
                    hideQRCode={() => {
                        setState({
                            ...state,
                            showQR: false
                        })
                        setCheckAttendance(true)
                    }}
                    parent_id={parent_id}
                />
                : null
            }

            {showDateTimeModal ?
                <TimeModal
                    start_date={date}
                    datetime_type={'date'}
                    hideModal={() => setShowDateTimeModal(false)}
                    selectDatetimeConfirm={(datetime) => selectDatetimeConfirm(datetime)}
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
                    hideModal={() => setShowTimeModal(false)}
                    selectDatetimeConfirm={(time) => morningReminderRef.current.selectDatetimeConfirm(time)}
                    minDatetime={null}
                    maxDatetime={null}
                    minTime={null}
                    maxTime={null}
                    paddingVertical={400}
                />
            }

            {showMainMenu && 
                <MainMenu
                    onItemClick={(item) => onMenuItemClick(item)}
                    onHide={() => setState({ ...state, showMainMenu: false})}
                />
            }

            {<ScrollView
                contentContainerStyle={{ alignItems: 'center', justifyContent: 'center', paddingBottom: 30 }}
                refreshControl={
                    <RefreshControl
                        style={{backgroundColor: 'transparent' }}
                        refreshing={state.refreshing}
                        onRefresh={initializeChildren}
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
                                onPress={() => goBackADay()}
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
                        onPress={() => setShowDateTimeModal(true)}
                    >
                        <Text style={{ fontSize: width * 0.12, textAlign: 'center' }}>
                            {beautifyDate(date)}
                        </Text>
                    </TouchableOpacity>
                    <View style={{ width: '15%'}}>
                        {day_difference >= 0 ?
                            <TouchableHighlight
                                style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
                                onPress={() => goForwardADay()}
                            >
                                <Image
                                    source={require('../../assets/icon-forward.png')}
                                    style={{ width: 40, height: 40 }}
                                />
                            </TouchableHighlight>
                            : null
                        }
                    </View>
                </View>
                <ParentHomeTitle
                    student_id={child_id}
                    student={selected_student}
                    students={props.parent.child_of_id}
                    student_name={props.parent.child_of_id[child_id].name}
                    selectOtherChildProfile={() => profileSelector.current.slideIn()}
                    viewQRCode={() => setState({
                        ...state, 
                        showQR: true
                    })}
                    temperature={temperature}
                />

                <View style={{ flex: 1, width: '93%', flexDirection: 'row', justifyContent: 'space-between', marginVertical: 5 }}>
                    <TouchableHighlight
                        style={{width: '30%', padding: 10, backgroundColor: '#ffe1d0'}}
                        onPress={() => navigate('/pickup', {
                            state: {
                                child_id,
                                school_id: selected_student.school_id
                            }
                        })}>
                        <Text style={{ fontSize: width * 0.05, textAlign: 'center'}}>接回告知</Text>
                    </TouchableHighlight>
                    <TouchableOpacity
                        style={{width: '30%', padding: 10, backgroundColor: '#fff1b5'}}
                        onPress={() => navigate('/med-request', {
                            state: {
                                student_id: child_id,
                                class_id: selected_student.class_id
                            }
                            // onGoBack: () => this.refs['med_request'].fetchData(child_id, new Date()),
                            
                        })}>
                        <Text style={{ fontSize: width * 0.05, textAlign: 'center' }}>托藥單</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{width: '30%', padding: 10, backgroundColor: '#b5e9e9'}}
                        onPress={() => navigate('/absence-request', {
                            state: {
                                student_id: child_id,
                                class_id: selected_student.class_id === null ? "" : selected_student.class_id,
                                school_id: selected_student.school_id
                            }
                        })}>
                        <Text style={{ fontSize: width * 0.05, textAlign: 'center' }}>請假單</Text>
                    </TouchableOpacity>
                </View>

                <AnnouncementCard 
                    child_id={child_id}
                    date={date}
                    parent_id={parent_id}
                    // ref="announcement"
                    viewAnnouncement={(index, data) => navigate('AnnouncementPage', {
                        // onGoBack: () => this.refs['announcement'].fetchAnnouncement(),
                        index,
                        data,
                        parent_id
                    })}
                    viewMore={(announcements) => navigate('AnnouncementListPage', {
                        announcements,
                        parent_id,
                        viewAnnouncement: (index, data) => navigate('AnnouncementPage', {
                            // onGoBack: () => this.refs['announcement'].fetchAnnouncement(),
                            index,
                            data,
                            parent_id
                        })
                    })}
                />

                <MorningReminderCard
                    student_id={child_id}
                    date={date}
                    class_id={selected_student.class_id}
                    ref={morningReminderRef}
                    present={present}
                    isConnected={isConnected}
                    parent_id={parent_id}
                    showTimeModal={() => setShowTimeModal(true)}
                />

                <AttendanceCard
                    student_id={child_id}
                    date={date}
                    // ref="attendance"
                />

                <MedicationRequestCard
                    child_id={child_id}
                    date={date}
                    // ref="med_request"
                    viewMedRequest={(index, data) => navigate('/add-med-request', {
                        state: {
                            // onGoBack: () => this.refs['med_request'].fetchData(child_id, new Date()),
                            student_id: child_id, 
                            class_id: selected_student.class_id === null ? "" : selected_student.class_id,
                            index,
                            data
                        }
                    })}
                />

                <WellnessCard
                    child_id={child_id}
                    date={date}
                    updateTitleTemp={(temperature) => markPresent(temperature)}
                />

                <MessageCard
                    child_id={child_id}
                    date={date}
                    class_id={selected_student.class_id}
                    parent_id={parent_id}
                />

                <AppetiteCard
                    child_id={child_id}
                    date={date}
                    // ref="appetite"
                />

                <MilkCard
                    child_id={child_id}
                    date={date}
                    // ref="milkintake"
                />

                <SleepCard
                    child_id={child_id}
                    date={date}
                    // ref="sleep"
                />

                <RestroomCard
                    child_id={child_id}
                    date={date}
                    // ref="diaper"
                />

            </ScrollView>}
        </KeyboardAvoidingView>
    );
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

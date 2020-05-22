import React from 'react'
import { StyleSheet, ScrollView, View, Text, RefreshControl, TouchableHighlight, 
    Alert, Dimensions, AppState,Image, KeyboardAvoidingView, Platform } from 'react-native'
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
import { formatDate, beautifyDate, beautifyTime } from '../util'
import MedicationRequestCard from './medicinerequestcard'
import TimeModal from './timemodal'
import MorningReminderCard from './morningremindercard'
import ENV from '../../variables'
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
            present: false
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
                const update_types = resJson.data
                update_types.forEach(update_type => {
                    this.refs[update_type].fetchData(student_id, new Date())
                })  
            })
            .catch(err => {
                console.log('polling error: ', err)
            })
        this.timeoutId = this.timer()
    }

    componentDidMount() {
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
    }

    isIOS() {
        return Platform.OS === 'ios'
    }

    initializeChildren() {
        const { parent_id } = this.props.route.params

        this.setState({ child_id: '', date: new Date })
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
            if (this.state.date.toDateString() !== (new Date).toDateString()) {
                this.initializeChildren()
            }
        }
        this.setState({ appState: nextAppState });
    };

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
        if (date.getTime() < threshold.getTime()) {
            date.setHours(18)
        } else if (date.toDateString() === (new Date()).toDateString()) {
            date.setTime(new Date())
        } else {
            date.setHours(16, 0, 0)
        }
        this.setState({ date, showDateTimeModal: false })
    }

    getDayDifference(startDate, endDate) {
        let start = new Date(startDate)
        let end = new Date(endDate)
        start.setHours(0)
        end.setHours(0)
        const oneDay = 24 * 60 * 60 * 1000;
        return Math.round((end - start) / (oneDay))
    }

    goBackADay() {
        const date = new Date(this.state.date.getTime())
        date.setDate(date.getDate() - 1)
        this.selectDatetimeConfirm(date)
    }

    goForwardADay() {
        const date = new Date(this.state.date.getTime())
        date.setDate(date.getDate() + 1)
        this.selectDatetimeConfirm(date)
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
        const { date, child_id, showQR, temperature, showDateTimeModal, present } = this.state
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
                        hideQRCode={() => this.setState({
                            showQR: false
                        })}
                        parent_id={parent_id}
                    />
                    : null
                }

                {showDateTimeModal ? // TODO: time box show in screen
                    <TimeModal
                        start_date={date}
                        datetime_type={'date'}
                        hideModal={() => this.setState({ showDateTimeModal: false })}
                        selectDatetimeConfirm={(datetime) => this.selectDatetimeConfirm(datetime)}
                        minDatetime={(new Date()).setDate((new Date()).getDate() - 7)}
                        maxDatetime={(new Date()).setDate((new Date()).getDate() + 1)}
                    />
                    : null
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
                            {day_difference < 7 ?
                                <TouchableHighlight
                                    style={{ flex: 1, justifyContent: 'center', alignItems: 'center'}}
                                    onPress={() => this.goBackADay()}
                                >
                                    <Image
                                        source={require('../../assets/icon-back.png')}
                                        style={{ width: 40, height: 40 }}
                                    />
                                </TouchableHighlight>
                                : null
                            }
                        </View>
                        <TouchableHighlight
                            style={{ width: '70%', justifyContent: 'center'}}
                            onPress={() => this.setState({ showDateTimeModal: true })}
                        >

                            <Text style={{ fontSize: width * 0.12, textAlign: 'center' }}>
                                {beautifyDate(date)}
                            </Text>
                        </TouchableHighlight>
                        <View style={{ width: '15%'}}>
                            {day_difference >= 0 ?
                                <TouchableHighlight
                                    style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
                                    onPress={() => this.goForwardADay()}
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
                        student={selected_student}
                        student_name={this.props.parent.child_of_id[child_id].name}
                        selectOtherChildProfile={() => this.refs['profile_selector'].slideIn()}
                        viewQRCode={() => this.setState({
                            showQR: true
                        })}
                        temperature={temperature}
                    />

                    <View style={{ flex: 1, width: '93%', flexDirection: 'row', justifyContent: 'space-between', marginVertical: 5 }}>
                        <TouchableHighlight
                            style={{width: '30%', padding: 10, backgroundColor: '#ffe1d0'}}
                            onPress={() => this.props.navigation.navigate('PickupRequest', {
                                child_id,
                                school_id: selected_student.school_id
                            })}>
                            <Text style={{ fontSize: width * 0.05, textAlign: 'center'}}>接回告知</Text>
                        </TouchableHighlight>
                        <TouchableHighlight
                            style={{width: '30%', padding: 10, backgroundColor: '#fff1b5'}}
                            onPress={() => this.props.navigation.push('MedicationRequestPage', {
                                onGoBack: () => this.refs['med_request'].fetchData(child_id, new Date()),
                                student_id: child_id,
                                class_id: selected_student.class_id
                            })}>
                            <Text style={{ fontSize: width * 0.05, textAlign: 'center' }}>托藥單</Text>
                        </TouchableHighlight>
                        <TouchableHighlight
                            style={{width: '30%', padding: 10, backgroundColor: '#b5e9e9'}}
                            onPress={() => this.props.navigation.navigate('AbsenceExcusePage', {
                                student_id: child_id,
                                class_id: selected_student.class_id === null ? "" : selected_student.class_id,
                                school_id: selected_student.school_id
                            })}>
                            <Text style={{ fontSize: width * 0.05, textAlign: 'center' }}>請假單</Text>
                        </TouchableHighlight>
                    </View>

                    <MorningReminderCard
                        child_id={child_id}
                        date={date}
                        class_id={selected_student.class_id}
                        ref="morningreminder"
                        present={present}
                        isConnected={isConnected}
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

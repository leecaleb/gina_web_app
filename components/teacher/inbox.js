import React, { useState, useEffect } from 'react'
import { View, Text, RefreshControl, StyleSheet, Image, TouchableHighlight, ScrollView, Alert } from 'react-native'
import { connect } from 'react-redux'
// import MedRequestModal from './medrequestmodal'
import { bindActionCreators } from 'redux';
// import { initializeRequests, fillMedRequest } from '../../../redux/school/actions/index' 
import Reloading from '../reloading'
import { formatDate, put, get, beautifyDate } from '../util'
import LoginNumberPad from './loginnumberpad'
import TimeModal from '../parent/timemodal'
import { useLocation } from 'react-router-dom'

const Inbox = (props) => {
    
    const location = useLocation()
    const [state, setState] = useState({
        date: new Date(),
        isLoading: true,
        refreshing: false,
        selected_request_id: '',
        showLoginNumberPad: false,
        messages: [],
        messages_read: new Set(),
        showDateModal: false
    })

    useEffect(() => {
        console.log('location?.state: ', location)
        const { messages=[], date } = location?.state || {}
        setState({
            ...state,
            date,
            messages: sortMessages(messages)
        })

        // return () => {
        //     const { date } = location?.state || {}
        //     const { onGoBack } = location?.data || {}
        //     onGoBack(date)
        // }
    }, [])

    const markRead = async(message_id, morning_reminder_id, student_id, index) => {
        const response = await put(`/message/read`, {
            'message_id': message_id,
            'morning_reminder_id': morning_reminder_id,
            student_id
        })
        const { success, statusCode, message, data } = response
        if (!success) {
            Alert.alert(
                `Sorry 標記已讀訊息時電腦出狀況了！`,
                '請截圖和與工程師聯繫\n\n' + message,
                [{ text: 'Ok' }]
              )
              return 
        }
        bubbleDown(index)
        let messages_read = new Set([...state.messages_read])
        if (message_id !== null) messages_read.add(message_id)
        if (morning_reminder_id !== null) messages_read.add(morning_reminder_id)
        setState({
            ...state,
            messages_read
        })
    }

    const bubbleDown = (index) => {
        const { messages, messages_read } = state
        const n = messages.length
        while (index < n-1) {
            const { message_id } = messages[index+1]
            if (!messages_read.has(message_id)) {
                var temp = messages[index]
                messages[index] = messages[index+1]
                messages[index+1] = temp 
            }
            index+=1
        }
        setState({
            ...state,
            messages
        })
    }

    const sortMessages = (data) => {
        let messages = data
        let left_pointer = 0
        let messages_read = new Set()
        for(var i = 0; i < messages.length; i++) {
            const { message_id, morning_reminder_id, message_read, morning_reminder_read } = messages[i]
            if ((message_read !== null && !message_read) || 
                (morning_reminder_read !== null && !morning_reminder_read)) {
                var temp = messages[left_pointer]
                messages[left_pointer] = messages[i]
                messages[i] = temp
                left_pointer+=1
            } else {
                if (message_id !== null) messages_read.add(message_id)
                if (morning_reminder_id !== null) messages_read.add(morning_reminder_id)
            }
        }
        setState({
            ...state,
            messages_read
        })
        return messages
    }

    const refresh = async(date) => {
        const { class_id } = location?.state || {}
        const response = await get(`/message/class/${class_id}/unread?date=${formatDate(date)}`)
        const { success, statusCode, message, data } = response
        if (!success) {
            Alert.alert(
                `Sorry 取得家長訊息時電腦出狀況了！`,
                '請截圖和與工程師聯繫\n\n' + message,
                [{ text: 'Ok' }]
              )
              return 
        }
        setState({ ...state, messages: sortMessages(data) })
    }

    const selectDatetimeConfirm = (date) => {
        setState({
            ...state,
            date,
            showDateModal: false
        })
        refresh(date)
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

    const { students } = location?.state || {}
    const { messages, messages_read, date, showDateModal } = state
    return (
        <View style={{ flex: 1, paddingBottom: 40 }}>
            {showDateModal &&
                <TimeModal
                    start_date={date}
                    datetime_type={'date'}
                    hideModal={() => setState({ ...state, showDateModal: false })}
                    selectDatetimeConfirm={(datetime) => selectDatetimeConfirm(datetime)}
                    minDatetime={null}
                    maxDatetime={new Date()}
                />
            }
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
                    style={{ alignSelf: 'center', padding: 10 }}
                    onPress={() => setState({ ...state, showDateModal: true })}
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
            
            <ScrollView>
                {messages.map((message, index) => {
                    const {
                        message_id,
                        morning_reminder_id,
                        activities, 
                        items_to_bring, 
                        message_for_teacher,  
                        morning_reminder, 
                        other_activity, 
                        other_item, 
                        student_id, 
                        teacher_id, 
                        text,
                        message_read,
                        morning_reminder_read
                    } = message
                    const read = messages_read.has(message_id) || messages_read.has(morning_reminder_id)
                    return (
                        <View 
                            key={index}
                            style={{
                                flexDirection: 'row',
                                backgroundColor: 'white',
                                borderWidth: 1,
                                borderColor: 'lightgrey',
                                marginBottom: 20,
                                padding: 20,

                            }}
                        >
                            <View>
                                <Image
                                    source={
                                        students[student_id].profile_picture === '' ?
                                            require('../../assets/icon-thumbnail.png')
                                            : {uri: students[student_id].profile_picture}
                                    }
                                    style={styles.thumbnailImage}
                                />
                                <View style={{ justifyContent: 'center', alignItems: 'center', paddingTop: 20 }}>
                                    <Text style={{ fontSize: 25 }}>
                                        {students[student_id].name}
                                    </Text>
                                </View>
                                <TouchableHighlight
                                    disabled={read}
                                    style={{
                                        justifyContent: 'center', 
                                            justifyContent: 'center', 
                                        justifyContent: 'center', 
                                        alignItems: 'center', 
                                            alignItems: 'center', 
                                        alignItems: 'center', 
                                        marginTop: 20, 
                                        padding: 15,
                                        backgroundColor: read ? '#dcf3d0' : '#ffe1d0'
                                    }}
                                    onPress={() => markRead(message_id, morning_reminder_id, student_id, index)}
                                >
                                    <Text style={{ fontSize: 25 }}>{read ? '已讀' : '未讀'}</Text>
                                </TouchableHighlight>
                            </View>
                            
                            <View style={{ flex:1, marginLeft: 20 }}>

                                <View style={{}}>
                                    <Text style={{ fontSize: 25, fontWeight: 'bold' }}>
                                        老師的話:
                                    </Text>
                                    <Text style={{ fontSize: 20 }}>
                                        {text && text + '\n'}
                                    </Text>
                                </View>

                                <View style={{}}>
                                    <Text style={{ fontSize: 25, fontWeight: 'bold' }}>
                                        家長回應:
                                    </Text>
                                    <Text style={{ fontSize: 20 }}>
                                        {message_for_teacher && message_for_teacher + '\n'}
                                    </Text>
                                </View>

                                <View style={{}}>
                                    <Text style={{ fontSize: 25, fontWeight: 'bold' }}>
                                        早晨叮嚀:
                                    </Text>
                                    <Text style={{ fontSize: 20 }}>
                                        {morning_reminder && morning_reminder + '\n'}
                                    </Text>
                                </View>

                            </View>
                        </View>
                    )
                })}
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    cardContainer: {
        width: 170,
        paddingRight: 5
    },
    thumbnailImage: {
        height: 160,
        width: 160,
        borderRadius: 80
    }
})

const mapStateToProps = (state) => {
    return {
        class: state.classInfo,
        requests: state.medicationrequests
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators({}, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps) (Inbox)
import React, { useEffect, useState, useRef } from 'react'
import {
    View, TouchableOpacity, Text, Animated, ScrollView, Alert, KeyboardAvoidingView, Platform, Dimensions
} from 'react-native'
import AbsenceExcuse from './absenceexcuse'
import { formatDate } from '../util'
import ENV from '../../variables'
import { connect } from 'react-redux'
import { useLocation } from 'react-router-dom'

const { height } = Dimensions.get('window')

const AbsenceExcusePage = (props) => {

    const location = useLocation()
    const absenceExcuse = useRef()

    const [state, setState] = useState({
        todays_date: formatDate(new Date()),
        SlideInRight: new Animated.Value(0),
        SlideInLeft: new Animated.Value(0),
        total_height: 1,
        total_width: 1,
        height: 0,
        width: 0,
        left: 0,
        top: 0,
        requests: [],
        day_of_week: ['天', '一', '二', '三', '四', '五', '六'],
        selected_request_index: -1
    })

    useEffect(() => {
        // const { isConnected } = this.props
        // if (!isConnected) {
        //     alert('網路連不到! 請稍後再試試看')
        //     return
        // }
        fetchAbsenceExcuse()
        // initializePage()
    }, [])

    const isIOS = () => {
        return Platform.OS === 'ios'
    }

    const fetchAbsenceExcuse = async() => {
        const { student_id } = location.state
        const date = formatDate(new Date())
        const query = `https://iejnoswtqj.execute-api.us-east-1.amazonaws.com/${ENV}/absence-excuse/student/${student_id}?date=${date}`
        await fetch(query, {
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
                    alert('Sorry 電腦出狀況了！請截圖和與工程師聯繫' + message)
                    return
                }
                denormalize(data)
                setState({ ...state, requests: data })
            })
            .catch(err => {
                alert('Sorry 電腦出狀況了！請截圖和與工程師聯繫: error occurred when fetching absence request')
            })
    }

    const denormalize = (data) => {
        for (var i = 0; i < data.length; i++) {
            data[i].date = new Date(data[i].date)
        }
    }

    const initializePage = () => {
        Animated.sequence([
            Animated.timing(
                state.SlideInRight, 
                {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true
                }
            ),
            Animated.timing(
                state.SlideInLeft,
                {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true
                }
            )
        ]).start()
        
    }

    const selectRequest = (index) => {
        const access_mode = absenceExcuse.current.fetchAccessMode()
        if (access_mode === 'edit') {
            alert('還在編輯中喔請完成再離開 多謝')
            return
        }
        setState({ ...state, selected_request_index: index })
    }

    const onCreateRequestSuccess = async(request_id) => {
        await fetchAbsenceExcuse()
        const { requests } = state
        let new_request_index = -1
        for (var i = 0; i < requests.length; i++) {
            if (requests[i].id === request_id) {
                new_request_index = i
                break
            }
        }
        setState({
            ...state,
            selected_request_index: new_request_index
        })
    }

    const onDeleteRequestSuccess = (deleted_request_id) => {
        const { requests } = state
        const updated_requests = []
        for (var i = 0; i < requests.length; i++) {
            if (requests[i].id !== deleted_request_id) {
                updated_requests.push(requests[i])
            }
        }
        setState({
            ...state,
            requests: updated_requests,
            selected_request_index: 0
        })
    }

    const checkUniqueStudentDate = (id, date) => {
        const { requests } = state
        var duplicateDateFound = false
        for (var i = 0; i < requests.length; i++) {
            if (id !== requests[i].id && formatDate(date) === formatDate(requests[i].date)) {
                duplicateDateFound = true
                break
            }
        }

        if (!duplicateDateFound) {
            return
        }

        alert('已經在這個日期請過假了')

        absenceExcuse.current.duplicateDateFound()
    }

        const { SlideInRight, SlideInLeft, total_width, requests, todays_date, day_of_week, selected_request_index } = state
        const { student_id, class_id, school_id } = location.state
        const selected_request = requests[selected_request_index]
        console.log('requests: ', requests)
        console.log('selected_request: ', selected_request)
        console.log('selected_request_index: ', selected_request_index)

        return (
            <KeyboardAvoidingView
                style={{flex: 1, width: '100%', alignItems: 'center' }}
                behavior={'padding'}
                keyboardVerticalOffset={85}
                enabled
            >
                <ScrollView style={{ width: '100%'}}>
                <View style={{ width: '100%' }}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                    >
                        {requests.map((request, index) => {
                            const day = day_of_week[request.date.getDay()]
                            const date = `${request.date.getMonth()+1}/${request.date.getDate()}`
                            return (
                                <Animated.View
                                    key={request.id}
                                    style={{
                                        padding: 10,
                                        transform: [
                                            {
                                                translateX: SlideInRight.interpolate({
                                                    inputRange: [0,1],
                                                    outputRange: [total_width, 0]
                                                })
                                            }
                                        ]
                                    }}
                                >
                                    <TouchableOpacity
                                        style={{
                                            height: 100,
                                            width: 100,
                                            padding: 10,
                                            backgroundColor: selected_request_index === index ? '#368cbf' : 'rgba(0,0,0,0.2)',
                                            borderRadius: 10
                                        }}
                                        underlayColor='#368cbf'
                                        onPress={() => selectRequest(index)}
                                    >
                                        <View>
                                            {formatDate(request.date) === todays_date ?
                                                <Text style={{ fontSize: 20, color: selected_request_index === index ? 'white' : 'black' }}>今天</Text>
                                                : <Text style={{ fontSize: 20, color: selected_request_index === index ? 'white' : 'black' }}>星期{day}</Text>
                                            }
                                            <Text style={{ fontSize: 20, color: selected_request_index === index ? 'white' : 'black' }}>{date}</Text>
                                        </View>
                                    </TouchableOpacity>
                                </Animated.View>
                            )
                        })}
                        
                        <Animated.View
                            style={{
                                padding: 10,
                                transform: [
                                    {
                                        translateX: SlideInRight.interpolate({
                                            inputRange: [0,1],
                                            outputRange: [total_width, 0]
                                        })
                                    }
                                ]
                            }}
                        >
                            <TouchableOpacity
                                style={{
                                    height: 100,
                                    width: 100,
                                    padding: 10,
                                    backgroundColor: selected_request_index === -1 ? '#368cbf' : 'rgba(0,0,0,0.2)',
                                    borderRadius: 10
                                }}
                                underlayColor='#ff8944'
                                // ref={'welrnf'}
                                onPress={() => selectRequest(-1)}
                            >
                                <View>
                                    <Text style={{ fontSize: 20, color: selected_request_index === -1 ? 'white' : 'black' }}>新增</Text>
                                </View>
                            </TouchableOpacity>
                        </Animated.View>
                    </ScrollView>
                </View>

                <View
                    style={{
                        width: '100%',
                        borderRadius: 40,
                        backgroundColor: '#b5e9e9'
                    }}  
                >
                    <AbsenceExcuse
                        ref={absenceExcuse}
                        student_id={student_id}
                        class_id={class_id}
                        school_id={school_id}
                        request={selected_request}
                        onCreateRequestSuccess={(request_id) => onCreateRequestSuccess(request_id)}
                        onDeleteRequestSuccess={(deleted_request_id) => onDeleteRequestSuccess(deleted_request_id)}
                        checkUniqueStudentDate={(id, date) => checkUniqueStudentDate(id, date)}
                    />
                </View>
                </ScrollView>
            </KeyboardAvoidingView>
        )
}

const mapStateToProps = (state) => {
    return {
        isConnected: state.parent.isConnected
    }
}

export default connect(mapStateToProps, null) (AbsenceExcusePage)
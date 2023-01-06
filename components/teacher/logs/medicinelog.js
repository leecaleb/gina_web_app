import React, { useEffect, useState } from 'react'
import { View, Text, RefreshControl, StyleSheet, Image, TouchableHighlight, ScrollView, Alert } from 'react-native'
import { Card, Toast } from 'native-base'
import { connect } from 'react-redux'
import MedRequestModal from './medrequestmodal'
import { bindActionCreators } from 'redux';
import { initializeRequests, fillMedRequest } from '../../../redux/school/actions/index' 
import Reloading from '../../reloading'
import { formatHourMinute } from '../../util'
import { formatDate, formatTime, beautifyTime } from '../../util'
import LoginNumberPad from '../loginnumberpad'
import { useParams } from 'react-router-dom'

const TeacherMedicineLog = (props) => {
    const { request_id } = useParams()
    const [state, setState] = useState({
        isLoading: true,
        refreshing: false,
        selected_request_id: '',
        showLoginNumberPad: false,
        medicated_timestamp: null
    })

    useEffect(() => {
        // if not loaded, we fetch else do nothing(teacher can fetch new requests by refreshing page)
        console.log('request_id: ', request_id)
        if (request_id === null || request_id === undefined) {
            setState({
                ...state,
                isLoading: false
            })
            return
        }
        handleShowRequest(request_id)
    }, [])

    const handleShowRequest = (request_id) => {
        setState({
            ...state,
            selected_request_id: request_id,
            isLoading: false
        })
    }

    const handleEnterPasscode = (passcode) => {
        const { passcodeAdminId } = props
        const teacher_id = props.class.passcodeTeacherId[passcode] || passcodeAdminId[passcode]
        if (teacher_id === undefined) {
            Alert.alert(
                'Wrong password',
                'Please try again',
                [{text: 'OK'}]
            )
        } else {
            setState({ ...state, showLoginNumberPad: false })
            handleFulfillRequest(teacher_id)
        }
    }
    
    const hideLoginPad = () => {
        setState({
            ...state,
            showLoginNumberPad: false
        })
    }

    const handleFulfillRequest = (teacher_id) => {
        const { selected_request_id, medicated_timestamp } = state
        // console.log(props.requests)
        const { student_id } = props.requests.requests[selected_request_id]
        const { isConnected } = props.class
        if (!isConnected) {
            Toast.show({
                text: '拍謝 網路連不到! 等一下再試試看',
                buttonText: 'Okay',
                position: "top",
                type: "warning",
                duration: 2000
            })
            return
        }
        fetch('https://iejnoswtqj.execute-api.us-east-1.amazonaws.com/dev/medicationrequest', {
            method: 'PUT',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                request_id: selected_request_id,
                teacher_id,
                student_id,
                medicated_timestamp: formatDate(medicated_timestamp) + ' ' + formatTime(medicated_timestamp)
            })
        })
            .then(res => res.json())
            .then(resJson => {
                const { statusCode, message, data } = resJson
                if (statusCode > 200 || message === 'Internal server error') {
                    Alert.alert(
                        'Error, please try again',
                        message,
                        [{text: 'OK'}]
                    )
                    return
                }
                props.fillMedRequest(selected_request_id)
                props.navigation.goBack()
            })
            .catch(err => {
                Alert.alert(
                    'Error, please try again',
                    err.message,
                    [{text: 'OK'}]
                )
            })
    }

    const needRefrigeration = (medication) => {
        // console.log('medication: ', medication)
        const { powder_refrigerated, syrup } = medication
        let need_refrigeration = false
        syrup.forEach(entry => {
            need_refrigeration |= entry.need_refrigerated
        })
        return powder_refrigerated || need_refrigeration
    }

    const { selected_request_id, isLoading, showLoginNumberPad } = state
    if (isLoading) {
        return (
            <Reloading />
        )
    }
    const { requests } = props.requests
    const { students } = props.class
    const current_request = requests[selected_request_id]
    console.log('requests: ', requests)
    console.log('selected_request_id: ', selected_request_id)
    console.log('current_request: ', current_request)
    // const { administered, fever_entry, medication, note, student_id, teacher_id, timestamp } = current_request
    return (
        <View style={{ flex: 1 }}>
            {showLoginNumberPad ? 
                <LoginNumberPad
                    handleEnterPasscode={(passcode) => handleEnterPasscode(passcode)}
                    hideLoginPad={() => hideLoginPad()}
                /> : null
            }
            <ScrollView
                contentContainerStyle={{ flex: 1, padding: 10 }}
                refreshControl={
                    <RefreshControl
                        style={{backgroundColor: '#E0FFFF'}}
                        refreshing={state.refreshing}
                        onRefresh={() => {}}
                        tintColor="#ff0000"
                        title="Loading..."
                        titleColor="#00ff00"
                        colors={['#ff0000', '#00ff00', '#0000ff']}
                        progressBackgroundColor="#ffff00"
                    />
                }
            >
                <View style={{ flex: 3 }}>
                    {selected_request_id === '' ?
                        null
                    :   
                        <MedRequestModal
                            thumbnail={students[current_request.student_id].profile_picture}
                            student_name={students[current_request.student_id].name}
                            teacher_name={current_request.teacher_id === null ? '' : teachers[current_request.teacher_id].name}
                            request={current_request}
                            showLoginNumberPad={(medicated_timestamp) => setState({ ...state, showLoginNumberPad: true, medicated_timestamp })}
                        />
                    }
                </View>
                <View style={{ flex: 1 }}>
                    <ScrollView horizontal={true}>
                        {Object.keys(requests).map((request_id) => {
                            // console.log('requests[request_id]: ', requests[request_id])
                            const { student_id } = requests[request_id]
                            const { timestamp, administered } = requests[request_id]
                            const time = beautifyTime(new Date(timestamp))
                            const need_refrigeration = needRefrigeration(requests[request_id].medication)
                            // console.log('need_refrigeration: ', need_refrigeration)
                            return (
                                <TouchableHighlight
                                    key={request_id}
                                    style={styles.cardContainer}
                                    underlayColor='transparent'
                                    onPress={() => handleShowRequest(request_id)}
                                >
                                    <Box 
                                        style={{ 
                                            flex: 1,
                                            backgroundColor: administered ? '#dcf3d0' : '#ffe1d0'
                                        }}
                                    >
                                        <View
                                            style={{ flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 5 }}
                                        >
                                            <View style={{width: 24, height: 24 }}>
                                                {need_refrigeration ? 
                                                    <Image
                                                        style={{ width: 24, height: 24 }}
                                                        source={require('../../../assets/icon-snowflake.png')}
                                                    />
                                                : null}
                                            </View>
                                            <Text style={{ fontSize: 25, textAlign: 'center' }}>{'   ' + time}</Text>
                                        </View>
                                        <View style={{ flex: 2, justifyContent: 'center', alignItems: 'center' }}>
                                            <Image
                                                source={
                                                    props.class.students[student_id].profile_picture === '' ?
                                                        require('../../../assets/icon-thumbnail.png')
                                                    : { uri: students[student_id].profile_picture }}
                                                style={styles.thumbnailImage}
                                            />
                                        </View>
                                        <View
                                            style={{ flex: 1, justifyContent: 'center' }}
                                        >
                                            <Text style={{ fontSize: 25, textAlign: 'center' }}>{students[student_id].name}</Text>
                                        </View>
                                    </Box>
                                </TouchableHighlight>
                            )
                        })}
                    </ScrollView>
                </View>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    cardContainer: {
        width: 170,
        // backgroundColor: 'transparent',
        paddingRight: 5
    },
    thumbnailImage: {
        height: 110,
        width: 110,
        borderRadius: 55
    }
})

const mapStateToProps = (state) => {
    return {
        class: state.classInfo,
        requests: state.medicationrequests,
        teachers: state.school.teachers,
        passcodeAdminId: state.school.passcodeAdminId
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators({ initializeRequests, fillMedRequest }, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps) (TeacherMedicineLog)
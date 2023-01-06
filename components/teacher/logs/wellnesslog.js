import React, { useEffect, useState } from 'react'
import { StyleSheet, Image, TouchableHighlight, KeyboardAvoidingView, ScrollView, Alert } from 'react-native'
import { Text, View, Button, Card, CardItem, Toast } from 'native-base'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {
    fetchClassWellnessData,
    markPresent,
    sendWellnessDataSuccess,
    sendWellnessDataFail,
    addWellnessRecord,
    invalidateWellnessData
} from '../../../redux/school/actions/index'
import { formatDate, fetchClassData, sendWellnessData, beautifyDate } from '../../util';
import WellnessForm from '../wellnessform'
import TimeModal from '../../parent/timemodal'
import Reloading from '../../reloading'
import { useLocation, useNavigate } from 'react-router-dom'

const WellnessLog = (props) => {
    const navigate = useNavigate()
    const location = useLocation()
    const [ state, setState ] = useState({
        isLoading: true,
        date: new Date(),
        show_record: false,
        showDateTimeModal: false
    })

    useEffect(() => {
        const { record_id_for_update } = props.wellness
        const { isConnected } = props.class
        const { date, teacher_name } = location?.state
        if (record_id_for_update.size === 0 && isConnected) {
            setState({
                ...state,
                date
            })
            fetchClassData(date)
        }
        else {
            setState({
                ...state,
                isLoading: false
            })
        }

        if (!isConnected) {
            Toast.show({
                text: '網路連線連不到! 等一下再試試看',
                buttonText: 'Okay',
                position: "top",
                type: "danger",
                duration: 4000
            })
        }

        // props.navigation.setOptions({ 
        //     title: `健康 - ${teacher_name}`
        // })
    }, [])

    const fetchClassData = async(propsDate) => {
        // props.navigation.setOptions({ 
        //     headerRight: () => (
        //         <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: '#f4d41f', marginRight: 20 }} />
        //     )
        // })
        const date = new Date(propsDate)
        const start_date = formatDate(date)
        date.setDate(date.getDate() + 1)
        const end_date = formatDate(date)
        const wellnessData = await fetchClassData('wellness', props.class.class_id, start_date, end_date)
        // console.log(wellnessData)
        denormalize(wellnessData)
        props.fetchClassWellnessData(wellnessData.data)
        setState({
            ...state,
            isLoading: false
        })
        // props.navigation.setOptions({ 
        //     headerRight: () => (
        //         <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: '#00c07f', marginRight: 20 }} />
        //     )
        // })
    }

    const denormalize = (wellnessData) => {
        if (!Object.keys(wellnessData.data.records).length){
            return
        }
        const { records } = wellnessData.data
        for (var record_id in records) {
            wellnessData.data.records[record_id].time = new Date(records[record_id].time)
        }
    }

    const hasUnsentRecord = (record_id_list) => {
        const { record_id_for_update } = props.wellness
        // console.log('props.wellness: ', props.wellness)
        var has_unsent_record = false
        for (var i = 0; i < record_id_list.length; i++) {
            if (record_id_for_update.has(record_id_list[i])) {
                has_unsent_record = true
                break
            }
        }
        return has_unsent_record
    }

    const handleSend = async() => {
        // if (!wellnessDataValidated()) {
        //     return
        // }
        const { wellness } = props
        const { isConnected } = props.class
        if (!isConnected) {
            Toast.show({
                text: '網路連線連不到! 等一下再試試看',
                buttonText: 'Okay',
                position: "top",
                type: "danger",
                duration: 4000
            })
            return
        }
        setState({ ...state, isLoading: true })
        const sendDataResult = await sendWellnessData(wellness, props.class.class_id, formatDate(new Date))
        if (sendDataResult.success) {
            sendDataResult.data.forEach(student_id => {
                props.markPresent(student_id, new Date)
            })
            props.sendWellnessDataSuccess()
            navigate(-1)
        } else {
            props.sendWellnessDataFail(sendDataResult.message)
            Alert.alert(
                'Err',
                sendDataResult.message,
                [{text: 'OK'}]
            )
        }
        setState({ ...state, isLoading: false })
    }

    const selectDatetimeConfirm = (date) => {
        setState({
            ...state,
            date,
            showDateTimeModal: false
        })
        fetchClassData(date)
    }

    const { by_student_id, records } = props.wellness
    const { teacher_id, isAdmin } = location?.state
    const { showDateTimeModal, date, isLoading } = state
    
    return (
        <KeyboardAvoidingView
            style={{
                flex: 1
            }}
            behavior='height'
            keyboardVerticalOffset={80}
            enabled
        >
            {showDateTimeModal && <TimeModal
                start_date={date}
                datetime_type={'date'}
                hideModal={() => setState({ showDateTimeModal: false })}
                selectDatetimeConfirm={(datetime) => selectDatetimeConfirm(datetime)}
                minDatetime={null}
                maxDatetime={new Date()}
            />}
            <View style={{ flexDirection: 'row', width: '90%', justifyContent: 'space-between', alignSelf: 'center', alignItems: 'center'}}>
                <TouchableHighlight
                    onPress={() => {
                        const { data_dispatched } = props.wellness
                        if (!data_dispatched || !isAdmin) return
                        setState({ showDateTimeModal: true })
                    }}
                >
                    <Text style={{ fontSize: 40 }}>{beautifyDate(date)}</Text>
                </TouchableHighlight>

                <TouchableHighlight
                    disabled={isLoading}
                    style={{ 
                        backgroundColor: isLoading ? 'rgba(0,0,0,0.5)' : '#dcf3d0', 
                        padding: 10  
                    }}
                    onPress={handleSend}>
                    <Text style={{ fontSize: 40}}>送出</Text>
                </TouchableHighlight>
            </View>
            <ScrollView contentContainerStyle={{ alignItems: 'center', marginBottom: 20 }}>
                {Object.keys(props.class.students).map((student_id) => {
                    const record_id_list = by_student_id[student_id]
                    return(
                        <View key={student_id} style={{ width: '98%' }}>
                            <View style={{ margin: 10, backgroundColor: '#fefefa' }}>
                                <View style={{ flex: 1, flexDirection: 'row' }}>
                                    <TouchableHighlight
                                        style={styles.childThumbnail}
                                        // onPress={() => addRecord(student_id)}
                                    >
                                        <Image
                                            source={
                                                props.class.students[student_id].profile_picture === '' ?
                                                    require('../../../assets/icon-thumbnail.png')
                                                    : {uri: props.class.students[student_id].profile_picture}
                                            }
                                            style={styles.thumbnailImage}
                                        />
                                    </TouchableHighlight>
                                    <View style={{ flex: 3 }}>
                                        <View style={{ flex: 1, flexDirection: 'row', paddingVertical: 10 }}>
                                            <View style={{ flex: 1 }}>
                                                <Text style={{ fontSize: 25}}>{props.class.students[student_id].name}</Text>
                                            </View>
                                            <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                                {hasUnsentRecord(record_id_list) ? 
                                                    <Text style={{ color: 'red', fontSize: 15 }}>未送出</Text>
                                                : null}
                                            </View>
                                        </View>
                                        {record_id_list.map((record_id, index) => {
                                            return (
                                                <View style={{flex:1}} key={record_id}>
                                                    { index === 0 ?
                                                        <Text>早上</Text>
                                                        : index === 1 ?
                                                        <Text>中午</Text> 
                                                        : <Text>下午</Text>
                                                    }
                                                    <WellnessForm
                                                        student_id={student_id}
                                                        record_id={record_id}
                                                        teacher_id={teacher_id}
                                                    />
                                                </View>
                                            )
                                        })}
                                    </View>
                                </View>
                            </View>
                        </View>
                    )
                })}
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    childThumbnail: {
        flex: 1,
        backgroundColor: 'white',
        marginLeft: -7,
    },
    thumbnailImage: {
        width: 140,
        height: 140,
        borderRadius: 70
    },
    subHeading: {
        width: 355,
        height: 45,
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    }
})

const mapStateToProps = (state) => {
    return {
        class: state.classInfo,
        wellness: state.healthstatus,
        unmarked: state.attendance.unmarked
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators({
            fetchClassWellnessData,
            markPresent,
            sendWellnessDataSuccess,
            sendWellnessDataFail,
            addWellnessRecord,
            invalidateWellnessData
        }, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps) (WellnessLog)
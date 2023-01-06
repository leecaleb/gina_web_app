import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { StyleSheet, Image, TouchableHighlight, Alert } from 'react-native'
import { Container, Content, Text, View, Card, Toast} from 'native-base'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {
    setSleepTime,
    setWakeTime,
    fetchClassSleepData,
    clearPendingSleepUpdate,
    createSleepRecordSuccess,
    createSleepRecordFail,
    editSleepRecordSuccess,
    editSleepRecordFail,
    removeSleepRecord,
    removeSleepRecordSuccess,
    removeSleepRecordFail,
    alertSleeplogErrorMessage,
    clearSleeplogErrorMessage,
    removeWakeTime,
    markRecordError,
    markRecordCorrect
} from '../../../redux/school/actions/index'
import { formatDate, formatTime, fetchClassData } from '../../util'
import Reloading from '../../reloading'
import TimeModal from '../../parent/timemodal'


const TeacherSleepLog = (props) => {
    const location = useLocation()
    const [ state, setState ] = useState({
        isLoading: true,
        date: new Date(),
        showIOSDatePicker: false,
        student_id: '',
        index: -1,
        recordType: '',
        teacher_id: '',
        confirmDelete: false,
        showDateTimeModal: false
    })

    useEffect(() => {
        const { newDataForCreate, oldDataForEdit } = props.sleep
        const { isConnected } = props.class
        const { teacher_id, date, teacher_name } = location?.state
        setState({ ...state, teacher_id })
        if ((newDataForCreate.size + oldDataForEdit.size === 0) && isConnected) {
            fetchClassSleepData(date)
        }
        else {
            setState({
                ...state,
                isLoading: false
            })
        }

        if (!isConnected) {
            Toast.show({
                text: '拍謝 網路連不到! 等一下再試試看',
                buttonText: 'Okay',
                position: "top",
                type: "warning",
                duration: 2000
            })
        }

        // props.navigation.setOptions({ 
        //     title: `睡眠 - ${teacher_name}`
        // })
    }, [])

    const fetchClassSleepData = async(propsDate) => {
        // props.navigation.setOptions({ 
        //     headerRight: () => (
        //         <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: '#f4d41f', marginRight: 20 }} />
        //     )
        // })
        const date = new Date(propsDate)
        const start_date = formatDate(date)
        date.setDate(date.getDate() + 1)
        const end_date = formatDate(date)
        const sleepData = await fetchClassData('sleep', props.class.class_id, start_date, end_date)
        denormalize(sleepData)
        props.fetchClassSleepData(sleepData.data)
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

    const denormalize = (sleepData) => {
        if (!sleepData.data.records.all_id.length) {
            return
        }
        const { by_id } = sleepData.data.records
        for (var record_id in by_id) {
            by_id[record_id].sleep_time = new Date(by_id[record_id].sleep_time)
            by_id[record_id].wake_time = by_id[record_id].wake_time === null ? null : new Date(by_id[record_id].wake_time)
        }
        sleepData.data.records.by_id = by_id
    }

    const hasUnsentRecord = (student_id) => {
        const { newDataForCreate, oldDataForEdit, by_student_id } = props.sleep
        let record_id_array = by_student_id[student_id]
        var hasUnsentRecord = false
        for (var i = 0; i < record_id_array.length; i++) {
            if (newDataForCreate.has(record_id_array[i]) || oldDataForEdit.has(record_id_array[i])) {
                hasUnsentRecord = true
                break
            }
        }
        return hasUnsentRecord
    }

    const handleOnClick = (student_id) => {
        const record_id_array = props.sleep.by_student_id[student_id]
        const records = props.sleep.records.by_id
        const last_record = record_id_array.length > 0 ? records[record_id_array[record_id_array.length - 1]] : null
        const current_wake_time = last_record ? last_record.wake_time : null

        if (!record_id_array.length || current_wake_time) {
            props.setSleepTime(student_id, null, new Date(), state.teacher_id)
        } else {
            props.setWakeTime(student_id, record_id_array.length - 1, new Date(), state.teacher_id)
        }
        checkLastRecord(student_id, records, record_id_array)
    }

    const checkLastRecord = (student_id, records, record_id_array) => {
        const n = record_id_array.length
        const last_record_id = record_id_array[record_id_array.length - 1]
        const last_record = records[last_record_id]
        if (last_record.wake_time !== null && last_record.sleep_time.getTime() >= last_record.wake_time.getTime()) {
            props.markRecordError([last_record_id])
        } 
        
        if (n > 1) {
            const last_second_record_id = record_id_array[record_id_array.length - 2]
            const last_second_record = records[last_second_record_id]
            if (last_record.sleep_time >= last_second_record.sleep_time && last_record.sleep_time <= last_second_record.wake_time) {
                props.markRecordError([last_record_id])
            }
        }
    }

    const setTime = (recordType, student_id, index, start_time) => {
        setState({
            ...state,
            student_id,
            index,
            recordType,
            showDateTimeModal: true,
            start_time: start_time ? start_time : new Date()
        })
    }

    const updateReducerTime = (index, time) => {
        setState({ ...state, showDateTimeModal: false })
        if (state.recordType === 'sleep') {
            props.setSleepTime(state.student_id, index, time, state.teacher_id)
        } else {
            props.setWakeTime(state.student_id, index, time, state.teacher_id)
        }
        checkRecord(state.student_id, index)
    }

    const checkRecord = (student_id, index) => {
        const record_id_array = props.sleep.by_student_id[student_id]
        const records = props.sleep.records.by_id
        const record_id = record_id_array[index]
        const record = records[record_id]
        const { records_with_error } = props.sleep
        let prev_record_id = null
        let next_record_id = null

        if (index < 0 || index > record_id_array.length - 1) {
            return
        }

        if (record.wake_time !== null) {
            if(record.sleep_time.getTime() >= record.wake_time.getTime()) {
                props.markRecordError([record_id])
                return
            }
        }

        if (index > 0) {
            prev_record_id = record_id_array[index-1]
            const prev_record = records[prev_record_id]
            if (//record.sleep_time.getTime() >= prev_record.sleep_time.getTime() && 
                prev_record.wake_time !== null &&
                record.sleep_time.getTime() <= prev_record.wake_time.getTime()) {
                props.markRecordError([record_id])
                return
            }
        }

        if (index < record_id_array.length - 1) {
            next_record_id = record_id_array[index+1]
            const next_record = records[next_record_id]
            if (record.wake_time >= next_record.sleep_time) {
                props.markRecordError([record_id])
                return
            }
        }

        props.markRecordCorrect(record_id)

        if (prev_record_id !== null && records_with_error.has(prev_record_id)) {
            checkRecord(student_id, index-1)
            // console.log('records_with_error.has(prev_record_id: ', records_with_error.has(prev_record_id))
        }

        if (next_record_id !== null && records_with_error.has(next_record_id)) {
            // console.log('records_with_error.has(next_record_id: ', records_with_error.has(next_record_id))
            checkRecord(student_id, index+1)
        }
    }

    const confirmToRemoveWakeTime = (record_id, index, student_id) => {
        const record_id_array = props.sleep.by_student_id[student_id]
        if (index !== record_id_array.length - 1) {
            // cannot remove wake time if it is not the most recent record
            props.alertSleeplogErrorMessage('這個睡眠記錄並不能刪除，只能改選')
            return
        }
        Alert.alert(
            '確定要刪除?',
            '',
            [
                { text: 'Yes', onPress: () => props.removeWakeTime(record_id, state.teacher_id) },
                { text: 'Cancel', style: 'cancel'}]
        )
    }

    const handleSend = async() => {
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
        setState({
            ...state,
            isLoading: true
        })
        const { newDataForCreate, oldDataForEdit } = props.sleep
        
        if (newDataForCreate.size) {
            const createSleepRecordRes = await createRecord()
            if (createSleepRecordRes.success) {
                // console.log('SUCCESS')
                props.createSleepRecordSuccess()
            } else {
                props.createSleepRecordFail()
                return
            }
        }

        if (oldDataForEdit.size) {
            const editSleepRecordRes = await editRecord()
            if (editSleepRecordRes.success) {
                props.editSleepRecordSuccess()
            } else {
                props.editSleepRecordFail()
                return
            }
        }

        props.navigation.goBack()
    }

    const createRecord = async() => {
        const { newDataForCreate, records } = props.sleep
        
        const data_objs = []
        newDataForCreate.forEach(record_id => {
            data_objs.push({
                ...records.by_id[record_id]
            })
        })

        normalize(data_objs)

        var request_body = {
            date: formatDate(state.date),
            data_objs
        }

        const createSleepRecordRes = await fetch('https://iejnoswtqj.execute-api.us-east-1.amazonaws.com/dev/sleep', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(request_body)
        })
            .then(res => res.json())
            .then(resJson => {
                // console.log('sleep resJson: ', resJson)
                if (resJson['statusCode'] > 200) {
                    return {
                        success: false,
                        status_code: resJson['statusCode'],
                        data: resJson.message
                    }
                }
                return {
                    success: true,
                    status_code: 200,
                    data: resJson
                }
            })
            .catch(err => {
                return {
                    success: false,
                    status_code: 500,
                    data: err
                }
            })
        return createSleepRecordRes
    }

    const editRecord = async() => {
        const { oldDataForEdit, records } = props.sleep
        const data_objs = []
        oldDataForEdit.forEach(record_id => {
            data_objs.push({
                record_id,
                ...records.by_id[record_id]
            })
        })

        normalize(data_objs)

        const request_body = {
            date: formatDate(new Date()),
            data_objs
        }

        const editRecordRes = await fetch('https://iejnoswtqj.execute-api.us-east-1.amazonaws.com/dev/sleep', {
            method: 'PUT',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(request_body)
        }).then(res => res.json())
        .then(resJson => {
            if (resJson['statusCode'] > 200) {
                return {
                    success: false,
                    status_code: resJson['statusCode'],
                    data: resJson.message
                }
            }
            return {
                success: true,
                status_code: 200,
                data: resJson
            }
        })
        .catch(err => {
            return {
                success: false,
                status_code: 500,
                data: err
            }
        })
        return editRecordRes
    }

    const confirmToRemoveRecord = (record_id, student_id) => {
        Alert.alert(
            '確定要刪除？',
            '',
            [
                { text: 'Yes', onPress: () => removeRecord(record_id, student_id) },
                { text: 'Cancel', style: 'cancel' }
            ]
        )
    }

    const removeRecord = (record_id, student_id) => {
        const { newDataForCreate } = props.sleep
        const { isConnected } = props.class

        if (newDataForCreate.has(record_id)) {
            props.removeSleepRecordSuccess(record_id, student_id)
            return
        }

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

        const query = `https://iejnoswtqj.execute-api.us-east-1.amazonaws.com/dev/sleep`
        fetch(query, {
            method: 'DELETE',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                record_id
            })
        })
            .then(res => res.json())
            .then(resJson => {
                const { statusCode, message } = resJson
                if (statusCode > 200 || message === 'Internal Server Error') {
                    props.removeSleepRecordFail(message)
                    return {
                        success: false,
                        statusCode,
                        message
                    }
                }
                props.removeSleepRecordSuccess(record_id, student_id)
                return {
                    success: true,
                    statusCode,
                    message
                }
            })
            .catch(err => {
                props.removeSleepRecordFail(err)
                return {
                    success: false,
                    message: err
            }
        })
    }

    const normalize = (data_objs) => {
        for (var i = 0; i < data_objs.length; i++) {
            data_objs[i].sleep_time = formatTime(data_objs[i].sleep_time)
            data_objs[i].wake_time = data_objs[i].wake_time === null ? null : formatTime(data_objs[i].wake_time)
        }
    }


    if (props.sleep.errorMessage !== ''){
        Alert.alert(
            'Add new record fail',
            props.sleep.errorMessage,
            [{text: 'OK', onPress: () => props.clearSleeplogErrorMessage()}]
        )
    }
    const { records_with_error } = props.sleep
    const { showDateTimeModal, start_time, date } = state
    // console.log('records_with_error: ', records_with_error)
    // console.log('showDateTimeModal: ', showDateTimeModal)
    if (state.isLoading) {
        return <Reloading />
    }

    return (
        <Container>
            {showDateTimeModal ?
                <TimeModal
                    start_date={start_time}
                    datetime_type={'time'}
                    hideModal={() => setState({ ...state, showDateTimeModal: false })}
                    selectDatetimeConfirm={(time) => updateReducerTime(state.index, time)}
                    minDatetime={null}
                    maxDatetime={null}
                />
                : null
            }
            <View style={styles.subHeading}>
                <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={{ fontSize: 40 }}>{date.getFullYear() + '.' + (date.getMonth()+1) + '.' + date.getDate()}</Text>
                </View>
                
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <TouchableHighlight
                        style={{ alignSelf: 'flex-end', backgroundColor: '#dcf3d0', padding: 10, marginRight: 50 }}
                        onPress={handleSend}
                        underlayColor="#00c07f"
                    >
                        <Text style={{ fontSize: 40, color: 'grey' }}>送出</Text>
                    </TouchableHighlight>
                </View>
            </View>
            <Content contentContainerStyle={{ alignItems: 'center' }}>
                {Object.keys(props.class.students).map((student_id) => {
                    const record_id_array = props.sleep.by_student_id[student_id] // [record_id, ...]
                    const records = props.sleep.records.by_id
                    const last_record = record_id_array.length > 0 ? records[record_id_array[record_id_array.length - 1]] : null
                    const current_sleep_time = last_record ? last_record.sleep_time : null
                    const current_wake_time = last_record ? last_record.wake_time : null
                    return(
                        <View key={student_id} style={{ width: '98%' }}>
                            <Card style={{ flex: 1, paddingVertical: 15 }}>
                                <View style={{ flex: 1, flexDirection: 'row' }}>
                                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                        <TouchableHighlight
                                            key={student_id}
                                            style={styles.thumbnail}
                                            onPress={() => handleOnClick(student_id)}>
                                            <Image
                                                source={
                                                    props.class.students[student_id].profile_picture === '' ?
                                                        require('../../../assets/icon-thumbnail.png')
                                                        : {uri: props.class.students[student_id].profile_picture}
                                                }
                                                style={{
                                                    width: 140,
                                                    height: 140,
                                                    borderRadius: 70,
                                                    borderWidth: 8,
                                                    borderColor: current_sleep_time !== null ? (current_wake_time === null ? '#ffe1d0' : '#dcf3d0') : '#dcf3d0'
                                                }} />
                                        </TouchableHighlight>
                                    </View>
                                    <View style={{ flex: 3 }}>
                                        <View style={{ flex: 1, flexDirection: 'row', padding: 10 }}>
                                            <View style={{ flex: 1 }}>
                                                <Text style={{ fontSize: 30 }}>{props.class.students[student_id].name}</Text>
                                            </View>
                                            <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                                {hasUnsentRecord(student_id) ? 
                                                    <Text style={{ color: 'red', fontSize: 15 }}>未送出</Text>
                                                : null}
                                            </View>
                                        </View>
                                        <View style={styles.cardBody}>
                                            <View style={{ width: '40%', height: '100%', paddingLeft: 5 }}>
                                                <Text style={{ fontSize: 20 }}>從</Text>
                                            </View>
                                            <View style={{ width: '40%', height: '100%', paddingLeft: 5 }}>
                                                <Text style={{ fontSize: 20 }}>到</Text>
                                            </View>
                                        </View>
                                        {record_id_array.map((record_id, index) => {
                                            let { sleep_time, wake_time } = records[record_id]
                                            return (
                                                <View key={record_id} style={{
                                                    flex: 1,
                                                    flexDirection: 'row',
                                                    marginVertical: 6,
                                                    borderWidth: 2, 
                                                    borderColor: records_with_error.has(record_id) ? 'red' : 'white'
                                                }}>
                                                    <View style={{ width: '35%', marginRight: '3%', height: '100%' }}>
                                                        <TouchableHighlight
                                                            style={{ flex: 1, justifyContent: 'center', backgroundColor: '#fef6dd', borderRadius: 10}}
                                                            onPress={() => setTime('sleep', student_id, index, sleep_time)}
                                                        >
                                                            {sleep_time === null ?
                                                                <Text style={{ fontSize: 30, textAlign: 'center' }}>選擇時間</Text> :
                                                                <Text style={{ fontSize: 35, textAlign: 'center' }}>
                                                                    {sleep_time.getHours() + ':' + sleep_time.getMinutes()}
                                                                </Text>}
                                                        </TouchableHighlight>
                                                    </View>
                                                    <View style={{ width: '35%', marginRight: '3%', height: '100%' }}>
                                                        <TouchableHighlight
                                                            style={{ flex: 1, justifyContent: 'center', backgroundColor: '#fef6dd', borderRadius: 10 }}
                                                            onPress={() => setTime('wake', student_id, index, wake_time)}
                                                            onLongPress={() => confirmToRemoveWakeTime(record_id, index, student_id)}
                                                        >
                                                            {wake_time === null ?
                                                                <Text style={{ fontSize: 30, textAlign: 'center' }}>選擇時間</Text> :
                                                                <Text style={{ fontSize: 35, textAlign: 'center' }}>
                                                                    {wake_time.getHours() + ':' + wake_time.getMinutes()}
                                                                </Text>}
                                                        </TouchableHighlight>
                                                    </View>
                                                    <View style={{ width: '20%', marginRight: '4%', height: '100%' }}>
                                                        <TouchableHighlight
                                                            style={{ flex: 1, justifyContent: 'center', backgroundColor: '#ffe1d0', borderRadius: 10 }}
                                                            onPress={() => confirmToRemoveRecord(record_id, student_id)}
                                                        >
                                                            <Text style={{ fontSize: 30, textAlign: 'center' }}>移除</Text>
                                                        </TouchableHighlight>
                                                    </View>
                                                </View>
                                            )
                                        })}
                                    </View>
                                </View>
                            </Card>
                        </View>
                    )
                })}
            </Content>
            {/* {state.showIOSDatePicker ?
                <View style={{ height: 200, justifyContent: 'center'}}>
                    <DatePickerIOS
                        mode={'time'}
                        date={new Date()}
                        onDateChange={(time) => updateReducerTime(state.index, time)}
                    />
                </View> : null} */}
        </Container>
    )
}

const styles = StyleSheet.create({
    thumbnail: {
        // width: 100,
        // height: 100,
        // borderRadius: 50,
        // backgroundColor: 'transparent',
        // marginLeft: -7,
    },
    subHeading: {
        // width: 355,
        // height: 45,
        // marginTop: 10,
        // padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
        // justifyContent: 'space-between',
    },
    cardBody: {
        flex: 1,
        flexDirection: 'row',
        marginVertical: 6
    },
})

const mapStateToProps = (state) => {
    return {
        class: state.classInfo,
        sleep: state.sleep
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators({
            setSleepTime,
            setWakeTime,
            fetchClassSleepData,
            clearPendingSleepUpdate,
            createSleepRecordSuccess,
            createSleepRecordFail,
            editSleepRecordSuccess,
            editSleepRecordFail,
            removeSleepRecord,
            removeSleepRecordSuccess,
            removeSleepRecordFail,
            alertSleeplogErrorMessage,
            clearSleeplogErrorMessage,
            removeWakeTime,
            markRecordError,
            markRecordCorrect
        }, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps) (TeacherSleepLog)
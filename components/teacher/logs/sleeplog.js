import React from 'react'
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


class TeacherSleepLog extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            isLoading: true,
            date: new Date(),
            showIOSDatePicker: false,
            student_id: '',
            index: -1,
            recordType: '',
            teacher_id: '',
            confirmDelete: false,
            showDateTimeModal: false
        }
        this.handleOnClick = this.handleOnClick.bind(this)
        this.handleSend = this.handleSend.bind(this)
        this.updateReducerTime = this.updateReducerTime.bind(this)
        this.setTime = this.setTime.bind(this)
    }

    componentDidMount() {
        const { newDataForCreate, oldDataForEdit } = this.props.sleep
        const { isConnected } = this.props.class
        const { teacher_id } = this.props.route.params
        this.setState({ teacher_id })
        if ((newDataForCreate.size + oldDataForEdit.size === 0) && isConnected) {
            this.fetchClassData()
        }
        else {
            this.setState({
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
    }

    async fetchClassData() {
        const date = new Date()
        const start_date = formatDate(date)
        date.setDate(date.getDate() + 1)
        const end_date = formatDate(date)
        const sleepData = await fetchClassData('sleep', this.props.class.class_id, start_date, end_date)
        this.denormalize(sleepData)
        this.props.fetchClassSleepData(sleepData.data)
        this.setState({
            isLoading: false
        })
    }

    denormalize(sleepData) {
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

    hasUnsentRecord(student_id) {
        const { newDataForCreate, oldDataForEdit, by_student_id } = this.props.sleep
        record_id_array = by_student_id[student_id]
        var hasUnsentRecord = false
        for (var i = 0; i < record_id_array.length; i++) {
            if (newDataForCreate.has(record_id_array[i]) || oldDataForEdit.has(record_id_array[i])) {
                hasUnsentRecord = true
                break
            }
        }
        return hasUnsentRecord
    }

    handleOnClick(student_id) {
        const record_id_array = this.props.sleep.by_student_id[student_id]
        const records = this.props.sleep.records.by_id
        const last_record = record_id_array.length > 0 ? records[record_id_array[record_id_array.length - 1]] : null
        const current_wake_time = last_record ? last_record.wake_time : null

        if (!record_id_array.length || current_wake_time) {
            this.props.setSleepTime(student_id, null, new Date(), this.state.teacher_id)
        } else {
            this.props.setWakeTime(student_id, record_id_array.length - 1, new Date(), this.state.teacher_id)
        }
        this.checkLastRecord(student_id, records, record_id_array)
    }

    checkLastRecord(student_id, records, record_id_array) {
        const n = record_id_array.length
        const last_record_id = record_id_array[record_id_array.length - 1]
        const last_record = records[last_record_id]
        if (last_record.wake_time !== null && last_record.sleep_time.getTime() >= last_record.wake_time.getTime()) {
            this.props.markRecordError([last_record_id])
        } 
        
        if (n > 1) {
            const last_second_record_id = record_id_array[record_id_array.length - 2]
            const last_second_record = records[last_second_record_id]
            if (last_record.sleep_time >= last_second_record.sleep_time && last_record.sleep_time <= last_second_record.wake_time) {
                this.props.markRecordError([last_record_id])
            }
        }
    }

    setTime(recordType, student_id, index, start_time) {
        this.setState({
            student_id,
            index,
            recordType,
            showDateTimeModal: true,
            start_time: start_time ? start_time : new Date()
        })
    }

    updateReducerTime(index, time) {
        this.setState({ showDateTimeModal: false })
        if (this.state.recordType === 'sleep') {
            this.props.setSleepTime(this.state.student_id, index, time, this.state.teacher_id)
        } else {
            this.props.setWakeTime(this.state.student_id, index, time, this.state.teacher_id)
        }
        this.checkRecord(this.state.student_id, index)
    }

    checkRecord(student_id, index) {
        const record_id_array = this.props.sleep.by_student_id[student_id]
        const records = this.props.sleep.records.by_id
        const record_id = record_id_array[index]
        const record = records[record_id]
        const { records_with_error } = this.props.sleep
        let prev_record_id = null
        let next_record_id = null

        if (index < 0 || index > record_id_array.length - 1) {
            return
        }

        if (record.wake_time !== null) {
            if(record.sleep_time.getTime() >= record.wake_time.getTime()) {
                this.props.markRecordError([record_id])
                return
            }
        }

        if (index > 0) {
            prev_record_id = record_id_array[index-1]
            const prev_record = records[prev_record_id]
            if (//record.sleep_time.getTime() >= prev_record.sleep_time.getTime() && 
                prev_record.wake_time !== null &&
                record.sleep_time.getTime() <= prev_record.wake_time.getTime()) {
                this.props.markRecordError([record_id])
                return
            }
        }

        if (index < record_id_array.length - 1) {
            next_record_id = record_id_array[index+1]
            const next_record = records[next_record_id]
            if (record.wake_time >= next_record.sleep_time) {
                this.props.markRecordError([record_id])
                return
            }
        }

        this.props.markRecordCorrect(record_id)

        if (prev_record_id !== null && records_with_error.has(prev_record_id)) {
            this.checkRecord(student_id, index-1)
            // console.log('records_with_error.has(prev_record_id: ', records_with_error.has(prev_record_id))
        }

        if (next_record_id !== null && records_with_error.has(next_record_id)) {
            // console.log('records_with_error.has(next_record_id: ', records_with_error.has(next_record_id))
            this.checkRecord(student_id, index+1)
        }
    }

    confirmToRemoveWakeTime(record_id, index, student_id) {
        const record_id_array = this.props.sleep.by_student_id[student_id]
        if (index !== record_id_array.length - 1) {
            // cannot remove wake time if it is not the most recent record
            this.props.alertSleeplogErrorMessage('這個睡眠記錄並不能刪除，只能改選')
            return
        }
        Alert.alert(
            '確定要刪除?',
            '',
            [
                { text: 'Yes', onPress: () => this.props.removeWakeTime(record_id, this.state.teacher_id) },
                { text: 'Cancel', style: 'cancel'}]
        )
    }

    async handleSend() {
        const { isConnected } = this.props.class
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
        this.setState({
            isLoading: true
        })
        const { newDataForCreate, oldDataForEdit } = this.props.sleep
        
        if (newDataForCreate.size) {
            const createSleepRecordRes = await this.createRecord()
            if (createSleepRecordRes.success) {
                // console.log('SUCCESS')
                this.props.createSleepRecordSuccess()
            } else {
                this.props.createSleepRecordFail()
                return
            }
        }

        if (oldDataForEdit.size) {
            const editSleepRecordRes = await this.editRecord()
            if (editSleepRecordRes.success) {
                this.props.editSleepRecordSuccess()
            } else {
                this.props.editSleepRecordFail()
                return
            }
        }

        this.props.navigation.goBack()
    }

    async createRecord() {
        const { newDataForCreate, records } = this.props.sleep
        
        const data_objs = []
        newDataForCreate.forEach(record_id => {
            data_objs.push({
                ...records.by_id[record_id]
            })
        })

        this.normalize(data_objs)

        var request_body = {
            date: formatDate(this.state.date),
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

    async editRecord() {
        const { oldDataForEdit, records } = this.props.sleep
        const data_objs = []
        oldDataForEdit.forEach(record_id => {
            data_objs.push({
                record_id,
                ...records.by_id[record_id]
            })
        })

        this.normalize(data_objs)

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

    confirmToRemoveRecord(record_id, student_id) {
        Alert.alert(
            '確定要刪除？',
            '',
            [
                { text: 'Yes', onPress: () => this.removeRecord(record_id, student_id) },
                { text: 'Cancel', style: 'cancel' }
            ]
        )
    }

    removeRecord(record_id, student_id) {
        const { newDataForCreate } = this.props.sleep
        const { isConnected } = this.props.class

        if (newDataForCreate.has(record_id)) {
            this.props.removeSleepRecordSuccess(record_id, student_id)
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
                    this.props.removeSleepRecordFail(message)
                    return {
                        success: false,
                        statusCode,
                        message
                    }
                }
                this.props.removeSleepRecordSuccess(record_id, student_id)
                return {
                    success: true,
                    statusCode,
                    message
                }
            })
            .catch(err => {
                this.props.removeSleepRecordFail(err)
                return {
                    success: false,
                    message: err
            }
        })
    }

    normalize(data_objs) {
        for (var i = 0; i < data_objs.length; i++) {
            data_objs[i].sleep_time = formatTime(data_objs[i].sleep_time)
            data_objs[i].wake_time = data_objs[i].wake_time === null ? null : formatTime(data_objs[i].wake_time)
        }
    }

    render() {
        if (this.props.sleep.errorMessage !== ''){
            Alert.alert(
                'Add new record fail',
                this.props.sleep.errorMessage,
                [{text: 'OK', onPress: () => this.props.clearSleeplogErrorMessage()}]
            )
        }
        const { records_with_error } = this.props.sleep
        const { showDateTimeModal, start_time, date } = this.state
        // console.log('records_with_error: ', records_with_error)
        // console.log('showDateTimeModal: ', showDateTimeModal)
        if (this.state.isLoading) {
            return <Reloading />
        }
        return (
            <Container>
                {showDateTimeModal ?
                    <TimeModal
                        start_date={start_time}
                        datetime_type={'time'}
                        hideModal={() => this.setState({ showDateTimeModal: false })}
                        selectDatetimeConfirm={(time) => this.updateReducerTime(this.state.index, time)}
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
                            onPress={this.handleSend}
                            underlayColor="#00c07f"
                        >
                            <Text style={{ fontSize: 40, color: 'grey' }}>送出</Text>
                        </TouchableHighlight>
                    </View>
                </View>
                <Content contentContainerStyle={{ alignItems: 'center' }}>
                    {Object.keys(this.props.class.students).map((student_id) => {
                        const record_id_array = this.props.sleep.by_student_id[student_id] // [record_id, ...]
                        const records = this.props.sleep.records.by_id
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
                                                onPress={() => this.handleOnClick(student_id)}>
                                                <Image
                                                    source={
                                                        this.props.class.students[student_id].profile_picture === '' ?
                                                            require('../../../assets/icon-thumbnail.png')
                                                            : {uri: this.props.class.students[student_id].profile_picture}
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
                                                    <Text style={{ fontSize: 30 }}>{this.props.class.students[student_id].name}</Text>
                                                </View>
                                                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                                    {this.hasUnsentRecord(student_id) ? 
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
                                                        ...styles.cardBody, 
                                                        borderWidth: 2, 
                                                        borderColor: records_with_error.has(record_id) ? 'red' : 'white'
                                                    }}>
                                                        <View style={{ width: '35%', marginRight: '3%', height: '100%' }}>
                                                            <TouchableHighlight
                                                                style={{ flex: 1, justifyContent: 'center', backgroundColor: '#fef6dd', borderRadius: 10}}
                                                                onPress={() => this.setTime('sleep', student_id, index, sleep_time)}
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
                                                                onPress={() => this.setTime('wake', student_id, index, wake_time)}
                                                                onLongPress={() => this.confirmToRemoveWakeTime(record_id, index, student_id)}
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
                                                                onPress={() => this.confirmToRemoveRecord(record_id, student_id)}
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
                {/* {this.state.showIOSDatePicker ?
                    <View style={{ height: 200, justifyContent: 'center'}}>
                        <DatePickerIOS
                            mode={'time'}
                            date={new Date()}
                            onDateChange={(time) => this.updateReducerTime(this.state.index, time)}
                        />
                    </View> : null} */}
            </Container>
        )
    }
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
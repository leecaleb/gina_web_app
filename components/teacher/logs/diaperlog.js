import React from 'react'
import { Card, Toast } from 'native-base'
import { View, ScrollView, Text, Image, TouchableHighlight, StyleSheet, TextInput, KeyboardAvoidingView, Alert } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { formatDate, formatTime, fetchClassData, beautifyDate } from '../../util'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
    updateDiaperAmount,
    addDiaperRecord,
    editDiaperTime,
    switchPeeOrPoo,
    editPooCondition,
    removeDiaperRecordSuccess,
    removeDiaperRecordFail,
    fetchClassDiaperData,
    createDiaperRecordSuccess,
    createDiaperRecordFail,
    editDiaperRecordSuccess,
    editDiaperRecordFail,
    editDiaperAmountSuccess,
    editDiaperAmountFail,
    clearDiaperlogErrorMessage
} from '../../../redux/school/actions/index'
import PickerComponent from '../../picker'
import PooEntry from './pooentry'
import PooTextInput from './pootextinput'

class DiaperLog extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            isLoading: true,
            date: new Date(),
            other_option: '',
            show_time_picker: false,
            record_id_for_edit: '',
            cloth_diaper: false,
            record_id: ''
        }
        this.handleSend = this.handleSend.bind(this)
    }

    componentDidMount() {
        const { new_data_for_create, old_data_for_edit } = this.props.diaper_records
        const { isConnected } = this.props.class
        if ((new_data_for_create.size + old_data_for_edit.size === 0) && isConnected) {
            this.fetchClassData()
        } else {
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

    checkUnsent(student_id) {
        const { new_data_for_create, old_data_for_edit, by_student_id, students_pending_amount_update } = this.props.diaper_records
        const { records } = by_student_id[student_id]
        var found = false
        if (students_pending_amount_update.has(student_id)) {
            return true
        }
        for (var i = 0; i < records.length; i++) {
            if (new_data_for_create.has(records[i]) || old_data_for_edit.has(records[i])) {
                found = true
                break
            }
        }
        return found
    }

    async fetchClassData() {
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
        const date = new Date()
        const start_date = formatDate(date)
        date.setDate(date.getDate() + 1)
        const end_date = formatDate(date)
        const diaperData = await fetchClassData('diaper', this.props.class.class_id, start_date, end_date)
        this.denormalize(diaperData)
        // console.log('diaperData: ', diaperData)
        this.props.fetchClassDiaperData(diaperData.data)
        this.setState({
            isLoading: false
        })
        // console.log('this.props.diaper_records: ', this.props.diaper_records)
    }

    denormalize(diaperData) {
        // console.log('denormalize: ', diaperData)
        if (!diaperData.data.records.all_id.length) {
            return
        }
        const { by_id } = diaperData.data.records
        for (const record_id in by_id) {
            by_id[record_id].time = new Date(by_id[record_id].time)
        }
    }

    handleUpdateDiaperAmount(student_id, amount) {
        this.props.updateDiaperAmount(student_id, amount)
    }

    addDiaperRecord(student_id) {
        const { teacher_id } = this.props.route.params
        this.props.addDiaperRecord(student_id, new Date(), this.state.cloth_diaper, teacher_id)
    }

    setTime(time) {
        const { teacher_id } = this.props.route.params
        const { record_id_for_edit } = this.state
        if (time !== undefined) {
            this.setState({ 
                show_time_picker: false,
                record_id_for_edit: ''
            })
            this.props.editDiaperTime(record_id_for_edit, time, teacher_id)
        } else {
            this.setState({ 
                show_time_picker: false,
                record_id_for_edit: ''
            })
        }
    }

    switchPeeOrPoo(record_id) {
        const { teacher_id } = this.props.route.params
        this.props.switchPeeOrPoo(record_id, teacher_id)
    }

    editPooCondition(record_id, condition) {
        // console.log(record_id, condition)
        const { teacher_id } = this.props.route.params
        if (condition === '取消編輯') {
            return 
        } else if (condition === '其他') {
            this.setState({
                record_id,
                other_option: 'Please Fill Out'
            })
        } else {
            // console.log('HERE')
            this.setState({ other_option: '' })
            this.props.editPooCondition(record_id, condition, teacher_id)
        }
    }

    confirmRemove(student_id, record_id) {
        Alert.alert(
            '確定要刪除？',
            '',
            [
                { text: 'OK', onPress: () => this.removeDiaperRecord(student_id, record_id) },
                { text: 'Cancel', style: 'cancel'}
            ]
        )
    }

    removeDiaperRecord(student_id, record_id) {
        const { new_data_for_create } = this.props.diaper_records
        const { isConnected } = this.props.class
        
        if (new_data_for_create.has(record_id)) {
            this.props.removeDiaperRecordSuccess(student_id, record_id)
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

        const query = `https://iejnoswtqj.execute-api.us-east-1.amazonaws.com/dev/diaper`
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
                    this.props.removeDiaperRecordFail(message)
                }
                this.props.removeDiaperRecordSuccess(student_id, record_id)
            })
            .catch(err => {
                this.props.removeDiaperRecordFail(err)
            })
    }

    async handleSend() { // TODO: test function
        const { new_data_for_create, old_data_for_edit, students_pending_amount_update } = this.props.diaper_records
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

        if (new_data_for_create.size || old_data_for_edit.size) {
            const create_records_result = await this.createRecords()
            if (create_records_result.success) {
                // console.log(create_records_result)
                this.props.createDiaperRecordSuccess()
            } else {
                this.props.createDiaperRecordFail(create_records_result.data)
                return
            }
        }

        if (students_pending_amount_update.size) {
            const sendDiaperAmountDataResult = await this.sendDiaperAmountData()
            if (sendDiaperAmountDataResult.success) {
                this.props.editDiaperAmountSuccess()
            } else {
                this.props.editDiaperAmountFail(sendDiaperAmountDataResult.err_message)
                return
            }
        }
        
        this.props.navigation.goBack()
    }

    async sendDiaperAmountData() {
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
        let url = 'https://iejnoswtqj.execute-api.us-east-1.amazonaws.com/dev/diaper/'

        const response = await Promise.all(
            Array.from(this.props.diaper_records.students_pending_amount_update).map(student_id => {
                return fetch(url + student_id, {
                    method: 'PUT',
                    body: JSON.stringify({
                        amount: this.props.diaper_records.by_student_id[student_id].amount
                    }),
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json'
                    }
                })
                .then(res => res.json())
                .then(resJson => {
                    return resJson
                })
                .catch(err => { throw err })
            })
        )
        .then(result => {
            return {
                success: true,
                status_code: 200,
                data: result
            }
        })
        .catch(err => {
            return {
                success: false,
                status_code: 500,
                err_message: 'error occured while sending diaper amount data: ' + err
            }
        })
        return response
    }

    async createRecords() {
        const { new_data_for_create, old_data_for_edit, records } = this.props.diaper_records
        const data_objs = []
        const all_record_id = [...new_data_for_create, ...old_data_for_edit]
        // console.log('new_data_for_create: ', new_data_for_create)
        all_record_id.forEach(record_id => {
            data_objs.push({
                ...records.by_id[record_id]
            })
        })
        this.normalize(data_objs)
        const request_body = {
            date: formatDate(new Date()),
            data_objs
        }
        let url = 'https://iejnoswtqj.execute-api.us-east-1.amazonaws.com/dev/diaper/'
        const createRecordsRes =
            await fetch(url, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(request_body)
            })
            .then(res => res.json())
            .then(resJson => {
                // console.log("resJson: ", resJson)
                if (resJson.statusCode === 200) {
                    return {
                        success: true,
                        status_code: 200,
                        data: resJson
                    }
                }
                return {
                    success: false,
                    status_code: 500,
                    data: resJson.message
                }
            })
            .catch(err => {
                return {
                    success: false,
                    status_code: 500,
                    err_message: err
                }
            })

        return createRecordsRes
    }

    async editDiaperRecords() {
        //TODO implement
        return
    }

    normalize(data_objs) {
        // console.log('data_objs: ', data_objs)
        for (var i = 0; i < data_objs.length; i++) {
            data_objs[i].time = formatTime(data_objs[i].time)
        }
    }

    render() {
        // TODO: Provide some options for poo condition
        if (this.props.diaper_records.err_message !== ''){
            Alert.alert(
                'Error!',
                this.props.diaper_records.err_message,
                [{text: 'OK', onPress: () => this.props.clearDiaperlogErrorMessage()}]
            )
        }
        const { teacher_id } = this.props.route.params
        const { show_time_picker, cloth_diaper } = this.state
        const { by_student_id, records } = this.props.diaper_records
        const { students } = this.props.class
        const date = this.state.date
        // console.log('this.props.diaper_records: ', this.props.diaper_records)
        return (
            <KeyboardAvoidingView
                style={{
                    flex: 1,
                    paddingBottom: 15
                }}
                // behavior='padding'
                // keyboardVerticalOffset={100}
                enabled
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly' }}>
                    <Text style={{ fontSize: 40 }}>{beautifyDate(date)}</Text>
                    <View style={{ flexDirection: 'row' }}>
                        <TouchableHighlight
                            style={{
                                backgroundColor: cloth_diaper ? 'rgba(255,255,255,0.2)' : '#ffe1d0',
                                padding: 10,
                                marginRight: 20
                            }}
                            onPress={() => this.setState({ cloth_diaper: false })}
                        >
                            <Text style={{ fontSize: 40 }}>尿布</Text>
                        </TouchableHighlight>

                        <TouchableHighlight
                            style={{
                                backgroundColor: cloth_diaper ? '#ffe1d0' : 'rgba(255,255,255,0.2)',
                                padding: 10,
                                marginRight: 20
                            }}
                            onPress={() => this.setState({ cloth_diaper: true })}
                        >
                            <Text style={{ fontSize: 40 }}>學習褲</Text>
                        </TouchableHighlight>

                        <TouchableHighlight
                            style={{ backgroundColor: '#dcf3d0', padding: 10 }}
                            onPress={this.handleSend}
                        >
                            <Text style={{ fontSize: 40 }}>送出</Text>
                        </TouchableHighlight>
                    </View>
                </View>
                <ScrollView 
                    contentContainerStyle={{ alignItems: 'center' }}
                    keyboardShouldPersistTaps='handled'
                >
                    {Object.keys(students).map((student_id) => {
                        if (by_student_id[student_id] === null) {
                            return null
                        }
                        const record_id_list = by_student_id[student_id].records
                        return (
                            <View key={student_id} style={{ width: '98%' }}>
                                <Card style={{ flex: 1, flexDirection: 'row', paddingVertical: 15 }}>
                                    <View style={{ width: '23%', alignItems: 'center', justifyContent: 'center' }}>
                                        <TouchableHighlight
                                            // style={styles.childThumbnail}
                                            onPress={() => this.addDiaperRecord(student_id)}
                                            underlayColor="transparent"
                                        >
                                            <Image
                                                source={
                                                    students[student_id].profile_picture === '' ?
                                                        require('../../../assets/icon-thumbnail.png')
                                                        : {uri: students[student_id].profile_picture}
                                                }
                                                style={styles.thumbnailImage}/>
                                        </TouchableHighlight> 
                                    </View>
                                    <View style={{ width: '77%' }}>
                                        <View style={{ flex: 1 }}>
                                            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                                                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                                                    <Text style={{ fontSize: 30 }}>
                                                        {students[student_id].name}
                                                    </Text>
                                                    {this.checkUnsent(student_id) ? 
                                                        <Text style={{ fontSize: 15, color: 'red', marginLeft: 15}}>未送出</Text>
                                                        : null
                                                    }
                                                </View>
                                                <View style={{ flex: 1, alignItems: 'flex-end', paddingRight: 15 }}>
                                                    {cloth_diaper ? 
                                                        null
                                                        :
                                                        <View style={{ width: '33%', aspectRatio: 1, backgroundColor: '#b5e9e9', alignItems: 'center', padding: 5 }}>
                                                            <Text>尿布量</Text>
                                                            <TextInput
                                                                style={{ flex:1, fontSize: 37 }}
                                                                value={"" + by_student_id[student_id].amount}
                                                                onChangeText={amount => this.handleUpdateDiaperAmount(student_id, amount)}
                                                            />
                                                        </View>
                                                    }
                                                </View>
                                            </View>
                                            {record_id_list.map(record_id => {
                                                const record = records.by_id[record_id]
                                                if (record.cloth_diaper !== cloth_diaper) return null
                                                return (
                                                    <View key={record_id} style={{ flex: 1, flexDirection: 'row', marginVertical: 6, justifyContent: 'space-between', paddingRight: 15 }}>
                                                        {/* TIME */}
                                                        <TouchableHighlight
                                                            style={{
                                                                width: record.pee_or_poo === '大便' ? '23%' : '35%',
                                                                // marginRight: '3%',
                                                                height: '100%',
                                                                justifyContent: 'center',
                                                                backgroundColor: '#fef6dd',
                                                                borderRadius: 10
                                                            }}
                                                            onPress={() => this.setState({ record_id_for_edit: record_id, show_time_picker: true })}
                                                        >
                                                            <Text style={{ fontSize: 35, textAlign: 'center' }}>
                                                                {`${record.time.getHours()}:${record.time.getMinutes()}`}
                                                            </Text>
                                                        </TouchableHighlight>

                                                        {/* PEE OR POO*/}
                                                        <TouchableHighlight
                                                            style={{
                                                                width: record.pee_or_poo === '大便' ? '23%' : '35%',
                                                                // marginRight: '3%',
                                                                height: '100%',
                                                                justifyContent: 'center',
                                                                backgroundColor: '#fef6dd',
                                                                borderRadius: 10
                                                            }}
                                                            onPress={() => this.switchPeeOrPoo(record_id)}
                                                        >
                                                            <Text style={{ fontSize: 30, textAlign: 'center' }}>
                                                                {`${record.pee_or_poo}`}
                                                            </Text>
                                                        </TouchableHighlight>

                                                        {/* POO CONDITION*/}
                                                        {record.pee_or_poo === '大便' ?
                                                            <PooEntry
                                                                teacher_id={teacher_id}
                                                                record_id={record_id}
                                                                record={record}
                                                            />
                                                            // <View
                                                            //     style={{
                                                            //         width: '23%',
                                                            //         // marginRight: '3%',
                                                            //         height: '100%',
                                                            //         justifyContent: 'center',
                                                            //         backgroundColor: '#fef6dd',
                                                            //         borderRadius: 10
                                                            //     }}
                                                            // >
                                                            //     {this.state.other_option === '' && this.state.record_id != record_id ?
                                                            //         <PickerComponent
                                                            //             style={{
                                                            //                 // height: 20,
                                                            //                 // width: '50%',
                                                            //                 // marginLeft: 25
                                                            //                 alignItems: 'center',
                                                            //                 padding: 5
                                                            //             }}
                                                            //             selectedValue={record.poo_condition}
                                                            //             options={[
                                                            //                 "正常",
                                                            //                 "硬",
                                                            //                 "軟糊",
                                                            //                 "稀水",
                                                            //                 "其他",
                                                            //                 "取消編輯"
                                                            //             ]}
                                                            //             textStyle={{fontSize: 30}}
                                                            //             handleOnClick={() => { }}
                                                            //             handleSelectValue={(condition) => this.editPooCondition(record_id, condition)}
                                                            //         />
                                                            //         :
                                                            //         <PooTextInput
                                                            //             editPooCondition={(condition) => this.editPooCondition(record_id, condition)}
                                                            //         />
                                                            //     }
                                                                    
                                                            // </View>
                                                            : null
                                                        }

                                                        {/* REMOVE RECORD*/}
                                                        <TouchableHighlight
                                                            style={{
                                                                width: '20%',
                                                                // marginRight: '2%',
                                                                height: '100%',
                                                                justifyContent: 'center',
                                                                backgroundColor: '#ffe1d0',
                                                                borderRadius: 10
                                                            }}
                                                            onPress={() => this.confirmRemove(student_id, record_id)}
                                                        >
                                                            <Text style={{ fontSize: 30, textAlign: 'center' }}>
                                                                移除
                                                            </Text>
                                                        </TouchableHighlight>
                                                    </View>
                                                )
                                            })}
                                            {show_time_picker &&
                                                <DateTimePicker
                                                    style={{ width: '100%'}}
                                                    mode={'time'}
                                                    display={'spinner'}
                                                    value={new Date}
                                                    onChange={(event, time) => this.setTime(time)}
                                                    minimumDate={new Date()}
                                                />
                                            }
                                        </View>
                                    </View>
                                </Card>
                            </View>
                        )
                    })}
                </ScrollView>
            </KeyboardAvoidingView>
        )
    }
}

const styles = StyleSheet.create({
    thumbnailImage: {
        width: 140,
        height: 140,
        borderRadius: 70
    }
})

const mapStateToProps = (state) => {
    return {
        diaper_records: state.diaper,
        class: state.classInfo
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators({
            updateDiaperAmount,
            addDiaperRecord,
            editDiaperTime,
            switchPeeOrPoo,
            editPooCondition,
            removeDiaperRecordSuccess,
            removeDiaperRecordFail,
            fetchClassDiaperData,
            createDiaperRecordSuccess,
            createDiaperRecordFail,
            editDiaperRecordSuccess,
            editDiaperRecordFail,
            editDiaperAmountSuccess,
            editDiaperAmountFail,
            clearDiaperlogErrorMessage
        }, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps) (DiaperLog)
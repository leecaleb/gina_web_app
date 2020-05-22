import React from 'react'
import { StyleSheet, Image, TouchableHighlight, View, Text, TextInput, Alert} from 'react-native'
import { Container, Content, Card, Toast } from 'native-base'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {
    editMilkAmount,
    addMilkRecord,
    fetchClassMilkData,
    createDataSuccess,
    createDataFail,
    editDataSuccess,
    editDataFail,
    removeRecord,
    removeMilkRecordSuccess,
    removeMilkRecordFail,
    editMilkTime
} from '../../../redux/school/actions/index'
import { formatTime, formatDate, fetchClassData } from '../../util'
import Reloading from '../../reloading'
import TimeModal from '../../parent/timemodal'

class TeacherMilkLog extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            isLoading: true,
            date: new Date(),
            showDateTimeModal: false,
            record_id: ''
        }
        this.handleSend = this.handleSend.bind(this)
        this.handleOnAddRecord = this.handleOnAddRecord.bind(this)
    }

    componentDidMount() {
        const { isConnected } = this.props.class
        if (!this.props.milk.loaded && isConnected) {
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

    checkUnsent(student_id) {
        const { newDataForCreate, oldDataForEdit, dataForRemoval, by_student_id } = this.props.milk
        const record_id_list = by_student_id[student_id]
        var found = false
        for (var i = 0; i < record_id_list.length; i++) {
            const record_id = record_id_list[i]
            if (newDataForCreate.has(record_id) || oldDataForEdit.has(record_id)) {
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
        const milkData = await fetchClassData('milkintake', this.props.class.class_id, start_date, end_date)
        this.denormalize(milkData)
        this.props.fetchClassMilkData(milkData.data)
        this.setState({
            isLoading: false
        })
    }

    denormalize(milkData) {
        if (!milkData.data.records.all_id.length) {
            return
        }
        const { by_id } = milkData.data.records
        for (const record_id in by_id) {
            by_id[record_id].time = new Date(by_id[record_id].time)
        }
    }

    handleEditMilkAmout(record_id, milk_amount) {
        const { teacher_id } = this.props.route.params
        this.props.editMilkAmount(record_id, milk_amount, teacher_id)
    }

    handleOnAddRecord(student_id) {
        this.props.addMilkRecord(student_id)
    }

    confirmToRemoveRecord(student_id, record_id, index) {
        Alert.alert(
            '確定要刪除？',
            '',
            [
                { text: 'Yes', onPress: () => this.handleRemoveRecord(student_id, record_id, index) },
                { text: 'Cancel', style: 'cancel' }
            ]
        )
    }

    handleRemoveRecord(student_id, record_id, index) {
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
        this.props.removeRecord(student_id, record_id, index)
        this.handleRemove(record_id, student_id)
    }

    async handleSend() {
        // this.setState({ isLoading: true })
        const { newDataForCreate, oldDataForEdit, dataForRemoval } = this.props.milk
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

        if (newDataForCreate.size) {
            const handleCreateRes = await this.handleCreate()
            // console.log('handleCreateRes: ', handleCreateRes)
            if (handleCreateRes.success) {
                this.props.createDataSuccess()
            } else {
                this.props.createDataFail(handleCreateRes.data)
                return
            }
        }

        if (oldDataForEdit.size) {
            const handleEditRes = await this.handleEdit()
            // console.log('handleEditRes: ', handleEditRes)
            if (handleEditRes.success) {
                this.props.editDataSuccess()
            } else {
                this.props.editDataFail(handleEditRes.data)
                return
            }
        }
        // this.setState({ isLoading: false })
        this.props.navigation.goBack()
    }

    async handleCreate() {
        const { newDataForCreate, records } = this.props.milk
        const data_objs = []
        newDataForCreate.forEach(record_id => {
            data_objs.push({
                ...records.by_id[record_id]
            })
        })

        this.normalize(data_objs)
        const request_body = {
            date: formatDate(new Date()),
            data_objs
        }

        const createDataRes = await fetch('https://iejnoswtqj.execute-api.us-east-1.amazonaws.com/dev/milkintake', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(request_body)
        })
            .then(res => res.json())
            .then(resJson => {
                // console.log('milklog/resJson: ', resJson)
                const {statusCode, errMessage, message } = resJson
                if (statusCode > 200) {
                    return {
                        success: false,
                        status_code: statusCode,
                        data: errMessage || message
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
        return createDataRes
    }

    async handleEdit() {
        const { oldDataForEdit, records } = this.props.milk
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

        const editDataRes = await fetch('https://iejnoswtqj.execute-api.us-east-1.amazonaws.com/dev/milkintake', {
            method: 'PUT',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(request_body)
        })
            .then(res => res.json())
            .then(resJson => {
                const {statusCode, message } = resJson
                if (statusCode > 200) {
                    return {
                        success: false,
                        status_code: statusCode,
                        data: message
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
        return editDataRes
    }

    async handleRemove(record_id, student_id) {
        const { dataForRemoval } = this.props.milk

        if (!dataForRemoval.has(record_id)) {
            return
        }

        var request_body = {
            record_id_array: record_id,
            student_id
        }
        const query = `https://iejnoswtqj.execute-api.us-east-1.amazonaws.com/dev/milkintake`
        const removeRes = await fetch(query, {
            method: 'DELETE',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(request_body)
        })
            .then(res => res.json())
            .then(resJson => {
                const {statusCode, message } = resJson
                if (statusCode > 200) {
                    return {
                        success: false,
                        status_code: statusCode,
                        data: message
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

        if (removeRes.success) {
            this.props.removeMilkRecordSuccess()
        } else {
            this.props.removeMilkRecordFail()
        }
    }

    normalize(data_objs) {
        for (var i = 0; i < data_objs.length; i++) {
            data_objs[i].time = formatTime(data_objs[i].time)
        }
    }

    selectDatetimeConfirm(time) {
        const { teacher_id } = this.props.route.params
        const { record_id } = this.state
        this.setState({ record_id: '', showDateTimeModal: false })
        this.props.editMilkTime(record_id, time, teacher_id)
    }

    render() {
        if (this.state.isLoading) {
            return (
                <Reloading />
            )
        }

        const { date, showDateTimeModal } = this.state
        return (
            <Container>
                {showDateTimeModal ?
                    <TimeModal
                        start_date={date}
                        datetime_type={'time'}
                        hideModal={() => this.setState({ showDateTimeModal: false })}
                        selectDatetimeConfirm={(datetime) => this.selectDatetimeConfirm(datetime)}
                        minDatetime={null}
                        maxDatetime={null}
                    />
                    : null
                }
                <View style={styles.subHeading}>
                    <Text style={{ fontSize: 40 }}>{date.getFullYear() + '.' + (date.getMonth()+1) + '.' + date.getDate()}</Text>
                    <TouchableHighlight
                        style={{ backgroundColor: '#dcf3d0', padding: 10 }}
                        onPress={this.handleSend}
                    >
                        <Text style={{ fontSize: 40, color: 'grey' }}>送出</Text>
                    </TouchableHighlight>
                </View>
                <Content contentContainerStyle={{ alignItems: 'center' }}>
                    {Object.keys(this.props.class.students).map((student_id) => {
                        const record_id_array = this.props.milk.by_student_id[student_id]
                        const records = this.props.milk.records.by_id
                        return(
                            <View key={student_id} style={{ width: '98%' }}>
                                <Card style={{ flex: 1, paddingVertical: 15 }}>
                                    <View style={{ flex: 1, flexDirection: 'row'}}>
                                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                            <TouchableHighlight
                                                style={styles.childThumbnail}
                                                onPress={() => this.handleOnAddRecord(student_id)}
                                                underlayColor="transparent"
                                            >
                                                <Image
                                                    // source={{uri: this.props.class.students[student_id].profile_picture }}
                                                    source={
                                                        this.props.class.students[student_id].profile_picture === '' ?
                                                            require('../../../assets/icon-thumbnail.png')
                                                            : {uri: this.props.class.students[student_id].profile_picture}
                                                    }
                                                    style={styles.thumbnailImage}/>
                                            </TouchableHighlight>
                                        </View>
                                        <View style={{ flex: 3}}>
                                            <View style={{ flexDirection: 'row'}}>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={{ fontSize: 30, paddingLeft: 18 }}>{this.props.class.students[student_id].name}</Text>
                                                </View>
                                                <View style={{ flex: 1, paddingRight: 15 }}>
                                                    {this.checkUnsent(student_id) ?
                                                        <Text style={{ fontSize: 15, paddingLeft: 18, alignSelf: 'flex-end', color: 'red' }}>
                                                            未送出
                                                        </Text>
                                                        : null
                                                    }
                                                </View>
                                            </View>
                                            {record_id_array.map((record_id, index) => {
                                                const record = records[record_id]
                                                return (
                                                    <View key={record_id} style={styles.cardBody}>
                                                        <View style={{ width: '35%', marginRight: '3%', height: '100%' }}>
                                                            <TouchableHighlight
                                                                style={{ flex: 1, justifyContent: 'center', backgroundColor: '#fef6dd', borderRadius: 10 }}
                                                                onPress={() => this.setState({ showDateTimeModal: true, record_id})}
                                                            >
                                                                <Text style={{ fontSize: 35, textAlign: 'center' }}>
                                                                    {record.time.getHours() + ':' + record.time.getMinutes()}
                                                                </Text>
                                                            </TouchableHighlight>
                                                        </View>
                                                        <View style={{
                                                            flexDirection: 'row',
                                                            width: '35%',
                                                            marginRight: '3%',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            backgroundColor: '#fef6dd',
                                                            height: '100%',
                                                            borderRadius: 10
                                                        }}>
                                                            <TextInput
                                                                style={{ flex: 2, fontSize: 35, textAlign: 'center' }}
                                                                keyboardType='decimal-pad'
                                                                placeholder="⽤量"
                                                                value={'' + record.amount}
                                                                onChangeText={(milk_amount) => {this.handleEditMilkAmout(record_id, milk_amount)}}
                                                            />
                                                            <Text style={{ flex: 1, fontSize: 30, textAlign: 'center' }}>
                                                                c.c.
                                                            </Text>
                                                        </View>
                                                        <View style={{ width: '20%', marginRight: '4%', height: '100%' }}>
                                                            <TouchableHighlight
                                                                style={{ flex:1, justifyContent: 'center', backgroundColor: '#ffe1d0', borderRadius: 10}}
                                                                onPress={() => this.confirmToRemoveRecord(student_id, record_id, index)}
                                                            >
                                                                <Text style={{ fontSize: 30, textAlign: 'center' }}>
                                                                    移除
                                                                </Text>
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
            </Container>
        )
    }
}

const styles = StyleSheet.create({
    childThumbnail: {
        // width: 100,
        // height: 100,
        // backgroundColor: 'white',
        // marginLeft: -7,
    },
    thumbnailImage: {
        width: 140,
        height: 140,
        borderRadius: 70
    },
    subHeading: {
        width: '90%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        alignSelf: 'center'
    },
    cardBody: {
        // flex: 1,
        flexDirection: 'row',
        marginVertical: 6
        // alignItems: 'center',
        // justifyContent: 'center',
    }
})

const mapStateToProps = (state) => {
    return {
        class: state.classInfo,
        milk: state.milk
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators({
            editMilkAmount,
            addMilkRecord,
            fetchClassMilkData,
            createDataSuccess,
            createDataFail,
            editDataSuccess,
            editDataFail,
            removeRecord,
            removeMilkRecordSuccess,
            removeMilkRecordFail,
            editMilkTime
        }, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps) (TeacherMilkLog)
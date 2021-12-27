import React from 'react'
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

class WellnessLog extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            isLoading: true,
            date: new Date(),
            show_record: false,
            showDateTimeModal: false
        }
        this.handleSend = this.handleSend.bind(this)
        this.addRecord = this.addRecord.bind(this)
    }

    componentDidMount() {
        const { record_id_for_update } = this.props.wellness
        const { isConnected } = this.props.class
        const { date, teacher_name } = this.props.route.params
        if (record_id_for_update.size === 0 && isConnected) {
            this.setState({
                date
            })
            this.fetchClassData(date)
        }
        else {
            this.setState({
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

        this.props.navigation.setOptions({ 
            title: `健康 - ${teacher_name}`
        })
    }

    async fetchClassData(propsDate) {
        this.props.navigation.setOptions({ 
            headerRight: () => (
                <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: '#f4d41f', marginRight: 20 }} />
            )
        })
        const date = new Date(propsDate)
        const start_date = formatDate(date)
        date.setDate(date.getDate() + 1)
        const end_date = formatDate(date)
        const wellnessData = await fetchClassData('wellness', this.props.class.class_id, start_date, end_date)
        // console.log(wellnessData)
        this.denormalize(wellnessData)
        this.props.fetchClassWellnessData(wellnessData.data)
        this.setState({
            isLoading: false
        })
        this.props.navigation.setOptions({ 
            headerRight: () => (
                <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: '#00c07f', marginRight: 20 }} />
            )
        })
    }

    denormalize(wellnessData) {
        if (!Object.keys(wellnessData.data.records).length){
            return
        }
        const { records } = wellnessData.data
        for (var record_id in records) {
            wellnessData.data.records[record_id].time = new Date(records[record_id].time)
        }
    }

    hasUnsentRecord(record_id_list) {
        const { record_id_for_update } = this.props.wellness
        var has_unsent_record = false
        for (var i = 0; i < record_id_list.length; i++) {
            if (record_id_for_update.has(record_id_list[i])) {
                has_unsent_record = true
                break
            }
        }
        return has_unsent_record
    }

    addRecord(student_id) {
        const record_amount = this.props.wellness.by_student_id[student_id].length
        if (record_amount === 2) {
            Alert.alert(
                '今天已經量了兩次體溫了',
                '',
                [{text: 'OK'}]
            )
            return
        }
        this.props.addWellnessRecord(student_id)
    }

    async handleSend() {
        // if (!this.wellnessDataValidated()) {
        //     return
        // }
        const { wellness } = this.props
        const { isConnected } = this.props.class
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
        this.setState({ isLoading: true })
        const sendDataResult = await sendWellnessData(wellness, this.props.class.class_id, formatDate(new Date))
        if (sendDataResult.success) {
            sendDataResult.data.forEach(student_id => {
                this.props.markPresent(student_id, new Date)
            })
            this.props.sendWellnessDataSuccess()
            this.props.navigation.goBack()
        } else {
            this.props.sendWellnessDataFail(sendDataResult.message)
            Alert.alert(
                'Err',
                sendDataResult.message,
                [{text: 'OK'}]
            )
        }
        this.setState({ isLoading: false })
    }

    wellnessDataValidated() {
        const { records, record_id_for_update } = this.props.wellness
        let validated = true
        record_id_for_update.forEach(record_id => {
            if (records[record_id].temperature === '') {
                this.props.invalidateWellnessData(record_id, 'Temperature is not filled out')
                validated = false
            } else if (records[record_id].status === '') {
                this.props.invalidateWellnessData(record_id, 'Health status is not filled out')
                validated = false
            }
        })
        return validated
    }

    selectDatetimeConfirm(date) {
        this.setState({
            date,
            showDateTimeModal: false
        })
        this.fetchClassData(date)
    }

    render() {
        const { by_student_id, records } = this.props.wellness
        const { teacher_id, isAdmin } = this.props.route.params
        const { showDateTimeModal, date, isLoading } = this.state
        
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
                    hideModal={() => this.setState({ showDateTimeModal: false })}
                    selectDatetimeConfirm={(datetime) => this.selectDatetimeConfirm(datetime)}
                    minDatetime={null}
                    maxDatetime={new Date()}
                />}
                <View style={{ flexDirection: 'row', width: '90%', justifyContent: 'space-between', alignSelf: 'center', alignItems: 'center'}}>
                    <TouchableHighlight
                        onPress={() => {
                            const { data_dispatched } = this.props.wellness
                            if (!data_dispatched || !isAdmin) return
                            this.setState({ showDateTimeModal: true })
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
                        onPress={this.handleSend}>
                        <Text style={{ fontSize: 40}}>送出</Text>
                    </TouchableHighlight>
                </View>
                <ScrollView contentContainerStyle={{ alignItems: 'center', marginBottom: 20 }}>
                    {Object.keys(this.props.class.students).map((student_id) => {
                        const record_id_list = by_student_id[student_id]
                        return(
                            <View key={student_id} style={{ width: '98%' }}>
                                <Card>
                                    <CardItem style={{ flex: 1, flexDirection: 'row' }}>
                                        <TouchableHighlight
                                            style={styles.childThumbnail}
                                            // onPress={() => this.addRecord(student_id)}
                                        >
                                            <Image
                                                source={
                                                    this.props.class.students[student_id].profile_picture === '' ?
                                                        require('../../../assets/icon-thumbnail.png')
                                                        : {uri: this.props.class.students[student_id].profile_picture}
                                                }
                                                style={styles.thumbnailImage}
                                            />
                                        </TouchableHighlight>
                                        <View style={{ flex: 3 }}>
                                            <View style={{ flex: 1, flexDirection: 'row', paddingVertical: 10 }}>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={{ fontSize: 25}}>{this.props.class.students[student_id].name}</Text>
                                                </View>
                                                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                                    {this.hasUnsentRecord(record_id_list) ? 
                                                        <Text style={{ color: 'red', fontSize: 15 }}>未送出</Text>
                                                    : null}
                                                </View>
                                            </View>
                                            {record_id_list.map((record_id, index) => {
                                                return (
                                                    <View style={{flex:1}} key={record_id}>
                                                        { index === 0 ?
                                                            <Text>早上</Text>
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
                                    </CardItem>
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
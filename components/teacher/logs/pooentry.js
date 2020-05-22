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
import PooTextInput from './pootextinput'

class PooEntry extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            selected_other: false,
            other_option: ''
        }
    }

    componentDidMount() {
       
    }

    editPooCondition(record_id, condition) {
        // console.log('editPooCondition: ', record_id, condition, teacher_id)
        const { teacher_id } = this.props
        if (condition === '取消編輯') {
            return 
        } else if (condition === '其他') {
            this.setState({
                selected_other: true,
                other_option: ' '
            })
            
        } else {
            console.log('editPooCondition: ', record_id, condition, teacher_id)
            this.setState({
                selected_other: false,
                other_option: condition
            })
            this.props.editPooCondition(record_id, condition, teacher_id)
        }
    }

    render() {
        // TODO: Provide some options for poo condition
        // if (this.props.diaper_records.err_message !== ''){
        //     Alert.alert(
        //         'Error!',
        //         this.props.diaper_records.err_message,
        //         [{text: 'OK', onPress: () => this.props.clearDiaperlogErrorMessage()}]
        //     )
        // }
        const { record_id, record } = this.props
        const { selected_other,other_option } = this.state
        // const { by_student_id, records } = this.props.diaper_records
        // const { students } = this.props.class
        // const date = this.state.date
        // console.log('record_id: ', record_id)
        return (
            <View
                style={{
                    width: '23%',
                    // marginRight: '3%',
                    height: '100%',
                    justifyContent: 'center',
                    backgroundColor: '#fef6dd',
                    borderRadius: 10
                }}
            >
                {selected_other ?
                    <TextInput
                        style={{ fontSize: 30, textAlign: 'center' }}
                        keyboardType='default'
                        autoFocus={selected_other}
                        // showSoftInputOnFocus={true}
                        selectTextOnFocus={true}
                        // scrollEnabled={false}
                        value={other_option}
                        onChangeText={(condition) => this.setState({ other_option: condition})}
                        // onFocus={() => }
                        onBlur={() => this.editPooCondition(record_id, other_option)}
                    />

                    // <PooTextInput
                    //     editPooCondition={(other_option) => this.editPooCondition(record_id, other_option)}
                    // />

                    : <PickerComponent
                        style={{
                            // height: 20,
                            // width: '50%',
                            // marginLeft: 25
                            alignItems: 'center',
                            padding: 5
                        }}
                        selectedValue={other_option || record.poo_condition}
                        options={[
                            "正常",
                            "硬",
                            "軟糊",
                            "稀水",
                            "其他",
                            "取消編輯"
                        ]}
                        textStyle={{ fontSize: 30 }}
                        handleOnClick={() => { }}
                        handleSelectValue={(condition) => this.editPooCondition(record_id, condition)}
                    />
                }
            </View>
        )
    }
}

// const styles = StyleSheet.create({
//     thumbnailImage: {
//         width: 140,
//         height: 140,
//         borderRadius: 70
//     }
// })

const mapStateToProps = (state) => {
    return {
        diaper_records: state.diaper,
        class: state.classInfo
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators({
            editPooCondition
        }, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps) (PooEntry)
import React, { useState } from 'react'
import { View, TextInput, Text } from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { addHealthStatus, addTemperature } from '../../redux/school/actions/index'
import PickerComponent from '../picker'

const TeacherWellnessForm = (props) => {
    const [otherOption, setOtherOption] = useState('')

    const handleSelectStatus = (student_id, record_id, status) => {
        if (status === 'Cancel') {
            return
        } else if (status === '其他') {
            this.setState({
                other_option: '其他'
            })
        } else {
            this.props.addHealthStatus(student_id, record_id, status, this.props.teacher_id)
        }
    }

    const { student_id, record_id, records, records_with_error, autoFocus } = this.props
    const wellness_data = records[record_id]
    return (
        <View style={{}}>
            {this.state.other_option === '' ? 
                <PickerComponent
                    style={{ 
                        backgroundColor: 'rgba(255,255,255, 0.5)',
                        alignItems: 'center',
                        padding: 5
                    }}
                    textStyle={{fontSize: 40}}
                    selectedValue={wellness_data.status}
                    options={[
                        "健康",
                        "發燒",
                        "上呼吸道感染",
                        "類流感",
                        "嗅覺異常",
                        "味覺異常",
                        "不明原因腹瀉",
                        "其他",
                        "Cancel"
                    ]}
                    handleOnClick={() => { }}
                    handleSelectValue={(status) => this.handleSelectStatus(student_id, record_id, status)}
                />
            : <TextInput
                style={{ 
                    fontSize: 40,
                    backgroundColor: 'rgba(255,255,255, 0.5)',
                    alignItems: 'center',
                    padding: 2
                }}
                keyboardType='default'
                autoFocus={this.state.other_option !== ''}
                selectTextOnFocus={true}
                // placeholder=''
                value={wellness_data.status}
                onChangeText={(status) => { this.handleSelectStatus(student_id, record_id, status) }}
                onBlur={() => this.setState({ other_option: ''})}
                />
            }
        </View>
    )
}

export default TeacherWellnessForm
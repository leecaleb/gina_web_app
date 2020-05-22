import React from 'react'
import { View, TextInput, Text } from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { addHealthStatus, addTemperature } from '../../redux/school/actions/index'
import PickerComponent from '../picker'

class WellnessForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      other_option: ''
    }
  }

  handleSelectStatus(student_id, record_id, status) {
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

  handleTempInput(student_id, record_id, temperature) {
    const normalized_temperature = 
      temperature.slice(-1) === '.' ?
        temperature.slice(0,2)
        :
      temperature.length === 3 ? 
        temperature.slice(0,2) + '.' + temperature.slice(-1)
        : temperature
    this.props.addTemperature(student_id, record_id, normalized_temperature, this.props.teacher_id)
  }

  render() {
    const { student_id, record_id, records, records_with_error, autoFocus } = this.props
    const wellness_data = records[record_id]
    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 2,
          borderColor: records_with_error.has(record_id) ? 'red' : 'transparent'
        }}
      >
        <View 
          style={{ 
            flex: 1, 
            flexDirection: 'row', 
            backgroundColor: 'rgba(255,255,255, 0.5)', 
            marginRight: '10%', 
            justifyContent: 'center',
            padding: 5
          }}
        >
          <TextInput
            style={{ fontSize: 40 }}
            autoFocus={autoFocus}
            keyboardType='decimal-pad'
            placeholder='體溫'
            value={'' + wellness_data.temperature}
            onChangeText={(temp) => { this.handleTempInput(student_id, record_id, temp) }}
          />
          {wellness_data.temperature === '' ? null : <Text style={{ fontSize: 30 }}>°</Text>}
        </View>
        <View style={{ flex: 2 }}>
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
                "健康寶寶",
                "發燒",
                "喉嚨偏紅",
                "咳嗽",
                "流⿐涕",
                "頭痛",
                "活動⼒不佳",
                "嘔吐", 
                "糞便帶有⾎絲",
                "拉肚子",
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
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  return {
      // class: state.classInfo,
    records: state.healthstatus.records,
    records_with_error: state.healthstatus.records_with_error
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
      ...bindActionCreators({
          addHealthStatus,
          addTemperature,
      }, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps) (WellnessForm)
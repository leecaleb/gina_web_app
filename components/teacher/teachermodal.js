import React from 'react'
import { View, Image, Text, TouchableHighlight, StyleSheet, KeyboardAvoidingView, Alert, TextInput } from 'react-native'
import { Toast } from 'native-base'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import WellnessForm from './wellnessform'
import { sendWellnessData, formatDate, post, formatTime, put } from '../util'
import { markPresent, sendWellnessDataFail, editTeacherOnDuty } from '../../redux/school/actions/index'

class TeacherModal extends React.Component{
  constructor(props) {
    super(props)
    this.state={
        temperature: ''
    }
  }

  editTemperature(temperature) {
    const normalized_temperature = 
      temperature.slice(-1) === '.' ?
        temperature.slice(0,2)
        :
      temperature.length === 3 ? 
        temperature.slice(0,2) + '.' + temperature.slice(-1)
        : temperature
      this.setState({ temperature: normalized_temperature })
  }

  clock() {
    const { isConnected, teacher_id, teachers } = this.props
    const teacher = teachers[teacher_id]

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

    if (teacher.present) {
      const attendance_id = teacher.attendance[teacher.attendance.length - 1]
      this.clockout(attendance_id)
    } else {
      this.clockin()
    }
  }

  async clockout(attendance_id) {
    const response = await put(`/staff-attendance/${attendance_id}`, {
      out_time: formatDate(new Date()) + ' ' + formatTime(new Date())
  })
    const { success, statusCode, message, data } = response
    if (!success) {
      Alert.alert(
        'Sorry 打卡時電腦出狀況了！',
        '請截圖和與工程師聯繫\n\n' + message,
        [{ text: 'Ok' }]
      )
    }

    this.props.fetchTeacherAttendance()
    this.props.hideModal()
  }

  async clockin() {
    const { isConnected, teacher_id } = this.props
    const { temperature } = this.state

    if (!isConnected) {
        Toast.show({
            text: '拍謝 網路連不到! 等一下再試試看',
            buttonText: 'Okay',
            position: "top",
            type: "warning",
            duration: 2000
        })
    }

    const response = await post('/staff-attendance', {
        teacher_id,
        in_time: formatDate(new Date()) + ' ' + formatTime(new Date()),
        temperature: temperature ? temperature : 0
    })

    const { success, statusCode, message, data } = response
    if (!success) {
        Alert.alert(
            'Sorry 打卡時電腦出狀況了！',
            '請截圖和與工程師聯繫\n\n' + message,
            [{ text: 'Ok' }]
        )
        return 
    }
    this.props.fetchTeacherAttendance()
    this.props.hideModal()
  }

  editTeacherOnDuty(teacher_id) {
    const { teacherOnDuty, teachers } = this.props
    var name = '未登入'
    if (teacherOnDuty === teacher_id) {
      this.props.editTeacherOnDuty('')
    } else {
      this.props.editTeacherOnDuty(teacher_id)
      name = teachers[teacher_id].name
    }
    
    this.props.navigation.setOptions({ 
        headerRight: () => (
            <View style={{ paddingRight: 20 }}>
                <Text style={{ fontSize: 30 }}>{`值班老師：${name}`}</Text>
            </View>
        )
    })
  }

  // getTotalTime(record) {
  //   const { teacher_id, teachers, attendance } = this.props
  //   let total_hour = 0
  //   let total_min = 0
  //   for(var i = 0; i < teachers[teacher_id].attendance.length; i++){
  //     const { in_time, out_time } = attendance[teachers[teacher_id].attendance[i]]
  //     total_hour += parseInt(in_time)
  //     total_min +=
  //   }
  // }

  render() {
    const { show, student_id, teacher_id, teachers, unmarked, absent, teacherOnDuty, attendance } = this.props
    const { temperature } = this.state
    const teacher = teachers[teacher_id]
    // console.log('teacher: ', teacher)
    // const { wellness } = this.props
    // const record_id = wellness.by_student_id[student_id][0]
    // TODO: temperature
    return (
        <View
          style={{
            flex: 1,
            width: '80%',
            height: '70%',
            backgroundColor:
              absent.has(teacher_id) ? '#ffe1d0'
                : unmarked.has(teacher_id) ? '#fff1b5'
                : '#dcf3d0',
            zIndex: 3,
            position: 'absolute'
          }}
        >
          <View style={{ flex: 3, flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center' }}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Image
                source={
                    teacher.profile_picture === '' ?
                      require('../../assets/icon-teacher-thumbnail.png')
                      : {uri: teacher.profile_picture }
              }
                style={styles.thumbnailImage}
              />
              <TextInput
              style={{ fontSize: 60 }}
              keyboardType='decimal-pad'
              placeholder='體溫'
              value={'' + temperature}
              onChangeText={(temperature) => this.editTemperature(temperature)}
          />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 60 }}>{teacher.name}</Text>
              <TouchableHighlight
                onPress={() => this.editTeacherOnDuty(teacher_id)}
                underlayColor='transparent'
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Image
                    source={teacherOnDuty === teacher_id ? 
                      require('../../assets/icon-checked-box.png')
                    : require('../../assets/icon-unchecked-box.png')}
                    style={{ width: 80, aspectRatio: 1 }}
                  />
                  <Text style={{ fontSize: 40 }}>值班老師</Text>
                </View>
              </TouchableHighlight>
            </View>
          </View>
          
          <View style={{ flex: 2, paddingHorizontal: 30, justifyContent: 'space-evenly', alignItems: 'center' }}>
            {teacher.attendance && teacher.attendance.map((attendance_id) => {
              const record = attendance[attendance_id]
              return (
                <View key={attendance_id} style={{ flex: 1, flexDirection: 'row', width: '60%', justifyContent: 'space-around' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 50 }}>{record.in_time}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 50 }}>{record.out_time}</Text>
                  </View>
                </View>
              )
            })}

            {/* <TouchableHighlight
              style={{ backgroundColor: 'red', flex: 1, height: 60, justifyContent: 'center', alignItems: 'center', margin: 8 }}
              onPress={() => this.clock()}
            >
              <Text style={{ fontSize: 30 }}>打卡</Text>
            </TouchableHighlight> */}
            <View style={{ flexDirection: 'row', alignSelf: 'flex-end',  backgroundColor: 'white', padding: 10 }}>
              <Text style={{ fontSize: 25}}>今日總計: {Math.round(teacher.total_minutes*100) / 100}</Text>
            </View>
          </View>

          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
            {/* {unmarked.has(teacher_id) ? */}
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                <TouchableHighlight
                  style={{ backgroundColor: 'red', flex: 1, height: 80, justifyContent: 'center', alignItems: 'center', margin: 8 }}
                  onPress={this.props.hideModal}
                >
                  <Text style={{ fontSize: 40 }}>取消</Text>
                </TouchableHighlight>
                <TouchableHighlight
                  style={{ backgroundColor: 'grey', flex: 1, height: 80, justifyContent: 'center', alignItems: 'center', margin: 8 }}
                  onPress={() => this.clock()}
                >
                  <Text style={{ fontSize: 40 }}>打卡</Text>
                </TouchableHighlight>
              </View>
              {/* : null
            } */}
          </View>
        </View>
    )
  }
}

const styles = StyleSheet.create({
  thumbnailImage: {
      width: 200,
      height: 200,
      borderRadius: 100
  }
})

const mapStateToProps = (state) => {
  return {
    // students: state.classInfo.students,
    attendance: state.school.attendance,
    teachers: state.school.teachers,
    teacherOnDuty: state.school.teacherOnDuty,
    unmarked: state.school.teacher_unmarked,
    absent: state.school.teacher_absent,
    // wellness: state.healthstatus,
    isConnected: state.school.isConnected
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    ...bindActionCreators({markPresent, sendWellnessDataFail, editTeacherOnDuty}, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps) (TeacherModal)
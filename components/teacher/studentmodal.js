import React from 'react'
import { View, Image, Text, TouchableHighlight, StyleSheet, KeyboardAvoidingView, Alert } from 'react-native'
import { Toast } from 'native-base'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import WellnessForm from './wellnessform'
import { sendWellnessData, formatDate, post } from '../util'
import { sendWellnessDataFail, sendWellnessDataSuccess } from '../../redux/school/actions/index'

class StudentModal extends React.Component{
  constructor(props) {
    super(props)
    this.state={
        class_id: ''
    }
  }

  componentDidMount() {
    const { class_id, student_id } = this.props
    if (class_id === 'all') {
      this.getClassIdByStudentId(student_id)
    } else {
      this.setState({ class_id })
    }
  }

  getClassIdByStudentId(student_id) {
      const { classes } = this.props
      const id = Object.keys(classes)
      var class_id_found = ''
      for(var i = 0; i < id.length; i++) {
          const {students} = classes[id[i]]
          for(var j = 0; j < students.length; j++) {
              if (students[j] === student_id) {
                  class_id_found = id[i]
              }
          }
      }

      this.setState({
          class_id: class_id_found
      })
  }

  async handleSend(record_id) {
    const { wellness, isConnected } = this.props
    const { class_id } = this.state
    const { records } = wellness
    const record = records[record_id]
    if (record.temperature === '') {
      Alert.alert(
        '未填寫!',
        '',
        [{text: 'OK'}]
      )
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
    }

    const sendDataResult = await sendWellnessData(wellness, class_id, formatDate(new Date()))
    if (sendDataResult.success) {
        this.props.fetchStudentAttendance()
        this.props.sendWellnessDataSuccess()
        this.props.hideModal()
    } else {
      this.props.sendWellnessDataFail(sendDataResult.message)
    }
  }

  async markAbsent() {
    const { student_id, school_id } = this.props
    const { class_id } = this.state
    const body = {
      student_id,
      class_id,
      school_id,
      startDate: formatDate(new Date()),
      endDate: formatDate(new Date()),
      excuse_type: 'none-medical',
      note: '校方填寫'
    }
    const response = await post('/absence-excuse', body)
    const { success, statusCode, message, data } = response
    if (!success) {
        Alert.alert(
            'Sorry 標記學生缺席時電腦出狀況了！',
            '請截圖和與工程師聯繫\n\n' + message,
            [{ text: 'Ok' }]
        )
        return 
    }
    this.props.fetchStudentAttendance()
    this.props.hideModal()
  }

  render() {
    const { show, student_id, teacher_id, students, student_unmarked, student_absent, teacherOnDuty } = this.props
    const student = students[student_id]
    const { wellness } = this.props
    const record_id = wellness.by_student_id[student_id][0]
    return (
        <View
          style={{
            flex: 1,
            width: '80%',
            height: '70%',
            backgroundColor:
                student_absent.has(student_id) ? '#ffe1d0'
                : student_unmarked.has(student_id) ? '#fff1b5'
                : '#dcf3d0',
            zIndex: 3,
            position: 'absolute'
          }}
        >
          <View style={{ flex: 2, flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center' }}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Image
                source={
                  student.profile_picture === '' ?
                      require('../../assets/icon-thumbnail.png')
                      : {uri: student.profile_picture }
              }
                style={styles.thumbnailImage}
              />
            </View>
            <View style={{ flex: 1, alignItems: 'flex-start' }}>
              <Text style={{ fontSize: 60 }}>{student.name}</Text>
              <TouchableHighlight
                style={{ padding: 10, backgroundColor: 'lightgrey', justifyContent: 'center' }}
                onPress={() => this.markAbsent()}
              >
                <Text style={{ fontSize: 40 }}>缺席</Text>
              </TouchableHighlight>
            </View>
          </View>
          
          <View style={{ flex: 2 }}>
            <View style={{ flex: 3, alignItems: 'center' }}>
              <Text style={{ fontSize: 20 }}>血型: {student.blood_type} </Text>
              <Text style={{ fontSize: 20 }}>地址: {student.address}</Text>
              <Text style={{ fontSize: 20 }}>家裡電話: {student.home_phone}</Text>
              <Text style={{ fontSize: 20 }}>（父）手機: {student.father_phone}</Text>
              <Text style={{ fontSize: 20 }}>（母）手機: {student.mother_phone}</Text>
            </View>
            <View style={{ flex: 1, flexDirection: 'row', paddingHorizontal: 30 }}>
              {student_unmarked.has(student_id) ? 
                <WellnessForm
                  student_id={student_id}
                  teacher_id={teacherOnDuty}
                  record_id={record_id}
                  autoFocus={true}
                />
              : null}
            </View>
          </View>

          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
            {student_unmarked.has(student_id) ?
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                <TouchableHighlight
                  style={{ backgroundColor: 'red', flex: 1, height: 60, justifyContent: 'center', alignItems: 'center', margin: 8 }}
                  onPress={this.props.hideModal}
                >
                  <Text style={{ fontSize: 30 }}>取消</Text>
                </TouchableHighlight>
                <TouchableHighlight
                  style={{ backgroundColor: 'grey', flex: 1, height: 60, justifyContent: 'center', alignItems: 'center', margin: 8 }}
                  onPress={() => this.handleSend(record_id)}
                >
                  <Text style={{ fontSize: 30 }}>送出</Text>
                </TouchableHighlight>
              </View>
              : null
            }
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
    // school: state.school,
    classes: state.school.classes,
    student_absent: state.school.student_absent,
    student_unmarked: state.school.student_unmarked,
    students: state.school.students,
    wellness: state.healthstatus,
    isConnected: state.school.isConnected
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    ...bindActionCreators({ sendWellnessDataFail, sendWellnessDataSuccess}, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps) (StudentModal)
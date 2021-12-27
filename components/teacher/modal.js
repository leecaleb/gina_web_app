import React from 'react'
import { View, Image, Text, TouchableHighlight, StyleSheet, KeyboardAvoidingView, Alert, Dimensions } from 'react-native'
import { Toast } from 'native-base'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import WellnessForm from './wellnessform'
import { sendWellnessData, formatDate } from '../util'
import { markPresent, sendWellnessDataFail } from '../../redux/school/actions/index'
import StudentModal from './studentmodal'
import TeacherModal from './teachermodal'

class Modal extends React.Component{
  constructor(props) {
    super(props)
    
  }

  // async handleSend(record_id) {
  //   const { wellness, class_id, isConnected } = this.props
  //   const { records } = wellness
  //   const record = records[record_id]
  //   if (record.temperature === '') {
  //     Alert.alert(
  //       '未填寫!',
  //       '',
  //       [{text: 'OK'}]
  //     )
  //     return
  //   }

  //   if (!isConnected) {
  //       Toast.show({
  //           text: '拍謝 網路連不到! 等一下再試試看',
  //           buttonText: 'Okay',
  //           position: "top",
  //           type: "warning",
  //           duration: 2000
  //       })
  //   }

  //   const sendDataResult = await sendWellnessData(wellness, class_id, formatDate(new Date()))
  //   if (sendDataResult.success) {
  //     sendDataResult.data.forEach(student_id => {
  //       this.props.markPresent(student_id, new Date)
  //     })
  //   } else {
  //     this.props.sendWellnessDataFail(sendDataResult.message)
  //   }
  // }

  render() {
    const { show, student_id, teacher_id, students, unmarked, absent, teacherOnDuty, class_id, school_id } = this.props
    if (!show) {
      return null
    }
    const student = students[student_id]
    return (
      <KeyboardAvoidingView
        style={{
          backgroundColor: 'transparent',
          justifyContent: 'flex-start',
          alignItems: 'center',
          zIndex: 2,
          position: 'absolute',
          width: '100%',
          height: '100%'
        }}
        behavior='height'
        enabled
      >
        <TouchableHighlight
          style={{
            backgroundColor: 'rgba(0,0,0,0.8)',
            width: '100%',
            height: '100%'
          }}
          onPress={this.props.hideModal}
        >
          <View></View>
        </TouchableHighlight>

        {student_id !== '' ?
          <StudentModal
            student_id={student_id}
            // teacher_id={teacher_id}
            teacherOnDuty={teacherOnDuty}
            class_id={class_id}
            school_id={school_id}
            // unmarked={unmarked}
            // absent={absent}
            fetchStudentAttendance={() => this.props.fetchStudentAttendance()}
            hideModal={this.props.hideModal}
          />
          : <TeacherModal 
              teacher_id={teacher_id}
              teacherOnDuty={teacherOnDuty}
              navigation={this.props.navigation}
              // class_id={class_id}
              // unmarked={unmarked}
              // absent={absent}
              fetchTeacherAttendance={() => this.props.fetchTeacherAttendance()}
              hideModal={this.props.hideModal}
            />
        }
        
      </KeyboardAvoidingView>
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
    students: state.school.students,
    // attendance: state.attendance,
    // wellness: state.healthstatus,
    isConnected: state.classInfo.isConnected
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    ...bindActionCreators({markPresent, sendWellnessDataFail}, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps) (Modal)
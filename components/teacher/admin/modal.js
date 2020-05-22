import React from 'react'
import { View, Image, Text, TouchableHighlight, StyleSheet, KeyboardAvoidingView, Alert, Dimensions } from 'react-native'
import { Toast } from 'native-base'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

const { width, height } = Dimensions.get('window')


class Modal extends React.Component{
  constructor(props) {
    super(props)
    
  }

  render() {
    // const { show, student_id, teacher_id, students, unmarked, absent, teacherOnDuty, class_id } = this.props
    const { show, component, modal_padding } = this.props
    if (!show) {
      return null
    }
    // console.log('student_id: ', student_id)
    // const student = students[student_id]
    // const { wellness } = this.props
    // const record_id = wellness.by_student_id[student_id][0]
    return (
      <KeyboardAvoidingView
        style={{
          backgroundColor: 'transparent',
          // justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2,
          position: 'absolute',
          width: '100%',
          height: '100%'
        }}
        // contentContainerStyle={{
        //   justifyContent: 'center',
        //   alignItems: 'center',
        //   zIndex: 2,
        //   position: 'absolute',
        //   width: '100%',
        //   height: '100%'
        // }}
        behavior='height'
        // keyboardVerticalOffset={-80}
        enabled
      >
        <TouchableHighlight
          style={{
            backgroundColor: 'rgba(0,0,0,0.8)',
            // opacity: 0.7,
            width: '100%',
            height: '100%'
          }}
          onPress={() => this.props.hideModal()}
        >
          <View></View>
        </TouchableHighlight>

        <View style={{ flex: 1, marginTop: modal_padding, width: width/2, height, backgroundColor: 'white', zIndex: 3,
            position: 'absolute' }}>
                {component}
        </View>
        
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
    isConnected: state.school.isConnected
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    ...bindActionCreators({}, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps) (Modal)
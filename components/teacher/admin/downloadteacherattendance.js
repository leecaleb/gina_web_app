import React from 'react'
import { View, ScrollView, TouchableHighlight, Image, Text, Platform, Alert } from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { put, delete_by_id, get } from '../../util'
import { updateTeacherProfilePicture, fetchTeachersSuccess, deleteTeacher  } from '../../../redux/school/actions/index'


export default class DownloadTeacherAttendance extends React.Component{
  constructor(props) {
    super(props)
    this.state={
      showModal: false,
      modal_type: ''
    }
  }

  componentDidMount() {
    const { school_name, school_id } = this.props.route.params
    console.log('school_name, school_id: ', school_name, school_id)

  }

  render() {
    return (
        <ScrollView contentContainerStyle={{ alignItems: 'center', justifyContent: 'center'}}>
            {/* <TouchableHighlight
                style={{
                    width: '80%',
                    padding: 50,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#b5e9e9',
                    marginVertical: 20
                }}
                onPress={()=> this.handleNavigate('Registration')}
                underlayColor="#368cbf"
            >
                <Text style={{ fontSize: 70 }}>教師出勤</Text>
            </TouchableHighlight> */}
        </ScrollView>
    )
  }
}
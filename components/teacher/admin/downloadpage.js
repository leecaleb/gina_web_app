import React from 'react'
import { View, ScrollView, TouchableHighlight, Image, Text, Platform, Alert } from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { put, delete_by_id, get } from '../../util'
import { updateTeacherProfilePicture, fetchTeachersSuccess, deleteTeacher  } from '../../../redux/school/actions/index'


export default class DownloadPage extends React.Component{
  constructor(props) {
    super(props)
    this.state={
      showModal: false,
      modal_type: ''
    }
  }

  componentDidMount() {
  }

  handleNavigate(pageName) {
    const { school_name, school_id } = this.props.route.params
    this.props.navigation.navigate(pageName, { school_name, school_id })
  }

  render() {
    return (
        <ScrollView contentContainerStyle={{ alignItems: 'center', justifyContent: 'space-around'}}>
            <TouchableHighlight
                style={{
                    width: '80%',
                    padding: 50,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#b5e9e9',
                    marginVertical: 20
                }}
                onPress={()=> this.handleNavigate('DownloadTeacherAttendance')}
                underlayColor="#368cbf"
            >
                <Text style={{ fontSize: 70 }}>學生出勤表</Text>
            </TouchableHighlight>

            <TouchableHighlight
                style={{
                    width: '80%',
                    padding: 50,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#b5e9e9',
                    marginVertical: 20
                }}
                onPress={()=> this.handleNavigate('DownloadTeacherAttendance')}
                underlayColor="#368cbf"
            >
                <Text style={{ fontSize: 70 }}>教師出勤表</Text>
            </TouchableHighlight>
        </ScrollView>
    )
  }
}
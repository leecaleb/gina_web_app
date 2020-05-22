import React from 'react'
import { View, ScrollView, TouchableHighlight, Image, Text, Platform, Alert } from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import { put, delete_by_id, get } from '../../util'
import { updateTeacherProfilePicture, fetchTeachersSuccess  } from '../../../redux/school/actions/index'
import Modal from './modal'
import AddTeacher from './addteacher';
import EditTeacher from './editteacher';

/*
Page where we view and edit Teacher profiles:
  -creating teacher profile
  -editing teacher profile
  -removing teacher profile
*/

class Teachers extends React.Component{
  constructor(props) {
    super(props)
    this.state={
      showModal: false,
      modal_type: '',
      selected_teacher_id: ''
    }
  }

  componentDidMount() {
    this.getPermissionAsync()
  }

  getPermissionAsync = async () => {
    if (Platform.OS === 'ios') {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (status !== 'granted') {
        alert(`Sorry, we need camera roll permissions to make this work!`)
        return 
      }
    }
  };

  _pickImage = async (teacher_id, url) => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [1,1],
        quality: 0.4,
        base64: true
      });
      if (!result.cancelled) {
        const { base64 } = result
        this.getProfilePictureURL(base64, teacher_id, url)
      }
      // console.log(result);
    } catch (E) {
      console.log(E);
    }
  };

  async getProfilePictureURL(image, teacher_id, url) {
    const { school_name } = this.props.route.params
    const { teachers } = this.props
    const body = {
      image,
      url,
      path: `${school_name}/teacher/profile_picture_${teacher_id}_${(new Date()).getMilliseconds()}.jpg`
    }
    const response = await put(`/user/${teacher_id}/profile-picture`, body)
    // console.log(response)
    const { success, statusCode, message, data } = response
    if (!success) {
      alert(`Sorry ${teachers[teacher_id].name}照片上傳時電腦出狀況了！請截圖和與工程師聯繫\n\n` + message)
      return 
    }
    this.props.updateTeacherProfilePicture(teacher_id, data.image_url)
  }

  async fetchTeacherData() {
    const { school_id } = this.props.route.params
    const response = await get(`/school/${school_id}/teacher`)
    const { success, statusCode, message, data } = response
    if (!success) {
        alert('Sorry 取得教師資料時電腦出狀況了！請截圖和與工程師聯繫\n\n' + message)
        return 
    }

    const {admins, teachers, classes} = data
    this.props.fetchTeachersSuccess(admins, teachers, classes)
}

  getModalContent() {
    const { school_id } = this.props.route.params
    const { classes, teachers } = this.props
    const { modal_type, selected_teacher_id } = this.state
    if (modal_type === 'add_teacher') {
      return <AddTeacher
                classes={classes}
                school_id={school_id}
                fetchTeacherData={() => this.fetchTeacherData()}
                goBack={() => this.hideModal()}
            />
    } else if (modal_type === 'edit_teacher') {
      return <EditTeacher
                classes={classes}
                teacher_id={selected_teacher_id}
                teacher={teachers[selected_teacher_id]}
                fetchTeacherData={() => this.fetchTeacherData()}
                goBack={() => this.hideModal()}
            />
    }
  }

  hideModal() {
    this.setState({
      showModal: false
    })
  }

  confirmDeleteTeacher(teacher_id) {
    const {teachers} = this.props
    const confirmed = confirm(`${teachers[teacher_id].name} 刪除確認`)
    if (confirmed) {
      this.deleteTeacher(teacher_id)
    }
  }

  async deleteTeacher(teacher_id) {
    const response = await delete_by_id(`/user/${teacher_id}`)
    const { success, statusCode, message, data } = response
    if (!success) {
      alert(`Sorry ${teachers[teacher_id].name}刪除時電腦出狀況了！請截圖和與工程師聯繫\n\n` + message)
      return 
    }
    this.fetchTeacherData()
  }

  render() {
    const { teachers } = this.props
    const { showModal } = this.state
    return (
      <View>
        <Modal
          show={showModal}
          component={this.getModalContent()}
          hideModal={() => this.hideModal()}
        />
        <ScrollView>
          <View style={{ padding: 20 }}>
            <TouchableHighlight
              style={{ padding: 10, alignSelf: 'flex-end', backgroundColor: '#ffddb7' }}
              onPress={() => this.setState({ showModal: true, modal_type: 'add_teacher' })}
            >
              <Text style={{ fontSize: 40 }}>新增教師</Text>
            </TouchableHighlight>
          </View>
          {Object.keys(teachers).map((id, index) => {
            const teacher = teachers[id]
            return (
              <View key={id} style={{ flex:1, backgroundColor: 'lightgrey', flexDirection: 'row', marginBottom: 10, padding: 15 }}>
                {/* profile picture */}
                <TouchableHighlight
                  style={{ }}
                  onPress={() => this._pickImage(id, teacher.profile_picture)}
                >
                  <Image
                    source={
                      teacher.profile_picture === '' ?
                        require('../../../assets/icon-teacher-thumbnail.png')
                        : {uri: teacher.profile_picture}
                    }
                    style={{
                      width: 200,
                      height: 200,
                      borderRadius: 100
                    }}
                  />
                </TouchableHighlight>
                
                <View style={{ flex: 5, paddingLeft: 15 }}>
                  {/* Name */}
                  <View>
                    <Text style={{ fontSize: 50 }}>{teacher.name}</Text>
                  </View>
                </View>

                {/* Right */}
                <View style={{ flex: 1, justifyContent: 'space-evenly' }}>
                  <View style={{ backgroundColor: 'white' }}>
                    <TouchableHighlight
                      style={{padding: 15, justifyContent: 'center'}}
                      onPress={() => this.setState({ showModal: true, modal_type: 'edit_teacher', selected_teacher_id: id })}
                    >
                      <Text style={{ fontSize: 25, alignSelf: 'center' }}>編輯</Text>
                    </TouchableHighlight>
                  </View>

                  <View style={{ backgroundColor: '#fa625f' }}>
                    <TouchableHighlight
                      style={{padding: 15, justifyContent: 'center'}}
                      onPress={() => this.confirmDeleteTeacher(id)}
                    >
                      <Text style={{ fontSize: 25, alignSelf: 'center' }}>刪除</Text>
                    </TouchableHighlight>
                  </View>

                </View>
              </View>
            )
          })}
        </ScrollView>
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    teachers: state.school.teachers,
    classes: state.school.classes
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    ...bindActionCreators({
      updateTeacherProfilePicture,
      fetchTeachersSuccess
    }, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps) (Teachers)
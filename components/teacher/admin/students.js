import React from 'react'
import { View, TouchableHighlight, Image, Text, ScrollView, Platform, Alert, Dimensions } from 'react-native'
import { connect } from 'react-redux'
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import { bindActionCreators } from 'redux';
import { updateProfilePicture, fetchStudentsSuccess, editStudentSuccess } from '../../../redux/school/actions/index'
import { get, post, delete_by_id } from '../../util'
import Modal from './modal'
import EditStudentProfile from './editstudentprofile'
import AddParent from './addparent';
import QRPage from './qrpage';

const { width, height } = Dimensions.get('window')
/* 
Page where we view/edit class information including:
  -adding/removing class
  -adding/removing/switching students
  -adding/removing/switching teachers
*/
// const editStudent = 
//     <View>
//       <Text>Student</Text>
//     </View>

class Students extends React.Component{
  constructor(props) {
    super(props)
    this.state={
      showModal: false,
      modal_type: '',
      student_id: '',
      parent_data: {},
      qr_data: '',
      modal_padding: 0
    }
  }

  componentDidMount() {
    this.getPermissionAsync();
  }

  getPermissionAsync = async () => {
    if (Platform.OS === 'ios') {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
      }
    }
  };

  _pickImage = async (student_id, url) => {
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
        // this.setState({ image: result.uri });
        this.getProfilePictureURL(base64, student_id, url)
      }

      // console.log(result);
    } catch (E) {
      console.log(E);
    }
  };

  async getProfilePictureURL(image, student_id, url) {
    const { school_name } = this.props.route.params
    const { students } = this.props
    const body = {
      image,
      url,
      path: `${school_name}/profile_picture_${student_id}_${(new Date()).getMilliseconds()}.jpg`
    }
    const response = await post(`/student/${student_id}/profile-picture`, body)
    // console.log(response)
    const { success, statusCode, message, data } = response
    if (!success) {
      alert(`Sorry ${students[student_id].name}照片上傳時電腦出狀況了！請截圖和與工程師聯繫\n\n` + message)
      return 
    }
    this.props.updateProfilePicture(student_id, data.image_url)
  }

  getModalContent() {
    const { students, classes } = this.props
    const { showModal, modal_type, student_id, parent_data, qr_data } = this.state
    // console.log('students: ', students)
    if (!showModal) {
      return null
    } else if (modal_type === 'student') {
      return <EditStudentProfile
              student_id={student_id}
              student={students[student_id]}
              classes={classes}
              addParent={(parent_data) => this.setState({
                modal_type: 'add_parent',
                parent_data
              })}
              editStudentSuccess={(student_id, name, old_class_id, class_id) => 
                this.props.editStudentSuccess(student_id, name, old_class_id, class_id)
              }
              hideModal={() => this.hideModal()}
            />
    } else if (modal_type === 'add_parent') {
      return <AddParent
              student_id={student_id}
              parent_data={parent_data}
              viewQRCode={(qr_data) => this.setState({
                modal_type: 'qrpage',
                qr_data
              })}
              goBack={() => this.setState({
                modal_type: 'student'
              })}
            />
    } else { // modal_type: 'qrpage'
      return <QRPage
              qr_data={qr_data}
              student_name={students[student_id].name}
              parent_data={parent_data}
              goBack={() => this.setState({
                modal_type: 'add_parent'
              })}
            />
    }
  }

  hideModal() {
    this.setState({
      showModal: false
    })
  }

  confirmDeleteStudent(student_id) {
    const {students} = this.props
    Alert.alert(
      `${students[student_id].name} 刪除確認`,
      '刪除這個寶貝會將一切攸關資料(包誇父母)刪除',
      [
        { text: "取消", style: "cancel"},
        { text: 'OK', onPress: () => this.deleteStudentById(student_id) }
      ]
    )
  }

  async deleteStudentById(student_id) {
    const { students } = this.props
    const response = await delete_by_id(`/student/${student_id}/`)
    const { success, statusCode, message, data } = response
    if (!success) {
      alert(`Sorry ${students[student_id].name}照片上傳時電腦出狀況了！請截圖和與工程師聯繫\n\n` + message)
      return 
    }
    this.fetchStudentData()
  }

  async fetchStudentData() {
    const { school_id } = this.props.route.params
    const response = await get(`/school/${school_id}/student`)
    const { success, statusCode, message, data } = response
    if (!success) {
        alert('Sorry 取得學生資料時電腦出狀況了！請截圖和與工程師聯繫\n\n' + message)
        return 
    }

    const {students, classes} = data
    this.props.fetchStudentsSuccess(students, classes)
  }

  render() {
    const { students } = this.props
    const { showModal, modal_padding } = this.state
    // console.log('students: ', students)
    return (
      <View>
        <Modal
          modal_padding={modal_padding}
          show={showModal}
          component={this.getModalContent()}
          hideModal={() => this.hideModal()}
        />
        <ScrollView>
          {Object.keys(students).map((id, index) => {
            const student = students[id]
            return (
              <View key={id} style={{ flex:1, backgroundColor: 'lightgrey', flexDirection: 'row', marginBottom: 10, padding: 15 }}>
                {/* profile picture */}
                <TouchableHighlight
                  style={{ }}
                  onPress={() => this._pickImage(id, student.profile_picture)}
                >
                  <Image
                    source={
                        student.profile_picture === '' ?
                            require('../../../assets/icon-thumbnail.png')
                            : {uri: student.profile_picture}
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
                    <Text style={{ fontSize: 50 }}>{student.name}</Text>
                  </View>

                  {/* Address */}
                  <View>
                    <Text style={{ fontSize: 20 }}>地址: {student.address}</Text>
                  </View>

                  {/* Father phone */}
                  <View>
                    <Text style={{ fontSize: 20 }}>手機(父): {student.father_phone}</Text>
                  </View>

                  {/* Mother phone */}
                  <View>
                    <Text style={{ fontSize: 20 }}>手機(母): {student.mother_phone}</Text>
                  </View>
                </View>

                {/* Right */}
                <View style={{ flex: 1, justifyContent: 'space-evenly' }}>
                  <View style={{ backgroundColor: 'white' }}>
                    <TouchableHighlight
                      style={{padding: 15, justifyContent: 'center'}}
                      onPress={(event) => this.setState({ 
                        showModal: true, 
                        modal_type: 'student', 
                        student_id: id,
                        modal_padding: Math.max(0, event.nativeEvent.pageY - height)
                      })}
                    >
                      <Text style={{ fontSize: 25, alignSelf: 'center' }}>編輯</Text>
                    </TouchableHighlight>
                  </View>

                  <View style={{ backgroundColor: '#fa625f' }}>
                    <TouchableHighlight
                      style={{padding: 15, justifyContent: 'center'}}
                      onPress={() => this.confirmDeleteStudent(id)}
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
    students: state.school.students,
    classes: state.school.classes
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    ...bindActionCreators({
      updateProfilePicture,
      fetchStudentsSuccess,
      editStudentSuccess,
    }, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps) (Students)
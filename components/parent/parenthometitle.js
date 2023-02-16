import React from 'react'
import { View, TouchableOpacity, Image, Text, TouchableHighlight, Platform} from 'react-native'
import { Card } from 'native-base'
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import { post } from '../util';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux'
import { editProfilePicture } from '../../redux/parent/actions/index'

class ParentHomeTitle extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      temperature: '',
      borderRadius: 0
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

  componentDidUpdate(prevProps) {
    if (this.props.temperature !== prevProps.temperature) {
      this.setState({ temperature: this.props.temperature })
    }
  }

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
        const { uri } = result
        this.getProfilePictureURL(uri.replace(/^data:image\/\w+;base64,/, ""), student_id, url)
      }
    } catch (E) {
      console.log(E);
    }
  };

  async getProfilePictureURL(image, student_id, url) {
    const { student_name, student } = this.props
    const body = {
      image: image,
      url: url,
      path: `${student.school_name}/profile_picture_${student_id}_${(new Date()).getMilliseconds()}.jpg`
    }
    const response = await post(`/student/${student_id}/profile-picture`, body)
    const { success, statusCode, message, data } = response
    if (!success) {
      alert(`Sorry ${student_name}照片上傳時電腦出狀況了！請截圖和與工程師聯繫\n\n` + message)
      return 
    }
    this.props.editProfilePicture(student_id, data.image_url)
  }

  render() {
    const { temperature, borderRadius } = this.state
    const { student_id, student, student_name } = this.props
    return (
      <View style={{ width: '97%', marginLeft: '3%', alignSelf: 'flex-start', flexDirection: 'row'}}>
        <Card style={{ flexDirection: 'row', width: '85%', alignItems: 'center', paddingVertical: 15 }}>
          <TouchableHighlight 
            style={{
              flex: 1,
              width: '50%',
              alignItems: 'center'
            }}
            onLayout={(event) => {
              var {width} = event.nativeEvent.layout
              this.setState({ borderRadius: width/2})
            }}
            onPress={() => this._pickImage(student_id, student.profile_picture)}
          >
            <Image
                source={
                    student.profile_picture === '' ?
                        require('../../assets/icon-thumbnail.png')
                        : { uri: student.profile_picture }
                    }
                style={
                  student.profile_picture === '' ?
                    { width: 130, height: 130 }
                    : { width: 130, height: 130, borderRadius: 65 }
                }
                
            />
          </TouchableHighlight>
          <View style={{ height: '90%', width: '50%', paddingLeft: 10 }}>
            <View style={{ flex: 1}}>
              <View style={{ height: '50%', alignItems: 'flex-start', justifyContent: 'flex-end' }}>
                  <Text style={{ fontSize: 40 }}>{student_name}</Text>
              </View>
              <View style={{ flex: 1, flexDirection: 'row', paddingTop: 5 }}>
                <View style={{ flex: 1, height: '100%', backgroundColor: '#F5F5F5', justifyContent: 'center' }}>
                  <Text style={{ padding: 5 }}>早上體溫</Text>
                  <Text style={{ fontSize: 30, textAlign: 'center' }}>
                    {temperature === '' ? '未量' : `${temperature}°`}
                  </Text>
                </View>
                <TouchableOpacity
                  style={{ backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' }}
                  onPress={() => this.props.viewQRCode()}
                >
                  <Image
                    source={require('../../assets/icon-qr.png')}
                    style={{
                        width: 65,
                        height: 65,
                    }}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Card>
        <Card style={{ width: '20%'}}>
          <TouchableOpacity
            style={{ flex: 1, justifyContent: 'center', paddingLeft: 5 }}
            underlayColor='#F5F5F5'
            onPress={() => this.props.selectOtherChildProfile()}
          >
            <Image
              source={require('../../assets/icon-babies.png')}
              style={{
                width: 43,
                height: 43,
                opacity: 0.6
              }}
            />
          </TouchableOpacity>
        </Card>
      </View>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    ...bindActionCreators({
      editProfilePicture
    }, dispatch)
  }
}

export default connect(null, mapDispatchToProps) (ParentHomeTitle)
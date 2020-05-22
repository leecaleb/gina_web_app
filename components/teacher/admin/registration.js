import React from 'react'
import { View, TextInput, TouchableHighlight, Text, Alert, KeyboardAvoidingView } from 'react-native'
// import Auth from '@aws-amplify/auth'
import Reloading from '../../reloading'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import RegisterNewStudents from './registernewstudents'
import RegisterParents from './registerparents'
import { ScrollView } from 'react-native-gesture-handler'
import { fetchStudentsSuccess } from '../../../redux/school/actions/index'
import { get } from '../../util'

/*
1. Page where we connect parents to amplify for their login:
  Auth.signUp({
    username: 'USERNAME',
    password: 'PASSWORD',
    attributes: {
        given_name: 'John',
        family_name: 'Smith',
        email: 'EMAIL@email.com'
    }
  })

2. Save their credential in database in table users:
  -id: 'UUID',
  -firstName: 'John',
  -lastName: 'Smith',
  -email: 'EMAIL@email.com',
  -username: 'USERNAME',
  -role: 'parent'

3. And initialize child/ren's data in database including but not limited to 
  -first_name,
  -last_name,
  -profile_picture,
  -class_id <<====== list all classes and assign a class_id to child/ren

****Leave sign up confirmation to parent side of the app(first time sign in)****

*/
class Registration extends React.Component{
  constructor(props) {
    super(props)
    this.state = {
      
      
      parentSignUpStatus: [false],
      createFamilyProfileStatus: 'not_created'
    }
  }

  componentDidMount() {
    //  fetch class info for class assinment or get it from redux store
  }

  

  createFamilyProfile() {
    let all_parents_signed_up = true
    let parentSignUpStatus = this.refs['parent'].getParentSignUpStatus()
    parentSignUpStatus.forEach(status => {
      all_parents_signed_up &= status
    })

    if (!all_parents_signed_up) {
      alert('Error! We cannot create family profile until all parents have been signed up')
      return
    }

    let parentDataArray = this.refs['parent'].getParentDataArray()
    let studentDataArray = this.refs['student'].getStudentDataArray()

    this.setState({
      createFamilyProfileStatus: 'creating'
    })

    fetch('https://iejnoswtqj.execute-api.us-east-1.amazonaws.com/dev/family/', {
      method: 'POST',
      headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        parentDataArray,  //name, email, username, role
        studentDataArray  //name, class_id, profile_picture, blood_type
      })
    })
    .then((response) => response.json())
    .then((resJson) => {
      // console.log(resJson)
      if (resJson.statusCode > 200 || resJson.message === 'Internal server error') {
        alert('Error!' + resJson.message)
      } else {
        this.fetchStudentData()
        Alert.alert(
          '註冊成功!',
          '點選OK以離開頁面',
          [
              { text: 'OK', onPress: () => this.props.navigation.goBack()}
          ]
        )
        this.setState({
          createFamilyProfileStatus: 'created'
        })
      }
    })
    .catch((err) => {
      console.error(err)
    })
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
    const { studentDataArray, parentDataArray, parentSignUpStatus, createFamilyProfileStatus } = this.state
    // console.log(this.props.classes)
    return (
      <KeyboardAvoidingView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ScrollView style={{ width: '100%'}}>

          <RegisterNewStudents 
            ref="student"
            classes={this.props.classes}
          />

          <RegisterParents ref="parent" />

          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-around' }}>
            <TouchableHighlight
              style={{
                flex: 1,
                padding: 20,
                backgroundColor: createFamilyProfileStatus === 'not_created' ?
                  '#b5e9e9'
                  : createFamilyProfileStatus === 'creating' ?
                    '#b5e9e9'
                  : '#00c07f',
                  justifyContent: 'center'
              }}
              onPress={() => this.createFamilyProfile()}
            >
              {createFamilyProfileStatus === 'not_created' ?
                <Text style={{ fontSize: 50, textAlign: 'center' }}>完成</Text>
                : createFamilyProfileStatus === 'creating' ?
                  <Reloading />
                : <Text style={{ fontSize: 50 }}>SUCCESS</Text>
              }
            </TouchableHighlight>

            <TouchableHighlight
              style={{ flex:1, padding: 20, backgroundColor: '#fa625f', justifyContent: 'center' }}
              onPress={() => this.props.navigation.goBack()}
            >
              <Text style={{ fontSize: 50, textAlign: 'center'}}>返回</Text>
            </TouchableHighlight>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    classes: state.school.classes
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    ...bindActionCreators({fetchStudentsSuccess}, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps) (Registration)
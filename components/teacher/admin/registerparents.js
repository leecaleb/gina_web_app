import React from 'react'
import { View, Text, TouchableHighlight, TextInput, Alert, Picker } from 'react-native'
import Auth from '@aws-amplify/auth'

export default class RegisterParents extends React.Component {
  constructor(props) {
    super(props)
    this.state={
        parentDataArray: [{
            name: '',
            email: '', 
            username: '',
            password: '',
            role: '父',
            mobile: '',
            address: '',
            work_phone: '',
            transportation: ''
        }],
        parentSignUpStatus: [false],
    }
  }

  addParent() {
    const { parentDataArray, parentSignUpStatus } = this.state
    parentDataArray.push({
      name: '',
      email: '', 
      username: '',
      password: '',
      role: '父',
      mobile: '',
      address: '',
      work_phone: '',
      transportation: ''
    })

    parentSignUpStatus.push(false)

    this.setState({
      parentDataArray,
      parentSignUpStatus
    })
  }

  fillParent() {
    const { parentDataArray } = this.state
    parentDataArray[0] = {
      name: 'Jane Smith',
      email: 'caleb7947@gmail.com', 
      username: 'abc123',
      password: 'password',
      role: 'parent#mother',
      mobile: '061234567',
      address: 'SOME ADDRESS',
      work_phone: '061234567',
      transportation: 'car'
    }
    this.setState({
      parentDataArray
    })
  }

  setName(name, index) {
    const { parentDataArray } = this.state
    parentDataArray[index].name = name
    this.setState({
        parentDataArray
    })
  }

  setRole(role, index) {
    const { parentDataArray } = this.state
    parentDataArray[index].role = role
    this.setState({
        parentDataArray
    })
  }

  setEmail(email, index) {
    const { parentDataArray } = this.state
    parentDataArray[index].email = email
    this.setState({
        parentDataArray
    })
  }

  setUsername(username, index) {
    const { parentDataArray } = this.state
    parentDataArray[index].username = username
    this.setState({
        parentDataArray
    })
  }

  toLowerCase(event, index) {
      const { text } = event.nativeEvent
      const { parentDataArray } = this.state
      const username = text.toLowerCase()
      parentDataArray[index].username = username
      this.setState({ parentDataArray })
  }

  setPassword(password, index) {
    const { parentDataArray } = this.state
    parentDataArray[index].password = password
    this.setState({
        parentDataArray
    })
  }

  removeParent(index) {
      const { parentDataArray, parentSignUpStatus } = this.state
      parentDataArray.splice(index, 1)
      parentSignUpStatus.splice(index, 1)
      this.setState({
          parentDataArray,
          parentSignUpStatus
      })
  }

  handleSignup(index) {
    const { name, email, username, password } = this.state.parentDataArray[index]

    Auth.signUp({
      username,
      password,
      attributes: {
          name,
          email
      }
    })
      .then(values => {
        // console.log(values)
        const { parentSignUpStatus } = this.state
        parentSignUpStatus[index] = true
        this.setState({
          parentSignUpStatus
        })
      })
      .catch(err => {
        alert('註冊有問題!請與工程師聯繫\n\n' + err.message)
    })
  }

  getParentSignUpStatus() {
      return this.state.parentSignUpStatus
  }

  getParentDataArray() {
      return this.state.parentDataArray
  }

  render() {
    const { parentDataArray, parentSignUpStatus } = this.state
    // console.log('parentDataArray: ', parentDataArray)
    return (

        <View style={{ width: '100%', padding: '5%', backgroundColor: '#f4d41f' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 5, backgroundColor: 'rgba(255,255,255,0.4)' }}>
          <Text style={{ fontSize: 60 }}>家長資料</Text>
          <TouchableHighlight
            style={{ padding: 10, backgroundColor: '#b5e9e9' }}
            onPress={() => this.addParent()}
          >
            <Text style={{ fontSize: 35 }}>新增家長</Text>
          </TouchableHighlight>

          {/* <TouchableHighlight
            style={{ padding: 10, backgroundColor: '#b5e9e9' }}
            onPress={() => this.fillParent()}
          >
            <Text style={{ fontSize: 20 }}>Fill Parent</Text>
          </TouchableHighlight> */}
        </View>
        
        {parentDataArray.map((parent, index) => {
          const { name, email, username, password, role, mobile, address, work_phone, transportation } = parent
          return (
            <View
              key={index}
              style={{padding: 10, backgroundColor: 'white', marginBottom: 20 }}
            >
              {/* FIRST ROW */}
              <View 
                style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: '5%' }}
              >
                <View
                  style={{
                    width: '50%',
                    padding: 10,
                    backgroundColor: '#F5F5F5',
                    borderRadius: 2,
                    borderBottomWidth: 2,
                    borderBottomColor: '#b5e9e9',
                    justifyContent: 'center',
                }}>
                  <TextInput
                    placeholder="全名"
                    value={name}
                    style={{ fontSize: 30 }}
                    onChangeText={(name) => this.setName(name, index)}
                  />
                </View>

                <View
                  style={{
                    width: '20%',
                    padding: 10,
                    backgroundColor: '#F5F5F5',
                    borderRadius: 2,
                    borderBottomWidth: 2,
                    borderBottomColor: '#b5e9e9',
                    justifyContent: 'center'
                }}>
                  {/* <TextInput
                    placeholder="父/母"
                    value={role.charAt(role.length-1)}
                    style={{ fontSize: 30 }}
                    onChangeText={(role) => this.setRole(role, index)}
                  /> */}
                  <Picker
                    selectedValue={role}
                    style={{ height: 50 }}
                    onValueChange={(itemValue, itemIndex) => this.setRole(itemValue, index)}
                  >
                    <Picker.Item label="父" value="父" />
                    <Picker.Item label="母" value="母" />
                  </Picker>
                </View>

                <TouchableHighlight
                  style={{
                    width: '20%',
                    padding: 10,
                    backgroundColor: '#fa625f',
                    borderRadius: 2,
                    justifyContent: 'center'
                  }}
                  onPress={() => this.removeParent(index)}
                >
                  <Text style={{ alignSelf: 'center', fontSize: 30 }}>移除</Text>
                </TouchableHighlight>

              </View>

              {/* SECOND ROW */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: '5%' }}>

                <View
                  style={{
                    width: '100%',
                    padding: 10,
                    backgroundColor: '#F5F5F5',
                    borderRadius: 2,
                    borderBottomWidth: 2,
                    borderBottomColor: '#b5e9e9',
                    justifyContent: 'center'
                }}>
                  <TextInput
                    placeholder="Email"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={email}
                    style={{ fontSize: 30 }}
                    onChangeText={(email) => this.setEmail(email, index)}
                  />
                </View>
              </View>

              {/* THIRD ROW */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: '5%' }}>
                <View
                  style={{
                    width: '35%',
                    padding: 10,
                    backgroundColor: '#F5F5F5',
                    borderRadius: 2,
                    borderBottomWidth: 2,
                    borderBottomColor: '#b5e9e9',
                    justifyContent: 'center'
                }}>
                  <TextInput
                    placeholder="帳號"
                    autoCapitalize="none"
                    value={username}
                    style={{ fontSize: 30 }}
                    onChangeText={(username) => this.setUsername(username, index)}
                    onEndEditing={(username) => this.toLowerCase(username, index)}
                  />
                </View>

                <View
                  style={{
                    width: '35%',
                    padding: 10,
                    backgroundColor: '#F5F5F5',
                    borderRadius: 2,
                    borderBottomWidth: 2,
                    borderBottomColor: '#b5e9e9',
                    justifyContent: 'center'
                }}>
                  <TextInput
                    secureTextEntry
                    placeholder="密碼"
                    value={password}
                    style={{ fontSize: 30 }}
                    onChangeText={(password) => this.setPassword(password, index)}
                  />
                </View>

                <TouchableHighlight
                  style={{
                    width: '20%',
                    padding: 5,
                    backgroundColor: parentSignUpStatus[index] ? '#dcf3d0' : '#ffe1d0',
                    justifyContent: 'center'
                  }}
                  onPress={() => this.handleSignup(index)}
                  disable={parentSignUpStatus[index]}
                >
                  {parentSignUpStatus[index] ?
                    <Text style={{ fontSize: 20 }}>SUCCESS</Text>
                    : <Text style={{ fontSize: 35, alignSelf: 'center' }}>註冊</Text>
                  }
                </TouchableHighlight>
              </View>
            </View>
          )
        })}
      </View>
    )
  }
}
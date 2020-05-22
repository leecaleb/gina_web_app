import React from 'react'
import { View, Text, TouchableHighlight, TextInput } from 'react-native'
import PickerComponent from '../../picker'

export default class RegisterNewStudents extends React.Component {
  constructor(props) {
    super(props)
    this.state={
      studentDataArray: [{
        name: '',
        class_id: '',
        class_name: '',
        profile_picture: '',
        blood_type: ''
      }],
    }
  }

  addStudent() {
    const { studentDataArray } = this.state
    studentDataArray.push({
      name: '',
      class_id: '',
      class_name: '',
      profile_picture: '',
      blood_type: ''
    })
    this.setState({
      studentDataArray
    })
  }

  fillStudent() {
    const { studentDataArray } = this.state
    studentDataArray[0] = {
        name: 'John Smith',
        class_id: null,
        profile_picture: '',
        blood_type: 'AB'
    }
    this.setState({
      studentDataArray
    })
  }

  setName(name, index) {
    const { studentDataArray } = this.state
    studentDataArray[index].name = name
    this.setState({
      studentDataArray
    })
  }

  setBloodType(type, index) {
    const {studentDataArray} = this.state
    studentDataArray[index].blood_type = type
    this.setState({
      studentDataArray
    })
  }

  removeStudent(index) {
    const { studentDataArray} = this.state
    studentDataArray.splice(index, 1)
    this.setState({
      studentDataArray
    })
  }

  handleSelectClass(class_name, index) {
    // console.log(class_name)
    const {classes } = this.props
    const { studentDataArray } = this.state
    var class_id = ''
    for (var i = 0; i < Object.keys(classes).length; i++) {
      const found_class_id = Object.keys(classes)[i]
      if (classes[found_class_id].name === class_name) {
        class_id = found_class_id
        break
      }
    }
    
    studentDataArray[index].class_id = class_id
    studentDataArray[index].class_name = class_name
    this.setState({
      studentDataArray
    })
  }

  getStudentDataArray() {
    return this.state.studentDataArray
  }

  render() {
    const { studentDataArray } = this.state
    const { classes } = this.props
    const options = Object.keys(classes).map(class_id => classes[class_id].name)
    // console.log('studentDataArray: ', studentDataArray)
    return (
      <View style={{ width: '100%', padding: '5%', backgroundColor: '#368cbf' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 5, backgroundColor: 'rgba(255,255,255,0.4)' }}>
            <Text style={{ fontSize: 60 }}>學生資料</Text>
            <TouchableHighlight
              style={{ padding: 10, backgroundColor: '#b5e9e9' }}
              onPress={() => this.addStudent()}
            >
              <Text style={{ fontSize: 35 }}>新增學生</Text>
            </TouchableHighlight>

            {/* <TouchableHighlight
              style={{ padding: 10, backgroundColor: '#b5e9e9' }}
              onPress={() => this.fillStudent()}
            >
              <Text style={{ fontSize: 30 }}>Fill Student</Text>
            </TouchableHighlight> */}
          </View>
          
          {studentDataArray.map((student, index) => {
            const { name, blood_type } = student
            return (
              <View key={index} style={{ width: '100%', padding: '5%', backgroundColor: '#f4d41f' }}>
                <View
                  style={{ flexDirection: 'row', padding: 10, backgroundColor: 'white', justifyContent: 'space-between' }}
                >
                  <View
                    style={{
                      width: '50%',
                      padding: 10,
                      backgroundColor: '#F5F5F5',
                      borderRadius: 2,
                      borderBottomWidth: 2,
                      borderBottomColor: '#b5e9e9',
                      justifyContent: 'center'
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
                    <TextInput
                      placeholder="血型"
                      value={blood_type}
                      style={{ fontSize: 30 }}
                      onChangeText={(type) => this.setBloodType(type, index)}
                    />
                  </View>

                  <TouchableHighlight
                    style={{
                      width: '20%',
                      padding: 10,
                      backgroundColor: '#fa625f',
                      borderRadius: 2,
                      // borderBottomWidth: 2,
                      // borderBottomColor: '#b5e9e9',
                      justifyContent: 'center'
                    }}
                    onPress={() => this.removeStudent(index)}
                  >
                    <Text style={{ alignSelf: 'center', fontSize: 30 }}>移除</Text>
                  </TouchableHighlight>
                </View>

                <View style={{ padding: 10, backgroundColor: 'white' }}>
                  <PickerComponent
                    style={{
                      padding: 10, 
                      backgroundColor: '#b5e9e9'
                    }}
                    textStyle={{ fontSize: 30 }}
                    selectedValue={studentDataArray[index].class_name || '選擇學生班級'}
                    options={options}
                    handleOnClick={() => { }}
                    handleSelectValue={(class_name) => this.handleSelectClass(class_name, index)}
                  />
                </View>
              </View>
            )
          })}
          
        </View>
    )
  }
}
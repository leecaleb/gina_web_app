import React from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableHighlight,
  Image,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Alert
} from 'react-native'
import { Card, Toast } from 'native-base'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {
  writeToAll,
  writeToOne,
  remindItemsToBringToAll,
  remindItemsToBringToOne,
  recordActivitiesForAll,
  recordActivitiesForOne,
  writeItemToBringToAll,
  writeItemToBringToOne,
  writeActivityForAll,
  writeActivityForOne,
  fetchClassMessageData,
  sendMessageOnSuccess,
  getParentMessageSuccess
} from '../../redux/school/actions/index'
import Reloading from '../reloading'
import { formatDate, fetchClassData, beautifyDate, get, post, put } from '../util'
import TimeModal from '../parent/timemodal'
import Modal from '../modal'
import Form from '../form'

class MessageForParents extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      date: new Date(),
      isLoading: true,
      to_all_message: '',
      items_to_bring: ['母奶粉', '尿布', '水壺', '衣物'],
      other_item: '其它',
      items_to_bring_bool: [0, 0, 0, 0, 0],
      activities_list: ['嬰兒按摩', '音樂律動', '教具操作', '繪本欣賞', '認知圖片', '體能活動', '藝術創作', '多元語言'],
      other_activity: '其它',
      activities_bool: [0, 0, 0, 0, 0, 0, 0, 0, 0],
      message_by_student_id: {},
      editingOtherItemToBring: false,
      editingOtherItemForStudent: '',
      editingOtherActivity: false,
      editingOtherActivityForOne: '',
      showDateTimeModal: false,
      growth_standard_by_student_id: {},
      show_growth_standard: false,
      dob_year: '',
      dob_month: '',
      dob_date: ''
    }
    this.recordActivitiesForAll = this.recordActivitiesForAll.bind(this)
  }

  componentDidMount() {
    const { date, teacher_name } = this.props.route.params
    const { student_id_for_update } = this.props.message
    const { isConnected } = this.props.class
    if (student_id_for_update.size > 0 || !isConnected) {
      this.setState({
        date,
        isLoading: false
      })
    } else {
      this.setState({
        date
      })
      this.fetchClassData(date)
    }

    if (!isConnected) {
      Toast.show({
          text: '網路連線連不到! 等一下再試試看',
          buttonText: 'Okay',
          position: "top",
          type: "danger",
          duration: 4000
      })
    }

    this.props.navigation.setOptions({ 
      title: `老師留⾔ - ${teacher_name}`
    })
  }

  async fetchClassData(propsDate) {
    this.props.navigation.setOptions({ 
      headerRight: () => (
          <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: '#f4d41f', marginRight: 20 }} />
      )
    })
    const date = new Date(propsDate)
    const start_date = formatDate(date)
    date.setDate(date.getDate() + 1)
    const end_date = formatDate(date)
    const messageData = await fetchClassData('message', this.props.class.class_id, start_date, end_date)
    this.props.fetchClassMessageData(messageData.data)
    this.setState({
        isLoading: false
    })
    this.props.navigation.setOptions({ 
      headerRight: () => (
          <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: '#00c07f', marginRight: 20 }} />
      )
    })
  }

  writeToAll(text) {
    const { teacher_id } = this.props.route.params
    // this.setState({ to_all_message: text })
    this.props.writeToAll(text, teacher_id)
  }

  writeToOne(text, student_id) {
    const { teacher_id } = this.props.route.params
    this.props.writeToOne(text, student_id, teacher_id)
  }

  remindItemsToBringToOne(student_id, selected_index) {
    const { teacher_id } = this.props.route.params
    const { message_by_student_id } = this.props.message
    const things_to_bring = [...message_by_student_id[student_id].things_to_bring]
    const new_bool = things_to_bring[selected_index] ? 0 : 1
    things_to_bring.splice(selected_index, 1, new_bool)
    this.props.remindItemsToBringToOne(student_id, things_to_bring, teacher_id)
  }

  remindItemsToBringToAll(selected_index) {
    const { teacher_id } = this.props.route.params
    const { items_to_bring_bool } = this.state
    const new_bool = items_to_bring_bool[selected_index] ? 0 : 1
    items_to_bring_bool.splice(selected_index, 1, new_bool)
    this.setState({
      items_to_bring_bool
    })
    this.props.remindItemsToBringToAll(items_to_bring_bool, teacher_id)
  }

  otherItemForAllEditorOnBlur() {
    const { other_item } = this.state
    this.setState({
      editingOtherItemToBring: false,
      other_item: other_item === '' ? '其它' : other_item
    })
  }

  writeItemToBringToAll(item_to_bring) {
    const { teacher_id } = this.props.route.params
    this.setState({
      other_item: item_to_bring
    })
    this.props.writeItemToBringToAll(item_to_bring, teacher_id)
  }

  writeItemToBringToOne(student_id, item_to_bring) {
    const { teacher_id } = this.props.route.params
    this.props.writeItemToBringToOne(student_id, item_to_bring, teacher_id)
  }

  editItemToBringToOneEditorOnBlur(student_id, other_item) {
    this.setState({ editingOtherItemForStudent: '' })
    if (other_item === '') {
      this.props.writeItemToBringToOne(student_id, '其它')
    }
  }

  recordActivitiesForOne(student_id, selected_index) {
    const { teacher_id } = this.props.route.params
    const { message_by_student_id } = this.props.message
    const activities = [...message_by_student_id[student_id].activities]
    const new_bool = activities[selected_index] ? 0 : 1
    activities.splice(selected_index, 1, new_bool)
    this.props.recordActivitiesForOne(student_id, activities, teacher_id)
  }

  recordActivitiesForAll(selected_index) {
    const { teacher_id } = this.props.route.params
    const { activities_bool } = this.state
    const new_bool = activities_bool[selected_index] ? 0 : 1
    activities_bool.splice(selected_index, 1, new_bool)
    this.setState({
      activities_bool
    })
    this.props.recordActivitiesForAll(activities_bool, teacher_id)
  }

  writeActivityForAll(other_activity) {
    const { teacher_id } = this.props.route.params
    this.setState({
      other_activity
    })
    this.props.writeActivityForAll(other_activity, teacher_id)
  }

  otherActivityEditorOnBlur() {
    const { other_activity } = this.state
    this.setState({
      editingOtherActivity: false,
      other_activity: other_activity === '' ? '其它' : other_activity
    })
  }

  writeActivityForOne(student_id, other_activity) {
    const { teacher_id } = this.props.route.params
    this.props.writeActivityForOne(student_id, other_activity, teacher_id)
  }
  
  activityForOneEditorOnBlur(student_id, other_activity) {
    this.setState({ editingOtherActivityForOne: '' })
    if (other_activity === '') {
      this.props.writeActivityForOne(student_id, '其它')
    }
  }

  handleSend() {
    const { message_by_student_id, student_id_for_update } = this.props.message
    const { isConnected } = this.props.class

    if (student_id_for_update.size === 0) { 
      this.props.navigation.goBack()
      return
    }

    if (!isConnected) {
      Toast.show({
        text: '網路連線連不到! 等一下再試試看',
        buttonText: 'Okay',
        position: "top",
        type: "danger",
        duration: 4000
      })
      return
    }

    const request_body = {
      date: formatDate(new Date()),
      data: this.normalize(message_by_student_id)
    }

    fetch('https://iejnoswtqj.execute-api.us-east-1.amazonaws.com/dev/message', {
      method: 'POST',
      headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(request_body)
    })
      .then(res => res.json())
      .then(resJson => {
        const { statusCode, message, data } = resJson
        if (statusCode > 200 || message === 'Internal server error') {
          Alert.alert(
            'Error',
            message,
            [{text: 'OK'}]
          )
          return
        }
        this.props.sendMessageOnSuccess()
        this.props.navigation.goBack()
      })
      .catch(err => {
        Alert.alert(
          'Error',
          err,
          [{text: 'OK'}]
        )
      })
  }

  normalize(data) {
    const { student_id_for_update, for_all } = this.props.message
    var normalized_data = []
    student_id_for_update.forEach(student_id => {
      normalized_data.push({
        ...data[student_id],
        text: for_all.text + ' \n' + data[student_id].text,
        student_id,
      })
    })
    return normalized_data
  }

  selectDatetimeConfirm(date) {
    this.setState({
        date,
        showDateTimeModal: false
    })
    this.fetchClassData(date)
    this.fetchParentPreviousDayMessage(date)
  }

  async fetchParentPreviousDayMessage(date) {
    const response = await get(`/message/class/${this.props.class.class_id}/previous-day?date=${formatDate(date)}`)
    const { statusCode, message, data } = response
    if (statusCode === 200) {
      this.props.getParentMessageSuccess(data)
    }
  }

  showGrowthStandard() {
    const { students } = this.props.class
    const { show_growth_standard } = this.state
    let growth_standard_by_student_id = {}
    Object.keys(students).map(student_id => {
      growth_standard_by_student_id[student_id] = {
        weight: '',
        height: '',
        hc: ''
      }
    })
    this.setState({
      growth_standard_by_student_id,
      show_growth_standard: !show_growth_standard
    })
  }

  async handleEndEditing(student_id) {
    
    const { growth_standard_by_student_id } = this.state
    
    let record = growth_standard_by_student_id[student_id]
    if (record.weight !== '' && record.height !== '' && record.hc !== '') {
      const { weight, height, hc } = record
      let sendGrowthStandardDataRes = await this.sendGrowthStandardData(student_id, weight, height, hc)
      const { success, statusCode, messate, data } = sendGrowthStandardDataRes
      if (success) {
        const { weight_percentile, height_percentile, hc_percentile } = data
        this.setState({
          growth_standard_by_student_id: {
            ...growth_standard_by_student_id,
            [student_id]: {
              ...growth_standard_by_student_id[student_id],
              weight_percentile,
              height_percentile,
              hc_percentile
            }
          }
        })
      }
    }
  }

  async sendGrowthStandardData(student_id, weight, height, hc) {
    let response = await post(`/student/growth-standard-percentile`, {
      student_id,
      weight,
      height,
      head_circumference: hc,
      date: formatDate(new Date())
    })
    const { success, statusCode, message, data } = response
    if (!success) {
      const { students } = this.props.class
      Alert.alert(
        `${students[student_id].name}的體位表計算出差錯`,
        message,
        [
          { text: 'OK' },
          { text: '現在填入', onPress: () => this.showDOBModal(student_id) }
        ]
      )
    }
    return response
  }

  confirmRecord(student_id) {
    const { teacher_id } = this.props.route.params
    const { message_by_student_id } = this.props.message
    let { text } = message_by_student_id[student_id]
    const { growth_standard_by_student_id } = this.state
    const { weight, height, hc, weight_percentile, height_percentile, hc_percentile } = growth_standard_by_student_id[student_id]
    if (weight_percentile === null) {
      Alert.alert(
        '體重百分比還未計算出來',
        '',
        [{ text: 'OK' }]
      )
      return
    }

    if (height_percentile === null) {
      Alert.alert(
        '身高百分比還未計算出來',
        '',
        [{ text: 'OK' }]
      )
      return
    }

    if (hc_percentile === null) {
      Alert.alert(
        '頭圍百分比還未計算出來',
        '',
        [{ text: 'OK' }]
      )
      return
    }

    text += `\n體重: ${weight} kg (${weight_percentile})\n身高: ${height} cm (${height_percentile})\n頭圍: ${hc} cm (${hc_percentile})`
    this.props.writeToOne(text, student_id, teacher_id)
  }

  showDOBModal(student_id) {
    this.setState({
      show_dob_modal: true,
      student_id_dob_edit: student_id
    })
  }

  async editDOB() {
    const { student_id_dob_edit, dob_year, dob_month, dob_date, growth_standard_by_student_id } = this.state
    const { weight, height, hc } = growth_standard_by_student_id[student_id_dob_edit]
    const response = await put(`/student/${student_id_dob_edit}/dob`,{
      'dob': `${dob_year}-${dob_month}-${dob_date}`
    })
    const { success, statusCode, message, data } = response
    if (success) {
      this.setState({
        show_dob_modal: false
      })
      Alert.alert(
        '更改成功！',
        '',
        [{ text: 'OK', onPress: () => this.handleEndEditing(student_id_dob_edit) }]
      )
    } else {
      Alert.alert(
        '出生年月日更改未成功',
        message,
        [{ text: 'OK' }]
      )
    }
  }

  render() { 
    const { isAdmin } = this.props.route.params
    // const {  } = this.props.message
    // if (this.state.isLoading) {
    //   return (
    //     <Reloading />
    //   )
    // }
    const { teachers } = this.props
    const { students } = this.props.class
    const { message_by_student_id, for_all, data_dispatched, student_id_for_update, parent_messages } = this.props.message
    const {
      items_to_bring,
      items_to_bring_bool,
      activities_list,
      activities_bool,
      editingOtherItemToBring,
      editingOtherItemForStudent,
      editingOtherActivity,
      editingOtherActivityForOne,
      date,
      showDateTimeModal,
      growth_standard_by_student_id,
      show_growth_standard,
      show_dob_modal,
      dob_year,
      dob_month,
      dob_date
    } = this.state
    return (
      <KeyboardAvoidingView
        style={{
          flex: 1
        }}
        behavior='height'
        keyboardVerticalOffset={80}
        enabled
      >
        {showDateTimeModal && <TimeModal
            start_date={date}
            datetime_type={'date'}
            hideModal={() => this.setState({ showDateTimeModal: false })}
            selectDatetimeConfirm={(datetime) => this.selectDatetimeConfirm(datetime)}
            minDatetime={null}
            maxDatetime={new Date()}
        />}

        {show_dob_modal &&
          <Modal
            title={'寶貝出生年月日填入'}
            content={
              <View style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
                <Form
                  label={'年'}
                  value={dob_year}
                  keyboardType={'numeric'}
                  onChangeText={(dob_year) => this.setState({
                    dob_year
                  })}
                  labelStyle={{
                    padding: 15,
                    fontSize: 20,
                    backgroundColor: 'rgba(255,255,255,0.4)'
                  }}
                  inputStyle={{
                    flex: 1,
                    padding: 15,
                    fontSize: 20,
                    backgroundColor: 'rgba(255,255,255,0.4)',
                    borderLeftWidth: 1,
                    borderColor: 'white'
                  }}
                />

                <Form
                  label={'月'}
                  value={dob_month}
                  keyboardType={'numeric'}
                  onChangeText={(dob_month) => this.setState({
                    dob_month
                  })}
                  labelStyle={{
                    padding: 15,
                    fontSize: 20,
                    backgroundColor: 'rgba(255,255,255,0.4)'
                  }}
                  inputStyle={{
                    flex: 1,
                    padding: 15,
                    fontSize: 20,
                    backgroundColor: 'rgba(255,255,255,0.4)',
                    borderLeftWidth: 1,
                    borderColor: 'white'
                  }}
                />

                <Form
                  label={'日'}
                  value={dob_date}
                  keyboardType={'numeric'}
                  onChangeText={(dob_date) => this.setState({
                    dob_date
                  })}
                  labelStyle={{
                    padding: 15,
                    fontSize: 20,
                    backgroundColor: 'rgba(255,255,255,0.4)'
                  }}
                  inputStyle={{
                    flex: 1,
                    padding: 15,
                    fontSize: 20,
                    backgroundColor: 'rgba(255,255,255,0.4)',
                    borderLeftWidth: 1,
                    borderColor: 'white'
                  }}
                />

                <TouchableHighlight
                  onPress={() => this.editDOB()}
                >
                  <Text style={{ fontSize: 20, padding: 15, backgroundColor: '#b5e9e9' }}>
                    送出
                  </Text>
                </TouchableHighlight>
              </View>
            }
            hideModal={() => this.setState({
              show_dob_modal: false
            })}
          />
        }
        <View
          style={{
            padding: 10,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <TouchableHighlight
            onPress={() => {
              if (!data_dispatched || !isAdmin) return
              this.setState({ showDateTimeModal: true})
            }}
          >
            <Text style={{ fontSize: 40 }}>{beautifyDate(date)}</Text>
          </TouchableHighlight>

          <TouchableHighlight
            style={{
              borderWidth: show_growth_standard ? 0 : 2,
              borderColor: show_growth_standard ? 'transparent' : 'green',
              backgroundColor: show_growth_standard ? '#dcf3d0' : 'transparent' 
            }}
            onPress={() => this.showGrowthStandard()}
          >
            <Text style={{ fontSize: 40, padding: 5 }}>體位表</Text>
          </TouchableHighlight>

          <TouchableHighlight
            style={{ backgroundColor: '#dcf3d0' }}
            onPress={() => this.handleSend()}
          >
            <Text style={{ fontSize: 40, padding: 5 }}>送出</Text>
          </TouchableHighlight>
        </View> 
        <ScrollView
          contentContainerStyle={{ alignItems: 'center', marginBottom: 20 }}
        >
          <View style={{ width: '95%' }}>
            <Card style={{padding: 10}}>
              <View style={{ flex: 1 }}>
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-evenly', paddingVertical: 10 }}>
                  <View style={{
                    width: '29%',
                    backgroundColor: '#fff1b5',
                    borderRadius: 10,
                    marginRight: 5
                  }}>
                    <Text style={{ fontSize: 35, alignSelf: 'center' }}>家長準備</Text>
                    <View
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                        justifyContent: 'space-evenly',
                        flexWrap: 'wrap'
                      }}
                    >
                      {items_to_bring.map((item, index) => {
                        return (
                          <TouchableHighlight
                            key={index}
                            style={{
                              backgroundColor: items_to_bring_bool[index] ? '#f4d41f' : '#fff7d6',
                              borderRadius: 3,
                              padding: 3,
                              margin: 5
                            }}
                            onPress={() => this.remindItemsToBringToAll(index)}
                          >
                            <Text style={{fontSize: 20}}>{item}</Text>
                          </TouchableHighlight>
                        )
                      })}
                      <TouchableHighlight
                            style={{
                                backgroundColor: items_to_bring_bool[4] ? '#f4d41f' : '#fff7d6',
                                justifyContent: 'center',
                                borderRadius: 3,
                                padding: 3,
                                margin: 5
                            }}
                            underlayColor='#f4d41f'
                            onPress={() => this.remindItemsToBringToAll(4)}
                            onLongPress={() => this.setState({ editingOtherItemToBring: true })}
                      >
                        {editingOtherItemToBring ?
                          <View style={{ flex: 1 }}>
                            
                            <TextInput
                              autoFocus={true}
                              selectTextOnFocus={true}
                              value={this.state.other_item}
                              style={{
                                alignSelf: 'center',
                                fontSize: 20,
                                backgroundColor: items_to_bring_bool[4] ? '#f4d41f' : '#fff7d6'
                              }}
                              onChangeText={item_to_bring => this.writeItemToBringToAll(item_to_bring.trim())}
                              onBlur={() => this.otherItemForAllEditorOnBlur()}
                            />

                          </View>
                          : <Text style={{ alignSelf: 'center', fontSize: 20 }}>{this.state.other_item}</Text>
                        }
                      </TouchableHighlight>
                    </View>
                  </View>
                  <View
                    style={{
                      width: '69%',
                      backgroundColor: '#b5e9e9',
                      borderRadius: 10,
                      marginLeft: 5
                    }}
                  >
                    <Text style={{ fontSize: 35, alignSelf: 'center' }}>今日活動</Text>
                    <View style={{
                      flexDirection: 'row',
                      justifyContent: 'space-evenly',
                      flexWrap: 'wrap'
                    }}>
                      {activities_list.map((activity, index) => {
                        return (
                          <TouchableHighlight
                            key={index}
                            style={{
                              backgroundColor: activities_bool[index] ? '#368cbf' : '#eaf8f8',
                              // borderColor: '#d6f2f2',
                              // borderWidth: 2,
                              borderRadius: 3,
                              padding: 3,
                              margin: 5
                              // width: '13%'
                            }}
                            onPress={() => this.recordActivitiesForAll(index)}
                          >
                            <Text style={{fontSize: 20}}>{activity}</Text>
                          </TouchableHighlight>
                        )
                      })}

                      <TouchableHighlight
                            style={{
                                backgroundColor: activities_bool[8] ? '#368cbf' : '#eaf8f8',
                                justifyContent: 'center',
                                borderRadius: 3,
                                padding: 3,
                                margin: 5
                            }}
                            underlayColor='#368cbf'
                            onPress={() => this.recordActivitiesForAll(8)}
                            onLongPress={() => this.setState({ editingOtherActivity: true })}
                      >
                        {editingOtherActivity ?
                          <View style={{ flex: 1 }}>
                            
                            <TextInput
                              autoFocus={true}
                              selectTextOnFocus={true}
                              value={this.state.other_activity}
                              style={{
                                alignSelf: 'center',
                                fontSize: 20,
                                backgroundColor: activities_bool[8] ? '#368cbf' : '#eaf8f8'
                              }}
                              onChangeText={other_activity => this.writeActivityForAll(other_activity.trim())}
                              onBlur={() => this.otherActivityEditorOnBlur()}
                            />

                          </View>
                          : <Text style={{ alignSelf: 'center', fontSize: 20 }}>{this.state.other_activity}</Text>
                        }
                      </TouchableHighlight>
                    </View>
                  </View>
                </View>
                <TextInput
                  value={for_all.text}
                  style={{
                    alignSelf: 'center',
                    width: '100%',
                    borderColor: 'gray',
                    borderWidth: 2,
                    borderRadius: 10,
                    fontSize: 25,
                    padding: 20
                  }}
                  multiline={true}
                  // maxLength={100}
                  onChangeText={to_all_message => this.writeToAll(to_all_message)}
                  onEndEditing={() => this.writeToAll(for_all.text.trim())}
                />
              </View>
            </Card>
          </View>
          {Object.keys(students).map(student_id => {
            const {text, things_to_bring, activities, other_item, other_activity, teacher_id } = message_by_student_id[student_id]
            const teacher = teachers[teacher_id] === undefined ?  '' : `- ${teachers[teacher_id].name}`
            return (
              <View key={student_id} style={{ width: '95%' }}>
                <Card style={{ padding: 10 }}>
                  <View style={{ flex: 1, flexDirection: 'row'}}>
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                      <Image
                        source={
                          students[student_id].profile_picture === '' ?
                            require('../../assets/icon-thumbnail.png')
                            : {uri: students[student_id].profile_picture}
                        }
                        style={{ width: 100, height: 100, borderRadius: 50 }}
                      />
                      <Text style={{ fontSize: 25 }}>{students[student_id].name}</Text>
                    </View>
                    <View style={{ flex: 4 }}>
                      {/* Growth rate standard */}
                      {show_growth_standard && 
                        <View style={{ flexDirection: 'row' }}>
                          <View>
                            <View style={{ flexDirection: 'row', paddingBottom: 15 }}>
                              <Text style={{ fontSize: 20, paddingRight: 15 }}>
                                體重: 
                              </Text>
                              <TextInput
                                value={growth_standard_by_student_id[student_id].weight}
                                keyboardType={'numeric'}
                                style={{
                                  fontSize: 20,
                                  borderBottomWidth: 1, 
                                  paddingHorizontal: 10,
                                  paddingVertical: 1
                                }}
                                onChangeText={(weight) => {
                                  this.setState({
                                    growth_standard_by_student_id: {
                                      ...growth_standard_by_student_id,
                                      [student_id]: {
                                        ...growth_standard_by_student_id[student_id],
                                        weight
                                      }
                                    }
                                  })
                                }}
                                onBlur={() => this.handleEndEditing(student_id)}
                              />
                              <Text style={{ fontSize: 20, marginLeft: 15 }}>
                                kg
                              </Text>
                              <Text style={{ fontSize: 20, marginLeft: 15 }}>
                                {growth_standard_by_student_id[student_id].weight_percentile && `(${growth_standard_by_student_id[student_id].weight_percentile})`}
                              </Text>
                            </View>

                            <View style={{ flexDirection: 'row', paddingBottom: 15}}>
                              <Text style={{ fontSize: 20, paddingRight: 15 }}>
                                身高:
                              </Text>
                              <TextInput
                                value={growth_standard_by_student_id[student_id].height}
                                keyboardType={'numeric'}
                                style={{
                                  fontSize: 20,
                                  borderBottomWidth: 1, 
                                  paddingHorizontal: 10,
                                  paddingVertical: 1
                                }}
                                onChangeText={(height) => {
                                  this.setState({
                                    growth_standard_by_student_id: {
                                      ...growth_standard_by_student_id,
                                      [student_id]: {
                                        ...growth_standard_by_student_id[student_id],
                                        height
                                      }
                                    }
                                  })
                                }}
                                onBlur={() => this.handleEndEditing(student_id)}
                              />
                              <Text style={{ fontSize: 20, marginLeft: 15 }}>
                                cm
                              </Text>
                              <Text style={{ fontSize: 20, marginLeft: 15 }}>
                                {growth_standard_by_student_id[student_id].height_percentile && `(${growth_standard_by_student_id[student_id].height_percentile})`}
                              </Text>
                            </View>

                            <View style={{ flexDirection: 'row', paddingBottom: 15}}>
                              <Text style={{ fontSize: 20, paddingRight: 15 }}>
                                頭圍:
                              </Text>
                              <TextInput
                                value={growth_standard_by_student_id[student_id].hc}
                                keyboardType={'numeric'}
                                style={{
                                  fontSize: 20,
                                  borderBottomWidth: 1, 
                                  paddingHorizontal: 10,
                                  paddingVertical: 1
                                }}
                                onChangeText={(hc) => {
                                  this.setState({
                                    growth_standard_by_student_id: {
                                      ...growth_standard_by_student_id,
                                      [student_id]: {
                                        ...growth_standard_by_student_id[student_id],
                                        hc
                                      }
                                    }
                                  })
                                }}
                                onBlur={() => this.handleEndEditing(student_id)}
                              />
                              <Text style={{ fontSize: 20, marginLeft: 15 }}>
                                cm
                              </Text>
                              <Text style={{ fontSize: 20, marginLeft: 15 }}>
                                {growth_standard_by_student_id[student_id].hc_percentile && `(${growth_standard_by_student_id[student_id].hc_percentile})`}
                              </Text>
                            </View>
                          </View>
                          <View style={{ padding: 10 }}>
                            <TouchableHighlight
                              style={{ padding: 10, backgroundColor: '#b5e9e9' }}
                              underlayColor={'#368cbf'}
                              onPress={() => this.confirmRecord(student_id)}
                            >
                              <Text style={{ fontSize: 20 }}>確認載入</Text>
                            </TouchableHighlight>
                          </View>
                        </View>
                      }
                      <View style={{ flex: 1, flexDirection: 'row', paddingBottom: 10 }}>
                        <View
                          style={{
                            width: '29%',
                            backgroundColor: '#fff1b5',
                            borderRadius: 10,
                            marginRight: 3
                          }}
                        >
                          <Text style={{ fontSize: 28, alignSelf: 'center' }}>家長準備</Text>
                          <View
                              style={{
                              flex: 1,
                              flexDirection: 'row',
                              justifyContent: 'space-evenly',
                              flexWrap: 'wrap',
                            }}
                          >
                            {items_to_bring.map((item, index) => {
                              return (
                                <TouchableHighlight
                                  key={index}
                                  style={{
                                    backgroundColor: things_to_bring[index] ? '#f4d41f' : '#fff7d6',
                                    borderRadius: 3,
                                    padding: 4,
                                    margin: 5
                                  }}
                                  onPress={() => this.remindItemsToBringToOne(student_id, index)}
                                >
                                  <Text style={{fontSize: 20}}>{item}</Text>
                                </TouchableHighlight>
                              )
                            })}

                            <TouchableHighlight
                                  style={{
                                      backgroundColor: things_to_bring[4] ? '#f4d41f' : '#fff7d6',
                                      justifyContent: 'center',
                                      borderRadius: 3,
                                      padding: 3,
                                      margin: 5
                                  }}
                                  underlayColor='#f4d41f'
                                  onPress={() => this.remindItemsToBringToOne(student_id, 4)}
                                  onLongPress={() => this.setState({ editingOtherItemForStudent: student_id })}
                            >
                              {editingOtherItemForStudent === student_id ?
                                <View style={{ flex: 1 }}>
                                  
                                  <TextInput
                                    autoFocus={true}
                                    selectTextOnFocus={true}
                                    value={other_item}
                                    style={{
                                      alignSelf: 'center',
                                      fontSize: 20,
                                      backgroundColor: things_to_bring[4] ? '#f4d41f' : '#fff7d6',
                                    }}
                                    onChangeText={item_to_bring => this.writeItemToBringToOne(student_id, item_to_bring.trim())}
                                    onBlur={() => this.editItemToBringToOneEditorOnBlur(student_id, other_item)}
                                  />

                                </View>
                                : <Text style={{ alignSelf: 'center', fontSize: 20 }}>{other_item}</Text>
                              }
                            </TouchableHighlight>
                          </View>
                        </View>
                        <View style={{
                          width: '70%',
                          borderRadius: 10,
                          marginLeft: 3,
                          backgroundColor: '#b5e9e9'
                        }}>
                          <View style={{ flex:1, flexDirection: 'row' }}>
                            <View style={{ flex: 2 }}>
                              <Text style={{ fontSize: 28, alignSelf: 'flex-end' }}>今日活動</Text>
                            </View>
                            <View style={{ flex: 1, justifyContent: 'center' }}>
                              {student_id_for_update.has(student_id) ? 
                                <Text 
                                  style={{ fontSize: 15, alignSelf: 'flex-end', paddingRight: 10, color: 'red' }}
                                >
                                    未送出
                                </Text>
                                : null}
                            </View>
                          </View>
                          <View style={{
                            flex: 1,
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap'
                          }}>
                            {activities_list.map((activity, index) => {
                              return (
                                <TouchableHighlight
                                  key={index}
                                  style={{
                                    backgroundColor: activities[index] ? '#368cbf' : '#d6f2f2',
                                    borderRadius: 3,
                                    padding: 4,
                                    margin: 5
                                  }}
                                  onPress={() => this.recordActivitiesForOne(student_id, index)}
                                >
                                  <Text style={{fontSize: 20}}>{activity}</Text>
                                </TouchableHighlight>
                              )
                            })}

                            <TouchableHighlight
                                  style={{
                                      backgroundColor: activities[8] ? '#368cbf' : '#d6f2f2',
                                      justifyContent: 'center',
                                      borderRadius: 3,
                                      padding: 3,
                                      margin: 5
                                  }}
                                  underlayColor='#368cbf'
                                  onPress={() => this.recordActivitiesForOne(student_id, 8)}
                                  onLongPress={() => this.setState({ editingOtherActivityForOne: student_id })}
                            >
                              {editingOtherActivityForOne === student_id ?
                                <View style={{ flex: 1 }}>
                                  
                                  <TextInput
                                    autoFocus={true}
                                    selectTextOnFocus={true}
                                    value={other_activity}
                                    style={{
                                      alignSelf: 'center',
                                      fontSize: 20,
                                      backgroundColor: activities[8] ? '#368cbf' : '#d6f2f2',
                                    }}
                                    onChangeText={activity => this.writeActivityForOne(student_id, activity.trim())}
                                    onBlur={() => this.activityForOneEditorOnBlur(student_id, other_activity)}
                                  />

                                </View>
                                : <Text style={{ alignSelf: 'center', fontSize: 20 }}>{other_activity}</Text>
                              }
                            </TouchableHighlight>
                          </View>
                        </View>
                      </View>

                      {/* parent's message from previous day */}
                      {parent_messages[student_id] !== undefined &&
                        <Text
                          style={{
                            fontSize: 20, 
                            padding: 20
                          }}
                        >
                          {parent_messages[student_id]}
                        </Text>
                      }

                      {for_all.text !== '' && <TextInput
                        editable={false}
                        value={for_all.text}
                        style={{ 
                          borderColor: 'gray',
                          borderTopWidth: 2,
                          borderLeftWidth: 2,
                          borderRightWidth: 2,
                          borderTopLeftRadius: 10,
                          borderTopRightRadius: 10,
                          fontSize: 25, 
                          padding: 20,
                          backgroundColor: '#F5F5F5'
                        }}
                        multiline={true}
                        // maxLength={100}
                        // onChangeText={text => this.writeToOne(text, student_id)}
                      />}
                      <TextInput
                        value={text}
                        style={{ 
                          borderColor: 'gray', 
                          borderBottomWidth: 2,
                          borderLeftWidth: 2,
                          borderRightWidth: 2,
                          borderTopWidth: for_all.text !== '' ? 0 : 2,
                          borderBottomLeftRadius: 10, 
                          borderBottomRightRadius: 10,
                          borderTopLeftRadius:  for_all.text !== '' ? 0 : 10,
                          borderTopRightRadius:  for_all.text !== '' ? 0 : 10,
                          fontSize: 25, 
                          padding: 20 
                        }}
                        multiline={true}
                        // maxLength={100}
                        onChangeText={text => this.writeToOne(text, student_id)}
                        onEndEditing={() => this.writeToOne(text.trim(), student_id)}
                      />
                      <Text style={{ fontSize: 25, alignSelf: 'flex-end' }}>{teacher}</Text>
                    </View>
                  </View>
                </Card>
              </View>
            )
          })}
        </ScrollView>
      </KeyboardAvoidingView>
    )
  }
}

const styles = StyleSheet.create({
  cardContainer: {
      width: 119,
      height: '100%',
      backgroundColor: 'transparent'
  },
  thumbnailImage: {
      height: 80,
      width: 80,
      borderRadius: 40
  }
})


const mapStateToProps = state => {
  return {
    class: state.classInfo,
    message: state.message,
    teachers: state.school.teachers
  }
}

const mapDispatchToProps = dispatch => {
  return {
    ...bindActionCreators({
      writeToAll,
      writeToOne,
      remindItemsToBringToAll,
      remindItemsToBringToOne,
      recordActivitiesForAll,
      recordActivitiesForOne,
      writeItemToBringToAll,
      writeItemToBringToOne,
      writeActivityForAll,
      writeActivityForOne,
      fetchClassMessageData,
      sendMessageOnSuccess,
      getParentMessageSuccess
    }, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps) (MessageForParents)
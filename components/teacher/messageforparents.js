import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
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

const MessageForParents = (props) => {
  const location = useLocation();
  const [state, setState] = useState({
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
  });

  useEffect(() => {
    const { date, teacher_name } = location?.state
    const { student_id_for_update } = props.message
    const { isConnected } = props.class
    if (student_id_for_update.size > 0 || !isConnected) {
      setState({
        ...state,
        date,
        isLoading: false
      })
    } else {
      setState({
        ...state,
        date
      })
      fetchClassMessageData(date)
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

    // props.navigation.setOptions({ 
    //   title: `老師留⾔ - ${teacher_name}`
    // })
  }, [])

  const fetchClassMessageData = async(propsDate) => {
    // props.navigation.setOptions({ 
    //   headerRight: () => (
    //       <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: '#f4d41f', marginRight: 20 }} />
    //   )
    // })
    const date = new Date(propsDate)
    const start_date = formatDate(date)
    date.setDate(date.getDate() + 1)
    const end_date = formatDate(date)
    const messageData = await fetchClassData('message', props.class.class_id, start_date, end_date)
    props.fetchClassMessageData(messageData.data)
    setState({
      ...state,
      state,
      isLoading: false
    })
    // props.navigation.setOptions({ 
    //   headerRight: () => (
    //       <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: '#00c07f', marginRight: 20 }} />
    //   )
    // })
  }

  const writeToAll = (text) => {
    const { teacher_id } = location?.state
    // setState({ to_all_message: text })
    props.writeToAll(text, teacher_id)
  }

  const writeToOne = (text, student_id) => {
    const { teacher_id } = location?.state
    props.writeToOne(text, student_id, teacher_id)
  }

  const remindItemsToBringToOne = (student_id, selected_index) => {
    const { teacher_id } = location?.state
    const { message_by_student_id } = props.message
    const things_to_bring = [...message_by_student_id[student_id].things_to_bring]
    const new_bool = things_to_bring[selected_index] ? 0 : 1
    things_to_bring.splice(selected_index, 1, new_bool)
    props.remindItemsToBringToOne(student_id, things_to_bring, teacher_id)
  }

  const remindItemsToBringToAll = (selected_index) => {
    const { teacher_id } = location?.state
    const { items_to_bring_bool } = state
    const new_bool = items_to_bring_bool[selected_index] ? 0 : 1
    items_to_bring_bool.splice(selected_index, 1, new_bool)
    setState({
      ...state,
      items_to_bring_bool
    })
    props.remindItemsToBringToAll(items_to_bring_bool, teacher_id)
  }

  const otherItemForAllEditorOnBlur = () => {
    const { other_item } = state
    setState({
      ...state,
      editingOtherItemToBring: false,
      other_item: other_item === '' ? '其它' : other_item
    })
  }

  const writeItemToBringToAll = (item_to_bring) => {
    const { teacher_id } = location?.state
    setState({
      ...state,
      other_item: item_to_bring
    })
    props.writeItemToBringToAll(item_to_bring, teacher_id)
  }

  const writeItemToBringToOne = (student_id, item_to_bring) => {
    const { teacher_id } = location?.state
    props.writeItemToBringToOne(student_id, item_to_bring, teacher_id)
  }

  const editItemToBringToOneEditorOnBlur = (student_id, other_item) => {
    setState({ ...state, editingOtherItemForStudent: '' })
    if (other_item === '') {
      props.writeItemToBringToOne(student_id, '其它')
    }
  }

  const recordActivitiesForOne = (student_id, selected_index) => {
    const { teacher_id } = location?.state
    const { message_by_student_id } = props.message
    const activities = [...message_by_student_id[student_id].activities]
    const new_bool = activities[selected_index] ? 0 : 1
    activities.splice(selected_index, 1, new_bool)
    props.recordActivitiesForOne(student_id, activities, teacher_id)
  }

  const recordActivitiesForAll = (selected_index) => {
    const { teacher_id } = location?.state
    const { activities_bool } = state
    const new_bool = activities_bool[selected_index] ? 0 : 1
    activities_bool.splice(selected_index, 1, new_bool)
    setState({
      ...state,
      activities_bool
    })
    props.recordActivitiesForAll(activities_bool, teacher_id)
  }

  const writeActivityForAll = (other_activity) => {
    const { teacher_id } = location?.state
    setState({
      ...state,
      other_activity
    })
    props.writeActivityForAll(other_activity, teacher_id)
  }

  const otherActivityEditorOnBlur = () => {
    const { other_activity } = state
    setState({
      ...state,
      editingOtherActivity: false,
      other_activity: other_activity === '' ? '其它' : other_activity
    })
  }

  const writeActivityForOne = (student_id, other_activity) => {
    const { teacher_id } = location?.state
    props.writeActivityForOne(student_id, other_activity, teacher_id)
  }
  
  const activityForOneEditorOnBlur = (student_id, other_activity) => {
    setState({ ...state, editingOtherActivityForOne: '' })
    if (other_activity === '') {
      props.writeActivityForOne(student_id, '其它')
    }
  }

  const handleSend = () => {
    const { message_by_student_id, student_id_for_update } = props.message
    const { isConnected } = props.class

    if (student_id_for_update.size === 0) { 
      props.navigation.goBack()
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
      data: normalize(message_by_student_id)
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
        props.sendMessageOnSuccess()
        props.navigation.goBack()
      })
      .catch(err => {
        Alert.alert(
          'Error',
          err,
          [{text: 'OK'}]
        )
      })
  }

  const normalize = (data) => {
    const { student_id_for_update, for_all } = props.message
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

  const selectDatetimeConfirm = (date) => {
    setState({
      ...state,
        date,
        showDateTimeModal: false
    })
    fetchClassMessageData(date)
    fetchParentPreviousDayMessage(date)
  }

  const fetchParentPreviousDayMessage = async(date) => {
    const response = await get(`/message/class/${props.class.class_id}/previous-day?date=${formatDate(date)}`)
    const { statusCode, message, data } = response
    if (statusCode === 200) {
      props.getParentMessageSuccess(data)
    }
  }

  const showGrowthStandard = () => {
    const { students } = props.class
    const { show_growth_standard } = state
    let growth_standard_by_student_id = {}
    Object.keys(students).map(student_id => {
      growth_standard_by_student_id[student_id] = {
        weight: '',
        height: '',
        hc: ''
      }
    })
    setState({
      ...state,
      growth_standard_by_student_id,
      show_growth_standard: !show_growth_standard
    })
  }

  const handleEndEditing = async(student_id) => {
    
    const { growth_standard_by_student_id } = state
    
    let record = growth_standard_by_student_id[student_id]
    if (record.weight !== '' && record.height !== '' && record.hc !== '') {
      const { weight, height, hc } = record
      let sendGrowthStandardDataRes = await sendGrowthStandardData(student_id, weight, height, hc)
      const { success, statusCode, messate, data } = sendGrowthStandardDataRes
      if (success) {
        const { weight_percentile, height_percentile, hc_percentile } = data
        setState({
          ...state,
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

  const sendGrowthStandardData = async(student_id, weight, height, hc) => {
    let response = await post(`/student/growth-standard-percentile`, {
      student_id,
      weight,
      height,
      head_circumference: hc,
      date: formatDate(new Date())
    })
    const { success, statusCode, message, data } = response
    if (!success) {
      const { students } = props.class
      Alert.alert(
        `${students[student_id].name}的體位表計算出差錯`,
        message,
        [
          { text: 'OK' },
          { text: '現在填入', onPress: () => showDOBModal(student_id) }
        ]
      )
    }
    return response
  }

  const confirmRecord = (student_id) => {
    const { teacher_id } = location?.state
    const { message_by_student_id } = props.message
    let { text } = message_by_student_id[student_id]
    const { growth_standard_by_student_id } = state
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
    props.writeToOne(text, student_id, teacher_id)
  }

  const showDOBModal = (student_id) => {
    setState({
      ...state,
      show_dob_modal: true,
      student_id_dob_edit: student_id
    })
  }

  const editDOB = async() => {
    const { student_id_dob_edit, dob_year, dob_month, dob_date, growth_standard_by_student_id } = state
    const { weight, height, hc } = growth_standard_by_student_id[student_id_dob_edit]
    const response = await put(`/student/${student_id_dob_edit}/dob`,{
      'dob': `${dob_year}-${dob_month}-${dob_date}`
    })
    const { success, statusCode, message, data } = response
    if (success) {
      setState({
        ...state,
        show_dob_modal: false
      })
      Alert.alert(
        '更改成功！',
        '',
        [{ text: 'OK', onPress: () => handleEndEditing(student_id_dob_edit) }]
      )
    } else {
      Alert.alert(
        '出生年月日更改未成功',
        message,
        [{ text: 'OK' }]
      )
    }
  }


  const { isAdmin } = location?.state
  // const {  } = props.message
  // if (state.isLoading) {
  //   return (
  //     <Reloading />
  //   )
  // }
  const { teachers } = props
  const { students } = props.class
  const { message_by_student_id, for_all, data_dispatched, student_id_for_update, parent_messages } = props.message
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
  } = state

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
          hideModal={() => setState({ ...state, showDateTimeModal: false })}
          selectDatetimeConfirm={(datetime) => selectDatetimeConfirm(datetime)}
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
                onChangeText={(dob_year) => setState({
                  ...state,
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
                onChangeText={(dob_month) => setState({
                  ...state,
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
                onChangeText={(dob_date) => setState({
                  ...state,
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
                onPress={() => editDOB()}
              >
                <Text style={{ fontSize: 20, padding: 15, backgroundColor: '#b5e9e9' }}>
                  送出
                </Text>
              </TouchableHighlight>
            </View>
          }
          hideModal={() => setState({
            ...state,
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
            setState({ ...state, showDateTimeModal: true})
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
          onPress={() => showGrowthStandard()}
        >
          <Text style={{ fontSize: 40, padding: 5 }}>體位表</Text>
        </TouchableHighlight>

        <TouchableHighlight
          style={{ backgroundColor: '#dcf3d0' }}
          onPress={() => handleSend()}
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
                          onPress={() => remindItemsToBringToAll(index)}
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
                          onPress={() => remindItemsToBringToAll(4)}
                          onLongPress={() => setState({ ...state, editingOtherItemToBring: true })}
                    >
                      {editingOtherItemToBring ?
                        <View style={{ flex: 1 }}>
                          
                          <TextInput
                            autoFocus={true}
                            selectTextOnFocus={true}
                            value={state.other_item}
                            style={{
                              alignSelf: 'center',
                              fontSize: 20,
                              backgroundColor: items_to_bring_bool[4] ? '#f4d41f' : '#fff7d6'
                            }}
                            onChangeText={item_to_bring => writeItemToBringToAll(item_to_bring.trim())}
                            onBlur={() => otherItemForAllEditorOnBlur()}
                          />

                        </View>
                        : <Text style={{ alignSelf: 'center', fontSize: 20 }}>{state.other_item}</Text>
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
                          onPress={() => recordActivitiesForAll(index)}
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
                          onPress={() => recordActivitiesForAll(8)}
                          onLongPress={() => setState({ ...state, editingOtherActivity: true })}
                    >
                      {editingOtherActivity ?
                        <View style={{ flex: 1 }}>
                          
                          <TextInput
                            autoFocus={true}
                            selectTextOnFocus={true}
                            value={state.other_activity}
                            style={{
                              alignSelf: 'center',
                              fontSize: 20,
                              backgroundColor: activities_bool[8] ? '#368cbf' : '#eaf8f8'
                            }}
                            onChangeText={other_activity => writeActivityForAll(other_activity.trim())}
                            onBlur={() => otherActivityEditorOnBlur()}
                          />

                        </View>
                        : <Text style={{ alignSelf: 'center', fontSize: 20 }}>{state.other_activity}</Text>
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
                onChangeText={to_all_message => writeToAll(to_all_message)}
                onEndEditing={() => writeToAll(for_all.text.trim())}
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
                                setState({
                                  ...state,
                                  growth_standard_by_student_id: {
                                    ...growth_standard_by_student_id,
                                    [student_id]: {
                                      ...growth_standard_by_student_id[student_id],
                                      weight
                                    }
                                  }
                                })
                              }}
                              onBlur={() => handleEndEditing(student_id)}
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
                                setState({
                                  ...state,
                                  growth_standard_by_student_id: {
                                    ...growth_standard_by_student_id,
                                    [student_id]: {
                                      ...growth_standard_by_student_id[student_id],
                                      height
                                    }
                                  }
                                })
                              }}
                              onBlur={() => handleEndEditing(student_id)}
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
                                setState({
                                  ...state,
                                  growth_standard_by_student_id: {
                                    ...growth_standard_by_student_id,
                                    [student_id]: {
                                      ...growth_standard_by_student_id[student_id],
                                      hc
                                    }
                                  }
                                })
                              }}
                              onBlur={() => handleEndEditing(student_id)}
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
                            onPress={() => confirmRecord(student_id)}
                          >
                            <Text style={{ fontSize: 20 }}>確認載入</Text>
                          </TouchableHighlight>
                        </View>
                      </View>
                    }
                    <View style={{ flex: 1, paddingBottom: 10 }}>
                      <View
                        style={{
                          // width: '29%',
                          flexDirection: 'row',
                          backgroundColor: '#fff1b5',
                          borderRadius: 10,
                          // marginRight: 3
                        }}
                      >
                        <Text style={{ fontSize: 28 }}>家長準備</Text>
                        <View
                            style={{
                            flex: 1,
                            flexDirection: 'row',
                            // justifyContent: 'space-around',
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
                                onPress={() => remindItemsToBringToOne(student_id, index)}
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
                                onPress={() => remindItemsToBringToOne(student_id, 4)}
                                onLongPress={() => setState({ ...state, editingOtherItemForStudent: student_id })}
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
                                  onChangeText={item_to_bring => writeItemToBringToOne(student_id, item_to_bring.trim())}
                                  onBlur={() => editItemToBringToOneEditorOnBlur(student_id, other_item)}
                                />

                              </View>
                              : <Text style={{ alignSelf: 'center', fontSize: 20 }}>{other_item}</Text>
                            }
                          </TouchableHighlight>
                        </View>
                      </View>
                      <View style={{
                        // width: '70%',
                        borderRadius: 10,
                        // marginLeft: 3,
                        backgroundColor: '#b5e9e9'
                      }}>
                        <View style={{ flexDirection: 'row' }}>
                          <View style={{ flex: 2 }}>
                            <Text style={{ fontSize: 28 }}>今日活動</Text>
                          </View>
                          <View style={{ flex: 1 }}>
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
                          // flex: 1,
                          flexDirection: 'row',
                          // justifyContent: 'space-between',
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
                                onPress={() => recordActivitiesForOne(student_id, index)}
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
                                onPress={() => recordActivitiesForOne(student_id, 8)}
                                onLongPress={() => setState({ ...state, editingOtherActivityForOne: student_id })}
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
                                  onChangeText={activity => writeActivityForOne(student_id, activity.trim())}
                                  onBlur={() => activityForOneEditorOnBlur(student_id, other_activity)}
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
                      // onChangeText={text => writeToOne(text, student_id)}
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
                      onChangeText={text => writeToOne(text, student_id)}
                      onEndEditing={() => writeToOne(text.trim(), student_id)}
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
import React, { useEffect, useState } from 'react'
import { View, Text, Image, TextInput, TouchableOpacity, Alert } from 'react-native'
import { Card, Body } from 'native-base'
import { formatDate, fetchData, post, beautifyTime, formatTime, get } from '../util'
import Reloading from '../reloading'

const MessageCard = (props) => {
  const [state, setState] = useState({
    child_id: props.child_id,
    isLoading: true,
    data_available: false,
    items_to_bring: [],
    activities: [],
    text: '',
    teacher_id: '',
    message_id: null,
    message_for_teacher: '',
    isConnected: true,
    scrollHeight: '100%',
    message_read: false
  })

  useEffect(() => {
    const { date } = props
    fetchMessageData(state.child_id, new Date(date.getTime()))
  }, [])

  // componentDidUpdate(prevProps) {
  //   if (props.date !== prevProps.date) {
  //     setState({ isLoading: true, message_for_teacher: '', scrollHeight: '100%' })
  //     fetchMessageData(props.child_id, new Date(props.date.getTime()));
  //   } else if (props.child_id !== prevProps.child_id) {
  //     setState({ isLoading: true, message_for_teacher: '', scrollHeight: '100%' })
  //     fetchMessageData(props.child_id, new Date());
  //   } else if (props.isConnected != prevProps.isConnected) {
  //     setState({
  //       isConnected: props.isConnected
  //     })
  //   }
  // }


  useEffect(() => {
    setState({ ...state, isLoading: true, message_for_teacher: '', scrollHeight: '100%' })
    fetchMessageData(props.child_id, new Date(props.date.getTime()));
  }, [props.date])

  useEffect(() => {
    setState({ isLoading: true, message_for_teacher: '', scrollHeight: '100%' })
    fetchMessageData(props.child_id, new Date());
  }, [props.child_id])


  const setScrollHeight = (scrollHeight) => {
    setState({ ...state, scrollHeight })
  }

  const fetchMessageData = async(child_id, propDate) => {
    console.log(`fetchMessageData / propDate: ${propDate}`)
    let date = new Date(propDate.getTime())
    if (date.getHours() < 17) {
      setState({
        ...state,
        isLoading: false,
        message_for_teacher: '',
        data_available: false
      })
      return
    }
    const start_date = formatDate(date)
    date.setDate(date.getDate() + 1)
    const end_date = formatDate(date)
    const messageData = await fetchData('message', child_id, start_date, end_date)
    if (messageData.data === undefined || messageData.data[start_date] === undefined) {
      setState({
        ...state,
        isLoading: false,
        message_for_teacher: '',
        data_available: false
      })
      return
    }
    denormalize(messageData.data[start_date])
  }

  const denormalize = (message_data) => {
    const items_list = ['母奶粉', '尿布', '水壺', '衣物']
    const activities_list = ['嬰兒按摩', '音樂律動', '教具操作', '繪本欣賞', '認知圖片', '體能活動', '藝術創作', '多元語言']
    const items_to_bring = []
    const activities = []
    for (var i = 0; i < message_data.items_to_bring.length-1; i++) {
      if (message_data.items_to_bring[i]) {
        items_to_bring.push(items_list[i])
      }
    }

    if (message_data.items_to_bring[message_data.items_to_bring.length-1]) {
      items_to_bring.push(message_data.other_item)
    }

    for (var i = 0; i < message_data.activities.length - 1; i++) {
      if (message_data.activities[i]) {
        activities.push(activities_list[i])
      }
    }

    if (message_data.activities[message_data.activities.length - 1]) {
      activities.push(message_data.other_activity)
    }

    setState({
      ...state,
      isLoading: false,
      data_available: true,
      message_id: message_data.message_id,
      items_to_bring,
      activities,
      text: message_data.text,
      teacher_id: message_data.teacher_id,
      message_for_teacher: message_data.message_for_teacher,
      message_read: message_data.message_read
    })
  }

  const sendMessage = async() => {
    const { class_id, parent_id, date } = props
    const { message_for_teacher, message_id, isConnected } = state
    if (!editable() || message_for_teacher === '') return
    // if (!isConnected) {
    //   alert('網路連不到! 請稍後再試試看')
    //   return
    // }

    // const now = new Date()
    const body = {
      student_id: props.child_id,
      parent_id,
      message_id,
      message_for_teacher,
      timestamp: formatDate(date) + ' ' + formatTime(date)
    }
    const response = await post(`/message/class/${class_id}`, body)
    const { success, statusCode, message, data } = response
    if (!success) {
      alert(`Sorry 傳送訊息時電腦出狀況了！請截圖和與工程師聯繫\n\n` + message)
      return 
    }
    alert(`訊息傳達成功！`)
    fetchMessageData(state.child_id, new Date(date.getTime()))
  }

  const editable = () => {
    const { date } = props
    // console.log('date: ', date)
    let threshold = new Date()
    if (threshold.getDay() === 6) { // if today is saturday
      threshold.setDate(threshold.getDate() - 1)
    } else if (threshold.getDay() === 0) { // if today is sunday
      threshold.setDate(threshold.getDate() - 2)
    }
    threshold.setHours(17, 0, 0, 0)
    return date.getTime() >= threshold.getTime() || before4am()
  }

  const before4am = () => {
    const { date } = props
    let today = new Date()
    let prev_day = new Date() 
    if (today.getDay() === 1) { // if today is monday, prev_day is last friday
      prev_day.setDate(prev_day.getDate() - 3)
      return date.toDateString() === prev_day.toDateString() && today.getHours() < 4
    } else if (today.getDay() > 1 && today.getDay() < 6) { // today is [ tues, fri ]
      prev_day.setDate(prev_day.getDate() - 1)
      return date.toDateString() === prev_day.toDateString() && today.getHours() < 4
    }
    return false
  }

  const showMessageForTeacher = () => {
    const { date } = props
    let today = new Date()
    today.setHours(0,0,0,1)

    if (date.toDateString() === today.toDateString() && editable()) {
      return true
    } else if (date < today) {
      return true
    }
    return false
  }

    const { items_to_bring, activities, text, teacher_id, isLoading, data_available, message_for_teacher, scrollHeight, message_read } = state
    const { date } = props
    // console.log(date.toDateString())
    return (
      <Card style={{ width: '93%' }}>
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <View style={{ width: 56, height: 56, alignItems: 'center', justifyContent: 'center'}}>
            <Image
              source={require('../../assets/icon-message.png')}
              style={{
                  width: 48,
                  height: 48
              }}
            />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ paddingTop: 8 }}>
              <Text style={{ fontSize: 20 }}>訊息</Text>
            </View>
            {isLoading ? 
              <Reloading />
              : data_available ? 
                <View style={{ flex: 1, paddingVertical: 8, paddingRight: 8 }}>
                  <View style={{ padding: 5, marginBottom: 6, backgroundColor: '#F5F5F5' }}>
                    <Text style={{color: 'rgba(0,0,0,0.8)', fontSize: 15}}>愛的小語</Text>
                    <Text style={{ fontSize: 25, paddingVertical: 7 }}>{text}</Text>
                  </View>
                  <View
                    style={{ flexDirection: 'row' }}
                  >
                    <View style={{ flex: 1, padding: 5, backgroundColor: '#F5F5F5', marginRight: 3 }}>
                      <Text style={{color: 'rgba(0,0,0,0.8)', fontSize: 15}}>家長準備</Text>
                      {items_to_bring.length ?
                        <View style={{ alignItems: 'center', paddingVertical: 7}}>
                          {items_to_bring.map((item, index) => {
                            return(
                              <Text 
                                key={index} 
                                style={{ 
                                  padding: 5, 
                                  backgroundColor: 'lightgrey', 
                                  marginBottom: 3,
                                  fontSize: 25
                                }}
                              >
                                {item}
                              </Text>
                            )
                          })}
                        </View>
                        : null
                      }
                    </View>
                    <View style={{ flex: 1, padding: 5, backgroundColor: '#F5F5F5', marginLeft: 3 }}>
                      <Text style={{color: 'rgba(0,0,0,0.8)', fontSize: 15}}>今日活動</Text>
                      {activities.length ?
                        <View style={{ alignItems: 'center', paddingVertical: 7}}>
                          {activities.map((activity, index) => {
                            return(
                              <Text 
                                key={index}
                                style={{ 
                                  padding: 5, 
                                  backgroundColor: 'lightgrey', 
                                  marginBottom: 3,
                                  fontSize: 25
                                }}
                              >
                                {activity}
                              </Text>
                            )
                          })}
                        </View>
                        : null
                      }
                    </View>
                  </View>

                  {/* message for teacher */}
                  <View style={{ backgroundColor: '#ffddb7', marginTop: 5}}>
                    <View style={{ padding: 5, flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ fontSize: 15 }}>給老師的話</Text>
                      {message_for_teacher !== '' && <Text style={{ fontSize: 15 }}>{message_read ? '已讀' : '未讀'}</Text>}
                    </View>
                    
                    <TextInput
                      editable={editable()}
                      style={{
                        // marginHorizontal: 15,
                        height: scrollHeight,
                        justifyContent: 'center',
                        backgroundColor: 'rgba(255,255,255,0.7)',
                        paddingTop: 10,
                        padding: 10,
                        fontSize: 25
                      }}
                      // textAlignVertical={"top"}
                      placeholder={editable() ? 
                        '點擊我開始填寫...' 
                        : isLoading ?
                          '下載中...'
                          :'已不能填寫'}
                      scrollEnabled={false}
                      multiline={true}
                      // blurOnSubmit={true}
                      // maxLength={200}
                      value={message_for_teacher}
                      onChangeText={(message_for_teacher) => setState({ ...state, message_for_teacher })}
                      onChange={(e) => setScrollHeight(e.target.scrollHeight)}
                      onLayout={(event) => {
                        const { scrollHeight } = event.nativeEvent.target
                        setState({
                          ...state,
                          scrollHeight
                        })
                      }}
                    />
                    <TouchableOpacity
                      disabled={!editable()}
                      style={{ padding: 10, justifyContent: 'center' }}
                      onPress={() => sendMessage()}
                    >
                      <Text style={{ fontSize: 25, alignSelf: 'center' }}>送出</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                : <View style={{ flex: 1, paddingVertical: 8, paddingRight: 8 }}>
                    <Text style={{ fontSize: 17 }}>沒有新紀錄</Text>
                  {/* message for teacher */}
                  {showMessageForTeacher() && 
                  <View style={{ backgroundColor: '#ffddb7', marginTop: 5}}>
                    <View style={{ padding: 5, flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ fontSize: 15 }}>給老師的話</Text>
                      {message_for_teacher !== '' && <Text style={{ fontSize: 15 }}>{message_read ? '已讀' : '未讀'}</Text>}
                    </View>
                    
                    <TextInput
                      editable={editable()}
                      style={{
                        // marginHorizontal: 15,
                        height: scrollHeight,
                        justifyContent: 'center',
                        backgroundColor: 'rgba(255,255,255,0.7)',
                        paddingTop: 10,
                        padding: 10,
                        fontSize: 25
                      }}
                      // textAlignVertical={"top"}
                      placeholder={editable() ? 
                        '點擊我開始填寫...' 
                        : isLoading ?
                          '下載中...'
                          :'已不能填寫'}
                      scrollEnabled={false}
                      multiline={true}
                      // blurOnSubmit={true}
                      // maxLength={200}
                      value={message_for_teacher}
                      onChangeText={(message_for_teacher) => setState({ ...state, message_for_teacher })}
                      onChange={(e) => setScrollHeight(e.target.scrollHeight)}
                    />
                    <TouchableOpacity
                      disabled={!editable()}
                      style={{ padding: 10, justifyContent: 'center' }}
                      onPress={() => sendMessage()}
                    >
                      <Text style={{ fontSize: 25, alignSelf: 'center' }}>送出</Text>
                    </TouchableOpacity>
                  </View>
                  }
                </View>
            }
          </View>
        </View>
      </Card>
    );
}

export default MessageCard
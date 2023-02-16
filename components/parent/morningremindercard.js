import React, { useEffect, useState, forwardRef, useImperativeHandle, useCallback } from 'react'
import { View, Text, Image, TextInput, TouchableOpacity, Alert } from 'react-native'
import { Card, Body } from 'native-base'
import { formatDate, fetchData, post, beautifyTime, formatTime } from '../util'
import Reloading from '../reloading'
import TimeModal from './timemodal'
import { debounce } from 'lodash'

const MorningReminderCard = forwardRef((props, ref) => {
  const [state, setState] = useState({
        // present: false,
        morning_reminder_id: null,
        text: '',
        reminder_read: false,
        isConnected: true,
        scrollHeight: '100%',
        milk_timestamp: new Date(),
        diaper_timestamp: new Date(),
        milk_amount: '',
        diaper_type: '小便',
        showDateTimeModal: false,
        showDateTimeModalType: '',
        includeMilkIntake: false,
        includeDiaper: false
  })

  const [isLoading, setIsLoading] = useState(true)

  // const onSendMessageDelay = useCallback(debounce(sendMessage, 2000), [])

  useImperativeHandle(ref, () => ({    
    selectDatetimeConfirm(datetime) {
      const { showDateTimeModalType } = state
      if ( showDateTimeModalType === 'milkintake') {
        setState({
          ...state,
          milk_timestamp: datetime,
          // showDateTimeModal: false
        })
      } else if (showDateTimeModalType === 'diaper') {
        setState({
          ...state,
          diaper_timestamp: datetime,
          // showDateTimeModal: false
        })
      }
    }
  }));

  useEffect(() => {
    const { date } = props
    fetchMorningRecordData(props.student_id, new Date(date.getTime()))
  }, [])

  useEffect(() => {
    const { date } = props
    fetchMorningRecordData(props.student_id, new Date(date.getTime()))
}, [props.date, props.student_id])


  // componentDidUpdate(prevProps) {
  //   if (this.props.date !== prevProps.date) {
  //     // console.log('this.props.date !== prevProps.date')
  //     this.setState({ isLoading: true, text: '', scrollHeight: '100%', includeMilkIntake: false, milk_timestamp: new Date(), milk_amount: '', 
  //       includeDiaper: false, diaper_timestamp: new Date(), diaper_type: '小便' })
  //     fetchMorningRecordData(this.props.child_id, new Date(this.props.date.getTime()));
  //   } else if (this.props.child_id !== prevProps.child_id) {
  //     this.setState({ isLoading: true, text: '', scrollHeight: '100%', includeMilkIntake: false, milk_timestamp: new Date(), milk_amount: '', 
  //       includeDiaper: false, diaper_timestamp: new Date(), diaper_type: '小便' })
  //     fetchMorningRecordData(this.props.child_id, new Date());
  //   // } else if (this.props.present !== prevProps.present) {
  //   //     this.setState({ present: this.props.present })
  //   } else if (this.props.isConnected != prevProps.isConnected) {
  //     this.setState({
  //       isConnected: this.props.isConnected
  //     })
  //   }
  // }

  const setScrollHeight = (scrollHeight) => {
    // console.log('scrollHeight: ', scrollHeight)
    setState({
      ...state,
      scrollHeight
    })
  }

  const fetchMorningRecordData = async(child_id, date) => {
    // console.log(`fetchMorningRecordData / child_id: ${child_id} / date: ${date}`)
    const start_date = formatDate(date)
    date.setDate(date.getDate() + 1)
    const end_date = formatDate(date)
    const messageData = await fetchData('morningreminder', child_id, start_date, end_date)
    // console.log('messageData: ', messageData)
    if (messageData.data === undefined || messageData.data[start_date] === undefined) {
      setState({
        ...state,
        morning_reminder_id: null,
        text: '',
        reminder_read: false
      })
      setIsLoading(false)
      return
    }
    setState({
      ...state,
      morning_reminder_id: messageData.data[start_date].morning_reminder_id,
      text: messageData.data[start_date].text,
      reminder_read: messageData.data[start_date].reminder_read
    })
    setIsLoading(false)
  }

  const sendMessage = async() => {
    console.log('sendMessage')
    setIsLoading(true)
    const { class_id, date, parent_id } = props
    const { text, morning_reminder_id, isConnected, 
      includeMilkIntake, milk_timestamp, milk_amount, includeDiaper, diaper_timestamp, diaper_type } = state
    if (!editable() || (text === '' && !includeMilkIntake && !includeDiaper)) return
    // if (!isConnected) {
    //   alert('網路連不到! 請稍後再試試看')
    //   return
    // }

    let reminder = text
    if(includeDiaper) {
      reminder = `如廁: ${beautifyTime(diaper_timestamp)} ${diaper_type}\n` + reminder
    }
    if (includeMilkIntake) {
      reminder = `餵奶: ${beautifyTime(milk_timestamp)} ${milk_amount} c.c.\n` + reminder
    }

    const body = {
        morning_reminder_id,
        student_id: props.student_id,
        parent_id,
        timestamp: formatDate(date) + ' ' + formatTime(date),
        text: reminder
    }
    const response = await post(`/morningreminder/class/${class_id}`, body)
    const { success, statusCode, message, data } = response
    if (!success) {
      alert(`Sorry 傳送訊息時電腦出狀況了！請截圖和與工程師聯繫\n\n` + message)
      return 
    }
    alert(`訊息傳達成功！`)
    setState({
      ...state,
      includeMilkIntake: false,
      milk_timestamp: new Date(),
      milk_amount: '',
      includeDiaper: false,
      diaper_timestamp: new Date(),
      diaper_type: '小便',
      morning_reminder_id: ''
    })

    fetchMorningRecordData(props.student_id, new Date(props.date))
  }

  const editable = () => {
    const { date } = props
    const threshold = new Date()
    threshold.setHours(17, 0, 0)
    return (date.toDateString() === (new Date).toDateString() && new Date() < threshold) || (date.toDateString() !== (new Date).toDateString() && date > (new Date()))
    // return true
  }

  // const selectDatetimeConfirm = (datetime) => {
  //   const { showDateTimeModalType } = state
  //   if ( showDateTimeModalType === 'milkintake') {
  //     setState({
  //       ...state,
  //       milk_timestamp: datetime,
  //       // showDateTimeModal: false
  //     })
  //   } else if (showDateTimeModalType === 'diaper') {
  //     setState({
  //       ...state,
  //       diaper_timestamp: datetime,
  //       // showDateTimeModal: false
  //     })
  //   }
  // }

  const { text, scrollHeight, morning_reminder_id, reminder_read, 
    milk_timestamp, milk_amount, diaper_timestamp, diaper_type, showDateTimeModal, includeMilkIntake, includeDiaper } = state
  // console.log('this.state: ', this.state)
  return (
    <Card style={{ width: '93%' }}>
      {/* {showDateTimeModal &&
        <TimeModal
          start_date={new Date()}
          datetime_type={'time'}
          hideModal={() => this.setState({ ...state, showDateTimeModal: false })}
          selectDatetimeConfirm={(datetime) => selectDatetimeConfirm(datetime)}
          minDatetime={null}
          maxDatetime={null}
          minTime={null}
          maxTime={null}
        />
      } */}
      <View style={{ flex: 1, flexDirection: 'row' }}>
        <View style={{ width: 56, height: 56, justifyContent: 'center', alignItems: 'center'}}>
          <Image
            source={require('../../assets/icon-morningreminder.png')}
            style={{
                width: 48,
                height: 48
            }}
          />
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ paddingTop: 8, flexDirection: 'row', justifyContent: 'space-between', paddingRight: 8 }}>
            <Text style={{ fontSize: 20 }}>愛的叮嚀</Text>
            {text !== '' && <Text style={{ fontSize: 20 }}>{reminder_read ? '已讀' : '未讀'}</Text>}
          </View>
          <View style={{ flex: 1, paddingVertical: 8, paddingRight: 8 }}>
              {/* milk */}
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: includeMilkIntake ? '#dcf3d0' : 'transparent' }}>
                <TouchableOpacity
                  // disabled={true}
                  onPress={() => {
                    if (!editable()) return
                    setState({
                      ...state,
                      includeMilkIntake: !includeMilkIntake
                    })
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                    <View
                      style={{ width: 24, height: 24, borderWidth: 1, borderRadius: 12, justifyContent: 'center', alignItems: 'center' }}
                    >
                      <View 
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: 8,
                          backgroundColor: includeMilkIntake ? '#00c07f' : 'white'
                        }}
                      >
                      </View>
                    </View>
                    <Text style={{ fontSize: 20, marginLeft: 10, alignSelf: 'center' }}>餵奶: </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{ justifyContent: 'center', alignItems: 'center', padding: 10 }}
                  onPress={() => {
                    if (!editable()) return
                    setState({
                      ...state,
                      showDateTimeModalType: 'milkintake',
                      // showDateTimeModal: true,
                      includeMilkIntake: true
                    })
                    props.showTimeModal()
                  }}
                >
                  <Text style={{ fontSize: 25 }}>{`${beautifyTime(milk_timestamp)}`}</Text>
                </TouchableOpacity>
                <TextInput
                  editable={editable()}
                  style={{ marginLeft: 15, width: 55, fontSize: 25 }}
                  keyboardType="number-pad"
                  placeholder={'_____'}
                  value={''+milk_amount}
                  onChangeText={(milk_amount) => setState({ ...state, milk_amount })}
                  onFocus={() => {
                    if (!editable()) return
                    setState({ ...state, includeMilkIntake: true })
                  }}
                />
                <Text style={{ fontSize: 20 }}>  c.c.</Text>
              </View>

              {/* diaper */}
              <View 
                style={{ 
                  flexDirection: 'row', alignItems: 'center', 
                  marginTop: 10, backgroundColor: includeDiaper ? '#dcf3d0' : 'transparent'
                }}
              >
                <TouchableOpacity
                  // disabled={true}
                  onPress={() => {
                    if (!editable()) return
                    setState({ ...state, includeDiaper: !includeDiaper })
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                    <View
                      style={{ width: 24, height: 24, borderWidth: 1, borderRadius: 12, justifyContent: 'center', alignItems: 'center' }}
                    >
                      <View 
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: 8,
                          backgroundColor: includeDiaper? '#00c07f' : 'white'
                        }}
                      >
                      </View>
                    </View>
                    <Text style={{ fontSize: 20, marginLeft: 10, alignSelf: 'center' }}>如廁: </Text>
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={{ justifyContent: 'center', alignItems: 'center', padding: 5 }}
                  onPress={() => {
                    if (!editable()) return
                    setState({
                      ...state,
                      showDateTimeModalType: 'diaper',
                      // showDateTimeModal: true,
                      includeDiaper: true
                    })
                    props.showTimeModal()
                  }}
                >
                  <Text style={{ fontSize: 25, padding: 5 }}>{`${beautifyTime(diaper_timestamp)}`}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{ marginLeft: 15, justifyContent: 'center', alignItems: 'center', padding: 10 }}
                  onPress={() => {
                    if (!editable()) return
                    setState({
                      ...state,
                      diaper_type: 
                        diaper_type === '小便' ? 
                          '大便'
                          : diaper_type === '大便' ?
                            '無排便'
                            : '小便',
                      includeDiaper: true
                    })
                  }}
                >
                  <Text style={{ fontSize: 20 }}>{diaper_type}</Text>
                </TouchableOpacity>
              </View>

              {/* text */}
              <TextInput
                  key={morning_reminder_id}
                  editable={editable()}
                  style={{ width: '100%', height: scrollHeight, backgroundColor: '#dcf3d0', 
                    fontSize: 25, paddingTop: 10, padding: 10, marginTop: 10
                  }}
                  placeholder={
                    editable() ? 
                      '點擊我開始填寫...' 
                      : isLoading ?
                        '下載中...'
                        :'已不能填寫'
                  }
                  value={text}
                  multiline={true}
                  scrollEnabled={false}
                  // maxLength={200}
                  onChangeText={(text) => setState({ ...state, text })}
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
                  style={{ backgroundColor: '#00c07f', padding: 10, justifyContent: 'center', alignItems: 'center' }}
                  underlayColor="transparent"
                  onPress={() => sendMessage()}
              >
                  <Text style={{ fontSize: 25}}>送出</Text>
              </TouchableOpacity>
          </View>
        </View>
      </View>
    </Card>
  );
})

export default MorningReminderCard
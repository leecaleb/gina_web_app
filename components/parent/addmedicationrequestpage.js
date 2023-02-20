import React, {useEffect, useState} from 'react'
import { View, Text, TouchableOpacity, TextInput, ScrollView, Image,
  KeyboardAvoidingView, Platform, Alert, Dimensions } from 'react-native'
import { formatDate, beautifyTime, beautifyMonthDate, post, formatTime } from '../util';
import TimeModal from './timemodal'
import Reloading from '../reloading'
import ENV from '../../variables'
import { connect } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom';

const { width } = Dimensions.get('window')

const AddMedicationRequestPage = (props) => {

  const location = useLocation()
  const navigate = useNavigate()

  const [state, setState] = useState({
        isLoading: true,
        request_id: null,
        today: new Date(),
        datetime_type: '',
        // date: null,
        time_array: [],
        time_selected_index: null,
        before_meal: null,
        powder: false,
        powder_refrigerated: false,
        syrup: [],
        gel: null,
        other_type: null,
        note: '',
        administered: false,
        teacher_name: '',
        medicated_timestamp: null,
        fever_entry: {
          temperature: '',
          powder: false,
          powder_refrigerated: false,
          syrup: [],
          other_type: null
        },
        data: null,
        index: -1,
        access_mode: 'create',
        scrollHeight: '100%',
        date_array: [],
        date_selected_index: null
    })

    const [showDateTimeModal, setShowDateTimeModal] = useState(false)

  useEffect(() => {
    const { index, data } = location.state

    if (data === null) {
      setState({
        ...state,
        date_array: [new Date()],
        isLoading: false
      })
      return
    }

    switchRequest(index)
  }, [])

  const switchRequest = (index) => {
    const { data } = location.state
    const { id, timestamp, administered, fever_entry, medication, note, teacher_name, medicated_timestamp } = data[index]
    // const { before_meal, powder, powder_refrigerated, syrup, gel, other_type } = medication
    setState({
      ...state,
      index,
      data,
      request_id: id,
      date_array: [timestamp],
      time_array: [timestamp],
      ...medication,
      note,
      fever_entry,
      administered,
      teacher_name,
      medicated_timestamp: medicated_timestamp !== null ? new Date(medicated_timestamp) : null,
      access_mode: 'read',
      isLoading: false
    })
  }

  const isIOS = () => {
    if (Platform.OS === 'ios') {
      return true
    } else return false
  }

  const selectDatetimeConfirm = (datetime) => {
    const { datetime_type } = state
    if (datetime_type === 'date') {
      handleDateSelected(datetime)
    } else {
      handleTimeSelected(datetime)
    }
    // const { datetime_type, time_array, time_selected_index } = this.state
    // if (datetime_type === 'date') {
    //   setState({
    //     date: datetime,
    //     showDateTimeModal: false
    //   })
    // } else if (time_selected_index !== null){
    //   const updated_time_array = []
    //   for(var i = 0; i < time_array.length; i++) {
    //     if(i !== time_selected_index) {
    //       updated_time_array.push(time_array[i])
    //     } else {
    //       updated_time_array.push(datetime)
    //     }
    //   }
    //   setState({
    //     time_array: updated_time_array,
    //     time_selected_index: null,
    //     showDateTimeModal: false
    //   })
    // } else {
    //   setState({
    //     time_array: [...this.state.time_array, datetime],
    //     showDateTimeModal: false
    //   })
    // }
  }

  const handleDateSelected = (date) => {
    const { date_array, date_selected_index } = state
    if (date_selected_index !== null) {
      let updated_date_array = []
      for(var i = 0; i < date_array.length; i++) {
        if(i !== date_selected_index) {
          updated_date_array.push(date_array[i])
        } else {
          updated_date_array.push(date)
        }
      }
      setState({
        ...state,
        date_array: updated_date_array,
        date_selected_index: null
      })
      setShowDateTimeModal(false)
    } else {
      setState({
        ...state,
        date_array: [...date_array, date]
      })
      setShowDateTimeModal(false)
    }
  }

  const handleTimeSelected = (time) => {
    const { time_array, time_selected_index } = state
    if (time_selected_index !== null){
      let updated_time_array = []
      for(var i = 0; i < time_array.length; i++) {
        if(i !== time_selected_index) {
          updated_time_array.push(time_array[i])
        } else {
          updated_time_array.push(time)
        }
      }
      setState({
        ...state,
        time_array: updated_time_array,
        time_selected_index: null
      })
      setShowDateTimeModal(false)
    } else {
      setState({
        ...state,
        time_array: [...time_array, time]
      })
      setShowDateTimeModal(false)
    }
  }

  const removeDate = (index) => {
    const { date_array } = state
    date_array.splice(index, 1)
    setState({
      ...state,
      date_array
    })
  }

  const removeTime = (index) => {
    const { time_array } = state
    time_array.splice(index, 1)
    setState({
      ...state,
      time_array
    })
  }

  const onSelectSyrup = () => {
    const { syrup } = state
    setState({ 
      ...state,
      syrup: syrup.length ? []
        : [{
          amount: '',
          need_refrigerated: false,
          note: ''
        }]
    })
  }

  const editSyrupAmountEntry = (amount, index) => {
    const { syrup } = state
    syrup[index].amount = amount
    setState({
      ...state,
      syrup
    })
  }

  const editSyrupNoteEntry = (note, index) => {
    const { syrup } = state
    syrup[index].note = note
    setState({
      ...state,
      syrup
    })
  }

  const editSyrupRefrigerationEntry = (need_refrigerated, index) => {
    const { syrup } = state
    syrup[index].need_refrigerated = need_refrigerated
    setState({
      ...state,
      syrup
    })
  }

  const removeSyrupEntry = (index) => {
    const { syrup } = state
    syrup.splice(index, 1)
    setState({
      ...state,
      syrup
    })

  }

  const onSelectFeverSyrup = () => {
    const { fever_entry } = state
    setState({
      ...state,
      fever_entry: {
        ...fever_entry,
        syrup: fever_entry.syrup.length ? []
          : [{
            amount: '',
            need_refrigerated: false
          }]
      }
    })
  }

  const editFeverSyrupAmountEntry = (amount, index) => {
    const { fever_entry } = state
    fever_entry.syrup[index].amount = amount
    setState({
      ...state,
      fever_entry
    })
  }

  const editFeverSyrupRefrigerationEntry = (need_refrigerated, index) => {
    const { fever_entry } = state
    fever_entry.syrup[index].need_refrigerated = need_refrigerated
    setState({
      ...state,
      fever_entry
    })
  }

  const removeFeverSyrupEntry = (index) => {
    const { fever_entry } = state
    fever_entry.syrup.splice(index, 1)
    setState({
      ...state,
      fever_entry
    })

  }

  const timeIsEmpty = () => {
    const { time_array } = state
    if (time_array.length === 0) {
      alert('至少要選擇一個時間！')
      return true
    }
    return false
  }

  const sendRequest = async() => {
    const { isConnected } = props
    if (!isConnected) {
      alert('網路連不到! 請稍後再試試看')
      return
    }
    const { student_id } = location.state
    const body = normalizedData()
    const response = await post(`/medicationrequest/student/${student_id}`, body)
    const { success, statusCode, message, data } = response
    if (!success) {
      alert('Sorry 送出托藥單時電腦出狀況了！請截圖和與工程師聯繫\n\n' + message)
      return 
    }
    setState({
      ...state,
      access_mode: 'read'
    })
    // onGoBack()
    navigate(-1)
  }

  const normalizedData = () => {
    const { class_id } = location.state
    const {
      request_id, 
      date_array,
      time_array,
      before_meal ,
      powder,
      powder_refrigerated,
      syrup,
      gel,
      other_type,
      note,
      fever_entry
    } = state

    return{
      request_id,
      class_id,
      // date: formatDate(date), 
      date_array: date_array.map(date => formatDate(date)),
      time_array: time_array.map(time => formatTime(time)), 
      before_meal,
      powder,
      powder_refrigerated,
      syrup,
      gel: gel === null ? gel : gel.trim(),
      other_type: other_type === null ? other_type : other_type.trim(),
      note: note.trim(),
      fever_entry: {
        temperature: fever_entry.temperature,
        powder: fever_entry.powder,
        powder_refrigerated: fever_entry.powder_refrigerated, 
        syrup: fever_entry.syrup, 
        other_type: fever_entry.other_type === null ? fever_entry.other_type : fever_entry.other_type.trim()
      }
    }
  }

  const editable = () => {
    const { date_array } = state
    let date = date_array[0]
    const threshold = new Date()
    threshold.setHours(10,0,0,0)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0,0,0,0)
    return (date.toDateString() === (new Date).toDateString() && new Date() < threshold) || date.getTime() > tomorrow.getTime()
  }

  const onClickConfirm = () => {
    const { access_mode } = state
    if (access_mode === 'create' || access_mode === 'edit') {
      if (timeIsEmpty()) return
      sendRequest()
    } else {
      setState({
        ...state,
        access_mode: 'edit'
      })
    }
  }

  const deleteRequestConfirm = () => {
    const { request_id } = state
    const confirmed = confirm('確定要刪除？')
    if (confirmed) {
      deleteRequest(request_id)  
    }
  }

  const deleteRequest = (request_id) => {
    const { isConnected } = props
    if (!isConnected) {
      alert('網路連不到! 請稍後再試試看')
      return
    }
    const { class_id } = location.state
    fetch(`https://iejnoswtqj.execute-api.us-east-1.amazonaws.com/${ENV}/medicationrequest/${request_id}`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        class_id
      })
    })
      .then((res) => res.json())
      .then((resJson) => {
        const { statusCode, message, data } = resJson
        if (statusCode > 200 || message === 'Internal Server Error') {
          alert('Sorry 電腦出狀況了！請截圖和與工程師聯繫' + message)
          return
        }
        // onGoBack()
        navigate(-1)
        
      })
      .catch(err => {
        alert('Sorry 電腦出狀況了！請截圖和與工程師聯繫: error occurred when deleting medication request')
      })
  }

  const cancelEdit = () => {
    const { index } = state
    switchRequest(index)
  }


    const { 
      isLoading,
      // date, 
      time_array,
      datetime_type, 
      time_selected_index, 
      before_meal ,
      powder,
      powder_refrigerated,
      syrup,
      gel,
      other_type,
      note,
      fever_entry,
      administered,
      teacher_name,
      medicated_timestamp,
      data,
      access_mode,
      scrollHeight,
      date_array,
      date_selected_index
    } = state
    
    if(isLoading) {
      return <Reloading />
    }
    return (
      <KeyboardAvoidingView
          style={{ flex: 1, width: '100%', alignItems: 'center' }}
          behavior={'padding'}
          // keyboardVerticalOffset={90}
          enabled
      >
        {showDateTimeModal ?
          <TimeModal
            start_date={time_selected_index === null ? new Date() : time_array[time_selected_index]}
            datetime_type={datetime_type}
            hideModal={() => setShowDateTimeModal(false)}
            selectDatetimeConfirm={(datetime) => selectDatetimeConfirm(datetime)}
            minDatetime={new Date()}
            maxDatetime={(new Date()).setDate((new Date()).getDate() + 7)}
            minTime={new Date().setHours(7, 0, 0)}
            maxTime={new Date().setHours(20, 0, 0)}
            paddingVertical={100}
          />
          : null
        }

        <ScrollView style={{ width: '100%' }}>
          
          {data !== null && data.length > 1 &&
            <View style={{ width: '100%' }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {data.map((request, index) => {
                    return (
                      <View key={index} style={{ padding: 10 }}>
                        <TouchableOpacity
                          key={request.id}
                          style={{
                            padding: 10,
                            backgroundColor: state.index === index ? '#ffddb7' : 'rgba(0,0,0,0.5)',
                            justifyContent: 'center',
                            borderRadius: 30
                          }}
                          underlayColor='#ffddb7'
                          onPress={() => switchRequest(index)}
                        >
                          <Text
                            style={{ fontSize: 25, color: state.index === index ? 'grey' : 'white' }}
                          >
                            {beautifyTime(request.timestamp)}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )
                  })}
                </ScrollView>
            </View>
          }

          <View style={{ backgroundColor: 'white', borderTopRightRadius: 30, borderTopLeftRadius: 30}}>
            {administered &&
              <View style={{ alignItems: 'center'}}>
                {/* MEDICATED RESPONSE - BODY */}
                <View style={{ width: '100%', backgroundColor: 'white', padding: 20 }}>
                  <Text style={{ fontSize: 25 }}>餵藥老師：{teacher_name}</Text>
                  <Text style={{ fontSize: 25 }}>餵藥時間：{beautifyTime(medicated_timestamp)}</Text>
                </View>
              </View>}

          {/* DATE */}
          <View style={{ alignItems: 'center'}}>
            <View
              style={{ 
                width: '100%', 
                flexDirection: 'row', 
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#ff8944',
                padding: 10,
                borderTopLeftRadius: 30,
                borderTopRightRadius: 30
              }}
            >
              <Text style={{ fontSize: 25 }}>日期 </Text>
            </View>
            {/* <TouchableOpacity
              disabled={access_mode === 'read'}
              style={{
                width: '100%',
                justifyContent: 'center',
                backgroundColor: '#ff8944',
                padding: 10,
                borderTopLeftRadius: 30,
                borderTopRightRadius: 30
              }}
              underlayColor='transparent'
              onPress={() => {
                if (access_mode === 'read') return
                setState({ showDateTimeModal: true, datetime_type: 'date' })
              }}
            >
              <Text style={{ fontSize: 30, alignSelf: 'center' }}>日期 {beautifyMonthDate(date)}</Text>
            </TouchableOpacity> */}

            {/* TIME */}
            <View 
              style={{ 
                flex: 1,
                flexDirection: 'row', 
                width: '100%', 
                backgroundColor: 'white', 
                padding: 20,
                alignItems: 'flex-start'
              }}
            >

            <View style={{ flex: 1, alignItems: 'center' }}>
                <TouchableOpacity 
                  disabled={access_mode === 'read' || access_mode === 'edit'}
                  style={{
                    width: '80%',
                    paddingBottom: 15
                  }}
                  underlayColor='transparent'
                  onPress={() => {
                    if (access_mode === 'read' || access_mode === 'edit') return
                    setState({ ...state, datetime_type: 'date' })
                    setShowDateTimeModal(true)
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ flex: 1, paddingLeft: 15 }}>
                      <Text style={{ fontSize: 25 }}>日期</Text>
                    </View >
                    {access_mode === 'create' &&
                      <Image
                        source={require('../../assets/icon-plus.png')}
                        style={{ width: 32, height: 32, alignSelf: 'flex-end'}}
                      />
                    }
                  </View>
                </TouchableOpacity>
                {date_array.map((date, index) => {
                  return (
                    <View key={index} 
                      style={{
                        width: '90%',
                        justifyContent: 'center',
                        flexDirection: 'row',
                        paddingBottom: 10
                      }}
                    >
                      <TouchableOpacity
                        disabled={access_mode === 'read'}
                        style={{
                          width: '70%',
                          backgroundColor: '#ffddb7',
                          borderTopLeftRadius: 15,
                          borderBottomLeftRadius: 15,
                          justifyContent: 'center'
                        }}
                        underlayColor='transparent'
                        onPress={() => {
                          if (access_mode === 'read') return
                          setState({ ...state, datetime_type: 'date', date_selected_index: index })
                          setShowDateTimeModal(true)
                        }}
                      >
                        <Text style={{ fontSize: 25, alignSelf: 'center' }}>{beautifyMonthDate(date)}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        disabled={access_mode === 'read'}
                        style={{
                          width: '30%',
                          justifyContent: 'center',
                          padding: 5,
                          backgroundColor: '#ffddb7',
                          borderBottomRightRadius: 15,
                          borderTopRightRadius: 15
                        }}
                        underlayColor='transparent'
                        onPress={() => {
                          if (access_mode === 'read') return
                          removeDate(index)
                        }}
                      >
                        <Image
                          source={require('../../assets/icon-delete.png')}
                          style={{ width: 32, height: 32 }}
                        />
                      </TouchableOpacity>
                    </View>
                  )
                })}
              </View>

              <View style={{ flex: 1, alignItems: 'center' }}>
                <TouchableOpacity 
                  disabled={access_mode === 'read' || access_mode === 'edit'}
                  style={{
                    width: '80%',
                    paddingBottom: 15
                  }}
                  underlayColor='transparent'
                  onPress={() => {
                    if (access_mode === 'read' || access_mode === 'edit') return
                    setState({ ...state, datetime_type: 'time' })
                    setShowDateTimeModal(true)
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ flex: 1, paddingLeft: 15 }}>
                      <Text style={{ fontSize: 25 }}>時間</Text>
                    </View >
                    {access_mode === 'create' &&
                      <Image
                        source={require('../../assets/icon-plus.png')}
                        style={{ width: 32, height: 32, alignSelf: 'flex-end'}}
                      />
                    }
                  </View>
                </TouchableOpacity>

                {time_array.map((time, index) => {
                  return (
                    <View key={index} 
                      style={{
                        width: '90%',
                        justifyContent: 'center',
                        flexDirection: 'row',
                        paddingBottom: 10
                      }}
                    >
                      <TouchableOpacity
                        disabled={access_mode === 'read'}
                        style={{
                          width: '70%',
                          backgroundColor: '#ffddb7',
                          borderTopLeftRadius: 15,
                          borderBottomLeftRadius: 15,
                          justifyContent: 'center'
                        }}
                        underlayColor='transparent'
                        onPress={() => {
                          if (access_mode === 'read') return
                          setState({ ...state, datetime_type: 'time', time_selected_index: index })
                          setShowDateTimeModal(true)
                        }}
                      >
                        <Text style={{ fontSize: 25, alignSelf: 'center' }}>{beautifyTime(time)}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        disabled={access_mode === 'read'}
                        style={{
                          width: '30%',
                          justifyContent: 'center',
                          padding: 5,
                          backgroundColor: '#ffddb7',
                          borderBottomRightRadius: 15,
                          borderTopRightRadius: 15
                        }}
                        underlayColor='transparent'
                        onPress={() => {
                          if (access_mode === 'read') return
                          removeTime(index)
                        }}
                      >
                        <Image
                          source={require('../../assets/icon-delete.png')}
                          style={{ width: 32, height: 32 }}
                        />
                      </TouchableOpacity>
                    </View>
                  )
                })}
              </View>
            </View>
            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingBottom: 20 }}>
              <TouchableOpacity
                disabled={access_mode === 'read'}
                style={{ 
                  padding: 15,
                  borderWidth: 1,
                  borderColor: 'grey',
                  backgroundColor: (before_meal !== null && before_meal) ? '#ffddb7' : 'white'
                }}
                underlayColor='#ff8944'
                onPress={() => {
                  if (access_mode === 'read') return
                  setState({ ...state, before_meal: before_meal ? null : true })
                }}
              >
                <Text style={{ fontSize: 25 }}>餐前</Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={access_mode === 'read'}
                style={{
                  padding: 15,
                  borderWidth: 1,
                  borderLeftWidth: 0,
                  borderColor: 'grey',
                  backgroundColor: (before_meal !== null && !before_meal) ? '#ffddb7' : 'white'
                }}
                underlayColor='#ff8944'
                onPress={() => {
                  if (access_mode === 'read') return
                  setState({ ...state, before_meal: before_meal === false ? null : false })
                }}
              >
                <Text style={{ fontSize: 25 }}>餐後</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* MEDICATION TYPE - HEADER */}
          <View style={{ alignItems: 'center'}}>
            <TouchableOpacity
              disabled={access_mode === 'read'}
              style={{
                width: '100%',
                justifyContent: 'center',
                backgroundColor: '#00c07f',
                padding: 10,
                borderTopLeftRadius: 30,
                borderTopRightRadius: 30
              }}
              // onPress={() => }
            >
              <Text style={{ fontSize: 25, alignSelf: 'center' }}>藥物</Text>
            </TouchableOpacity>

            {/* MEDICATION TYPE - BODY */}
            <View style={{ width: '100%', backgroundColor: 'white', paddingHorizontal: 20 }}>

              {/* POWDER */}
              <View style={{ backgroundColor: '' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TouchableOpacity
                    disabled={access_mode === 'read'}
                    style={{ paddingTop: 20, paddingBottom: 10 }}
                    onPress={() => {
                      if (access_mode === 'read') return
                      setState({ ...state, powder: !powder })
                    }}
                    underlayColor='transparent'
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
                            backgroundColor: powder ? '#00c07f' : 'white'
                          }}
                        >
                        </View>
                      </View>
                      <Text style={{ fontSize: 25, marginLeft: 10, alignSelf: 'center' }}>藥粉    </Text>
                    </View>
                  </TouchableOpacity>
                  

                  <TouchableOpacity
                    disabled={access_mode === 'read'}
                    style={{ paddingTop: 20, paddingBottom: 10 }}
                    onPress={() => {
                      if (access_mode === 'read') return
                      setState({ ...state, powder_refrigerated: !powder_refrigerated})
                    }}
                    underlayColor='transparent'
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                      <View
                        style={{ width: 24, height: 24, borderWidth: 1, borderRadius: 12, marginLeft: 10, justifyContent: 'center', alignItems: 'center' }}
                      >
                        <View 
                          style={{
                            // flex: 1,
                            width: 16,
                            height: 16,
                            borderRadius: 8,
                            backgroundColor: powder_refrigerated ? '#00c07f' : 'white'
                          }}
                        >
                          
                        </View>
                      </View>
                    
                      <Text style={{ fontSize: 25, marginHorizontal: 5 }}>需冷藏</Text>

                    </View>

                  </TouchableOpacity>
                </View>
                
              </View>

              {/* SYRUP */}
              <View style={{ backgroundColor: '' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TouchableOpacity
                    disabled={access_mode === 'read'}
                    style={{ paddingVertical: 10 }}
                    onPress={() => {
                      if (access_mode === 'read') return
                      onSelectSyrup()
                    }}
                    underlayColor='transparent'
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
                            backgroundColor: syrup.length ? '#00c07f' : 'white'
                          }}
                        >
                        </View>
                      </View>
                      <Text style={{ fontSize: 25, marginLeft: 10 }}>藥水    </Text>
                    </View>
                  </TouchableOpacity>
                  {syrup.length && access_mode !== 'read'? 
                    <TouchableOpacity
                      style={{ padding: 10 }}
                      onPress={() => setState({
                        ...state, syrup: [...syrup, { amount: '', need_refrigerated: false, note: '' }]
                      })}
                      underlayColor='transparent'
                    >
                      <Image
                        source={require('../../assets/icon-plus-green.png')}
                        style={{ width: 32, height: 32 }}
                      />
                    </TouchableOpacity>
                    : null
                  }
                </View>

                {syrup.map((entry,index) => {
                  return (
                    <View key={index} style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'center', marginBottom: 20 }}>
                      <TextInput
                        editable={access_mode !== 'read'}
                        style={{ width: 35, fontSize: 25, textAlign: 'center', marginHorizontal: 10 }}
                        keyboardType="decimal-pad"
                        autoFocus={true}
                        placeholder={'____'}
                        value={entry.amount}
                        onChangeText={(amount) => editSyrupAmountEntry(amount, index)}
                      />

                      <Text style={{ fontSize: 20, marginRight: 5 }}>c.c.</Text>

                      <TouchableOpacity
                        disabled={access_mode === 'read'}
                        style={{ padding: 5 }}
                        onPress={() => {
                          if (access_mode === 'read') return
                          editSyrupRefrigerationEntry(!entry.need_refrigerated, index)
                        }}
                        underlayColor='transparent'
                      >
                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                          <View
                            style={{ width: 24, height: 24, borderWidth: 1, borderRadius: 12, marginLeft: 10, justifyContent: 'center', alignItems: 'center' }}
                          >
                            <View 
                              style={{
                                width: 16,
                                height: 16,
                                borderRadius: 8,
                                backgroundColor: entry.need_refrigerated ? '#00c07f' : 'white'
                              }}
                            >
                            </View>
                          </View>
                          <Text style={{ fontSize: 25, marginHorizontal: 5 }}>需冷藏</Text>
                        </View>

                      </TouchableOpacity>

                      <TextInput
                        editable={access_mode !== 'read'}
                        style={{ fontSize: 25, textAlign: 'center', marginHorizontal: 10, width: 60 }}
                        // keyboardType="default"
                        // autoFocus={true}
                        placeholder={'備註'}
                        value={entry.note}
                        onChangeText={(note) => editSyrupNoteEntry(note, index)}
                      />

                      {access_mode !== 'read' && <TouchableOpacity
                        style={{ paddingHorizontal: 10 }}
                        onPress={() => removeSyrupEntry(index)}
                        underlayColor='transparent'
                      >
                        <Image
                          source={require('../../assets/icon-delete.png')}
                          style={{ width: 32, height: 32 }}
                        />
                      </TouchableOpacity>
                      }
                    </View>
                  )
                })}
                
              </View>

              {/* GEL */}
              <View style={{ }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TouchableOpacity
                    disabled={access_mode === 'read'}
                    style={{ paddingVertical: 10 }}
                    onPress={() => {
                      if (access_mode === 'read') return
                      setState({ 
                        ...state, gel: gel === null ? '' : null
                      })
                    }}
                    underlayColor='transparent'
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
                            backgroundColor: gel === null ? 'white' : '#00c07f'
                          }}
                        >
                        </View>
                      </View>
                      <Text style={{ fontSize: 25, marginHorizontal: 10 }}>藥膏</Text>
                    </View>
                  </TouchableOpacity>
                  {gel === null ? 
                    null
                    :
                    <TextInput
                      editable={access_mode !== 'read'}
                      style={{ flex: 1, fontSize: 25 }}
                      autoFocus={true}
                      placeholder={'部位'}
                      value={gel}
                      onChangeText={(gel) => setState({ ...state, gel })}
                    />
                  }
                </View>
                
              </View>

              {/* OTHER */}
              <View style={{ }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TouchableOpacity
                    disabled={access_mode === 'read'}
                    style={{ paddingVertical: 10 }}
                    onPress={() => {
                      if (access_mode === 'read') return
                      setState({ 
                        ...state, other_type: other_type === null ? '' : null
                      })
                    }}
                    underlayColor='transparent'
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
                            backgroundColor: other_type === null ? 'white' : '#00c07f'
                          }}
                        >
                        </View>
                      </View>
                      <Text style={{ fontSize: 25, marginHorizontal: 10 }}>其他</Text>
                    </View>
                  </TouchableOpacity>
                  {other_type === null ? 
                    null
                    :
                    <TextInput
                      editable={access_mode !== 'read'}
                      style={{ flex:1, fontSize: 22, paddingHorizontal: 10, paddingTop: 3, paddingBottom: 5, paddingLeft: 0 }}
                      placeholder={'點擊我開始填寫...'}
                      autoFocus={true}
                      textAlignVertical={'top'}
                      multiline={true}
                      blurOnSubmit={true}
                      scrollEnabled={false}
                      value={other_type}
                      onChangeText={(other_type) => setState({ ...state, other_type })} 
                    />
                  }
                </View>
                
              </View>

            </View>
          </View>

          {/* NOTE - HEADER */}
          <View style={{ alignItems: 'center'}}>
            <TouchableOpacity
              disabled={access_mode === 'read'}
              style={{
                width: '100%',
                justifyContent: 'center',
                backgroundColor: '#f4d41f',
                padding: 10,
                borderTopLeftRadius: 30,
                borderTopRightRadius: 30
              }}
              // onPress={() => }
            >
              <Text style={{ fontSize: 25, alignSelf: 'center' }}>備註</Text>
            </TouchableOpacity>

            {/* NOTE - BODY */}
            <View style={{ width: '100%', backgroundColor: 'white', padding: 20 }}>
              <TextInput
                editable={access_mode !== 'read'}
                style={{ height: scrollHeight, padding: 15, fontSize: 25 }}
                placeholder={'點擊填寫...'}
                multiline={true}
                blurOnSubmit={true}
                scrollEnabled={false}
                value={note}
                onChangeText={(note) => setState({ ...state, note })}
                onChange={(e) => setState({
                  ...state, 
                  scrollHeight: e.target.scrollHeight
                })}
                onLayout={(event) => {
                  const { scrollHeight } = event.nativeEvent.target
                  setState({
                    ...state, 
                    scrollHeight
                  })
                }}
              />
            </View>
          </View>

          {/* FEVER MEDS - HEADER */}
          <View style={{ alignItems: 'center'}}>
            <TouchableOpacity
              disabled={access_mode === 'read'}
              style={{
                width: '100%',
                justifyContent: 'center',
                backgroundColor: '#fa625f',
                padding: 10,
                borderTopLeftRadius: 30,
                borderTopRightRadius: 30
              }}
              // onPress={() => }
            >
              <Text style={{ fontSize: 25, alignSelf: 'center' }}>發燒餵藥</Text>
            </TouchableOpacity>

            {/* FEVER MEDS - BODY */}
            <View style={{ width: '100%', backgroundColor: 'white', padding: 20 }}>
              <View style={{ paddingVertical: 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                  
                  <Text style={{ fontSize: width * 0.06, marginHorizontal: 10 }}>發燒超過</Text>

                  <TextInput
                    editable={access_mode !== 'read'}
                    style={{ width: 55, fontSize: 25 }}
                    keyboardType='decimal-pad'
                    value={fever_entry.temperature}
                    onChangeText={(temperature) => setState({
                      ...state,
                      fever_entry: {
                        ...fever_entry,
                        temperature
                      }
                    })}
                  />

                  <Text style={{ fontSize: width * 0.06 }}>°C 以上才用藥</Text>
                </View>

                {/* POWDER */}
                <View style={{ backgroundColor: '' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity
                      disabled={access_mode === 'read'}
                      style={{ paddingTop: 20, paddingBottom: 10 }}
                      onPress={() => {
                        if (access_mode === 'read') return
                        setState({
                          ...state,
                          fever_entry: {
                            ...fever_entry,
                            powder: !fever_entry.powder 
                          }
                        })
                      }}
                      underlayColor='transparent'
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
                              backgroundColor: fever_entry.powder ? '#fa625f' : 'white'
                            }}
                          >
                          </View>
                        </View>
                        <Text style={{ fontSize: 25, marginLeft: 10 }}>藥粉    </Text>
                      </View>
                    </TouchableOpacity>
                    

                    <TouchableOpacity
                      disabled={access_mode === 'read'}
                      style={{ paddingTop: 20, paddingBottom: 10 }}
                      onPress={() => {
                        if (access_mode === 'read') return
                        setState({
                          ...state, 
                          fever_entry: {
                            ...fever_entry,
                            powder_refrigerated: !fever_entry.powder_refrigerated
                          }
                        })
                      }}
                      underlayColor='transparent'
                    >
                      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                        <View
                          style={{ width: 24, height: 24, borderWidth: 1, borderRadius: 12, marginLeft: 10, justifyContent: 'center', alignItems: 'center' }}
                        >
                          <View 
                            style={{
                              // flex: 1,
                              width: 16,
                              height: 16,
                              borderRadius: 8,
                              backgroundColor: fever_entry.powder_refrigerated ? '#fa625f' : 'white'
                            }}
                          >
                            
                          </View>
                        </View>
                      
                        <Text style={{ fontSize: 25, marginHorizontal: 5 }}>需冷藏</Text>

                      </View>

                    </TouchableOpacity>
                  </View>
                  
                </View>
                
                {/* SYRUP */}
              <View style={{ backgroundColor: '' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TouchableOpacity
                    disabled={access_mode === 'read'}
                    style={{ paddingVertical: 10 }}
                    onPress={() => {
                      if (access_mode === 'read') return
                      onSelectFeverSyrup()
                    }}
                    underlayColor='transparent'
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
                            backgroundColor: fever_entry.syrup.length ? '#fa625f' : 'white'
                          }}
                        >
                        </View>
                      </View>
                      <Text style={{ fontSize: 25, marginLeft: 10 }}>藥水    </Text>
                    </View>
                  </TouchableOpacity>
                  {fever_entry.syrup.length && access_mode !== 'read'? 
                    <TouchableOpacity
                      style={{ padding: 10 }}
                      onPress={() => setState({
                        ...state, 
                        fever_entry: {
                          ...fever_entry,
                          syrup: [...fever_entry.syrup, { amount: '', need_refrigerated: false }]
                        }
                      })}
                      underlayColor='transparent'
                    >
                      <Image
                        source={require('../../assets/icon-plus-red.png')}
                        style={{ width: 32, height: 32 }}
                      />
                    </TouchableOpacity>
                    : null
                  }
                </View>

                {fever_entry.syrup.map((entry,index) => {
                  return (
                    <View key={index} style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'center', marginBottom: 20 }}>
                      <TextInput
                        editable={access_mode !== 'read'}
                        style={{ width: 62, fontSize: 25 }}
                        keyboardType="decimal-pad"
                        autoFocus={true}
                        placeholder={'____'}
                        value={entry.amount}
                        onChangeText={(amount) => editFeverSyrupAmountEntry(amount, index)}
                      />

                      <Text style={{ fontSize: 25, marginRight: 5 }}>c.c.</Text>

                      <TouchableOpacity
                        disabled={access_mode === 'read'}
                        style={{ padding: 5 }}
                        onPress={() => {
                          if (access_mode === 'read') return
                          editFeverSyrupRefrigerationEntry(!entry.need_refrigerated, index)
                        }}
                        underlayColor='transparent'
                      >
                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                          <View
                            style={{ width: 24, height: 24, borderWidth: 1, borderRadius: 12, marginLeft: 10, justifyContent: 'center', alignItems: 'center' }}
                          >
                            <View 
                              style={{
                                width: 16,
                                height: 16,
                                borderRadius: 8,
                                backgroundColor: entry.need_refrigerated ? '#fa625f' : 'white'
                              }}
                            >
                            </View>
                          </View>
                          <Text style={{ fontSize: 25, marginHorizontal: 5 }}>需冷藏</Text>
                        </View>

                      </TouchableOpacity>

                      {access_mode !== 'read' && 
                        <TouchableOpacity
                          disabled={access_mode === 'read'}
                          style={{ paddingHorizontal: 10 }}
                          onPress={() => {
                            if (access_mode === 'read') return
                            removeFeverSyrupEntry(index)
                          }}
                          underlayColor='transparent'
                        >
                          <Image
                            source={require('../../assets/icon-delete.png')}
                            style={{ width: 32, height: 32 }}
                          />
                        </TouchableOpacity>
                      }
                    </View>
                  )
                })}
                
              </View>

                {/* OTHER */}
              <View style={{ }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TouchableOpacity
                    disabled={access_mode === 'read'}
                    style={{ paddingVertical: 10 }}
                    onPress={() => {
                      if (access_mode === 'read') return
                      setState({
                        ...state, 
                        fever_entry: {
                          ...fever_entry,
                          other_type: fever_entry.other_type === null ? '' : null
                        }
                      })
                    }}
                    underlayColor='transparent'
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
                            backgroundColor: fever_entry.other_type === null ? 'white' : '#fa625f'
                          }}
                        >
                        </View>
                      </View>
                      <Text style={{ fontSize: 25, marginHorizontal: 10 }}>其他</Text>
                    </View>
                  </TouchableOpacity>
                  {fever_entry.other_type === null ? 
                    null
                    :
                    <TextInput
                      editable={access_mode !== 'read'}
                      style={{ flex:1, fontSize: 22, paddingHorizontal: 10, paddingTop: 3, paddingBottom: 5, paddingLeft: 0 }}
                      placeholder={'點擊我開始填寫...'}
                      autoFocus={true}
                      textAlignVertical={'top'}
                      multiline={true}
                      blurOnSubmit={true}
                      scrollEnabled={false}
                      value={fever_entry.other_type}
                      onChangeText={(other_type) => setState({
                        ...state,
                        fever_entry: {
                          ...fever_entry,
                          other_type
                        }
                      })} 
                    />
                  }
                </View>
                
              </View>
                  
              </View>
            </View>
          </View>
          </View>
        </ScrollView>

        <View
          style={{ height: 90, width: '100%', paddingHorizontal: 20 }}
        >
          {access_mode === 'read' ?
            <TouchableOpacity 
              disabled={!editable()}
              style={{ width: '100%', height: '70%', backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center' }}
              onPress={() => {
                if (!editable()) return
                onClickConfirm()
              }}
              underlayColor='transparent'
            >
              <Text style={{ fontSize: 40, textAlign: 'center', color: 'white' }}>
                編輯
              </Text>
            </TouchableOpacity>
            : access_mode === 'edit' ?
              <View style={{ width: '100%', height: '70%', flexDirection: 'row' }}>
                <TouchableOpacity 
                  style={{  flex:1, backgroundColor: '#fa625f', justifyContent: 'center' }}
                  onPress={() => deleteRequestConfirm()}
                  underlayColor='transparent'
                >
                  <Text style={{ fontSize: 30, textAlign: 'center' }}>
                    刪除
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={{  flex:1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center' }}
                  onPress={() => cancelEdit()}
                  underlayColor='transparent'
                >
                  <Text style={{ fontSize: width * 0.06, textAlign: 'center', color: 'white' }}>
                    取消編輯
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={{ flex:1, backgroundColor: '#00c07f', justifyContent: 'center' }}
                  onPress={() => onClickConfirm()}
                  underlayColor='transparent'
                  >
                  <Text style={{ fontSize: 30, textAlign: 'center' }}>
                    送出
                  </Text>
                </TouchableOpacity>
              </View>
            : // access_mode === 'create
              <TouchableOpacity
                style={{ width: '100%', height: '70%', backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center' }}
                onPress={() => onClickConfirm()}
                underlayColor='transparent'
              >
                <Text style={{ fontSize: 30, textAlign: 'center', color: 'white' }}>
                  送出
                </Text>
              </TouchableOpacity>
          }
        </View>
        
      </KeyboardAvoidingView>
    );
}

const mapStateToProps = (state) => {
  return {
      isConnected: state.parent.isConnected
  }
}

export default connect(mapStateToProps) (AddMedicationRequestPage)
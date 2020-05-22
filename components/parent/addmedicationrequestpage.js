import React from 'react'
import { View, Text, TouchableHighlight, TextInput, ScrollView, Image, KeyboardAvoidingView, Platform, Alert, Dimensions } from 'react-native'
import { formatDate, beautifyTime, beautifyMonthDate, post, formatTime } from '../util';
import TimeModal from './timemodal'
import Reloading from '../reloading'
import ENV from '../../variables'
import { connect } from 'react-redux'

const { width } = Dimensions.get('window')

class AddMedicationRequestPage extends React.Component {
  constructor(props) {
    super(props)
    this.state={
      isLoading: true,
      request_id: null,
      today: new Date(),
      showDateTimeModal: false,
      datetime_type: '',
      date: null,
      time_array: [],
      time_selected_index: null,
      before_meal: null,
      powder: false,
      powder_refrigerated: false,
      syrup: [],
      gel: null,
      other_type: null,
      note: '',
      fever_entry: {
        temperature: '',
        powder: false,
        powder_refrigerated: false,
        syrup: [],
        other_type: null
      },
      data: null,
      index: -1,
      access_mode: 'create'
    }
  }

  componentDidMount() {
    const { index, data } = this.props.route.params

    if (data === null) {
      this.setState({
        date: new Date(),
        isLoading: false
      })
      return
    }

    this.switchRequest(index)
  }

  switchRequest(index) {
    const { data } = this.props.route.params
    const { id, timestamp, administered, fever_entry, medication, note } = data[index]
    // const { before_meal, powder, powder_refrigerated, syrup, gel, other_type } = medication
    this.setState({
      index,
      data,
      request_id: id,
      date: timestamp,
      time_array: [timestamp],
      ...medication,
      note,
      fever_entry,
      access_mode: 'read',
      isLoading: false
    })
  }

  isIOS() {
    if (Platform.OS === 'ios') {
      return true
    } else return false
  }

  selectDatetimeConfirm(datetime) {
    const { datetime_type, time_array, time_selected_index } = this.state
    if (datetime_type === 'date') {
      this.setState({
        date: datetime,
        showDateTimeModal: false
      })
    } else if (time_selected_index !== null){
      const updated_time_array = []
      for(var i = 0; i < time_array.length; i++) {
        if(i !== time_selected_index) {
          updated_time_array.push(time_array[i])
        } else {
          updated_time_array.push(datetime)
        }
      }
      this.setState({
        time_array: updated_time_array,
        time_selected_index: null,
        showDateTimeModal: false
      })
    } else {
      this.setState({
        time_array: [...this.state.time_array, datetime],
        showDateTimeModal: false
      })
    }
  }

  removeTime(index) {
    const { time_array } = this.state
    time_array.splice(index, 1)
    this.setState({
      time_array
    })
  }

  onSelectSyrup() {
    const { syrup } = this.state
    this.setState({ 
      syrup: syrup.length ? []
        : [{
          amount: '',
          need_refrigerated: false
        }]
    })
  }

  editSyrupAmountEntry(amount, index) {
    const { syrup } = this.state
    syrup[index].amount = amount
    this.setState({
      syrup
    })
  }

  editSyrupRefrigerationEntry(need_refrigerated, index) {
    const { syrup } = this.state
    syrup[index].need_refrigerated = need_refrigerated
    this.setState({
      syrup
    })
  }

  removeSyrupEntry(index) {
    const { syrup } = this.state
    syrup.splice(index, 1)
    this.setState({
      syrup
    })

  }

  onSelectFeverSyrup() {
    const { fever_entry } = this.state
    this.setState({
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

  editFeverSyrupAmountEntry(amount, index) {
    const { fever_entry } = this.state
    fever_entry.syrup[index].amount = amount
    this.setState({
      fever_entry
    })
  }

  editFeverSyrupRefrigerationEntry(need_refrigerated, index) {
    const { fever_entry } = this.state
    fever_entry.syrup[index].need_refrigerated = need_refrigerated
    this.setState({
      fever_entry
    })
  }

  removeFeverSyrupEntry(index) {
    const { fever_entry } = this.state
    fever_entry.syrup.splice(index, 1)
    this.setState({
      fever_entry
    })

  }

  timeIsEmpty() {
    const { time_array } = this.state
    if (time_array.length === 0) {
      alert('至少要選擇一個時間！')
      return true
    }
    return false
  }

  async sendRequest() {
    const { isConnected } = this.props
    if (!isConnected) {
      alert('網路連不到! 請稍後再試試看')
      return
    }
    const { student_id, onGoBack } = this.props.route.params
    const body = this.normalizedData()
    const response = await post(`/medicationrequest/student/${student_id}`, body)
    const { success, statusCode, message, data } = response
    if (!success) {
      alert('Sorry 送出托藥單時電腦出狀況了！請截圖和與工程師聯繫\n\n' + message)
      return 
    }
    this.setState({
      access_mode: 'read'
    })
    onGoBack()
    this.props.navigation.goBack()
  }

  normalizedData() {
    const { class_id } = this.props.route.params
    const {
      request_id, 
      date,
      time_array,
      before_meal ,
      powder,
      powder_refrigerated,
      syrup,
      gel,
      other_type,
      note,
      fever_entry
    } = this.state

    return{
      request_id,
      class_id,
      date: formatDate(date), 
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

  onClickConfirm() {
    const { access_mode } = this.state
    if (access_mode === 'create' || access_mode === 'edit') {
      if (this.timeIsEmpty()) return
      this.sendRequest()
    } else {
      this.setState({
        access_mode: 'edit'
      })
    }
  }

  deleteRequestConfirm() {
    const { request_id } = this.state
    const confirmed = confirm('確定要刪除？')
    if (confirmed) {
      this.deleteRequest(request_id)
    }
  }

  deleteRequest(request_id) {
    const { isConnected } = this.props
    if (!isConnected) {
      alert('網路連不到! 請稍後再試試看')
      return
    }
    const { class_id, onGoBack } = this.props.route.params
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
        onGoBack()
        this.props.navigation.goBack()
      })
      .catch(err => {
        alert('Sorry 電腦出狀況了！請截圖和與工程師聯繫: error occurred when deleting medication request')
      })
  }

  cancelEdit() {
    const { index } = this.state
    this.switchRequest(index)
  }

  render() {
    const { 
      isLoading,
      date, 
      time_array, 
      showDateTimeModal, 
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
      data,
      access_mode
    } = this.state
    
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
            hideModal={() => this.setState({ showDateTimeModal: false })}
            selectDatetimeConfirm={(datetime) => this.selectDatetimeConfirm(datetime)}
            minDatetime={new Date()}
            maxDatetime={(new Date()).setDate((new Date()).getDate() + 7)}
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
                        <TouchableHighlight
                          key={request.id}
                          style={{
                            padding: 10,
                            backgroundColor: this.state.index === index ? '#ffddb7' : 'rgba(0,0,0,0.5)',
                            justifyContent: 'center',
                            borderRadius: 30
                          }}
                          underlayColor='#ffddb7'
                          onPress={() => this.switchRequest(index)}
                        >
                          <Text
                            style={{ fontSize: 30, color: this.state.index === index ? 'grey' : 'white' }}
                          >
                            {beautifyTime(request.timestamp)}
                          </Text>
                        </TouchableHighlight>
                      </View>
                    )
                  })}
                </ScrollView>
            </View>
          }

          <View style={{ backgroundColor: 'white', borderTopRightRadius: 30, borderTopLeftRadius: 30}}>
          {/* DATE */}
          <View style={{ alignItems: 'center'}}>
            <TouchableHighlight
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
              onPress={() => this.setState({ showDateTimeModal: true, datetime_type: 'date' })}
            >
              <Text style={{ fontSize: 30, alignSelf: 'center' }}>日期 {beautifyMonthDate(date)}</Text>
            </TouchableHighlight>

            {/* TIME */}
            <View style={{flex: 1, flexDirection: 'row', width: '100%', backgroundColor: 'white', padding: 20 }}>

              <View style={{ flex: 1, alignItems: 'center' }}>
                <TouchableHighlight 
                  disabled={access_mode === 'read' || access_mode === 'edit'}
                  style={{
                    width: '80%',
                    paddingBottom: 10
                  }}
                  underlayColor='transparent'
                  onPress={() => this.setState({ showDateTimeModal: true, datetime_type: 'time' })}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 30 }}>時間</Text>
                    </View >
                    {access_mode === 'create' &&
                      <Image
                        source={require('../../assets/icon-plus.png')}
                        style={{ width: 32, height: 32, alignSelf: 'flex-end'}}
                      />
                    }
                  </View>
                </TouchableHighlight>

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
                      <TouchableHighlight
                        disabled={access_mode === 'read'}
                        style={{
                          width: '70%',
                          backgroundColor: '#ffddb7',
                          borderTopLeftRadius: 15,
                          borderBottomLeftRadius: 15,
                          justifyContent: 'center'
                        }}
                        underlayColor='transparent'
                        onPress={() => this.setState({ showDateTimeModal: true, datetime_type: 'time', time_selected_index: index })}
                      >
                        <Text style={{ fontSize: 25, alignSelf: 'center' }}>{beautifyTime(time)}</Text>
                      </TouchableHighlight>
                      <TouchableHighlight
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
                        onPress={() => this.removeTime(index)}
                      >
                        <Image
                          source={require('../../assets/icon-delete.png')}
                          style={{ width: 32, height: 32 }}
                        />
                      </TouchableHighlight>
                    </View>
                  )
                })}
              </View>

              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <TouchableHighlight
                  disabled={access_mode === 'read'}
                  style={{ 
                    padding: 15,
                    borderWidth: 1,
                    borderColor: 'grey',
                    backgroundColor: (before_meal !== null && before_meal) ? '#ffddb7' : 'white'
                  }}
                  underlayColor='#ff8944'
                  onPress={() => this.setState({ before_meal: before_meal ? null : true })}
                >
                  <Text style={{ fontSize: 25 }}>餐前</Text>
                </TouchableHighlight>
                <TouchableHighlight
                  disabled={access_mode === 'read'}
                  style={{
                    padding: 15,
                    borderWidth: 1,
                    borderTopWidth: 0,
                    borderColor: 'grey',
                    backgroundColor: (before_meal !== null && !before_meal) ? '#ffddb7' : 'white'
                  }}
                  underlayColor='#ff8944'
                  onPress={() => this.setState({ before_meal: before_meal === false ? null : false })}
                >
                  <Text style={{ fontSize: 25 }}>餐後</Text>
                </TouchableHighlight>
              </View>
            </View>
          </View>

          {/* MEDICATION TYPE - HEADER */}
          <View style={{ alignItems: 'center'}}>
            <TouchableHighlight
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
              <Text style={{ fontSize: 30, alignSelf: 'center' }}>藥物</Text>
            </TouchableHighlight>

            {/* MEDICATION TYPE - BODY */}
            <View style={{ width: '100%', backgroundColor: 'white', paddingHorizontal: 20 }}>

              {/* POWDER */}
              <View style={{ backgroundColor: '' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TouchableHighlight
                    disabled={access_mode === 'read'}
                    style={{ paddingTop: 20, paddingBottom: 10 }}
                    onPress={() => this.setState({ powder: !powder })}
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
                  </TouchableHighlight>
                  

                  <TouchableHighlight
                    disabled={access_mode === 'read'}
                    style={{ paddingTop: 20, paddingBottom: 10 }}
                    onPress={() => this.setState({ powder_refrigerated: !powder_refrigerated})}
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

                  </TouchableHighlight>
                </View>
                
              </View>

              {/* SYRUP */}
              <View style={{ backgroundColor: '' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TouchableHighlight
                    disabled={access_mode === 'read'}
                    style={{ paddingVertical: 10 }}
                    onPress={() => this.onSelectSyrup()}
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
                  </TouchableHighlight>
                  {syrup.length && access_mode !== 'read'? 
                    <TouchableHighlight
                      // disabled={access_mode === 'read'}
                      style={{ padding: 10 }}
                      onPress={() => this.setState({
                        syrup: [...syrup, { amount: '', need_refrigerated: false }]
                      })}
                      underlayColor='transparent'
                    >
                      <Image
                        source={require('../../assets/icon-plus-green.png')}
                        style={{ width: 32, height: 32 }}
                      />
                    </TouchableHighlight>
                    : null
                  }
                </View>

                {syrup.map((entry,index) => {
                  return (
                    <View key={index} style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'center', marginBottom: 20 }}>
                      <TextInput
                        editable={access_mode !== 'read'}
                        style={{ width: 62, fontSize: 25 }}
                        keyboardType="number-pad"
                        autoFocus={true}
                        placeholder={'____'}
                        value={entry.amount}
                        onChangeText={(amount) => this.editSyrupAmountEntry(amount, index)}
                      />

                      <Text style={{ fontSize: 25, marginRight: 5 }}>c.c.</Text>

                      <TouchableHighlight
                        disabled={access_mode === 'read'}
                        style={{ padding: 5 }}
                        onPress={() => this.editSyrupRefrigerationEntry(!entry.need_refrigerated, index)}
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

                      </TouchableHighlight>

                      {access_mode !== 'read' && <TouchableHighlight
                        disabled={access_mode === 'read'}
                        style={{ paddingHorizontal: 10 }}
                        onPress={() => this.removeSyrupEntry(index)}
                        underlayColor='transparent'
                      >
                        <Image
                          source={require('../../assets/icon-delete.png')}
                          style={{ width: 32, height: 32 }}
                        />
                      </TouchableHighlight>
                      }
                    </View>
                  )
                })}
                
              </View>

              {/* GEL */}
              <View style={{ }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TouchableHighlight
                    disabled={access_mode === 'read'}
                    style={{ paddingVertical: 10 }}
                    onPress={() => this.setState({ 
                      gel: gel === null ? '' : null
                    })}
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
                  </TouchableHighlight>
                  {gel === null ? 
                    null
                    :
                    <TextInput
                      editable={access_mode !== 'read'}
                      style={{ flex: 1, fontSize: 25 }}
                      autoFocus={true}
                      placeholder={'部位'}
                      value={gel}
                      onChangeText={(gel) => this.setState({ gel })}
                    />
                  }
                </View>
                
              </View>

              {/* OTHER */}
              <View style={{ }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TouchableHighlight
                    disabled={access_mode === 'read'}
                    style={{ paddingVertical: 10 }}
                    onPress={() => this.setState({ 
                      other_type: other_type === null ? '' : null
                    })}
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
                  </TouchableHighlight>
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
                      onChangeText={(other_type) => this.setState({ other_type })} 
                    />
                  }
                </View>
                
              </View>

            </View>
          </View>

          {/* NOTE - HEADER */}
          <View style={{ alignItems: 'center'}}>
            <TouchableHighlight
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
              <Text style={{ fontSize: 30, alignSelf: 'center' }}>備註</Text>
            </TouchableHighlight>

            {/* NOTE - BODY */}
            <View style={{ width: '100%', backgroundColor: 'white', padding: 20 }}>
              <TextInput
                editable={access_mode !== 'read'}
                style={{ padding : 15, fontSize: 25 }}
                placeholder={'點擊填寫...'}
                multiline={true}
                blurOnSubmit={true}
                scrollEnabled={false}
                value={note}
                onChangeText={(note) => this.setState({ note})}
              />
            </View>
          </View>

          {/* FEVER MEDS - HEADER */}
          <View style={{ alignItems: 'center'}}>
            <TouchableHighlight
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
              <Text style={{ fontSize: 30, alignSelf: 'center' }}>發燒餵藥</Text>
            </TouchableHighlight>

            {/* FEVER MEDS - BODY */}
            <View style={{ width: '100%', backgroundColor: 'white', padding: 20 }}>
              <View style={{ paddingVertical: 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                  
                  <Text style={{ fontSize: width * 0.06, marginHorizontal: 10 }}>發燒超過</Text>

                  <TextInput
                    editable={access_mode !== 'read'}
                    style={{ width: 55, fontSize: 25 }}
                    keyboardType='number-pad'
                    value={fever_entry.temperature}
                    onChangeText={(temperature) => this.setState({
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
                    <TouchableHighlight
                      disabled={access_mode === 'read'}
                      style={{ paddingTop: 20, paddingBottom: 10 }}
                      onPress={() => this.setState({ 
                        fever_entry: {
                          ...fever_entry,
                          powder: !fever_entry.powder 
                        }
                      })}
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
                    </TouchableHighlight>
                    

                    <TouchableHighlight
                      disabled={access_mode === 'read'}
                      style={{ paddingTop: 20, paddingBottom: 10 }}
                      onPress={() => this.setState({
                        fever_entry: {
                          ...fever_entry,
                          powder_refrigerated: !fever_entry.powder_refrigerated
                        }
                      })}
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

                    </TouchableHighlight>
                  </View>
                  
                </View>
                
                {/* SYRUP */}
              <View style={{ backgroundColor: '' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TouchableHighlight
                    disabled={access_mode === 'read'}
                    style={{ paddingVertical: 10 }}
                    onPress={() => this.onSelectFeverSyrup()}
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
                  </TouchableHighlight>
                  {fever_entry.syrup.length && access_mode !== 'read'? 
                    <TouchableHighlight
                      // disabled={access_mode === 'read'}
                      style={{ padding: 10 }}
                      onPress={() => this.setState({
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
                    </TouchableHighlight>
                    : null
                  }
                </View>

                {fever_entry.syrup.map((entry,index) => {
                  return (
                    <View key={index} style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'center', marginBottom: 20 }}>
                      <TextInput
                        editable={access_mode !== 'read'}
                        style={{ width: 62, fontSize: 25 }}
                        keyboardType="number-pad"
                        autoFocus={true}
                        placeholder={'____'}
                        value={entry.amount}
                        onChangeText={(amount) => this.editFeverSyrupAmountEntry(amount, index)}
                      />

                      <Text style={{ fontSize: 25, marginRight: 5 }}>c.c.</Text>

                      <TouchableHighlight
                        disabled={access_mode === 'read'}
                        style={{ padding: 5 }}
                        onPress={() => this.editFeverSyrupRefrigerationEntry(!entry.need_refrigerated, index)}
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

                      </TouchableHighlight>

                      {access_mode !== 'read' && 
                        <TouchableHighlight
                          disabled={access_mode === 'read'}
                          style={{ paddingHorizontal: 10 }}
                          onPress={() => this.removeFeverSyrupEntry(index)}
                          underlayColor='transparent'
                        >
                          <Image
                            source={require('../../assets/icon-delete.png')}
                            style={{ width: 32, height: 32 }}
                          />
                        </TouchableHighlight>
                      }
                    </View>
                  )
                })}
                
              </View>

                {/* OTHER */}
              <View style={{ }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TouchableHighlight
                    disabled={access_mode === 'read'}
                    style={{ paddingVertical: 10 }}
                    onPress={() => this.setState({
                      fever_entry: {
                        ...fever_entry,
                        other_type: fever_entry.other_type === null ? '' : null
                      }
                    })}
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
                  </TouchableHighlight>
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
                      onChangeText={(other_type) => this.setState({ 
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
            <TouchableHighlight 
              disabled={((new Date()) - date) > (-60*60*1000)}
              style={{ width: '100%', height: '70%', backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center' }}
              onPress={() => this.onClickConfirm()}
              underlayColor='transparent'
            >
              <Text style={{ fontSize: 40, textAlign: 'center', color: 'white' }}>
                編輯
              </Text>
            </TouchableHighlight>
            : access_mode === 'edit' ?
              <View style={{ width: '100%', height: '70%', flexDirection: 'row' }}>
                <TouchableHighlight 
                  style={{  flex:1, backgroundColor: '#fa625f', justifyContent: 'center' }}
                  onPress={() => this.deleteRequestConfirm()}
                  underlayColor='transparent'
                >
                  <Text style={{ fontSize: 30, textAlign: 'center' }}>
                    刪除
                  </Text>
                </TouchableHighlight>

                <TouchableHighlight 
                  style={{  flex:1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center' }}
                  onPress={() => this.cancelEdit()}
                  underlayColor='transparent'
                >
                  <Text style={{ fontSize: width * 0.06, textAlign: 'center', color: 'white' }}>
                    取消編輯
                  </Text>
                </TouchableHighlight>

                <TouchableHighlight 
                  style={{ flex:1, backgroundColor: '#00c07f', justifyContent: 'center' }}
                  onPress={() => this.onClickConfirm()}
                  underlayColor='transparent'
                  >
                  <Text style={{ fontSize: 30, textAlign: 'center' }}>
                    送出
                  </Text>
                </TouchableHighlight>
              </View>
            : // access_mode === 'create
              <TouchableHighlight 
                // disabled={access_mode === 'read'}
                style={{ width: '100%', height: '70%', backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center' }}
                onPress={() => this.onClickConfirm()}
                underlayColor='transparent'
              >
                <Text style={{ fontSize: 50, textAlign: 'center', color: 'white' }}>
                  送出
                </Text>
              </TouchableHighlight>
          }
        </View>
        
      </KeyboardAvoidingView>
    );
  }
}

const mapStateToProps = (state) => {
  return {
      isConnected: state.parent.isConnected
  }
}

export default connect(mapStateToProps) (AddMedicationRequestPage)
import React from 'react'
import { View, Text, TouchableHighlight, TextInput, KeyboardAvoidingView, Alert, ScrollView, Platform } from 'react-native'
// import DateTimePicker from '@react-native-community/datetimepicker'
import { formatDate, formatTime, beautifyDate, beautifyTime }  from '../util'
import MedicinePowderForm from './medicinepowderform'
import MedicineSyrupForm from './medicinesyrupform'
import MedicineCreamForm from './medicinecreamform'

export default class MedicationRequestMain extends React.Component{
  constructor(props) {
    super(props) 
    this.state = {
      optionButtonWidth: 0,
      optionButtonHeight: 0,
      show_date_picker: false,
      show_time_picker: false,
      date: new Date(),
      time: new Date(),
      show_editor: '',
      藥粉: null,
      need_refrigeration: false,
      藥水: null,
      藥膏: null,
      note: '',
      access_mode: 'create'
    }
  }

  componentDidMount() {
  }

  getHeader() {
    const { access_mode, date, } = this.state
    if (access_mode === 'read') {
      if (formatDate(date) === formatDate(new Date)) {
        return '今天托藥單'
      }
      const days_of_week = ['天', '一', '二', '三', '四', '五', '六']
      const day = days_of_week[date.getDay()]
      return `星期${day}`
    } else if (access_mode === 'create') {
      return '新增托藥單'
    } else if (access_mode === 'edit') {
      return '編輯中...'
    }
  }

  fetchAccessMode() {
    return this.state.access_mode
  }

  componentDidUpdate(prevProps) {
    if (prevProps.request !== this.props.request) {
      const { request } = this.props
      if (!request) {
        this.setState({
          date: new Date(),
          time: new Date(),
          藥粉: null,
          need_refrigeration: false,
          藥水: null,
          藥膏: null,
          note: '',
          access_mode: 'create'
        })
        return
      }

      const { timestamp, medication, note } = request
      const { 藥粉, need_refrigeration, 藥水, 藥膏 } = medication
      this.setState({
        date: timestamp,
        time: timestamp,
        藥粉,
        need_refrigeration,
        藥水,
        藥膏,
        note,
        access_mode: 'read'
      })
    }
  }

  setDate(date) {
    if (Platform.OS === 'ios') {
      this.iosSetDate(date)
    } else { // android
      this.androidSetDate(date)
    }
  }

  iosSetDate(date) {
    if (this.state.access_mode === 'read') return;
    this.setState({
      date,
      time: date
    })
  }

  androidSetDate(date) {
    if (date !== undefined) {
      this.setState({
        date,
        time: date,
        show_date_picker: false
      })
    } else {
      this.setState({ show_date_picker: false })
    }
  }

  setTime(time) {
    if (Platform.OS === 'ios') {
      this.iosSetTime(time)
    } else { // android
      this.androidSetTime(time)
    }
  }

  iosSetTime(time) {
    if (this.state.access_mode === 'read') return;
    this.setState({
      time
    })
  }

  androidSetTime(time) {
    if (time !== undefined) {
      this.setState({
        time,
        show_time_picker: false
      })
    } else {
      this.setState({ show_time_picker: false })
    }
  }

  onFinishEdit(medicine_type, medicine_data) {
    this.setState({
      show_editor: '',
      [medicine_type]: medicine_data
    })
  }

  onCancelSelect(medicine_type) {
    this.setState({
      show_editor: '',
      [medicine_type]: null
    })
  }

  handleClickConfirmButton() {
    const { access_mode } = this.state
    if (access_mode === 'read') {
      this.setState({
        access_mode: 'edit'
      })
    } else if (access_mode === 'create') {
      this.sendRequest(null)
    } else if (access_mode === 'edit') {
      const { id } = this.props.request
      this.sendRequest(id)
    }
  }

  sendRequest(request_id) {
    const { date, time, 藥粉, need_refrigeration, 藥水, 藥膏, note  } = this.state
    const {student_id, class_id} = this.props
    const request_body = {
      request_id,
      timestamp: `${formatDate(date)} ${formatTime(time)}`,
      class_id,
      藥粉,
      need_refrigeration,
      藥水,
      藥膏,
      note
    }

    fetch('https://iejnoswtqj.execute-api.us-east-1.amazonaws.com/dev/medicationrequest/student/' + student_id, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(request_body)
    })
      .then((res) => res.json())
      .then((resJson) => {
        const { statusCode, message, data } = resJson
        if (statusCode > 200 || message === 'Internal server error') {
          Alert.alert(
              'Sorry 電腦出狀況了！',
              '請截圖和與工程師聯繫' + message,
              [{ text: 'Ok' }]
          )
          return
        }
        this.props.onCreateRequestSuccess(data.id)
      })
      .catch(err => {
        Alert.alert(
          'Sorry 電腦出狀況了！',
          '請截圖和與工程師聯繫: error occurred when sending medication request',
          [{ text: 'Ok' }]
        )
      })
  }

  deleteRequestConfirm() {
    Alert.alert(
      '確定要刪除？',
      '',
      [
        { text: '確定', onPress: () => this.deleteRequest() },
        { text: 'Cancel', style: 'cancel' }
      ]
    )
  }

  deleteRequest() {
    const { request, class_id } = this.props
    fetch('https://iejnoswtqj.execute-api.us-east-1.amazonaws.com/dev/medicationrequest/' + request.id, {
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
          Alert.alert(
              'Sorry 電腦出狀況了！',
              '請截圖和與工程師聯繫' + message,
              [{ text: 'Ok' }]
          )
          return
        }
        this.props.onDeleteRequestSuccess(data.id)
      })
      .catch(err => {
        Alert.alert(
            'Sorry 電腦出狀況了！',
            '請截圖和與工程師聯繫: error occurred when deleting medication request',
            [{ text: 'Ok' }]
        )
      })
  }

  render() {
    const {
      show_date_picker,
      show_time_picker,
      date,
      time,
      藥粉,
      藥水,
      藥膏,
      note,
      optionButtonWidth,
      optionButtonHeight,
      show_editor,
      access_mode
    } = this.state

    // console.log(this.props.request)

    if (show_date_picker) {
      return (
        <View style={{ flex: 1 }}>
          <View style={{ flex: 3, justifyContent: 'center' }}>
            {/* <DateTimePicker
              style={{ width: '100%'}}
              mode={'date'}
              value={date}
              onChange={(event, date) => this.setDate(date)}
              minimumDate={new Date()}
            /> */}
          </View>
          <View style={{ flex: 1 }}>
            <TouchableHighlight
              style={{ width: '50%', padding: 10, backgroundColor: 'rgba(255,255,255,0.4)', alignSelf: 'flex-end',  }}
              onPress={() => this.setState({ show_date_picker: false })}
            >
              <Text style={{ fontSize: 30, textAlign: 'center' }}>OK</Text>
            </TouchableHighlight>
          </View>
        </View>
      )
    }
    if (show_time_picker) {
      return (
        <View style={{ flex: 1 }}>
          <View style={{ flex: 3, justifyContent: 'center' }}>
            {/* <DateTimePicker
              style={{ width: '100%'}}
              mode={'time'}
              value={time}
              onChange={(event, time) => this.setTime(time)}
              minimumDate={new Date()}
            /> */}
          </View>
          <View style={{ flex: 1 }}>
            <TouchableHighlight
              style={{ width: '50%', padding: 10, backgroundColor: 'rgba(255,255,255,0.4)', alignSelf: 'flex-end',  }}
              onPress={() => this.setState({ show_time_picker: false })}
            >
              <Text style={{ fontSize: 30, textAlign: 'center' }}>OK</Text>
            </TouchableHighlight>
          </View>
        </View>
      )
    }
    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior='padding'
        enabled
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 30, textAlign: 'center' }}>{this.getHeader()}</Text>
        </View>
        <View style={{ flex: 7 }}>

          {/* DATE and TIME */}
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 }}>
            <TouchableHighlight
              disabled={access_mode === 'read' || show_editor !== ''}
              style={{
                backgroundColor: 'rgba(255,255,255,0.4)',
                justifyContent: 'center',
                padding: 10,
                height: '100%'
              }}
              onPress={() => this.setState({show_date_picker: !show_date_picker})}
            >
              <Text style={{ fontSize: 25, textAlign: 'center' }}>{beautifyDate(date)}</Text>
            </TouchableHighlight>
            <TouchableHighlight
              disabled={access_mode === 'read' || show_editor !== ''}
              style={{
                backgroundColor: 'rgba(255,255,255,0.4)',
                justifyContent: 'center',
                padding: 10,
                height: '100%'
              }}
              onPress={() => this.setState({show_time_picker: !show_time_picker})}
            >
              <Text style={{ fontSize: 25, textAlign: 'center' }}>{beautifyTime(time)}</Text>
            </TouchableHighlight>
          </View>

          {show_editor === '藥粉' ? 
            <MedicinePowderForm
              藥粉={藥粉}
              width={optionButtonWidth}
              height={optionButtonHeight}
              onFinishEdit={(powder_amount) => this.onFinishEdit('藥粉', powder_amount)}
              onCancelSelect={() => this.onCancelSelect('藥粉')}
            />
            : show_editor === '藥水' ?
              <MedicineSyrupForm
                藥水={藥水}
                width={optionButtonWidth}
                height={optionButtonHeight}
                onFinishEdit={(syrup_amount) => this.onFinishEdit('藥水', syrup_amount)}
                onCancelSelect={() => this.onCancelSelect('藥水')}
              />
              : show_editor === '藥膏' ?
                <MedicineCreamForm
                  藥膏={藥膏}
                  width={optionButtonWidth}
                  height={optionButtonHeight}
                  onFinishEdit={(cream_area) => this.onFinishEdit('藥膏', cream_area)}
                  onCancelSelect={() => this.onCancelSelect('藥膏')}
                />
                :
                <View style={{ flex: 4 }}>
                  <View style={{ flex: 3, backgroundColor: 'rgba(255,255,255,0.4)' }}>
                    <View style={{ flex: 1, flexDirection: 'row' }}>
                      {/* POWDER */}
                      <TouchableHighlight
                        disabled={access_mode === 'read'}
                        style={{
                          flex: 1,
                          backgroundColor: 藥粉 ? '#ff8944' : '#ffddb7',
                          justifyContent: 'center',
                          marginLeft: 14,
                          marginTop: 14,
                          marginRight: 7,
                          marginBottom: 7
                        }}
                        onLayout={(event) => {
                          const { width, height } = event.nativeEvent.layout
                          this.setState({
                            optionButtonWidth: width,
                            optionButtonHeight: height
                          })
                        }}
                        underlayColor='#ff8944'
                        onPress={() => this.setState({ show_editor: '藥粉', 藥粉: 藥粉 || 1 })}
                      >
                        {藥粉 ? 
                          <Text style={{ fontSize: 25, textAlign: 'center' }}>藥粉: {藥粉} 包</Text>
                          : <Text style={{ fontSize: 25, textAlign: 'center' }}>藥粉</Text>
                        }
                      </TouchableHighlight>

                      {/* REFRIGERATED */}
                      <TouchableHighlight
                        disabled={access_mode === 'read'}
                        style={{
                          flex: 1,
                          backgroundColor: this.state.need_refrigeration ? '#ff8944' : '#ffddb7',
                          justifyContent: 'center',
                          marginLeft: 7,
                          marginTop: 14,
                          marginRight: 14,
                          marginBottom: 7
                        }}
                        underlayColor='#ff8944'
                        onPress={() => this.setState({ need_refrigeration: !this.state.need_refrigeration})}
                      >
                        <Text style={{ fontSize: 25, textAlign: 'center' }}>藥品需冷藏</Text>
                      </TouchableHighlight>
                    </View>

                    <View style={{ flex: 1, flexDirection: 'row' }}>
                      {/* SYRUP */}
                      <TouchableHighlight
                        disabled={access_mode === 'read'}
                        style={{
                          flex: 1,
                          backgroundColor: 藥水 ? '#ff8944' : '#ffddb7',
                          justifyContent: 'center',
                          marginLeft: 14,
                          marginTop: 7,
                          marginRight: 7,
                          marginBottom: 14
                        }}
                        onPress={() => this.setState({ show_editor: '藥水', 藥水: 藥水 || 0 })}
                      >
                        {藥水 ?
                          <Text style={{ fontSize: 20, textAlign: 'center' }}>藥水: {藥水} c.c.</Text>
                          : <Text style={{ fontSize: 25, textAlign: 'center' }}>藥水</Text>
                        }
                      </TouchableHighlight>

                      {/* CREAM */}
                      <TouchableHighlight
                        disabled={access_mode === 'read'}
                        style={{
                          flex: 1,
                          backgroundColor: 藥膏 ? '#ff8944' : '#ffddb7',
                          justifyContent: 'center',
                          marginLeft: 7,
                          marginTop: 7,
                          marginRight: 14,
                          marginBottom: 14,
                        }}
                        onPress={() => this.setState({ show_editor: '藥膏' })}
                      >
                        {藥膏 ? 
                          <Text style={{ fontSize: 20, textAlign: 'center' }}>藥膏部位: {藥膏}</Text>
                          : <Text style={{ fontSize: 25, textAlign: 'center' }}>藥膏</Text>
                        }
                        
                      </TouchableHighlight>
                    </View>
                  </View>

              {/* NOTE */}
                  <View
                    style={{ backgroundColor: '#b5e9e9' }}
                  >
                    <TextInput
                      editable={access_mode !== 'read'}
                      placeholder='備註'
                      placeholderTextColor='grey'
                      value={note}
                      style={{
                        // height: '100%',
                        backgroundColor: '#eaf8f8',
                        borderRadius: 3,
                        fontSize: 20,
                        padding: 20,
                      }}
                      onChangeText={note => this.setState({ note })}
                    />
                  </View>
                </View>

          }

          {/* Add Button */}
          {this.props.request !== undefined && this.props.request.administered ?
            <View
              style={{ flex: 1, flexDirection: 'row', paddingVertical: 10, justifyContent: 'center', alignItems: 'center' }}
            >
              <Text style={{ fontSize: 30 }}>喂藥老師: {this.props.request.teacher_name}</Text>
            </View>
            :
          <View
            style={{ flex: 1, flexDirection: 'row', paddingVertical: 10 }}
          >
            <View style={{ flex: 1, marginHorizontal: 7 }}>
              {access_mode === 'edit' ?
                <TouchableHighlight
                  disabled={show_editor !== ''}
                  style={{
                    height: '100%',
                    padding: 10,
                    // alignSelf: 'flex-start',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(255,255,255,0.4)'
                  }}
                  onPress={() => this.deleteRequestConfirm()}
                >
                  <Text style={{ fontSize: 17, textAlign: 'center' }}>刪除</Text>
                </TouchableHighlight>
                : null
              }              
            </View>
            <View style={{ flex: 1, marginHorizontal: 7 }}>
              {access_mode === 'edit' ?
                <TouchableHighlight
                  disabled={show_editor !== ''}
                  style={{
                    height: '100%',
                    padding: 10,
                    justifyContent: 'center',
                    backgroundColor: 'rgba(255,255,255,0.4)'
                  }}
                  onPress={() => this.setState({ access_mode: 'read'})}
                >
                  <Text style={{ fontSize: 17, textAlign: 'center' }}>取消編輯</Text>
                </TouchableHighlight>
                : null
              }
            </View>
            <View style={{ flex: 1, marginHorizontal: 7 }}>
              <TouchableHighlight
                disabled={show_editor !== ''}
                style={{
                  height: '100%',
                  padding: 10,
                  justifyContent: 'center',
                  backgroundColor: 'rgba(255,255,255,0.4)'
                }}
                onPress={() => this.handleClickConfirmButton()}
              >
                <Text style={{ fontSize: 25, textAlign: 'center' }}>
                  {access_mode === 'read' ?
                    '編輯'
                    : access_mode === 'create' ?
                      '新增'
                      : access_mode === 'edit' ?
                        '送出'
                        : null
                  }
                </Text>
              </TouchableHighlight>
            </View>
          </View>
          }
        </View>
      </KeyboardAvoidingView>
    )
  }
}
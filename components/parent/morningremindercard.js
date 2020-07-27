import React from 'react'
import { View, Text, Image, TextInput, TouchableOpacity, Alert } from 'react-native'
import { Card, Body } from 'native-base'
import { formatDate, fetchData, post, beautifyTime, formatTime } from '../util'
import Reloading from '../reloading'
import TimeModal from './timemodal'
import { debounce } from 'lodash'

export default class MorningReminderCard extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
        isLoading: true,
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
    }
    this.fetchData = this.fetchData.bind(this)
    this.onSendMessageDelay = debounce(this.sendMessage, 1000).bind(this)
  }

  componentDidMount() {
    const { date } = this.props
    this.fetchData(this.props.child_id, new Date(date.getTime()))
  }

  componentDidUpdate(prevProps) {
    if (this.props.date !== prevProps.date) {
      // console.log('this.props.date !== prevProps.date')
      this.setState({ isLoading: true, text: '', scrollHeight: '100%', includeMilkIntake: false, milk_timestamp: new Date(), milk_amount: '', 
        includeDiaper: false, diaper_timestamp: new Date(), diaper_type: '小便' })
      this.fetchData(this.props.child_id, new Date(this.props.date.getTime()));
    } else if (this.props.child_id !== prevProps.child_id) {
      this.setState({ isLoading: true, text: '', scrollHeight: '100%', includeMilkIntake: false, milk_timestamp: new Date(), milk_amount: '', 
        includeDiaper: false, diaper_timestamp: new Date(), diaper_type: '小便' })
      this.fetchData(this.props.child_id, new Date());
    // } else if (this.props.present !== prevProps.present) {
    //     this.setState({ present: this.props.present })
    } else if (this.props.isConnected != prevProps.isConnected) {
      this.setState({
        isConnected: this.props.isConnected
      })
    }
  }

  setScrollHeight(scrollHeight) {
    // console.log('scrollHeight: ', scrollHeight)
    this.setState({ scrollHeight })
  }

  async fetchData(child_id, date) {
    const start_date = formatDate(date)
    date.setDate(date.getDate() + 1)
    const end_date = formatDate(date)
    const messageData = await fetchData('morningreminder', child_id, start_date, end_date)
    // console.log('messageData: ', messageData)
    if (messageData.data === undefined || messageData.data[start_date] === undefined) {
      this.setState({
        isLoading: false,
        morning_reminder_id: null,
        text: '',
        reminder_read: false
      })
      return
    }
    this.setState({
        isLoading: false,
        morning_reminder_id: messageData.data[start_date].morning_reminder_id,
        text: messageData.data[start_date].text,
        reminder_read: messageData.data[start_date].reminder_read
    })
  }

  async sendMessage() {
    const { class_id, date, parent_id } = this.props
    const { text, morning_reminder_id, isConnected, 
      includeMilkIntake, milk_timestamp, milk_amount, includeDiaper, diaper_timestamp, diaper_type } = this.state
    if (!this.editable() || (text === '' && !includeMilkIntake && !includeDiaper)) return
    if (!isConnected) {
      alert('網路連不到! 請稍後再試試看')
      return
    }

    let reminder = text
    if(includeDiaper) {
      reminder = `如廁: ${beautifyTime(diaper_timestamp)} ${diaper_type}\n` + reminder
    }
    if (includeMilkIntake) {
      reminder = `餵奶: ${beautifyTime(milk_timestamp)} ${milk_amount} c.c.\n` + reminder
    }

    const body = {
        morning_reminder_id,
        student_id: this.props.child_id,
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
    this.setState({
      includeMilkIntake: false,
      milk_timestamp: new Date(),
      milk_amount: '',
      includeDiaper: false,
      diaper_timestamp: new Date(),
      diaper_type: '小便',
      morning_reminder_id: ''
    })

    this.fetchData(this.props.child_id, new Date(this.props.date))
  }

  editable() {
    const { date } = this.props
    const threshold = new Date()
    threshold.setHours(10, 0, 0)
    return (date.toDateString() === (new Date).toDateString() && new Date() < threshold) || (date.toDateString() !== (new Date).toDateString() && date > (new Date()))
    // return true
  }

  selectDatetimeConfirm(datetime) {
    const { showDateTimeModalType } = this.state
    if ( showDateTimeModalType === 'milkintake') {
      this.setState({
        milk_timestamp: datetime,
        // showDateTimeModal: false
      })
    } else if (showDateTimeModalType === 'diaper') {
      this.setState({
        diaper_timestamp: datetime,
        // showDateTimeModal: false
      })
    }
  }

  render() {
    const { isLoading, text, scrollHeight, morning_reminder_id, reminder_read, 
      milk_timestamp, milk_amount, diaper_timestamp, diaper_type, showDateTimeModal, includeMilkIntake, includeDiaper } = this.state
    // console.log('this.state: ', this.state)
    return (
      <Card style={{ width: '93%' }}>
        {/* {showDateTimeModal &&
          <TimeModal
            start_date={new Date()}
            datetime_type={'time'}
            hideModal={() => this.setState({ showDateTimeModal: false })}
            selectDatetimeConfirm={(datetime) => this.selectDatetimeConfirm(datetime)}
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
                    disabled={true}
                    onClick={() => {
                      if (!this.editable()) return
                      this.setState({ includeMilkIntake: !includeMilkIntake })
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
                    onClick={() => {
                      if (!this.editable()) return
                      this.setState({
                        showDateTimeModalType: 'milkintake',
                        // showDateTimeModal: true,
                        includeMilkIntake: true
                      })
                      this.props.showTimeModal()
                    }}
                  >
                    <Text style={{ fontSize: 25 }}>{`${beautifyTime(milk_timestamp)}`}</Text>
                  </TouchableOpacity>
                  <TextInput
                    editable={this.editable()}
                    style={{ marginLeft: 15, width: 55, fontSize: 25 }}
                    keyboardType="number-pad"
                    placeholder={'_____'}
                    value={''+milk_amount}
                    onChangeText={(milk_amount) => this.setState({ milk_amount })}
                    onFocus={() => {
                      if (!this.editable()) return
                      this.setState({ includeMilkIntake: true })
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
                    disabled={true}
                    onClick={() => {
                      if (!this.editable()) return
                      this.setState({ includeDiaper: !includeDiaper })
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
                    onClick={() => {
                      if (!this.editable()) return
                      this.setState({
                        showDateTimeModalType: 'diaper',
                        // showDateTimeModal: true,
                        includeDiaper: true
                      })
                      this.props.showTimeModal()
                    }}
                  >
                    <Text style={{ fontSize: 25, padding: 5 }}>{`${beautifyTime(diaper_timestamp)}`}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{ marginLeft: 15, justifyContent: 'center', alignItems: 'center', padding: 10 }}
                    onClick={() => {
                      if (!this.editable()) return
                      this.setState({
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
                    editable={this.editable()}
                    style={{ width: '100%', height: scrollHeight, backgroundColor: '#dcf3d0', 
                      fontSize: 25, paddingTop: 10, padding: 10, marginTop: 10
                    }}
                    placeholder={
                      this.editable() ? 
                        '點擊我開始填寫...' 
                        : isLoading ?
                          '下載中...'
                          :'已不能填寫'
                    }
                    value={text}
                    multiline={true}
                    scrollEnabled={false}
                    // maxLength={200}
                    onChangeText={(text) => this.setState({ text })}
                    onChange={(e) => this.setScrollHeight(e.target.scrollHeight)}
                    onLayout={(event) => {
                      const { scrollHeight } = event.nativeEvent.target
                      this.setState({
                          scrollHeight
                      })
                    }}
                />
                <TouchableOpacity
                    disabled={!this.editable()}
                    style={{ backgroundColor: '#00c07f', padding: 10, justifyContent: 'center', alignItems: 'center' }}
                    underlayColor="transparent"
                    onClick={this.onSendMessageDelay}
                >
                    <Text style={{ fontSize: 25}}>送出</Text>
                </TouchableOpacity>
            </View>
          </View>
        </View>
      </Card>
    );
  }
}
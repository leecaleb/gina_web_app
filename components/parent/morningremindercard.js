import React from 'react'
import { View, Text, Image, TextInput, TouchableHighlight, Alert } from 'react-native'
import { Card, Body } from 'native-base'
import { formatDate, fetchData, post, beautifyTime, formatTime } from '../util'
import Reloading from '../reloading'

export default class MorningReminderCard extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
        isLoading: true,
        present: false,
        morning_reminder_id: null,
        text: '',
        isConnected: true
    }
    this.fetchData = this.fetchData.bind(this)
  }

  componentDidMount() {
    this.fetchData(this.props.child_id, new Date())
  }

  componentDidUpdate(prevProps) {
    if (this.props.date !== prevProps.date) {
      this.setState({ isLoading: true })
      this.fetchData(this.props.child_id, new Date(this.props.date.getTime()));
    } else if (this.props.child_id !== prevProps.child_id) {
      this.setState({ isLoading: true })
      this.fetchData(this.props.child_id, new Date());
    } else if (this.props.present !== prevProps.present) {
        this.setState({ present: this.props.present })
    } else if (this.props.isConnected != prevProps.isConnected) {
      this.setState({
        isConnected: this.props.isConnected
      })
    }
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
        text: ''
      })
      return
    }
    this.setState({
        isLoading: false,
        morning_reminder_id: messageData.data[start_date].morning_reminder_id,
        text: messageData.data[start_date].text
    })
  }

  async sendMessage() {
    const { class_id, date } = this.props
    const { text, present, morning_reminder_id, isConnected } = this.state
    if (!isConnected) {
      alert('網路連不到! 請稍後再試試看')
      return
    }

    const body = {
        morning_reminder_id,
        student_id: this.props.child_id,
        timestamp: formatDate(date) + ' ' + formatTime(date),
        text
    }
    const response = await post(`/morningreminder/class/${class_id}`, body)
    const { success, statusCode, message, data } = response
    if (!success) {
      alert(`Sorry 傳送訊息時電腦出狀況了！請截圖和與工程師聯繫\n\n` + message)
      return 
    }
    alert(`訊息傳達成功！`)
    this.fetchData(this.props.child_id, new Date())
  }

  editable() {
    const { date } = this.props
    const { present } = this.state
    const threshold = new Date()
    threshold.setHours(10, 0, 0)
    return (date.toDateString() === (new Date).toDateString() && new Date() < threshold) || date > (new Date())
  }

  render() {
    const { text } = this.state
    // console.log(this.state)

    return (
      <Card style={{ width: '93%' }}>
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
            <View style={{ paddingTop: 8 }}>
              <Text style={{ fontSize: 20 }}>愛的叮嚀</Text>
            </View>
            <View style={{ flex: 1, paddingVertical: 8, paddingRight: 8 }}>
                <TextInput
                    editable={this.editable()}
                    style={{ width: '100%', backgroundColor: '#dcf3d0', fontSize: 25, paddingTop: 10, padding: 10 }}
                    placeholder={this.editable() ? '點擊我開始填寫...' : '已不能填寫'}
                    value={text}
                    multiline={true}
                    scrollEnabled={false}
                    maxLength={100}
                    onChangeText={(text) => this.setState({ text })}
                />
                <TouchableHighlight
                    disabled={!this.editable()}
                    style={{ backgroundColor: '#00c07f', padding: 10, justifyContent: 'center', alignItems: 'center' }}
                    underlayColor="transparent"
                    onPress={() => this.sendMessage()}
                >
                    <Text style={{ fontSize: 25}}>送出</Text>
                </TouchableHighlight>
            </View>
          </View>
        </View>
      </Card>
    );
  }
}
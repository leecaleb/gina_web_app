import React from 'react'
import { View, Text, Image } from 'react-native'
import { Card } from 'native-base'
import { formatDate, fetchData } from '../util';
import Reloading from '../reloading'

export default class SleepCard extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isLoading: true
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
      this.fetchData(this.props.child_id, new Date(this.props.date.getTime()));
    }
  }

  async fetchData(child_id, date) {
    if (date.getHours() < 17) {
      this.setState({
        isLoading: false
      })
      return
    }
    const start_date = formatDate(date)
    date.setDate(date.getDate() + 1)
    const end_date = formatDate(date)
    const sleepData = await fetchData('sleep', child_id, start_date, end_date)
    this.setState({
      sleepData,
      isLoading: false
    })
  }

  render() {
    const { sleepData, isLoading } = this.state
    const today = formatDate(this.props.date)
    return (
      <Card style={{ width: '93%' }}>
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <View style={{ width: 56, height: 56, justifyContent: 'center', alignItems: 'center'}}>
            <Image
              source={require('../../assets/icon-sleep.png')}
              style={{
                  width: 48,
                  height: 48
              }}
            />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ paddingTop: 8 }}>
              <Text style={{ fontSize: 20 }}>睡眠</Text>
            </View>
            {isLoading ? 
              <Reloading />
              : sleepData && sleepData[today] ?
                <View style={{ flex: 1, paddingVertical: 8 }}>
                  <View
                    style={{ flexDirection: 'row', paddingBottom: 5 }}
                  >
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                      <Text style={{ fontSize: 15, textAlign: 'center', color: '#606060' }}>從</Text>
                    </View>
                    <View style={{ flex: 1}}>
                    </View>
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                      <Text style={{ fontSize: 15, textAlign: 'center', color: '#606060' }}>到</Text>
                    </View>
                  </View>
                  {sleepData[today].map((record, index) => {
                    const { sleep_time, wake_time, hours, minutes } = record
                    return (
                      <View
                        key={index}
                        style={{ flexDirection: 'row' }}
                      >
                        <View style={{ flex: 1, justifyContent: 'center' }}>
                          <Text style={{ fontSize: 25, textAlign: 'center', color: '#404040' }}>{sleep_time}</Text>
                        </View>
                        <View style={{ flex: 1, justifyContent: 'center'}}>
                          <Text style={{ fontSize: 15, textAlign: 'center', color: '#404040' }}>{hours}H {minutes}M</Text>
                        </View>
                        <View style={{ flex: 1, justifyContent: 'center' }}>
                          <Text style={{ fontSize: 25, textAlign: 'center', color: '#404040' }}>{wake_time}</Text>
                        </View>
                      </View>
                    )
                  })}
                </View>
                : <View style={{ flex: 1, paddingVertical: 8 }}>
                  <Text>沒有新紀錄</Text>
                </View>
            }
          </View>
        </View>
      </Card>
    );
  }
}
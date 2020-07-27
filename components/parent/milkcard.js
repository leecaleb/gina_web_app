import React from 'react'
import { View, Text, Image } from 'react-native'
import { Card } from 'native-base'
import { formatDate, fetchData, formatTime } from '../util';
import Reloading from '../reloading';

export default class MilkCard extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isLoading: true
    }
    this.fetchData = this.fetchData.bind(this)
  }

  componentDidMount() {
    const { date } = this.props
    this.fetchData(this.props.child_id, new Date(date.getTime()))
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
    const milkIntakeData = await fetchData('milkintake', child_id, start_date, end_date)
    this.setState({
      milkIntakeData,
      isLoading: false
    })
  }

  render() {
    const { milkIntakeData, isLoading } = this.state
    // console.log('milkIntakeData: ', milkIntakeData)
    const today = formatDate(this.props.date)
    return (
      <Card style={{ width: '93%' }}>
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <View style={{ width: 56, height: 56, justifyContent: 'center', alignItems: 'center'}}>
            <Image
              source={require('../../assets/icon-milk.png')}
              style={{
                  width: 48,
                  height: 48
              }}
            />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ paddingTop: 8 }}>
              <Text style={{ fontSize: 20 }}>喝奶</Text>
            </View>
            {isLoading ? 
              <Reloading />
            : milkIntakeData && milkIntakeData[today] ?
                <View style={{ flex: 1, paddingVertical: 8 }}>
                  <View
                    style={{ flexDirection: 'row', paddingBottom: 5 }}
                  >
                    <View style={{ width: '25%', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 15, textAlign: 'center', color: '#606060' }}>時間</Text>
                    </View>
                    <View style={{ width: '28%', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 15, textAlign: 'center', color: '#606060' }}>量</Text>
                    </View>
                    <View style={{ width: '28%', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 15, textAlign: 'center', color: '#606060' }}>乳品</Text>
                    </View>
                    <View style={{ width: '19%', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 15, textAlign: 'center', color: '#606060' }}>老師</Text>
                    </View>
                  </View>
                  {milkIntakeData[today].map((record, index) => {
                    const { time, amount, milk_type, teacher_name } = record
                    return (
                      <View key={index}
                        style={{ flexDirection: 'row' }}
                      >
                        <View style={{ width: '25%' }}>
                          <Text style={{ fontSize: 20, textAlign: 'center', color: '#404040' }}>{time}</Text>
                        </View>
                        <View style={{ width: '28%' }}>
                          <Text style={{ fontSize: 20, textAlign: 'center', color: '#404040' }}>{amount} c.c.</Text>
                        </View>
                        <View style={{ width: '28%' }}>
                          <Text style={{ fontSize: 20, textAlign: 'center', color: '#404040' }}>{milk_type}</Text>
                        </View>
                        <View style={{ width: '19%' }}>
                          <Text style={{fontSize: 20, textAlign: 'center', color: '#404040' }}>{teacher_name !== null && teacher_name.slice(1)}</Text>
                        </View>
                      </View>
                    )
                  })}
                </View>
              : <View style={{ flex: 1, paddingVertical: 8  }}>
                  <Text style={{ fontSize: 17 }}>沒有新紀錄</Text>
                </View>
            }
          </View>
        </View>
      </Card>
    );
  }
}
import React from 'react'
import { View, Text, Image } from 'react-native'
import { Card } from 'native-base'
import { formatDate, fetchData } from '../util'
import Reloading from '../reloading'

export default class WellnessCard extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      child_id: this.props.child_id,
      isLoading: true
    }
    this.fetchData = this.fetchData.bind(this)
  }

  componentDidMount() {
    const { date } = this.props
    this.fetchData(this.state.child_id, new Date(date.getTime()))
  }

  componentDidUpdate(prevProps) {
    if (this.props.date !== prevProps.date) {
      this.setState({ isLoading: true })
      this.fetchData(this.props.child_id, new Date(this.props.date.getTime()));
    } else if (this.props.child_id !== prevProps.child_id) {
      this.setState({ isLoading: true })
      this.fetchData(this.props.child_id, new Date());
    }
  }

  async fetchData(child_id, date) {
    // const date = new Date(datetime.getTime())
    const start_date = formatDate(date)
    date.setDate(date.getDate() + 1)
    const end_date = formatDate(date)
    const wellnessData = await fetchData('wellness', child_id, start_date, end_date)
    this.setState({
      wellnessData,
      isLoading: false
    }) 
    if (wellnessData && wellnessData[start_date]) {
      this.props.updateTitleTemp(wellnessData[start_date][0][1])
    } else {
      this.props.updateTitleTemp('')
    }
  }

  render() {
    const { wellnessData, isLoading} = this.state
    const date = formatDate(this.props.date)
    return (
      <Card style={{ width: '93%' }}>
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <View style={{ width: 56, height: 56, justifyContent: 'center', alignItems: 'center'}}>
            <Image
              source={require('../../assets/icon-wellness.png')}
              style={{
                  width: 48,
                  height: 48
              }}
            />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ paddingTop: 8 }}>
              <Text style={{ fontSize: 20 }}>健康</Text>
            </View>
            {isLoading ? 
              <Reloading />
              : wellnessData && wellnessData[date] ? 
                <View style={{ flex: 1, paddingVertical: 8 }}>
                  <View
                    style={{ flexDirection: 'row' }}
                  >
                    <View style={{ flex: 1, justifyContent: 'center', paddingBottom: 5 }}>
                      <Text style={{ fontSize: 15, textAlign: 'center', color: '#606060' }}>時間</Text>
                    </View>
                    <View style={{ flex: 1, justifyContent: 'center'  }}>
                      <Text style={{ fontSize: 15, textAlign: 'center', color: '#606060' }}>體溫</Text>
                    </View>
                    <View style={{ flex: 2, justifyContent: 'center'  }}>
                      <Text style={{ fontSize: 15, textAlign: 'center', color: '#606060' }}>今日狀況</Text>
                    </View>
                  </View>
                  {wellnessData[date].map((record, index) => {
                    return (
                      <View
                        key={index}
                        style={{ flexDirection: 'row' }}
                      >
                        <View style={{ flex: 1, justifyContent: 'center' }}>
                          <Text style={{ fontSize: 25, textAlign: 'center', color: '#404040' }}>{record[0]}</Text>
                        </View>
                        <View style={{ flex: 1, justifyContent: 'center'  }}>
                          <Text style={{ fontSize: 25, textAlign: 'center', color: '#404040' }}>{record[1]}°</Text>
                        </View>
                        <View style={{ flex: 2, justifyContent: 'center'  }}>
                          <Text style={{ fontSize: 25, textAlign: 'center', color: '#404040' }}>{record[2]}</Text>
                        </View>
                      </View>
                    )
                  })}
                </View>
                : <View style={{ flex: 1, paddingVertical: 8 }}>
                    <Text style={{ fontSize: 17 }}>沒有新紀錄</Text>
                </View>
            }
          </View>
        </View>
      </Card>
    );
  }
}
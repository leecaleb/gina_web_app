import React from 'react'
import { View, Text, TextInput, Image } from 'react-native'
import { Card, CardItem, Button } from 'native-base'
import { formatDate, fetchData, beautifyDate } from '../util'
import Reloading from '../reloading'

export default class AppetiteCard extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      child_id: this.props.child_id,
      // rankings: ['Ok', 'Good', 'Awesome!'],
      fruit_name: null,
      isLoading: true,
      breakfast: null,
      fruit: null,
      lunch: null,
      snack: null,
      // rating: {
      //   'Awesome': '滿滿一碗',
      //   'Good': '７/8分滿',
      //   'Ok': '半碗',
      //   'Poor': '胃口不佳'
      // }
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
    const appetiteData = await fetchData('appetite', child_id, start_date, end_date)
    this.denormalizeAppetiteData(appetiteData.data, date)
  }

  denormalizeAppetiteData(appetiteData) {
    const { date } = this.props
    const today = formatDate(date)
    if (appetiteData && appetiteData[today]){
      const { fruit_name, breakfast_rating, fruit_rating, lunch_rating, snack_rating } = appetiteData[today]
      // console.log('fruit_name: ', fruit_name)
      const breakfast = this.parseData(breakfast_rating)
      const fruit = this.parseData(fruit_rating)
      const lunch = this.parseData(lunch_rating)
      const snack = this.parseData(snack_rating)

      this.setState({
        fruit_name,
        breakfast,
        fruit,
        lunch,
        snack,
        appetiteData,
        isLoading: false
      })
    } else {
      this.setState({
      appetiteData,
      isLoading: false
    })
    }
  }

  parseData(data_string) {
    const rating = data_string.slice(0, -1)
    const water_drunk = parseInt(data_string.slice(-1))
    // const rating_icons = {
    //   'Awesome': require('../../assets/icon-appetite-awesome.png'),
    //   'Good': require('../../assets/icon-appetite-good.png'),
    //   'Ok': require('../../assets/icon-appetite-ok.png')
    // }
    return {
      // rating_icon: rating_icons[rating],
      rating,
      water_drunk
    }
  }

  getEmoji() {

  }

  getWaterDrinkingStatus() {
    
  }

  render() {
    const { appetiteData, isLoading, breakfast, fruit, lunch, snack, rating, fruit_name } = this.state
    const today = formatDate(this.props.date)
    return (
      <Card style={{ width: '93%' }}>
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <View style={{ width: 56, height: 56, justifyContent: 'center', alignItems: 'center'}}>
            <Image
              source={require('../../assets/icon-appetite.png')}
              style={{
                  width: 48,
                  height: 48
              }}
            />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ paddingTop: 8 }}>
              <Text style={{ fontSize: 20 }}>飲食</Text>
            </View>
            {isLoading ? 
              <Reloading />
              : appetiteData && appetiteData[today] ? 
                <View>
                  <View style={{ flex: 1, flexDirection: 'row', paddingVertical: 8 }}>
                  {breakfast ?
                    <View style={{ width: '45%', justifyContent: 'center', backgroundColor: '#F5F5F5', marginRight: '5%' }}>
                      <View style={{ padding: 5 }}>
                        <Text style={{ fontSize: 17, color: 'rgba(0,0,0,0.8)'}}>早餐</Text>
                      </View>
                      <View
                        style={{
                          justifyContent: 'center',
                          alignItems: 'center',
                          padding: 8
                        }}
                      >
                        <Text style={{ fontSize: 20 }}>{breakfast.rating || ' '}</Text>
                      </View>

                      <View style={{ padding: 5, justifyContent: 'center' }}>
                        <Text style={{ fontSize: 17, textAlign: 'center' }}>
                          {breakfast.water_drunk ?
                            '有喝水' : ' '
                          }
                        </Text>
                      </View>
                    </View>
                    : null
                  }

                  {fruit ?
                    <View style={{ width: '45%', justifyContent: 'center', backgroundColor: '#F5F5F5', marginRight: '5%' }}>
                      <View style={{ padding: 5 }}>
                        <Text style={{ fontSize: 17, color: 'rgba(0,0,0,0.8)'}}>{(fruit_name !== '水果' && `水果餐: ${fruit_name}`) || '水果'}</Text>
                      </View>
                      <View
                        style={{
                          justifyContent: 'center',
                          alignItems: 'center',
                          padding: 8
                        }}
                      >
                        <Text style={{ fontSize: 20 }}>{fruit.rating || ' '}</Text>
                      </View>

                      <View style={{ padding: 5, justifyContent: 'center' }}>
                        <Text style={{ fontSize: 17, textAlign: 'center' }}>
                          {fruit.water_drunk ?
                            '有喝水' : ' '
                          }
                        </Text>
                      </View>
                    </View>
                    : null
                  }
                  </View>
                  <View style={{ flex: 1, flexDirection: 'row', paddingVertical: 8 }}>
                  {lunch ?
                    <View style={{ width: '45%', justifyContent: 'center', backgroundColor: '#F5F5F5', marginRight: '5%' }}>
                      <View style={{ padding: 5 }}>
                        <Text style={{ fontSize: 17, color: 'rgba(0,0,0,0.8)'}}>午餐</Text>
                      </View>

                      <View
                        style={{
                          justifyContent: 'center',
                          alignItems: 'center',
                          padding: 8
                        }}
                      >
                        <Text style={{ fontSize: 20 }}>{lunch.rating || ' '}</Text>
                      </View>

                      <View style={{ padding: 5, justifyContent: 'center' }}>
                        <Text style={{ fontSize: 17, textAlign: 'center' }}>
                          {lunch.water_drunk ?
                            '有喝水' : ' '
                          }
                        </Text>
                      </View>

                    </View>
                    : null
                  }

                  {snack ?
                    <View style={{ width: '45%', justifyContent: 'center', backgroundColor: '#F5F5F5', marginRight: '5%' }}>
                      <View style={{ padding: 5 }}>
                        <Text style={{ fontSize: 17, color: 'rgba(0,0,0,0.8)'}}>點心</Text>
                      </View>

                      <View
                        style={{
                          justifyContent: 'center',
                          alignItems: 'center',
                          padding: 8
                        }}
                      >
                        <Text style={{ fontSize: 20 }}>{snack.rating || ' '}</Text>
                      </View>

                      <View style={{ padding: 5, justifyContent: 'center' }}>
                        <Text style={{ fontSize: 17, textAlign: 'center' }}>
                          {snack.water_drunk ?
                            '有喝水' : ' '
                          }
                        </Text>
                      </View>
                    </View>
                    : null
                  }

                </View>
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
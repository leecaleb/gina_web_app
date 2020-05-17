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
      rating: {
        'Awesome': '胃口好',
        'Good': '還不錯',
        'Ok': '吃不多'
      }
    }
    this.fetchData = this.fetchData.bind(this)
  }

  componentDidMount() {
    this.fetchData(this.state.child_id, new Date())
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
    const rating_icons = {
      'Awesome': require('../../assets/icon-appetite-awesome.png'),
      'Good': require('../../assets/icon-appetite-good.png'),
      'Ok': require('../../assets/icon-appetite-ok.png')
    }
    return {
      rating_icon: rating_icons[rating],
      rating,
      water_drunk
    }
  }

  getEmoji() {

  }

  getWaterDrinkingStatus() {
    
  }

  render() {
    const { appetiteData, isLoading, breakfast, fruit, lunch, snack, rating} = this.state
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
                <View style={{ flex: 1, flexDirection: 'row', paddingVertical: 8 }}>
                  {breakfast ?
                    <View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#F5F5F5', marginRight: 10 }}>
                      <View style={{ padding: 5 }}>
                        <Text style={{color: 'rgba(0,0,0,0.8)'}}>早餐</Text>
                      </View>
                      <View
                        style={{
                          width: '100%',
                          aspectRatio: 1,
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}
                      >
                        {/* {breakfast.rating_icon ?
                          <Image source={breakfast.rating_icon} />
                          :  */}
                          <Text style={{ fontSize: 20 }}>{rating[breakfast.rating]}</Text>
                        {/* } */}
                      </View>

                      <View style={{ padding: 5, justifyContent: 'center' }}>
                        <Text style={{ fontSize: 13, textAlign: 'center' }}>
                          {breakfast.water_drunk ?
                            '有喝水' : ''
                          }
                        </Text>
                      </View>
                    </View>
                    : null
                  }

                  {fruit ?
                    <View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#F5F5F5', marginRight: 10 }}>
                      <View style={{ padding: 5 }}>
                        <Text style={{color: 'rgba(0,0,0,0.8)'}}>水果</Text>
                      </View>
                      <View
                        style={{
                          width: '100%',
                          aspectRatio: 1,
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}
                      >
                        {/* {fruit.rating_icon ?
                          <Image source={fruit.rating_icon} />
                          :  */}
                          <Text style={{ fontSize: 20 }}>{rating[fruit.rating]}</Text>
                        {/* } */}
                      </View>

                      <View style={{ padding: 5, justifyContent: 'center' }}>
                        <Text style={{ fontSize: 13, textAlign: 'center' }}>
                          {fruit.water_drunk ?
                            '有喝水' : ''
                          }
                        </Text>
                      </View>
                    </View>
                    : null
                  }

                  {lunch ?
                    <View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#F5F5F5', marginRight: 10 }}>
                      <View style={{ padding: 5 }}>
                        <Text style={{color: 'rgba(0,0,0,0.8)'}}>午餐</Text>
                      </View>

                      <View
                        style={{
                          width: '100%',
                          aspectRatio: 1,
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}
                      >
                        {/* {lunch.rating_icon ?
                          <Image source={lunch.rating_icon} />
                          :  */}
                          <Text style={{ fontSize: 20 }}>{rating[lunch.rating]}</Text>
                        {/* } */}
                      </View>

                      <View style={{ padding: 5, justifyContent: 'center' }}>
                        <Text style={{ fontSize: 13, textAlign: 'center' }}>
                          {lunch.water_drunk ?
                            '有喝水' : ''
                          }
                        </Text>
                      </View>

                    </View>
                    : null
                  }

                  {snack ?
                    <View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#F5F5F5', marginRight: 10 }}>
                      <View style={{ padding: 5 }}>
                        <Text style={{color: 'rgba(0,0,0,0.8)'}}>點心</Text>
                      </View>

                      <View
                        style={{
                          width: '100%',
                          aspectRatio: 1,
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}
                      >
                        {/* {snack.rating_icon ?
                          <Image source={snack.rating_icon} />
                          :  */}
                          <Text style={{ fontSize: 20 }}>{rating[snack.rating]}</Text>
                        {/* } */}
                      </View>

                      <View style={{ padding: 5, justifyContent: 'center' }}>
                        <Text style={{ fontSize: 13, textAlign: 'center' }}>
                          {snack.water_drunk ?
                            '有喝水' : ''
                          }
                        </Text>
                      </View>
                    </View>
                    : null
                  }

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
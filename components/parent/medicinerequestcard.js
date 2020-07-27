import React from 'react'
import { View, Text, TextInput, Image, TouchableOpacity, ScrollView, Alert } from 'react-native'
import { Card, CardItem, Button } from 'native-base'
import { formatDate, fetchData, beautifyTime } from '../util'
import Reloading from '../reloading'
import { connect } from 'react-redux'
import { bindActionCreators} from 'redux'
import { getMedRequestSuccess } from '../../redux/parent/actions/index'
import ENV from '../../variables'

class MedicationRequestCard extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isLoading: true,
      med_requests: [],
      // date: new Date()
    }
  }

  componentDidMount() {
    const { date } = this.props
    this.fetchData(this.props.child_id, new Date(date.getTime()))
  }

  componentDidUpdate(prevProps) {
    if (this.props.date !== prevProps.date) {
      // const { date } = this.props
      // console.log('this.props.date !== prevProps.date: ', this.props.date.toDateString())
      this.setState({ isLoading: true })
      this.fetchData(this.props.child_id, new Date(this.props.date.getTime()));
    } else if (this.props.child_id !== prevProps.child_id) {
      // console.log('this.props.child_id !== prevProps.child_id')
      this.setState({ isLoading: true })
      this.fetchData(this.props.child_id, new Date());
    }
  }

  afterFive() {
    const { date } = this.props
    return date.getHours() >= 17
  }

  async fetchData(student_id, date) {
    const query = `https://iejnoswtqj.execute-api.us-east-1.amazonaws.com/${ENV}/medicationrequest/student/${student_id}?date=${formatDate(date)}`
    await fetch(query, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        }
    })
      .then((res) => res.json())
      .then((resJson) => {
          const {data} = resJson
          const med_requests = this.get_todays_requests(data, date)
          this.setState({
            med_requests
          })
          this.setState({ isLoading: false })
      })
      .catch(err => {
          alert('Sorry 取得今日托藥單時電腦出狀況了！請與工程師聯繫: error occurred when fetching medication request')
      })
  }

  get_todays_requests(object_array, date) {
    // const { date } = this.props
    let med_requests = []
    for (var i = 0; i < object_array.length; i++) {
      const timestamp = new Date(object_array[i].title)
      // console.log('timestamp: ', timestamp.toDateString())
      // console.log('date: ', date.toDateString())
      if (timestamp.toDateString() === (date).toDateString()) {
        med_requests = object_array[i].data
        for(var j = 0; j < med_requests.length; j++) {
          med_requests[j].timestamp = new Date(med_requests[j].timestamp)
        }
        break
      }
    }
    return med_requests
  }

  render() {
    const { med_requests } = this.state
    const { isLoading } = this.state
    // console.log('med_requests: ', med_requests)
    // console.log('med/this.props.date: ', this.props.date.toDateString())
    return (
      <Card style={{ width: '93%' }}>
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <View style={{ width: 56, height: 56, justifyContent: 'center', alignItems: 'center'}}>
            <Image
              source={require('../../assets/icon-medrequest.png')}
              style={{
                  width: 48,
                  height: 48
              }}
            />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ paddingTop: 8 }}>
              <Text style={{ fontSize: 20 }}>今日藥單</Text>
            </View>
            {isLoading ? 
              <Reloading />
              : med_requests.length ? 
                <View style={{ flex: 1, flexDirection: 'row', paddingVertical: 8 }}>
                  <ScrollView horizontal contentContainerStyle={{ paddingBottom: 10}}>
                  {med_requests.map((request, index) => {
                    return (
                      <TouchableOpacity 
                        key={request.id}
                        style={{
                          padding: 10,
                          backgroundColor: '#F5F5F5', 
                          marginRight: 15, 
                          justifyContent: 'center'
                        }}
                        underlayColor='#ff8944'
                        onClick={() => this.props.viewMedRequest(index, med_requests)}
                      >
                        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                          {this.afterFive() && request.administered ? 
                            <Image
                              source={require('../../assets/icon-checked.png')}
                              style={{
                                  width: 20,
                                  height: 20
                              }}
                            />
                            : null
                          }
                          <Text style={{ alignSelf: 'center', fontSize: 25, color: 'rgba(0,0,0,0.8)' }}>{beautifyTime(request.timestamp)}</Text>
                        </View>
                      </TouchableOpacity>
                    )
                  })}
                  </ScrollView>
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

const mapStateToProps = (state) => {
  return {
    med_requests: state.parent.med_requests
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    ...bindActionCreators({getMedRequestSuccess}, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps, null, { forwardRef: true }) (MedicationRequestCard)
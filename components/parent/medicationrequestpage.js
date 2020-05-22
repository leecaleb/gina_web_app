import React from 'react'
import {
    View, TouchableHighlight, Text, Animated, ScrollView, Alert, SectionList, Dimensions, Platform
} from 'react-native'
import MedicationRequestMain from './medicationrequestmain'
import { formatDate, beautifyTime, beautifyDate, beautifyMonthDate, get } from '../util'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { getMedRequestSuccess } from '../../redux/parent/actions/index'
import ENV from '../../variables'


const { width } = Dimensions.get('window')

class MedicationRequestPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            today: new Date(),
            tomorrow: new Date(),
            SlideInRight: new Animated.Value(0),
            SlideInLeft: new Animated.Value(0),
            total_height: 1,
            total_width: 1,
            height: 0,
            width: 0,
            left: 0,
            top: 0,
            requests: [],
            day_of_week: ['天', '一', '二', '三', '四', '五', '六'],
            selected_request_index: -1
        }
    }

    componentDidMount() {
        const { selected_request_index } = this.props.route.params
        const { tomorrow } = this.state
        tomorrow.setDate(tomorrow.getDate() + 1)
        this.setState({
            tomorrow
        })
        this.fetchMedicationRequest()
        this.initializePage()
        if (selected_request_index !== undefined) {
            // console.log(selected_request_index)
            this.selectRequest(selected_request_index)
        }
    }

    isIOS() {
        return Platform.OS === 'ios'
    }

    async fetchMedicationRequest() {
        const { isConnected } = this.props
        if (!isConnected) {
            alert('網路連不到! 請稍後再試試看')
            return
        }
        const {student_id, onGoBack} = this.props.route.params
        const date = formatDate(new Date())
        const response = await get(`/medicationrequest/student/${student_id}?date=${date}`)
        const { success, statusCode, message, data } = response
        // console.log('fetchMedicationRequest: ', response)
        if (!success) {
            alert('Sorry 取得托藥單時電腦出狀況了！請稍後再試試或請截圖和與工程師聯繫\n\n' + message)
            return
        }
        this.denormalize(data)
        this.setState({ requests: data })
        onGoBack()
    }

    denormalize(object_array) {
        for (var i = 0; i < object_array.length; i++) {
            object_array[i].title = new Date(object_array[i].title)
            for (var j = 0; j < object_array[i].data.length; j++) {
                object_array[i].data[j].timestamp = new Date(object_array[i].data[j].timestamp)
            }
        }
    }

    initializePage() {
        Animated.sequence([
            Animated.timing(
                this.state.SlideInRight, 
                {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true
                }
            ),
            Animated.timing(
                this.state.SlideInLeft,
                {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true
                }
            )
        ]).start()
        
    }

    viewRequest() {
        this.setState({
            SlideInLeft: new Animated.Value(0)
        }, () => {
            Animated.timing(
                this.state.SlideInLeft,
                {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true
                }
            ).start()
        })
    }

    selectRequest(index) {
        const access_mode = this.refs['main'].fetchAccessMode()
        if (access_mode === 'edit') {
            alert('還在編輯中喔請完成再離開 多謝')
            return
        }
        this.setState({ selected_request_index: index })
    }

    async onCreateRequestSuccess(request_id) {
        await this.fetchMedicationRequest()
        const { requests } = this.state
        this.get_todays_requests(requests)
        let new_request_index = -1
        for (var i = 0; i < requests.length; i++) {
            if (requests[i].id === request_id) {
                new_request_index = i
                break
            }
        }
        this.setState({
            selected_request_index: new_request_index
        })
    }

    get_todays_requests(object_array) {
        let med_requests = []
        for (var i = 0; i < object_array.length; i++) {
            const timestamp = new Date(object_array[i].timestamp)
            if (timestamp.toDateString() === (new Date).toDateString()) {
                object_array[i].timestamp = timestamp
                med_requests.push(object_array[i])
            } else break
        }
        this.props.getMedRequestSuccess(med_requests)
    }

    onDeleteRequestSuccess(deleted_request_id) {
        const { requests } = this.state
        const updated_requests = []
        for (var i = 0; i < requests.length; i++) {
            if (requests[i].id !== deleted_request_id) {
                updated_requests.push(requests[i])
            }
        }
        this.setState({
            requests: updated_requests,
            selected_request_index: 0
        })
        this.get_todays_requests(updated_requests)
    }

    deleteRequestConfirm(request_id) {
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
        const { class_id } = this.props.route.params
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
            this.fetchMedicationRequest()
          })
          .catch(err => {
            alert('Sorry 電腦出狀況了！請截圖和與工程師聯繫: error occurred when deleting medication request')
          })
      }

    render () {
        const { SlideInRight, SlideInLeft, total_width, requests, today, tomorrow, day_of_week, selected_request_index } = this.state
        const { student_id, class_id } = this.props.route.params
        // const selected_request = requests[selected_request_index]
        return (
            <View
                style={{
                    flex: 1,
                    paddingHorizontal: 20
                }}
            >
                {requests.length === 0 && 
                    <View style={{ padding: 20, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontSize: 50 }}>無托藥單</Text>
                    </View>
                }
                <SectionList
                    sections={requests}
                    keyExtractor={(item, index) => item + index}
                    renderItem={({ item, index, section }) => 
                        <View 
                            style={{ 
                                width: '100%', 
                                aspectRatio: 5, 
                                flexDirection: 'row', 
                                marginVertical: 7, 
                                justifyContent: 'space-between', 
                                alignItems: 'center'
                            }}
                        >
                            <TouchableHighlight 
                                style={{ 
                                    width:'65%',
                                    height: '100%',
                                    padding: 20, 
                                    backgroundColor: '#368cbf',
                                    borderRadius: 40,
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}
                                onPress={() => this.props.navigation.push('AddMedicationRequestPage', {
                                    onGoBack: () => this.fetchMedicationRequest(),
                                    student_id,
                                    class_id,
                                    index,
                                    data: section.data
                                })}
                            >
                                <Text style={{ fontSize: 30 }}>{beautifyTime(item.timestamp)}</Text>
                            </TouchableHighlight>
                            <TouchableHighlight
                                style={{ 
                                    width:'30%', 
                                    height: '100%',
                                    padding: 20, 
                                    backgroundColor: '#fa625f', 
                                    justifyContent: 'center',
                                    borderRadius: 40
                                }}
                                onPress={() => this.deleteRequestConfirm(item.id)}
                            >
                                <Text style={{ fontSize: width * 0.07, textAlign: 'center' }}>
                                    刪除
                                </Text>
                            </TouchableHighlight>
                        </View>
                    }
                    renderSectionHeader={({ section: { title } }) => (
                        <View
                            style={{ 
                                width: '100%', 
                                backgroundColor: 'rgba(0,0,0,0.5)', 
                                flexDirection: 'row', 
                                alignItems: 'center', 
                                justifyContent: 'space-between',
                                padding: this.isIOS() ? 20 : 12,
                                marginTop: 15,
                                marginBottom: 7,
                                borderRadius: 40
                            }}
                        >
                            <Text style={{ fontSize: 30, color: 'white' }}>{`${beautifyMonthDate(title)}`}</Text>
                            <Text style={{ fontSize: 30, color: 'white' }}>{`星期${day_of_week[title.getDay()]}`}</Text>
                        </View>
                    )}
                />

                <View style={{ width: '100%', paddingVertical: 10, justifyContent: 'center', backgroundColor: 'transparent' }}>
                    <TouchableHighlight
                        style={{ backgroundColor: '#f4d41f', padding: this.isIOS() ? 20 : 12, justifyContent: 'center', borderRadius: 40 }}
                        onPress={() => this.props.navigation.push('AddMedicationRequestPage', {
                            onGoBack: () => this.fetchMedicationRequest(),
                            student_id, 
                            class_id,
                            index: -1,
                            data: null
                        })}
                    >
                        <Text style={{ fontSize: 30, alignSelf: 'center' }}>
                            新增
                        </Text>
                    </TouchableHighlight>
                </View>

                
            </View>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        isConnected: state.parent.isConnected
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators({getMedRequestSuccess}, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(MedicationRequestPage)
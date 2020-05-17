import React from 'react'
import {
    View, TouchableHighlight, Text, Animated, ScrollView, Alert
} from 'react-native'
import MedicationRequestMain from './medicationrequestmain'
import { formatDate, beautifyTime } from '../util'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { getMedRequestSuccess } from '../../redux/parent/actions/index'

class MedicationRequestPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            todays_date: formatDate(new Date()),
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
        this.fetchMedicationRequest()
        this.initializePage()
        if (selected_request_index !== undefined) {
            // console.log(selected_request_index)
            this.selectRequest(selected_request_index)
        }
    }

    async fetchMedicationRequest() {
        const {student_id} = this.props.route.params
        const date = formatDate(new Date())
        const query = `https://iejnoswtqj.execute-api.us-east-1.amazonaws.com/dev/medicationrequest/student/${student_id}?date=${date}`
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
                this.denormalize(data)
                this.setState({ requests: data })
            })
            .catch(err => {
                Alert.alert(
                    'Sorry 電腦出狀況了！',
                    '請與工程師聯繫: error occurred when fetching medication request',
                    [{ text: 'Ok' }]
                )
            })
    }

    denormalize(object_array) {
        for (var i = 0; i < object_array.length; i++) {
            object_array[i].timestamp = new Date(object_array[i].timestamp)

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
            Alert.alert(
                '還在編輯中喔',
                '請完成再離開 多謝',
                [
                    { text: 'Ok' }
                ]
            )
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

    render () {
        const { SlideInRight, SlideInLeft, total_width, requests, todays_date, day_of_week, selected_request_index } = this.state
        const { student_id, class_id } = this.props.route.params
        const selected_request = requests[selected_request_index]
        return (
            <View
                style={{
                    flex: 1,
                    alignItems: 'flex-end'
                }}
            >
                <View
                    style={{ flex: 3, width: '100%', paddingVertical: 20, paddingRight: 20, justifyContent: 'center' }}
                    onLayout={event => {
                        const { x, y, width, height } = event.nativeEvent.layout
                        this.setState({
                            total_width: width
                        })
                    }}
                >
                    <Animated.View
                        style={{
                            opacity: SlideInLeft,
                            transform: [
                                {
                                    translateX: SlideInLeft.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [-total_width, 0]
                                    })
                                }
                            ],
                            position: 'absolute',
                            flex: 1,
                            padding: 15,
                            height: '100%',
                            width: '100%',
                            borderTopRightRadius: 10,
                            borderBottomRightRadius: 10,
                            backgroundColor: "#ffddb7",
                            justifyContent: "center"
                        }}
                    >
                        <MedicationRequestMain
                            ref='main'
                            student_id={student_id}
                            class_id={class_id}
                            request={selected_request}
                            onCreateRequestSuccess={(request_id) => this.onCreateRequestSuccess(request_id)}
                            onDeleteRequestSuccess={(deleted_request_id) => this.onDeleteRequestSuccess(deleted_request_id)}
                        />
                    </Animated.View>
                </View>
                <View style={{ flex: 1 }}>
                    <ScrollView
                        horizontal
                    >
                        {requests.map((request, index) => {
                            const day = day_of_week[request.timestamp.getDay()]
                            const date = `${request.timestamp.getMonth()+1}/${request.timestamp.getDate()}`
                            const time = beautifyTime(request.timestamp)
                            return (
                                <Animated.View
                                    key={request.id}
                                    style={{
                                        transform: [
                                            {
                                                translateX: SlideInRight.interpolate({
                                                    inputRange: [0,1],
                                                    outputRange: [total_width, 0]
                                                })
                                            }
                                        ]
                                    }}
                                >
                                    <TouchableHighlight
                                        style={{
                                            height: '80%',
                                            aspectRatio: 3/4,
                                            marginLeft: 20,
                                            padding: 10,
                                            backgroundColor: selected_request_index === index ? '#ff8944' : '#ffddb7',
                                            borderRadius: 10
                                        }}
                                        underlayColor='#ff8944'
                                        onPress={() => this.selectRequest(index)}
                                    >
                                        <View>
                                            {formatDate(request.timestamp) === todays_date ?
                                                <Text style={{ fontSize: 20 }}>今天</Text>
                                                : <Text style={{ fontSize: 20 }}>星期{day}</Text>
                                            }
                                            <Text style={{ fontSize: 20 }}>{date}</Text>
                                            <Text style={{ fontSize: 20 }}>{time}</Text>
                                        </View>
                                    </TouchableHighlight>
                                </Animated.View>
                            )
                        })}
                        
                        <Animated.View
                            style={{
                                transform: [
                                    {
                                        translateX: SlideInRight.interpolate({
                                            inputRange: [0,1],
                                            outputRange: [total_width, 0]
                                        })
                                    }
                                ]
                            }}
                        >
                            <TouchableHighlight
                                style={{
                                    height: '80%',
                                    aspectRatio: 3/4,
                                    marginHorizontal: 20,
                                    padding: 10,
                                    backgroundColor: selected_request_index === -1 ? '#ff8944' : '#ffddb7',
                                    borderRadius: 10
                                }}
                                underlayColor='#ff8944'
                                onPress={() => this.selectRequest(-1)}
                            >
                                <View>
                                    <Text style={{ fontSize: 20 }}>新增</Text>
                                    <Text style={{ fontSize: 20 }}>托藥單</Text>
                                </View>
                            </TouchableHighlight>
                        </Animated.View>
                    </ScrollView>
                </View>
            </View>
        )
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators({getMedRequestSuccess}, dispatch)
    }
}

export default connect(null, mapDispatchToProps)(MedicationRequestPage)
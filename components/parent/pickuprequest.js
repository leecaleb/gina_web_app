
import React from 'react'
import { View, Text, TouchableHighlight, TextInput, KeyboardAvoidingView, ScrollView, Alert, Dimensions } from 'react-native'
import { formatDate, formatTime } from '../util'

const { width, height } = Dimensions.get('window')

export default class PickupRequest extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            time: null,
            provided_times: ['5', '10', '15', '20', '25'],
            colors: ['#ffe1d0', '#ffddb7', '#fff1b5', '#dcf3d0', '#b5e9e9'],
            hightlighted_colors: ['#fa625f', '#ff8944', '#f4d41f', '#00c07f', '#368cbf'],
            choose_other_option: false,
            total_height: height - 55,
            total_width: width
        }
        this.sendRequest = this.sendRequest.bind(this)
    }

    onBlur() {
        const { time, choose_other_option, provided_times } = this.state
        if (choose_other_option && (time === '' || provided_times.includes(time))) {
            this.setState({ choose_other_option: false })
        } 
    }

    sendRequest() {
        const { child_id, school_id } = this.props.route.params
        const query = 'https://iejnoswtqj.execute-api.us-east-1.amazonaws.com/dev/attendance/pickup-request'
        const student_id = child_id
        const arrival_time = new Date()
        arrival_time.setMinutes(arrival_time.getMinutes() + parseInt(this.state.time))
        const request_body = {
            school_id,
            student_id,
            arrival_time: formatDate(arrival_time) + ' ' + formatTime(arrival_time)
        }
        fetch(query, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(request_body)
        })
            .then(res => res.json())
            .then(resJson => {
                const { statusCode, message } = resJson
                if (statusCode > 200 || message === 'Internal server error') {
                    Alert.alert(
                        'Sorry 電腦出狀況了！',
                        '請截圖和與工程師聯繫 ' + message,
                        [{ text: 'Ok' }]
                    )
                    return
                }
                this.props.navigation.goBack()
            })
            .catch(err => {
                Alert.alert(
                    'Sorry 電腦出狀況了！',
                    '請截圖和與工程師聯繫: error occurred when sending pickup request',
                    [{ text: 'Ok' }]
                )
            })
    }

    render() {
        const { time, provided_times, colors, hightlighted_colors, choose_other_option, total_height, total_width } = this.state
        // console.log(height, height/4)
        const aspectRatio = (total_width*0.5)/(total_height*0.28)
        return (
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior="padding"
                keyboardVerticalOffset={100}
                enabled
            >
                <ScrollView>
                    <View
                        style={{
                            flex: 3,
                            flexDirection: 'row',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        {provided_times.map((minute, index) => {
                            return (
                                <View
                                    key={index}
                                    style={{
                                        width: '50%',
                                        aspectRatio,
                                        backgroundColor: time == minute ? hightlighted_colors[index] : colors[index],
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <TouchableHighlight
                                        style={{
                                            width: '90%',
                                            height: '90%',
                                            borderWidth: time == minute ? 5 : 0,
                                            borderColor: 'white',
                                            backgroundColor: time == minute ? hightlighted_colors[index] : colors[index]
                                        }}
                                        underlayColor={hightlighted_colors[index]}
                                        onPress={() => this.setState({ time: minute, choose_other_option: false })}
                                    >
                                        <View style={{ flex:1, flexDirection:'row', justifyContent: 'center', alignItems: 'center' }}>
                                            <Text style={{ fontSize: total_width*0.20 }}>{minute}</Text>
                                            <Text style={{ fontSize: total_width*0.09 }}>分鐘</Text>
                                        </View>
                                    </TouchableHighlight>
                                </View>
                            )
                        })}
                        
                        
                        <View
                            style={{
                                width: '50%',
                                aspectRatio,
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: choose_other_option ? 'black' : 'white'
                            }}
                        >
                            <TouchableHighlight
                                    style={{
                                        flexDirection: 'row',
                                        width: '90%',
                                        height: '90%',
                                        backgroundColor: choose_other_option ? 'black' : 'white',
                                        borderWidth: choose_other_option ? 5 : 0,
                                        borderColor: 'white',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                    onPress={() => this.setState({ choose_other_option: true, time: '' })}
                            >
                                {choose_other_option ?
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            justifyContent: 'center', 
                                            alignItems: 'center'
                                        }}
                                    >
                                        <TextInput
                                            autoFocus={true}
                                            selectTextOnFocus={true}
                                            onBlur={() => this.onBlur()}
                                            keyboardType='numeric'
                                            value={time + ''}
                                            style={{
                                                fontSize: total_width*0.2,
                                                color: 'white'
                                            }}
                                            onChangeText={(time) => {
                                                this.setState({ time })
                                            }}
                                        />
                                            <Text style={{ fontSize: total_width*0.09, color: 'white' }}>分鐘</Text>                            
                                    </View>
                                    : <Text style={{ fontSize: 50 }}>其他</Text>
                                }
                            </TouchableHighlight>
                        </View>
                    </View>
                    <View style={{ height: total_height*0.16 }}>
                        <TouchableHighlight
                            style={{
                                flex: 1,
                                backgroundColor: 'lightgrey',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            onPress={() => this.sendRequest()}
                        >
                            <Text style={{ fontSize: 50 }}>送出</Text>
                        </TouchableHighlight>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        )
    }
}
import React from 'react'
import { View, Text, StyleSheet, Image, TouchableHighlight, ScrollView, Alert } from 'react-native'
import { Card, CardItem, Button } from 'native-base'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
// import { initializeRequests } from '../../redux/school/actions/index'
import { formatHourMinute, get, formatDate } from '../util'

class InboxCard extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            messages: []
        }
    }

    componentDidMount() {
        this.fetchData()
    }

    async fetchData() {
        const { class_id } = this.props
        // let yesterday = new Date()
        // yesterday.setDate(yesterday.getDate() - 1)
        const date = new Date()
        const response = await get(`/message/class/${class_id}/unread?date=${formatDate(date)}`)
        const { success, statusCode, message, data } = response
        if (!success) {
            alert(`Sorry 取得家長訊息時電腦出狀況了！請截圖和與工程師聯繫\n\n` + message)
              return 
        }
        // this.props.getUnreadMessageSuccess(data)
        // console.log('data: ', data)
        this.setState({ messages: data })
    }

    render() {
        const { students } = this.props
        const { messages } = this.state
        // const { requests, unfinished } = this.props.medication_requests
        return (
            <Card style={{ flex: 1, width: '90%'}}>
                <View style={{ height: 80, justifyContent: 'center', marginTop: 5 }}>
                    <Text style={{ fontSize: 30, alignSelf: 'center', position: 'absolute' }}>訊息</Text>
                    {/* <TouchableHighlight
                        style={{
                            width: '25%',
                            alignSelf: 'flex-end',
                            position: 'absolute',
                            padding: 5,
                            backgroundColor: '#b5e9e9'
                        }}
                        onPress={() => {
                            this.props.navigation.push('TeacherMedicineLog', {
                                request_id: null
                            })
                        }}
                    >
                        <Text style={styles.button_text}>查看</Text>
                    </TouchableHighlight> */}
                </View>
                <View style={{ }}>
                    <ScrollView horizontal={true}>
                        {messages.map((message, index) => {
                            const { activities, items_to_bring, message_for_teacher, other_activity, other_item, student_id, teacher_id, text } = message
                            // const time = formatHourMinute(new Date(timestamp))
                            return (
                                <TouchableHighlight
                                    key={index}
                                    style={{ flex: 1, margin: 3 }}
                                    onPress={() => {
                                        this.props.navigation.push('Inbox', {
                                            messages,
                                            students
                                        })
                                    }}
                                >
                                    <Card style={{ flex:1, alignItems: 'center', padding: 15 }}>
                                        {/* <View style={{ justifyContent: 'center' }}>
                                            <Text style={{ fontSize: 35 }}>{time}</Text>
                                        </View> */}
                                        <View style={{ justifyContent: 'center' }}>
                                            <Image
                                                source={
                                                    students[student_id].profile_picture === '' ?
                                                        require('../../assets/icon-thumbnail.png')
                                                        : {uri: students[student_id].profile_picture} 
                                                }
                                                style={styles.thumbnailImage}/>
                                        </View>
                                        <View
                                            style={{ justifyContent: 'center' }}
                                        >
                                            <Text style={{ fontSize: 25 }}>{students[student_id].name}</Text>
                                        </View>
                                    </Card>
                                </TouchableHighlight>
                            )
                        })}
                    </ScrollView>
                </View>
            </Card>
        )
    }
}

const styles = StyleSheet.create({
    card: {
        width: '90%',
        flex: 1
    },
    button: {
        width: '30%',
        backgroundColor:"#b5e9e9"
    },
    button_text: {
        width: '100%',
        textAlign: 'center',
        color: 'gray',
        fontSize: 30,
    },
    thumbnailImage: {
        height: 150,
        width: 150,
        borderRadius: 75
    }
})

// const mapStateToProps = (state) => {
//     return {
//         medication_requests: state.medicationrequests
//     }
// }

const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators({ }, dispatch)
    }
}

export default connect(null, mapDispatchToProps, null, { forwardRef: true }) (InboxCard)
import React, {useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom'
import { View, Text, StyleSheet, Image, TouchableHighlight, ScrollView, Alert } from 'react-native'
import { Card, CardItem, Button, Toast } from 'native-base'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { getParentMessageSuccess } from '../../redux/school/actions/index'
import { formatHourMinute, get, formatDate } from '../util'

const InboxCard = React.forwardRef((props, ref) => {
    const navigate = useNavigate()
    const [state, setState] = useState({
            messages: []
        })

    useEffect(() => {
        const { date } = props
        fetchData(new Date(date))
    })

    // componentDidUpdate(prevProps) {
    //     if(prevProps.date !== props.date) {
    //         const { date } = props
    //         fetchData(new Date(date))
    //     }
    // }

    const fetchData = async(date) => {
        const { class_id } = props
        // let yesterday = new Date()
        // yesterday.setDate(yesterday.getDate() - 1)
        // const date = new Date()
        // console.log('date: ', date)
        const { isConnected } = props.class
        if (!isConnected) {
            // Toast.show({
            //     text: '網路連線連不到! 等一下再試試看',
            //     buttonText: 'Okay',
            //     position: "top",
            //     type: "danger",
            //     duration: 4000
            // })
            alert('網路連線連不到! 等一下再試試看')
            return
        }

        const response = await get(`/message/class/${class_id}/unread?date=${formatDate(date)}`)
        const { success, statusCode, message, data } = response
        if (!success) {
            Alert.alert(
                `Sorry 取得家長訊息時電腦出狀況了！`,
                '請截圖和與工程師聯繫\n\n' + message,
                [{ text: 'Ok' }]
            )
            return 
        }
        setState({ messages: data })
        denormalize(data)
    }

    const denormalize = (messages) => {
        let denormalized = {}
        for(var i = 0; i < messages.length; i++) {
            denormalized[messages[i].student_id] = messages[i].message_for_teacher
        }
        // console.log('denormalized: ', denormalized)
        props.getParentMessageSuccess(denormalized)
    }

    const messageIsRead = (message_read, morning_reminder_read) => {
        if (message_read !== null && !message_read) return false
        if (morning_reminder_read !== null && !morning_reminder_read) return false
        return true
    }

    const { students, class_id, date } = props
    const { messages } = state
    // const { requests, unfinished } = props.medication_requests
    const viewing_previous = date.toDateString() !== (new Date()).toDateString()
    return (
        <Card style={{ flex: 1, width: '90%'}}>
            <View style={{ height: 80, justifyContent: 'center', marginTop: 5 }}>
                <Text style={{ fontSize: 30, alignSelf: 'center', position: 'absolute' }}>訊息</Text>
                <TouchableHighlight
                    style={{
                        width: '25%',
                        alignSelf: 'flex-end',
                        position: 'absolute',
                        padding: 5,
                        backgroundColor: '#b5e9e9'
                    }}
                    onPress={() => {
                        navigate('/class/inbox', { 
                            state: {
                                messages,
                                students,
                                class_id,
                                date,
                                // onGoBack: (date) => fetchData(date)
                            },
                            data: {
                                onGoBack: (date) => fetchData(date)
                            }
                        })
                    }}
                >
                    <Text style={styles.button_text}>查看</Text>
                </TouchableHighlight>
            </View>
            <View style={{ }}>
                <ScrollView horizontal={true}>
                    {messages.map((message, index) => {
                        const { activities, items_to_bring, message_for_teacher, other_activity, other_item, 
                            student_id, teacher_id, text, message_read, morning_reminder_read  } = message
                        if (messageIsRead(message_read, morning_reminder_read) && !viewing_previous) return null
                        return (
                            <TouchableHighlight
                                key={index}
                                style={{ flex: 1, margin: 3 }}
                                onPress={() => {
                                    navigate('/class/inbox', { state: {
                                        messages,
                                        students,
                                        class_id,
                                        date,
                                        onGoBack: (date) => fetchData(date)
                                    }})
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
})

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

const mapStateToProps = (state) => {
    return {
        class: state.classInfo
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators({ getParentMessageSuccess }, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps) (InboxCard)
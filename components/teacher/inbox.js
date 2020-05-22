import React from 'react'
import { View, Text, RefreshControl, StyleSheet, Image, TouchableHighlight, ScrollView, Alert } from 'react-native'
import { connect } from 'react-redux'
// import MedRequestModal from './medrequestmodal'
import { bindActionCreators } from 'redux';
// import { initializeRequests, fillMedRequest } from '../../../redux/school/actions/index' 
import Reloading from '../reloading'
import { formatHourMinute } from '../util'
import LoginNumberPad from './loginnumberpad'

class Inbox extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            isLoading: true,
            refreshing: false,
            selected_request_id: '',
            showLoginNumberPad: false
        }
    }

    componentDidMount() {
    }

    render() {
        const { messages, students } = this.props.route.params
        // console.log(messages)
        return (
            <View style={{ flex: 1, padding: 40 }}>
                <ScrollView>
                    {messages.map((message, index) => {
                        const { activities, items_to_bring, message_for_teacher, morning_reminder, other_activity, other_item, student_id, teacher_id, text } = message
                        return (
                            <View 
                                key={index}
                                style={{
                                    flexDirection: 'row',
                                    backgroundColor: 'white',
                                    borderWidth: 1,
                                    borderColor: 'lightgrey',
                                    marginBottom: 20,
                                    padding: 20,

                                }}
                            >
                                <View>
                                    <Image
                                        source={
                                            students[student_id].profile_picture === '' ?
                                                require('../../assets/icon-thumbnail.png')
                                                : {uri: students[student_id].profile_picture} 
                                        }
                                        style={styles.thumbnailImage}
                                    />
                                    <View style={{ justifyContent: 'center', alignItems: 'center', paddingTop: 20 }}>
                                        <Text style={{ fontSize: 25 }}>
                                            {students[student_id].name}
                                        </Text>
                                    </View>
                                </View>
                                
                                <View style={{ flex:1, backgroundColor: '', marginLeft: 20 }}>

                                    <View style={{}}>
                                        <Text style={{ fontSize: 25, fontWeight: 'bold' }}>
                                            老師的話:
                                        </Text>
                                        <Text style={{ fontSize: 20 }}>
                                            {text && text + '\n'}
                                        </Text>
                                    </View>

                                    <View style={{}}>
                                        <Text style={{ fontSize: 25, fontWeight: 'bold' }}>
                                            家長回應:
                                        </Text>
                                        <Text style={{ fontSize: 20 }}>
                                            {message_for_teacher && message_for_teacher + '\n'}
                                        </Text>
                                    </View>

                                    <View style={{}}>
                                        <Text style={{ fontSize: 25, fontWeight: 'bold' }}>
                                            早晨叮嚀:
                                        </Text>
                                        <Text style={{ fontSize: 20 }}>
                                            {morning_reminder && morning_reminder + '\n'}
                                        </Text>
                                    </View>

                                </View>
                            </View>
                        )
                    })}
                </ScrollView>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    cardContainer: {
        width: 170,
        paddingRight: 5
    },
    thumbnailImage: {
        height: 160,
        width: 160,
        borderRadius: 80
    }
})

const mapStateToProps = (state) => {
    return {
        class: state.classInfo,
        requests: state.medicationrequests
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators({}, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps) (Inbox)
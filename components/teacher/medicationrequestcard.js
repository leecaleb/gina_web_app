import React from 'react'
import { View, Text, StyleSheet, Image, TouchableHighlight, ScrollView, Alert } from 'react-native'
import { Card } from 'native-base'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { initializeRequests } from '../../redux/school/actions/index'
import { formatHourMinute } from '../util'

class MedicationReqeustCard extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            timerId: null
        }
    }

    componentDidMount() {
        this.fetchData()
    }

    fetchData() {
        const d = new Date()
        const date = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate()
        fetch('https://iejnoswtqj.execute-api.us-east-1.amazonaws.com/dev/medicationrequest?date=' + date + '&class_id=' + this.props.class_id, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        })
            .then(res => res.json())
            .then(resJson => {
                const { statusCode, message, data } = resJson
                const { requests, finished, unfinished } = data
                if (statusCode > 200 || message === 'Internal server error') {
                    alert('托藥單取不完整，請和工程師聯繫' + message)
                    return
                }
                this.props.initializeRequests(requests, finished, unfinished)
            })
            .catch(err => {
                alert('Error, please try again 托藥單取不完整，請和工程師聯繫：' + err.message)
            })
    }

    render() {
        const { students } = this.props
        const { requests, unfinished } = this.props.medication_requests
        // console.log('this.props.medication_requests: ', this.props.medication_requests)
        return (
            <Card style={{ flex: 1, width: '90%'}}>
                <View style={{ height: 80, justifyContent: 'center', marginTop: 5 }}>
                    <Text style={{ fontSize: 30, alignSelf: 'center', position: 'absolute' }}>托藥單</Text>
                    <TouchableHighlight
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
                    </TouchableHighlight>
                </View>
                <View style={{ }}>
                    <ScrollView horizontal={true}>
                        {unfinished.map((request_id) => {
                            const { student_id, timestamp, medication, note, administered, teacher_id } = requests[request_id]
                            const time = formatHourMinute(new Date(timestamp))
                            return (
                                <TouchableHighlight
                                    key={request_id}
                                    style={{ flex: 1, margin: 3 }}
                                    onPress={() => {
                                        this.props.navigation.push('TeacherMedicineLog', {
                                            request_id
                                        })
                                    }}
                                >
                                    <Card style={{ flex:1, alignItems: 'center', paddingHorizontal: 15 }}>
                                        <View style={{ justifyContent: 'center' }}>
                                            <Text style={{ fontSize: 35 }}>{time}</Text>
                                        </View>
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
        ...bindActionCreators({ initializeRequests }, dispatch)
    }
}

export default connect(null, mapDispatchToProps, null, { forwardRef: true }) (MedicationReqeustCard)
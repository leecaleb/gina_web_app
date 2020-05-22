import React from 'react'
import { View, Text, RefreshControl, StyleSheet, Image, TouchableHighlight, ScrollView, Alert } from 'react-native'
import { Card, Toast } from 'native-base'
import { connect } from 'react-redux'
import MedRequestModal from './medrequestmodal'
import { bindActionCreators } from 'redux';
import { initializeRequests, fillMedRequest } from '../../../redux/school/actions/index' 
import Reloading from '../../reloading'
import { formatHourMinute } from '../../util'
import LoginNumberPad from '../loginnumberpad'

class TeacherMedicineLog extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            isLoading: true,
            refreshing: false,
            selected_request_id: '',
            showLoginNumberPad: false
        }
        this.handleShowRequest = this.handleShowRequest.bind(this)
        this.handleFulfillRequest = this.handleFulfillRequest.bind(this)
    }

    componentDidMount() {
        // if not loaded, we fetch else do nothing(teacher can fetch new requests by refreshing page)
        const { request_id } = this.props.route.params
        if (request_id === null) {
            this.setState({
                isLoading: false
            })
            return
        }
        this.handleShowRequest(request_id)
    }

    handleShowRequest(request_id) {
        this.setState({
            selected_request_id: request_id,
            isLoading: false
        })
    }

    handleEnterPasscode(passcode) {
        const teacher_id = this.props.class.passcodeTeacherId[passcode]
        if (teacher_id === undefined) {
            Alert.alert(
                'Wrong password',
                'Please try again',
                [{text: 'OK'}]
            )
        } else {
            this.setState({ showLoginNumberPad: false })
            this.handleFulfillRequest(teacher_id)
        }
    }
    
    hideLoginPad() {
        this.setState({
            showLoginNumberPad: false
        })
    }

    handleFulfillRequest(teacher_id) {
        const { selected_request_id } = this.state
        // console.log(this.props.requests)
        const { student_id } = this.props.requests.requests[selected_request_id]
        const { isConnected } = this.props.class
        if (!isConnected) {
            Toast.show({
                text: '拍謝 網路連不到! 等一下再試試看',
                buttonText: 'Okay',
                position: "top",
                type: "warning",
                duration: 2000
            })
            return
        }
        fetch('https://iejnoswtqj.execute-api.us-east-1.amazonaws.com/dev/medicationrequest', {
            method: 'PUT',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                request_id: selected_request_id,
                teacher_id,
                student_id
            })
        })
            .then(res => res.json())
            .then(resJson => {
                const { statusCode, message, data } = resJson
                if (statusCode > 200 || message === 'Internal server error') {
                    Alert.alert(
                        'Error, please try again',
                        message,
                        [{text: 'OK'}]
                    )
                    return
                }
                this.props.fillMedRequest(selected_request_id)
                this.props.navigation.goBack()
            })
            .catch(err => {
                Alert.alert(
                    'Error, please try again',
                    err.message,
                    [{text: 'OK'}]
                )
            })
    }

    render() {
        const { selected_request_id, isLoading, showLoginNumberPad } = this.state
        if (isLoading) {
            return (
                <Reloading />
            )
        }
        const { requests } = this.props.requests
        const { students } = this.props.class
        const current_request = requests[selected_request_id]
        // console.log('current_request: ', current_request)
        // const { administered, fever_entry, medication, note, student_id, teacher_id, timestamp } = current_request
        return (
            <View style={{ flex: 1 }}>
                {showLoginNumberPad ? 
                    <LoginNumberPad
                        handleEnterPasscode={(passcode) => this.handleEnterPasscode(passcode)}
                        hideLoginPad={this.hideLoginPad}
                    /> : null
                }
                <ScrollView
                    contentContainerStyle={{ flex: 1, padding: 10 }}
                    refreshControl={
                        <RefreshControl
                            style={{backgroundColor: '#E0FFFF'}}
                            refreshing={this.state.refreshing}
                            onRefresh={this.fetchFromDB}
                            tintColor="#ff0000"
                            title="Loading..."
                            titleColor="#00ff00"
                            colors={['#ff0000', '#00ff00', '#0000ff']}
                            progressBackgroundColor="#ffff00"
                        />
                    }
                >
                    <View style={{ flex: 3 }}>
                        {selected_request_id === '' ?
                            null
                        :   
                            <MedRequestModal
                                thumbnail={students[current_request.student_id].profile_picture}
                                student_name={students[current_request.student_id].name}
                                request={current_request}
                                showLoginNumberPad={() => this.setState({ showLoginNumberPad: true })}
                            />
                        }
                    </View>
                    <View style={{ flex: 1 }}>
                        <ScrollView horizontal={true}>
                            {Object.keys(requests).map((request_id) => {
                                const { student_id } = requests[request_id]
                                const { timestamp, administered } = requests[request_id]
                                const time = formatHourMinute(new Date(timestamp))
                                return (
                                    <TouchableHighlight
                                        key={request_id}
                                        style={styles.cardContainer}
                                        underlayColor='transparent'
                                        onPress={() => this.handleShowRequest(request_id)}
                                    >
                                        <Card 
                                            style={{ 
                                                flex: 1,
                                                backgroundColor: administered ? '#dcf3d0' : '#ffe1d0'
                                            }}
                                        >
                                            <View
                                                style={{ flex: 1, justifyContent: 'center' }}
                                            >
                                                <Text style={{ fontSize: 25, textAlign: 'center' }}>{time}</Text>
                                            </View>
                                            <View style={{ flex: 2, justifyContent: 'center', alignItems: 'center' }}>
                                                <Image
                                                    source={
                                                        this.props.class.students[student_id].profile_picture === '' ?
                                                            require('../../../assets/icon-thumbnail.png')
                                                        : { uri: students[student_id].profile_picture }}
                                                    style={styles.thumbnailImage}
                                                />
                                            </View>
                                            <View
                                                style={{ flex: 1, justifyContent: 'center' }}
                                            >
                                                <Text style={{ fontSize: 25, textAlign: 'center' }}>{students[student_id].name}</Text>
                                            </View>
                                        </Card>
                                    </TouchableHighlight>
                                )
                            })}
                        </ScrollView>
                    </View>
                </ScrollView>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    cardContainer: {
        width: 170,
        // backgroundColor: 'transparent',
        paddingRight: 5
    },
    thumbnailImage: {
        height: 110,
        width: 110,
        borderRadius: 55
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
        ...bindActionCreators({ initializeRequests, fillMedRequest }, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps) (TeacherMedicineLog)
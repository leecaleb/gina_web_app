import React from 'react'
import { View, Text, TouchableHighlight, Image, Alert } from 'react-native'
import { connect } from 'react-redux'
import { formatDate } from '../util'
import Reloading from '../reloading'
import { addPickupRequest } from '../../redux/school/actions/index'
import { bindActionCreators } from 'redux'

class PickupAlert extends React.Component{
    constructor(props) {
        super(props)
        this.state = {
            color: '#ffe1d0',
            // alertForPickup: false,
            requestQueue: [],
            isLoading: true
        }
        this.onConfirm = this.onConfirm.bind(this)
    }

    componentDidMount() {
        // const { requestQueue } = this.props.route.params
        // if (requestQueue.length > 0) {
        //     this.setState({
        //         requestQueue,
        //         isLoading: false
        //     })
            this.timeoutId = this.timer()
        // } else {
        //     this.props.navigation.goBack()
        // }
    }

    timer = () => setTimeout(() => {
        this.setState({ color: this.state.color === '#ffe1d0' ? '#fa625f' : '#ffe1d0' })
        this.timeoutId = this.timer()
        }, 2000
    )

    // fetchData() {
    //     const query = `https://iejnoswtqj.execute-api.us-east-1.amazonaws.com/dev/attendance/pickup-request?school_id=${this.props.school_id}`
    //     fetch(query, {
    //         method: 'GET',
    //         headers: {
    //             Accept: 'application/json',
    //             'Content-Type': 'application/json'
    //         }
    //     })
    //         .then(res => res.json())
    //         .then(resJson => {
    //             if (resJson.data.length > 0) {
    //                 this.timeoutId = this.timer()
    //             }
    //             this.setState({
    //                 alertForPickup: resJson.data.length === 0 ? false : true,
    //                 requestQueue: resJson.data
    //             })
    //         })
    //         .catch(err => {
    //             console.log('err: ', err)
    //         })
    // }

    onConfirm(request_id, index) {
        const pick_up_request = [...this.props.pick_up_request]
        const query = `https://iejnoswtqj.execute-api.us-east-1.amazonaws.com/dev/attendance/pickup-request?request_id=${request_id}`
        fetch(query, {
            method: 'PUT',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        })
            .then(res => res.json())
            .then(resJson => {
                // TODO: error handling
                const { statusCode, message } = resJson
                if (statusCode === 200) {
                    pick_up_request.splice(index, 1)
                    this.props.addPickupRequest(pick_up_request)
                    if (pick_up_request.length === 0) {
                        // clearTimeout(this.timeoutId)
                        this.props.navigation.goBack()
                    }
                } else {
                    Alert.alert(
                        'Sorry 取得接回通知資料時電腦出狀況了！',
                        '請截圖和與工程師聯繫 ' + message,
                        [{ text: 'Ok' }]
                    )
                }
            })
            .catch(err => {
                console.log('err: ', err)
            })
    }

    componentWillUnmount() {
        clearTimeout(this.timeoutId)
    }

    render() {
        const { pick_up_request, students } = this.props
        // if (this.state.isLoading) {
        //     return <Reloading />
        // } else {
            // const request = this.state.requestQueue[0]
            // const student = this.props.students[request['student_id']]
            return (
                <View style={{
                    flex: 1,
                    flexDirection: 'row',
                    // backgroundColor: 'transparent',
                    justifyContent: 'space-evenly',
                    alignItems: 'center',
                    flexWrap: 'wrap'
                    // zIndex: 2,
                    // position: 'absolute',
                    // width: '100%',
                    // height: '100%'
                }}>
                    {pick_up_request.map((request, index) => {
                        const { id, student_id, arrival_time } = request
                        const student = students[student_id]
                        return(
                            <View
                                key={index}
                                style={{
                                    // flex: 1,
                                    width: '45%',
                                    height: '45%',
                                    marginTop: '5%',
                                    backgroundColor: this.state.color,
                                    // zIndex: 3,
                                    // position: 'absolute'
                                }}
                            >
                                <View style={{ flex: 2, alignItems: 'center', justifyContent: 'center' }}>
                                    <Image
                                        source={{uri: student.profile_picture }}
                                        style={{
                                            width: '80%',
                                            aspectRatio: 1
                                        }}
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <View style={{ flex: 1, justifyContent: 'center' }}>
                                        <Text style={{ fontSize: 80, textAlign: 'center' }}>{arrival_time}</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <TouchableHighlight
                                            style={{
                                                backgroundColor: 'grey',
                                                padding: 15,
                                                alignSelf: 'flex-end',
                                                justifyContent: 'center',
                                                marginRight: 15
                                            }}
                                            onPress={() => this.onConfirm(id, index)}
                                        >
                                            <Text style={{ fontSize: 35, textAlign: 'center', color: 'lightgrey' }}>確認</Text>
                                        </TouchableHighlight>
                                    </View>
                                </View>
                            </View>
                        )
                    })}
                </View>
            )
        // }
    }
}

const mapStateToProps = (state) => {
    return {
        students: state.school.students,
        pick_up_request: state.school.pick_up_request
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators({ addPickupRequest }, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps, null, { forwardRef: true }) (PickupAlert)
import React, {useEffect, useState} from 'react'
import {
    View, TouchableOpacity, Text, Animated, ScrollView, Alert, SectionList, Dimensions, Platform
} from 'react-native'
import MedicationRequestMain from './medicationrequestmain'
import { formatDate, beautifyTime, beautifyDate, beautifyMonthDate, get } from '../util'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { getMedRequestSuccess } from '../../redux/parent/actions/index'
import ENV from '../../variables'
import { useLocation, useNavigate } from 'react-router-dom'

const { width } = Dimensions.get('window')

const MedicationRequestPage = (props) => {
    const location = useLocation();
    let navigate = useNavigate();

    const [state, setState] = useState({
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
    })

    useEffect(() => {
        console.log('init')
        // const { selected_request_index } = this.props.route.params
        const { tomorrow } = state
        tomorrow.setDate(tomorrow.getDate() + 1)
        setState({
            ...state,
            tomorrow
        })
        fetchMedicationRequest()
        // initializePage()
        // if (selected_request_index !== undefined) {
        //     // console.log(selected_request_index)
        //     this.selectRequest(selected_request_index)
        // }
        // console.log('location.state, ', location.state)
    }, [])

    const isIOS = () => {
        return Platform.OS === 'ios'
    }

    const fetchMedicationRequest = async() => {
        // const { isConnected } = props
        // if (!isConnected) {
        //     alert('網路連不到! 請稍後再試試看')
        //     return
        // }
        const {student_id} = location.state
        const date = formatDate(new Date())
        const response = await get(`/medicationrequest/student/${student_id}?date=${date}`)
        const { success, statusCode, message, data } = response
        console.log('fetchMedicationRequest: ', response)
        if (!success) {
            alert('Sorry 取得托藥單時電腦出狀況了！請稍後再試試或請截圖和與工程師聯繫\n\n' + message)
            return
        }
        denormalize(data)
        setState({ ...state, requests: data })
        // onGoBack()
    }

    const denormalize = (object_array) => {
        for (var i = 0; i < object_array.length; i++) {
            object_array[i].title = new Date(object_array[i].title)
            for (var j = 0; j < object_array[i].data.length; j++) {
                object_array[i].data[j].timestamp = new Date(object_array[i].data[j].timestamp)
            }
        }
    }

    const initializePage = () => {
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

    const viewRequest = () => {
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

    const selectRequest = (index) => {
        const access_mode = this.refs['main'].fetchAccessMode()
        if (access_mode === 'edit') {
            alert('還在編輯中喔請完成再離開 多謝')
            return
        }
        setState({ ...state, selected_request_index: index })
    }

    const onCreateRequestSuccess = async(request_id) => {
        await fetchMedicationRequest()
        const { requests } = state
        get_todays_requests(requests)
        let new_request_index = -1
        for (var i = 0; i < requests.length; i++) {
            if (requests[i].id === request_id) {
                new_request_index = i
                break
            }
        }
        setState({
            ...state,
            selected_request_index: new_request_index
        })
    }

    const get_todays_requests = (object_array) => {
        let med_requests = []
        for (var i = 0; i < object_array.length; i++) {
            const timestamp = new Date(object_array[i].timestamp)
            if (timestamp.toDateString() === (new Date).toDateString()) {
                object_array[i].timestamp = timestamp
                med_requests.push(object_array[i])
            } else break
        }
        props.getMedRequestSuccess(med_requests)
    }

    const onDeleteRequestSuccess = (deleted_request_id) => {
        const { requests } = state
        const updated_requests = []
        for (var i = 0; i < requests.length; i++) {
            if (requests[i].id !== deleted_request_id) {
                updated_requests.push(requests[i])
            }
        }
        setState({
            ...state,
            requests: updated_requests,
            selected_request_index: 0
        })
        get_todays_requests(updated_requests)
    }

    const deleteRequestConfirm = (request_id) => {
        const confirmed = confirm('確定要刪除？')
        if (confirmed) {
            deleteRequest(request_id)
        }
    }

    const deleteRequest = (request_id) => {
        // const { isConnected } = props
        // if (!isConnected) {
        //     alert('網路連不到! 請稍後再試試看')
        //     return
        // }
        const { class_id } = location.state
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
            fetchMedicationRequest()
          })
          .catch(err => {
            alert('Sorry 電腦出狀況了！請截圖和與工程師聯繫: error occurred when deleting medication request')
          })
      }


        const { SlideInRight, SlideInLeft, total_width, requests, today, tomorrow, day_of_week, selected_request_index } = state
        const { student_id, class_id } = location.state
        const selected_request = requests[selected_request_index]
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
                            <TouchableOpacity 
                                style={{ 
                                    width:'65%',
                                    height: '100%',
                                    padding: 20, 
                                    backgroundColor: '#368cbf',
                                    borderRadius: 40,
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}
                                onPress={() => navigate('/add-med-request', {
                                    state: {
                                        // onGoBack: () => fetchMedicationRequest(),
                                        student_id,
                                        class_id,
                                        index,
                                        data: section.data
                                    }
                                })}
                            >
                                <Text style={{ fontSize: 30 }}>{beautifyTime(item.timestamp)}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{ 
                                    width:'30%', 
                                    height: '100%',
                                    padding: 20, 
                                    backgroundColor: '#fa625f', 
                                    justifyContent: 'center',
                                    borderRadius: 40
                                }}
                                onPress={() => deleteRequestConfirm(item.id)}
                            >
                                <Text style={{ fontSize: width * 0.07, textAlign: 'center' }}>
                                    刪除
                                </Text>
                            </TouchableOpacity>
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
                                padding: isIOS() ? 20 : 12,
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
                    <TouchableOpacity
                        style={{ backgroundColor: '#f4d41f', padding: isIOS() ? 20 : 12, justifyContent: 'center', borderRadius: 40 }}
                        onPress={() => navigate('/add-med-request', {
                            state: {
                                // onGoBack: () => fetchMedicationRequest(),
                                student_id, 
                                class_id,
                                index: -1,
                                data: null
                            }
                        })}
                    >
                        <Text style={{ fontSize: 30, alignSelf: 'center' }}>
                            新增
                        </Text>
                    </TouchableOpacity>
                </View>

                
            </View>
        )
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
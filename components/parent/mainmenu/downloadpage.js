import React, { useState } from 'react'
import { View, Text, TouchableOpacity, Animated, Dimensions, TouchableHighlight, ScrollView, StyleSheet } from 'react-native'
import { formatDate, get } from '../../util'
// import * as MailComposer from 'expo-mail-composer'
import Modal from '../../modal'
import * as WebBrowser from 'expo-web-browser'
import Reloading from '../../reloading'

const DownloadPage = (props) => {
    const { students } = props.route.params
    const all_months = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二']
    const [month, setMonth] = useState(0)
    const [email, setEmail] = useState('')
    const screenHeight = Dimensions.get('window').height
    const [modalAnimation, setModalAnimation] = useState(new Animated.Value(0))
    const [studentId, setStudentId] = useState(props.route.params.student_id)
    const [actionSheetType, setActionSheetType] = useState('')
    const [downloadUrl, setDownloadUrl] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [preparingDownload, setPreparingDownload] = useState(false)

    const findAllPreviousMonths = () => {
        const today = new Date()
        const month = today.getMonth()
        return all_months.slice(0, month+1)
    }

    const showActionSheet = (dataType) => {
        setActionSheetType(dataType)
        // Animated.sequence([
            Animated.timing(
                modalAnimation,
                {
                    toValue: 1,
                    duration: 300,
                    // useNativeDriver: true
                }
            ).start()
        // ]).start()
    }

    const hideActionSheet = () => {
        Animated.timing(
            modalAnimation,
            {
                toValue: 0,
                duration: 200
            }
        ).start()
    }

    const months = findAllPreviousMonths()

    const getUrl = async () => {
        if (preparingDownload) return;
        setPreparingDownload(true)
        const month_to_fetch = new Date()
        month_to_fetch.setMonth(month, 1)
        const response = await get(`/student/${studentId}/monthly-report?month=${formatDate(month_to_fetch)}`)
        const { success, statusCode, message, data } = response
        if (!success) {
          alert('整理寶貝資料中出問題，請截圖給工程師')
          return
        }

        setDownloadUrl(data)
        setShowModal(true)
        setPreparingDownload(false)
        // sendEmail(data)
    }
    
    // const sendEmail = (url) => {
    //     MailComposer.composeAsync({
    //       recipients: [email],
    //       subject: `${all_months[month]}月份學生出勤紀錄`,
    //       body: `https://gina-mobile-app.s3.amazonaws.com/${url}`
    //     })
    // }

    return (
        <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: 15, overflow: 'hidden' }}>
            {showModal && <Modal 
                title={'下載連結'}
                content={
                    <View style={{ alignItems: 'center'}}>
                        <Text>{`寶貝${all_months[month]}月的資料準備好了，\n點擊連結選擇下載方式\n\n`}</Text>
                        <TouchableOpacity style={{ padding: 10, backgroundColor: '#dcf3d0' }}
                            onClick={async() => {
                                let result = await WebBrowser.openBrowserAsync(`https://gina-mobile-app.s3.amazonaws.com/${downloadUrl}`)
                            }}
                        >
                            <Text>{`${all_months[month]}月份聯絡簿紀錄`}</Text>
                        </TouchableOpacity>
                    </View>
                }
                hideModal={() => setShowModal(false)}
            />}
            <View 
                style={{
                    marginTop: 25,
                    borderWidth: 2, 
                    borderRadius: 10, 
                    borderColor: 'lightgrey',
                    padding: 20,
                    backgroundColor: 'rgba(255,255,255,0.8)',
                    width: '85%'
                }}
            >
                <View style={{ }}>
                    <Text style={{ fontSize: 25 }}>整月聯絡簿</Text>
                </View>
                <View style={{ flex: 1, width: '100%', flexDirection: 'row', marginTop: 15 }}>
                    <View style={{ flex: 1, paddingVertical: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'lightgrey', borderTopLeftRadius: 15 }}>
                        <Text style={{ fontSize: 25 }}>月份</Text>
                    </View>
                    <TouchableOpacity
                        style={{ flex: 2 }}
                        onClick={() => showActionSheet('month')}
                    >
                        <Text style={{ fontSize: 25, paddingVertical: 20, borderWidth: 1, borderColor: 'lightgrey', textAlign: 'center' }}>{all_months[month]}月</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flex: 1, width: '100%', flexDirection: 'row', marginTop: 15 }}>
                    <View style={{ flex: 1, paddingVertical: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'lightgrey', borderBottomLeftRadius: 15 }}>
                        <Text style={{ fontSize: 25 }}>寶貝</Text>
                    </View>
                    <TouchableHighlight
                        style={{ flex: 2 }}
                        onClick={() => showActionSheet('student')}
                    >
                        <Text style={{ fontSize: 25, paddingVertical: 20, textAlign: 'center', borderWidth: 1, borderColor: 'lightgrey'}}>{students[studentId].name}</Text>
                    </TouchableHighlight>
                </View>
                
                <TouchableHighlight
                    style={{ paddingTop: 20, alignSelf: 'flex-end' }}
                    onClick={() => getUrl()}
                >
                    <Text style={{ fontSize: 25, backgroundColor: '#dcf3d0', padding: 20, textAlign: 'center'}}>
                        {preparingDownload ? '準備中。。。' : '確定'}
                    </Text>
                </TouchableHighlight>
            </View>
            <Animated.View 
                style={[StyleSheet.absoluteFill, {
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    transform: [{ 
                        translateY: modalAnimation.interpolate({
                            inputRange: [0, 0.01],
                            outputRange: [screenHeight, 0],
                            extrapolate: 'clamp'
                        })
                    }],
                    opacity: modalAnimation.interpolate({
                        inputRange: [0.01, 0.5],
                        outputRange: [0, 1],
                        extrapolate: 'clamp'
                    })
                }]}
            >
                <TouchableHighlight 
                    style={{ 
                        flex: 1, 
                        backgroundColor: 'transparent'
                    }}
                    underlayColor='transparent'
                    onPress={() => hideActionSheet()}
                ><View></View>
                </TouchableHighlight>
                <View
                    style={{
                        flex: 1,
                        position: 'absolute',
                        top: screenHeight,
                        width: '100%',
                        height: '100%',
                        justifyContent: 'flex-end',
                    }}
                >   
                    <View style={{ flex: 3 }}></View>
                    <Animated.View
                        style={{
                            flex: 1,
                            backgroundColor: 'rgba(255,255,255,1)', 
                            // height: '30%',
                            marginHorizontal: 10,
                            paddingHorizontal: 10,
                            minHeight: 200,
                            transform: [
                                {
                                    translateY: modalAnimation.interpolate({
                                        inputRange: [0.01, 1],
                                        outputRange: [0, -1 * screenHeight],
                                        extrapolate: 'clamp'
                                    })
                                }
                            ]
                        }}
                    >
                        <View style={{ padding: 15 }}>
                            <Text style={{ fontSize: 25 }}>{actionSheetType === 'month' ? '請選擇聯絡簿月份' : '請確認寶貝名稱'}</Text>
                        </View>
                        {actionSheetType === 'month' && <ScrollView horizontal contentContainerStyle={{ alignItems: 'center', justifyContent: 'center'}}>
                            {months.map((month_item, index) => {
                                return (
                                    <TouchableOpacity
                                        key={index}
                                        style={{
                                            // width: '20%',
                                            flex: 1,
                                            padding: 20,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backgroundColor: '#b5e9e9',
                                            margin: 10,
                                            marginVertical: 20,
                                            height: 80,
                                            width: 100
                                            // marginTop: 20
                                        }}
                                        onClick={()=> {
                                            setMonth(index)
                                            hideActionSheet()
                                        }}
                                        underlayColor="#368cbf"
                                    >
                                        <Text style={{ fontSize: 20 }}>{`${month_item}月`}</Text>
                                    </TouchableOpacity>
                                )
                            })}
                        </ScrollView>}
                        {actionSheetType === 'student' && <ScrollView horizontal contentContainerStyle={{ alignItems: 'center', justifyContent: 'center'}}>
                            {Object.keys(students).map((student_id) => {
                                return (
                                    <TouchableOpacity
                                        key={student_id}
                                        style={{
                                            // width: '20%',
                                            padding: 30,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backgroundColor: '#b5e9e9',
                                            margin: 15,
                                            height: 80,
                                            width: 100
                                        }}
                                        onClick={()=> {
                                            setStudentId(student_id)
                                            hideActionSheet()
                                        }}
                                        underlayColor="#368cbf"
                                    >
                                        <Text style={{ fontSize: 20 }}>{`${students[student_id].name}`}</Text>
                                    </TouchableOpacity>
                                )
                            })}
                        </ScrollView>}
                    </Animated.View>
                </View>
            </Animated.View>

        </View>
    )
}

export default DownloadPage
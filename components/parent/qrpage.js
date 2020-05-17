import React from 'react'
import { View, Text, TouchableHighlight, Alert } from 'react-native'
import QRCode from 'react-native-qrcode-svg'
import Reloading from '../reloading'
import { get } from '../util'

export default class QRPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            isLoading: true,
            data: ''
        }
    }

    async componentDidMount() {
        const { parent_id } = this.props
        const response = await get(`/user/${parent_id}/qrcode`)
        const { success, statusCode, message, data } = response
        if (!success) {
            Alert.alert(
            `Sorry 取得家長QR Code時電腦出狀況了！`,
            '請截圖和與工程師聯繫\n\n' + message,
            [{ text: 'Ok' }]
            )
            return 
        }

        this.setState({
            isLoading: false,
            data
        })
        
        // const { student_id } = this.props
        // fetch("https://iejnoswtqj.execute-api.us-east-1.amazonaws.com/dev/student/qr", {
        //     method: 'POST',
        //     headers: {
        //         Accept: 'application/json',
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify({
        //         student_id
        //     })
        // })
        //     .then((res) => res.json())
        //     .then((resJson) => {
        //         const { statusCode, message, data } = resJson
        //         if (statusCode > 200 || message === 'Internal server error') {
        //             Alert.alert(
        //                 'Error',
        //                 message,
        //                 [{ text: 'Ok' }]
        //             )
        //             return
        //         }
        //         this.setState({
        //             isLoading: false,
        //             data
        //         })
        //     })
        //     .catch((err) => {
        //         Alert.alert(
        //             'Error',
        //             'Something went wrong when fetching a QR code for student',
        //             [{ text: 'Ok' }]
        //         )
        //     })
    }
    
    render() {
        return (
            <View
                style={{
                    zIndex: 2,
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                    backgroundColor: 'white',
                    justifyContent: 'space-evenly',
                    alignItems: 'center'
                }}
            >
                <View style={{ flex: 1 }}>
                    <View style={{ flex: 3, justifyContent: 'center', alignItems: 'center' }}>
                        {this.state.isLoading ? 
                            <Reloading />
                            :  <QRCode
                                value={this.state.data}
                                size={300}
                                />
                        }
                    </View>
                    <View style={{ flex: 1, alignItems: 'center' }}>
                        <TouchableHighlight
                            style={{ padding: 15, backgroundColor: '#b5e9e9' }}
                            onPress={() => this.props.hideQRCode()}
                        >
                            <Text style={{ fontSize: 30 }}>返回</Text>
                        </TouchableHighlight>
                    </View>
                </View>
            </View>
        )
    }
}
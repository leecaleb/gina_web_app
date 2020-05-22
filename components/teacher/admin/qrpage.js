import React from 'react'
import { View, Text, TouchableHighlight, Alert } from 'react-native'
import QRCode from 'react-native-qrcode-svg'

export default class QRPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            // isLoading: true,
            // data: ''
        }
    }
    
    render() {
        const { name, role } = this.props.parent_data
        const name_prefix = 
            role === '母' ? '媽媽'
            : role === '父' ? '爸爸'
            : role
        return (
            // <View
            //     style={{
            //         width: '100%',
            //         height: '100%',
            //         justifyContent: 'space-evenly',
            //         alignItems: 'center'
            //     }}
            // >
                <View style={{ flex: 1 }}>
                    <View style={{ flex: 3, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontSize: 65, }}>{this.props.student_name} {name_prefix}</Text>
                        <QRCode
                            value={this.props.qr_data}
                            size={400}
                        />
                    </View>
                    <View style={{ flex: 1, alignItems: 'center' }}>
                        <TouchableHighlight
                            style={{ padding: 15, backgroundColor: '#b5e9e9' }}
                            onPress={() => this.props.goBack()}
                        >
                            <Text style={{ fontSize: 30 }}>返回</Text>
                        </TouchableHighlight>
                    </View>
                </View>
            // </View>
        )
    }
}
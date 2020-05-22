import React from 'react'
import { View, Text, TouchableHighlight, Alert, Dimensions } from 'react-native'
import QRCode from 'react-native-qrcode-svg'
import Reloading from '../reloading'
import { get } from '../util'
import { connect } from 'react-redux'

const { width, height } = Dimensions.get('window')

class QRPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            isLoading: true,
            data: ''
        }
    }

    async componentDidMount() {
        const { parent_id, isConnected } = this.props
        const response = await get(`/user/${parent_id}/qrcode`)
        const { success, statusCode, message, data } = response

        if (!isConnected) {
            alert('網路連不到! 請稍後再試試看')
            return
        }

        if (!success) {
            alert(`Sorry 取得家長QR Code時電腦出狀況了！請截圖和與工程師聯繫\n\n` + message)
            return 
        }

        this.setState({
            isLoading: false,
            data
        })
    }
    
    render() {
        return (
            <View
                style={{
                    height,
                    zIndex: 2,
                    width: '100%',
                    // height: '100%',
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

const mapStateToProps = (state) => {
    return {
        isConnected: state.parent.isConnected
    }
}

export default connect(mapStateToProps) (QRPage)
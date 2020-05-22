import React from 'react'
import { View, Text, TouchableHighlight, Image, Alert, TextInput, ScrollView} from 'react-native'
import { Toast } from 'native-base'
import { post, get } from '../../util'
import Auth from '@aws-amplify/auth'
import { connect } from 'react-redux'

class AddParent extends React.Component {
    constructor(props) {
        super(props)
        this.state={
            password: '',
            qr_data: '',
            name: ''
        }
    }

    async componentDidMount() {
        const { parent_data, isConnected } = this.props
        this.setState({
            ...this.state,
            ...parent_data
        })

        if (!isConnected) {
            alert('網路連不到! 等一下再試試看')
            return
            // Toast.show({
            //     text: '網路連不到! 等一下再試試看',
            //     buttonText: 'Okay',
            //     buttonTextStyle: { fontSize: 25 },
            //     position: "top",
            //     type: "warning",
            //     duration: 2000
            // })
        }

        if (parent_data.id != ''){
            const response = await get(`/user/${parent_data.id}/qrcode`)
            const { success, statusCode, message, data } = response
            if (!success) {
                alert('Sorry 取得家長QR Code時電腦出狀況了！請截圖和與工程師聯繫\n\n' + message)
                return 
            }
            this.setState({
                qr_data: data
            })
        }
    }

    async postParent() {
        const { student_id, isConnected } = this.props
        const { id, name, role, email, username, mobile, work_phone, address } = this.state

        if (!isConnected) {
            alert('網路連不到! 等一下再試試看')
            // Toast.show({
            //     text: '網路連不到! 等一下再試試看',
            //     buttonText: 'Okay',
            //     buttonTextStyle: { fontSize: 25 },
            //     position: "top",
            //     type: "warning",
            //     duration: 2000
            // })
        }

        if (id === '') { // we register and then add parent to database
            const response = await this.signUpParent()
            if (!response.success) {
                return
            }
        }
        const body = {
            student_id,
            parent_data: {
                id,
                name, 
                role,
                email,
                username, 
                mobile, 
                work_phone, 
                address
            }
        }
        const response = await post(`/student/${student_id}/family`, body)
        const { success, statusCode, message, data } = response
        if (!success) {
            alert('Sorry 新增家長時電腦出狀況了！請截圖和與工程師聯繫\n\n' + message)
            return 
          }
        this.props.goBack()
    }

    async signUpParent() {
        const { username, password, name, email } = this.state
        const response = await Auth.signUp({
            username,
            password,
            attributes: {
                name,
                email
            }
          })
            .then(values => {
                return {
                    success: true
                }
            })
            .catch(err => {
                alert('家長註冊有問題!請與工程師聯繫\n\n' + err.message)
                return {
                    success: false
                }
          })
        return response
    }

    render() {
        const { id, name, username, password, mobile, work_phone, address, role, email } = this.state
        // console.log('this.state: ', this.state)
        return (
            <View style={{ flex: 1, padding: 30 }}>
                <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
                    <ScrollView>
                    <View
                        style={{
                            flex: 1,
                            flexDirection: 'row',
                            padding: 10,
                            justifyContent: 'space-between'
                        }}
                    >
                        <View
                            style={{
                                // flexDirection: 'row',
                                width: '66%',
                                padding: 10,
                                backgroundColor: '#ffddb7',
                                // alignSelf: 'flex-start',
                                // marginBottom: 10
                            }}
                        >
                            <Text style={{ fontSize: 15 }}>姓名</Text>
                            <TextInput 
                                style={{ fontSize: 35, textAlign: 'center' }}
                                value={name}
                                onChangeText={(name) => this.setState({ name })}
                            />
                        </View>

                        <View
                            style={{
                                // flexDirection: 'row',
                                width: '32%',
                                padding: 10,
                                backgroundColor: '#ffddb7',
                                // alignSelf: 'flex-start',
                                // marginBottom: 10
                            }}
                        >
                            <Text style={{ fontSize: 15 }}>角色</Text>
                            <TextInput 
                                style={{ fontSize: 35, textAlign: 'center' }}
                                value={role}
                                onChangeText={(role) => this.setState({ role })}
                            />
                        </View>

                        {/* <TouchableHighlight
                            style={{
                                width: '20%',
                                padding: 15,
                                backgroundColor: '#fa625f',
                                justifyContent: 'center'
                            }}
                            // onPress={() => }
                        >
                            <Text style={{fontSize: 20, textAlign: 'center'}}>移除</Text>
                        </TouchableHighlight> */}
                    </View>

                    <View
                        style={{
                            flex: 1,
                            padding: 10
                        }}
                    >
                        <View
                            style={{
                                padding: 15,
                                backgroundColor: '#ffddb7',
                                height: '100%'
                            }}
                        >
                            <Text style={{ fontSize: 15 }}>Email</Text>
                            <TextInput 
                                style={{ fontSize: 35 }}
                                autoCapitalize={'none'}
                                keyboardType={'email-address'}
                                placeholder={''}
                                value={email}
                                onChangeText={(email) => this.setState({ email })}
                            />
                        </View>
                    </View>

                    <View
                        style={{
                            flex: 1,
                            flexDirection: 'row',
                            padding: 10,
                            justifyContent: 'space-between'
                        }}
                    >
                        <View
                            style={{
                                // flexDirection: 'row',
                                width: '49%',
                                padding: 15,
                                backgroundColor: '#ffddb7',
                                // alignSelf: 'flex-start',
                                // marginBottom: 10
                            }}
                        >
                            <Text style={{ fontSize: 15 }}>帳號</Text>
                            <TextInput
                                editable={id === ''}
                                style={{ fontSize: 35, textAlign: 'center' }}
                                autoCapitalize={'none'}
                                value={username}
                                onChangeText={(username) => this.setState({ username })}
                            />
                        </View>

                        {id === '' ? 
                            <View
                                style={{
                                    // flexDirection: 'row',
                                    width: '49%',
                                    padding: 15,
                                    backgroundColor: '#ffddb7',
                                    // alignSelf: 'flex-start',
                                    // marginBottom: 10
                                }}
                            >
                                <Text style={{ fontSize: 15 }}>密碼</Text>
                                <TextInput
                                    secureTextEntry={true}
                                    style={{ fontSize: 35, textAlign: 'center' }}
                                    value={password}
                                    onChangeText={(password) => this.setState({ password })}
                                />
                            </View>
                        :   <TouchableHighlight
                                style={{ backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center' }}
                                onPress={() => this.props.viewQRCode(this.state.qr_data)}
                            >
                                <Image
                                    source={require('../../../assets/icon-qr.png')}
                                    style={{
                                        width: 120,
                                        height: 120,
                                    }}
                                />
                            </TouchableHighlight>
                        }
                    </View>

                    <View
                        style={{
                            flex: 1,
                            padding: 10
                        }}
                    >
                        <View
                            style={{
                                padding: 15,
                                backgroundColor: '#ffddb7',
                                height: '100%'
                            }}
                        >
                            <Text style={{ fontSize: 15 }}>手機</Text>
                            <TextInput 
                                style={{ fontSize: 35 }}
                                keyboardType={'number-pad'}
                                placeholder={''}
                                value={mobile}
                                onChangeText={(mobile) => this.setState({ mobile })}
                            />
                        </View>
                    </View>
                    
                    <View
                        style={{
                            flex: 1,
                            padding: 10
                        }}
                    >
                        <View
                            style={{
                                padding: 15,
                                backgroundColor: '#ffddb7',
                                height: '100%'
                            }}
                        >
                            <Text style={{ fontSize: 15 }}>工作/家用電話</Text>
                            <TextInput 
                                style={{ fontSize: 35 }}
                                keyboardType={'number-pad'}
                                placeholder={''}
                                value={work_phone}
                                onChangeText={(work_phone) => this.setState({ work_phone })}
                            />
                        </View>
                    </View>

                    <View
                        style={{
                            flex: 1,
                            padding: 10
                        }}
                    >
                        <View
                            style={{
                                padding: 15,
                                backgroundColor: '#ffddb7',
                                height: '100%'
                            }}
                        >
                            <Text style={{ fontSize: 15 }}>地址</Text>
                            <TextInput 
                                style={{ fontSize: 35 }}
                                placeholder={''}
                                value={address}
                                onChangeText={(address) => this.setState({ address })}
                            />
                        </View>
                    </View>

                    <View style={{ flex: 1, flexDirection: 'row', backgroundColor: '#DCDCDC' }}>
                        <View style={{ flex: 1, padding: 14 }}>
                            <TouchableHighlight
                                style={{ flex:1, padding: 5, backgroundColor: '#fa625f', justifyContent: 'center' }}
                                onPress={() => this.props.goBack()}
                            >
                                <Text style={{ fontSize: 30, alignSelf: 'center' }}>返回</Text>
                            </TouchableHighlight>
                        </View>
                        {id !== '' ? 
                            <View style={{ flex: 1, padding: 14 }}>
                                <TouchableHighlight
                                    style={{ flex:1, padding: 5, backgroundColor: '#fa625f', justifyContent: 'center' }}
                                    // onPress={() => this.props.goBack()}
                                >
                                    <Text style={{ fontSize: 30, alignSelf: 'center' }}>移除</Text>
                                </TouchableHighlight>
                            </View>
                        : null
                        }
                        <View style={{ flex: 1, padding: 14 }}>
                            <TouchableHighlight
                                style={{ flex: 1, padding: 5, backgroundColor: '#00c07f',justifyContent: 'center' }}
                                onPress={() => this.postParent()}
                            >
                                <Text style={{ fontSize: 30, alignSelf: 'center' }}>{id === '' ? '新增' : '送出'}</Text>
                            </TouchableHighlight>
                        </View>
                    </View>
                    </ScrollView>
                </View>

                
            </View>
        )
    }
}

const mapStateToProps = (state) => {
    return {
      isConnected: state.school.isConnected
    }
}

export default connect(mapStateToProps, null) (AddParent)
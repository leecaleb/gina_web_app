import React from 'react'
import { View, Text, TouchableHighlight, Image, Alert, TextInput, ScrollView} from 'react-native'
import { post, get } from '../../util'
import PickerComponent from '../../picker'

export default class AddTeacher extends React.Component {
    constructor(props) {
        super(props)
        this.state={
            id: '',
            name: '',
            profile_picture: '',
            class_id: '',
            passcode: '',
            isAdmin: false
        }
    }

    async componentDidMount() {
        // const { parent_data } = this.props
        // this.setState({
        //     ...this.state,
        //     ...parent_data
        // })
        // if (parent_data.id != ''){
        //     const response = await get(`/user/${parent_data.id}/qrcode`)
        //     const { success, statusCode, message, data } = response
        //     if (!success) {
        //         Alert.alert(
        //         `Sorry 取得家長QR Code時電腦出狀況了！`,
        //         '請截圖和與工程師聯繫\n\n' + message,
        //         [{ text: 'Ok' }]
        //         )
        //         return 
        //     }
        //     this.setState({
        //         qr_data: data
        //     })
        // }
    }

    async postTeacher() {
        const { student_id, school_id } = this.props
        const { id, name, profile_picture, class_id, passcode, isAdmin } = this.state
        const body = {
            id,
            name,
            profile_picture,
            class_id,
            passcode,
            isAdmin
        }
        const response = await post(`/school/${school_id}/teacher`, body)
        const { success, statusCode, message, data } = response
        if (!success) {
            Alert.alert(
              `Sorry 新增教師時電腦出狀況了！`,
              '請截圖和與工程師聯繫\n\n' + message,
              [{ text: 'Ok' }]
            )
            return 
          }
        this.props.goBack()
        this.props.fetchTeacherData()
    }

    // async fetchTeacherData(school_id) {
    //     const response = await get(`/school/${school_id}/teacher`)
    //     const { success, statusCode, message, data } = response
    //     if (!success) {
    //         Alert.alert(
    //             'Sorry 取得教師資料時電腦出狀況了！',
    //             '請截圖和與工程師聯繫\n\n' + message,
    //             [{ text: 'Ok' }]
    //         )
    //         return 
    //     }

    //     const {teachers, classes} = data
    //     this.props.fetchTeachersSuccess(teachers, classes)
    // }

    handleSelectClass(class_name) {
        const { classes } = this.props
        let class_id_found = ''
        Object.keys(classes).forEach(class_id => {
            if (classes[class_id].name === class_name) {
                class_id_found = class_id
            }
        })
        this.setState({
            class_id: class_id_found,
            isAdmin: class_name === '管理員'
        })
    }

    render() {
        const { classes } = this.props
        const { id, name, class_id, passcode, isAdmin } = this.state
        return (
            <View style={{ flex: 1, padding: 30 }}>
                <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
                    <ScrollView>
                        <View
                            style={{
                                flex: 1,
                                flexDirection: 'row',
                                padding: 20,
                                justifyContent: 'space-between'
                            }}
                        >
                            <View
                                style={{
                                    // flexDirection: 'row',
                                    width: '48%',
                                    padding: 10,
                                    backgroundColor: '#ffddb7',
                                    // alignSelf: 'flex-start',
                                    // marginBottom: 10,
                                    borderBottomWidth: 3,
                                    borderRadius: 10,
                                    borderBottomColor: '#ff8944'
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
                                    width: '48%',
                                    padding: 10,
                                    backgroundColor: '#ffddb7',
                                    // alignSelf: 'flex-start',
                                    // marginBottom: 10,
                                    borderBottomWidth: 3,
                                    borderRadius: 10,
                                    borderBottomColor: '#ff8944'
                                }}
                            >
                                <Text style={{ fontSize: 15 }}>密碼</Text>
                                <TextInput 
                                    style={{ fontSize: 35, textAlign: 'center' }}
                                    value={passcode}
                                    keyboardType='number-pad'
                                    onChangeText={(passcode) => this.setState({ passcode })}
                                />
                            </View>
                        </View>

                        <View
                            style={{
                                flex: 1,
                                padding: 20
                            }}
                        >
                            <View
                                style={{
                                    padding: 10,
                                    backgroundColor: '#ffddb7',
                                    height: '100%',
                                    borderBottomWidth: 3,
                                    borderRadius: 10,
                                    borderBottomColor: '#ff8944'
                                }}
                            >
                                <Text style={{ fontSize: 15 }}>班級</Text>
                                <PickerComponent
                                    style={{ 
                                        backgroundColor: 'rgba(255,255,255, 0)',
                                        alignItems: 'center',
                                        padding: 5
                                    }}
                                    textStyle={{fontSize: 30}}
                                    selectedValue={class_id === '' ? '選擇班級' : classes[class_id].name}
                                    options={Object.keys(classes).map(class_id => classes[class_id].name)}
                                    handleOnClick={() => { }}
                                    handleSelectValue={(class_name) => this.handleSelectClass(class_name)}
                                />
                            </View>
                        </View>

                        {/* <View
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
                        </View> */}

                        <View 
                            style={{ flex: 1, flexDirection: 'row', backgroundColor: '#DCDCDC', marginTop: 20 }}>
                            <View style={{ flex: 1, padding: 14 }}>
                                <TouchableHighlight
                                    style={{ 
                                        flex:1, 
                                        padding: 5, 
                                        backgroundColor: '#fa625f', 
                                        justifyContent: 'center'
                                    }}
                                    onPress={() => this.props.goBack()}
                                >
                                    <Text style={{ fontSize: 30, alignSelf: 'center' }}>返回</Text>
                                </TouchableHighlight>
                            </View>
                            {/* {id !== '' ? 
                                <View style={{ flex: 1, padding: 14 }}>
                                    <TouchableHighlight
                                        style={{ flex:1, padding: 5, backgroundColor: '#fa625f', justifyContent: 'center' }}
                                        // onPress={() => this.props.goBack()}
                                    >
                                        <Text style={{ fontSize: 30, alignSelf: 'center' }}>移除</Text>
                                    </TouchableHighlight>
                                </View>
                            : null
                            } */}
                            <View style={{ flex: 1, padding: 14 }}>
                                <TouchableHighlight
                                    style={{ 
                                        flex: 1, 
                                        padding: 5, 
                                        backgroundColor: '#00c07f',
                                        justifyContent: 'center'
                                    }}
                                    onPress={() => this.postTeacher()}
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
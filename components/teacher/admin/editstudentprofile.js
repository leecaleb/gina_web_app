import React from 'react'
import { View, Text, TouchableHighlight, Image, Alert, TextInput, PushNotificationIOS } from 'react-native'
import { get, put } from '../../util'
import PickerComponent from '../../picker'
import Reloading from '../../reloading'

export default class EditStudentProfile extends React.Component {
    constructor(props) {
        super(props)
        this.state={
            parents: [],
            student: null,
            isLoading: true
        }
    }

    async componentDidMount() {
        const { student_id, student } = this.props
        const response = await get(`/student/${student_id}/family`)
        const { success, statusCode, message, data } = response
        if (!success) {
            alert('Sorry 取得家庭資料時電腦出狀況了！請截圖和與工程師聯繫\n\n' + message)
            return 
        }
        this.setState({
            parents: response.data,
            student,
            isLoading: false
        })
    }

    addParent() {
        const { parents } = this.state
        if (parents.length === 3) {
            alert('Sorry 一個寶貝只能註冊三位家長！')
            return 
        }
        this.props.addParent({
            id: '',
            name: '',
            role: '',
            username: '',
            password: '',
            mobile: '',
            work_phone: '',
            address: ''
        })
    }

    async editStudentData() {
        const { student_id } = this.props
        const { student } = this.state
        const { name, class_id } = student
        const response = await put(`/student/${student_id}`, {
            name,
            class_id
        })
        const { success, statusCode, message, data } = response
        if (!success) {
            alert('Sorry 編輯學生資料時電腦出狀況了！請截圖和與工程師聯繫\n\n' + message)
            return 
        }
        this.props.hideModal()
        const old_class_id = this.props.student.class_id
        this.props.editStudentSuccess(student_id, name, old_class_id, class_id)
    }

    // getClassByStudentId() {
    //     const { student_id, classes } = this.props
    //     Object.keys(classes).forEach(class_id => {
    //         const {students} = classes[class_id]
    //         for(var i = 0; i < students.length; i++) {
    //             if (student_id === students[i]) {
    //                 return classes[class_id].name
    //             }
    //         }
    //     })
    //     return ''
    // }

    getClassNames() {
        const { classes } = this.props
        return Object.keys(classes).map(class_id => {
            return classes[class_id].name
        })
    }
    
    handleSelectClass(class_name) {
        const { classes } = this.props
        let class_id_found = ''
        Object.keys(classes).forEach(class_id => {
            if (classes[class_id].name === class_name) {
                class_id_found = class_id
            }
        })
        this.setState({
            student: {
                ...this.state.student,
                class_id: class_id_found
            }
        })
    }

    render() {
        const { classes } = this.props
        const { student, parents, isLoading } = this.state
        // console.log('student: ', student)
        if (isLoading) {
            return (
                <Reloading />
            )
        }
        return (
            <View style={{ flex: 1, padding: 30 }}>
                <View style={{ flex: 3, flexDirection: 'row', alignItems: 'center', backgroundColor: '#DCDCDC' }}>
                    <View style={{ flex: 1, alignItems: 'center' }}>
                        <TouchableHighlight
                            style={{  }}
                            // onPress={() => }
                        >
                            <Image
                                source={
                                    student.profile_picture === '' ?
                                        require('../../../assets/icon-thumbnail.png')
                                        : {uri: student.profile_picture}
                                }
                                style={{
                                    width: 200,
                                    height: 200,
                                    borderRadius: 100
                                }}
                            />
                        </TouchableHighlight>
                    </View>
                    
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        <TextInput 
                            style={{ fontSize: 50 }}
                            value={student.name}
                            onChangeText={name => this.setState({
                                student: {
                                    ...this.state.student,
                                    name
                                }
                            })}
                        />
                        {/* <Text style={{ fontSize: 50 }}>{classes[student.class_id].name}</Text> */}
                        {/* <PickerComponent
                            style={{ 
                                backgroundColor: 'rgba(255,255,255, 0.5)',
                                alignItems: 'center',
                                padding: 5,
                                width: '90%',
                                marginTop: 5
                            }}
                            textStyle={{fontSize: 50}}
                            selectedValue={classes[student.class_id].name}
                            options={Object.keys(classes).map(class_id => classes[class_id].name)}
                            handleOnClick={() => { }}
                            handleSelectValue={(class_name) => this.handleSelectClass(class_name)}
                        /> */}
                        <TouchableHighlight
                            style={{ 
                                backgroundColor: 'rgba(255,255,255, 0.5)',
                                alignItems: 'center',
                                padding: 5,
                                width: '90%',
                                marginTop: 5
                            }}
                        >
                            <Text style={{fontSize: 50}}>{classes[student.class_id].name}</Text>
                        </TouchableHighlight>
                    </View>
                </View>

                <View style={{ flex: 5, backgroundColor: '#F5F5F5' }}>

                    <View style={{ flex: 1, alignItems: 'center' }}>
                        {parents.map(parent => {
                            return (
                                <View key={parent.id} style={{ width: '100%', height: '33%', padding: '1%' }}>
                                    <TouchableHighlight
                                        style={{ flex: 1, padding : 10, backgroundColor: '#b5e9e9', justifyContent: 'center' }}
                                        onPress={() => this.props.addParent(parent)}
                                    >
                                        <View style={{ flex: 1, flexDirection: 'row' }}>
                                            {/* <Text style={{ fontSize: 30, alignSelf: 'center' }}>{parent.role}</Text> */}
                                            <View style={{ paddingRight: 10 }}>
                                                <Text style={{ fontSize: 20 }}>{parent.role}</Text>
                                            </View>
                                            <View>
                                                <View style={{ width: '100%', flexDirection:'row'}}>
                                                    <Text style={{ fontSize: 20 }}>姓名: {parent.name}         </Text>
                                                    <Text style={{ fontSize: 20 }}>帳號: {parent.username}         </Text>
                                                </View>
                                                <Text style={{ fontSize: 20 }}>手機: {parent.mobile}</Text>
                                                <Text style={{ fontSize: 18 }}>工作/家用電話: {parent.work_phone}</Text>
                                                <Text style={{ fontSize: 18 }}>地址: {parent.address}</Text>
                                            </View>
                                        </View>
                                    </TouchableHighlight>
                                </View>
                            )
                        })}
                        {parents.length < 3 ?
                            <View style={{ width: '100%', height: '33%', padding: '1%' }}>
                                <TouchableHighlight
                                    style={{
                                        flex: 1,
                                        padding : 10,
                                        backgroundColor: 'white',
                                        justifyContent: 'center',
                                        borderWidth: 5,
                                        borderRadius: 1,
                                        borderStyle: 'dashed'
                                    }}
                                    onPress={() => this.addParent()}
                                >
                                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={{ fontSize: 30, alignSelf: 'center' }}>新增家長</Text>
                                    </View>
                                </TouchableHighlight>
                            </View>
                        : null
                        }
                    </View>
                </View>

                <View style={{ flex: 1, flexDirection: 'row', backgroundColor: '#DCDCDC' }}>
                    <View style={{ flex: 1, padding: 10 }}>
                        <TouchableHighlight
                            style={{ flex:1, padding: 5, backgroundColor: '#fa625f', justifyContent: 'center' }}
                            onPress={() => this.props.hideModal()}
                        >
                            <Text style={{ fontSize: 30, alignSelf: 'center' }}>返回</Text>
                        </TouchableHighlight>
                    </View>
                    <View style={{ flex: 1, padding: 10 }}>
                        <TouchableHighlight
                            style={{ flex: 1, padding: 5, backgroundColor: '#00c07f',justifyContent: 'center' }}
                            onPress={() => this.editStudentData()}
                        >
                            <Text style={{ fontSize: 30, alignSelf: 'center' }}>送出</Text>
                        </TouchableHighlight>
                    </View>
                </View>
            </View>
        )
    }
}
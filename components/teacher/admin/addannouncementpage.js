import React from 'react'
import { View, Text, TextInput, TouchableHighlight, KeyboardAvoidingView, ScrollView, Alert, Image, Platform } from 'react-native'
import { connect } from 'react-redux'
import { formatDate, formatTime, post } from '../../util'
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
// import s3 from '../../../configuration/s3';
import Reloading from '../../reloading'

class AddAnnouncementPage extends React.Component {
    constructor (props) {
        super(props)
        this.state = {
            date: new Date(),
            selected_all_classes: true,
            selected_classes: new Set(),
            class_id_list: [],
            text: '',
            title: '',
            images: [],
            sendLoading: false,
            links: []
        }
    }

    componentDidMount () {
        this.getPermissionAsync()
        const { classes } = this.props
        let class_id_list = []
        Object.keys(classes).forEach((class_id) => {
            // if (classes[class_id].name !== '管理員' && !classes[class_id].name.includes('畢業')) {
                class_id_list.push(class_id)
            // }
        })
        this.setState({
            class_id_list,
            selected_classes: new Set(class_id_list)
        })
    }

    selectClass (class_id) {
        const { selected_classes, class_id_list } = this.state
        let new_selected_classes = new Set([...selected_classes])
        if ( new_selected_classes.has(class_id) ) {
            new_selected_classes.delete(class_id)
        } else {
            new_selected_classes.add(class_id)
        }
        this.setState({
            selected_classes: new_selected_classes,
            selected_all_classes: new_selected_classes.size === class_id_list.length ? true : false
        })
    }

    selectAllClasses() {
        const { selected_all_classes } = this.state
        this.setState({
            selected_all_classes: !selected_all_classes,
            selected_classes: selected_all_classes ? new Set() : new Set(this.state.class_id_list)
        })
    }

    async postAnnouncement() {
        const { school_id, school_name } = this.props.route.params
        const { text, date, selected_classes, title, images, links } = this.state
        if (selected_classes.size === 0) {
            // Alert.alert(
            //     '請選擇班級',
            //     '',
            //     [
            //         { text: 'Ok' }
            //     ]
            // )
            alert('請選擇班級')
            return
        }

        if (title === '') {
            // Alert.alert(
            //     'Title 未填',
            //     '',
            //     [
            //         { text: 'Ok' }
            //     ]
            // )
            alert('Title 未填')
            return
        }

        this.setState({ sendLoading: true })

        const response = await post(`/announcement`, {
            'school_id': school_id,
            'title': title,
            'text': text,
            'timestamp': `${formatDate(date)} ${formatTime(date)}`,
            'class_id_list': [...selected_classes],
            'images': images,
            'school_name': school_name,
            'links': links
        })
        const { success, statusCode, message, data } = response
        if ( success ) {
            this.props.navigation.navigate('AnnouncementHome', {
                school_id,
                school_name,
                update_page: true
            })
        } else {
            // Alert.alert(
            //     '送出訊息時出狀況',
            //     message,
            //     [
            //         { text: 'Ok' }
            //     ]
            // )
            alert('送出訊息時出狀況')
            return
        }
    }

    getPermissionAsync = async () => {
        if (Platform.OS === 'ios') {
            const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
            if (status !== 'granted') {
                alert('Sorry, we need camera roll permissions to make this work!');
            }
        }
    };
    
    _pickImage = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                allowsEditing: false,
                quality: 0.4,
                base64: true
            });
            if (!result.cancelled) {
                const { base64 } = result
                this.setState({
                    images: [...this.state.images, base64]
                })
                // this.setState({ image: result.uri });
                // this.getProfilePictureURL(base64, student_id, url)
            }
        
            // console.log(result);
        } catch (E) {
            console.log(E);
        }
    };

    removeImage(index) {
        const { images } = this.state
        images.splice(index, 1)
        this.setState({
            images
        })
    }

    handleAddLink() {
        const { links } = this.state
        links.push({
            text: '',
            url: ''
        })
        this.setState({
            links
        })
    }

    handleChangeLinkText(text, index) {
        const { links } = this.state
        links[index].text = text
        this.setState({
            links
        })
    }

    handleChangeUrl(url, index) {
        const { links } = this.state
        links[index].url = url
        this.setState({
            links
        })
    }

    handleDeleteUrl(index) {
        const { links } = this.state
        links.splice(index, 1)
        this.setState({
            links
        })
    }

    render() {
        const { classes } = this.props
        const { selected_all_classes, class_id_list, selected_classes, text, title, images, sendLoading, links } = this.state
        
        return (
            <KeyboardAvoidingView
                style={{
                    flex: 1
                }}
                behavior='height'
                keyboardVerticalOffset={80}
                enabled
            >   
                <ScrollView contentContainerStyle={{ }} keyboardShouldPersistTaps='never'>
                    <View style={{ padding: 15, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                        <Text style={{ fontSize: 25 }}>班級:</Text>
                        {class_id_list.map((class_id) => { 
                            return (
                                <TouchableHighlight
                                    key={class_id}
                                    style={{ 
                                        backgroundColor: selected_classes.has(class_id) ? '#368cbf' : 'rgba(0, 0, 0, 0.1)',
                                        marginLeft: 15
                                    }}
                                    underlayColor={'#368cbf'}
                                    onPress={() => this.selectClass(class_id)}
                                >
                                    <Text 
                                        style={{ 
                                            padding: 10,
                                            fontSize: 25,
                                            color: selected_classes.has(class_id) ? 'rgba(255,255,255,0.6)' : 'rgba(0, 0, 0, 0.5)'
                                        }}
                                    >
                                        {classes[class_id].name}
                                    </Text>
                                </TouchableHighlight>
                            )
                        })}
                        <TouchableHighlight 
                            style={{
                                backgroundColor: selected_all_classes ? '#368cbf' : 'rgba(0, 0, 0, 0.1)',
                                marginLeft: 15
                            }}
                            underlayColor={'#368cbf'}
                            onPress={() => this.selectAllClasses()}
                        >
                            <Text style={{ padding: 10, fontSize: 25, color: selected_all_classes ? 'rgba(255,255,255,0.6)' : 'rgba(0, 0, 0, 0.5)' }}>
                                所有
                            </Text>
                        </TouchableHighlight>
                    </View>
                    <View style={{ padding: 15, backgroundColor: 'lightgrey' }}>
                        <View style={{ flexDirection: 'row', width: '100%' }}>
                            <Text style={{ fontSize: 25 }}>標題: </Text>
                            <TextInput
                                value={title}
                                placeholder={'必填'}
                                style={{
                                    // width: '100%',
                                    flex: 1,
                                    fontSize: 25,
                                    borderBottomWidth: 1,
                                    borderBottomColor: 'gray'
                                }}
                                onChangeText={title => this.setState({
                                    title
                                })}
                            />
                        </View>
                        <TextInput
                            value={text}
                            style={{
                                backgroundColor: 'white',
                                alignSelf: 'center',
                                width: '100%',
                                borderColor: 'gray',
                                borderWidth: 2,
                                borderRadius: 10,
                                fontSize: 25,
                                padding: 20,
                                paddingTop: 20,
                                marginVertical: 15
                            }}
                            multiline={true}
                            // maxLength={100}
                            onChangeText={text => this.setState({
                                text
                            })}
                            // onEndEditing={() => this.writeToAll(for_all.text.trim())}
                        />
                        <View style={{ }}>
                            <Text style={{ fontSize: 20, marginRight: 20 }}>連結</Text>
                            {links.map((link,index) => {
                                return (
                                    <View
                                        key={index} 
                                        style={{ flex: 1, flexDirection: 'row', marginTop: 15 }}
                                    >
                                        <View
                                            style={{ 
                                                flex: 7,
                                                backgroundColor: 'rgba(255,255,255,0.7)', 
                                                padding: 8, 
                                                borderRadius: 7
                                            }}
                                        >
                                            <Text style={{ }}>顯示文字</Text>
                                            <TextInput
                                                value={link.text}
                                                style={{ padding: 5, borderBottomWidth: 1 }}
                                                onChangeText={(text) => this.handleChangeLinkText(text, index)}
                                            />

                                            <Text style={{ marginTop: 10 }}>連結</Text>
                                            <TextInput
                                                value={link.url}
                                                style={{ padding: 5, borderBottomWidth: 1 }}
                                                onChangeText={(url) => this.handleChangeUrl(url, index)}
                                            />
                                        </View>
                                        <View style={{ flex: 1, backgroundColor: 'grey' }}>
                                            <TouchableHighlight
                                                style={{ 
                                                    flex: 1, 
                                                    padding: 10, 
                                                    backgroundColor: '#ffe1d0', 
                                                    alignItems: 'center', 
                                                    justifyContent: 'center' 
                                                }}
                                                onPress={() => this.handleDeleteUrl(index)}
                                            >
                                                <Text>
                                                    刪除
                                                </Text>
                                            </TouchableHighlight>
                                        </View>
                                    </View>
                                )
                            })}

                            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 15 }}>
                                <TouchableHighlight 
                                    style={{
                                        backgroundColor: 'rgba(255,255,255,0.7)', 
                                        paddingVertical: 10, 
                                        paddingHorizontal: 20,
                                        borderWidth: 2,
                                        borderRadius: 10,
                                        borderStyle: 'dashed' 
                                    }}
                                    onPress={() => this.handleAddLink()}
                                >
                                    <Text>
                                        新增
                                    </Text>
                                </TouchableHighlight>
                            </View>
                        </View>
                        <View>
                            <Text style={{ fontSize: 20 }}>相片</Text>
                            <View style={{ flexDirection: 'row', marginTop: 20 }}>
                                <View style={{ flex: 1, flexDirection: 'row' }}>
                                    {images.map((base64, index) => {
                                        return (
                                            <TouchableHighlight 
                                                key={index}
                                                onPress={() => this.removeImage(index)}
                                            >
                                                <Image
                                                    style={{ width: 100, height: 100, marginRight: 10, borderRadius: 10 }}
                                                    source={{ uri: `data:image/png;base64,${base64}` }}
                                                />
                                            </TouchableHighlight>
                                        )
                                    })}
                                    <TouchableHighlight
                                        style={{
                                            // padding: 10,
                                            backgroundColor: 'rgba(255,255,255,0.7)',
                                            width: 100,
                                            height: 100,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            borderWidth: 2,
                                            borderRadius: 10,
                                            borderStyle: 'dashed'
                                        }}
                                        onPress={() => this._pickImage() }
                                    >
                                        <Text>新增</Text>
                                    </TouchableHighlight>
                                </View>
                                <TouchableHighlight
                                    disabled={sendLoading}
                                    style={{
                                        // width: '10%',
                                        backgroundColor: 'lightblue',
                                        padding: 10,
                                        alignSelf: 'flex-end'
                                    }}
                                    onPress={() => this.postAnnouncement()}
                                >
                                    {sendLoading ? 
                                        <Reloading />
                                    : <Text style={{ fontSize: 25 }}>送出</Text>}
                                </TouchableHighlight>
                            </View>
                        </View>
                        
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        classes: state.school.classes
    }
}

export default connect(mapStateToProps) (AddAnnouncementPage)
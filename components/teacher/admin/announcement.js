import React from 'react'
import { View, Text, TextInput, TouchableHighlight, ScrollView, Image, KeyboardAvoidingView, Alert } from 'react-native'
import { Card, CardItem } from 'native-base'
import { connect } from 'react-redux'
import { get, post, formatDate, formatTime, beautifyDate, beautifyMonthDate, delete_by_id } from '../../util'
import * as WebBrowser from 'expo-web-browser'


class Announcement extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            date: new Date(),
            selected_all_classes: true,
            selected_classes: new Set(),
            class_id_list: [],
            text: '',
            announcements: [],
            page_number: 0,
            announcement_on_display: {},
            is_loading: true,
            unread_list: [],
            read_list: [],
            show_more: false
        }
    }
    
    /*
        1. text and be able to import pictures
        2. be able to pick classes(include, exclude)
        3. be able to see which parent has read or not read the announcement(ability to track past announcements)
    */

    async componentDidMount() {
        const { announcement } = this.props.route.params
        const { classes } = this.props
        let class_id_list = []
        Object.keys(classes).forEach((class_id) => {
            if (classes[class_id].name !== '管理員' && !classes[class_id].name.includes('畢業生')) {
                class_id_list.push(class_id)
            }
        })
        this.setState({
            class_id_list,
            selected_classes: new Set(class_id_list)
        })
        if(announcement === undefined) {
            this.fetchMostRecentAnnouncement()
        } else {
            this.fetchReadStatusByAnnouncementId(announcement)
        }
    }

    async fetchMostRecentAnnouncement() {
        const { school_id } = this.props.route.params
        const response = await get(`/announcement/most-recent?school_id=${school_id}`)
        const { success, statusCode, message, data } = response
        if (success) {
            let [unread_list, read_list] = this.separateReadUnread(data.read_status)
            this.setState({
                announcement_on_display: data,
                is_loading: false,
                unread_list,
                read_list
            })
        }
    }

    async fetchReadStatusByAnnouncementId(announcement) {
        const response = await get(`/announcement/${announcement.id}`)
        const { success, statusCode, message, data } = response
        if (success) {
            let [unread_list, read_list] = this.separateReadUnread(data)
            this.setState({
                announcement_on_display: announcement,
                is_loading: false,
                unread_list,
                read_list
            })
        }
    }

    separateReadUnread(data) {
        let unread_list = [],
            read_list = []
        for (const student_id in data) {
            if(data[student_id]) {
                read_list.push(student_id)
            } else {
                unread_list.push(student_id)
            }
        }
        return [unread_list, read_list]
    }

    showConfirmDeleteDialog() {
        // Alert.alert(
        //     '確定要永久刪除此公告?',
        //     '',
        //     [
        //         {
        //             text: '返回',
        //             style: 'cancel'
        //         },
        //         {
        //             text: 'Ok',
        //             onPress: () => this.deleteAnnouncementById()
        //         }
        //     ]
        // )
        const confirmed = confirm('確定要永久刪除此公告?')
        if (confirmed) {
            this.deleteAnnouncementById()
        }
    }

    async deleteAnnouncementById() {        
        const { school_id } = this.props.route.params
        const announcement = this.state.announcement_on_display
        const response = await delete_by_id(`/announcement/${announcement.id}`)
        const { success, statusCode, message, data } = response
        if (success) {
            this.props.navigation.navigate('AnnouncementHome', {
                school_id
            })
        }
    }

    render () {
        const { students } = this.props
        const { school_id, school_name } = this.props.route.params
        const {
            announcement_on_display, 
            is_loading, 
            unread_list, 
            read_list,
            show_more
        } = this.state
        return (
            <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingVertical: 7 }}>
                    <TouchableHighlight
                        style={{ padding: 10, backgroundColor: 'lightblue', marginRight: 10 }}
                        onPress={() => this.fetchReadStatusByAnnouncementId(announcement_on_display)}
                    >
                        <Text style={{ fontSize: 20 }}>刷新</Text>
                    </TouchableHighlight>

                    <TouchableHighlight
                        style={{ padding: 10, backgroundColor: 'lightblue', marginRight: 10 }}
                        onPress={() => this.props.navigation.navigate('AnnouncementHome', {
                            school_id,
                            school_name
                        })}
                    >
                        <Text style={{ fontSize: 20 }}>檢視全部</Text>
                    </TouchableHighlight>
                    <TouchableHighlight
                        style={{ padding: 10, backgroundColor: 'lightblue', marginRight: 10 }}
                        onPress={() => this.props.navigation.push('AddAnnouncementPage', {
                            school_id,
                            school_name
                        })}
                    >
                        <Text style={{ fontSize: 20 }}>新增</Text>
                    </TouchableHighlight>
                    <TouchableHighlight
                        style={{ padding: 10, backgroundColor: 'red', marginRight: 10 }}
                        onPress={() => this.showConfirmDeleteDialog()}
                    >
                        <Text style={{ fontSize: 20 }}>刪除</Text>
                    </TouchableHighlight>
                </View>
                    {!is_loading &&
                    <View style={{ flex: 1 }}>
                        <Card
                            style={{
                                flex: 1
                            }}
                        >
                            <ScrollView>
                                <View style={{ padding: 20 }}>
                                    <Text style={{ fontSize: 28 }}>{announcement_on_display.title}</Text>
                                    <Text style={{ fontSize: 18 }}>{beautifyDate(new Date(announcement_on_display.timestamp))}</Text>
                                </View>
                                <View 
                                    style={{
                                        paddingHorizontal: 20,
                                        height: show_more ? -1 : 100,
                                        overflow: 'hidden'
                                    }}
                                >
                                    <Text style={{ fontSize: 20 }}>{announcement_on_display.text}</Text>
                                </View>
                                {show_more &&
                                    <View style={{ flex: 1, alignItems: 'flex-start', padding: 20 }}>
                                        {announcement_on_display.links.map((link, index) => {
                                            return (
                                                <TouchableHighlight
                                                    key={index}
                                                    style={{ backgroundColor: 'lightblue', padding: 8, marginBottom: 15 }}
                                                    onPress={async() => {
                                                        let result = await WebBrowser.openBrowserAsync(link.url)
                                                    }}
                                                >
                                                    <Text style={{ fontSize: 18 }}>{link.text}</Text>
                                                </TouchableHighlight>
                                            )
                                        })}
                                    </View>
                                }

                                {show_more &&
                                    <View style={{ flexDirection: 'row', paddingHorizontal: 20, flexWrap: 'wrap' }}>
                                        {announcement_on_display.photo_url_arr.map((url, index) => {
                                            return (
                                                <TouchableHighlight
                                                    key={index}
                                                    onPress={async() => {
                                                        let result = await WebBrowser.openBrowserAsync(url)
                                                    }}
                                                >
                                                    <Image
                                                        source={{ uri: url}}
                                                        style={{
                                                            width: 150,
                                                            height: 150,
                                                            marginRight: 10,
                                                            marginTop: 10
                                                        }}
                                                    />
                                                </TouchableHighlight>
                                            )
                                        })}
                                    </View>
                                }
                                <View style={{ width: '100%', paddingHorizontal: 20 }}>
                                    <TouchableHighlight
                                        style={{ padding: 10, alignSelf: 'flex-end', backgroundColor: 'lightblue' }}
                                        onPress={() => this.setState({ show_more: !show_more })}
                                    >
                                        <Text>{show_more ? '隱藏' : '更多'}</Text>
                                    </TouchableHighlight>
                                </View>
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>

                                
                                {unread_list.map(id => {
                                    const student = students[id]
                                    return (
                                        <TouchableHighlight 
                                            key={id}
                                            style={{ 
                                                height: 300, 
                                                width: '33.3%', 
                                                padding: 5
                                            }}
                                        >
                                            <Card style={{ flex: 1, padding: 10, backgroundColor: '#ffe1d0' }}>
                                                <CardItem style={{ justifyContent: 'center' }}>
                                                        <Image
                                                            source={
                                                                student.profile_picture === '' ?
                                                                require('../../../assets/icon-thumbnail.png')
                                                                : {uri: student.profile_picture}
                                                            }
                                                            style={{
                                                                height: 200,
                                                                width: 200,
                                                                borderRadius: 100
                                                            }}
                                                        />
                                                </CardItem>
                                                <CardItem
                                                    footer
                                                    style={{ justifyContent: 'center', marginTop: -5 }}
                                                >
                                                    <Text style={{ marginTop: -10 }}>{student.name}</Text>
                                                </CardItem>
                                            </Card>
                                        </TouchableHighlight>
                                    )
                                })}
                                {read_list.map(id => {
                                    const student = students[id]
                                    return (
                                        <TouchableHighlight 
                                            key={id}
                                            style={{ 
                                                height: 300, 
                                                width: '33.3%', 
                                                padding: 5
                                            }}
                                        >
                                            <Card style={{ flex: 1, padding: 10, backgroundColor: '#dcf3d0' }}>
                                                <CardItem style={{ justifyContent: 'center' }}>
                                                    <Image
                                                        source={
                                                            student.profile_picture === '' ?
                                                            require('../../../assets/icon-thumbnail.png')
                                                            : {uri: student.profile_picture}
                                                        }
                                                        style={{
                                                            height: 200,
                                                            width: 200,
                                                            borderRadius: 100
                                                        }}
                                                    />
                                                </CardItem>
                                                <CardItem
                                                    footer
                                                    style={{ justifyContent: 'center', marginTop: -5 }}
                                                >
                                                    <Text style={{ marginTop: -10 }}>{student.name}</Text>
                                                </CardItem>
                                            </Card>
                                        </TouchableHighlight>
                                    )
                                })}
                                </View>
                            </ScrollView>
                        </Card>
                    </View>
                }
            </View>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        classes: state.school.classes,
        students: state.school.students
    }
}

export default connect(mapStateToProps) (Announcement)
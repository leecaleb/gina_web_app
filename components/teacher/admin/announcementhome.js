import React from 'react'
import { View, Text, TextInput, TouchableHighlight, ScrollView, Image, KeyboardAvoidingView } from 'react-native'
import { Card, CardItem } from 'native-base'
import { connect } from 'react-redux'
import { get, post, formatDate, formatTime, beautifyDate, beautifyMonthDate } from '../../util'

class AnnouncementHome extends React.Component {
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
            is_loading: true
        }
    }
    
    /*
        1. text and be able to import pictures
        2. be able to pick classes(include, exclude)
        3. be able to see which parent has read or not read the announcement(ability to track past announcements)
    */

    async componentDidMount() {
        this.unsubscribe = this.props.navigation.addListener('focus', async () => {
            // console.log('focused!!!!')
            await this.fetchAnnouncements()
        })
        // await this.fetchAnnouncements()
    }

    async fetchAnnouncements() {
        const { school_id } = this.props.route.params
        const { page_number } = this.state
        const response = await get(`/announcement?school_id=${school_id}&page=${page_number}`)
        const { success, statusCode, message, data } = response
        // console.log('fetchAnnouncements/response: ', response)
        if (success) {
            this.setState({
                announcements: data
            })
        }
    }

    // async fetchReadStatusByAnnouncementId(announcement_id) {
    //     const response = await get(`/announcement/${announcement_id}`)
    //     console.log(response)
    // }
    componentWillUnmount() {
        this.unsubscribe()
    }

    render () {
        const { school_id, school_name } = this.props.route.params
        const { classes, students } = this.props
        const { announcements } = this.state
        
        return (
            <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingVertical: 7 }}>
                    <TouchableHighlight
                        style={{ padding: 10, backgroundColor: 'lightblue', marginRight: 10 }}
                        onPress={() => this.props.navigation.push('AddAnnouncementPage', {
                            school_id,
                            school_name
                        })}
                    >
                        <Text style={{ fontSize: 20 }}>新增</Text>
                    </TouchableHighlight>
                </View>
                <ScrollView contentContainerStyle={{ alignItems: 'center' }}>
                    {announcements.map((announcement, index) => {
                        const date = beautifyDate(new Date(announcement.timestamp))
                        return (
                            <TouchableHighlight
                                key={announcement.id}
                                style={{ }}
                                onPress={() => this.props.navigation.push('Announcement', { 
                                    school_id,
                                    announcement,
                                    school_name
                                })}
                            >
                                <Card
                                    style={{
                                        padding: 20,
                                        width: '95%',
                                        height: 200,
                                        flexDirection: 'row'
                                    }}
                                >
                                    <View style={{ width: '100%', overflow: 'hidden'}}>
                                        <View style={{ paddingBottom: 20 }}>
                                            <Text style={{ fontSize: 25 }}>{announcement.title}</Text>
                                            <Text style={{ fontSize: 15 }}>{date}</Text>
                                        </View>
                                        <View style={{ }}>
                                            <Text style={{ fontSize: 18 }}>{announcement.text}</Text>
                                        </View>
                                    </View>
                                </Card>
                            </TouchableHighlight>
                        )
                    })}
                </ScrollView>
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

export default connect(mapStateToProps) (AnnouncementHome)
import React, { useEffect, useState } from 'react'
import { View, Text, Image, ScrollView, TouchableHighlight } from 'react-native'
import { Card } from 'native-base'
import { get, beautifyMonthDate } from '../util'
import { TouchableOpacity } from 'react-native'

const AnnouncementCard = (props) => {
    const [state, setState] = useState({
        announcements: []
    })

    useEffect(() => {
        fetchAnnouncement()
    }, [])

    // componentDidUpdate(prevProps) {
    //     if (this.props.date !== prevProps.date) {
    //       this.setState({ isLoading: true })
    //       this.fetchAnnouncement();
    //     } else if (this.props.child_id !== prevProps.child_id) {
    //       this.setState({ isLoading: true })
    //       this.fetchAnnouncement();
    //     }
    //   }

    const fetchAnnouncement = async() => {
        const { parent_id } = props
        // console.log('parent_id: ', parent_id)
        const response = await get(`/announcement/unread?parent_id=${parent_id}&page=0`)
        const { success, statusCode, message, data } = response
        // console.log('fetchAnnouncement/response: ', response)
        if (success) {
            setState({
                ...state,
                announcements: data
            })
        }
    }

    /*
        -if there are announcement unread, show on home page the date of the announcement
        -only when parent click into it, we mark it read
        -parent can also click next or previous depends on which announcement s/he is in
        -when parent navigate back to home page, update announcement card status to show only the unread announcements
        -should still show unread when parent changes date
    */
    const { announcements } = state
    // console.log('announcements:', announcements)
    if (announcements.length === 0) {
        return null
    }
    return (
        <Card style={{ width: '93%'}}>
            <View style={{ flex: 1, flexDirection: 'row' }}>
                <TouchableOpacity 
                    style={{ 
                        width: 56, 
                        height: 56, 
                        justifyContent: 'center', 
                        alignItems: 'center'
                    }}
                    onClick={() => props.viewMore(announcements)}
                >
                    <Image
                        source={require('../../assets/icon-announcement.png')}
                        style={{
                            width: 38,
                            height: 38
                        }}
                    />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <View style={{ paddingTop: 8 }}>
                        <Text style={{ fontSize: 20 }}>新公告</Text>
                    </View>
                    <View style={{ flex: 1, paddingVertical: 8 }}>
                        <ScrollView horizontal contentContainerStyle={{ paddingBottom: 10 }}>
                            {announcements.map((announcement, index) => {
                                const date = new Date(announcement.timestamp)
                                // console.log('beautifyDate(date): ', beautifyDate(date))
                                return (
                                    <TouchableOpacity
                                        key={announcement.id}
                                        style={{
                                            padding: 10,
                                            backgroundColor: '#F5F5F5',
                                            marginRight: 15,
                                            justifyContent: 'center'
                                        }}
                                        underlayColor={'#ff8944'}
                                        onClick={() => props.viewAnnouncement(index, announcements)}
                                    >
                                        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                                            {announcement.read ? 
                                                <Image
                                                    source={require('../../assets/icon-checked.png')}
                                                    style={{
                                                        width: 20,
                                                        height: 20
                                                    }}
                                                />
                                                : null
                                            }
                                            <Text
                                                style={{
                                                    marginLeft: 3,
                                                    alignSelf: 'center',
                                                    fontSize: 25,
                                                    color: 'rgba(0,0,0,0.8)'
                                                }}
                                            >
                                                {beautifyMonthDate(date)}    
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                )
                            })}
                        </ScrollView>
                    </View>
                </View>
            </View>
        </Card>
    )

}

export default AnnouncementCard
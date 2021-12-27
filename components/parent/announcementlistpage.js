import React, { useState, useEffect, } from 'react'
import { View, Text, TouchableOpacity, Image, Dimensions, ScrollView } from 'react-native'
import { Card } from 'native-base'
import { beautifyDate, get } from '../util'

const AnnouncementListPage = (props) => {
    const { parent_id, viewAnnouncement } =  props.route.params
    const [ announcements, setAnnouncements ] = useState(props.route.params.announcements)
    const [ page, setPage ] = useState(0)
    const [ endReached, setEndReached ] = useState(false)
    // console.log('page: ', page)
    // console.log('announcements: ', announcements)

    useEffect(() => {
        // console.log('useEffect')
        if (page === 0) return
        fetchAnnouncementByPage()
    }, [page])

    const fetchAnnouncementByPage = async() => {
        const response = await get(`/announcement/unread?parent_id=${parent_id}&page=${page}`)
        const { success, statusCode, message, data } = response
        // console.log('fetchAnnouncementByPage/response: ', response)
        if (success) {
            setAnnouncements([...announcements, ...data])
            if (data.length < 3) {
                setEndReached(true)
            }
        }
    }

    return (
        <ScrollView contentContainerStyle={{ alignItems: 'center' }}>
            {announcements.map((announcement, index) => {
                const date = beautifyDate(new Date(announcement.timestamp))
                return (
                    <TouchableOpacity
                        key={announcement.id}
                        style={{ width: '100%', alignItems: 'center' }}
                        onClick={() => viewAnnouncement(index, announcements)}
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
                            {/* <View style={{ width: '10%', justifyContent: 'flex-end' }}>
                            </View> */}
                            </View>
                        </Card>
                    </TouchableOpacity>
                )
            })}
            {endReached ?
                <View style={{ padding: 15 }}>
                    <Text style={{ fontSize: 18 }}>無更多訊息</Text>
                </View>
            : <TouchableOpacity
                style={{ width:'95%', padding: 15, backgroundColor: 'rgba(0,0,0,0.2)', alignItems: 'center' }}
                onClick={() => setPage(page+1)}
            >
                <Text style={{ fontSize: 20 }}>檢視更多</Text>
            </TouchableOpacity>
            }
        </ScrollView>
    )
}

export default AnnouncementListPage
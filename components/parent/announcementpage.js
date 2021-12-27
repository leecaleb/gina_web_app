import React from 'react'
import { View, Text, Image, TouchableHighlight } from 'react-native'
import { Card } from 'native-base'
import Reloading from '../reloading'
import { beautifyDate, put, formatDate, formatTime } from '../util'
import * as WebBrowser from 'expo-web-browser'
import * as Sharing from 'expo-sharing'
import * as Linking from 'expo-linking'
import { TouchableOpacity } from 'react-native'

export default class AnnouncementPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            index: -1,
            data: []
        }
    }

    componentDidMount() {
        const { index, data } = this.props.route.params
        // deal with default index(0) or selected index from announcement card
        this.setState({
            index,
            data
        })
        this.markRead(data[index].id)   
    }

    async markRead(announcement_id) {
        const { parent_id } = this.props.route.params
        const timestamp = formatDate(new Date()) + ' ' + formatTime(new Date())
        const response = await put(`/announcement/${announcement_id}/read`, {
            'parent_id': parent_id,
            'timestamp': timestamp
        })
        // console.log(response)
        const { success, statusCode, message, data } = response

    }

    componentWillUnmount() {
        const { onGoBack } = this.props.route.params
        onGoBack()
    }

    render() {
        const { index, data } = this.state
        if (index < 0) {
            return <Reloading />
        }
        const selected_announcement = data[index]
        // console.log('selected_announcement: ', selected_announcement)
        return (
            <Card style={{ flex: 1 }}>
                <View style={{ padding: 20, alignItems: 'center' }}>
                    <Text style={{ fontSize: 25 }}>{selected_announcement.title}</Text>
                    <Text>{beautifyDate(new Date(selected_announcement.timestamp))}</Text>
                </View>
                <View style={{ flex: 1, padding: 20,  }}>
                    <Text>{selected_announcement.text}</Text>
                    <View style={{ paddingTop: 50, alignItems: 'flex-start' }}>
                        {selected_announcement.links.map((link,index) => {
                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={{ padding: 8, backgroundColor: 'lightblue' }}
                                    onClick={async() => {
                                        let result = await WebBrowser.openBrowserAsync(link.url)
                                    }}
                                >
                                    <Text>{link.text}</Text>
                                </TouchableOpacity>
                            )
                        })}
                    </View>
                    <View style={{ flexDirection: 'row', paddingTop: 50, flexWrap: 'wrap' }}>
                    {selected_announcement.photo_url_arr.map((url, index) => {
                        return (
                            <TouchableHighlight
                                key={index}
                                onPress={async() => {
                                    let result = await WebBrowser.openBrowserAsync(url)
                                    this.setState({ result })
                                }}
                            >
                                <Image
                                    source={{ uri: url }}
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
                </View>
            </Card>
        )
    }
}
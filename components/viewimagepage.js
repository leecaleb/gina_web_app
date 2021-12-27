import React, { useLayoutEffect, useState } from 'react'
import { View, Image, TouchableHighlight, Text } from 'react-native'
import { get } from './util'
// import * as MediaLibrary from 'expo-media-library'

const ViewImagePage = (props) => {
    const { url } = props.route.params
    const [ showDropDown, setShowDropDown ] = useState(false)

    useLayoutEffect(() => {
        props.navigation.setOptions({
            headerRight: () => (
                <TouchableHighlight
                    style={{ paddingRight: 10 }}
                    onPress={() => download()}
                >
                    <Image
                        source={require('../assets/icon-download.png')}
                        style={{ width: 35, height: 35 }}
                    />
                </TouchableHighlight>
            )
        })
    })

    const download = async () => {
        const response = await get(`/announcement/download?url=${url}`)
        // console.log('response: ', response)
        // await MediaLibrary.saveToLibraryAsync(url)
        // alert('成功下載到相簿')
    }

    return (
        <View style={{ flex: 1 }}>
            {/* {showDropDown && 
                <View 
                    style={{ 
                        zIndex: 2, 
                        position: 'absolute', 
                        borderWidth: 1, 
                        borderColor: 'grey',
                        backgroundColor: 'white',
                        paddingHorizontal: 15,
                        paddingVertical: 10,
                        alignSelf: 'flex-end',
                        marginTop: 5
                    }}
                >
                    <TouchableHighlight>
                        <Text style={{ fontSize: 25 }}>下載</Text>
                    </TouchableHighlight>
                </View>
            } */}
            <Image
                source={{ uri: url }}
                style={{
                    flex: 1,
                    zIndex: 1
                //    width: '100%',
                //    height: '100%',
                // resizeMode: 'cover'
                }}
            />
        </View>
    )
}

export default ViewImagePage
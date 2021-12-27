import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'

const MainMenu = (props) => {
    return (
        <View
            style={{
                zIndex: 2,
                width: '100%',
                height: '100%',
                position: 'absolute',
                backgroundColor: 'rgba(0,0,0,1)',
                alignItems: 'center',
                // justifyContent: 'center'
            }}
        >
            <TouchableOpacity 
                style={{
                    // textAlign: 'center',
                    paddingTop: 30,
                    paddingBottom: 15,
                    borderBottomWidth: 2,
                    borderBottomColor: 'grey'
                }}
                onClick={() => props.onItemClick('DownloadPage')}
            >
                <Text style={{ fontSize: 25, color: 'grey', fontWeight: 'bold' }}> 下載 </Text>
            </TouchableOpacity>
        </View>
    )
}

export default MainMenu
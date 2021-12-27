import React from 'react'
import { View, Text, TouchableHighlight } from 'react-native'

const Modal = (props) => {
    const { title, content, hideModal } = props
    return (
        <TouchableHighlight
            style={{ 
                width: '100%',
                height: '100%', 
                zIndex: 2,
                position: 'absolute', 
                justifyContent: 'center', 
                alignItems: 'center', 
                backgroundColor: 'rgba(0,0,0,0.7)' 
            }}
            onPress={() => hideModal()}
        >
            <View style={{ width: '80%', backgroundColor: 'white' }}>
                <View style={{ padding: 10, fontSize: 30 }}>
                    <Text>{title}</Text>
                </View>
                <View style={{ padding: 10 }}>
                    {content}
                </View>
            </View>
        </TouchableHighlight>
    )
}

export default Modal
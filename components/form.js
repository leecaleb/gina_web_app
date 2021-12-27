import React from 'react'
import { View, Text, TextInput } from 'react-native'

const Form = (props) => {
    const { label, value, keyboardType, onChangeText, labelStyle, inputStyle } = props
    return (
        <View style={{ flexDirection: 'row', padding: 5, width: '100%' }}>
            <Text style={labelStyle}>
                {`${label}: `}
            </Text>
            <TextInput 
                value={value}
                keyboardType={keyboardType}
                style={inputStyle}
                onChangeText={(input) => onChangeText(input)}
            />
        </View>
    )
}

export default Form
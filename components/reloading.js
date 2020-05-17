import React from 'react'
import { View, Text, ActivityIndicator } from 'react-native'

export default class Reloading extends React.Component{
    render() {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Loading...</Text>
                <ActivityIndicator size="large"></ActivityIndicator>
            </View>
        )
    }
}
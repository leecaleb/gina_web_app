import React from "react"
import { View, Text } from "react-native"


export default class Header extends React.Component {
    constructor(props) {
        super(props)
    }
    render() {
        return (
            <View style={{flexDirection: 'row'}}>
                <Text style={{ fontSize: 30 }}>
                    {this.props.title}
                </Text>
            </View>
            
        )
    }
}
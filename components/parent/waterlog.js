import React from 'react'
import { View, Text } from 'react-native'

export default class WaterLog extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            child_id: this.props.navigation.state.params.child_id
        }
        this.getWaterRecord = this.getWaterRecord.bind(this)
    }
    
    componentDidMount() {
        this.getWaterRecord()
    }

    getWaterRecord() {
        fetch('https://iejnoswtqj.execute-api.us-east-1.amazonaws.com/dev/water/' + this.state.child_id, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        })
            .then((res) => res.json())
            .then((resJson) => {
                console.log(resJson)
    
            })
            .catch(err => console.log(err))
    }

    render () {
        return (
            <View>
                <Text>Water Log Page</Text>
            </View>
        )
    }
}
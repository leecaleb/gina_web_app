import React from 'react'
import { View, Text } from 'react-native'
import { formatDate } from '../util'

export default class SleepLog extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            child_id: this.props.navigation.state.params.child_id,
            start_date: new Date(),
            end_date: new Date()
        }
        this.getSleepRecord = this.getSleepRecord.bind(this)
    }

    componentDidMount() {
        var date = this.state.end_date
        date.setDate(date.getDate() + 1)
        this.setState({ end_date: date })
        this.getSleepRecord()
    }

    getSleepRecord() {
        const start_date = formatDate(this.state.start_date)
        const end_date = formatDate(this.state.end_date)
        const query = 'https://iejnoswtqj.execute-api.us-east-1.amazonaws.com/dev/sleep/' + this.state.child_id
                        + '?start_date=' + start_date
                        + '&end_date=' + end_date
    
        fetch(query, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        })
            .then((res) => res.json())
            .then((resJson) => {
                console.log(resJson)
                // res: {
                //     statusCode: 200,
                //     body: {
                //         date: [
                //             [
                //                 sleep_time:
                //                 wake_time:
                //                 teacher_id:
                //             ], [...]
                //         ], [...]
                //     }
                // }
            })
            .catch(err => console.log(err))
    }
    
    render () {
        return (
            <View>
                <Text>Sleep Log Page</Text>
            </View>
        )
    }
}
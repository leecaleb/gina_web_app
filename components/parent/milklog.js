import React from 'react'
import { View, Text } from 'react-native'
import { formatDate } from '../util'

export default class MilkLog extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            child_id: this.props.navigation.state.params.child_id,
            start_date: new Date(),
            end_date: new Date()
        }
    }

    componentDidMount() {
        const start_date = formatDate(this.state.start_date)
        const end_date = formatDate(this.state.end_date)
        const query = 'https://iejnoswtqj.execute-api.us-east-1.amazonaws.com/dev/milkintake/' + this.state.child_id +
            '?start_date=' + start_date +
            '&end_date=' + end_date
        
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
                //     'statusCode': 200,
                //     'body': {
                //         { date }: [
                //             (time, amount, teacher_id), (...)
                //         ]    
                //     }
                // }
            })
            .catch(err => console.log(err))
    }
    
    render () {
        return (
            <View>
                <Text>Milk Log Page</Text>
            </View>
        )
    }
}